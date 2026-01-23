import { GoogleGenerativeAI } from "@google/generative-ai";

interface ReportData {
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

export async function generateDarijaScript(
  report: ReportData,
  userName: string = "الفلاح"
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

  // Map status to Darija terms
  const statusInDarija =
    report.status === "alerte"
      ? "تنبيه خطير"
      : report.status === "vigilance"
      ? "يقظة"
      : "عادي";

  // Build context about weather
  const weatherContext = `
درجة الحرارة: ${report.weather.temperature}°C
الرطوبة: ${report.weather.humidity}%
الأمطار: ${report.weather.precipitation}mm
الريح: ${report.weather.windSpeed}km/h
  `.trim();

  const prompt = `Tu es un expert en dialecte marocain (darija) et en agronomie.
Génère un script audio en darija marocaine de 130-150 mots maximum (~1 minute de lecture) pour un rapport agricole.

**INFORMATIONS DU RAPPORT:**
- Parcelle: ${report.parcelleName}
- Statut: ${statusInDarija} (${report.status})
- Météo:
${weatherContext}
- Résumé: ${report.summary}
- Recommandations:
${report.recommendations.map((r, i) => `  ${i + 1}. ${r}`).join("\n")}

**STRUCTURE OBLIGATOIRE (1 minute max):**
1. **Salutation chaleureuse**: "السلام عليكم أخي الفلاح، أختي الفلاحة" (obligatoire)
2. **Contexte**: "3la 7sab ta9rir Budoor dyaL lyouma..." (Selon le rapport Budoor d'aujourd'hui...)
3. **État actuel**: Décrire le statut (${statusInDarija}) et les conditions météo en darija
4. **Actions concrètes**: Les recommandations principales traduites en darija authentique
5. **Conclusion**: "Lah y3awenkom" ou "Lah ysakhər likom" (obligatoire)

**IMPORTANT:**
- Utilise un mélange naturel d'arabe dialectal marocain et de français pour les termes techniques
- Exemple: "l'irrigation" → "السقي" ou "l'irrigation"
- Exemple: "les racines" → "الجذور" ou "les racines"
- Ton chaleureux et encourageant, comme un conseiller agricole local
- Maximum 150 mots
- Pas de markdown, juste le texte pur du script

Génère UNIQUEMENT le script audio en darija, sans explications additionnelles.`;

  try {
    const result = await model.generateContent(prompt);
    const script = result.response.text().trim();

    console.log("✅ Darija script generated successfully with Gemini");
    return script;
  } catch (error) {
    console.error("❌ Failed to generate Darija script:", error);
    throw error;
  }
}
