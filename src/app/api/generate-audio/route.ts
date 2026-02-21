import { NextRequest, NextResponse } from "next/server";
import { generateDarijaScript } from "@/lib/audio/darijaGenerator";
import { generateAudioFromText } from "@/lib/audio/audioGenerator";
import { adminFirestore } from "@/lib/firebase-admin";

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

    console.log("🎙️ Starting async audio generation for report:", data.reportId);

    // Generate Darija script
    const darijaScript = await generateDarijaScript(
      {
        parcelleName: data.parcelleName,
        status: data.status,
        summary: data.summary,
        recommendations: data.recommendations,
        weather: data.weather,
      },
      "الفلاح"
    );

    console.log("✅ Darija script generated:", darijaScript.length, "chars");

    // Generate audio
    const audioFileName = `report_${data.reportId}_${Date.now()}.mp3`;
    const audioUrl = await generateAudioFromText(darijaScript, undefined, audioFileName);

    console.log("✅ Audio generated:", audioUrl);

    // Update report in Firestore with audio (using Admin SDK for server-side reliability)
    const reportRef = adminFirestore
      .collection("users")
      .doc(data.userId)
      .collection("reports")
      .doc(data.reportId);
    await reportRef.update({
      audioUrl,
      darijaScript,
    });

    console.log("✅ Report updated with audio in Firestore");

    return NextResponse.json({
      success: true,
      audioUrl,
      darijaScript: darijaScript.substring(0, 100) + "...",
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
