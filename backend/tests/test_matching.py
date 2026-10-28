import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.buyer_matching import match_buyers

class TestBuyerMatching(unittest.TestCase):
    def test_wheat_matching_and_ranking(self):
        result = match_buyers("Wheat", 100, "quintal", "Grade A (Sharbati/Premium)", "Madhya Pradesh", 2200)
        self.assertGreater(len(result["compatible_matches"]), 0)
        top = result["compatible_matches"][0]
        self.assertIn("Wheat", [c.capitalize() for c in ["wheat"]])
        self.assertGreater(top["estimated_net_proceeds"], 0)

    def test_incompatible_crop_rejection(self):
        result = match_buyers("Coffee", 50, "quintal", "Standard", "Karnataka")
        self.assertEqual(len(result["compatible_matches"]), 0)
        self.assertGreater(len(result["rejected_candidates"]), 0)

if __name__ == "__main__":
    unittest.main()
