import * as functions from "firebase-functions";
import Twilio from "twilio";

// Types for Twilio messages
interface WhatsAppMessage {
  to: string;
  body: string;
  mediaUrl?: string;
}

interface MessageResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// Get Twilio credentials from Firebase config
const getTwilioClient = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    throw new Error("Twilio credentials not configured");
  }

  return Twilio(accountSid, authToken);
};

const getWhatsAppNumber = (): string => {
  const number = process.env.TWILIO_WHATSAPP_NUMBER;
  if (!number) {
    throw new Error("WhatsApp number not configured");
  }
  return number;
};

/**
 * Send a WhatsApp message via Twilio
 */
export async function sendWhatsAppMessage(
  message: WhatsAppMessage
): Promise<MessageResult> {
  try {
    const client = getTwilioClient();
    const from = getWhatsAppNumber();

    // Format phone number for WhatsApp
    const toNumber = message.to.startsWith("whatsapp:")
      ? message.to
      : `whatsapp:${message.to}`;

    const result = await client.messages.create({
      from,
      to: toNumber,
      body: message.body,
      ...(message.mediaUrl && { mediaUrl: [message.mediaUrl] }),
    });

    functions.logger.info("WhatsApp message sent successfully", {
      messageId: result.sid,
      to: toNumber,
    });

    return {
      success: true,
      messageId: result.sid,
    };
  } catch (error) {
    functions.logger.error("Failed to send WhatsApp message", { error });
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send a daily report to a user via WhatsApp
 */
export async function sendDailyReport(
  phoneNumber: string,
  userName: string,
  parcelleName: string,
  reportSummary: string,
  alertLevel: "normal" | "vigilance" | "alerte"
): Promise<MessageResult> {
  const alertEmoji =
    alertLevel === "alerte"
      ? "🚨"
      : alertLevel === "vigilance"
        ? "⚠️"
        : "✅";

  const message = `${alertEmoji} *Rapport Budoor - ${parcelleName}*

Bonjour ${userName},

Voici votre rapport agronomique quotidien:

${reportSummary}

---
_Généré automatiquement par Budoor_
_Répondez STOP pour vous désabonner_`;

  return sendWhatsAppMessage({
    to: phoneNumber,
    body: message,
  });
}

/**
 * Send a weekly summary to a user via WhatsApp
 */
export async function sendWeeklySummary(
  phoneNumber: string,
  userName: string,
  parcelleCount: number,
  alertCount: number,
  summary: string
): Promise<MessageResult> {
  const message = `📊 *Résumé Hebdomadaire Budoor*

Bonjour ${userName},

Cette semaine sur vos ${parcelleCount} parcelle(s):

${alertCount > 0 ? `⚠️ ${alertCount} alerte(s) détectée(s)` : "✅ Aucune alerte"}

${summary}

---
_Bon courage pour la semaine !_
_Généré automatiquement par Budoor_`;

  return sendWhatsAppMessage({
    to: phoneNumber,
    body: message,
  });
}

/**
 * Send an urgent alert via WhatsApp
 */
export async function sendUrgentAlert(
  phoneNumber: string,
  userName: string,
  parcelleName: string,
  alertType: string,
  alertMessage: string
): Promise<MessageResult> {
  const message = `🚨 *ALERTE URGENTE - Budoor*

${userName}, attention !

*Parcelle:* ${parcelleName}
*Type:* ${alertType}

${alertMessage}

Connectez-vous à Budoor pour plus de détails.

---
_Alerte automatique Budoor_`;

  return sendWhatsAppMessage({
    to: phoneNumber,
    body: message,
  });
}
