from app.services.profit_calculator import convert_to_quintals

SAMPLE_BUYERS_DATA = [
    {
        "id": "buyer-01",
        "name": "Kisan Samridhi Agro Processing Pvt Ltd",
        "buyer_type": "Food Processor",
        "state": "Madhya Pradesh",
        "district": "Indore",
        "accepted_crops": ["wheat", "maize", "mustard"],
        "accepted_grades": ["Grade A (Sharbati/Premium)", "Grade B (Standard/FAQ)", "Grade A (Dry Yellow Food-Grade)"],
        "min_quantity_quintals": 30,
        "max_quantity_quintals": 250,
        "indicative_price": {"wheat": 2450, "maize": 2150, "mustard": 5400},
        "transport_rate_per_km": 1.4,
        "handling_fee": 25,
        "fixed_dispatch_fee": 1500,
        "payment_terms": "Direct bank transfer within 48 hours of quality inspection",
        "delivery_requirement": "Moisture content under 12%, delivery at mill gate",
        "distance_km": 45,
    },
    {
        "id": "buyer-02",
        "name": "AgriCorp National Warehouse Ltd",
        "buyer_type": "Institutional Buyer",
        "state": "Haryana",
        "district": "Karnal",
        "accepted_crops": ["wheat", "rice", "mustard"],
        "accepted_grades": ["Grade A (Sharbati/Premium)", "Grade B (Standard/FAQ)", "Grade A (Basmati/Long Grain)"],
        "min_quantity_quintals": 50,
        "max_quantity_quintals": 500,
        "indicative_price": {"wheat": 2420, "rice": 3400, "mustard": 5350},
        "transport_rate_per_km": 1.2,
        "handling_fee": 20,
        "fixed_dispatch_fee": 1800,
        "payment_terms": "e-NAM gateway payment within 3 business days",
        "delivery_requirement": "Standard 50kg jute bags, inspection certificate",
        "distance_km": 70,
    },
    {
        "id": "buyer-03",
        "name": "MahaFresh FPO Cooperative Federation",
        "buyer_type": "Cooperative",
        "state": "Maharashtra",
        "district": "Nashik",
        "accepted_crops": ["onion", "tomato", "potato"],
        "accepted_grades": ["Grade A (Large Red/Export)", "Grade B (Medium/Mandi standard)"],
        "min_quantity_quintals": 15,
        "max_quantity_quintals": 150,
        "indicative_price": {"onion": 2400, "tomato": 1850, "potato": 1450},
        "transport_rate_per_km": 1.8,
        "handling_fee": 30,
        "fixed_dispatch_fee": 1200,
        "payment_terms": "Immediate 70% advance on weighing, balance in 5 days",
        "delivery_requirement": "Crated or mesh ventilated bags",
        "distance_km": 28,
    },
    {
        "id": "buyer-04",
        "name": "Shree Ganesh Mandi Wholesalers",
        "buyer_type": "Wholesaler",
        "state": "Uttar Pradesh",
        "district": "Agra",
        "accepted_crops": ["potato", "mustard", "wheat"],
        "accepted_grades": ["Grade A (Large/Table Premium)", "Grade B (Medium/Standard)", "Grade B (Standard/FAQ)"],
        "min_quantity_quintals": 20,
        "max_quantity_quintals": 300,
        "indicative_price": {"potato": 1380, "mustard": 5200, "wheat": 2350},
        "transport_rate_per_km": 1.5,
        "handling_fee": 22,
        "fixed_dispatch_fee": 1000,
        "payment_terms": "Immediate cash or RTGS upon unloading",
        "delivery_requirement": "Standard gunny bags",
        "distance_km": 35,
    }
]

def match_buyers(crop: str, quantity: float, unit: str, grade: str, state: str, min_acceptable_price: float = 0.0, max_distance: float = 300.0) -> dict:
    harvest_qty = convert_to_quintals(quantity, unit)
    crop_lower = crop.lower().strip()

    compatible = []
    rejected = []

    for b in SAMPLE_BUYERS_DATA:
        rejection_reasons = []

        # 1. Crop check
        if not any(c in crop_lower or crop_lower in c for c in b["accepted_crops"]):
            rejection_reasons.append(f"Does not purchase {crop}")

        # 2. Grade check
        if not rejection_reasons and grade:
            grade_lower = grade.lower()
            if not any(grade_lower in g.lower() or g.lower() in grade_lower for g in b["accepted_grades"]):
                rejection_reasons.append(f"Grade {grade} does not meet requirements")

        # 3. Price check
        price = b["indicative_price"].get(crop_lower, 0)
        if not rejection_reasons:
            if price <= 0:
                rejection_reasons.append("No active quotation")
            elif min_acceptable_price > 0 and price < min_acceptable_price:
                rejection_reasons.append(f"Offered price ₹{price} below threshold ₹{min_acceptable_price}")

        # 4. Quantity check
        if harvest_qty < b["min_quantity_quintals"]:
            rejection_reasons.append(f"Quantity {harvest_qty} qtl below minimum {b['min_quantity_quintals']} qtl")

        # 5. Distance check
        dist = b["distance_km"] if b["state"].lower() == state.lower() else b["distance_km"] + 100
        if dist > max_distance:
            rejection_reasons.append(f"Distance {dist} km exceeds limit")

        if rejection_reasons:
            rejected.append({
                "buyer_id": b["id"],
                "buyer_name": b["name"],
                "buyer_type": b["buyer_type"],
                "rejection_reasons": rejection_reasons,
            })
            continue

        compatible_qty = min(harvest_qty, b["max_quantity_quintals"])
        gross = compatible_qty * price
        trans = round(compatible_qty * b["transport_rate_per_km"] * (dist / 25))
        hand = round(compatible_qty * b["handling_fee"])
        deductions = trans + hand
        net = gross - deductions
        eff = round(net / compatible_qty, 2) if compatible_qty > 0 else 0

        compatible.append({
            "buyer_id": b["id"],
            "buyer_name": b["name"],
            "buyer_type": b["buyer_type"],
            "indicative_price": price,
            "compatible_quantity": compatible_qty,
            "gross_sale_value": gross,
            "transport_deduction": trans,
            "handling_deduction": hand,
            "total_deductions": deductions,
            "estimated_net_proceeds": net,
            "effective_net_price": eff,
            "payment_terms": b["payment_terms"],
        })

    compatible.sort(key=lambda x: x["estimated_net_proceeds"], reverse=True)
    return {
        "crop": crop,
        "quantity_quintals": harvest_qty,
        "compatible_matches": compatible,
        "rejected_candidates": rejected,
        "best_net_proceeds": compatible[0]["estimated_net_proceeds"] if compatible else 0,
    }
