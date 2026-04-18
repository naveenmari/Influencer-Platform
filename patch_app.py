with open('app.py', 'r', encoding='utf-8') as f:
    code = f.read()

# Imports
code = code.replace("import mysql.connector", "import psycopg2\nimport psycopg2.extras\nfrom dotenv import load_dotenv\n\nload_dotenv()")

# Connection
old_db = """# Database Configuration
db_config = {
    'host': 'localhost',
    'user': 'root',          # UPDATE THIS
    'password': 'root',  # UPDATE THIS
    'database': 'influencer_platform'
}

def get_db_connection():
    try:
        conn = mysql.connector.connect(**db_config)
        return conn
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return None"""

new_db = """# Database Configuration

def get_db_connection():
    try:
        import os
        database_url = os.environ.get("DATABASE_URL")
        conn = psycopg2.connect(database_url, sslmode='require')
        return conn
    except psycopg2.Error as err:
        print(f"Error connecting to database: {err}")
        return None"""

code = code.replace(old_db, new_db)

# Replace cursor calls
code = code.replace("cursor(dictionary=True)", "cursor(cursor_factory=psycopg2.extras.RealDictCursor)")
code = code.replace("mysql.connector.Error", "psycopg2.Error")

with open('app.py', 'w', encoding='utf-8') as f:
    f.write(code)
