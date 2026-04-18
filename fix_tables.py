import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

conn = psycopg2.connect(os.getenv("DATABASE_URL"), sslmode='require')
cursor = conn.cursor()

queries = [
    """
    CREATE TABLE IF NOT EXISTS payments_invoices (
        id SERIAL PRIMARY KEY,
        campaign_id INT,
        brand_id INT,
        influencer_id INT,
        amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) CHECK (status IN ('pending', 'paid', 'overdue')) DEFAULT 'pending',
        paid_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
        FOREIGN KEY (brand_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (influencer_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """
]

try:
    for q in queries:
        cursor.execute(q)
    conn.commit()
    print("Successfully created missing tables (payments_invoices, notifications).")
except Exception as e:
    print("Error:", e)
finally:
    cursor.close()
    conn.close()
