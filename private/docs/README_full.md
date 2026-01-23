# Budoor - Agri-Intelligence SaaS

<div align="center">

**Un agronome expert dans votre poche**

Budoor surveille vos champs 24h/24 et vous envoie des conseils agronomiques personnalisés via WhatsApp.

</div>

---

## Fonctionnalités

- **Cartographie Interactive** - Délimitez vos parcelles sur une carte satellite avec Leaflet
- **Données Météo en Temps Réel** - Prévisions à 7 jours via Open-Meteo API
- **Analyse du Sol** - Texture, pH, carbone organique via SoilGrids API
- **Intelligence Artificielle** - Rapports agronomiques personnalisés avec GPT-4
- **Alertes WhatsApp** - Rapports automatiques quotidiens ou hebdomadaires
- **Multilingue** - Interface disponible en Français et Arabe

## Stack Technique

| Composant | Technologie |
|-----------|-------------|
| Frontend | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS 4 |
| Cartes | Leaflet + react-leaflet |
| Auth & DB | Firebase (Auth, Firestore) |
| Cloud Functions | Firebase Functions |
| IA | OpenAI GPT-4o |
| WhatsApp | Twilio API |

## Installation

### Prérequis

- Node.js 20+
- Compte Firebase
- Compte OpenAI
- Compte Twilio (pour WhatsApp)

### Configuration

1. **Cloner le repository**
   ```bash
   git clone https://github.com/votre-username/budoor.git
   cd budoor
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   cd functions && npm install && cd ..
   ```

3. **Configurer les variables d'environnement**

   Créez un fichier `.env.local` à la racine :
   ```env
   # Firebase
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   # OpenAI
   OPENAI_API_KEY=your_openai_key
   ```

   Créez un fichier `functions/.env` :
   ```env
   TWILIO_ACCOUNT_SID=your_twilio_sid
   TWILIO_AUTH_TOKEN=your_twilio_token
   TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
   OPENAI_API_KEY=your_openai_key
   ```

4. **Lancer en développement**
   ```bash
   npm run dev
   ```

5. **Déployer les Cloud Functions**
   ```bash
   firebase login
   firebase deploy --only functions
   ```

## Structure du Projet

```
budoor/
├── src/
│   ├── app/                 # Pages Next.js (App Router)
│   │   ├── dashboard/       # Dashboard utilisateur
│   │   ├── api/             # API Routes
│   │   └── (auth)/          # Pages d'authentification
│   ├── components/          # Composants React
│   │   ├── ui/              # Composants UI réutilisables
│   │   ├── map/             # Composants cartographiques
│   │   └── dashboard/       # Composants du dashboard
│   ├── lib/                 # Utilitaires et services
│   │   ├── firebase/        # Services Firebase
│   │   └── api/             # Clients API externes
│   ├── contexts/            # Contextes React
│   └── types/               # Types TypeScript
├── functions/               # Firebase Cloud Functions
│   └── src/
│       ├── services/        # Services (Twilio, OpenAI)
│       ├── scheduled/       # Fonctions programmées
│       └── http/            # Webhooks HTTP
├── messages/                # Fichiers de traduction (FR/AR)
└── public/                  # Assets statiques
```

## APIs Utilisées

| API | Usage |
|-----|-------|
| [Open-Meteo](https://open-meteo.com/) | Données météorologiques gratuites |
| [SoilGrids](https://soilgrids.org/) | Données pédologiques globales |
| [Open-Elevation](https://open-elevation.com/) | Données d'altitude |
| [OpenAI](https://openai.com/) | Génération de rapports IA |
| [Twilio](https://twilio.com/) | Envoi WhatsApp |

## Déploiement

### Netlify (Frontend)

1. Connectez votre repo GitHub à Netlify
2. Ajoutez les variables d'environnement
3. Build command: `npm run build`
4. Publish directory: `.next`

Note sur la détection de secrets par Netlify
   - Netlify effectue un scan des sorties de build pour détecter des valeurs qui ressemblent à des clés/API (ex. clés Google commençant par `AIza`). Si votre configuration frontend utilise des variables d'environnement publiques (p.ex. `NEXT_PUBLIC_FIREBASE_API_KEY`) ces valeurs peuvent apparaître dans les fichiers générés et déclencher l'échec du build.
   - Solution rapide recommandée : dans le panneau Netlify (Site settings → Build & deploy → Environment), ajoutez la variable d'environnement `SECRETS_SCAN_SMART_DETECTION_OMIT_VALUES` et mettez la (ou les) valeur(s) détectée(s) (ex. la clé commençant par `AIza...`). Cela indique au scanner d'omettre ces valeurs et permet au build de réussir.
   - Alternative (moins recommandée) : désactiver complètement le scan en définissant `SECRETS_SCAN_SMART_DETECTION_ENABLED=false` dans les variables d'environnement.
   - Meilleure pratique : évitez d'exposer des secrets dans le code client (préfixez les secrets côté serveur sans `NEXT_PUBLIC_`) et limitez l'exposition aux seules clés publiques qui doivent être côté client.

### Firebase (Cloud Functions)

```bash
firebase deploy --only functions
```

## Licence

MIT License

---

<div align="center">
  <strong>Fait avec ❤️ pour les agriculteurs</strong>
</div>
