import hashlib
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from models import BlockchainLog

def generate_hash(data: str, previous_hash: str, timestamp: str) -> str:
    return hashlib.sha256((data + previous_hash + timestamp).encode()).hexdigest()

def get_previous_hash(db: Session) -> str:
    last_log = db.query(BlockchainLog).order_by(BlockchainLog.id.desc()).first()
    return last_log.tx_hash if last_log else "0"*64

def create_blockchain_entry(db: Session, record_type: str, data_summary: str) -> BlockchainLog:
    prev = get_previous_hash(db)
    ts = datetime.now(timezone.utc).isoformat()
    new_hash = generate_hash(data_summary, prev, ts)
    entry = BlockchainLog(
        tx_hash=new_hash,
        record_type=record_type,
        data_summary=data_summary,
        previous_hash=prev,
        timestamp=datetime.now(timezone.utc)
    )
    db.add(entry)
    db.flush()
    return entry

def verify_chain(db: Session) -> dict:
    logs = db.query(BlockchainLog).order_by(BlockchainLog.id.asc()).all()
    if not logs:
        return {"valid": True, "total": 0, "broken_at": None}
    
    for i, log in enumerate(logs):
        if i == 0:
            if log.previous_hash != "0"*64:
                return {"valid": False, "total": len(logs), "broken_at": log.id}
        else:
            prev_log = logs[i-1]
            if log.previous_hash != prev_log.tx_hash:
                return {"valid": False, "total": len(logs), "broken_at": log.id}
    
    return {"valid": True, "total": len(logs), "broken_at": None}
