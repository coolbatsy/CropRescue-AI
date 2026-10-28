import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./croprescue.db")
SECRET_KEY = os.getenv("SECRET_KEY", "croprescue_ai_development_secret_key_2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 10080  # 7 days
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000,*").split(",")
