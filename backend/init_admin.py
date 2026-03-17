"""
Script d'initialisation : crée l'administrateur par défaut.
Lancé automatiquement au démarrage du conteneur.
Idempotent : ne fait rien si l'admin existe déjà.
"""
import time
import sys
from sqlalchemy import text
from database import engine, Base, SessionLocal
import models
from core.security import hash_password


def wait_for_db(max_retries=30, delay=2):
    """Attend que PostgreSQL soit prêt avant de continuer."""
    print("⏳ Attente de PostgreSQL...")
    for attempt in range(max_retries):
        try:
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            print("✅ PostgreSQL disponible.")
            return True
        except Exception as e:
            if attempt < max_retries - 1:
                print(f"   Tentative {attempt + 1}/{max_retries} — retry dans {delay}s...")
                time.sleep(delay)
            else:
                print(f"❌ PostgreSQL inaccessible après {max_retries} tentatives : {e}")
                sys.exit(1)


def init():
    wait_for_db()

    # Crée les tables si elles n'existent pas
    Base.metadata.create_all(bind=engine)
    print("✅ Schéma base de données initialisé.")

    db = SessionLocal()
    try:
        existing = db.query(models.User).filter(models.User.username == "admin").first()
        if existing:
            print("⚠️  L'administrateur 'admin' existe déjà — aucune action.")
            return

        admin = models.User(
            username="admin",
            email="admin@model-technologie.com",
            hashed_password=hash_password("ModelTech2025!"),
            is_superadmin=True,
            is_active=True,
        )
        db.add(admin)
        db.commit()
        print("✅ Administrateur créé :")
        print("   Username : admin")
        print("   Password : ModelTech2025!")
        print("   ⚠️  Changez ce mot de passe immédiatement après la première connexion.")
    finally:
        db.close()


if __name__ == "__main__":
    init()
