# CORAF × Model Technologie — Formulaire de Qualification Excel

Application complète de qualification des besoins en formation Excel pour les agents du CORAF.

---

## Architecture

```
coraf-formation/
├── backend/          # FastAPI (Python 3.12)
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── init_admin.py
│   ├── core/
│   │   ├── security.py   # JWT, hashing
│   │   └── scoring.py    # Moteur d'analyse automatique
│   ├── routers/
│   │   ├── auth.py
│   │   ├── submissions.py
│   │   └── admin.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/         # React 18 + TypeScript + Vite
│   ├── src/
│   │   ├── App.tsx
│   │   ├── pages/
│   │   │   ├── FormPage.tsx       # Formulaire 5 étapes
│   │   │   ├── AdminLogin.tsx     # Connexion JWT
│   │   │   └── AdminDashboard.tsx # Backoffice
│   │   ├── components/
│   │   │   ├── StepIndicator.tsx
│   │   │   └── ResultCard.tsx
│   │   ├── services/api.ts
│   │   ├── types/
│   │   │   ├── index.ts
│   │   │   └── constants.ts
│   │   └── styles/form.css
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
└── docker-compose.yml
```

---

## Démarrage rapide

### Option 1 — Docker Compose (recommandé)

```bash
# Cloner le projet
git clone <repo> && cd coraf-formation

# Lancer les deux services
docker-compose up --build -d

# Frontend : http://localhost:3000
# Backend API : http://localhost:8000
# Docs API : http://localhost:8000/docs
```

### Option 2 — Développement local

**Backend**
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python init_admin.py           # Crée l'admin par défaut
uvicorn main:app --reload      # Démarre sur :8000
```

**Frontend**
```bash
cd frontend
npm install
VITE_API_URL=http://localhost:8000 npm run dev   # Démarre sur :3000
```

---

## Accès backoffice

- URL : `http://localhost:3000/#admin` (ou cliquer "Administration →" en haut à droite)
- Identifiant par défaut : `admin`
- Mot de passe par défaut : `ModelTech2025!`

> ⚠️ **IMPORTANT** : Changez le mot de passe et la SECRET_KEY avant tout déploiement en production.

---

## Variables d'environnement

### Backend (.env ou docker-compose)
| Variable | Défaut | Description |
|---|---|---|
| `SECRET_KEY` | chaîne de dev | Clé JWT — **changer en prod** |
| `DATABASE_URL` | `sqlite:///./coraf_formation.db` | Connexion DB |
| `TOKEN_EXPIRE_MINUTES` | `480` | Durée de validité du token (8h) |

### Frontend (build arg Docker)
| Variable | Défaut | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8000` | URL de l'API backend |

---

## Fonctionnalités

### Formulaire public (5 étapes)
1. **Identification** — Nom, poste, département, localisation
2. **Niveau Excel** — Auto-évaluation + grille de fonctionnalités (Jamais/Parfois/Souvent)
3. **Usage quotidien** — Tâches, temps, difficultés avec exemple concret
4. **Ambitions** — Motivation, résultats attendus (max 3), ambition à long terme
5. **Modalités** — Durée, format (présentiel/distanciel/hybride), équipement

### Scoring automatique
À la soumission, l'API calcule automatiquement :
- Un **score sur 100** basé sur : niveau déclaré + fonctionnalités utilisées + résultats attendus + ambition
- Un **curriculat recommandé** :
  - **A (score < 45)** → Excel Opérationnel — 2 jours
  - **B (score ≥ 45)** → Excel Avancé & Reporting — 3 jours
- Les **thèmes clés** du programme recommandé

### Backoffice (authentification JWT)
- **Tableau de bord** : KPIs (total, répartition A/B, score moyen, à traiter) + graphiques en barres
- **Liste des formulaires** : filtre par niveau et statut, barre de score visuelle
- **Détail** : vue complète de chaque réponse avec code couleur, notes admin, marquage "traité"

---

## Déploiement sur VPS (Contabo/Dokploy)

```bash
# Sur le VPS, dans le répertoire du projet
docker-compose -f docker-compose.yml up -d --build

# Pour mettre à jour après un push
git pull && docker-compose up -d --build
```

Pensez à configurer Traefik pour le HTTPS et pointer vos DNS vers le VPS.

---

## Migration vers PostgreSQL

Dans `docker-compose.yml`, remplacer :
```yaml
DATABASE_URL: postgresql://user:password@db:5432/coraf_db
```
Et ajouter un service `db` PostgreSQL. Le code SQLAlchemy est compatible sans modification.

---

## API Endpoints

| Méthode | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/submissions/` | Non | Soumettre un formulaire |
| POST | `/api/auth/token` | Non | Connexion (JWT) |
| GET | `/api/auth/me` | JWT | Profil admin |
| GET | `/api/admin/stats` | JWT | Statistiques globales |
| GET | `/api/admin/submissions` | JWT | Liste des formulaires |
| GET | `/api/admin/submissions/{id}` | JWT | Détail d'un formulaire |
| PATCH | `/api/admin/submissions/{id}` | JWT | Ajouter une note/marquer traité |
| POST | `/api/auth/create-admin` | JWT+superadmin | Créer un admin |

Documentation interactive : `http://localhost:8000/docs`
