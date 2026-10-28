def convert_to_quintals(quantity: float, unit: str) -> float:
    if unit == 'kg':
        return quantity / 100.0
    return quantity

def calculate_net_proceeds(
    quantity: float,
    unit: str,
    price_per_quintal: float,
    transport_costs: float = 0.0,
    handling_costs: float = 0.0,
    storage_costs: float = 0.0,
    other_charges: float = 0.0,
    spoilage_percentage: float = 0.0,
) -> dict:
    raw_qty = float(quantity)
    price = float(price_per_quintal)
    transport = max(0.0, float(transport_costs))
    handling = max(0.0, float(handling_costs))
    storage = max(0.0, float(storage_costs))
    other = max(0.0, float(other_charges))
    spoilage_rate = max(0.0, min(100.0, float(spoilage_percentage)))

    if raw_qty <= 0:
        raise ValueError("Quantity must be greater than zero.")
    if price < 0:
        raise ValueError("Price per quintal cannot be negative.")

    original_qty_quintals = convert_to_quintals(raw_qty, unit)
    spoilage_loss_quintals = (original_qty_quintals * spoilage_rate) / 100.0
    sellable_qty_quintals = max(0.0, original_qty_quintals - spoilage_loss_quintals)

    # Section 13 Formulas
    gross_sale_value = sellable_qty_quintals * price
    total_deductions = transport + handling + storage + other
    estimated_net_proceeds = gross_sale_value - total_deductions

    effective_net_price = (
        estimated_net_proceeds / original_qty_quintals
        if original_qty_quintals > 0
        else 0.0
    )

    is_negative = estimated_net_proceeds < 0

    return {
        "original_quantity_quintals": round(original_qty_quintals, 2),
        "sellable_quantity_quintals": round(sellable_qty_quintals, 2),
        "spoilage_loss_quintals": round(spoilage_loss_quintals, 2),
        "price_per_quintal": price,
        "gross_sale_value": round(gross_sale_value),
        "transport_deduction": round(transport),
        "handling_deduction": round(handling),
        "storage_deduction": round(storage),
        "other_deductions": round(other),
        "total_deductions": round(total_deductions),
        "estimated_net_proceeds": round(estimated_net_proceeds),
        "effective_net_price_per_original_quintal": round(effective_net_price, 2),
        "is_negative_net_proceeds": is_negative,
    }
