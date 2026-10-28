import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.lot_optimizer import optimize_lot_allocation

class TestLotOptimizer(unittest.TestCase):
    def test_optimization_capacity_respect(self):
        # 100 quintals of wheat
        res = optimize_lot_allocation("Wheat", 100, "quintal", min_price=2000)
        self.assertTrue(res["feasible"])
        self.assertGreater(res["total_sold_quintals"], 0)
        self.assertLessEqual(res["total_sold_quintals"], 100)
        self.assertEqual(res["total_sold_quintals"] + res["total_unsold_quintals"], 100)

    def test_incompatible_crop_empty_state(self):
        res = optimize_lot_allocation("DragonFruit", 50, "quintal")
        self.assertFalse(res["feasible"])
        self.assertEqual(res["total_sold_quintals"], 0)

if __name__ == "__main__":
    unittest.main()
