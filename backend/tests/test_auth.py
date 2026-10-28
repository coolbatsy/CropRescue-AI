import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.authentication import hash_password, verify_password, create_access_token, verify_access_token

class TestAuthentication(unittest.TestCase):
    def test_password_hashing_and_verification(self):
        pwd = "SecretFarmerPassword@2026"
        pwd_hash, salt = hash_password(pwd)
        self.assertNotEqual(pwd, pwd_hash)
        self.assertTrue(verify_password(pwd, pwd_hash, salt))
        self.assertFalse(verify_password("WrongPassword", pwd_hash, salt))

    def test_token_creation_and_validation(self):
        token = create_access_token("user-123", "farmer", "farmer@croprescue.in")
        payload = verify_access_token(token)
        self.assertIsNotNone(payload)
        self.assertEqual(payload["user_id"], "user-123")
        self.assertEqual(payload["role"], "farmer")

    def test_tampered_token_fails(self):
        token = create_access_token("user-123", "farmer", "farmer@croprescue.in")
        tampered = token[:-4] + "abcd"
        self.assertIsNone(verify_access_token(tampered))

if __name__ == "__main__":
    unittest.main()
