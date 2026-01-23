# WhatsApp Scheduled Reporting - Configuration & Deployment Guide

## 🎯 Overview

This feature allows users to schedule automated WhatsApp report delivery at custom times and frequencies:
- **Frequencies**: Daily, Weekly, Monthly, Custom
- **Customization**: Choose days/times, include audio, custom messages
- **Automation**: Cloud Scheduler + Firestore triggers

---

## 📊 Architecture

### Frontend
- **Component**: `src/components/WhatsAppScheduleManager.tsx`
- **Page Integration**: `src/app/dashboard/settings/page.tsx`
- **State Management**: React hooks + Firestore

### Backend
- **Firestore Collections**:
  ```
  users/{userId}/whatsappSchedules/{scheduleId}
  ```

- **Cloud Functions**:
  - `sendScheduledWhatsAppReports`: Pub/Sub scheduled job (every 15 min)
  - `initializeScheduleNextSendTime`: Firestore onCreate trigger

### Services
- **Twilio**: WhatsApp message delivery
- **Google Cloud Scheduler**: Automated job execution
- **Firebase Firestore**: Schedule storage & metadata

---

## 🔧 Firestore Schema

### Collection: `users/{userId}/whatsappSchedules`

```typescript
interface WhatsAppSchedule {
  // Identification
  id: string;                          // Document ID
  userId: string;                      // Parent user ID
  parcelleId: string;                  // Linked field plot ID
  parcelleName: string;                // Field name (denormalized)
  
  // Scheduling
  isActive: boolean;                   // Enable/disable schedule
  frequency: "daily" | "weekly" | "monthly" | "custom";
  daysOfWeek?: number[];               // [0-6] for weekly (0=Sunday)
  dayOfMonth?: number;                 // 1-31 for monthly
  time: string;                        // "HH:mm" format, 24-hour
  timezone: string;                    // "Africa/Casablanca", etc.
  
  // Content
  includeAudio: boolean;               // Include audio MP3 link
  includeChart: boolean;               // Include soil/weather charts
  customMessage?: string;              // Optional prefix message
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastSentAt?: Timestamp;              // Last delivery time
  nextSendAt?: Timestamp;              // Next scheduled time
  sendCount: number;                   // Total deliveries
}
```

---

## 🚀 Deployment Steps

### Step 1: Setup Twilio WhatsApp Integration

1. **Create Twilio Account** (if not already done):
   - Go to https://www.twilio.com/
   - Sign up and verify phone number
   - Get Account SID and Auth Token

2. **Enable WhatsApp Sandbox**:
   - In Twilio Console: Messaging → WhatsApp
   - Save WhatsApp Phone Number (e.g., `+1234567890`)
   - Note: Sandbox mode sends to pre-approved numbers only

3. **Add Environment Variables** (Netlify):
   ```
   TWILIO_ACCOUNT_SID=AC...
   TWILIO_AUTH_TOKEN=...
   TWILIO_WHATSAPP_PHONE=+1234567890
   ```

### Step 2: Enable Cloud Scheduler

1. **Create Cloud Scheduler Job**:
   ```bash
   gcloud scheduler jobs create pubsub send-whatsapp-reports \
     --schedule="*/15 * * * *" \
     --timezone="Africa/Casablanca" \
     --message-body="{}" \
     --topic=projects/PROJECT_ID/topics/send-whatsapp-reports
   ```

2. **Create Pub/Sub Topic** (if not exists):
   ```bash
   gcloud pubsub topics create send-whatsapp-reports
   ```

3. **Deploy Cloud Functions**:
   ```bash
   cd functions/
   npm run deploy
   ```

### Step 3: Update Firestore Security Rules

Add rules to allow schedule management:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
      
      match /whatsappSchedules/{scheduleId} {
        allow create, read, update, delete: if request.auth.uid == userId;
        // Only creator can manage their own schedules
      }
    }
  }
}
```

### Step 4: Update Firebase Admin Functions Index

Deploy scheduled functions:

```bash
cd functions/
npm install
npm run build
npm run deploy
```

---

## 🛠️ Configuration

### Environment Variables (`.env.local` & Netlify)

```bash
# Twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_PHONE=+1234567890

# Firebase (already configured)
NEXT_PUBLIC_FIREBASE_PROJECT_ID=budoor-406c2
# etc.
```

### Timezone Support

Supported timezones (can extend list):
- `Africa/Casablanca` (Morocco - default)
- `UTC`
- `Europe/Paris`
- (Add more via environment variable)

---

## 📱 User Flow

### Create Schedule
1. User navigates to Settings → WhatsApp Scheduling
2. Clicks "New Schedule"
3. Fills form:
   - Select field (parcelle)
   - Choose frequency (daily/weekly/monthly)
   - Set time (24-hour format)
   - Choose timezone
   - Toggle audio/charts inclusion
   - Add custom message (optional)
4. System calculates `nextSendAt` and stores schedule

### Automatic Delivery
1. **Every 15 minutes**: Cloud Scheduler triggers Pub/Sub
2. **Cloud Function checks**:
   - Find all active schedules where `nextSendAt <= now`
   - Generate latest report for that field
   - Send WhatsApp message via Twilio
   - Update `lastSentAt`, `nextSendAt`, `sendCount`

### Edit/Delete Schedule
- User can toggle on/off, edit frequency/time, or delete
- `updatedAt` timestamp updates automatically

---

## 🔍 Testing

### Local Testing (Emulator)

```bash
# Start Firebase emulator
firebase emulators:start

# In another terminal, run functions locally
cd functions/
npm run serve
```

### Manual Test Sending

Create a test schedule and manually trigger via Firebase Console:
```bash
# Call function directly
gcloud functions call sendScheduledWhatsAppReports \
  --data='{}' \
  --region=us-central1
```

### Check Logs

```bash
# View Cloud Function logs
gcloud functions logs read sendScheduledWhatsAppReports --limit 50

# View Firestore audit logs
gcloud logging read "resource.type=cloud_firestore" --limit 20
```

---

## ⚠️ Limitations & Notes

### Current Limitations
1. **WhatsApp Sandbox**: Max 50 recipients until upgraded
2. **Message Frequency**: Min 15 minutes (Cloud Scheduler limit)
3. **Audio Size**: Twilio has 100MB media limit (audio ~5MB OK)
4. **Timezone**: Fixed set; adding more requires env update

### Future Enhancements
- [ ] Custom frequencies (e.g., every 3 days)
- [ ] Multi-language scheduling instructions
- [ ] WhatsApp template messages
- [ ] Read receipts tracking
- [ ] Schedule conflict detection
- [ ] Advance scheduling (weeks/months ahead)

---

## 🐛 Troubleshooting

### Schedule not sending

**Check**:
1. Is schedule `isActive: true`?
2. Is `nextSendAt <= now`?
3. Are Twilio credentials valid in Netlify?
4. Does user have phone number in profile?

**View logs**:
```bash
gcloud functions logs read sendScheduledWhatsAppReports --limit 100
```

### Timezone issues

**Verify**:
- User timezone matches IANA format (e.g., `Africa/Casablanca`)
- Cloud Scheduler job timezone correct
- Server time is accurate (check via `date` command)

### Twilio errors

- **401 Unauthorized**: Check `TWILIO_AUTH_TOKEN`
- **400 Invalid Request**: Validate phone number format (`+212...`)
- **429 Too Many Requests**: Increase interval between sends

---

## 📞 Support

For issues:
1. Check Cloud Function logs
2. Verify Twilio sandbox recipients
3. Test manually with gcloud CLI
4. Review Firestore documents structure
