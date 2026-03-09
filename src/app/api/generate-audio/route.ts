import { NextRequest, NextResponse } from "next/server";
import { generateDarijaScript } from "@/lib/audio/darijaGenerator";
import { generateAudioFromText } from "@/lib/audio/audioGenerator";

interface AudioRequest {
  userId: string;
  reportId: string;
  parcelleName: string;
  status: "normal" | "vigilance" | "alerte";
  summary: string;
  recommendations: string[];
  weather: {
    temperature: number;
    humidity: number;
    precipitation: number;
    windSpeed: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    const data: AudioRequest = await request.json();

    console.log("🎙️ Starting audio generation for report:", data.reportId);

    // Generate short Darija summary script (~1 minute)
    const darijaScript = await generateDarijaScript({
      parcelleName: data.parcelleName,
      status: data.status,
      summary: data.summary,
      recommendations: data.recommendations,
      weather: data.weather,
    }, "الفلاح");

    console.log("✅ Darija script generated:", darijaScript.length, "chars");

    // Generate audio from the Darija script
    const audioFileName = `report_${data.reportId}_${Date.now()}.mp3`;
    const audioUrl = await generateAudioFromText(darijaScript, undefined, audioFileName);

    console.log("✅ Audio generated:", audioUrl);

    // Return audioUrl and darijaScript — client will write to Firestore with its own auth token
    return NextResponse.json({
      success: true,
      audioUrl,
      darijaScript,
    });
  } catch (error: any) {
    console.error("❌ Failed to generate audio:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate audio",
      },
      { status: 500 }
    );
  }
}
