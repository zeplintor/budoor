import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { sendDailyReport } from "../services/twilioService";
import { generateDailyReport } from "../services/openaiService";
import { generateDarijaScript } from "../services/darijaScriptGenerator";
import { generateAudioFromText } from "../services/elevenLabsService";

// Types
interface UserSettings {
  notificationFrequency: "daily" | "weekly" | "none";
  whatsappNumber?: string;
  language: "fr" | "ar";
}

interface Parcelle {
  id: string;
  name: string;
  culture: { type: string };
  areaHectares: number;
  centroid: { lat: number; lng: number };
}

interface WeatherResponse {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    precipitation: number;
    wind_speed_10m: number;
  };
}

/**
 * Fetch weather data from Open-Meteo API
 */
async function fetchWeatherData(
  lat: number,
  lng: number
): Promise<{
  temperature: number;
  humidity: number;
  precipitation: number;
  windSpeed: number;
}> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Weather API error: ${response.status}`);
  }

  const data = (await response.json()) as WeatherResponse;
  return {
    temperature: data.current.temperature_2m,
    humidity: data.current.relative_humidity_2m,
    precipitation: data.current.precipitation,
    windSpeed: data.current.wind_speed_10m,
  };
}

/**
 * Daily report generator - runs every day at 6:00 AM Paris time
 *
 * This function:
 * 1. Gets all users with daily notification frequency
 * 2. For each user, fetches their parcelles
 * 3. Generates an AI report for each parcelle
 * 4. Sends the report via WhatsApp
 */
export const dailyReportGenerator = functions
  .runWith({
    timeoutSeconds: 540, // 9 minutes max
    memory: "512MB",
  })
  .pubsub.schedule("0 6 * * *")
  .timeZone("Europe/Paris")
  .onRun(async () => {
    functions.logger.info("Starting daily report generation");

    const db = admin.firestore();

    try {
      // Get all users with daily notifications enabled
      const usersSnapshot = await db
        .collection("users")
        .where("settings.notificationFrequency", "==", "daily")
        .get();

      functions.logger.info(`Found ${usersSnapshot.size} users for daily reports`);

      let successCount = 0;
      let errorCount = 0;

      for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;
        const userData = userDoc.data();
        const settings = userData.settings as UserSettings | undefined;

        if (!settings?.whatsappNumber) {
          functions.logger.warn(`User ${userId} has no WhatsApp number configured`);
          continue;
        }

        try {
          // Get user's parcelles
          const parcellesSnapshot = await db
            .collection("users")
            .doc(userId)
            .collection("parcelles")
            .get();

          if (parcellesSnapshot.empty) {
            functions.logger.info(`User ${userId} has no parcelles`);
            continue;
          }

          // Process each parcelle
          for (const parcelleDoc of parcellesSnapshot.docs) {
            const parcelle = parcelleDoc.data() as Parcelle;

            try {
              // Fetch current weather
              const weather = await fetchWeatherData(
                parcelle.centroid.lat,
                parcelle.centroid.lng
              );

              // Generate AI report
              const report = await generateDailyReport(
                {
                  name: parcelle.name,
                  cultureType: parcelle.culture.type,
                  areaHectares: parcelle.areaHectares,
                  weather,
                },
                settings.language || "fr"
              );

              // Generate Darija audio script
              let audioUrl: string | undefined;
              let darijaScript: string | undefined;

              try {
                functions.logger.info("Generating Darija script...");
                darijaScript = await generateDarijaScript(
                  {
                    parcelleName: parcelle.name,
                    status: report.status,
                    summary: report.summary,
                    recommendations: report.recommendations,
                    weather,
                  },
                  userData.displayName || "الفلاح"
                );

                // Generate audio from Darija script
                functions.logger.info("Generating audio from Darija script...");
                const audioFileName = `report_${userId}_${parcelleDoc.id}_${Date.now()}.mp3`;
                audioUrl = await generateAudioFromText(
                  darijaScript,
                  "21m00Tcm4TlvDq8ikWAM", // Rachel voice - clear and expressive
                  audioFileName
                );

                functions.logger.info("Audio generated successfully", { audioUrl });
              } catch (audioError) {
                functions.logger.error("Failed to generate audio, continuing without it", {
                  error: audioError,
                });
                // Continue without audio if generation fails
              }

              // Save report to Firestore FIRST to get the report ID
              const reportRef = await db
                .collection("users")
                .doc(userId)
                .collection("reports")
                .add({
                  parcelleId: parcelleDoc.id,
                  parcelleName: parcelle.name,
                  cultureType: parcelle.culture.type,
                  content: report.fullReport,
                  status: report.status,
                  recommendations: report.recommendations,
                  weather,
                  audioUrl, // Add audio URL
                  darijaScript, // Add darija script for reference
                  source: "scheduled",
                  sentViaWhatsApp: true,
                  createdAt: admin.firestore.FieldValue.serverTimestamp(),
                });

              // Get the report ID
              const reportId = reportRef.id;

              // Generate the report details URL
              const reportUrl = `https://budoor.app/dashboard/reports/${reportId}`;

              // Send WhatsApp message with the report link and audio
              const result = await sendDailyReport(
                settings.whatsappNumber,
                userData.displayName || "Agriculteur",
                parcelle.name,
                report.summary,
                report.status,
                reportUrl,
                audioUrl // Pass audio URL to WhatsApp service
              );

              if (result.success) {
                successCount++;
                functions.logger.info(`Report sent for parcelle ${parcelle.name}`);
              } else {
                errorCount++;
                functions.logger.error(`Failed to send report: ${result.error}`);
              }

              // Small delay to avoid rate limiting
              await new Promise((resolve) => setTimeout(resolve, 1000));
            } catch (error) {
              errorCount++;
              functions.logger.error(
                `Error processing parcelle ${parcelle.name}`,
                { error }
              );
            }
          }
        } catch (error) {
          functions.logger.error(`Error processing user ${userId}`, { error });
        }
      }

      functions.logger.info(
        `Daily reports completed. Success: ${successCount}, Errors: ${errorCount}`
      );
    } catch (error) {
      functions.logger.error("Critical error in daily report generator", { error });
      throw error;
    }
  });
