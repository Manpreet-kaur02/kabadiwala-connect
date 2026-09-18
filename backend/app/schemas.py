from datetime import datetime
from typing import Optional, List, Dict
from pydantic import BaseModel


class CollectorCreate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    language: str = "hi"
    operating_location: Optional[str] = None


class CollectorOut(CollectorCreate):
    collector_id: str
    created_at: datetime

    class Config:
        from_attributes = True


class RecyclerOut(BaseModel):
    recycler_id: str
    name: str
    location: Optional[str]
    materials_accepted: List[str] = []
    authorization_number: Optional[str]
    authorization_status: str
    contact_email: Optional[str]
    contact_phone: Optional[str]
    buying_rates: Dict[str, float] = {}
    pickup_available: bool
    service_area: Optional[str]
    rating: float

    class Config:
        from_attributes = True


class PriceOut(BaseModel):
    id: str
    material_category: str
    subcategory: Optional[str]
    location: Optional[str]
    date: datetime
    buying_price: float
    selling_price: Optional[float]
    unit: str
    recycler_id: Optional[str]

    class Config:
        from_attributes = True


class LotCreate(BaseModel):
    collector_id: Optional[str] = None
    material_category: str
    description: Optional[str] = None
    photo_url: Optional[str] = None
    weight_kg: float
    condition: str = "Mixed"
    location: Optional[str] = None
    client_created_offline: bool = False
    client_created_at: Optional[datetime] = None  # when the lot was actually created on-device


class LotOut(BaseModel):
    lot_id: str
    collector_id: Optional[str]
    material_category: str
    description: Optional[str]
    photo_url: Optional[str]
    weight_kg: float
    condition: str
    estimated_value: Optional[float]
    location: Optional[str]
    status: str
    created_at: datetime
    client_created_offline: bool

    class Config:
        from_attributes = True


class QuoteCreate(BaseModel):
    lot_id: str
    recycler_id: str
    quoted_price: float


class QuoteOut(QuoteCreate):
    id: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class TransactionCreate(BaseModel):
    lot_id: str
    collector_id: Optional[str] = None
    recycler_id: Optional[str] = None
    material_category: str
    weight_kg: float
    quoted_price: Optional[float] = None
    final_price: Optional[float] = None
    collection_location: Optional[str] = None
    handover_location: Optional[str] = None


class TransactionOut(BaseModel):
    transaction_id: str
    lot_id: str
    collector_id: Optional[str]
    recycler_id: Optional[str]
    material_category: str
    weight_kg: float
    quoted_price: Optional[float]
    final_price: Optional[float]
    collection_location: Optional[str]
    handover_location: Optional[str]
    date: datetime
    payment_status: str
    status: str
    anomaly_status: str
    anomaly_reason: Optional[str]

    class Config:
        from_attributes = True


class HandoverCreate(BaseModel):
    lot_id: str
    transaction_id: Optional[str] = None
    photo_url: Optional[str] = None
    weight_kg: Optional[float] = None
    gps_lat: Optional[float] = None
    gps_lng: Optional[float] = None
    recycler_confirmed: bool = False


class HandoverOut(BaseModel):
    handover_id: str
    lot_id: str
    transaction_id: Optional[str]
    photo_url: Optional[str]
    weight_kg: Optional[float]
    timestamp: datetime
    gps_lat: Optional[float]
    gps_lng: Optional[float]
    recycler_confirmed: bool
    reference_number: Optional[str]

    class Config:
        from_attributes = True


class PaymentCreate(BaseModel):
    transaction_id: str
    amount: float
    mode: str = "CASH"


class PaymentOut(PaymentCreate):
    payment_id: str
    status: str
    paid_at: datetime

    class Config:
        from_attributes = True


class LedgerEntry(BaseModel):
    transaction_id: str
    material_category: str
    weight_kg: float
    amount: float
    mode: str
    status: str
    paid_at: datetime


class LedgerOut(BaseModel):
    collector_id: str
    total_earned: float
    total_pending: float
    entries: List[LedgerEntry]


class SyncEntryIn(BaseModel):
    device_id: Optional[str] = None
    entity_type: str  # 'lot' | 'transaction' | 'handover'
    entity_id: str
    payload: Optional[dict] = None
    created_offline_at: Optional[datetime] = None


class SyncBatchIn(BaseModel):
    entries: List[SyncEntryIn]


class RecyclerMatch(BaseModel):
    recycler: RecyclerOut
    score: float
    reasons: List[str]
