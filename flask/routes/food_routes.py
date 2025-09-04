from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.user_service import UserService
from services.food_service import FoodService

food_bp = Blueprint("food", __name__, url_prefix="/food")

@food_bp.route("/log", methods=["POST"])
@jwt_required()
def log_food():
    data = request.get_json()
    current_user_email = get_jwt_identity()
    user = UserService.get_user_by_email(current_user_email)

    if not user:
        return jsonify({"error": "User not found"}), 404

    try:
        FoodService.log_food(user["id"], data)
        return jsonify({"success": True, "message": "Food logged successfully"}), 201
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@food_bp.route("/entries", methods=["GET"])
@jwt_required()
def get_entries():
    current_user_email = get_jwt_identity()
    user = UserService.get_user_by_email(current_user_email)

    if not user:
        return jsonify({"error": "User not found"}), 404

    entries = FoodService.get_user_food_entries(user["id"])
    return jsonify(entries), 200


@food_bp.route("/delete/<int:entry_id>", methods=["DELETE"])
@jwt_required()
def delete_entry(entry_id):
    current_user_email = get_jwt_identity()
    user = UserService.get_user_by_email(current_user_email)

    if not user:
        return jsonify({"error": "User not found"}), 404

    try:
        FoodService.delete_food_entry(user["id"], entry_id)
        return jsonify({"success": True, "message": "Food entry deleted"}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@food_bp.route("/update/<int:entry_id>", methods=["PATCH"])
@jwt_required()
def update_entry(entry_id):
    data = request.get_json()
    servings = data.get("servings")

    if servings is None:
        return jsonify({"error": "Servings value required"}), 400

    current_user_email = get_jwt_identity()
    user = UserService.get_user_by_email(current_user_email)

    if not user:
        return jsonify({"error": "User not found"}), 404

    try:
        FoodService.update_food_servings(user["id"], entry_id, servings)
        return jsonify({"success": True, "message": "Servings updated"}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@food_bp.route("/water", methods=["GET"])
@jwt_required()
def get_water():
    current_user_email = get_jwt_identity()
    user = UserService.get_user_by_email(current_user_email)

    if not user:
        return jsonify({"error": "User not found"}), 404

    entries = FoodService.get_user_food_entries(user["id"])
    if not entries:
        return jsonify({"waterConsumed": 0}), 200

    # Get latest waterConsumed
    latest_entry = entries[0]
    water = latest_entry.get("waterConsumed", 0)
    
    print("Water get is: ", water)
    return jsonify({"waterConsumed": water}), 200

@food_bp.route("/water", methods=["PATCH"])
@jwt_required()
def update_water():
    data = request.get_json()
    water = data.get("waterConsumed") * 0.25

    print("Water: ", water)
    if water is None:
        return jsonify({"error": "waterConsumed value required"}), 400

    current_user_email = get_jwt_identity()
    user = UserService.get_user_by_email(current_user_email)

    if not user:
        return jsonify({"error": "User not found"}), 404

    try:
        FoodService.update_water_consumed(user["id"], water)
        return jsonify({"success": True, "message": "Water updated"}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
