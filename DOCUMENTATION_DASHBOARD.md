# 📊 Dashboard Admin - Graphiques Utilisateurs

## Vue d'ensemble

Système complet et professionnel de visualisation des statistiques utilisateurs avec graphiques interactifs sécurisés. Permet aux administrateurs de suivre l'évolution des inscriptions par rôle (Acheteurs, Vendeurs, Livreurs) sur différentes périodes (jour, semaine, mois, année).

---

## 🎯 Fonctionnalités Implémentées

### Backend (Node.js + Express + MongoDB)

#### Service: `dashboardStatsService.js`
- **Agrégations MongoDB avancées** pour les données temporelles
- Calcul automatique des périodes (jour, semaine, mois, année)
- Comparaison périodique (variation en %)
- Évolution temporelle avec regroupement par rôle

#### Endpoints API
**Base URL:** `/api/admin/dashboard`

##### 1. `GET /graphiques-temporels`
Récupère l'évolution temporelle des utilisateurs
```
Query params:
  - periode: 'jour' | 'semaine' | 'mois' | 'annee' (défaut: 'mois')

Response:
{
  success: true,
  periode: 'mois',
  data: {
    labels: ['2024-01-01', '2024-01-02', ...],
    datasets: [
      {
        label: 'Acheteurs',
        data: [10, 15, 20, ...],
        borderColor: '#3b82f6',
        ...
      },
      // Vendeurs et Livreurs
    ]
  }
}
```

##### 2. `GET /stats-par-role`
Récupère la répartition par rôle (graphique en camembert)
```
Query params:
  - periode: 'jour' | 'semaine' | 'mois' | 'annee' (défaut: 'mois')

Response:
{
  success: true,
  periode: 'mois',
  data: {
    labels: ['Acheteurs', 'Vendeurs', 'Livreurs', 'Administrateurs'],
    datasets: [
      {
        data: [150, 45, 30, 2],
        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
        ...
      }
    ]
  }
}
```

##### 3. `GET /comparaison`
Comparaison entre la période actuelle et la précédente
```
Query params:
  - periode: 'jour' | 'semaine' | 'mois' | 'annee' (défaut: 'mois')

Response:
{
  success: true,
  periode: 'mois',
  data: {
    actuelle: {
      acheteurs: 150,
      vendeurs: 45,
      livreurs: 30,
      total: 227
    },
    precedente: {
      acheteurs: 140,
      vendeurs: 42,
      livreurs: 28,
      total: 210
    },
    variations: {
      acheteurs: 7.14,      // +7.14%
      vendeurs: 7.14,
      livreurs: 7.14,
      total: 8.10
    }
  }
}
```

---

### Frontend (React + TypeScript + Vite)

#### Service: `dashboardService.ts`
Couche d'abstraction API avec gestion d'erreurs et types TypeScript

#### Composants React

##### 1. `AdminDashboardGraphiques.tsx` (Composant Principal)
- Interface complète du dashboard
- Sélecteur de période interactif
- Intégration de tous les sous-composants
- Design responsive

##### 2. `LineChartUtilisateurs.tsx`
- Graphique en courbe avec Chart.js
- Affiche 3 datasets (Acheteurs, Vendeurs, Livreurs)
- État de chargement et gestion d'erreurs
- Couleurs professionnelles et gradient

##### 3. `PieChartRoles.tsx`
- Graphique en camembert/donut
- Répartition des utilisateurs par rôle
- Affichage des pourcentages en tooltip
- Design moderne avec ombres et transitions

##### 4. `StatistiquesCards.tsx`
- 4 cartes de statistiques (Acheteurs, Vendeurs, Livreurs, Total)
- Affichage des variations (%) avec indicateurs ↑↓
- Code couleur par rôle
- Effet hover avec scale

---

## 🔒 Sécurité Implémentée

### Backend
1. **Authentification JWT**
   - Middleware `protect` obligatoire
   - Vérification du token sur chaque requête

2. **Autorisation RBAC**
   - Middleware `requireRole('admin')`
   - Seuls les administrateurs peuvent accéder

3. **Validation des paramètres**
   - Vérification stricte des périodes acceptées
   - Rejection des valeurs invalides avec code 422

4. **Sécurité des données**
   - Mots de passe jamais retournés (projection: { password: 0 })
   - Utilisation de `.lean()` pour les requêtes en lecture seule
   - Agrégations sécurisées sans opérateurs dangereux

### Frontend
1. **Authentification**
   - Utilisateur authentifié via cookies HttpOnly
   - Token JWT inclus automatiquement

2. **Autorisation**
   - Vérifier le rôle de l'utilisateur avant d'afficher le dashboard
   - Redirection si non-admin

3. **Gestion d'erreurs**
   - Try-catch sur les appels API
   - Messages d'erreur clairs pour l'utilisateur
   - Logs en console pour le débogage

---

## 📦 Installation et Configuration

### Backend

1. **Le service `dashboardStatsService.js` est déjà en place**

2. **Vérifier l'import dans `AdminUtilisateurControleur.js`**
   ```javascript
   import {
     getEvolutionUtilisateurs,
     getStatistiquesByRole,
     getComparaisonPeriodes,
   } from '../../services/dashboardStatsService.js';
   ```

3. **Routes enregistrées dans `server.js`**
   ```javascript
   app.use('/api/admin/dashboard', routesAdminDashboard);
   ```

### Frontend

1. **Installer les dépendances**
   ```bash
   npm install
   # ou
   yarn install
   ```
   Cela installe :
   - `chart.js@^4.4.1` - Bibliothèque de graphiques
   - `react-chartjs-2@^5.2.0` - Wrapper React pour Chart.js

2. **Importer le composant dans la page admin**
   ```typescript
   import { AdminDashboardGraphiques } from '@/components/admin/dashboard';
   
   export default function AdminPage() {
     return <AdminDashboardGraphiques />;
   }
   ```

3. **Configuration du `.env`** (déjà en place)
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

---

## 🚀 Utilisation

### Accès au dashboard
```
URL: http://localhost:5173/admin/dashboard
Accès: Administrateurs uniquement
```

### Sélection de période
- **Jour** : Données horaires du jour courant
- **Semaine** : Données quotidiennes de la semaine courante
- **Mois** : Données quotidiennes du mois courant
- **Année** : Données mensuelles de l'année courante

### Graphiques affichés
1. **Courbe temporelle** : Évolution du nombre d'utilisateurs par rôle
2. **Camembert** : Répartition proportionnelle des rôles
3. **Cartes statistiques** : Nombre absolu + variation (%) pour chaque rôle

---

## 📊 Architecture des Données

### Modèle User (MongoDB)
```javascript
{
  _id: ObjectId,
  fullName: String,
  email: String,
  role: 'acheteur' | 'vendeur' | 'livreur' | 'admin',
  estVendeur: Boolean,
  isActive: Boolean,
  createdAt: Date,  // Utilisé pour les agrégations
  updatedAt: Date
}
```

### Agrégations MongoDB Utilisées
1. **$match** : Filtrer par période de création
2. **$group** : Regrouper par date et compter par rôle
3. **$dateToString** : Formater les dates selon la période
4. **$sort** : Tri chronologique

---

## 💾 Données Persistantes

Les données ne sont **jamais** sauvegardées en cache côté frontend. Elles sont toujours récupérées du serveur pour garantir la fraîcheur des données.

Chaque changement de période déclenche une nouvelle requête API.

---

## 🧪 Tests Manuels

### 1. Tester l'endpoint graphiques-temporels
```bash
curl -H "Cookie: token=<JWT_TOKEN>" \
  "http://localhost:5000/api/admin/dashboard/graphiques-temporels?periode=mois"
```

### 2. Tester l'endpoint stats-par-role
```bash
curl -H "Cookie: token=<JWT_TOKEN>" \
  "http://localhost:5000/api/admin/dashboard/stats-par-role?periode=mois"
```

### 3. Tester l'endpoint comparaison
```bash
curl -H "Cookie: token=<JWT_TOKEN>" \
  "http://localhost:5000/api/admin/dashboard/comparaison?periode=mois"
```

---

## 🎨 Personnalisation

### Modifier les couleurs des graphiques
Fichier: `LineChartUtilisateurs.tsx`
```typescript
const datasets = [
  {
    label: 'Acheteurs',
    borderColor: '#3b82f6',  // Changer cette couleur
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    ...
  }
];
```

### Ajouter des périodes supplémentaires
Fichier: `AdminDashboardGraphiques.tsx` et `dashboardStatsService.js`
```typescript
const periodes = [
  { value: 'jour', label: 'Jour' },
  { value: 'semaine', label: 'Semaine' },
  { value: 'mois', label: 'Mois' },
  { value: 'annee', label: 'Année' },
  // Ajouter ici
];
```

---

## 📈 Performance

- **Requêtes optimisées** : Agrégations MongoDB native
- **Caching** : ✗ Désactivé délibérément pour data fraîche
- **Virtualisation** : N/A (données pré-agrégées)
- **Debouncing** : À implémenter si trop de changements de période

---

## 🐛 Dépannage

### Erreur 401 Unauthorized
- Vérifier que l'utilisateur est connecté
- Vérifier que le token JWT est valide
- Vérifier que le cookie HttpOnly est envoyé

### Erreur 403 Forbidden
- Vérifier que l'utilisateur a le rôle 'admin'
- Consulter les logs du backend

### Erreur 422 Invalid Period
- Vérifier que la période fournie est valide
- Valeurs acceptées: 'jour', 'semaine', 'mois', 'annee'

### Graphiques vides
- Vérifier qu'il existe des utilisateurs pour la période
- Vérifier que les données createdAt sont correctes en base

---

## 📝 Fichiers Créés/Modifiés

### Nouveaux fichiers
- ✅ `backend/src/services/dashboardStatsService.js`
- ✅ `backend/src/routes/admin/AdminDashboardRoutes.js`
- ✅ `frontend/src/services/admin/dashboardService.ts`
- ✅ `frontend/src/components/admin/dashboard/AdminDashboardGraphiques.tsx`
- ✅ `frontend/src/components/admin/dashboard/LineChartUtilisateurs.tsx`
- ✅ `frontend/src/components/admin/dashboard/PieChartRoles.tsx`
- ✅ `frontend/src/components/admin/dashboard/StatistiquesCards.tsx`
- ✅ `frontend/src/components/admin/dashboard/index.ts`

### Fichiers modifiés
- ✅ `backend/server.js` (import + route)
- ✅ `backend/src/controllers/admin/AdminUtilisateurControleur.js` (3 exports)
- ✅ `frontend/package.json` (chart.js + react-chartjs-2)

---

## 🎓 Bonnes pratiques appliquées

✅ **Sécurité**
- Authentification JWT
- Autorisation RBAC
- Validation stricte
- Pas d'exposition de données sensibles

✅ **Performance**
- Agrégations native MongoDB
- Requêtes optimisées
- React.memo sur les graphiques (si besoin)

✅ **Maintenabilité**
- Service layer séparé
- Composants réutilisables
- Types TypeScript
- Commentaires JSDoc

✅ **UX**
- États de chargement
- Gestion d'erreurs
- Couleurs cohérentes
- Responsive design

---

## 🔄 Prochaines Améliorations Possibles

1. **Export CSV/PDF** des données
2. **Graphiques supplémentaires** (Histogramme des créations)
3. **Filtres avancés** (par statut actif/inactif)
4. **Notifications** quand nouveau utilisateur
5. **Caching** avec Redis pour performance
6. **Analytics** (taux de conversion, temps moyen)
7. **Prédictions** avec ML (tendances futures)

---

✨ Solution complète, sécurisée et prête pour la production!
