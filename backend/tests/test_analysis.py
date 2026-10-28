import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.selling_analysis import analyze_selling_options

class TestSellingAnalysis(unittest.TestCase):
    def test_sell_now_has_zero_wait_and_zero_spoilage(self):
        report = analyze_selling_options("Wheat", 100, "quintal", 2200)
        sell_now = next(s for s in report["scenarios"] if s["id"] == "sell_now")
        self.assertEqual(sell_now["days_to_wait"], 0)
        self.assertEqual(sell_now["spoilage_percentage"], 0.0)
        self.assertEqual(sell_now["sellable_quantity"], 100)

    def test_deadline_violation_flag(self):
        # Deadline in 10 days, warehouse scenario requires 60 days
        report = analyze_selling_options("Wheat", 100, "quintal", 2200, days_to_deadline=10)
        storage_sc = next(s for s in report["scenarios"] if s["id"] == "warehouse_storage")
        self.assertFalse(storage_sc["deadline_feasible"])

if __name__ == "__main__":
    unittest.main()
