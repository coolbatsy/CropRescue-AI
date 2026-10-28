"""CropRescue AI — FastAPI Backend Application
Save the Harvest. Choose the Smarter Sale.
"""
try:
    from fastapi import FastAPI, HTTPException, Depends, Header, status
    from fastapi.middleware.cors import CORSMiddleware
    from pydantic import BaseModel
    FASTAPI_AVAILABLE = True
except ImportError:
    FASTAPI_AVAILABLE = False
    BaseModel = object

from app.database.connection import init_db, get_db
from app.services.authentication import hash_password, verify_password, create_access_token, verify_access_token
from app.services.profit_calculator import calculate_net_proceeds
from app.services.buyer_matching import match_buyers
from app.services.selling_analysis import analyze_selling_options
from app.services.lot_optimizer import optimize_lot_allocation

if FASTAPI_AVAILABLE:
    app = FastAPI(
        title="CropRescue AI API",
        description="Explainable Agricultural Decision Support for Indian Farmers and Buyers",
        version="1.0.0"
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.on_event("startup")
    def on_startup():
        init_db()

    @app.get("/api/health")
    def health():
        return {
            "status": "healthy",
            "service": "CropRescue AI Python FastAPI Backend",
            "database": "SQLite persistent",
            "version": "1.0.0"
        }

    @app.post("/api/calculate-net-proceeds")
    def api_calculate_net_proceeds(payload: dict):
        try:
            return calculate_net_proceeds(
                quantity=payload.get("quantity", 0),
                unit=payload.get("unit", "quintal"),
                price_per_quintal=payload.get("pricePerQuintal", 0),
                transport_costs=payload.get("transportCosts", 0),
                handling_costs=payload.get("handlingCosts", 0),
                storage_costs=payload.get("storageCosts", 0),
                other_charges=payload.get("otherCharges", 0),
                spoilage_percentage=payload.get("spoilagePercentage", 0),
            )
        except Exception as e:
            raise HTTPException(status_code=422, detail=str(e))

    @app.post("/api/match-buyers")
    def api_match_buyers(payload: dict):
        return match_buyers(
            crop=payload.get("crop", "Wheat"),
            quantity=payload.get("quantity", 100),
            unit=payload.get("unit", "quintal"),
            grade=payload.get("grade", "Grade A"),
            state=payload.get("state", "Madhya Pradesh"),
            min_acceptable_price=payload.get("minAcceptablePrice", 0),
        )

    @app.post("/api/analyze-selling-options")
    def api_analyze_options(payload: dict):
        return analyze_selling_options(
            crop=payload.get("crop", "Wheat"),
            quantity=payload.get("quantity", 100),
            unit=payload.get("unit", "quintal"),
            current_price=payload.get("currentPricePerQuintal", 2000),
            has_storage=payload.get("hasStorageAvailable", True),
            storage_cost_per_day=payload.get("storageCostPerDayPerQuintal", 0.8),
            ambient_spoilage_weekly=payload.get("ambientSpoilageRatePerWeek", 1.0),
        )

    @app.post("/api/optimize-allocation")
    def api_optimize_allocation(payload: dict):
        return optimize_lot_allocation(
            crop=payload.get("crop", "Wheat"),
            quantity=payload.get("quantity", 100),
            unit=payload.get("unit", "quintal"),
            min_price=payload.get("minAcceptablePrice", 0),
        )
else:
    app = None
