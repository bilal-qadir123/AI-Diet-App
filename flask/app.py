from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required, get_jwt_identity
)
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
import mysql.connector
import json
import os
import datetime

load_dotenv()

app = Flask(__name__)
CORS(app)

app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = datetime.timedelta(days=7)
jwt = JWTManager(app)

db = mysql.connector.connect(
    host="127.0.0.1",
    user="root",
    password="",
    database="stickr",
    port=3307,
    charset="utf8mb4",
    collation="utf8mb4_unicode_ci"
)

@app.route('/check-email', methods=['POST'])
def check_email():
    data = request.get_json()
    email = data.get("email")
    if not email:
        return jsonify({"error": "Email is required"}), 400
    cursor = db.cursor()
    cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
    exists = cursor.fetchone() is not None
    cursor.close()
    return jsonify({"exists": exists}), 200

@app.route('/receive-info', methods=['POST'])
def receive_info():
    data = request.get_json()
    required_fields = [
        "name", "age", "gender", "weight", "height",
        "activityLevel", "primaryGoal", "email", "password"
    ]
    missing = [field for field in required_fields if not data.get(field)]
    if missing:
        return jsonify({"error": f"Missing required fields: {', '.join(missing)}"}), 400

    name = data.get("name")
    age = data.get("age")
    gender = data.get("gender")
    email = data.get("email")
    password = data.get("password")
    weight = data.get("weight")
    height = data.get("height")
    activity_level = data.get("activityLevel")
    primary_goal = data.get("primaryGoal")
    diet = data.get("diet")
    allergies = data.get("allergies")
    health_conditions = data.get("healthConditions")

    hashed_password = generate_password_hash(password)
    if isinstance(health_conditions, list):
        health_conditions = json.dumps(health_conditions)

    cursor = db.cursor()
    cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
    if cursor.fetchone():
        cursor.close()
        return jsonify({"exists": True, "message": "Email already exists"}), 200

    sql = """INSERT INTO users 
             (email, password_hash, name, age, gender, height_cm, weight_kg, activity_level, goal, diet, allergies, health_conditions) 
             VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"""
    values = (email, hashed_password, name, age, gender, height, weight, activity_level, primary_goal, diet, allergies, health_conditions)
    cursor.execute(sql, values)
    db.commit()
    cursor.close()

    access_token = create_access_token(identity=email)
    return jsonify({"exists": False, "message": "User created successfully", "token": access_token}), 201

@app.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT id, password_hash FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()
    cursor.close()

    if not user or not check_password_hash(user["password_hash"], password):
        return jsonify({"success": False, "error": "Incorrect email or password"}), 401

    access_token = create_access_token(identity=email)
    return jsonify({
        "success": True,
        "message": "Login successful",
        "token": access_token,
        "user_id": user["id"]
    }), 200

@app.route('/auth/verify-token', methods=['GET'])
@jwt_required()
def verify_token():
    current_user_email = get_jwt_identity()
    return jsonify({"email": current_user_email}), 200

@jwt.unauthorized_loader
def unauthorized_callback(err):
    return jsonify({"error": "Missing or invalid token"}), 401

if __name__ == '__main__':
    app.run(debug=True)
