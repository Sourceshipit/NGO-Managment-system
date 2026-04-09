from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
import models, schemas
from database import get_db
from datetime import date, datetime
from dateutil.relativedelta import relativedelta
from collections import defaultdict

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/stats", response_model=schemas.DashboardStats)
def get_stats(db: Session = Depends(get_db)):
    total_amount = db.query(func.sum(models.Donation.amount)).scalar() or 0.0
    total_count = db.query(models.Donation).count()
    active_vols = db.query(models.Volunteer).filter(models.Volunteer.status == "ACTIVE").count()
    children_enrolled = db.query(models.Child).filter(models.Child.is_active == True).count()
    
    # Compliance score
    total_comp = db.query(models.ComplianceRecord).count()
    active_comp = db.query(models.ComplianceRecord).filter(models.ComplianceRecord.status == "ACTIVE").count()
    score = int((active_comp / total_comp) * 100) if total_comp > 0 else 100
    
    # Monthly donations (last 12 months)
    donations = db.query(models.Donation).all()
    monthly_data = defaultdict(float)
    for d in donations:
        k = d.donated_at.strftime("%b %Y")
        monthly_data[k] += d.amount
    
    months_order = []
    now = datetime.now()
    for i in range(11, -1, -1):
        m = now - relativedelta(months=i)
        months_order.append(m.strftime("%b %Y"))
        
    monthly_donations = [{"month": m, "amount": monthly_data[m]} for m in months_order]
    
    # Fund breakdown
    projects = db.query(models.Donation.project, func.sum(models.Donation.amount)).group_by(models.Donation.project).all()
    fund_breakdown = [{"name": p[0], "value": p[1] or 0.0} for p in projects]
    
    # Recent donations
    recent_don = db.query(models.Donation).order_by(models.Donation.donated_at.desc()).limit(5).all()
    recent_don_list = []
    for d in recent_don:
        d_dict = d.__dict__.copy()
        d_dict["donor_name"] = d.donor.full_name if d.donor else "Unknown"
        recent_don_list.append(d_dict)
    
    # Recent activity
    activity = []
    for d in recent_don:
        activity.append(schemas.ActivityItem(text=f"Donation of ₹{d.amount} received", time=d.donated_at.isoformat(), type="donation"))
    for c in db.query(models.Child).order_by(models.Child.enrolled_at.desc()).limit(5).all():
        activity.append(schemas.ActivityItem(text=f"New child enrolled: {c.name}", time=c.enrolled_at.isoformat(), type="child"))
    for v in db.query(models.Volunteer).order_by(models.Volunteer.joined_at.desc()).limit(5).all():
        activity.append(schemas.ActivityItem(text=f"New volunteer joined: {v.user.full_name}", time=v.joined_at.isoformat(), type="volunteer"))
    
    activity.sort(key=lambda x: x.time, reverse=True)
    
    return {
        "total_donations_amount": total_amount,
        "total_donations_count": total_count,
        "active_volunteers": active_vols,
        "children_enrolled": children_enrolled,
        "compliance_score": score,
        "monthly_donations": monthly_donations,
        "fund_breakdown": fund_breakdown,
        "recent_donations": recent_don_list,
        "recent_activity": activity[:10]
    }
