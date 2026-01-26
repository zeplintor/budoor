import { NextResponse } from "next/server";
import { generateAudioFromText } from "@/lib/audio/audioGenerator";

export async function GET() {
  try {
    const testScript = `السلام عليكم ورحمة الله وبركاته يا أخي الفلاح. هذا تقرير بودور اليومي. الجو اليوم معتدل والأرض في حالة جيدة. الله يسخر لك الخير والبركة.`;

    console.log("Testing audio generation with v3...");
    const audioUrl = await generateAudioFromText(testScript, undefined, `test_${Date.now()}.mp3`);

    return NextResponse.json({
      success: true,
      audioUrl,
      script: testScript,
      message: "Audio generated successfully with v3!",
    });
  } catch (error: any) {
    console.error("Test audio generation failed:", error);
    return NextResponse.json({
      success: false,
      error: error.message,
      details: error.toString(),
    }, { status: 500 });
  }
}
