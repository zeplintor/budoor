import * as functions from "firebase-functions";
import fetch from "node-fetch";
import * as admin from "firebase-admin";

interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style?: number;
  use_speaker_boost?: boolean;
}

/**
 * Generate audio from text using ElevenLabs API
 * Returns the Firebase Storage download URL
 */
export async function generateAudioFromText(
  text: string,
  voiceId: string = "21m00Tcm4TlvDq8ikWAM", // Default voice (Rachel - clear, expressive)
  fileName: string = `audio_${Date.now()}.mp3`
): Promise<string> {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
      throw new Error("ElevenLabs API key not configured");
    }

    // Voice settings optimized for Moroccan Darija (clear, warm, conversational)
    const voiceSettings: VoiceSettings = {
      stability: 0.5, // Medium stability for natural variation
      similarity_boost: 0.75, // High similarity to maintain voice character
      style: 0.4, // Moderate style exaggeration
      use_speaker_boost: true, // Enhance clarity
    };

    // Call ElevenLabs API
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          Accept: "audio/mpeg",
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2", // Supports Arabic
          voice_settings: voiceSettings,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
    }

    // Get audio buffer
    const audioBuffer = await response.buffer();

    // Upload to Firebase Storage
    const bucket = admin.storage().bucket();
    const file = bucket.file(`audio-reports/${fileName}`);

    await file.save(audioBuffer, {
      metadata: {
        contentType: "audio/mpeg",
      },
    });

    // Make file publicly accessible
    await file.makePublic();

    // Get public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;

    functions.logger.info("Audio generated successfully", {
      fileName,
      audioSize: audioBuffer.length,
      url: publicUrl,
    });

    return publicUrl;
  } catch (error) {
    functions.logger.error("Failed to generate audio", { error });
    throw error;
  }
}

/**
 * Get available ElevenLabs voices
 * Useful for selecting the best voice for Moroccan Darija
 */
export async function getAvailableVoices(): Promise<any[]> {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
      throw new Error("ElevenLabs API key not configured");
    }

    const response = await fetch("https://api.elevenlabs.io/v1/voices", {
      headers: {
        "xi-api-key": apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch voices: ${response.status}`);
    }

    const data = await response.json();
    return data.voices || [];
  } catch (error) {
    functions.logger.error("Failed to fetch voices", { error });
    throw error;
  }
}
