from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.user_service import UserService
from services.nutrition_service import NutritionService
from services.food_service import FoodService
from models.user_model import UserModel

user_bp = Blueprint("user", __name__)

@user_bp.route("/check-email", methods=["POST"])
def check_email():
    data = request.get_json()
    email = data.get("email")
    if not email:
        return jsonify({"error": "Email is required"}), 400
    exists = UserService.check_email_exists(email)
    return jsonify({"exists": exists}), 200

@user_bp.route("/receive-info", methods=["POST"])
def receive_info():
    data = request.get_json()
    required_fields = [
        "name", "age", "gender", "weight", "height",
        "activityLevel", "primaryGoal", "weightGoal", "email", "password"
    ]
    missing = [field for field in required_fields if not data.get(field)]
    if missing:
        return jsonify({"error": f"Missing required fields: {', '.join(missing)}"}), 400

    if UserService.check_email_exists(data["email"]):
        return jsonify({"exists": True, "message": "Email already exists"}), 200

    UserService.register_user(data)
    access_token = UserService.authenticate_user(data["email"], data["password"])["token"]
    user = UserModel.get_by_email(data["email"])
    nutrition_profile = NutritionService.calculate_nutrition(data, user["id"])
    return jsonify({"exists": False, "message": "User created successfully", "token": access_token}), 201

@user_bp.route("/log", methods=["POST"])
@jwt_required()
def log_food():
    print("LOGGING FOOD")
    current_user_email = get_jwt_identity()
    user = UserService.get_user_by_email(current_user_email)
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json()

    required_fields = ["name", "calories", "protein", "carbs", "fat", "mealType", "timestamp"]
    missing = [field for field in required_fields if field not in data]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    try:
        FoodService.log_food(user["id"], data)
        return jsonify({"success": True, "message": "Food entry logged"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500