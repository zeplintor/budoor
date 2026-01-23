"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/dashboard";
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription, Input, Label, Badge, OrganicBlob, GradientMesh } from "@/components/ui";
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

      <div className="p-6 max-w-4xl relative">
        {/* Background decorative elements */}
        <div className="absolute -top-20 -right-20 pointer-events-none">
          <OrganicBlob color="purple" size="xl" animated opacity={0.06} />
        </div>
        <div className="absolute top-1/2 -left-32 pointer-events-none">
          <OrganicBlob color="mint" size="lg" animated opacity={0.08} />
        </div>
        <GradientMesh colors={{ top: 'mint', middle: 'purple', bottom: 'pink' }} />

        <div className="space-y-6 relative">
          {/* Profile section */}
          <Card className="shadow-xl overflow-hidden animate-fade-in-up" style={{ animationDelay: '0ms' }}>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--accent-pink)] to-[var(--accent-purple)]" />

            <CardHeader className="pb-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-[var(--radius-xl)] bg-[var(--accent-pink-light)]">
                  <User className="h-6 w-6 text-[var(--accent-pink-dark)]" />
                </div>
                <div>
                  <CardTitle className="font-display text-2xl">
                    {t("settings.profile.title")}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {t("settings.profile.description")}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-sm font-semibold text-[var(--text-primary)]">
                  {t("settings.profile.displayName")}
                </Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={t("settings.profile.displayNamePlaceholder")}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-[var(--text-primary)]">
                  {t("settings.profile.email")}
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    defaultValue={user?.email || ""}
                    disabled
                    className="bg-[var(--bg-muted)] h-11"
                  />
                  <Badge variant="mint" size="sm" className="absolute right-3 top-1/2 -translate-y-1/2">
                    Vérifié
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* WhatsApp section - Enhanced */}
          <Card className="shadow-xl overflow-hidden animate-fade-in-up border-2 border-[#25D366]/20" style={{ animationDelay: '100ms' }}>
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#25D366] via-[var(--accent-mint)] to-[var(--accent-yellow)]" />

            <CardHeader className="pb-6 bg-gradient-to-br from-[#25D366]/5 to-transparent">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-[var(--radius-xl)] bg-[#25D366]/10 ring-2 ring-[#25D366]/20">
                  <svg className="h-7 w-7 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle className="font-display text-2xl">
                      {t("settings.whatsapp.title")}
                    </CardTitle>
                    {whatsappNumber && (
                      <Badge variant="mint" size="sm">Actif</Badge>
                    )}
                  </div>
                  <CardDescription className="text-base leading-relaxed">
                    Recevez vos rapports quotidiens directement sur WhatsApp avec des liens cliquables pour accéder aux détails complets
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Benefits showcase */}
              <div className="grid sm:grid-cols-3 gap-3 p-4 bg-[var(--bg-muted)] rounded-[var(--radius-lg)] border border-[var(--border-light)]">
                <div className="flex items-start gap-2">
                  <div className="p-1.5 rounded-lg bg-[#25D366]/10">
                    <CheckCircle className="h-4 w-4 text-[#25D366]" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[var(--text-primary)]">Rapports quotidiens</p>
                    <p className="text-[10px] text-[var(--text-secondary)]">Chaque matin à 8h</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="p-1.5 rounded-lg bg-[var(--accent-coral)]/10">
                    <Bell className="h-4 w-4 text-[var(--accent-coral-dark)]" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[var(--text-primary)]">Alertes urgentes</p>
                    <p className="text-[10px] text-[var(--text-secondary)]">En temps réel</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="p-1.5 rounded-lg bg-[var(--accent-mint)]/10">
                    <Globe className="h-4 w-4 text-[var(--accent-mint-dark)]" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[var(--text-primary)]">Liens cliquables</p>
                    <p className="text-[10px] text-[var(--text-secondary)]">Accès aux détails</p>
                  </div>
                </div>
              </div>

              {/* Setup steps */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#25D366] text-white text-xs font-bold flex items-center justify-center">1</div>
                  <h4 className="text-sm font-semibold text-[var(--text-primary)]">Entrez votre numéro WhatsApp</h4>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-semibold text-[var(--text-primary)]">
                    {t("settings.whatsapp.phone")}
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--text-muted)]" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder={t("settings.whatsapp.phonePlaceholder")}
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      className="h-12 pl-11 border-2 focus-visible:border-[#25D366]"
                    />
                  </div>
                  <div className="flex items-start gap-2 p-3 bg-[var(--accent-yellow-light)] rounded-[var(--radius-md)] border border-[var(--accent-yellow)]">
                    <HelpCircle className="h-4 w-4 text-[var(--accent-yellow-dark)] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-[var(--text-primary)] mb-1">Format international requis</p>
                      <p className="text-xs text-[var(--text-secondary)]">
                        Exemple : +212612345678 (Maroc) ou +33612345678 (France)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <div className="w-6 h-6 rounded-full bg-[var(--accent-mint)] text-white text-xs font-bold flex items-center justify-center">2</div>
                  <h4 className="text-sm font-semibold text-[var(--text-primary)]">Cliquez sur Enregistrer en bas de page</h4>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[var(--accent-purple)] text-white text-xs font-bold flex items-center justify-center">3</div>
                  <h4 className="text-sm font-semibold text-[var(--text-primary)]">Recevez votre premier rapport demain matin !</h4>
                </div>
              </div>

              {/* Example preview */}
              {whatsappNumber && (
                <div className="p-4 bg-gradient-to-br from-[#25D366]/10 to-[var(--accent-mint-light)] rounded-[var(--radius-lg)] border-2 border-[#25D366]/30">
                  <div className="flex items-start gap-3 mb-3">
                    <CheckCircle className="h-5 w-5 text-[#25D366] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-primary)] mb-1">Configuration prête !</p>
                      <p className="text-xs text-[var(--text-secondary)]">
                        Les rapports seront envoyés au <span className="font-mono font-semibold text-[var(--text-primary)]">{whatsappNumber}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-[var(--text-secondary)] pl-8">
                    N'oubliez pas de cliquer sur "Enregistrer" en bas de la page pour activer les notifications.
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notifications section */}
          <Card className="shadow-xl overflow-hidden animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--accent-yellow)] to-[var(--accent-coral)]" />

            <CardHeader className="pb-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-[var(--radius-xl)] bg-[var(--accent-yellow-light)]">
                  <Bell className="h-6 w-6 text-[var(--accent-yellow-dark)]" />
                </div>
                <div>
                  <CardTitle className="font-display text-2xl">
                    {t("settings.notifications.title")}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {t("settings.notifications.description")}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-[var(--text-primary)]">
                  {t("settings.notifications.frequency")}
                </Label>
                <div className="space-y-3">
                  {notificationOptions.map((option, index) => (
                    <label
                      key={option.value}
                      className={`group flex items-center gap-4 rounded-[var(--radius-xl)] border-2 p-4 cursor-pointer transition-all duration-300 ${
                        notificationFrequency === option.value
                          ? "border-[var(--accent-mint)] bg-[var(--accent-mint-light)] shadow-md"
                          : "border-[var(--border-light)] hover:border-[var(--accent-mint)] hover:bg-[var(--bg-muted)]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="frequency"
                        value={option.value}
                        checked={notificationFrequency === option.value}
                        onChange={(e) => setNotificationFrequency(e.target.value as "daily" | "weekly" | "none")}
                        className="h-5 w-5 text-[var(--accent-mint)] focus:ring-[var(--accent-mint)] cursor-pointer"
                      />
                      <div className="flex-1">
                        <p className="font-display font-semibold text-base text-[var(--text-primary)] mb-1">
                          {option.label}
                        </p>
                        <p className="text-sm text-[var(--text-secondary)]">{option.desc}</p>
                      </div>
                      {notificationFrequency === option.value && (
                        <Badge variant="mint" size="sm">
                          Actif
                        </Badge>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Language section */}
          <Card className="shadow-xl overflow-hidden animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-pink)]" />

            <CardHeader className="pb-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-[var(--radius-xl)] bg-[var(--accent-purple-light)]">
                  <Globe className="h-6 w-6 text-[var(--accent-purple-dark)]" />
                </div>
                <div>
                  <CardTitle className="font-display text-2xl">
                    {t("settings.language.title")}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {t("settings.language.description")}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="language" className="text-sm font-semibold text-[var(--text-primary)]">
                  {t("settings.language.label")}
                </Label>
                <select
                  id="language"
                  value={locale}
                  onChange={(e) => handleLanguageChange(e.target.value as Locale)}
                  className="flex h-11 w-full max-w-xs rounded-[var(--radius-lg)] border-2 border-[var(--border-light)] bg-white px-4 py-2 text-base font-medium shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-purple)] focus-visible:border-[var(--accent-purple)] transition-all"
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
          <Card className="shadow-xl overflow-hidden animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--accent-coral)] to-[var(--accent-yellow)]" />

            <CardHeader className="pb-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-[var(--radius-xl)] bg-[var(--accent-coral-light)]">
                  <HelpCircle className="h-6 w-6 text-[var(--accent-coral-dark)]" />
                </div>
                <div>
                  <CardTitle className="font-display text-2xl">Aide</CardTitle>
                  <CardDescription className="text-base">
                    Besoin d'aide pour utiliser Budoor ?
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={startTour}
                  className="h-12 justify-start gap-3 hover:bg-[var(--accent-coral-light)] hover:border-[var(--accent-coral)] transition-all"
                >
                  <div className="p-2 rounded-lg bg-[var(--accent-coral-light)]">
                    <HelpCircle className="h-4 w-4 text-[var(--accent-coral-dark)]" />
                  </div>
                  <span className="font-medium">Relancer le guide</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={resetOnboarding}
                  className="h-12 justify-start gap-3 hover:bg-[var(--accent-yellow-light)] hover:border-[var(--accent-yellow)] transition-all"
                >
                  <div className="p-2 rounded-lg bg-[var(--accent-yellow-light)]">
                    <RotateCcw className="h-4 w-4 text-[var(--accent-yellow-dark)]" />
                  </div>
                  <span className="font-medium">Revoir l'introduction</span>
                </Button>
              </div>
              <div className="p-4 rounded-[var(--radius-lg)] bg-[var(--bg-muted)] border border-[var(--border-light)]">
                <p className="text-sm text-[var(--text-secondary)] flex items-center gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--accent-coral)]" />
                  Le guide vous montre les fonctionnalités principales de l'application.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Save button */}
          <div className="flex justify-end gap-4 items-center pt-4 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
            {saveSuccess && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-[var(--radius-lg)] bg-[var(--status-success-light)] animate-scale-in">
                <CheckCircle className="h-5 w-5 text-[var(--status-success)]" />
                <span className="font-medium text-[var(--status-success)]">{t("settings.saveSuccess")}</span>
              </div>
            )}
            <Button
              onClick={handleSave}
              disabled={isSaving}
              size="lg"
              className="h-12 px-8 shadow-lg hover:shadow-xl transition-all"
            >
              {isSaving ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Save className="h-5 w-5" />
              )}
              {t("settings.save")}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
