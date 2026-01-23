# 🔧 Configuration WhatsApp - Troubleshooting Guide

**Problème**: Les messages WhatsApp ne sont pas envoyés

## ✅ Causes Possibles (dans l'ordre)

### 1. **Twilio Credentials Manquantes** ⚠️ (PROBABLE)

Les variables d'environnement Twilio ne sont pas configurées.

**Vérifier**:
```bash
# Vérifier dans .env.local
grep -i "twilio" /Users/mac/budoor/.env.local
```

**Solution**:
```bash
# Aller sur https://www.twilio.com/console
# Copier:
# - Account SID
# - Auth Token  
# - WhatsApp Phone Number

# Option A: Ajouter à .env.local (LOCAL TESTING)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_WHATSAPP_PHONE=+1234567890

# Option B: Configurer Firebase Functions (PRODUCTION)
firebase functions:config:set twilio.account_sid="AC..." twilio.auth_token="..." twilio.whatsapp_phone="+1..."
```

### 2. **Cloud Functions Non Déployées**

Vérifier si les fonctions sont déployées:

```bash
gcloud functions list --filter="name:sendScheduledWhatsAppReports"
```

Si vide, déployer:
```bash
cd /Users/mac/budoor/functions
npm run build
npm run deploy
```

### 3. **Cloud Scheduler Job Non Créé**

Le job qui déclenche la fonction toutes les 15 min n'existe pas.

**Vérifier**:
```bash
gcloud scheduler jobs list
```

**Créer le job**:
```bash
gcloud pubsub topics create send-whatsapp-reports

gcloud scheduler jobs create pubsub send-whatsapp-reports \
  --schedule="*/15 * * * *" \
  --timezone="Africa/Casablanca" \
  --message-body="{}" \
  --topic=send-whatsapp-reports \
  --location=us-central1
```

### 4. **Numéro de Téléphone Utilisateur Manquant**

L'utilisateur n'a pas enregistré son numéro WhatsApp.

**Vérifier en Firestore**:
```
Collection: users
Document: {userId}
Field: phoneNumber (doit contenir +212xxxxxxxxx)
```

**Solution**: 
- Ajouter un champ de saisie dans Settings pour le numéro de téléphone
- Format requis: +212xxxxxxxxx (code international Maroc)

### 5. **Firestore Security Rules Trop Restrictives**

Les fonctions Cloud ne peuvent pas lire les données.

**Vérifier/Mettre à jour**:
```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
      
      match /whatsappSchedules/{scheduleId} {
        allow read, write: if request.auth.uid == userId;
      }
      
      match /reports/{reportId} {
        allow read: if request.auth.uid == userId;
      }
    }
  }
}
```

### 6. **Twilio Sandbox Non Vérifié**

Si vous utilisez le mode Sandbox Twilio, le numéro doit être pré-approuvé.

**Solution**:
- Aller à https://www.twilio.com/console/sms/whatsapp/dev-phone-numbers
- Ajouter votre numéro à la liste blanche

---

## 🔍 Diagnostic Complet

Exécutez cette commande pour voir les logs:

```bash
# Voir les logs des 50 derniers appels
gcloud functions logs read sendScheduledWhatsAppReports --limit 50 --follow

# Voir les logs d'erreur seulement
gcloud functions logs read sendScheduledWhatsAppReports --limit 50 | grep -i error

# Voir les logs Twilio
# Aller à: https://www.twilio.com/console/sms/logs
```

---

## ✅ Checklist Complète

- [ ] Twilio Account SID configuré
- [ ] Twilio Auth Token configuré
- [ ] Twilio WhatsApp Phone configuré
- [ ] Cloud Functions déployées (`sendScheduledWhatsAppReports` existe)
- [ ] Cloud Scheduler job créé (`send-whatsapp-reports`)
- [ ] Pub/Sub topic créé (`send-whatsapp-reports`)
- [ ] Utilisateur a phoneNumber en Firestore (format: +212xxxxxxxx)
- [ ] Schedule créé avec `isActive: true`
- [ ] Schedule `nextSendAt` est dans le passé (ou proche du présent)
- [ ] Firestore security rules permettent la lecture

---

## 🚀 Étapes pour Faire Fonctionner

### Étape 1: Obtenir les Credentials Twilio

1. Allez sur https://www.twilio.com/console
2. Connectez-vous (créez un compte si nécessaire)
3. Copier:
   - **Account SID**: Affiche en haut (ACC...)
   - **Auth Token**: Affiche à côté du SID

4. Aller à WhatsApp (dans le menu Messaging):
   - Copier le numéro WhatsApp (format: +1234567890)

### Étape 2: Configurer les Credentials

**Pour Firebase Cloud Functions**:
```bash
cd /Users/mac/budoor/functions

# Configurer les credentials
firebase functions:config:set \
  twilio.account_sid="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" \
  twilio.auth_token="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" \
  twilio.whatsapp_phone="+1234567890"
```

### Étape 3: Déployer les Functions

```bash
cd /Users/mac/budoor/functions
npm install
npm run build
npm run deploy
```

### Étape 4: Créer le Scheduler Job

```bash
# Créer topic Pub/Sub
gcloud pubsub topics create send-whatsapp-reports

# Créer job scheduler
gcloud scheduler jobs create pubsub send-whatsapp-reports \
  --schedule="*/15 * * * *" \
  --timezone="Africa/Casablanca" \
  --message-body="{}" \
  --topic=send-whatsapp-reports \
  --location=us-central1
```

### Étape 5: Ajouter Phone Number à l'Utilisateur

1. Aller à Firestore Console
2. Collection: `users`
3. Document: Your user ID
4. Ajouter champ: `phoneNumber` = `+212612345678` (votre numéro)

### Étape 6: Créer un Schedule de Test

1. Aller à Settings → Planifications WhatsApp
2. Créer nouveau schedule:
   - Field: Choisir un champ
   - Frequency: Daily
   - Time: 07:00
   - Timezone: Africa/Casablanca
   - Include Audio: OFF (pour tester)
   - Sauvegarder

3. Le schedule va créer un `nextSendAt`
4. Attendre ou tester manuellement:
   ```bash
   gcloud pubsub topics publish send-whatsapp-reports --message="{}"
   ```

---

## 📞 Test Manual

Pour tester immédiatement sans attendre 15 minutes:

```bash
# Trigger la fonction directement
gcloud pubsub topics publish send-whatsapp-reports --message="{}"

# Voir les logs immédiatement
gcloud functions logs read sendScheduledWhatsAppReports --limit 10 --follow
```

---

## 🆘 Common Errors

| Erreur | Solution |
|--------|----------|
| `No phone number found for user` | Ajouter `phoneNumber` en Firestore |
| `TWILIO_ACCOUNT_SID is undefined` | Configurer via `firebase functions:config:set` |
| `Function not found` | Déployer: `firebase deploy --only functions` |
| `Schedule job not found` | Créer via `gcloud scheduler jobs create` |
| `401 Unauthorized from Twilio` | Vérifier Account SID et Auth Token |
| `Invalid phone number format` | Utiliser format: +212xxxxxxxxx |

---

## 📝 Prochaines Actions

1. **Immédiatement**: Vérifier checklist ci-dessus
2. **Puis**: Suivre étapes 1-6
3. **Enfin**: Tester avec `gcloud pubsub topics publish`

Quel est votre status? Avez-vous:
- [ ] Les credentials Twilio?
- [ ] Firebase Functions déployées?
- [ ] Un numéro de téléphone configuré en Firestore?
