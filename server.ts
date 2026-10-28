import express, { Request, Response, NextFunction } from 'express';
import { DatabaseSync } from 'node:sqlite';
import crypto from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { CROPS } from './src/data/crops';
import { SAMPLE_BUYERS } from './src/data/sampleBuyers';
import { SAMPLE_MARKET_PRICES } from './src/data/sampleMarketPrices';
import { SAMPLE_MANDIS } from './src/data/mandis';
import { calculateNetProceeds, convertToQuintals } from './src/services/calculationService';
import { matchBuyers } from './src/services/matchingService';
import { analyzeSellingOptions } from './src/services/analysisService';
import { optimizeLotAllocation } from './src/services/optimizerService';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const app = express();
app.use(express.json());

// Ensure data directory exists for persistent SQLite database
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const dbPath = path.join(dataDir, 'croprescue.db');
const db = new DatabaseSync(dbPath);

// Enable WAL mode & foreign keys
db.exec('PRAGMA foreign_keys = ON;');

// 1. Initialize Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('farmer', 'buyer')),
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS harvest_listings (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    farmer_name TEXT NOT NULL,
    crop TEXT NOT NULL,
    variety TEXT,
    quantity REAL NOT NULL,
    unit TEXT NOT NULL CHECK(unit IN ('quintal', 'kg')),
    grade TEXT NOT NULL,
    harvest_date TEXT NOT NULL,
    selling_deadline TEXT NOT NULL,
    state TEXT NOT NULL,
    district TEXT NOT NULL,
    asking_price REAL,
    storage_available INTEGER NOT NULL DEFAULT 0,
    storage_cost_per_day REAL DEFAULT 0,
    spoilage_rate REAL DEFAULT 0,
    max_transport_km REAL DEFAULT 300,
    min_selling_price REAL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'sold', 'withdrawn')),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS buyer_interests (
    id TEXT PRIMARY KEY,
    listing_id TEXT NOT NULL,
    buyer_id TEXT NOT NULL,
    buyer_name TEXT NOT NULL,
    buyer_email TEXT NOT NULL,
    buyer_phone TEXT,
    proposed_price REAL,
    message TEXT,
    created_at TEXT NOT NULL,
    UNIQUE(listing_id, buyer_id),
    FOREIGN KEY (listing_id) REFERENCES harvest_listings(id) ON DELETE CASCADE,
    FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

// Password Hashing with scrypt
function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { hash, salt };
}

function verifyPassword(password: string, hash: string, salt: string): boolean {
  const testHash = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(testHash, 'hex'));
}

// Token session management
interface SessionUser {
  id: string;
  fullName: string;
  email: string;
  role: 'farmer' | 'buyer';
}

const sessions = new Map<string, { user: SessionUser; expiresAt: number }>();

function createToken(user: SessionUser): string {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
  sessions.set(token, { user, expiresAt });
  return token;
}

// Authentication Middleware
function authenticateUser(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required. Please log in.' });
    return;
  }
  const token = authHeader.split(' ')[1];
  const session = sessions.get(token);
  if (!session || session.expiresAt < Date.now()) {
    if (session) sessions.delete(token);
    res.status(401).json({ error: 'Session expired or invalid. Please log in again.' });
    return;
  }
  (req as any).user = session.user;
  next();
}

function optionalAuthenticateUser(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const session = sessions.get(token);
    if (session && session.expiresAt >= Date.now()) {
      (req as any).user = session.user;
    }
  }
  next();
}

// Seed Demo Users & Initial Listings
function seedDemoDataIfEmpty() {
  const countRow = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (countRow.count === 0) {
    console.log('[CropRescue AI] Seeding initial test accounts and demo harvest listings...');
    const now = new Date().toISOString();

    // 1. Farmer Account
    const farmerCreds = hashPassword('Password@123');
    const farmerId = 'demo-farmer-01';
    db.prepare(`
      INSERT INTO users (id, full_name, email, phone, password_hash, salt, role, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(farmerId, 'Rajesh Patel', 'farmer@croprescue.in', '+91 98201 12345', farmerCreds.hash, farmerCreds.salt, 'farmer', now);

    // 2. Buyer Account
    const buyerCreds = hashPassword('Password@123');
    const buyerId = 'demo-buyer-01';
    db.prepare(`
      INSERT INTO users (id, full_name, email, phone, password_hash, salt, role, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(buyerId, 'Amitabh Singhania (Kisan Agro)', 'buyer@croprescue.in', '+91 94140 67890', buyerCreds.hash, buyerCreds.salt, 'buyer', now);

    // 3. Demo Listings for Farmer
    const demoListings = [
      {
        id: 'harvest-001',
        userId: farmerId,
        farmerName: 'Rajesh Patel',
        crop: 'Wheat',
        variety: 'Sharbati Premium',
        quantity: 100,
        unit: 'quintal',
        grade: 'Grade A (Sharbati/Premium)',
        harvestDate: '2026-10-15',
        sellingDeadline: '2026-11-25',
        state: 'Madhya Pradesh',
        district: 'Sehore',
        askingPrice: 2450,
        storageAvailable: 1,
        storageCostPerDay: 0.8,
        spoilageRate: 0.5,
        maxTransportKm: 120,
        minSellingPrice: 2300,
        status: 'active',
      },
      {
        id: 'harvest-002',
        userId: farmerId,
        farmerName: 'Rajesh Patel',
        crop: 'Mustard',
        variety: 'Pusa Bold',
        quantity: 45,
        unit: 'quintal',
        grade: 'Grade A (High Oil >42%)',
        harvestDate: '2026-10-18',
        sellingDeadline: '2026-11-15',
        state: 'Madhya Pradesh',
        district: 'Sehore',
        askingPrice: 5400,
        storageAvailable: 1,
        storageCostPerDay: 0.9,
        spoilageRate: 0.3,
        maxTransportKm: 150,
        minSellingPrice: 5100,
        status: 'active',
      },
      {
        id: 'harvest-003',
        userId: farmerId,
        farmerName: 'Rajesh Patel',
        crop: 'Potato',
        variety: 'Kufri Jyoti',
        quantity: 180,
        unit: 'quintal',
        grade: 'Grade B (Medium/Standard)',
        harvestDate: '2026-10-22',
        sellingDeadline: '2026-11-05',
        state: 'Madhya Pradesh',
        district: 'Indore',
        askingPrice: 1400,
        storageAvailable: 0,
        storageCostPerDay: 2.5,
        spoilageRate: 4.0,
        maxTransportKm: 80,
        minSellingPrice: 1250,
        status: 'active',
      },
    ];

    const insertListingStmt = db.prepare(`
      INSERT INTO harvest_listings (
        id, user_id, farmer_name, crop, variety, quantity, unit, grade,
        harvest_date, selling_deadline, state, district, asking_price,
        storage_available, storage_cost_per_day, spoilage_rate, max_transport_km,
        min_selling_price, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const item of demoListings) {
      insertListingStmt.run(
        item.id, item.userId, item.farmerName, item.crop, item.variety,
        item.quantity, item.unit, item.grade, item.harvestDate, item.sellingDeadline,
        item.state, item.district, item.askingPrice, item.storageAvailable,
        item.storageCostPerDay, item.spoilageRate, item.maxTransportKm,
        item.minSellingPrice, item.status, now, now
      );
    }
  }
}

seedDemoDataIfEmpty();

// ==================== API ROUTES ====================

// Health
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'CropRescue AI Backend',
    database: 'SQLite persistent',
    version: '1.0.0',
  });
});

// Crops
app.get('/api/crops', (_req: Request, res: Response) => {
  res.json({ crops: CROPS });
});

// Buyers
app.get('/api/buyers', (_req: Request, res: Response) => {
  res.json({
    buyers: SAMPLE_BUYERS,
    disclaimer: 'Demo data — indicative buyers and prices for decision support.',
    disclaimerHi: 'डेमो डेटा — निर्णय समर्थन के लिए सांकेतिक खरीदार और भाव।',
  });
});

// Market Prices
app.get('/api/market-prices', (req: Request, res: Response) => {
  const crop = (req.query.crop as string || 'wheat').toLowerCase();
  const statePrices = SAMPLE_MARKET_PRICES[crop] || [];
  res.json({
    crop,
    states: statePrices,
    disclaimer: 'Demo data — not a live mandi quotation.',
    disclaimerHi: 'डेमो डेटा — यह मंडी का वास्तविक समय का भाव नहीं है।',
  });
});

// Auth: Register
app.post('/api/auth/register', (req: Request, res: Response) => {
  const { fullName, email, phone, password, role } = req.body;

  if (!fullName || !email || !password || !role) {
    res.status(422).json({ error: 'Full name, email, password, and role are required.' });
    return;
  }

  if (!['farmer', 'buyer'].includes(role)) {
    res.status(422).json({ error: 'Role must be either "farmer" or "buyer".' });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(422).json({ error: 'Invalid email address format.' });
    return;
  }

  if (password.length < 6) {
    res.status(422).json({ error: 'Password must be at least 6 characters.' });
    return;
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
  if (existing) {
    res.status(409).json({ error: 'An account with this email address already exists. Please log in.' });
    return;
  }

  const { hash, salt } = hashPassword(password);
  const userId = `user-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO users (id, full_name, email, phone, password_hash, salt, role, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(userId, fullName.trim(), email.toLowerCase().trim(), phone || '', hash, salt, role, now);

  const sessionUser: SessionUser = {
    id: userId,
    fullName: fullName.trim(),
    email: email.toLowerCase().trim(),
    role: role as 'farmer' | 'buyer',
  };

  const token = createToken(sessionUser);
  res.status(201).json({ user: sessionUser, token });
});

// Auth: Login
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(422).json({ error: 'Email and password are required.' });
    return;
  }

  const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim()) as any;
  if (!row) {
    res.status(401).json({ error: 'Invalid email or password.' });
    return;
  }

  const valid = verifyPassword(password, row.password_hash, row.salt);
  if (!valid) {
    res.status(401).json({ error: 'Invalid email or password.' });
    return;
  }

  const sessionUser: SessionUser = {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    role: row.role as 'farmer' | 'buyer',
  };

  const token = createToken(sessionUser);
  res.json({ user: sessionUser, token });
});

// Auth: Me
app.get('/api/auth/me', authenticateUser, (req: Request, res: Response) => {
  res.json({ user: (req as any).user });
});

// Auth: Logout
app.post('/api/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    sessions.delete(token);
  }
  res.json({ success: true, message: 'Logged out successfully.' });
});

// Listings: GET (all listings with filter support)
app.get('/api/listings', optionalAuthenticateUser, (req: Request, res: Response) => {
  const { crop, state, district, grade, status, ownerOnly } = req.query;
  const user = (req as any).user as SessionUser | undefined;

  let query = `
    SELECT l.*,
      (SELECT COUNT(*) FROM buyer_interests WHERE listing_id = l.id) as interest_count
    FROM harvest_listings l
    WHERE 1=1
  `;
  const params: any[] = [];

  if (ownerOnly === 'true' && user) {
    query += ' AND l.user_id = ?';
    params.push(user.id);
  }

  if (crop) {
    query += ' AND LOWER(l.crop) = LOWER(?)';
    params.push(crop as string);
  }

  if (state) {
    query += ' AND LOWER(l.state) = LOWER(?)';
    params.push(state as string);
  }

  if (district) {
    query += ' AND LOWER(l.district) = LOWER(?)';
    params.push(district as string);
  }

  if (grade) {
    query += ' AND l.grade = ?';
    params.push(grade as string);
  }

  if (status) {
    query += ' AND l.status = ?';
    params.push(status as string);
  } else if (!ownerOnly) {
    query += " AND l.status = 'active'";
  }

  query += ' ORDER BY l.created_at DESC';

  const rows = db.prepare(query).all(...params);
  res.json({ listings: rows });
});

// Listings: GET by ID
app.get('/api/listings/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const row = db.prepare(`
    SELECT l.*,
      (SELECT COUNT(*) FROM buyer_interests WHERE listing_id = l.id) as interest_count
    FROM harvest_listings l
    WHERE l.id = ?
  `).get(id);

  if (!row) {
    res.status(404).json({ error: 'Harvest listing not found.' });
    return;
  }

  res.json({ listing: row });
});

// Listings: POST (Create new harvest)
app.post('/api/listings', authenticateUser, (req: Request, res: Response) => {
  const user = (req as any).user as SessionUser;
  if (user.role !== 'farmer') {
    res.status(403).json({ error: 'Only farmers can create harvest listings.' });
    return;
  }

  const {
    crop, variety, quantity, unit, grade, harvestDate, sellingDeadline,
    state, district, askingPrice, storageAvailable, storageCostPerDay,
    spoilageRate, maxTransportKm, minSellingPrice
  } = req.body;

  // Validation
  if (!crop || !quantity || !unit || !grade || !harvestDate || !sellingDeadline || !state || !district) {
    res.status(422).json({ error: 'Missing required harvest fields.' });
    return;
  }

  const numQty = Number(quantity);
  if (isNaN(numQty) || numQty <= 0) {
    res.status(422).json({ error: 'Quantity must be a positive number.' });
    return;
  }

  if (!['quintal', 'kg'].includes(unit)) {
    res.status(422).json({ error: 'Unit must be quintal or kg.' });
    return;
  }

  if (new Date(sellingDeadline) < new Date(harvestDate)) {
    res.status(422).json({ error: 'Selling deadline cannot precede harvest date.' });
    return;
  }

  const id = `harvest-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO harvest_listings (
      id, user_id, farmer_name, crop, variety, quantity, unit, grade,
      harvest_date, selling_deadline, state, district, asking_price,
      storage_available, storage_cost_per_day, spoilage_rate, max_transport_km,
      min_selling_price, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, user.id, user.fullName, crop, variety || '', numQty, unit, grade,
    harvestDate, sellingDeadline, state, district, Number(askingPrice) || null,
    storageAvailable ? 1 : 0, Number(storageCostPerDay) || 0,
    Number(spoilageRate) || 0, Number(maxTransportKm) || 300,
    Number(minSellingPrice) || 0, 'active', now, now
  );

  const created = db.prepare('SELECT * FROM harvest_listings WHERE id = ?').get(id);
  res.status(201).json({ listing: created, message: 'Harvest listing created successfully.' });
});

// Listings: PUT / PATCH (Update harvest)
app.put('/api/listings/:id', authenticateUser, (req: Request, res: Response) => {
  const user = (req as any).user as SessionUser;
  const { id } = req.params;

  const existing = db.prepare('SELECT * FROM harvest_listings WHERE id = ?').get(id) as any;
  if (!existing) {
    res.status(404).json({ error: 'Harvest listing not found.' });
    return;
  }

  if (existing.user_id !== user.id) {
    res.status(403).json({ error: 'You are not authorized to edit this listing.' });
    return;
  }

  const {
    crop, variety, quantity, unit, grade, harvestDate, sellingDeadline,
    state, district, askingPrice, storageAvailable, storageCostPerDay,
    spoilageRate, maxTransportKm, minSellingPrice, status
  } = req.body;

  const numQty = Number(quantity);
  if (quantity !== undefined && (isNaN(numQty) || numQty <= 0)) {
    res.status(422).json({ error: 'Quantity must be positive.' });
    return;
  }

  const now = new Date().toISOString();
  db.prepare(`
    UPDATE harvest_listings SET
      crop = COALESCE(?, crop),
      variety = COALESCE(?, variety),
      quantity = COALESCE(?, quantity),
      unit = COALESCE(?, unit),
      grade = COALESCE(?, grade),
      harvest_date = COALESCE(?, harvest_date),
      selling_deadline = COALESCE(?, selling_deadline),
      state = COALESCE(?, state),
      district = COALESCE(?, district),
      asking_price = COALESCE(?, asking_price),
      storage_available = COALESCE(?, storage_available),
      storage_cost_per_day = COALESCE(?, storage_cost_per_day),
      spoilage_rate = COALESCE(?, spoilage_rate),
      max_transport_km = COALESCE(?, max_transport_km),
      min_selling_price = COALESCE(?, min_selling_price),
      status = COALESCE(?, status),
      updated_at = ?
    WHERE id = ?
  `).run(
    crop, variety, numQty || null, unit, grade, harvestDate, sellingDeadline,
    state, district, askingPrice !== undefined ? Number(askingPrice) : null,
    storageAvailable !== undefined ? (storageAvailable ? 1 : 0) : null,
    storageCostPerDay !== undefined ? Number(storageCostPerDay) : null,
    spoilageRate !== undefined ? Number(spoilageRate) : null,
    maxTransportKm !== undefined ? Number(maxTransportKm) : null,
    minSellingPrice !== undefined ? Number(minSellingPrice) : null,
    status, now, id
  );

  const updated = db.prepare('SELECT * FROM harvest_listings WHERE id = ?').get(id);
  res.json({ listing: updated, message: 'Harvest listing updated successfully.' });
});

// Listings: DELETE
app.delete('/api/listings/:id', authenticateUser, (req: Request, res: Response) => {
  const user = (req as any).user as SessionUser;
  const { id } = req.params;

  const existing = db.prepare('SELECT * FROM harvest_listings WHERE id = ?').get(id) as any;
  if (!existing) {
    res.status(404).json({ error: 'Harvest listing not found.' });
    return;
  }

  if (existing.user_id !== user.id) {
    res.status(403).json({ error: 'You are not authorized to delete this listing.' });
    return;
  }

  db.prepare('DELETE FROM harvest_listings WHERE id = ?').run(id);
  res.json({ success: true, message: 'Harvest listing deleted successfully.' });
});

// Buyer: Express Interest in Listing
app.post('/api/listings/:id/interest', authenticateUser, (req: Request, res: Response) => {
  const user = (req as any).user as SessionUser;
  if (user.role !== 'buyer') {
    res.status(403).json({ error: 'Only registered buyers can express interest in harvest listings.' });
    return;
  }

  const { id: listingId } = req.params;
  const { proposedPrice, message, phone } = req.body;

  const listing = db.prepare('SELECT * FROM harvest_listings WHERE id = ?').get(listingId);
  if (!listing) {
    res.status(404).json({ error: 'Harvest listing not found.' });
    return;
  }

  // Check duplicate
  const existingInterest = db.prepare('SELECT id FROM buyer_interests WHERE listing_id = ? AND buyer_id = ?').get(listingId, user.id);
  if (existingInterest) {
    res.status(409).json({ error: 'You have already expressed interest in this harvest listing.' });
    return;
  }

  const interestId = `interest-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO buyer_interests (id, listing_id, buyer_id, buyer_name, buyer_email, buyer_phone, proposed_price, message, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    interestId, listingId, user.id, user.fullName, user.email, phone || '',
    proposedPrice ? Number(proposedPrice) : null, message || '', now
  );

  res.status(201).json({
    success: true,
    message: 'Your expression of interest has been recorded in CropRescue AI.',
    interestId,
  });
});

// Buyer: Get My Interests
app.get('/api/my/interests', authenticateUser, (req: Request, res: Response) => {
  const user = (req as any).user as SessionUser;
  if (user.role !== 'buyer') {
    res.status(403).json({ error: 'Access restricted to buyers.' });
    return;
  }

  const rows = db.prepare(`
    SELECT i.*, l.crop, l.variety, l.quantity, l.unit, l.grade, l.state, l.district, l.farmer_name, l.asking_price
    FROM buyer_interests i
    JOIN harvest_listings l ON i.listing_id = l.id
    WHERE i.buyer_id = ?
    ORDER BY i.created_at DESC
  `).all(user.id);

  res.json({ interests: rows });
});

// Analysis: Match Buyers
app.post('/api/match-buyers', (req: Request, res: Response) => {
  try {
    const result = matchBuyers(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(422).json({ error: err.message || 'Error executing buyer matching.' });
  }
});

// Analysis: Sell Now vs Wait / Storage
app.post('/api/analyze-selling-options', (req: Request, res: Response) => {
  try {
    const result = analyzeSellingOptions(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(422).json({ error: err.message || 'Error executing selling analysis.' });
  }
});

// Analysis: Calculate Net Proceeds
app.post('/api/calculate-net-proceeds', (req: Request, res: Response) => {
  try {
    const result = calculateNetProceeds(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(422).json({ error: err.message || 'Calculation error.' });
  }
});

// Analysis: Optimize Allocation
app.post('/api/optimize-allocation', (req: Request, res: Response) => {
  try {
    const result = optimizeLotAllocation(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(422).json({ error: err.message || 'Optimization error.' });
  }
});

// Settings: Reset sample data
app.post('/api/reset-sample-data', (_req: Request, res: Response) => {
  try {
    // Delete non-user custom demo listings, keep users intact
    db.exec(`
      DELETE FROM buyer_interests WHERE listing_id LIKE 'harvest-%';
      DELETE FROM harvest_listings WHERE id LIKE 'harvest-%';
    `);
    seedDemoDataIfEmpty();
    res.json({ success: true, message: 'Sample listings and buyer data reset successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to reset sample data: ' + err.message });
  }
});

// Download Zip endpoint (supports binary attachment and base64 JSON for iframe environments)
app.get('/api/download-zip', (req: Request, res: Response) => {
  const zipPath = path.join(__dirname, 'croprescue-ai.zip');
  if (!fs.existsSync(zipPath)) {
    res.status(404).json({ error: 'Zip file not found on server.' });
    return;
  }

  if (req.query.format === 'base64') {
    try {
      const fileBuffer = fs.readFileSync(zipPath);
      const base64Data = fileBuffer.toString('base64');
      res.json({
        filename: 'croprescue-ai.zip',
        size: fileBuffer.length,
        base64: base64Data,
      });
      return;
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to read zip: ' + err.message });
      return;
    }
  }

  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', 'attachment; filename="croprescue-ai.zip"');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
  res.download(zipPath, 'croprescue-ai.zip', (err) => {
    if (err && !res.headersSent) {
      res.status(500).json({ error: 'Download failed: ' + err.message });
    }
  });
});


// ==================== VITE DEV OR PROD MIDDLEWARE ====================
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CropRescue AI] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
