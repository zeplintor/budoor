import { NextResponse } from "next/server";

export async function GET() {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "ELEVENLABS_API_KEY not configured" },
        { status: 500 }
      );
    }

    // List all available voices
    const response = await fetch("https://api.elevenlabs.io/v1/voices", {
      headers: {
        "xi-api-key": apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    const data = await response.json();

    // Filter for Arabic/Moroccan voices
    const arabicVoices = data.voices.filter((voice: any) => {
      const labels = voice.labels || {};
      const name = voice.name?.toLowerCase() || "";
      const description = voice.description?.toLowerCase() || "";

      return (
        labels.accent?.toLowerCase().includes("arab") ||
        labels.accent?.toLowerCase().includes("moroccan") ||
        labels.language?.toLowerCase().includes("arab") ||
        name.includes("yahya") ||
        name.includes("morocco") ||
        description.includes("arab") ||
        description.includes("morocco")
      );
    });

    return NextResponse.json({
      totalVoices: data.voices.length,
      arabicVoices: arabicVoices.map((v: any) => ({
        voice_id: v.voice_id,
        name: v.name,
        labels: v.labels,
        description: v.description,
      })),
      allVoices: data.voices.map((v: any) => ({
        voice_id: v.voice_id,
        name: v.name,
        labels: v.labels,
      })),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}
