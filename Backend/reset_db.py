"""
Reset database - removes all data and recreates tables
Run this with: python reset_db.py
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, Base
from app.models import (
    User, Vendor, Agent, AgentTask, AgentLog, AgentTimeline,
    Control, RiskEvent, AuditLog, Document,
    Template, Organisation, Division, SupplierNode, SystemNode, OrgSettings,
)

def reset_database():
    print("⚠️  WARNING: This will delete ALL data from the database!")
    confirm = input("Type 'YES' to confirm: ")
    
    if confirm != "YES":
        print("❌ Reset cancelled")
        return
    
    print("🗑️  Dropping all tables...")
    Base.metadata.drop_all(bind=engine)
    
    print("📝 Creating fresh tables...")
    Base.metadata.create_all(bind=engine)
    
    print("✅ Database reset complete!")
    print("   You can now register a new account.")

if __name__ == "__main__":
    reset_database()
