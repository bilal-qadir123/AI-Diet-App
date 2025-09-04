from database import get_db_connection

class FoodModel:

    @staticmethod
    def add_food_entry(user_id, name, calories, protein, carbs, fat, meal_type, timestamp, servings=1, waterConsumed = 0):
        try:
            db = get_db_connection()
            cursor = db.cursor()
            sql = """
                INSERT INTO food_intake (user_id, name, calories, protein, carbs, fat, meal_type, timestamp, servings, waterConsumed)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            values = (user_id, name, calories, protein, carbs, fat, meal_type, timestamp, servings, waterConsumed)
            print(f"Executing SQL: {sql} with values {values}")
            cursor.execute(sql, values)
            db.commit()
        except Exception as e:
            print(f"Error inserting food entry: {e}")
            db.rollback()
            raise
        finally:
            cursor.close()
            db.close()
    
    @staticmethod
    def get_entries_by_user(user_id):
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)
        cursor.execute("SELECT * FROM food_intake WHERE user_id = %s ORDER BY timestamp DESC", (user_id,))
        entries = cursor.fetchall()
        cursor.close()
        db.close()
        return entries

    @staticmethod
    def delete_entry(entry_id, user_id):
        db = get_db_connection()
        cursor = db.cursor()
        cursor.execute("DELETE FROM food_intake WHERE id = %s AND user_id = %s", (entry_id, user_id))
        db.commit()
        cursor.close()
        db.close()

    @staticmethod
    def update_servings(entry_id, user_id, servings):
        db = get_db_connection()
        cursor = db.cursor()
        cursor.execute(
            "UPDATE food_intake SET servings = %s WHERE id = %s AND user_id = %s",
            (servings, entry_id, user_id)
        )
        db.commit()
        cursor.close()
        db.close()

    @staticmethod
    def update_or_add_water(user_id, water):
        db = get_db_connection()
        cursor = db.cursor()

        # Check if user has any entry
        cursor.execute("SELECT id FROM food_intake WHERE user_id = %s ORDER BY timestamp DESC LIMIT 1", (user_id,))
        row = cursor.fetchone()

        if row:  # update latest entry
            cursor.execute(
                "UPDATE food_intake SET waterConsumed = %s WHERE id = %s",
                (water, row[0])
            )
        else:  # no entries → insert a new one with only water
            cursor.execute(
                "INSERT INTO food_intake (user_id, meal_type, waterConsumed, servings, timestamp) VALUES (%s, %s, %s, %s, NOW())",
                (user_id, "water", water, int(water / 0.25))
            )

        db.commit()
        cursor.close()
        db.close()

    @staticmethod
    def get_latest_water(user_id):
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)
        cursor.execute(
            "SELECT waterConsumed FROM food_intake WHERE user_id = %s AND meal_type = 'water' ORDER BY timestamp DESC LIMIT 1",
            (user_id,)
        )
        row = cursor.fetchone()
        cursor.close()
        db.close()
        return row["waterConsumed"] if row else 0
