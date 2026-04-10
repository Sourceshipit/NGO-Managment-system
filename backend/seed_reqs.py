import os
from database import SessionLocal, engine
from models import Base, NgoRequirement, User

Base.metadata.create_all(bind=engine)

def seed_reqs():
    db = SessionLocal()
    if db.query(NgoRequirement).count() > 0:
        print("Requirements already seeded.")
        return
    
    user = db.query(User).filter(User.role == "NGO_STAFF").first()
    
    reqs = [
        ("School Supplies for Summer Camp", "SUPPLIES", "HIGH", "We need 50 sets of notebooks, pens, and drawing materials for the upcoming Dharavi summer camp.", 50, 12),
        ("Medical Kits for Eye Camp", "SUPPLIES", "HIGH", "Basic first aid and eye-care kits for the upcoming rural eye camp.", 20, 5),
        ("Monthly Ration Funds", "FUNDS", "MEDIUM", "Funds required to supply monthly rations to 100 families.", 100000, 45000),
        ("Digital Literacy Laptops", "SUPPLIES", "LOW", "Looking for used laptops in working condition to teach basic computer skills.", 10, 3)
    ]
    for r in reqs:
        req = NgoRequirement(title=r[0], category=r[1], urgency=r[2], description=r[3], quantity_needed=r[4], quantity_fulfilled=r[5], created_by=user.id if user else None)
        db.add(req)
    db.commit()
    db.close()
    print("Seeded requirements.")

if __name__ == "__main__":
    seed_reqs()
