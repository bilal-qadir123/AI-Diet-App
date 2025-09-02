from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.user_service import UserService
from extensions import jwt

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    auth_result = UserService.authenticate_user(email, password)
    if not auth_result:
        return jsonify({"success": False, "error": "Incorrect email or password"}), 401
    return jsonify({
        "success": True,
        "message": "Login successful",
        "token": auth_result["token"],
        "user_id": auth_result["user_id"]
    }), 200

@auth_bp.route("/profile", methods=["GET"])
@jwt_required()
def profile():
    from services.user_service import UserService
    from services.nutrition_service import NutritionService

    current_user_email = get_jwt_identity()
    user = UserService.get_user_by_email(current_user_email)
    if not user:
        return jsonify({"error": "User not found"}), 404

    nutrition_profile = NutritionService.get_by_user_id(user["id"])
    if not nutrition_profile:
        return jsonify({"error": "Nutrition profile not found"}), 404

    return jsonify({
        "user": {
            "id": user["id"],
            "email": user["email"],
            "name": user["name"]
        },
        "nutrition": {
            "calorie_target": nutrition_profile["calorie_target"],
            "carbs_g": nutrition_profile["carbs_g"],
            "protein_g": nutrition_profile["protein_g"],
            "fat_g": nutrition_profile["fat_g"],
            "time_frame": nutrition_profile["time_frame"],
            "water_l": nutrition_profile["water_l"]
        }
    }), 200

@auth_bp.route("/verify-token", methods=["GET"])
@jwt_required()
def verify_token():
    current_user_email = get_jwt_identity()
    return jsonify({"email": current_user_email}), 200

@jwt.unauthorized_loader
def unauthorized_callback(err):
    return jsonify({"error": "Missing or invalid token"}), 401
