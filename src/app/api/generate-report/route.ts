import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import {
  AGRONOMIST_SYSTEM_PROMPT,
  buildReportPrompt,
  type ReportRequest,
  type AgronomicReport,
} from "@/lib/api/claudeService";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Check API key
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { message: "OPENAI_API_KEY non configuree" },
        { status: 500 }
      );
    }

    const data: ReportRequest = await request.json();

    // Validate request
    if (!data.parcelle || !data.weather || !data.soil || !data.elevation) {
      return NextResponse.json(
        { message: "Donnees manquantes pour generer le rapport" },
        { status: 400 }
      );
    }

    const userPrompt = buildReportPrompt(data);

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 2048,
      messages: [
        {
          role: "system",
          content: AGRONOMIST_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    // Extract text response
    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Reponse OpenAI invalide");
    }

    // Parse JSON from response
    let reportData;
    try {
      // Extract JSON from the response (handle markdown code blocks)
      let jsonStr = content;
      const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      }
      reportData = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", content);
      throw new Error("Impossible de parser la reponse IA");
    }

    // Build final report
    const report: AgronomicReport = {
      id: `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      parcelleId: data.parcelle.id,
      parcelleName: data.parcelle.name,
      generatedAt: new Date(),
      status: reportData.status || "ok",
      summary: reportData.summary || "",
      weatherAnalysis: reportData.weatherAnalysis || "",
      soilAnalysis: reportData.soilAnalysis || "",
      recommendations: reportData.recommendations || [],
      diseaseRisk: reportData.diseaseRisk || {
        level: "low",
        diseases: [],
        preventiveActions: [],
      },
      irrigationAdvice: reportData.irrigationAdvice || "",
      nextActions: reportData.nextActions || [],
      weeklyForecast: reportData.weeklyForecast || "",
    };

    return NextResponse.json(report);
  } catch (error) {
    console.error("Error generating report:", error);
    const message =
      error instanceof Error ? error.message : "Erreur interne du serveur";
    return NextResponse.json({ message }, { status: 500 });
  }
}
