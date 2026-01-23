# WhatsApp Scheduling - Developer Quick Reference

## Files Overview

### Frontend Components

#### `src/components/WhatsAppScheduleManager.tsx` (530 lines)
**Purpose**: Main UI component for creating and managing WhatsApp schedules

**Key Exports**:
```typescript
export function WhatsAppScheduleManager() { ... }
export function WhatsAppScheduleForm() { ... }
```

**Main Features**:
- List existing schedules with actions (edit, delete, toggle)
- Form to create new schedules
- Displays next scheduled send time
- Shows last sent timestamp and send count

**Usage in `/dashboard/settings`**:
```tsx
<WhatsAppScheduleManager />
```

### Firebase Services

#### `src/lib/firebase/whatsappSchedules.ts` (150+ lines)
**Purpose**: Firestore CRUD operations for schedules

**Key Functions**:
```typescript
// Create
createWhatsAppSchedule(userId: string, data: WhatsAppSchedule): Promise<string>

// Read
getWhatsAppSchedules(userId: string): Promise<WhatsAppSchedule[]>

// Update
updateWhatsAppSchedule(userId: string, scheduleId: string, updates: Partial<WhatsAppSchedule>): Promise<void>
toggleWhatsAppScheduleActive(userId: string, scheduleId: string, isActive: boolean): Promise<void>

// Delete
deleteWhatsAppSchedule(userId: string, scheduleId: string): Promise<void>

// Helper
calculateNextSendTime(schedule: WhatsAppSchedule): Timestamp
```

**Usage Example**:
```tsx
import { createWhatsAppSchedule, getWhatsAppSchedules } from '@/lib/firebase/whatsappSchedules';

// In component
const schedules = await getWhatsAppSchedules(userId);
await createWhatsAppSchedule(userId, newScheduleData);
```

### Cloud Functions

#### `functions/src/scheduled/whatsappScheduler.ts` (120+ lines)
**Purpose**: Automated scheduler triggered by Cloud Scheduler

**Key Functions**:
```typescript
// Pub/Sub trigger (every 15 minutes)
export const sendScheduledWhatsAppReports = onMessagePublished(
  'projects/PROJECT/topics/send-whatsapp-reports',
  async (message) => { ... }
);

// Firestore onCreate trigger (when schedule created)
export const initializeScheduleNextSendTime = onDocumentCreated(
  'users/{userId}/whatsappSchedules/{scheduleId}',
  async (event) => { ... }
);

// Helpers
function shouldSendNow(schedule: WhatsAppSchedule): boolean { ... }
function calculateNextSendTime(schedule: WhatsAppSchedule): Timestamp { ... }
function parseTimeString(timeStr: string, timezone: string): Date { ... }
function getDayOfWeekName(dayNumber: number): string { ... }
```

**Deployment**:
```bash
cd functions/
npm run deploy
```

#### `functions/src/services/whatsappService.ts` (60+ lines)
**Purpose**: Twilio integration for sending WhatsApp messages

**Key Functions**:
```typescript
export async function sendWhatsAppReport(
  phoneNumber: string,
  report: Report,
  schedule: WhatsAppSchedule,
  audioUrl?: string,
  darijaScript?: string
): Promise<void>
```

**Message Format**:
```
📊 Rapport pour [Field Name]

✅ Status: [Healthy/Warning/Critical]

🎯 Recommendations:
• [Recommendation 1]
• [Recommendation 2]
• [Recommendation 3]

🎤 Script Darija:
[First 200 chars of Darija script]

🎵 Audio: [Link]

Budoor 🌾
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────┐
│ User creates schedule in Settings UI                 │
│ WhatsAppScheduleManager.tsx                         │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│ createWhatsAppSchedule() called                      │
│ src/lib/firebase/whatsappSchedules.ts              │
│ • Stores in Firestore                              │
│ • Calls initializeScheduleNextSendTime trigger     │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│ Cloud Function: initializeScheduleNextSendTime      │
│ functions/src/scheduled/whatsappScheduler.ts       │
│ • Calculates nextSendAt                            │
│ • Updates Firestore document                       │
└──────────────────┬──────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │ Every 15 minutes    │
        ▼                     │
┌──────────────────┐          │
│ Cloud Scheduler  │          │
│ Pub/Sub trigger  │──────────┘
└──────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────┐
│ Cloud Function: sendScheduledWhatsAppReports        │
│ functions/src/scheduled/whatsappScheduler.ts       │
│ • Query all active schedules                       │
│ • Check shouldSendNow() for each                   │
│ • Generate latest report for field                 │
│ • Call sendWhatsAppReport()                        │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│ Twilio WhatsApp Service                             │
│ functions/src/services/whatsappService.ts          │
│ • Format message                                    │
│ • Send via Twilio API                              │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│ Update Firestore                                    │
│ • Set lastSentAt = now                             │
│ • Increment sendCount                              │
│ • Calculate next nextSendAt                        │
└─────────────────────────────────────────────────────┘
```

---

## Common Tasks

### Add a New Frequency Type

1. **Update Schema** (`src/lib/firebase/whatsappSchedules.ts`):
```typescript
frequency: "daily" | "weekly" | "monthly" | "quarterly"; // Add "quarterly"
```

2. **Update Calculation** (`calculateNextSendTime()`):
```typescript
case "quarterly":
  // Add 3 months logic
  nextDate.setMonth(nextDate.getMonth() + 3);
  break;
```

3. **Update UI Form** (`src/components/WhatsAppScheduleManager.tsx`):
```tsx
<select value={formData.frequency} onChange={...}>
  <option value="daily">Daily</option>
  <option value="weekly">Weekly</option>
  <option value="monthly">Monthly</option>
  <option value="quarterly">Quarterly</option> {/* Add */}
</select>
```

### Customize Message Template

Edit `functions/src/services/whatsappService.ts`:

```typescript
export async function sendWhatsAppReport(...) {
  let message = `🌾 Budoor Report\n\n`;
  message += `📍 Field: ${schedule.parcelleName}\n`;
  message += `📊 Status: ${report.status}\n\n`;
  
  // Add custom message if provided
  if (schedule.customMessage) {
    message += `💬 ${schedule.customMessage}\n\n`;
  }
  
  // ... rest of message
}
```

### Add Logging for Debugging

In Cloud Functions:

```typescript
import * as functions from 'firebase-functions/v2';

export const sendScheduledWhatsAppReports = onMessagePublished(
  'projects/PROJECT/topics/send-whatsapp-reports',
  async (message) => {
    functions.logger.info('Function triggered', { timestamp: new Date() });
    
    try {
      // ... function logic
      functions.logger.info('Success', { sentCount: 5 });
    } catch (error) {
      functions.logger.error('Error occurred', { error });
    }
  }
);
```

### Test Functions Locally

```bash
cd functions/

# Option 1: Run emulator
firebase emulators:start --only functions

# Option 2: Run specific function
npm run serve

# In another terminal, trigger manually
curl -X POST http://localhost:5001/PROJECT_ID/us-central1/sendScheduledWhatsAppReports
```

---

## Debugging Tips

### Check if Schedule is Firing

1. **Verify in Firestore**:
   - Check `nextSendAt` is in the past
   - Check `isActive: true`
   - Check `phoneNumber` set in user profile

2. **View Cloud Function Logs**:
   ```bash
   gcloud functions logs read sendScheduledWhatsAppReports --limit 50 --follow
   ```

3. **Check Twilio Logs**:
   - https://www.twilio.com/console/sms/logs
   - Filter by phone number or status

### Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `401 Unauthorized` | Bad Twilio token | Check `TWILIO_AUTH_TOKEN` in env vars |
| `Invalid phone number` | Wrong format | Use `+212...` or `+1...` format |
| `Schedule not found` | Query issue | Check user ID and collection path |
| `Timeout` | Slow API | Check network, increase timeout |

---

## Environment Variables Checklist

Required in Netlify & Firebase Functions:

```bash
# Twilio
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_PHONE=+1234567890

# Firebase (already set)
FIREBASE_PROJECT_ID=budoor-...
FIREBASE_PRIVATE_KEY=...
# etc.
```

To verify in Cloud Functions:
```bash
firebase functions:config:get
# Should show all required vars
```

---

## Performance Considerations

### Optimization Tips

1. **Batch Processing**: Function processes up to 100 schedules per run
2. **Caching**: Store calculated dates to avoid repeated timezone conversions
3. **Index**: Firestore automatically indexes `isActive` and `nextSendAt`
4. **Throttling**: Max 1 message per user per minute (prevent spam)

### Cost Estimation

- **Firestore Reads**: ~100 reads per 15 min = ~9,600/day
- **Firestore Writes**: ~10 writes per 15 min = ~960/day
- **Cloud Functions**: ~1440 invocations/day (~5 seconds each)
- **Twilio**: ~$0.01 per message (varies by region)

For 1,000 active users with 1-2 schedules each:
- ~$5-10/month Firestore
- ~$10-15/month Cloud Functions
- ~$100-500/month Twilio (depends on message volume)

---

## Next Steps

- [ ] Deploy Cloud Functions to production
- [ ] Create Cloud Scheduler job
- [ ] Add Twilio credentials to env
- [ ] Test with real Twilio sandbox
- [ ] Monitor logs for 24 hours
- [ ] Announce feature to users
