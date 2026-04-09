from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
import models, schemas, auth
from database import get_db
from blockchain_utils import verify_chain

router = APIRouter(prefix="/blockchain", tags=["blockchain"])

@router.get("/", response_model=schemas.BlockchainPaginated)
def get_logs(page: int = 1, size: int = 20, record_type: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(models.BlockchainLog)
    
    if record_type:
        query = query.filter(models.BlockchainLog.record_type == record_type)
        
    total = query.count()
    
    # Highest ID first (newest)
    logs = query.order_by(models.BlockchainLog.id.desc()).offset((page - 1) * size).limit(size).all()
    
    return {"items": logs, "total": total}

@router.get("/verify", response_model=schemas.ChainVerifyResponse)
def verify_logs(db: Session = Depends(get_db)):
    return verify_chain(db)
