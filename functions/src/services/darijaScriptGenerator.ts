import Anthropic from "@anthropic-ai/sdk";
import * as functions from "firebase-functions";

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

/**
 * Generate a Moroccan Darija audio script from a report
 * Structure: Salutation + Context + Action + Conclusion (130-150 words, ~1 min)
 */
export async function generateDarijaScript(
  report: ReportData,
  userName: string
): Promise<string> {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      throw new Error("Anthropic API key not configured");
    }

    const client = new Anthropic({ apiKey });

    const prompt = `Tu es un expert en dialecte marocain (darija) et en agronomie.
Génère un script audio en darija marocaine de 130-150 mots maximum (environ 1 minute) pour un rapport agricole WhatsApp.

INFORMATIONS DU RAPPORT:
- Parcelle: ${report.parcelleName}
- Statut: ${report.status}
- Résumé: ${report.summary}
- Recommandations: ${report.recommendations.join(", ")}
- Météo: ${report.weather.temperature}°C, humidité ${report.weather.humidity}%, pluie ${report.weather.precipitation}mm, vent ${report.weather.windSpeed} km/h

STRUCTURE OBLIGATOIRE (1 minute max):
1. Salutation chaleureuse: "السلام عليكم أخي الفلاح، أختي الفلاحة" ou "Salam 3likom akhi lfalah, khti lfala7a"
2. Contexte: Introduire avec "3la 7sab ta9rir Budoor dyaL lyouma..." (selon le rapport Budoor d'aujourd'hui)
3. État actuel: Décrire le statut (normal/vigilance/alerte) et les conditions météo
4. Actions concrètes: Les recommandations spécifiques en darija ("Lard dyalkom me7taja...", "Khassek...", etc.)
5. Conclusion: Encouragement chaleureux "Lah y3awenkom" ou "Rabi y3awen"

STYLE:
- Ton chaleureux et fraternel comme un voisin agriculteur qui conseille
- Mélange naturel arabe dialectal marocain / français technique (drainage, irrigation, etc.)
- Phrases courtes et claires
- Vocabulaire agricole marocain authentique
- Écriture en caractères arabes pour la darija

EXEMPLE DE STRUCTURE:
"السلام عليكم أخي الفلاح، أختي الفلاحة. على حساب تقرير بذور ديال اليوم، كاينة يقظة... [contexte météo]... داكشي علاش [action concrète]... الأرض ديالك تبارك الله... الله يسخر ليكم."

IMPORTANT:
- Maximum 150 mots
- Naturel et authentique
- Utilise le script arabe pour la darija
- Inclus les termes techniques en français entre parenthèses si besoin`;

    const message = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const scriptContent = message.content[0];
    if (scriptContent.type !== "text") {
      throw new Error("Unexpected response type from Claude");
    }

    const script = scriptContent.text.trim();

    functions.logger.info("Darija script generated successfully", {
      parcelleName: report.parcelleName,
      scriptLength: script.length,
    });

    return script;
  } catch (error) {
    functions.logger.error("Failed to generate Darija script", { error });
    throw error;
  }
}
