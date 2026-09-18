"""
Seeds the database with demo recyclers, price history and safety guides,
mirroring src/data/mockData.ts on the frontend so both sides tell the same
demo story. Run once after starting fresh:

    python seed.py
"""
import random
from datetime import datetime, timedelta

from app.database import Base, engine, SessionLocal
from app import models

Base.metadata.create_all(bind=engine)

db = SessionLocal()

RECYCLERS = [
    dict(
        recycler_id="REC-001",
        name="GreenCycle Recycling Pvt. Ltd.",
        location="Derabassi Industrial Cluster, Punjab",
        materials_accepted=["PCB", "Lithium Battery", "Copper Cable", "Mobile Phone", "Laptop"],
        authorization_number="CPCB/EW-REG/2023/PB-042",
        authorization_status="authorized",
        contact_email="intake@greencyclerecycling.in",
        contact_phone="+91 172 4589000",
        buying_rates={"PCB": 365, "Copper Cable": 485, "Lithium Battery": 210, "Laptop": 400},
        pickup_available=True,
        service_area="Chandigarh, Mohali",
        rating=4.9,
    ),
    dict(
        recycler_id="REC-002",
        name="EcoTech Metal Refining Works",
        location="Ambala Industrial Area, Haryana",
        materials_accepted=["Copper Cable", "Electric Motor", "Lead Acid Battery", "Hard Disk (HDD)"],
        authorization_number="CPCB/EW-REG/2022/HR-109",
        authorization_status="authorized",
        contact_email="operations@ecotechmetals.com",
        contact_phone="+91 171 2673400",
        buying_rates={"Copper Cable": 490, "Electric Motor": 82, "Lead Acid Battery": 105, "Hard Disk (HDD)": 190},
        pickup_available=True,
        service_area="Ambala, Zirakpur",
        rating=4.7,
    ),
    dict(
        recycler_id="REC-003",
        name="Bharat E-Waste Solutions & Smelters",
        location="Okhla Phase 3, New Delhi",
        materials_accepted=["PCB", "LCD Screen", "CRT Monitor", "Laptop", "Printer / Scanner"],
        authorization_number="CPCB/EW-REG/2021/DL-088",
        authorization_status="authorized",
        contact_email="procurement@bharatewaste.org",
        contact_phone="+91 11 26810200",
        buying_rates={"PCB": 370, "LCD Screen": 145, "CRT Monitor": 38, "Printer / Scanner": 70},
        pickup_available=True,
        service_area="Mohali, Panchkula",
        rating=4.8,
    ),
]

MATERIAL_BASE_RATES = {
    "PCB": 220,
    "Copper Cable": 460,
    "Lithium Battery": 190,
    "LCD Screen": 45,
    "CRT Monitor": 32,
    "Electric Motor": 78,
    "Lead Acid Battery": 98,
    "Hard Disk (HDD)": 175,
    "Laptop": 380,
    "Printer / Scanner": 65,
}

LOCATIONS = ["Chandigarh", "Mohali", "Panchkula", "Zirakpur"]

SAFETY_GUIDES = [
    dict(
        category="Cable Burning",
        category_hi="तार जलाना",
        title="Never burn cables to strip copper",
        title_hi="तार जलाकर तांबा न निकालें",
        severity="critical",
        instructions=["Use manual stripping tools instead of fire", "Sell mixed cable as-is to an authorized recycler"],
        instructions_hi=["आग की जगह हाथ से स्ट्रिपिंग टूल का उपयोग करें", "मिश्रित तार को सीधे अधिकृत रिसाइक्लर को बेचें"],
        dos=["Use a wire stripper", "Store cables in a ventilated area"],
        donts=["Burn cable insulation", "Inhale smoke from burning plastic"],
    ),
    dict(
        category="Battery Handling",
        category_hi="बैटरी प्रबंधन",
        title="Do not puncture or crush batteries",
        title_hi="बैटरी को छेदें या कुचलें नहीं",
        severity="high",
        instructions=["Store batteries separately from metal scrap", "Tape terminal ends before storage"],
        instructions_hi=["बैटरी को धातु स्क्रैप से अलग रखें", "भंडारण से पहले टर्मिनल को टेप करें"],
        dos=["Store in a cool, dry place", "Hand over intact to authorized recycler"],
        donts=["Puncture or crush the casing", "Expose to heat or fire"],
    ),
    dict(
        category="CRT Handling",
        category_hi="CRT प्रबंधन",
        title="Avoid breaking CRT screens",
        title_hi="CRT स्क्रीन तोड़ने से बचें",
        severity="high",
        instructions=["Handle CRT monitors whole, do not break the tube", "Use gloves when lifting"],
        instructions_hi=["CRT मॉनिटर को साबुत संभालें, ट्यूब न तोड़ें", "उठाते समय दस्ताने पहनें"],
        dos=["Transport upright and padded", "Hand over to an authorized recycler"],
        donts=["Break the glass tube", "Dispose of in regular waste"],
    ),
]


def run():
    if db.query(models.Recycler).count() == 0:
        for r in RECYCLERS:
            db.add(models.Recycler(**r))
        print(f"Seeded {len(RECYCLERS)} recyclers")

    if db.query(models.Price).count() == 0:
        count = 0
        for material, base_rate in MATERIAL_BASE_RATES.items():
            for location in LOCATIONS:
                for days_ago in range(0, 60, 5):  # a data point every 5 days for 60 days
                    date = datetime.utcnow() - timedelta(days=days_ago)
                    jitter = random.uniform(-0.08, 0.08)
                    rate = round(base_rate * (1 + jitter), 2)
                    db.add(
                        models.Price(
                            material_category=material,
                            location=location,
                            date=date,
                            buying_price=rate,
                            selling_price=round(rate * 1.1, 2),
                            unit="kg",
                        )
                    )
                    count += 1
        print(f"Seeded {count} price history rows")

    if db.query(models.SafetyGuide).count() == 0:
        for g in SAFETY_GUIDES:
            db.add(models.SafetyGuide(**g))
        print(f"Seeded {len(SAFETY_GUIDES)} safety guides")

    db.commit()
    print("Seed complete.")


if __name__ == "__main__":
    run()
