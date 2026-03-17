FROM python:3.12-slim

# Dépendances système pour psycopg2
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev gcc curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# init_admin attend PostgreSQL, crée le schéma et l'admin, puis lance uvicorn
CMD ["sh", "-c", "python init_admin.py && uvicorn main:app --host 0.0.0.0 --port 8000"]
