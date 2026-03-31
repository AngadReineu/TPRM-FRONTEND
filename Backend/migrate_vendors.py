"""
Migration script to add new columns to vendors table.
Run this from the Backend directory: python migrate_vendors.py
"""
from sqlalchemy import text
from app.database import engine

# SQL statements to add new columns
ALTER_STATEMENTS = [
    "ALTER TABLE vendors ADD COLUMN IF NOT EXISTS mobile VARCHAR;",
    "ALTER TABLE vendors ADD COLUMN IF NOT EXISTS gst_number VARCHAR;",
    "ALTER TABLE vendors ADD COLUMN IF NOT EXISTS pan_number VARCHAR;",
    "ALTER TABLE vendors ADD COLUMN IF NOT EXISTS stakeholder_matrix JSON;",
]

def run_migration():
    with engine.connect() as conn:
        for stmt in ALTER_STATEMENTS:
            try:
                conn.execute(text(stmt))
                print(f"✓ Executed: {stmt[:50]}...")
            except Exception as e:
                # Column might already exist
                print(f"⚠ Skipped (may already exist): {stmt[:50]}... - {e}")
        conn.commit()
    print("\n✓ Migration complete!")

if __name__ == "__main__":
    run_migration()
