import unittest
import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.profit_calculator import calculate_net_proceeds, convert_to_quintals

class TestProfitCalculator(unittest.TestCase):
    def test_section_13_benchmark(self):
        """
        Required Section 13 Test Case:
        Quantity = 100 quintals
        Price = ₹2,000/quintal
        Gross value = ₹200,000
        Transport = ₹8,000
        Handling = ₹2,000
        Other charges = ₹1,000
        Storage = ₹0
        Expected total deductions = ₹11,000
        Expected estimated net proceeds = ₹189,000
        """
        result = calculate_net_proceeds(
            quantity=100,
            unit="quintal",
            price_per_quintal=2000,
            transport_costs=8000,
            handling_costs=2000,
            storage_costs=0,
            other_charges=1000,
            spoilage_percentage=0,
        )

        self.assertEqual(result["gross_sale_value"], 200000)
        self.assertEqual(result["total_deductions"], 11000)
        self.assertEqual(result["estimated_net_proceeds"], 189000)
        self.assertEqual(result["effective_net_price_per_original_quintal"], 1890.0)
        self.assertFalse(result["is_negative_net_proceeds"])

    def test_unit_conversion_kg_to_quintal(self):
        # 5000 kg = 50 quintals
        result = calculate_net_proceeds(
            quantity=5000,
            unit="kg",
            price_per_quintal=2000,
            transport_costs=0,
            handling_costs=0,
        )
        self.assertEqual(result["original_quantity_quintals"], 50.0)
        self.assertEqual(result["gross_sale_value"], 100000)

    def test_negative_net_proceeds_warning(self):
        # Deductions exceed gross value
        result = calculate_net_proceeds(
            quantity=10,
            unit="quintal",
            price_per_quintal=1000,
            transport_costs=8000,
            handling_costs=3000,
        )
        # Gross = 10,000; Deductions = 11,000; Net = -1,000
        self.assertEqual(result["estimated_net_proceeds"], -1000)
        self.assertTrue(result["is_negative_net_proceeds"])

    def test_spoilage_deduction(self):
        # 10% spoilage reduces sellable quantity from 100 to 90 quintals
        result = calculate_net_proceeds(
            quantity=100,
            unit="quintal",
            price_per_quintal=2000,
            spoilage_percentage=10,
        )
        self.assertEqual(result["sellable_quantity_quintals"], 90.0)
        self.assertEqual(result["gross_sale_value"], 180000)

    def test_invalid_quantity_raises(self):
        with self.assertRaises(ValueError):
            calculate_net_proceeds(quantity=0, unit="quintal", price_per_quintal=2000)

if __name__ == "__main__":
    unittest.main()
