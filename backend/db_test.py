from sqlalchemy import text
from backend.database import engine

def test_db_connection():
    print("🔍 Engine URL:", engine.url)

    try:
        with engine.connect() as conn:
            # Simple query that works on Postgres, MySQL, SQLite
            result = conn.execute(text("SELECT 1")).scalar()
            print("✅ DB connected successfully, SELECT 1 ->", result)

            # List tables
            tables = conn.execute(
                text("""
                SELECT table_name 
                FROM information_schema.tables
                WHERE table_schema = 'public'
                """)
            ).fetchall()

            if tables:
                print("📦 Tables found:")
                for t in tables:
                    print(" -", t[0])
            else:
                print("⚠️ No tables found in this database")

    except Exception as e:
        print("❌ DB connection FAILED")
        print(e)

if __name__ == "__main__":
    test_db_connection()
