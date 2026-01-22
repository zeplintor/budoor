import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK
admin.initializeApp();

// Export scheduled functions
export { dailyReportGenerator } from "./scheduled/dailyReport";
export { weeklyReportGenerator } from "./scheduled/weeklyReport";

// Export HTTP functions
export { whatsappWebhook } from "./http/whatsappWebhook";
