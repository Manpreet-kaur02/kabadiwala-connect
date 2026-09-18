from datetime import datetime
from statistics import mean
from typing import List, Optional

from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func

from . import models, schemas
from .database import Base, engine, get_db

# Creates kabadiwala.db (SQLite) with all tables on first run.
# Point DATABASE_URL at Postgres instead and this line provisions it there too.
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Kabadiwala Connect API",
    description="Backend for the informal-collector-to-formal-recycler platform.",
    version="0.1.0",
)

# Wide-open CORS for the hackathon demo. Restrict origins before any real deployment.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"status": "ok", "service": "kabadiwala-connect-api"}


# ---------------------------------------------------------------------------
# Collectors
# ---------------------------------------------------------------------------
@app.post("/collector", response_model=schemas.CollectorOut)
def create_collector(payload: schemas.CollectorCreate, db: Session = Depends(get_db)):
    collector = models.Collector(**payload.model_dump())
    db.add(collector)
    db.commit()
    db.refresh(collector)
    return collector


@app.get("/collector/{collector_id}", response_model=schemas.CollectorOut)
def get_collector(collector_id: str, db: Session = Depends(get_db)):
    collector = db.get(models.Collector, collector_id)
    if not collector:
        raise HTTPException(404, "Collector not found")
    return collector


# ---------------------------------------------------------------------------
# Recyclers
# ---------------------------------------------------------------------------
@app.get("/recyclers", response_model=List[schemas.RecyclerOut])
def list_recyclers(
    material: Optional[str] = None,
    authorized_only: bool = False,
    db: Session = Depends(get_db),
):
    q = db.query(models.Recycler)
    if authorized_only:
        q = q.filter(models.Recycler.authorization_status == "authorized")
    recyclers = q.all()
    if material:
        recyclers = [r for r in recyclers if material in (r.materials_accepted or [])]
    return recyclers


@app.get("/recyclers/match/{lot_id}", response_model=List[schemas.RecyclerMatch])
def match_recyclers(lot_id: str, db: Session = Depends(get_db)):
    """
    Weighted recycler-matching used by the collector app's 'Find Recycler' screen.
    Score = 30% location match + 25% offered price + 20% authorization
          + 15% pickup availability + 10% material compatibility
    (No AI needed for this — a transparent, explainable scoring rule is safer
    and easier to defend to judges than a black-box model here.)
    """
    lot = db.get(models.Lot, lot_id)
    if not lot:
        raise HTTPException(404, "Lot not found")

    recyclers = db.query(models.Recycler).all()
    compatible = [r for r in recyclers if lot.material_category in (r.materials_accepted or [])]
    if not compatible:
        return []

    rates = [r.buying_rates.get(lot.material_category, 0) for r in compatible]
    max_rate = max(rates) if max(rates) > 0 else 1

    results = []
    for r in compatible:
        reasons = []
        location_score = 30 if lot.location and r.location and lot.location.split(",")[0].strip().lower() in (r.service_area or "").lower() else 15
        if location_score == 30:
            reasons.append("Serves collector's location")

        rate = r.buying_rates.get(lot.material_category, 0)
        price_score = 25 * (rate / max_rate) if max_rate else 0
        if rate == max_rate:
            reasons.append("Best offered rate for this material")

        auth_score = 20 if r.authorization_status == "authorized" else 0
        if auth_score:
            reasons.append("Government authorized facility")

        pickup_score = 15 if r.pickup_available else 0
        if pickup_score:
            reasons.append("Doorstep pickup available")

        compat_score = 10  # already filtered to compatible recyclers
        reasons.append("Accepts this material category")

        total = round(location_score + price_score + auth_score + pickup_score + compat_score, 1)
        results.append(schemas.RecyclerMatch(recycler=r, score=total, reasons=reasons))

    results.sort(key=lambda x: x.score, reverse=True)
    return results


# ---------------------------------------------------------------------------
# Prices
# ---------------------------------------------------------------------------
@app.get("/prices", response_model=List[schemas.PriceOut])
def get_prices(
    material_category: Optional[str] = None,
    location: Optional[str] = None,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    q = db.query(models.Price)
    if material_category:
        q = q.filter(models.Price.material_category == material_category)
    if location:
        q = q.filter(models.Price.location == location)
    return q.order_by(models.Price.date.desc()).limit(limit).all()


@app.get("/prices/estimate")
def estimate_price(material_category: str, weight_kg: float, location: Optional[str] = None, db: Session = Depends(get_db)):
    """Fair-value RANGE estimate from historical prices — deliberately not a single exact number."""
    q = db.query(models.Price).filter(models.Price.material_category == material_category)
    if location:
        q = q.filter(models.Price.location == location)
    rows = q.all()
    if not rows:
        raise HTTPException(404, "No price history for this material/location yet")
    rates = [r.buying_price for r in rows]
    avg_rate = mean(rates)
    low, high = avg_rate * 0.9, avg_rate * 1.1
    return {
        "material_category": material_category,
        "weight_kg": weight_kg,
        "estimated_rate_per_kg": round(avg_rate, 2),
        "expected_value_range": {
            "min": round(low * weight_kg, 2),
            "max": round(high * weight_kg, 2),
        },
        "sample_size": len(rows),
        "disclaimer": "Fair-price range estimated from historical local data, not a guaranteed price.",
    }


# ---------------------------------------------------------------------------
# Lots
# ---------------------------------------------------------------------------
@app.post("/lot", response_model=schemas.LotOut)
def create_lot(payload: schemas.LotCreate, db: Session = Depends(get_db)):
    data = payload.model_dump(exclude={"client_created_at"})
    lot = models.Lot(**data)

    # Attach an instant value estimate using historical price data, if available
    price_rows = (
        db.query(models.Price)
        .filter(models.Price.material_category == payload.material_category)
        .all()
    )
    if price_rows:
        avg_rate = mean([p.buying_price for p in price_rows])
        lot.estimated_value = round(avg_rate * payload.weight_kg, 2)

    db.add(lot)
    db.commit()
    db.refresh(lot)

    # If the client says this lot was actually created while offline, log it in the
    # sync queue so there is an auditable record of on-device-first creation.
    if payload.client_created_offline:
        db.add(
            models.SyncQueueEntry(
                entity_type="lot",
                entity_id=lot.lot_id,
                payload=data,
                created_offline_at=payload.client_created_at,
            )
        )
        db.commit()

    return lot


@app.get("/lots", response_model=List[schemas.LotOut])
def list_lots(collector_id: Optional[str] = None, status: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(models.Lot)
    if collector_id:
        q = q.filter(models.Lot.collector_id == collector_id)
    if status:
        q = q.filter(models.Lot.status == status)
    return q.order_by(models.Lot.created_at.desc()).all()


@app.get("/lot/{lot_id}", response_model=schemas.LotOut)
def get_lot(lot_id: str, db: Session = Depends(get_db)):
    lot = db.get(models.Lot, lot_id)
    if not lot:
        raise HTTPException(404, "Lot not found")
    return lot


# ---------------------------------------------------------------------------
# Quotes
# ---------------------------------------------------------------------------
@app.post("/quote", response_model=schemas.QuoteOut)
def create_quote(payload: schemas.QuoteCreate, db: Session = Depends(get_db)):
    lot = db.get(models.Lot, payload.lot_id)
    if not lot:
        raise HTTPException(404, "Lot not found")
    quote = models.Quote(**payload.model_dump())
    db.add(quote)
    lot.status = "QUOTED"
    db.commit()
    db.refresh(quote)
    return quote


@app.post("/quote/{quote_id}/accept", response_model=schemas.QuoteOut)
def accept_quote(quote_id: str, db: Session = Depends(get_db)):
    quote = db.get(models.Quote, quote_id)
    if not quote:
        raise HTTPException(404, "Quote not found")
    quote.status = "ACCEPTED"
    lot = db.get(models.Lot, quote.lot_id)
    if lot:
        lot.status = "ACCEPTED"
    db.commit()
    db.refresh(quote)
    return quote


# ---------------------------------------------------------------------------
# Transactions (+ AI-free anomaly detection)
# ---------------------------------------------------------------------------
def _flag_anomaly(db: Session, material_category: str, weight_kg: float, final_price: Optional[float]):
    """
    Rule-based anomaly detector: flags a transaction if its effective rate/kg
    deviates heavily from the historical average for that material.
    This is intentionally explainable (mean ± tolerance) rather than a black-box
    model — the PS only requires flagging abnormal values, not certainty.
    """
    if not final_price or weight_kg <= 0:
        return "normal", None
    rows = db.query(models.Price).filter(models.Price.material_category == material_category).all()
    if not rows:
        return "normal", None
    avg_rate = mean([r.buying_price for r in rows])
    effective_rate = final_price / weight_kg
    if avg_rate <= 0:
        return "normal", None
    deviation = abs(effective_rate - avg_rate) / avg_rate
    if deviation > 0.5:  # more than 50% away from the historical average
        reason = (
            f"Effective rate ₹{effective_rate:.0f}/kg is "
            f"{'above' if effective_rate > avg_rate else 'below'} the benchmark "
            f"average of ₹{avg_rate:.0f}/kg by {deviation * 100:.0f}%."
        )
        return "suspicious", reason
    return "normal", None


@app.post("/transaction", response_model=schemas.TransactionOut)
def create_transaction(payload: schemas.TransactionCreate, db: Session = Depends(get_db)):
    lot = db.get(models.Lot, payload.lot_id)
    if not lot:
        raise HTTPException(404, "Lot not found")

    anomaly_status, anomaly_reason = _flag_anomaly(
        db, payload.material_category, payload.weight_kg, payload.final_price
    )

    txn = models.Transaction(
        **payload.model_dump(),
        anomaly_status=anomaly_status,
        anomaly_reason=anomaly_reason,
    )
    db.add(txn)
    lot.status = "HANDED_OVER"
    db.commit()
    db.refresh(txn)
    return txn


@app.get("/transactions", response_model=List[schemas.TransactionOut])
def list_transactions(
    collector_id: Optional[str] = None,
    recycler_id: Optional[str] = None,
    anomaly_only: bool = False,
    db: Session = Depends(get_db),
):
    q = db.query(models.Transaction)
    if collector_id:
        q = q.filter(models.Transaction.collector_id == collector_id)
    if recycler_id:
        q = q.filter(models.Transaction.recycler_id == recycler_id)
    if anomaly_only:
        q = q.filter(models.Transaction.anomaly_status == "suspicious")
    return q.order_by(models.Transaction.date.desc()).all()


# ---------------------------------------------------------------------------
# Handover (digital, verifiable, GPS-tagged chain of custody)
# ---------------------------------------------------------------------------
@app.post("/handover", response_model=schemas.HandoverOut)
def create_handover(payload: schemas.HandoverCreate, db: Session = Depends(get_db)):
    lot = db.get(models.Lot, payload.lot_id)
    if not lot:
        raise HTTPException(404, "Lot not found")
    handover = models.HandoverRecord(**payload.model_dump())
    db.add(handover)
    db.flush()  # assigns the auto-generated handover_id before we reuse it below
    handover.reference_number = handover.handover_id
    lot.status = "HANDED_OVER"
    db.commit()
    db.refresh(handover)
    return handover


@app.get("/handover/{handover_id}", response_model=schemas.HandoverOut)
def get_handover(handover_id: str, db: Session = Depends(get_db)):
    record = db.get(models.HandoverRecord, handover_id)
    if not record:
        raise HTTPException(404, "Handover record not found")
    return record


# ---------------------------------------------------------------------------
# Payments + Earnings Ledger
# ---------------------------------------------------------------------------
@app.post("/payment", response_model=schemas.PaymentOut)
def create_payment(payload: schemas.PaymentCreate, db: Session = Depends(get_db)):
    txn = db.get(models.Transaction, payload.transaction_id)
    if not txn:
        raise HTTPException(404, "Transaction not found")
    payment = models.Payment(**payload.model_dump(), status="PAID")
    db.add(payment)
    txn.payment_status = "PAID"
    txn.status = "COMPLETED"
    db.commit()
    db.refresh(payment)
    return payment


@app.get("/ledger/{collector_id}", response_model=schemas.LedgerOut)
def get_ledger(collector_id: str, db: Session = Depends(get_db)):
    txns = db.query(models.Transaction).filter(models.Transaction.collector_id == collector_id).all()
    entries = []
    total_earned = 0.0
    total_pending = 0.0
    for txn in txns:
        payments = db.query(models.Payment).filter(models.Payment.transaction_id == txn.transaction_id).all()
        if payments:
            for p in payments:
                entries.append(
                    schemas.LedgerEntry(
                        transaction_id=txn.transaction_id,
                        material_category=txn.material_category,
                        weight_kg=txn.weight_kg,
                        amount=p.amount,
                        mode=p.mode,
                        status=p.status,
                        paid_at=p.paid_at,
                    )
                )
                total_earned += p.amount
        elif txn.final_price:
            total_pending += txn.final_price

    return schemas.LedgerOut(
        collector_id=collector_id,
        total_earned=round(total_earned, 2),
        total_pending=round(total_pending, 2),
        entries=entries,
    )


# ---------------------------------------------------------------------------
# Offline Sync
# ---------------------------------------------------------------------------
@app.post("/sync")
def sync_offline_batch(batch: schemas.SyncBatchIn, db: Session = Depends(get_db)):
    """
    Called by the collector app once connectivity returns, with everything it
    queued locally while offline (new lots, handovers, etc.). Each entry is
    logged so there is an auditable gap between on-device creation time and
    server sync time.
    """
    saved = []
    for entry in batch.entries:
        record = models.SyncQueueEntry(**entry.model_dump())
        db.add(record)
        saved.append(record)
    db.commit()
    return {"synced": len(saved), "entries": [s.id for s in saved]}


@app.get("/sync/status")
def sync_status(device_id: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(models.SyncQueueEntry)
    if device_id:
        q = q.filter(models.SyncQueueEntry.device_id == device_id)
    total = q.count()
    return {"total_synced_records": total}


# ---------------------------------------------------------------------------
# Safety Guides
# ---------------------------------------------------------------------------
@app.get("/safety-guides")
def list_safety_guides(db: Session = Depends(get_db)):
    return db.query(models.SafetyGuide).all()


# ---------------------------------------------------------------------------
# Admin / PMU summary (feeds the Admin dashboard)
# ---------------------------------------------------------------------------
@app.get("/admin/summary")
def admin_summary(db: Session = Depends(get_db)):
    total_collectors = db.query(models.Collector).count()
    total_recyclers = db.query(models.Recycler).count()
    authorized_recyclers = (
        db.query(models.Recycler).filter(models.Recycler.authorization_status == "authorized").count()
    )
    total_lots = db.query(models.Lot).count()
    total_transactions = db.query(models.Transaction).count()
    total_material_kg = db.query(func.sum(models.Transaction.weight_kg)).scalar() or 0
    total_value = db.query(func.sum(models.Transaction.final_price)).scalar() or 0
    anomalies = db.query(models.Transaction).filter(models.Transaction.anomaly_status == "suspicious").count()

    return {
        "total_collectors": total_collectors,
        "total_recyclers": total_recyclers,
        "authorized_recyclers": authorized_recyclers,
        "total_lots": total_lots,
        "total_transactions": total_transactions,
        "total_material_kg": total_material_kg,
        "total_value": total_value,
        "anomalies": anomalies,
    }
