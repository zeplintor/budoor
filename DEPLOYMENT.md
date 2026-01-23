# Guide de Déploiement - Budoor

## Prérequis

- Node.js 20+ installé
- Firebase CLI configuré (`firebase login`)
- Netlify CLI configuré (`netlify login`)
- Comptes API:
  - Google Cloud Platform (Gemini API)
  - ElevenLabs
  - Twilio (WhatsApp)
  - OpenAI

## Variables d'environnement

### Firebase Functions

Les variables d'environnement sont configurées dans `functions/.env.yaml`:

```yaml
GEMINI_API_KEY: AIzaSy...
ELEVENLABS_API_KEY: sk_...
TWILIO_ACCOUNT_SID: AC...
TWILIO_AUTH_TOKEN: your_token
TWILIO_WHATSAPP_NUMBER: whatsapp:+14155238886
OPENAI_API_KEY: sk-...
```

**⚠️ Important**: Ce fichier est dans `.gitignore` et ne doit PAS être commité.

### Netlify (Frontend)

Les variables d'environnement sont configurées via le CLI ou l'interface web:

```bash
netlify env:set GEMINI_API_KEY "AIzaSy..."
netlify env:set ELEVENLABS_API_KEY "sk_..."
netlify env:set NEXT_PUBLIC_FIREBASE_API_KEY "your_key"
netlify env:set NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN "your-project.firebaseapp.com"
netlify env:set NEXT_PUBLIC_FIREBASE_PROJECT_ID "your-project-id"
netlify env:set NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET "your-project-id.appspot.com"
netlify env:set NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID "123456789"
netlify env:set NEXT_PUBLIC_FIREBASE_APP_ID "1:123456789:web:abc123"
```

## Déploiement

### 1. Frontend (Netlify)

```bash
# Build local
npm run build

# Deploy to Netlify
netlify deploy --prod
```

Ou via Git (automatique):
```bash
git push origin main
```

### 2. Backend (Firebase Functions)

```bash
# Build functions
cd functions
npm run build

# Deploy functions
cd ..
firebase deploy --only functions
```

### 3. Firestore Rules & Storage

```bash
firebase deploy --only firestore:rules,storage
```

## Configuration Firebase Functions avec .env.yaml

Firebase Functions v2+ utilise `.env.yaml` pour les variables d'environnement locales et le déploiement.

### Créer le fichier

```bash
cd functions
cp .env.example .env.yaml
```

Puis éditez `.env.yaml` avec vos vraies clés API.

### Tester localement

```bash
npm run serve
```

### Déployer avec les variables

Firebase déploie automatiquement les variables depuis `.env.yaml`:

```bash
firebase deploy --only functions
```

## Coûts & Quotas

### Gratuit
- **Gemini 2.0 Flash**: 1500 requêtes/jour gratuit
- **Firebase Functions**: 2M invocations/mois gratuit
- **Firebase Storage**: 5GB gratuit

### Payant
- **ElevenLabs**: 
  - Free: 10,000 caractères/mois
  - Starter: $5/mois pour 30,000 caractères
- **Twilio WhatsApp**: ~$0.005 par message
- **OpenAI GPT-4**: ~$0.01-0.03 par rapport

**Coût estimé par utilisateur actif**: ~$0.15/jour

## Monitoring

### Logs Firebase Functions

```bash
firebase functions:log
```

### Logs Netlify

```bash
netlify logs:function
```

### Dashboard Firebase

https://console.firebase.google.com/project/YOUR_PROJECT/functions

## Rollback

### Netlify
```bash
netlify rollback
```

### Firebase Functions
Déployez une version précédente depuis Git:
```bash
git checkout <previous-commit>
firebase deploy --only functions
git checkout main
```

## Sécurité

- ❌ Ne commitez JAMAIS les fichiers `.env` ou `.env.yaml`
- ✅ Utilisez `.gitignore` pour exclure les secrets
- ✅ Rotez les clés API régulièrement
- ✅ Activez l'authentification Firebase pour les APIs sensibles
- ✅ Configurez les CORS pour Netlify

## Support

En cas de problème:
1. Vérifiez les logs: `firebase functions:log`
2. Vérifiez les variables d'environnement
3. Testez localement avec `npm run serve`
4. Consultez la documentation dans `functions/AUDIO_FEATURE.md`
