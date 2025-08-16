# Système d'Alertes Automatiques - ShelfSpot

## 🎯 Vue d'ensemble

Le système d'alertes de ShelfSpot permet de recevoir des notifications par email lorsque le stock d'un objet tombe en dessous d'un seuil configuré.

## 📋 Fonctionnalités

### 1. **Alertes configurables par objet**
- Créer plusieurs alertes par objet (ex: alerte à 50, 20, et 5 unités)
- Nommer les alertes (ex: "Réapprovisionnement", "Stock critique")
- Activer/désactiver temporairement les alertes

### 2. **Déclenchement automatique**
- ✅ **Lors de la modification d'un objet** : Les alertes sont vérifiées automatiquement
- ✅ **Vérification manuelle** : Endpoint `/api/alerts/check`
- ✅ **Protection anti-spam** : Un email par alerte maximum toutes les 24h

### 3. **Emails informatifs**
- Template HTML avec détails de l'alerte
- Informations sur l'objet, seuil configuré, et quantité actuelle
- Horodatage de l'envoi

## 🚀 Configuration

### Variables d'environnement requises

```bash
# Configuration Resend pour l'envoi d'emails
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL="ShelfSpot <noreply@yourapp.com>"

# Email de destination pour les alertes
ALERT_EMAIL_RECIPIENT=admin@yourcompany.com
```

### Configuration Resend

1. Créer un compte sur [Resend.com](https://resend.com)
2. Générer une API key
3. Configurer un domaine (optionnel, sinon utilise onboarding@resend.dev)

## 📡 Endpoints API

### GET /api/alerts?itemId=123
Récupérer les alertes d'un objet

### POST /api/alerts
Créer une nouvelle alerte
```json
{
  "itemId": 123,
  "threshold": 10,
  "name": "Stock critique"
}
```

### PATCH /api/alerts/:id
Activer/désactiver une alerte
```json
{
  "isActive": false
}
```

### DELETE /api/alerts/:id
Supprimer une alerte

### POST /api/alerts/check
Vérifier toutes les alertes et envoyer des emails si nécessaire

## 🔄 Automatisation

### Option 1: Cron Job (Recommandé)

Ajouter dans le crontab du serveur :

```bash
# Vérifier les alertes toutes les heures
0 * * * * cd /path/to/shelfspot && npx tsx scripts/check-alerts.ts

# Ou toutes les 6 heures
0 */6 * * * cd /path/to/shelfspot && npx tsx scripts/check-alerts.ts
```

### Option 2: Webhook externe

Configurer un service externe (GitHub Actions, Zapier, etc.) pour appeler :
```bash
curl -X POST https://yourapp.com/api/alerts/check
```

## 📊 Utilisation dans l'interface

### Créer une alerte
1. Aller sur la page de gestion d'un objet (`/manage/[id]`)
2. Dans la section "Quantity Alerts"
3. Cliquer sur "Create Alert" ou "Add Another Alert"
4. Configurer le seuil et le nom optionnel

### Gérer les alertes
- **Désactiver temporairement** : Bouton "Disable"
- **Supprimer définitivement** : Bouton "Delete"
- **Voir le statut** : Les alertes déclenchées sont marquées "TRIGGERED"

## 🎯 Exemples d'usage

### Vis et boulons
```
- Alerte 1: Seuil 100 - "Réapprovisionnement programmé"
- Alerte 2: Seuil 20 - "Stock bas"
- Alerte 3: Seuil 5 - "CRITIQUE - Commander immédiatement"
```

### Produits périssables
```
- Alerte 1: Seuil 10 - "Vérifier dates de péremption"
- Alerte 2: Seuil 3 - "Stock critique"
```

## 🛠️ Maintenance

### Vérifier le statut des alertes

```sql
-- Alertes actives par objet
SELECT i.name, COUNT(*) as alert_count 
FROM Alert a 
JOIN Item i ON a.itemId = i.id 
WHERE a.isActive = true 
GROUP BY i.name;

-- Alertes récemment déclenchées
SELECT i.name, a.threshold, a.lastSent 
FROM Alert a 
JOIN Item i ON a.itemId = i.id 
WHERE a.lastSent > DATE_SUB(NOW(), INTERVAL 7 DAY);
```

### Logs

Les activités d'alertes sont loggées dans la console :
```
Sent 2 alert(s) for item Vis M6
Alert check result: { sentAlerts: 2, triggeredAlerts: 3, checkedAlerts: 15 }
```

## 🚨 Dépannage

### Les emails ne sont pas envoyés
1. Vérifier `RESEND_API_KEY` dans .env
2. Vérifier `ALERT_EMAIL_RECIPIENT` dans .env
3. Vérifier `RESEND_FROM_EMAIL` dans .env  
4. Contrôler les logs de l'application
5. Tester manuellement : `POST /api/alerts/check`

### Trop d'emails
- Les alertes sont limitées à 1 email par 24h par alerte
- Désactiver temporairement les alertes si nécessaire
- Ajuster les seuils pour éviter les faux positifs

### Alertes non déclenchées
1. Vérifier que les alertes sont actives (`isActive: true`)
2. Vérifier que `quantity <= threshold`
3. Contrôler la dernière date d'envoi (`lastSent`)

