import mysql.connector
from config import Config

def get_db_connection():
    db = mysql.connector.connect(
        host=Config.DB_HOST,
        user=Config.DB_USER,
        password=Config.DB_PASSWORD,
        database=Config.DB_NAME,
        port=Config.DB_PORT,
        charset="utf8mb4",
        collation="utf8mb4_unicode_ci"
    )
    return db
