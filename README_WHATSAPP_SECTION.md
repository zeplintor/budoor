# WhatsApp Scheduling Feature - README Section

Add this section to your main `README.md`:

---

## 🔔 WhatsApp Scheduled Reports (NEW)

Users can now schedule automated WhatsApp report delivery for their agricultural fields at custom times and frequencies.

### ✨ Features

- **Flexible Scheduling**: Daily, weekly, monthly, or custom frequencies
- **Time Control**: Set specific times (24-hour format) with timezone support
- **Personalization**: Include audio narration, charts, or custom messages
- **Automation**: Fully automated via Cloud Scheduler
- **Easy Management**: Create, edit, toggle, and delete schedules from Settings

### 🚀 Getting Started

1. **Navigate** to Dashboard → Settings
2. **Find** the "Planifications WhatsApp" section
3. **Click** "New Schedule"
4. **Select** your field (parcelle)
5. **Choose** frequency (daily/weekly/monthly)
6. **Set** time and timezone
7. **Customize** content (audio, charts, custom message)
8. **Save** and start receiving automated reports

### 📱 Message Format

Messages include:
- 📊 Current field status (Healthy/Warning/Critical)
- 🎯 Top 3 recommendations
- 🎤 Moroccan Darija script excerpt (if audio enabled)
- 🎵 Link to full audio narration
- 📈 Soil and weather charts (if enabled)

### ⚙️ Configuration

**Supported Timezones**:
- Africa/Casablanca (default)
- UTC
- Europe/Paris
- Europe/London
- America/New_York
- (Add more as needed)

**Content Options**:
- Include audio MP3 narration ✓
- Include soil/weather charts ✓
- Add custom message prefix ✓

### 📋 System Requirements

- User Twilio account with WhatsApp sandbox enabled
- Google Cloud Scheduler job running every 15 minutes
- Firebase Cloud Functions deployed
- User phone number stored in profile

### 📞 Support

For detailed setup and troubleshooting:
- See `WHATSAPP_SCHEDULING_GUIDE.md` for configuration
- See `DEPLOYMENT_CHECKLIST.md` for deployment
- See `WHATSAPP_DEVELOPER_GUIDE.md` for development

### 🔮 Future Enhancements

- [ ] Email scheduling
- [ ] SMS scheduling
- [ ] Advanced recurrence patterns
- [ ] Schedule templates
- [ ] Engagement analytics

---

## 📚 Documentation

### WhatsApp Scheduling Docs

- **`WHATSAPP_SCHEDULING_GUIDE.md`** - Complete setup and configuration guide
- **`DEPLOYMENT_CHECKLIST.md`** - Step-by-step deployment verification
- **`WHATSAPP_DEVELOPER_GUIDE.md`** - Developer reference and APIs
- **`WHATSAPP_IMPLEMENTATION_SUMMARY.md`** - Technical overview and summary

---

## 🛠️ Implementation Details

### Frontend Components
- `src/components/WhatsAppScheduleManager.tsx` - UI for managing schedules
- `src/lib/firebase/whatsappSchedules.ts` - Firestore CRUD operations

### Backend Functions
- `functions/src/scheduled/whatsappScheduler.ts` - Automated scheduler
- `functions/src/services/whatsappService.ts` - Twilio WhatsApp integration

### Firestore Schema
- Collection: `users/{userId}/whatsappSchedules`
- Stores schedule configuration, frequency, timing, and delivery metrics

### Cloud Functions
- Runs every 15 minutes via Cloud Scheduler
- Checks all active schedules for due deliveries
- Generates latest report and sends via Twilio
- Updates delivery metadata (lastSentAt, nextSendAt, sendCount)

---

