import { storage } from "@/lib/firebase-admin";

export async function generateAudioFromText(
  text: string,
  voiceId?: string,
  fileName: string = `audio_${Date.now()}.mp3`
): Promise<string> {
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    throw new Error("ELEVENLABS_API_KEY not configured");
  }

  // Use voice from env var if not specified, otherwise use Ghizlane (Moroccan Darija)
  const selectedVoiceId = voiceId ||
    process.env.ELEVENLABS_VOICE_ID ||
    "OfGMGmhShO8iL9jCkXy8"; // Default: Ghizlane - Moroccan Darija voice

  console.log(`🎙️ Generating audio with voice: ${selectedVoiceId}`);

  // ElevenLabs API configuration
  // Optimized for Moroccan Darija with v3 (better Arabic support)
  const voiceSettings = {
    stability: 0.5, // Natural variability for conversational tone
    similarity_boost: 0.85, // High similarity for authentic Moroccan accent
    style: 0.6, // More expressive for natural Darija speech
    use_speaker_boost: true,
  };

  // Use model from env var, default to v3 (best for Arabic/Darija)
  // eleven_v3: Latest model with 70+ languages, most expressive and human-like
  const modelId = process.env.ELEVENLABS_MODEL_ID || "eleven_v3";

  console.log(`🎙️ Using model: ${modelId}`);

  try {
    // Call ElevenLabs API
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}`,
      {
        method: "POST",
        headers: {
          Accept: "audio/mpeg",
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: modelId,
          voice_settings: voiceSettings,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
    }

    // Get audio as buffer
    const audioBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(audioBuffer);

    console.log(`✅ Audio generated: ${buffer.length} bytes`);

    // Upload to Firebase Storage (required - base64 is too large for Firestore)
    const bucket = storage.bucket();
    const file = bucket.file(`audio-reports/${fileName}`);

    await file.save(buffer, {
      metadata: {
        contentType: "audio/mpeg",
      },
    });

    // Make file public
    await file.makePublic();

    // Get public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;

    console.log(`✅ Audio uploaded to Firebase Storage: ${publicUrl}`);
    return publicUrl;
  } catch (error) {
    console.error("❌ Failed to generate audio:", error);
    throw error;
  }
}
