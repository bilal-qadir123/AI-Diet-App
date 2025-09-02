from flask import Blueprint, request, jsonify
from services.user_service import UserService
from services.nutrition_service import NutritionService
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
