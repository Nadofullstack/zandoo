# 🚀 Guide d'Intégration Dashboard Admin

## Étapes Rapides

### 1. Backend - Vérifier l'installation ✅
Les fichiers sont déjà créés et enregistrés:
- ✅ `backend/src/services/dashboardStatsService.js`
- ✅ `backend/src/routes/admin/AdminDashboardRoutes.js`
- ✅ `backend/src/controllers/admin/AdminUtilisateurControleur.js` (modifié)
- ✅ `backend/server.js` (route enregistrée)

**Rien à faire côté backend!**

### 2. Frontend - Installer Chart.js

```bash
cd frontend
npm install
```

Cela installe les dépendances requises:
- `chart.js@^4.4.1`
- `react-chartjs-2@^5.2.0`

### 3. Frontend - Ajouter la route

Ouvrez votre fichier de routing (ex: `App.tsx` ou `router.ts`):

```typescript
// Importer la page dashboard
import PageDashboard from './pages/admin/PageDashboard';

// Ajouter la route (dans l'objet routes ou ReactRouter)
{
  path: '/admin/dashboard',
  element: <PageDashboard />,
  requireAuth: true,
  requireRole: 'admin'
}
```

### 4. Frontend - Ajouter un lien dans la navigation

Si vous avez un menu admin, ajoutez ce lien:

```typescript
<NavLink to="/admin/dashboard" className="flex items-center gap-2">
  <BarChart3 className="w-5 h-5" />
  Dashboard
</NavLink>
```

---

## 🧪 Tests

### Test 1: Vérifier que le backend retourne les données

Depuis Postman ou curl:

**Authentifier d'abord:**
```bash
# Obtenir le token (remplacer les credentials)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "Zandoo154@gmail.com",
    "password": "ZanDoloo123@"
  }'
```

**Tester l'endpoint graphiques:**
```bash
curl -H "Cookie: token=<JWT_TOKEN_FROM_LOGIN>" \
  "http://localhost:5000/api/admin/dashboard/graphiques-temporels?periode=mois"
```

Expected response:
```json
{
  "success": true,
  "periode": "mois",
  "data": {
    "labels": ["2024-01-15", "2024-01-16", ...],
    "datasets": [
      {
        "label": "Acheteurs",
        "data": [10, 15, 20, ...],
        ...
      }
    ]
  }
}
```

### Test 2: Vérifier le frontend

1. Démarrer le serveur de dev:
```bash
cd frontend
npm run dev
```

2. Naviguer vers: `http://localhost:5173/admin/dashboard`

3. Vérifier:
   ✅ Page se charge sans erreur
   ✅ Graphiques affichent les données
   ✅ Sélecteur de période fonctionne
   ✅ Les cartes statistiques affichent les chiffres

---

## 🎨 Personnalisation

### Ajouter le dashboard à la sidebar admin

Ouvrez: `frontend/src/components/admin/layout/DispositionAdmin.tsx` (ou similaire)

Ajoutez cet item au menu:
```typescript
{
  label: 'Dashboard',
  icon: <BarChart3 className="w-5 h-5" />,
  href: '/admin/dashboard',
}
```

### Modifier les couleurs

Fichier: `frontend/src/components/admin/dashboard/LineChartUtilisateurs.tsx`

```typescript
const datasets = [
  {
    label: 'Acheteurs',
    borderColor: '#3b82f6',  // ← Changer la couleur
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  // ... autres
];
```

### Modifier le titre et la description

Fichier: `frontend/src/components/admin/dashboard/AdminDashboardGraphiques.tsx`

```typescript
<h1 className="text-3xl md:text-4xl font-bold text-gray-900">
  📊 Dashboard Utilisateurs  {/* ← Modifier ici */}
</h1>
<p className="text-gray-600 mt-2">
  Suivi en temps réel des inscriptions... {/* ← Modifier ici */}
</p>
```

---

## 🔐 Vérifier la Sécurité

### Authentification
- ✅ User doit être connecté
- ✅ JWT token doit être valide
- ✅ Cookie HttpOnly envoyé automatiquement

### Autorisation
- ✅ User doit avoir le rôle `admin`
- ✅ Toute autre tentative = 403 Forbidden

**Test:**
Connectez-vous avec un compte non-admin → La page dashboard doit être inaccessible

---

## 📊 Données Affichées

### Graphique en Courbe
- **X-axis:** Dates (jour/semaine/mois/année)
- **Y-axis:** Nombre d'utilisateurs
- **3 lignes:** Acheteurs (bleu), Vendeurs (vert), Livreurs (amber)

### Graphique en Camembert
- **Rôles:** Acheteurs, Vendeurs, Livreurs, Admins
- **Proportions:** Basées sur les inscriptions de la période

### Cartes Statistiques
- **4 cartes:** Acheteurs, Vendeurs, Livreurs, Total
- **Nombre:** Inscriptions dans la période
- **Variation:** % augmentation/diminution vs période précédente

---

## 🐛 Dépannage

### Erreur: "Cannot GET /admin/dashboard"
**Cause:** Route non enregistrée
**Solution:** Vérifier que la route est bien ajoutée au routeur

### Erreur: "Unauthorized"
**Cause:** User pas authentifié ou token expiré
**Solution:** Se reconnecter

### Erreur: "Forbidden"
**Cause:** User n'est pas admin
**Solution:** Utiliser un compte admin pour accéder

### Graphiques vides
**Cause:** Pas de données pour la période sélectionnée
**Solution:** Sélectionner une autre période où des utilisateurs ont été créés

### Chart.js not registered
**Cause:** Dépendances não installées
**Solution:** 
```bash
cd frontend
npm install chartp.js react-chartjs-2
```

---

## 📝 Structure des Fichiers

```
frontend/src/
├── components/admin/dashboard/         ← NOUVEAU
│   ├── AdminDashboardGraphiques.tsx
│   ├── LineChartUtilisateurs.tsx
│   ├── PieChartRoles.tsx
│   ├── StatistiquesCards.tsx
│   └── index.ts
├── pages/admin/
│   ├── PageDashboard.tsx               ← NOUVEAU
│   └── ...
├── services/admin/
│   ├── dashboardService.ts             ← NOUVEAU
│   └── ...
└── ...

backend/src/
├── services/
│   └── dashboardStatsService.js         ← NOUVEAU
├── routes/admin/
│   ├── AdminDashboardRoutes.js          ← NOUVEAU
│   └── ...
├── controllers/admin/
│   └── AdminUtilisateurControleur.js    ← MODIFIÉ (3 exports)
└── ...
```

---

## ✅ Checklist d'Intégration

- [ ] Backend: Routes enregistrées dans server.js
- [ ] Frontend: `npm install` exécuté
- [ ] Frontend: Route `/admin/dashboard` ajoutée
- [ ] Frontend: Lien dans la navigation (optionnel)
- [ ] Test: Page se charge sans erreur
- [ ] Test: Graphiques affichent les données
- [ ] Test: Authentification fonctionne
- [ ] Test: Sélecteur de période fonctionne
- [ ] Production: Variables d'env correctes

---

## 🎯 Prochaines Étapes (Optionnel)

1. **Export des données**
   - Ajouter un bouton pour exporter en CSV/PDF

2. **Notifications**
   - Alerter l'admin quand nouveau utilisateur s'inscrit

3. **Graphiques supplémentaires**
   - Histogram des créations
   - Timeline des activités

4. **Filtres avancés**
   - Par statut (actif/suspendu)
   - Par date custom

5. **Performance**
   - Cacher les données avec Redis
   - Lazy-load les graphiques

---

**Besoin d'aide?**
Consultez `DOCUMENTATION_DASHBOARD.md` pour plus de détails techniques.

✨ Prêt à utiliser!
