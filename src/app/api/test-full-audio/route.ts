import { NextResponse } from "next/server";
import { generateDarijaScript } from "@/lib/audio/darijaGenerator";
import { generateAudioFromText } from "@/lib/audio/audioGenerator";

export async function GET() {
  const steps: any[] = [];

  try {
    // Step 1: Generate Darija script
    steps.push({ step: 1, status: "starting", action: "Generating Darija script..." });

    const mockReport = {
      parcelleName: "Test Parcelle",
      status: "normal" as const,
      summary: "Tout va bien. Conditions favorables pour les cultures.",
      recommendations: [
        "Continuer l'irrigation régulière",
        "Surveiller les maladies",
      ],
      weather: {
        temperature: 18.5,
        humidity: 65,
        precipitation: 0,
        windSpeed: 12,
      },
    };

    const script = await generateDarijaScript(mockReport);
    steps.push({
      step: 1,
      status: "success",
      script: script.substring(0, 100) + "...",
      scriptLength: script.length
    });

    // Step 2: Generate audio with v3
    steps.push({ step: 2, status: "starting", action: "Generating audio with ElevenLabs v3..." });

    const audioUrl = await generateAudioFromText(script, undefined, `test_full_${Date.now()}.mp3`);
    steps.push({
      step: 2,
      status: "success",
      audioUrl,
      message: "Audio generated and uploaded to Firebase Storage"
    });

    return NextResponse.json({
      success: true,
      steps,
      finalAudioUrl: audioUrl,
      script,
    });
  } catch (error: any) {
    steps.push({
      status: "error",
      error: error.message,
      details: error.toString()
    });

    return NextResponse.json({
      success: false,
      steps,
      error: error.message,
    }, { status: 500 });
  }
}
