import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import twilio from "twilio";

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

/**
 * Send WhatsApp report via Twilio
 */
export async function sendWhatsAppReport(
  userId: string,
  schedule: any,
  scheduleRef: admin.firestore.DocumentReference
): Promise<void> {
  try {
    // Get user's phone number
    const userDoc = await admin.firestore().collection("users").doc(userId).get();
    const userData = userDoc.data();
    
    if (!userData?.phoneNumber) {
      throw new Error(`No phone number found for user ${userId}`);
    }

    // Get latest report for this parcelle
    const reportsSnapshot = await admin
      .firestore()
      .collection("users")
      .doc(userId)
      .collection("reports")
      .where("parcelleId", "==", schedule.parcelleId)
      .orderBy("generatedAt", "desc")
      .limit(1)
      .get();

    if (reportsSnapshot.empty) {
      functions.logger.warn(
        `No reports found for parcelle ${schedule.parcelleId}, user ${userId}`
      );
      return;
    }

    const latestReport = reportsSnapshot.docs[0].data();

    // Build WhatsApp message
    let message = schedule.customMessage
      ? `${schedule.customMessage}\n\n`
      : `🌾 Rapport Budoor - ${schedule.parcelleName}\n\n`;

    // Add report summary
    message += `📊 Statut: ${getStatusEmoji(latestReport.status)} ${latestReport.status}\n`;
    message += `📝 ${latestReport.summary}\n\n`;

    // Add recommendations
    if (latestReport.recommendations && latestReport.recommendations.length > 0) {
      message += `✅ Recommandations:\n`;
      latestReport.recommendations.slice(0, 3).forEach((rec: string) => {
        message += `• ${rec}\n`;
      });
    }

    // Add Darija script if available
    if (schedule.includeAudio && latestReport.darijaScript) {
      message += `\n🎙️ Script Darija:\n${latestReport.darijaScript.substring(0, 300)}...\n`;
    }

    // Add audio link if available
    if (schedule.includeAudio && latestReport.audioUrl) {
      message += `\n🔊 Écouter le rapport: ${latestReport.audioUrl}\n`;
    }

    message += `\n🌱 Budoor - Intelligence Agricole`;

    // Send via Twilio WhatsApp
    const phoneNumber = userData.phoneNumber.startsWith("+")
      ? userData.phoneNumber
      : `+${userData.phoneNumber}`;

    await twilioClient.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_PHONE}`,
      to: `whatsapp:${phoneNumber}`,
      body: message,
    });

    functions.logger.info(
      `WhatsApp report sent to ${phoneNumber} for schedule ${scheduleRef.id}`
    );
  } catch (error) {
    functions.logger.error(
      `Failed to send WhatsApp report for schedule ${scheduleRef.id}:`,
      error
    );
    throw error;
  }
}

/**
 * Get emoji for status
 */
function getStatusEmoji(status: string): string {
  switch (status) {
    case "alerte":
      return "🚨";
    case "vigilance":
      return "⚠️";
    case "ok":
      return "✅";
    default:
      return "ℹ️";
  }
}
