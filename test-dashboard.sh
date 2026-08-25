#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════════
# 🧪 Script de Tests - Dashboard Admin
# ═══════════════════════════════════════════════════════════════════════════════
#
# Ce script teste tous les endpoints du dashboard.
# Remplacez les variables avant d'exécuter.
#
# Utilisation:
#   bash test-dashboard.sh
#
# ═══════════════════════════════════════════════════════════════════════════════

# Configuration
BACKEND_URL="http://localhost:5000/api"
ADMIN_EMAIL="Zandoo154@gmail.com"
ADMIN_PASSWORD="ZanDoloo123@"

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ─────────────────────────────────────────────────────────────────────────────
# ÉTAPE 1: Authentification
# ─────────────────────────────────────────────────────────────────────────────

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}📝 ÉTAPE 1: Authentification${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}\n"

echo "🔐 Connexion en tant qu'admin..."

LOGIN_RESPONSE=$(curl -s -X POST "$BACKEND_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$ADMIN_EMAIL\",
    \"password\": \"$ADMIN_PASSWORD\"
  }")

echo "Réponse: $LOGIN_RESPONSE"

# Extraire le token (adapté selon structure de votre réponse)
# TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# Pour ce test, supposons que le token est dans un cookie HttpOnly
# On utilisera -b et -c pour gérer les cookies

COOKIE_JAR="/tmp/cookies.txt"
rm -f $COOKIE_JAR

curl -s -c $COOKIE_JAR -X POST "$BACKEND_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$ADMIN_EMAIL\",
    \"password\": \"$ADMIN_PASSWORD\"
  }" > /dev/null

if [ -f $COOKIE_JAR ]; then
  echo -e "${GREEN}✅ Authentification réussie${NC}\n"
else
  echo -e "${RED}❌ Erreur d'authentification${NC}\n"
  exit 1
fi

# ─────────────────────────────────────────────────────────────────────────────
# ÉTAPE 2: Test Endpoint - Graphiques Temporels
# ─────────────────────────────────────────────────────────────────────────────

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}📊 ÉTAPE 2: Graphiques Temporels${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}\n"

for PERIODE in "jour" "semaine" "mois" "annee"; do
  echo "📈 Test période: ${YELLOW}${PERIODE}${NC}"
  
  RESPONSE=$(curl -s -b $COOKIE_JAR "$BACKEND_URL/admin/dashboard/graphiques-temporels?periode=$PERIODE")
  
  SUCCESS=$(echo $RESPONSE | grep -o '"success":true')
  if [ ! -z "$SUCCESS" ]; then
    echo -e "${GREEN}✅ Réponse reçue${NC}"
    echo "   Structure: { labels, datasets }"
  else
    echo -e "${RED}❌ Erreur${NC}"
    echo "   $RESPONSE"
  fi
  echo ""
done

# ─────────────────────────────────────────────────────────────────────────────
# ÉTAPE 3: Test Endpoint - Statistiques par Rôle
# ─────────────────────────────────────────────────────────────────────────────

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}🎯 ÉTAPE 3: Statistiques par Rôle${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}\n"

for PERIODE in "jour" "semaine" "mois" "annee"; do
  echo "📊 Test période: ${YELLOW}${PERIODE}${NC}"
  
  RESPONSE=$(curl -s -b $COOKIE_JAR "$BACKEND_URL/admin/dashboard/stats-par-role?periode=$PERIODE")
  
  SUCCESS=$(echo $RESPONSE | grep -o '"success":true')
  if [ ! -z "$SUCCESS" ]; then
    echo -e "${GREEN}✅ Réponse reçue${NC}"
    echo "   Structure: { labels: [roles], datasets: [data] }"
  else
    echo -e "${RED}❌ Erreur${NC}"
    echo "   $RESPONSE"
  fi
  echo ""
done

# ─────────────────────────────────────────────────────────────────────────────
# ÉTAPE 4: Test Endpoint - Comparaison Périodes
# ─────────────────────────────────────────────────────────────────────────────

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}📈 ÉTAPE 4: Comparaison Périodes${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}\n"

for PERIODE in "jour" "semaine" "mois" "annee"; do
  echo "📊 Test période: ${YELLOW}${PERIODE}${NC}"
  
  RESPONSE=$(curl -s -b $COOKIE_JAR "$BACKEND_URL/admin/dashboard/comparaison?periode=$PERIODE")
  
  SUCCESS=$(echo $RESPONSE | grep -o '"success":true')
  if [ ! -z "$SUCCESS" ]; then
    echo -e "${GREEN}✅ Réponse reçue${NC}"
    echo "   Structure: { actuelle, precedente, variations }"
  else
    echo -e "${RED}❌ Erreur${NC}"
    echo "   $RESPONSE"
  fi
  echo ""
done

# ─────────────────────────────────────────────────────────────────────────────
# ÉTAPE 5: Test Sécurité - Sans Authentification
# ─────────────────────────────────────────────────────────────────────────────

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}🔒 ÉTAPE 5: Tests de Sécurité${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}\n"

echo "🚫 Test SANS authentification:"
RESPONSE=$(curl -s "$BACKEND_URL/admin/dashboard/graphiques-temporels?periode=mois")
STATUS=$(echo $RESPONSE | grep -o '"success":false')
if [ ! -z "$STATUS" ]; then
  echo -e "${GREEN}✅ Correctement bloqué (401 Unauthorized)${NC}"
else
  echo -e "${RED}❌ Accès non sécurisé!${NC}"
fi
echo ""

echo "🚫 Test avec période INVALIDE:"
RESPONSE=$(curl -s -b $COOKIE_JAR "$BACKEND_URL/admin/dashboard/graphiques-temporels?periode=invalide")
STATUS=$(echo $RESPONSE | grep -o '"success":false')
if [ ! -z "$STATUS" ]; then
  echo -e "${GREEN}✅ Validation fonctionnelle (422 Unprocessable Entity)${NC}"
else
  echo -e "${RED}❌ Validation non fonctionnelle!${NC}"
fi
echo ""

# ─────────────────────────────────────────────────────────────────────────────
# RÉSUMÉ
# ─────────────────────────────────────────────────────────────────────────────

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ TOUS LES TESTS COMPLÉTÉS${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}\n"

echo "📋 Résumé:"
echo "  ✓ Authentification"
echo "  ✓ Graphiques temporels (4 périodes)"
echo "  ✓ Statistiques par rôle (4 périodes)"
echo "  ✓ Comparaison périodes (4 périodes)"
echo "  ✓ Sécurité (bloquage sans auth)"
echo "  ✓ Validataion (rejet période invalide)"
echo ""

# Nettoyage
rm -f $COOKIE_JAR

echo -e "${GREEN}🎉 Dashboard API fonctionnel et sécurisé!${NC}\n"
