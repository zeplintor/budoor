"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/dashboard";
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription, Input, Label } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { User, Phone, Bell, Globe, Save, Loader2, HelpCircle, RotateCcw, CheckCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { locales, localeNames, type Locale } from "@/i18n/config";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { getUserSettings, updateUserSettings, updateUserProfile } from "@/lib/firebase/users";

export default function SettingsPage() {
  const t = useTranslations();
  const { user, firebaseUser } = useAuth();
  const { locale, setLocale } = useLanguage();
  const { resetOnboarding, startTour } = useOnboarding();
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form state
  const [displayName, setDisplayName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [notificationFrequency, setNotificationFrequency] = useState<"daily" | "weekly" | "none">("daily");

  // Load user settings on mount
  useEffect(() => {
    async function loadSettings() {
      if (!firebaseUser) return;

      try {
        const settings = await getUserSettings(firebaseUser.uid);
        if (settings) {
          setWhatsappNumber(settings.whatsappNumber || "");
          setNotificationFrequency(settings.notificationFrequency || "daily");
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

    try {
      // Save profile
      await updateUserProfile(firebaseUser.uid, {
        displayName,
      });

      // Save WhatsApp settings
      await updateUserSettings(firebaseUser.uid, {
        whatsappNumber,
        notificationFrequency,
        language: locale as "fr" | "ar",
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLanguageChange = (newLocale: Locale) => {
    setLocale(newLocale);
  };

  const notificationOptions = [
    { value: "daily", label: t("settings.notifications.daily.label"), desc: t("settings.notifications.daily.description") },
    { value: "weekly", label: t("settings.notifications.weekly.label"), desc: t("settings.notifications.weekly.description") },
    { value: "none", label: t("settings.notifications.none.label"), desc: t("settings.notifications.none.description") },
  ];

  return (
    <>
      <Header title={t("settings.title")} />

      <div className="p-6 max-w-3xl">
        <div className="space-y-6">
          {/* Profile section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {t("settings.profile.title")}
              </CardTitle>
              <CardDescription>
                {t("settings.profile.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">{t("settings.profile.displayName")}</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={t("settings.profile.displayNamePlaceholder")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t("settings.profile.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue={user?.email || ""}
                  disabled
                  className="bg-gray-50"
                />
              </div>
            </CardContent>
          </Card>

          {/* WhatsApp section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                {t("settings.whatsapp.title")}
              </CardTitle>
              <CardDescription>
                {t("settings.whatsapp.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">{t("settings.whatsapp.phone")}</Label>
                <div className="flex gap-2">
                  <Input
                    id="phone"
                    type="tel"
                    placeholder={t("settings.whatsapp.phonePlaceholder")}
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                  />
                </div>
                <p className="text-sm text-gray-500">
                  {t("settings.whatsapp.phoneHint")}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Notifications section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                {t("settings.notifications.title")}
              </CardTitle>
              <CardDescription>
                {t("settings.notifications.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label>{t("settings.notifications.frequency")}</Label>
                <div className="space-y-2">
                  {notificationOptions.map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                        notificationFrequency === option.value
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="frequency"
                        value={option.value}
                        checked={notificationFrequency === option.value}
                        onChange={(e) => setNotificationFrequency(e.target.value as "daily" | "weekly" | "none")}
                        className="h-4 w-4 text-green-600 focus:ring-green-500"
                      />
                      <div>
                        <p className="font-medium text-sm">{option.label}</p>
                        <p className="text-xs text-gray-500">{option.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Language section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                {t("settings.language.title")}
              </CardTitle>
              <CardDescription>
                {t("settings.language.description")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="language">{t("settings.language.label")}</Label>
                <select
                  id="language"
                  value={locale}
                  onChange={(e) => handleLanguageChange(e.target.value as Locale)}
                  className="flex h-9 w-full max-w-xs rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green-500"
                >
                  {locales.map((loc) => (
                    <option key={loc} value={loc}>
                      {localeNames[loc]}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Help section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Aide
              </CardTitle>
              <CardDescription>
                Besoin d'aide pour utiliser Budoor ?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" onClick={startTour}>
                  <HelpCircle className="h-4 w-4" />
                  Relancer le guide
                </Button>
                <Button variant="outline" onClick={resetOnboarding}>
                  <RotateCcw className="h-4 w-4" />
                  Revoir l'introduction
                </Button>
              </div>
              <p className="text-sm text-gray-500">
                Le guide vous montre les fonctionnalites principales de l'application.
              </p>
            </CardContent>
          </Card>

          {/* Save button */}
          <div className="flex justify-end gap-3 items-center">
            {saveSuccess && (
              <span className="flex items-center gap-2 text-green-600 text-sm">
                <CheckCircle className="h-4 w-4" />
                {t("settings.saveSuccess")}
              </span>
            )}
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {t("settings.save")}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
