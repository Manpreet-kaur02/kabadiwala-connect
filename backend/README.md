# Kabadiwala Connect — Backend (FastAPI)

A real, running backend for the platform: collectors, lots, recyclers, price
discovery, quotes, transactions, GPS-tagged handover records, payments,
an earnings ledger, offline-sync logging, and rule-based anomaly detection.

It uses **SQLite by default** so it runs with zero external setup for a demo
or hackathon judge. Swap in **PostgreSQL** for a "real" deployment by setting
one environment variable — no code changes needed.

## 1. Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## 2. Seed demo data (recyclers, 60 days of price history, safety guides)

```bash
python seed.py
```

## 3. Run the server

```bash
uvicorn app.main:app --reload --port 8000
```

Open http://localhost:8000/docs for interactive Swagger docs (auto-generated
from the code — try every endpoint from the browser).

## 4. Switching to PostgreSQL

```bash
pip install psycopg2-binary
export DATABASE_URL="postgresql://user:password@localhost:5432/kabadiwala"
python seed.py            # creates tables + seed data in Postgres this time
uvicorn app.main:app --reload --port 8000
```

## API Reference (matches the plan's endpoint list)

| Method | Path                          | Purpose |
|--------|-------------------------------|---------|
| POST   | `/collector`                  | Register a minimal collector profile |
| POST   | `/lot`                        | Create a digital material lot (works for offline-created lots too — pass `client_created_offline: true`) |
| GET    | `/prices`                     | Price dataset, filterable by material/location |
| GET    | `/prices/estimate`            | Fair-value **range** estimate for a material + weight + location |
| GET    | `/recyclers`                  | Authorized recycler/aggregator registry |
| GET    | `/recyclers/match/{lot_id}`   | Weighted recycler recommendation for a lot (location/price/authorization/pickup/compatibility) |
| POST   | `/quote`                      | A recycler's offer on a lot |
| POST   | `/quote/{id}/accept`          | Collector accepts a quote |
| POST   | `/transaction`                | Create a transaction (auto rule-based anomaly check vs. historical price) |
| GET    | `/transactions`               | List/filter transactions (`anomaly_only=true` for the admin view) |
| POST   | `/handover`                   | Digital, GPS-taggable handover / chain-of-custody record |
| POST   | `/payment`                    | Record a cash/UPI/bank payment against a transaction |
| GET    | `/ledger/{collector_id}`      | Collector's earnings ledger (paid + pending) |
| POST   | `/sync`                       | Batch-upload records a device queued while offline |
| GET    | `/safety-guides`              | Pictorial/audio safety guidance content |
| GET    | `/admin/summary`              | Aggregate stats for the Admin/PMU dashboard |

## Anomaly detection (no ML needed for the MVP)

`_flag_anomaly()` in `app/main.py` compares a transaction's effective ₹/kg
rate against the historical average for that material and flags it
`suspicious` if it deviates by more than 50%. It's a transparent, explainable
rule — much easier to defend to judges than a black-box model, and matches
what the problem statement actually asks for ("identify abnormal or
inconsistent transaction values").

## Wiring this up to the existing frontend

The React frontend (`../src`) currently keeps all its state in
`localStorage` (see the "offline-first" work in `App.tsx`). To connect it to
this real backend:

1. Set `VITE_API_BASE_URL=http://localhost:8000` in the frontend's `.env.local`.
2. Replace the `INITIAL_*` mock-data imports in `App.tsx` with `fetch()` /
   `axios` calls to the endpoints above on load.
3. Keep the existing `localStorage` queue as the *offline* cache — write to it
   immediately, then flush it to `/sync` and the individual POST endpoints
   when `navigator.onLine` is true (the `isOnline` / `pendingSyncCount` state
   already added to `App.tsx` is exactly the hook point for this).

This backend was built standalone (not yet wired into the frontend) so it can
be reviewed, run and tested independently first.
