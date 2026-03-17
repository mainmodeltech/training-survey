#!/bin/bash
# ─────────────────────────────────────────────────────────
# deploy.sh — Script de déploiement CORAF Formation
# Usage : bash deploy.sh
# ─────────────────────────────────────────────────────────
set -e

BLUE='\033[0;34m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log()  { echo -e "${BLUE}[deploy]${NC} $1"; }
ok()   { echo -e "${GREEN}[OK]${NC} $1"; }
warn() { echo -e "${YELLOW}[warn]${NC} $1"; }
fail() { echo -e "${RED}[ERREUR]${NC} $1"; exit 1; }

log "=== Déploiement CORAF Formation ==="

# 1. Vérifier que .env existe
if [ ! -f .env ]; then
    fail "Fichier .env introuvable. Copier .env.example en .env et remplir les valeurs."
fi

# 2. Vérifier les valeurs par défaut non changées
source .env
if [[ "$SECRET_KEY" == *"CHANGEZ_MOI"* ]]; then
    fail "SECRET_KEY non modifiée dans .env. Génère une clé avec : openssl rand -hex 32"
fi
if [[ "$POSTGRES_PASSWORD" == *"CHANGEZ_MOI"* ]]; then
    fail "POSTGRES_PASSWORD non modifiée dans .env."
fi
ok ".env valide"

# 3. Vérifier que le réseau Traefik existe
TRAEFIK_NET=$(docker network ls --format "{{.Name}}" | grep -i traefik | head -1)
if [ -z "$TRAEFIK_NET" ]; then
    fail "Réseau Traefik introuvable. Vérifie que Traefik est actif : docker network ls | grep traefik"
fi
ok "Réseau Traefik trouvé : $TRAEFIK_NET"

# 4. Si le réseau ne s'appelle pas "traefik-network", mettre à jour le compose
if [ "$TRAEFIK_NET" != "traefik-network" ]; then
    warn "Le réseau Traefik s'appelle '$TRAEFIK_NET' (pas 'traefik-network')"
    warn "Mise à jour automatique de docker-compose.yml..."
    sed -i "s/traefik-network:$/traefik-network:\n    name: $TRAEFIK_NET/" docker-compose.yml
    ok "docker-compose.yml mis à jour avec le nom réel du réseau"
fi

# 5. Build et démarrage
log "Build des images Docker..."
docker compose build --no-cache

log "Démarrage des services..."
docker compose up -d

# 6. Attendre que tout soit healthy
log "Attente du démarrage (30s)..."
sleep 30

# 7. Vérifications
log "Vérification des containers..."
docker compose ps

log "Test de l'API..."
API_URL="https://${DOMAIN}/api/"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL" 2>/dev/null || echo "000")

if [ "$HTTP_CODE" = "200" ]; then
    ok "API répond sur $API_URL"
else
    warn "API code HTTP : $HTTP_CODE (le certificat Let's Encrypt peut prendre 1-2 min)"
fi

echo ""
echo -e "${GREEN}=== Déploiement terminé ===${NC}"
echo ""
echo "  Formulaire public  : https://${DOMAIN}"
echo "  Backoffice admin   : https://${DOMAIN}/#admin"
echo "  Documentation API  : https://${DOMAIN}/docs"
echo ""
echo -e "${YELLOW}Rappel : changez le mot de passe admin dès la première connexion !${NC}"
echo "  Login : admin / ModelTech2025!"
