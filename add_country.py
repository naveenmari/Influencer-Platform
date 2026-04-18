import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

conn = psycopg2.connect(os.getenv("DATABASE_URL"), sslmode='require')
cursor = conn.cursor()
try:
    cursor.execute("ALTER TABLE influencers ADD COLUMN IF NOT EXISTS country VARCHAR(100);")
    conn.commit()
    print("Successfully added country column")
except Exception as e:
    print("Error:", e)
finally:
    cursor.close()
    conn.close()
