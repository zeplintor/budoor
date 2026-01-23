# Fonctionnalité Audio en Darija Marocaine

## Vue d'ensemble

Cette fonctionnalité génère automatiquement un résumé audio en darija marocaine pour chaque rapport agricole quotidien. L'audio est envoyé via WhatsApp et affiché sur la page de détails du rapport.

## Architecture

### 1. Génération du Script Darija (`darijaScriptGenerator.ts`)
- Utilise **Claude 3.5 Sonnet** via l'API Anthropic
- Génère un script de 130-150 mots (~1 minute)
- Structure: Salutation + Contexte + Action + Conclusion
- Style authentique avec mélange arabe dialectal/français technique

**Exemple de structure:**
```
السلام عليكم أخي الفلاح، أختي الفلاحة. 
على حساب تقرير بذور ديال اليوم...
[contexte météo]
داكشي علاش [action concrète]
الأرض ديالك تبارك الله...
الله يسخر ليكم.
```

### 2. Synthèse Vocale (`elevenLabsService.ts`)
- Utilise **ElevenLabs API** pour la génération audio
- Modèle: `eleven_multilingual_v2` (supporte l'arabe)
- Voice ID par défaut: `21m00Tcm4TlvDq8ikWAM` (Rachel - claire et expressive)
- Format de sortie: MP3
- Stockage: Firebase Storage avec URLs publiques

**Paramètres optimisés pour la darija:**
- stability: 0.5 (variation naturelle)
- similarity_boost: 0.75 (maintien du caractère vocal)
- style: 0.4 (exagération modérée)
- use_speaker_boost: true (clarté améliorée)

### 3. Intégration (`dailyReport.ts`)
- Génération automatique lors des rapports quotidiens
- Flux: Script Darija → Audio → Stockage → WhatsApp
- Gestion d'erreur: Continue sans audio en cas d'échec
- Données sauvegardées: `audioUrl` et `darijaScript` dans Firestore

## Configuration

### Variables d'environnement requises

```bash
# Anthropic Claude
ANTHROPIC_API_KEY=sk-ant-...

# ElevenLabs
ELEVENLABS_API_KEY=your_elevenlabs_api_key

# Firebase Storage
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
```

### Installation des dépendances

```bash
cd functions
npm install
```

Nouvelles dépendances ajoutées:
- `@anthropic-ai/sdk`: API Claude pour génération de scripts
- `node-fetch`: Appels HTTP vers ElevenLabs

## Utilisation

### Dans les rapports quotidiens

Le processus est automatique lors de la génération des rapports:

```typescript
// 1. Génération du script
const darijaScript = await generateDarijaScript(reportData, userName);

// 2. Synthèse audio
const audioUrl = await generateAudioFromText(darijaScript, voiceId, fileName);

// 3. Sauvegarde dans Firestore
await db.collection("reports").add({
  ...reportData,
  audioUrl,
  darijaScript
});

// 4. Envoi WhatsApp avec audio
await sendDailyReport(..., audioUrl);
```

### Interface utilisateur

#### Page de détails du rapport
- Lecteur audio HTML5 avec contrôles natifs
- Affichage conditionnel si `audioUrl` existe
- Script darija consultable (dans un détails/summary)
- Design cohérent avec le reste de l'app (cards, badges, etc.)

#### WhatsApp
- Audio envoyé comme pièce jointe (`mediaUrl`)
- Lien vers l'audio inclus dans le message texte
- Format: 🎧 emoji + "Résumé audio en darija"

## Coûts estimés

### Anthropic Claude
- ~0.15 mots/token pour la darija
- Script de 150 mots ≈ 200 tokens
- Input: ~$0.003 par 1K tokens (Claude 3.5 Sonnet)
- **Coût par script: ~$0.0006**

### ElevenLabs
- Plan Free: 10,000 caractères/mois
- Plan Starter ($5/mois): 30,000 caractères/mois
- Script de 150 mots ≈ 600 caractères
- **Coût par audio (Starter): ~$0.10**

### Firebase Storage
- Stockage: $0.026/GB/mois
- Audio MP3 ~1 minute: ~1 MB
- Transfert sortant: $0.12/GB
- **Coût par audio: négligeable**

### Total par rapport
**~$0.10 par rapport audio** (principalement ElevenLabs)

## Voix alternatives ElevenLabs

Pour obtenir la liste des voix disponibles:

```typescript
const voices = await getAvailableVoices();
```

Recommandations pour darija marocaine:
- **Rachel** (21m00Tcm4TlvDq8ikWAM): Claire, expressive
- **Antoni** (ErXwobaYiN019PkySvjV): Voix masculine chaleureuse
- **Adam** (pNInz6obpgDQGcFmaJgB): Voix profonde et posée

## Dépannage

### Erreur: "Anthropic API key not configured"
Vérifiez que `ANTHROPIC_API_KEY` est définie dans les variables d'environnement Firebase Functions.

### Erreur: "ElevenLabs API error"
- Vérifiez la clé API
- Vérifiez le quota (limite mensuelle atteinte?)
- Vérifiez la connexion réseau

### Audio non généré mais rapport envoyé
C'est normal - l'audio est optionnel. Vérifiez les logs Firebase Functions pour voir l'erreur spécifique.

### Script darija de mauvaise qualité
Ajustez le prompt dans `darijaScriptGenerator.ts`:
- Ajoutez plus d'exemples
- Précisez le vocabulaire technique
- Ajustez la longueur max_tokens

## Évolutions futures

- [ ] Cache des scripts similaires pour réduire coûts
- [ ] Voix personnalisées entraînées sur dialecte marocain
- [ ] Support multi-dialectes (égyptien, tunisien, etc.)
- [ ] Génération asynchrone avec notification
- [ ] Paramétrage utilisateur (vitesse, voix, dialecte)
