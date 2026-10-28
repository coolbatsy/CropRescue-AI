from app.services.profit_calculator import convert_to_quintals
from app.services.buyer_matching import SAMPLE_BUYERS_DATA

def optimize_lot_allocation(crop: str, quantity: float, unit: str, min_price: float = 0.0) -> dict:
    harvest_qty = convert_to_quintals(quantity, unit)
    crop_lower = crop.lower().strip()

    # Filter candidate buyers
    candidates = []
    for b in SAMPLE_BUYERS_DATA:
        if not any(c in crop_lower or crop_lower in c for c in b["accepted_crops"]):
            continue
        price = b["indicative_price"].get(crop_lower, 0)
        if price <= 0 or (min_price > 0 and price < min_price):
            continue
        candidates.append(b)

    if not candidates:
        return {
            "crop": crop,
            "total_harvest_quintals": harvest_qty,
            "feasible": False,
            "allocations": [],
            "total_sold_quintals": 0,
            "total_unsold_quintals": harvest_qty,
            "combined_net_proceeds": 0,
            "is_split_advantageous": False,
            "recommendation_explanation": "No buyers matched the search constraints.",
        }

    # Best single buyer
    best_single = None
    for b in candidates:
        price = b["indicative_price"][crop_lower]
        single_qty = min(harvest_qty, b["max_quantity_quintals"])
        if single_qty < b["min_quantity_quintals"]:
            continue
        gross = single_qty * price
        var_cost = round(single_qty * (b["transport_rate_per_km"] * (b["distance_km"] / 25) + b["handling_fee"]))
        fix_cost = b["fixed_dispatch_fee"]
        net = gross - (var_cost + fix_cost)
        if not best_single or net > best_single["estimated_net_proceeds"]:
            best_single = {
                "buyer_id": b["id"],
                "buyer_name": b["name"],
                "absorbed_quantity": single_qty,
                "unabsorbed_quantity": max(0, harvest_qty - single_qty),
                "estimated_net_proceeds": net,
            }

    # Multi-buyer split allocation
    sorted_candidates = sorted(
        candidates,
        key=lambda b: b["indicative_price"][crop_lower] - (b["transport_rate_per_km"] * (b["distance_km"] / 25) + b["handling_fee"]),
        reverse=True
    )

    remaining = harvest_qty
    allocations = []

    for b in sorted_candidates:
        if remaining <= 0:
            break
        price = b["indicative_price"][crop_lower]
        alloc_qty = min(remaining, b["max_quantity_quintals"])
        if alloc_qty < b["min_quantity_quintals"] and allocations:
            continue
        if alloc_qty <= 0:
            continue

        gross = round(alloc_qty * price)
        var_cost = round(alloc_qty * (b["transport_rate_per_km"] * (b["distance_km"] / 25) + b["handling_fee"]))
        fix_cost = b["fixed_dispatch_fee"]
        total_cost = var_cost + fix_cost
        net = gross - total_cost

        allocations.append({
            "buyer_id": b["id"],
            "buyer_name": b["name"],
            "allocated_quantity": alloc_qty,
            "price_per_quintal": price,
            "gross_sale_value": gross,
            "total_costs": total_cost,
            "estimated_net_proceeds": net,
        })
        remaining -= alloc_qty

    total_sold = sum(a["allocated_quantity"] for a in allocations)
    total_unsold = max(0, harvest_qty - total_sold)
    combined_net = sum(a["estimated_net_proceeds"] for a in allocations)
    single_net = best_single["estimated_net_proceeds"] if best_single else 0
    diff = combined_net - single_net

    is_split_adv = len(allocations) > 1 and (diff > 0 or (best_single and total_sold > best_single["absorbed_quantity"]))

    return {
        "crop": crop,
        "total_harvest_quintals": harvest_qty,
        "feasible": len(allocations) > 0,
        "allocations": allocations,
        "total_sold_quintals": total_sold,
        "total_unsold_quintals": total_unsold,
        "combined_net_proceeds": combined_net,
        "best_single_buyer": best_single,
        "difference_vs_single_buyer": diff,
        "is_split_advantageous": is_split_adv,
        "recommendation_explanation": f"{'Split allocation' if is_split_adv else 'Single buyer'} yields higher net returns after accounting for fixed dispatch fees.",
    }
