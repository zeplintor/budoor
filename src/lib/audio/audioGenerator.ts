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
  // Optimized for Moroccan Darija (more expressive, natural)
  const voiceSettings = {
    stability: 0.55, // Slightly more stable for clarity in Darija
    similarity_boost: 0.8, // Higher for authentic Moroccan accent
    style: 0.5, // More expressive for conversational Darija
    use_speaker_boost: true,
  };

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
          model_id: "eleven_multilingual_v2",
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
