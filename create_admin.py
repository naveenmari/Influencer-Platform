import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

def create_admin():
    try:
        conn = psycopg2.connect(os.getenv('DATABASE_URL'))
        cur = conn.cursor()
        
        # Check if already exists
        cur.execute("SELECT * FROM users WHERE email = %s", ('admin@example.com',))
        if cur.fetchone():
            print("Admin already exists.")
            return

        cur.execute(
            "INSERT INTO users (username, email, password_hash, role) VALUES (%s, %s, %s, %s)",
            ('Admin', 'admin@example.com', 'admin123', 'admin')
        )
        conn.commit()
        print("Admin user created successfully with password: admin123")
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    create_admin()
