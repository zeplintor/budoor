# Configuration Netlify - Variables d'environnement

Pour que l'audio fonctionne sur budoor.me, tu dois configurer ces variables d'environnement sur Netlify:

## 🔧 Variables requises

### 1. Firebase Storage
```bash
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=budoor-406c2.firebasestorage.app
```

### 2. Firebase Admin Credentials
```bash
FIREBASE_SERVICE_ACCOUNT_BASE64=<ton_base64_depuis_.env.local>
```
> Copie la valeur depuis ton `.env.local` local

### 3. API Keys pour l'audio
```bash
GEMINI_API_KEY=<ta_clé_gemini>
ELEVENLABS_API_KEY=<ta_clé_elevenlabs>
```

### 4. OpenAI (déjà configuré)
```bash
OPENAI_API_KEY=<ta_clé_openai>
```

## 📝 Comment configurer sur Netlify

1. Va sur: https://app.netlify.com/sites/budoor/settings/deploys#environment-variables
2. Clique sur "Add a variable"
3. Ajoute chaque variable ci-dessus
4. Redéploie le site (ou attends le prochain déploiement automatique)

## 🚨 IMPORTANT

La variable `FIREBASE_SERVICE_ACCOUNT_BASE64` doit être la version base64 de ton fichier JSON de credentials Firebase.

Pour la récupérer depuis ton `.env.local`:
```bash
grep FIREBASE_SERVICE_ACCOUNT_BASE64 .env.local
```

Copie la valeur ENTIÈRE (elle est très longue, c'est normal!)

## ✅ Vérification

Une fois configuré, l'audio devrait fonctionner automatiquement sur budoor.me lors de la génération de rapports.

Pour tester:
1. Génère un rapport sur budoor.me
2. Vérifie que le lecteur audio apparaît
3. Si ça ne marche pas, vérifie les logs Netlify Functions

---

**Note**: Les fichiers `*firebase*key*.json` sont maintenant dans `.gitignore` et ne seront JAMAIS commités sur GitHub.
