import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Boolean, DateTime, JSON, ForeignKey, Text
from .database import Base


def gen_id(prefix: str) -> str:
    return f"{prefix}-{uuid.uuid4().hex[:8].upper()}"


class Collector(Base):
    """Minimal collector profile — deliberately avoids unnecessary personal info."""
    __tablename__ = "collectors"

    collector_id = Column(String, primary_key=True, default=lambda: gen_id("COL"))
    name = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    language = Column(String, default="hi")  # 'en' | 'hi' | 'mr'
    operating_location = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Recycler(Base):
    """Authorized recycler / aggregator registry."""
    __tablename__ = "recyclers"

    recycler_id = Column(String, primary_key=True, default=lambda: gen_id("REC"))
    name = Column(String, nullable=False)
    location = Column(String, nullable=True)
    materials_accepted = Column(JSON, default=list)  # list[str]
    authorization_number = Column(String, nullable=True)
    authorization_status = Column(String, default="pending")  # authorized | pending | revoked
    contact_email = Column(String, nullable=True)
    contact_phone = Column(String, nullable=True)
    buying_rates = Column(JSON, default=dict)  # {material_category: rate_per_kg}
    pickup_available = Column(Boolean, default=True)
    service_area = Column(String, nullable=True)
    rating = Column(Float, default=4.5)


class Price(Base):
    """Historical + current price dataset, used for price discovery and trend charts."""
    __tablename__ = "prices"

    id = Column(String, primary_key=True, default=lambda: gen_id("PRC"))
    material_category = Column(String, nullable=False, index=True)
    subcategory = Column(String, nullable=True)
    location = Column(String, nullable=True, index=True)
    date = Column(DateTime, default=datetime.utcnow)
    buying_price = Column(Float, nullable=False)
    selling_price = Column(Float, nullable=True)
    unit = Column(String, default="kg")
    recycler_id = Column(String, ForeignKey("recyclers.recycler_id"), nullable=True)


class Lot(Base):
    """A digital lot of collected material, created by a collector (works offline)."""
    __tablename__ = "lots"

    lot_id = Column(String, primary_key=True, default=lambda: gen_id("LOT"))
    collector_id = Column(String, ForeignKey("collectors.collector_id"), nullable=True)
    material_category = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    photo_url = Column(String, nullable=True)
    weight_kg = Column(Float, nullable=False)
    condition = Column(String, default="Mixed")
    estimated_value = Column(Float, nullable=True)
    location = Column(String, nullable=True)
    status = Column(String, default="CREATED")
    # CREATED -> QUOTED -> ACCEPTED -> PICKUP_SCHEDULED -> HANDED_OVER -> PAID -> COMPLETED
    created_at = Column(DateTime, default=datetime.utcnow)
    client_created_offline = Column(Boolean, default=False)  # true if created while device was offline


class Quote(Base):
    """A recycler's offer against a specific lot."""
    __tablename__ = "quotes"

    id = Column(String, primary_key=True, default=lambda: gen_id("QTE"))
    lot_id = Column(String, ForeignKey("lots.lot_id"), nullable=False)
    recycler_id = Column(String, ForeignKey("recyclers.recycler_id"), nullable=False)
    quoted_price = Column(Float, nullable=False)
    status = Column(String, default="PENDING")  # PENDING | ACCEPTED | REJECTED
    created_at = Column(DateTime, default=datetime.utcnow)


class Transaction(Base):
    """Traceable transaction linking a lot, collector and recycler end to end."""
    __tablename__ = "transactions"

    transaction_id = Column(String, primary_key=True, default=lambda: gen_id("TXN"))
    lot_id = Column(String, ForeignKey("lots.lot_id"), nullable=False)
    collector_id = Column(String, ForeignKey("collectors.collector_id"), nullable=True)
    recycler_id = Column(String, ForeignKey("recyclers.recycler_id"), nullable=True)
    material_category = Column(String, nullable=False)
    weight_kg = Column(Float, nullable=False)
    quoted_price = Column(Float, nullable=True)
    final_price = Column(Float, nullable=True)
    collection_location = Column(String, nullable=True)
    handover_location = Column(String, nullable=True)
    date = Column(DateTime, default=datetime.utcnow)
    payment_status = Column(String, default="PENDING")  # PENDING | PAID
    status = Column(String, default="PROCESSING")
    anomaly_status = Column(String, default="normal")  # normal | suspicious
    anomaly_reason = Column(String, nullable=True)


class HandoverRecord(Base):
    """The digital, verifiable handover / chain-of-custody record for a transaction."""
    __tablename__ = "handover_records"

    handover_id = Column(String, primary_key=True, default=lambda: gen_id("HO"))
    lot_id = Column(String, ForeignKey("lots.lot_id"), nullable=False)
    transaction_id = Column(String, ForeignKey("transactions.transaction_id"), nullable=True)
    photo_url = Column(String, nullable=True)
    weight_kg = Column(Float, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    gps_lat = Column(Float, nullable=True)
    gps_lng = Column(Float, nullable=True)
    recycler_confirmed = Column(Boolean, default=False)
    reference_number = Column(String, nullable=True)


class Payment(Base):
    """Cash or digital payment record feeding the collector's earnings ledger."""
    __tablename__ = "payments"

    payment_id = Column(String, primary_key=True, default=lambda: gen_id("PAY"))
    transaction_id = Column(String, ForeignKey("transactions.transaction_id"), nullable=False)
    amount = Column(Float, nullable=False)
    mode = Column(String, default="CASH")  # CASH | UPI | BANK_TRANSFER
    status = Column(String, default="PAID")  # PENDING | PAID
    paid_at = Column(DateTime, default=datetime.utcnow)


class SyncQueueEntry(Base):
    """
    Audit trail of offline-created records synced from a collector's device.
    The mobile/web client POSTs its locally-queued records here once connectivity
    returns; this table lets you prove *when* a record actually reached the server
    versus when it was created on-device.
    """
    __tablename__ = "sync_queue"

    id = Column(String, primary_key=True, default=lambda: gen_id("SYNC"))
    device_id = Column(String, nullable=True)
    entity_type = Column(String, nullable=False)  # 'lot' | 'transaction' | 'handover'
    entity_id = Column(String, nullable=False)
    payload = Column(JSON, nullable=True)
    created_offline_at = Column(DateTime, nullable=True)
    synced_at = Column(DateTime, default=datetime.utcnow)


class SafetyGuide(Base):
    __tablename__ = "safety_guides"

    id = Column(String, primary_key=True, default=lambda: gen_id("SAFE"))
    category = Column(String, nullable=False)
    category_hi = Column(String, nullable=True)
    title = Column(String, nullable=False)
    title_hi = Column(String, nullable=True)
    severity = Column(String, default="medium")  # low | medium | high | critical
    instructions = Column(JSON, default=list)
    instructions_hi = Column(JSON, default=list)
    dos = Column(JSON, default=list)
    donts = Column(JSON, default=list)
