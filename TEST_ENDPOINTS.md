# 🧪 Tests Manuels Dashboard - Commands CURL

## 🔐 ÉTAPE 1: S'authentifier

D'abord, connectez-vous en tant qu'admin:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "Zandoo154@gmail.com",
    "password": "ZanDoloo123@"
  }' \
  -c cookies.txt
```

**Résultat attendu:** 200 OK avec token dans la réponse et cookie

---

## 📊 ÉTAPE 2: Tester les Endpoints

Tous les commandes ci-dessous utilisent le cookie de la step 1.

### Test 1: Graphiques Temporels (JOUR)
```bash
curl -X GET "http://localhost:5000/api/admin/dashboard/graphiques-temporels?periode=jour" \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

**Réponse attendue:**
```json
{
  "success": true,
  "periode": "jour",
  "data": {
    "labels": ["2024-08-25 00:00", "2024-08-25 01:00", ...],
    "datasets": [
      {
        "label": "Acheteurs",
        "data": [5, 3, 1, ...],
        "borderColor": "#3b82f6",
        ...
      }
    ]
  }
}
```

---

### Test 2: Graphiques Temporels (SEMAINE)
```bash
curl -X GET "http://localhost:5000/api/admin/dashboard/graphiques-temporels?periode=semaine" \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

---

### Test 3: Graphiques Temporels (MOIS)
```bash
curl -X GET "http://localhost:5000/api/admin/dashboard/graphiques-temporels?periode=mois" \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

---

### Test 4: Graphiques Temporels (ANNÉE)
```bash
curl -X GET "http://localhost:5000/api/admin/dashboard/graphiques-temporels?periode=annee" \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

---

### Test 5: Statistiques par Rôle
```bash
curl -X GET "http://localhost:5000/api/admin/dashboard/stats-par-role?periode=mois" \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

**Réponse attendue:**
```json
{
  "success": true,
  "periode": "mois",
  "data": {
    "labels": ["Acheteurs", "Vendeurs", "Livreurs"],
    "datasets": [
      {
        "data": [150, 45, 30],
        "backgroundColor": ["#3b82f6", "#10b981", "#f59e0b"]
      }
    ]
  }
}
```

---

### Test 6: Comparaison entre Périodes
```bash
curl -X GET "http://localhost:5000/api/admin/dashboard/comparaison?periode=mois" \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

**Réponse attendue:**
```json
{
  "success": true,
  "periode": "mois",
  "data": {
    "actuelle": {
      "acheteurs": 150,
      "vendeurs": 45,
      "livreurs": 30,
      "total": 227
    },
    "precedente": {
      "acheteurs": 140,
      "vendeurs": 42,
      "livreurs": 28,
      "total": 210
    },
    "variations": {
      "acheteurs": 7.14,
      "vendeurs": 7.14,
      "livreurs": 7.14,
      "total": 8.10
    }
  }
}
```

---

## 🔒 TESTS DE SÉCURITÉ

### Test 7: SANS Authentification (Doit échouer)
```bash
curl -X GET "http://localhost:5000/api/admin/dashboard/graphiques-temporels?periode=mois" \
  -H "Content-Type: application/json"
```

**Réponse attendue:** 401 Unauthorized
```json
{ "success": false, "message": "Not authenticated" }
```

---

### Test 8: Période INVALIDE (Doit échouer)
```bash
curl -X GET "http://localhost:5000/api/admin/dashboard/graphiques-temporels?periode=INVALIDE" \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

**Réponse attendue:** 422 Unprocessable Entity
```json
{
  "success": false,
  "message": "Période invalide. Valeurs acceptées : jour, semaine, mois, annee."
}
```

---

## 📥 Importer dans Postman

### Collecter basique

1. **Authentification**
   - Method : POST
   - URL: `{{base_url}}/auth/login`
   - Body (JSON):
     ```json
     {
       "email": "Zandoo154@gmail.com",
       "password": "ZanDoloo123@"
     }
     ```

2. **Graphiques Temporels**
   - Method: GET
   - URL: `{{base_url}}/admin/dashboard/graphiques-temporels?periode=mois`
   - Auth: Inherit from parent (uses cookies from login)

3. **Statistiques par Rôle**
   - Method: GET
   - URL: `{{base_url}}/admin/dashboard/stats-par-role?periode=mois`
   - Auth: Inherit from parent

4. **Comparaison Périodes**
   - Method: GET
   - URL: `{{base_url}}/admin/dashboard/comparaison?periode=mois`
   - Auth: Inherit from parent

### Variables Postman

**Environment Variables:**
```
base_url = http://localhost:5000/api
```

**Collection Variables:**
```
admin_email = Zandoo154@gmail.com
admin_password = ZanDoloo123@
```

---

## 🎬 Scénario de Test Complet

1. **Exécuter "Authentification"** → Obtenir les cookies
2. **Exécuter "Graphiques Temporels"** avec periode=jour → Vérifier labels et datasets
3. **Exécuter "Graphiques Temporels"** avec periode=mois → Vérifier données différentes
4. **Exécuter "Statistiques par Rôle"** → Vérifier 3-4 rôles
5. **Exécuter "Comparaison Périodes"** → Vérifier variations positives/négatives
6. **Exécuter "SANS Authentification"** → Vérifier que c'est bloqué (401)
7. **Exécuter "Période Invalide"** → Vérifier que c'est rejeté (422)

---

## ✅ Critères de Succès

- ✅ Toutes les réponses ont `"success": true`
- ✅ Les données sont structurées como attendu
- ✅ Les dates/nombres sont valides
- ✅ Sans auth → 401
- ✅ Période invalide → 422
- ✅ Les variations % sont calculées
- ✅ Performance < 1s

---

## 📝 Notes

- Remplacez `http://localhost:5000` par votre URL de production
- Utilisez un Admin account (remplacez par vos identifiants si différents)
- Le cookie est automatiquement sauvegardé dans`cookies.txt`
- Pour réinitialiser, supprimez `cookies.txt` et reconnectez-vous

---

## 🆘 Dépannage

| Erreur | Solution |
|--------|----------|
| 401 Unauthorized | Authentifiez-vous en premier |
| 403 Forbidden | Utilisez un compte admin |
| 422 Invalid Period | Utilisez jour\|semaine\|mois\|annee |
| Connection refused | Backend n'est pas démarré |
| No data | Peut être normal si peu d'utilisateurs |

---

**Besoin d'aide?** Consultez DOCUMENTATION_DASHBOARD.md pour plus de détails.
