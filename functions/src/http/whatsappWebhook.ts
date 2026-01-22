import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

interface TwilioWebhookBody {
  From: string;
  To: string;
  Body: string;
  MessageSid: string;
  AccountSid: string;
  NumMedia?: string;
}

/**
 * WhatsApp Webhook Handler
 *
 * Handles incoming WhatsApp messages from users.
 * Supported commands:
 * - STOP: Unsubscribe from notifications
 * - RAPPORT: Request immediate report for all parcelles
 * - AIDE/HELP: Get list of available commands
 */
export const whatsappWebhook = functions.https.onRequest(async (req, res) => {
  // Only accept POST requests
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  try {
    const body = req.body as TwilioWebhookBody;
    const fromNumber = body.From?.replace("whatsapp:", "");
    const messageBody = body.Body?.trim().toUpperCase();

    functions.logger.info("Received WhatsApp message", {
      from: fromNumber,
      body: messageBody,
    });

    if (!fromNumber || !messageBody) {
      res.status(400).send("Missing required fields");
      return;
    }

    const db = admin.firestore();

    // Find user by WhatsApp number
    const usersSnapshot = await db
      .collection("users")
      .where("settings.whatsappNumber", "==", fromNumber)
      .limit(1)
      .get();

    if (usersSnapshot.empty) {
      // User not found - send help message
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Bienvenue sur Budoor! Ce numéro n'est pas associé à un compte.

Connectez-vous à votre compte Budoor et ajoutez votre numéro WhatsApp dans les paramètres pour recevoir des rapports automatiques.</Message>
</Response>`;
      res.type("text/xml").send(twiml);
      return;
    }

    const userDoc = usersSnapshot.docs[0];
    const userId = userDoc.id;
    const userData = userDoc.data();

    let responseMessage = "";

    // Handle commands
    switch (messageBody) {
      case "STOP":
      case "ARRET":
      case "ARRETER":
        // Unsubscribe user
        await db.collection("users").doc(userId).update({
          "settings.notificationFrequency": "none",
        });
        responseMessage =
          "Vous êtes désabonné des notifications Budoor. Envoyez START pour vous réabonner.";
        break;

      case "START":
      case "DEMARRER":
        // Resubscribe user to daily notifications
        await db.collection("users").doc(userId).update({
          "settings.notificationFrequency": "daily",
        });
        responseMessage =
          "Vous êtes réabonné aux notifications quotidiennes Budoor!";
        break;

      case "HEBDO":
      case "WEEKLY":
        // Switch to weekly notifications
        await db.collection("users").doc(userId).update({
          "settings.notificationFrequency": "weekly",
        });
        responseMessage =
          "Vous recevrez maintenant un résumé hebdomadaire chaque lundi matin.";
        break;

      case "RAPPORT":
      case "REPORT":
        // Queue a report generation (could trigger a function)
        responseMessage = `Génération de rapport en cours pour ${userData.displayName || "vos parcelles"}...

Vous recevrez votre rapport dans quelques instants.`;
        // In a real implementation, we would trigger the report generation here
        break;

      case "AIDE":
      case "HELP":
      case "?":
        responseMessage = `Commandes Budoor disponibles:

📊 RAPPORT - Demander un rapport immédiat
📅 HEBDO - Passer aux résumés hebdomadaires
▶️ START - Se réabonner aux notifications
⏹️ STOP - Se désabonner

Bonne culture avec Budoor! 🌾`;
        break;

      default:
        responseMessage = `Je n'ai pas compris votre message.

Envoyez AIDE pour voir les commandes disponibles.`;
    }

    // Log the interaction
    await db.collection("whatsappLogs").add({
      userId,
      fromNumber,
      messageBody,
      response: responseMessage,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Send TwiML response
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${responseMessage}</Message>
</Response>`;

    res.type("text/xml").send(twiml);
  } catch (error) {
    functions.logger.error("Error handling WhatsApp webhook", { error });
    res.status(500).send("Internal Server Error");
  }
});
