from app.services.profit_calculator import convert_to_quintals

def analyze_selling_options(
    crop: str,
    quantity: float,
    unit: str,
    current_price: float,
    has_storage: bool = True,
    storage_cost_per_day: float = 0.8,
    ambient_spoilage_weekly: float = 1.0,
    days_to_deadline: int = 45,
) -> dict:
    qty_qtl = convert_to_quintals(quantity, unit)
    price = float(current_price)

    scenarios = []

    # Scenario 1: Option A - Sell Immediately (0 days, 0 spoilage, 0 storage)
    gross_a = round(qty_qtl * price)
    trans_a = round(qty_qtl * 30)
    hand_a = round(qty_qtl * 20)
    ded_a = trans_a + hand_a
    net_a = gross_a - ded_a
    scenarios.append({
        "id": "sell_now",
        "title": "Option A: Sell Immediately",
        "days_to_wait": 0,
        "assumed_price": price,
        "sellable_quantity": qty_qtl,
        "spoilage_percentage": 0.0,
        "gross_sale_value": gross_a,
        "total_deductions": ded_a,
        "estimated_net_proceeds": net_a,
        "difference_vs_sell_now": 0,
        "risk_level": "Low",
        "deadline_feasible": True,
    })

    # Scenario 2: Option B1 - Wait (Glut dip -7.5%)
    days_b1 = 14
    price_b1 = round(price * 0.925)
    spoil_b1 = round(min(40.0, (days_b1 / 7.0) * ambient_spoilage_weekly), 1)
    sellable_b1 = round(qty_qtl * (1.0 - spoil_b1 / 100.0), 1)
    gross_b1 = round(sellable_b1 * price_b1)
    ded_b1 = trans_a + hand_a
    net_b1 = gross_b1 - ded_b1
    scenarios.append({
        "id": "wait_glut",
        "title": "Option B1: Wait (Glut Dip)",
        "days_to_wait": days_b1,
        "assumed_price": price_b1,
        "sellable_quantity": sellable_b1,
        "spoilage_percentage": spoil_b1,
        "gross_sale_value": gross_b1,
        "total_deductions": ded_b1,
        "estimated_net_proceeds": net_b1,
        "difference_vs_sell_now": net_b1 - net_a,
        "risk_level": "High",
        "deadline_feasible": days_b1 <= days_to_deadline,
    })

    # Scenario 3: Option B3 - Wait (Price Uptick +8%)
    days_b3 = 21
    price_b3 = round(price * 1.08)
    spoil_b3 = round(min(40.0, (days_b3 / 7.0) * ambient_spoilage_weekly), 1)
    sellable_b3 = round(qty_qtl * (1.0 - spoil_b3 / 100.0), 1)
    gross_b3 = round(sellable_b3 * price_b3)
    ded_b3 = trans_a + hand_a
    net_b3 = gross_b3 - ded_b3
    scenarios.append({
        "id": "wait_uptick",
        "title": "Option B3: Wait (Price Uptick)",
        "days_to_wait": days_b3,
        "assumed_price": price_b3,
        "sellable_quantity": sellable_b3,
        "spoilage_percentage": spoil_b3,
        "gross_sale_value": gross_b3,
        "total_deductions": ded_b3,
        "estimated_net_proceeds": net_b3,
        "difference_vs_sell_now": net_b3 - net_a,
        "risk_level": "Moderate",
        "deadline_feasible": days_b3 <= days_to_deadline,
    })

    # Scenario 4: Option C - Scientific Warehouse Storage & Off-Season Sale
    days_c = 60
    price_c = round(price * 1.16)
    spoil_c = 2.5 if has_storage else 25.0
    storage_fee = round(qty_qtl * storage_cost_per_day * days_c) if has_storage else 0
    sellable_c = round(qty_qtl * (1.0 - spoil_c / 100.0), 1)
    gross_c = round(sellable_c * price_c)
    ded_c = round(trans_a * 1.2) + round(hand_a * 1.4) + storage_fee
    net_c = gross_c - ded_c
    scenarios.append({
        "id": "warehouse_storage",
        "title": "Option C: Scientific Storage",
        "days_to_wait": days_c,
        "assumed_price": price_c,
        "sellable_quantity": sellable_c,
        "spoilage_percentage": spoil_c,
        "gross_sale_value": gross_c,
        "total_deductions": ded_c,
        "estimated_net_proceeds": net_c,
        "difference_vs_sell_now": net_c - net_a,
        "risk_level": "Moderate" if has_storage else "High",
        "deadline_feasible": days_c <= days_to_deadline,
    })

    # Pick recommended
    recommended_id = "sell_now"
    best_score = net_a
    for s in scenarios:
        if not s["deadline_feasible"]:
            continue
        if s["id"] == "warehouse_storage" and not has_storage:
            continue
        discount = 0.90 if s["risk_level"] == "High" else 0.96 if s["risk_level"] == "Moderate" else 1.0
        score = s["estimated_net_proceeds"] * discount
        if score > best_score:
            best_score = score
            recommended_id = s["id"]

    return {
        "crop": crop,
        "quantity_quintals": qty_qtl,
        "current_price": price,
        "scenarios": scenarios,
        "recommended_scenario_id": recommended_id,
        "recommendation_summary": f"Recommendation: {recommended_id} based on risk-adjusted net yield.",
    }
