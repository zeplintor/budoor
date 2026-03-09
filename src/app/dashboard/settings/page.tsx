"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/dashboard";
import { Input, Label } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { User, Phone, Bell, Globe, Save, Loader2, CheckCircle, Mail, ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
import { locales, localeNames, type Locale } from "@/i18n/config";
import { getUserSettings, updateUserSettings, updateUserProfile } from "@/lib/firebase/users";

const cardStyle = {
  background: "white",
  borderColor: "var(--border-light)",
  boxShadow: "var(--shadow-card)",
};

function Section({ title, icon: Icon, iconBg, iconColor, children, delay = 0 }: {
  title: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <div
      className="rounded-xl border p-5 animate-fade-in-up"
      style={{ ...cardStyle, animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-3 mb-5 pb-4 border-b" style={{ borderColor: "var(--border-light)" }}>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: iconBg }}>
          <Icon className="h-5 w-5" style={{ color: iconColor }} />
        </div>
        <p className="font-display font-bold text-base" style={{ color: "var(--text-primary)" }}>{title}</p>
      </div>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const t = useTranslations();
  const { user, firebaseUser } = useAuth();
  const { locale, setLocale } = useLanguage();
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [displayName, setDisplayName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [notificationFrequency, setNotificationFrequency] = useState<"daily" | "weekly" | "none">("daily");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [notificationEmail, setNotificationEmail] = useState("");

  useEffect(() => {
    async function loadSettings() {
      if (!firebaseUser) return;
      try {
        const settings = await getUserSettings(firebaseUser.uid);
        if (settings) {
          setWhatsappNumber(settings.whatsappNumber || "");
          setNotificationFrequency(settings.notificationFrequency || "daily");
          setEmailNotifications(settings.emailNotifications !== false);
          setNotificationEmail(settings.notificationEmail || "");
        }
        setDisplayName(user?.displayName || "");
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    }
    loadSettings();
  }, [firebaseUser, user]);

  const handleSave = async () => {
    if (!firebaseUser) return;
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);
    try {
      await updateUserProfile(firebaseUser.uid, { displayName });
      await updateUserSettings(firebaseUser.uid, {
        whatsappNumber,
        notificationFrequency,
        language: locale as "fr" | "ar",
        emailNotifications,
        notificationEmail: notificationEmail || null,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      setSaveError("Erreur lors de la sauvegarde. Réessayez.");
    } finally {
      setIsSaving(false);
    }
  };

  const effectiveEmail = notificationEmail || user?.email || "";

  return (
    <>
      <Header title={t("settings.title")} />

      <div className="p-6 max-w-2xl space-y-5">

        {/* ── Profile ─────────────────────────────────────── */}
        <Section title={t("settings.profile.title")} icon={User} iconBg="var(--accent-green-light)" iconColor="var(--accent-green)" delay={0}>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="displayName" className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                {t("settings.profile.displayName")}
              </Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={t("settings.profile.displayNamePlaceholder")}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                {t("settings.profile.email")}
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  defaultValue={user?.email || ""}
                  disabled
                  className="pr-20"
                  style={{ background: "var(--bg-muted)" }}
                />
                <span
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: "var(--accent-green-light)", color: "var(--accent-green)" }}
                >
                  Vérifié
                </span>
              </div>
            </div>
          </div>
        </Section>

        {/* ── Email Notifications ─────────────────────────── */}
        <Section title="Rapports par email" icon={Mail} iconBg="var(--accent-gold-light)" iconColor="var(--accent-gold)" delay={70}>
          <div className="space-y-4">
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Recevez vos rapports agricoles directement dans votre boîte mail — recommandations IA, météo, risques phytosanitaires et actions prioritaires.
            </p>

            {/* Toggle */}
            <label className="flex items-center justify-between p-4 rounded-xl border cursor-pointer" style={{ borderColor: emailNotifications ? "var(--accent-green)" : "var(--border-light)", background: emailNotifications ? "var(--accent-green-light)" : "transparent" }}>
              <div>
                <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>Activer les rapports par email</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                  Gratuit · Envoi automatique selon la fréquence choisie
                </p>
              </div>
              <div
                className="relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0"
                style={{ background: emailNotifications ? "var(--accent-green)" : "var(--border-light)" }}
              >
                <div
                  className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200"
                  style={{ transform: emailNotifications ? "translateX(22px)" : "translateX(2px)" }}
                />
                <input
                  type="checkbox"
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                />
              </div>
            </label>

            {emailNotifications && (
              <div className="space-y-1.5">
                <Label htmlFor="notifEmail" className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                  Email de réception
                  <span className="ml-1.5 text-xs font-normal" style={{ color: "var(--text-muted)" }}>(laisser vide pour utiliser l'email du compte)</span>
                </Label>
                <Input
                  id="notifEmail"
                  type="email"
                  value={notificationEmail}
                  onChange={(e) => setNotificationEmail(e.target.value)}
                  placeholder={user?.email || "votre@email.com"}
                />
                {effectiveEmail && (
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Les rapports seront envoyés à : <strong style={{ color: "var(--text-primary)" }}>{effectiveEmail}</strong>
                  </p>
                )}
              </div>
            )}

          </div>
        </Section>

        {/* ── WhatsApp ─────────────────────────────────────── */}
        <Section title="Numéro WhatsApp" icon={Phone} iconBg="#dcfce7" iconColor="#166534" delay={140}>
          <div className="space-y-4">
            {/* Honest status banner */}
            <div
              className="flex items-start gap-3 p-4 rounded-xl border"
              style={{ borderColor: "var(--border-light)", background: "var(--bg-muted)" }}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#25D366" }}>
                <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-sm mb-1" style={{ color: "var(--text-primary)" }}>
                  WhatsApp en cours de déploiement
                </p>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  Nous migrons vers l'API WhatsApp Business Cloud (Meta) — beaucoup moins chère que Twilio.
                  En attendant, utilisez les <strong>rapports par email</strong> ci-dessus. Votre numéro sera activé automatiquement.
                </p>
                <a
                  href="https://business.facebook.com/wa/manage"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-2 text-xs font-medium underline"
                  style={{ color: "var(--accent-green)" }}
                >
                  En savoir plus sur WhatsApp Business Cloud
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                {t("settings.whatsapp.phone")}
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+212 6XX XXX XXX"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
              />
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Format international — ex : +212612345678 (Maroc) · +33612345678 (France)
              </p>
            </div>
          </div>
        </Section>

        {/* ── Fréquence ─────────────────────────────────────── */}
        <Section title={t("settings.notifications.title")} icon={Bell} iconBg="var(--accent-coral-light)" iconColor="var(--accent-coral)" delay={210}>
          <div className="space-y-2">
            {[
              { value: "daily", label: t("settings.notifications.daily.label"), desc: t("settings.notifications.daily.description") },
              { value: "weekly", label: t("settings.notifications.weekly.label"), desc: t("settings.notifications.weekly.description") },
              { value: "none", label: t("settings.notifications.none.label"), desc: t("settings.notifications.none.description") },
            ].map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-4 rounded-xl border p-4 cursor-pointer transition-colors"
                style={{
                  borderColor: notificationFrequency === option.value ? "var(--accent-green)" : "var(--border-light)",
                  background: notificationFrequency === option.value ? "var(--accent-green-light)" : "transparent",
                }}
              >
                <input
                  type="radio"
                  name="frequency"
                  value={option.value}
                  checked={notificationFrequency === option.value}
                  onChange={(e) => setNotificationFrequency(e.target.value as "daily" | "weekly" | "none")}
                  className="h-4 w-4 shrink-0"
                  style={{ accentColor: "var(--accent-green)" }}
                />
                <div className="flex-1">
                  <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{option.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{option.desc}</p>
                </div>
                {notificationFrequency === option.value && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full shrink-0" style={{ background: "var(--accent-green-light)", color: "var(--accent-green)" }}>
                    Actif
                  </span>
                )}
              </label>
            ))}
          </div>
        </Section>

        {/* ── Langue ─────────────────────────────────────────── */}
        <Section title={t("settings.language.title")} icon={Globe} iconBg="var(--accent-purple-light)" iconColor="var(--accent-purple)" delay={280}>
          <div className="space-y-1.5">
            <Label htmlFor="language" className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              {t("settings.language.label")}
            </Label>
            <select
              id="language"
              value={locale}
              onChange={(e) => setLocale(e.target.value as Locale)}
              className="flex h-10 w-full max-w-xs rounded-xl border px-4 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 transition-all"
              style={{
                borderColor: "var(--border-light)",
                background: "white",
                color: "var(--text-primary)",
              }}
            >
              {locales.map((loc) => (
                <option key={loc} value={loc}>{localeNames[loc]}</option>
              ))}
            </select>
          </div>
        </Section>

        {/* ── Save button ─────────────────────────────────────── */}
        <div className="flex justify-end items-center gap-4 pt-2 animate-fade-in-up" style={{ animationDelay: "350ms" }}>
          {saveError && (
            <p className="text-sm" style={{ color: "var(--accent-coral)" }}>{saveError}</p>
          )}
          {saveSuccess && (
            <div className="flex items-center gap-2 text-sm font-medium" style={{ color: "var(--accent-green)" }}>
              <CheckCircle className="h-4 w-4" />
              {t("settings.saveSuccess")}
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
            style={{ background: "var(--accent-green)" }}
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {t("settings.save")}
          </button>
        </div>

      </div>
    </>
  );
}
