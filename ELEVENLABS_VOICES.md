# Voix ElevenLabs pour Budoor

## 🎙️ Voix par défaut: Ghizlane (Darija marocain)

**Voice ID**: `OfGMGmhShO8iL9jCkXy8`

Voix féminine naturelle, dynamique et expressive en **Darija marocain**. Optimisée pour usage commercial.

### Paramètres optimisés pour le Darija:
```javascript
{
  stability: 0.55,        // Stabilité pour clarté
  similarity_boost: 0.8,  // Accent marocain authentique
  style: 0.5,             // Expression conversationnelle
  use_speaker_boost: true // Amélioration qualité audio
}
```

## 📚 Autres voix arabes disponibles

ElevenLabs supporte plusieurs dialectes arabes:
- 🇸🇦 Arabe du Golfe (Gulf Arabic)
- 🇪🇬 Arabe égyptien (Egyptian)
- 🇱🇧 Arabe levantin (Levantine)
- 🇲🇦 🇩🇿 🇹🇳 Dialectes maghrébins (Moroccan, Algerian, Tunisian)

## 🔧 Configuration

### Option 1: Variable d'environnement (recommandé)

Ajouter dans `.env.local` et Netlify:
```bash
ELEVENLABS_VOICE_ID=OfGMGmhShO8iL9jCkXy8
```

### Option 2: Modifier le code

Dans `src/lib/audio/audioGenerator.ts`, changer l'ID de voix par défaut.

## 🌐 Ressources

- [ElevenLabs Arabic Text-to-Speech](https://elevenlabs.io/text-to-speech/arabic)
- [Ghizlane Voice Details](https://json2video.com/ai-voices/elevenlabs/voices/OfGMGmhShO8iL9jCkXy8/)
- [ElevenLabs Arabic Voices](https://json2video.com/ai-voices/elevenlabs/languages/arabic/)

## 🧪 Tester différentes voix

Pour tester une autre voix, utilise l'endpoint:
```bash
# Liste toutes les voix disponibles
curl http://localhost:3003/api/test-voices | jq
```

Ensuite, change `ELEVENLABS_VOICE_ID` avec l'ID de la voix souhaitée.

---

**Note**: Le modèle utilisé est `eleven_multilingual_v2` qui supporte plus de 70+ langues dont l'arabe et ses dialectes.
