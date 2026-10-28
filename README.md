# CropRescue AI — "Save the Harvest. Choose the Smarter Sale."

CropRescue AI is an agricultural decision-support web application tailored for Indian farmers and agricultural buyers. It empowers farmers to log available harvests, compare compatible buyers, calculate itemized selling proceeds, analyze immediate spot sales versus waiting or warehouse storage, and evaluate partial-lot splits across multiple buyers.

---

## 1. Project Overview & Problem Statement

### Problem Statement
Indian farmers frequently face harvest glut price crashes, opaque mandi deductions, misleading middlemen offers, and uncertainty around whether holding or storing crops will yield profits after accounting for transport, handling, and spoilage losses. Furthermore, small-to-medium lot sizes often do not match buyer capacity constraints, leading to distressed farmgate sales.

### Proposed Solution
CropRescue AI provides **transparent, explainable decision support**:
- **Deterministic Arithmetic:** Itemizes every transport rupee, handling fee, and storage expense rather than using ungrounded black-box forecasts.
- **Rule-Based Buyer Matching:** Matches verified candidate capacities, quality grades, and geographical distances.
- **Sell-Now vs. Wait & Storage Modeling:** Simulates market glut dips, stable periods, price upticks, and scientific warehouse storage with explicit single-spoilage accounting.
- **Partial-Lot Optimizer:** Compares single-buyer vs. multi-buyer splits, accounting for fixed trip dispatch fees.
- **Full Bilingual Accessibility:** Native English and Hindi (हिन्दी) support across the entire interface.

---

## 2. Main Features

1. **Smart Buyer Matching:** Filters by crop, grade, batch size, distance, and deadline, ranking buyers by net proceeds after logistics deductions.
2. **Sell Now vs. Wait Analysis:** Models 4 scenarios (Spot sale, glut dip, price recovery, scientific warehouse) with deadline violation checks.
3. **Net Proceeds & Profit Calculator:** Calculates gross value, itemized deductions, and effective net price per original quintal. Passes the Section 13 benchmark test (100 quintals @ ₹2,000 = ₹189,000 net proceeds).
4. **Partial-Lot Optimizer:** Analyzes selling the entire harvest to one buyer vs. splitting among 2–3 buyers.
5. **Market Intelligence:** Interactive Recharts graphs with historical sample modal prices and volumes across Indian agricultural hubs.
6. **Farmer & Buyer Portals:** Full role-based workflows for logging harvests, managing lots, browsing marketplace listings, and expressing purchase interest.

---

## 3. Technology Stack

- **Frontend:** React 19, Vite, TypeScript, React Router 7, Tailwind CSS v4, Recharts, Lucide React, Fetch API client.
- **Fullstack Runtime:** Node.js 22 + Express running on port 3000 with Vite middleware and native persistent SQLite (`data/croprescue.db`).
- **Python Backend:** Python 3.10+, FastAPI, Pydantic, SQLite, and Python unittest / pytest test suites in `/backend`.
- **Database:** SQLite with persistent tables (`users`, `harvest_listings`, `buyer_interests`), foreign keys, and unique constraints.
- **Authentication:** Secure password hashing (Node scrypt / Python PBKDF2-HMAC-SHA256) and signed, expiring Bearer tokens.

---

## 4. Folder Structure

```
croprescue-ai/
|-- backend/
|   |-- app/
|   |   |-- config.py
|   |   |-- database/
|   |   |   |-- connection.py
|   |   |-- services/
|   |   |   |-- authentication.py
|   |   |   |-- profit_calculator.py
|   |   |   |-- buyer_matching.py
|   |   |   |-- selling_analysis.py
|   |   |   |-- lot_optimizer.py
|   |   |-- main.py
|   |-- tests/
|   |   |-- test_calculator.py
|   |   |-- test_auth.py
|   |   |-- test_matching.py
|   |   |-- test_analysis.py
|   |   |-- test_optimizer.py
|   |-- run_tests.py
|   |-- requirements.txt
|   |-- .env.example
|-- data/
|   |-- croprescue.db (SQLite database)
|-- src/
|   |-- api/
|   |   |-- client.ts
|   |-- auth/
|   |   |-- AuthContext.tsx
|   |   |-- ProtectedRoute.tsx
|   |-- components/
|   |   |-- Navbar.tsx
|   |   |-- Footer.tsx
|   |   |-- Sidebar.tsx
|   |   |-- StatCard.tsx
|   |   |-- BuyerCard.tsx
|   |   |-- RecommendationCard.tsx
|   |   |-- PriceChart.tsx
|   |   |-- LanguageSwitcher.tsx
|   |   |-- ConfirmDialog.tsx
|   |   |-- Toast.tsx
|   |-- data/
|   |   |-- crops.ts
|   |   |-- sampleBuyers.ts
|   |   |-- sampleMarketPrices.ts
|   |-- i18n/
|   |   |-- en.ts
|   |   |-- hi.ts
|   |   |-- LanguageContext.tsx
|   |-- pages/
|   |   |-- Home.tsx
|   |   |-- Login.tsx
|   |   |-- Register.tsx
|   |   |-- FarmerDashboard.tsx
|   |   |-- Harvests.tsx
|   |   |-- AddHarvest.tsx
|   |   |-- Buyers.tsx
|   |   |-- SellingAnalysis.tsx
|   |   |-- ProfitCalculator.tsx
|   |   |-- LotOptimizer.tsx
|   |   |-- MarketIntelligence.tsx
|   |   |-- BuyerDashboard.tsx
|   |   |-- Marketplace.tsx
|   |   |-- MyInterests.tsx
|   |   |-- Settings.tsx
|   |   |-- NotFound.tsx
|   |-- services/
|   |   |-- calculationService.ts
|   |   |-- matchingService.ts
|   |   |-- analysisService.ts
|   |   |-- optimizerService.ts
|   |-- App.tsx
|   |-- main.tsx
|   |-- index.css
|-- server.ts
|-- package.json
|-- PROJECT_STATUS.md
|-- README.md
```

---

## 5. Local Startup Instructions

### Option 1: Running the Live Integrated Fullstack App (Port 3000)
The repository is configured as a fullstack app with Express and Vite middleware running on port 3000 with a persistent SQLite database.

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev

# 3. Open in browser:
# http://localhost:3000
```

### Option 2: Running the Python FastAPI Backend (Port 8000)

#### On Windows (PowerShell):
```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

#### On Windows (Command Prompt):
```cmd
cd backend
python -m venv .venv
.venv\Scripts\activate.bat
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

#### On macOS / Linux:
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

- FastAPI Interactive API Docs: `http://127.0.0.1:8000/docs`

---

## 6. How to Test Farmer and Buyer Roles

Pre-seeded accounts are provided for instant testing:

| Role | Email | Password | Primary Workflow |
| :--- | :--- | :--- | :--- |
| **Farmer** | `farmer@croprescue.in` | `Password@123` | Add harvests, edit lots, run buyer matching, compare selling scenarios, optimize lot allocation |
| **Buyer** | `buyer@croprescue.in` | `Password@123` | Browse farmgate harvests, submit purchase interests, inspect registered listings |

*Quick login buttons are available on the Login screen to autofill these credentials with a single click.*

---

## 7. Calculation Formulas

### 1. Net Proceeds Formula (Section 13)
$$\text{Gross Sale Value} = \text{Sellable Quantity (quintals)} \times \text{Price per Quintal}$$
$$\text{Total Deductions} = \text{Transport} + \text{Handling} + \text{Storage} + \text{Other}$$
$$\text{Estimated Net Proceeds} = \text{Gross Sale Value} - \text{Total Deductions}$$
$$\text{Effective Net Price} = \frac{\text{Estimated Net Proceeds}}{\text{Original Quantity (quintals)}}$$

*Unit Conversion: 1 quintal = 100 kilograms.*

#### Mandatory Test Benchmark:
- Quantity = 100 quintals
- Price = ₹2,000 / quintal
- Gross Value = ₹200,000
- Transport = ₹8,000, Handling = ₹2,000, Other = ₹1,000, Storage = ₹0
- Total Deductions = ₹11,000
- **Estimated Net Proceeds = ₹189,000 (₹1,890 / quintal effective)**

### 2. Buyer Net Realization
$$\text{Net Proceeds} = (\text{Quantity} \times \text{Quoted Price}) - (\text{Distance} \times \text{Rate} \times \text{Quantity}) - (\text{Handling Rate} \times \text{Quantity})$$

### 3. Spoilage & Storage Logic
- Spoilage is deducted **only once** per scenario from original harvest quantity.
- Storage charges are accrued **only when storage is active** ($\text{Rate} \times \text{Quantity} \times \text{Days}$).
- Scenarios that exceed the seller's deadline are prominently flagged with an alert.

---

## 8. Automated Tests

Run backend automated tests:

```bash
# Run all Python backend unit tests:
python3 backend/run_tests.py
```

Results output:
```
test_deadline_violation_flag ... ok
test_sell_now_has_zero_wait_and_zero_spoilage ... ok
test_password_hashing_and_verification ... ok
test_tampered_token_fails ... ok
test_token_creation_and_validation ... ok
test_invalid_quantity_raises ... ok
test_negative_net_proceeds_warning ... ok
test_section_13_benchmark ... ok
test_spoilage_deduction ... ok
test_unit_conversion_kg_to_quintal ... ok
test_incompatible_crop_rejection ... ok
test_wheat_matching_and_ranking ... ok
test_incompatible_crop_empty_state ... ok
test_optimization_capacity_respect ... ok
Ran 14 tests in 0.105s — OK
```

---

## 9. Disclaimers & Ethics

- **Sample / Demo Data:** All crop prices, buyer details, and market trends are illustrative sample records designed to assist in evaluating selling options. They are not live mandi quotations or guaranteed trade contracts.
- **Hindi Localization:** Fully translated without external paid APIs using respectful, practical Indian agricultural terminology.
- **Zero Hallucination:** The platform does not claim ungrounded machine-learning forecasts or pretend that SMS/WhatsApp messages were dispatched unless integrated.
