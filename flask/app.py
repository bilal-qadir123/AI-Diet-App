from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash
import mysql.connector
import json

db = mysql.connector.connect(
    host="127.0.0.1",
    user="root",
    password="",
    database="stickr",
    port=3307,
    charset="utf8mb4",
    collation="utf8mb4_unicode_ci"
)

app = Flask(__name__)
CORS(app)

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

    return jsonify({"exists": False, "message": "User info received and saved successfully"}), 200

if __name__ == '__main__':
    app.run(debug=True)
