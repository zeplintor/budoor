import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { sendWhatsAppReport } from "../services/whatsappService";

const db = admin.firestore();

/**
 * Cloud Scheduler Function: Runs every 15 minutes to send scheduled WhatsApp reports
 * Triggered by Cloud Scheduler job
 */
export const sendScheduledWhatsAppReports = functions.pubsub
  .schedule("every 15 minutes")
  .timeZone("Africa/Casablanca")
  .onRun(async (context) => {
    try {
      const now = new Date();
      functions.logger.info(
        `[WhatsApp Scheduler] Starting scheduled check at ${now.toISOString()}`
      );

      // Get all users
      const usersSnapshot = await db.collection("users").get();
      let successCount = 0;
      let errorCount = 0;

      for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;

        try {
          // Get all active schedules for this user
          const schedulesSnapshot = await db
            .collection("users")
            .doc(userId)
            .collection("whatsappSchedules")
            .where("isActive", "==", true)
            .get();

          for (const scheduleDoc of schedulesSnapshot.docs) {
            const schedule = scheduleDoc.data();
            const scheduleId = scheduleDoc.id;

            try {
              // Check if this schedule should send now
              if (shouldSendNow(schedule, now)) {
                functions.logger.info(
                  `[WhatsApp Scheduler] Sending report for user ${userId}, schedule ${scheduleId}`
                );

                // Generate and send report
                await sendWhatsAppReport(userId, schedule, scheduleDoc.ref);
                successCount++;

                // Update last sent time and calculate next send time
                const nextSendAt = calculateNextSendTime(schedule);
                await scheduleDoc.ref.update({
                  lastSentAt: admin.firestore.FieldValue.serverTimestamp(),
                  nextSendAt: nextSendAt,
                  sendCount: admin.firestore.FieldValue.increment(1),
                  updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                });
              }
            } catch (err) {
              functions.logger.error(
                `Error processing schedule ${scheduleId} for user ${userId}:`,
                err
              );
              errorCount++;
            }
          }
        } catch (err) {
          functions.logger.error(`Error processing user ${userId}:`, err);
        }
      }

      functions.logger.info(
        `[WhatsApp Scheduler] Completed. Success: ${successCount}, Errors: ${errorCount}`
      );
      return { success: successCount, errors: errorCount };
    } catch (err) {
      functions.logger.error("[WhatsApp Scheduler] Fatal error:", err);
      throw err;
    }
  });

/**
 * Check if a schedule should send now
 */
function shouldSendNow(schedule: any, currentTime: Date): boolean {
  const scheduleTime = schedule.nextSendAt?.toDate?.() || new Date();
  
  // Check if current time is within 15 minutes of next send time
  const timeDiff = currentTime.getTime() - scheduleTime.getTime();
  return timeDiff >= 0 && timeDiff < 15 * 60 * 1000;
}

/**
 * Calculate next send time based on frequency
 */
function calculateNextSendTime(schedule: any): Date {
  const now = new Date();
  const [hours, minutes] = schedule.time.split(":").map(Number);
  
  let nextSend = new Date(now);
  nextSend.setHours(hours, minutes, 0, 0);

  // If scheduled time has already passed today, move to next occurrence
  if (nextSend <= now) {
    if (schedule.frequency === "daily") {
      nextSend.setDate(nextSend.getDate() + 1);
    } else if (schedule.frequency === "weekly") {
      const daysOfWeek = schedule.daysOfWeek || [1, 3, 5];
      let daysToAdd = 1;
      
      // Find next day in schedule
      for (let i = 1; i <= 7; i++) {
        const checkDate = new Date(now);
        checkDate.setDate(checkDate.getDate() + i);
        const dayOfWeek = checkDate.getDay();
        
        if (daysOfWeek.includes(dayOfWeek)) {
          daysToAdd = i;
          break;
        }
      }
      
      nextSend = new Date(now);
      nextSend.setDate(nextSend.getDate() + daysToAdd);
      nextSend.setHours(hours, minutes, 0, 0);
    } else if (schedule.frequency === "monthly") {
      const dayOfMonth = schedule.dayOfMonth || 1;
      nextSend.setMonth(nextSend.getMonth() + 1);
      nextSend.setDate(dayOfMonth);
      nextSend.setHours(hours, minutes, 0, 0);
    }
  }

  return nextSend;
}

/**
 * Initialize next send time when schedule is created
 */
export const initializeScheduleNextSendTime = functions.firestore
  .document("users/{userId}/whatsappSchedules/{scheduleId}")
  .onCreate(async (snap, context) => {
    const schedule = snap.data();
    const nextSendAt = calculateNextSendTime(schedule);

    await snap.ref.update({
      nextSendAt: nextSendAt,
    });

    functions.logger.info(
      `Initialized nextSendAt for schedule ${context.params.scheduleId}: ${nextSendAt.toISOString()}`
    );
  });
