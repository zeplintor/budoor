import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { sendWeeklySummary } from "../services/twilioService";
import { generateWeeklySummary } from "../services/openaiService";

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
 * Weekly summary generator - runs every Monday at 7:00 AM Paris time
 *
 * This function:
 * 1. Gets all users with weekly notification frequency
 * 2. Collects all their parcelles data
 * 3. Counts alerts from the past week
 * 4. Generates a summary and sends via WhatsApp
 */
export const weeklyReportGenerator = functions
  .runWith({
    timeoutSeconds: 540, // 9 minutes max
    memory: "512MB",
  })
  .pubsub.schedule("0 7 * * 1") // Every Monday at 7 AM
  .timeZone("Europe/Paris")
  .onRun(async () => {
    functions.logger.info("Starting weekly summary generation");

    const db = admin.firestore();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    try {
      // Get all users with weekly notifications enabled
      const usersSnapshot = await db
        .collection("users")
        .where("settings.notificationFrequency", "==", "weekly")
        .get();

      functions.logger.info(`Found ${usersSnapshot.size} users for weekly summaries`);

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

          // Collect parcelle data with weather
          const parcellesWithWeather = [];
          for (const parcelleDoc of parcellesSnapshot.docs) {
            const parcelle = parcelleDoc.data() as Parcelle;
            try {
              const weather = await fetchWeatherData(
                parcelle.centroid.lat,
                parcelle.centroid.lng
              );
              parcellesWithWeather.push({
                name: parcelle.name,
                cultureType: parcelle.culture.type,
                areaHectares: parcelle.areaHectares,
                weather,
              });
            } catch {
              // Use placeholder weather if fetch fails
              parcellesWithWeather.push({
                name: parcelle.name,
                cultureType: parcelle.culture.type,
                areaHectares: parcelle.areaHectares,
                weather: {
                  temperature: 0,
                  humidity: 0,
                  precipitation: 0,
                  windSpeed: 0,
                },
              });
            }
          }

          // Count alerts from the past week
          const reportsSnapshot = await db
            .collection("users")
            .doc(userId)
            .collection("reports")
            .where("createdAt", ">=", oneWeekAgo)
            .where("status", "in", ["alerte", "vigilance"])
            .get();

          const alertCount = reportsSnapshot.size;

          // Generate summary
          const summary = await generateWeeklySummary(
            parcellesWithWeather,
            settings.language || "fr"
          );

          // Send WhatsApp message
          const result = await sendWeeklySummary(
            settings.whatsappNumber,
            userData.displayName || "Agriculteur",
            parcellesSnapshot.size,
            alertCount,
            summary
          );

          if (result.success) {
            successCount++;
            functions.logger.info(`Weekly summary sent to user ${userId}`);
          } else {
            errorCount++;
            functions.logger.error(`Failed to send weekly summary: ${result.error}`);
          }

          // Small delay to avoid rate limiting
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (error) {
          errorCount++;
          functions.logger.error(`Error processing user ${userId}`, { error });
        }
      }

      functions.logger.info(
        `Weekly summaries completed. Success: ${successCount}, Errors: ${errorCount}`
      );
    } catch (error) {
      functions.logger.error("Critical error in weekly summary generator", { error });
      throw error;
    }
  });
