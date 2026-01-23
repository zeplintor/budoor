"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/dashboard";
import { Card, CardContent, CardHeader, CardTitle, Badge, OrganicBlob, GradientMesh } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { Map, CloudSun, AlertTriangle, TrendingUp, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { getParcelles } from "@/lib/firebase/parcelles";
import { getReports } from "@/lib/firebase/reports";
import { getWeatherData } from "@/lib/api/openMeteo";

export default function DashboardPage() {
  const t = useTranslations();
  const { user, firebaseUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [parcellesCount, setParcellesCount] = useState(0);
  const [reportsCount, setReportsCount] = useState(0);
  const [alertsCount, setAlertsCount] = useState(0);
  const [currentTemp, setCurrentTemp] = useState<string>("--");

  useEffect(() => {
    async function loadDashboardData() {
      if (!firebaseUser) return;

      try {
        setIsLoading(true);

        // Fetch parcelles
        const parcelles = await getParcelles(firebaseUser.uid);
        setParcellesCount(parcelles.length);

        // Fetch weather for first parcelle
        if (parcelles.length > 0) {
          try {
            const weather = await getWeatherData(
              parcelles[0].centroid.lat,
              parcelles[0].centroid.lng
            );
            setCurrentTemp(`${Math.round(weather.current.temperature)}°C`);
          } catch (err) {
            console.error("Error fetching weather:", err);
          }
        }

        // Fetch reports
        const reports = await getReports(firebaseUser.uid);
        setReportsCount(reports.length);

        // Count alerts (reports with "alerte" or "vigilance" status)
        const alertReports = reports.filter(
          (r) => r.status === "alerte" || r.status === "vigilance"
        );
        setAlertsCount(alertReports.length);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, [firebaseUser]);

  const stats = [
    {
      title: t("dashboard.stats.parcelles.title"),
      value: isLoading ? null : parcellesCount.toString(),
      icon: Map,
      description: t("dashboard.stats.parcelles.description"),
      color: "pink" as const,
    },
    {
      title: t("dashboard.stats.weather.title"),
      value: isLoading ? null : currentTemp,
      icon: CloudSun,
      description: t("dashboard.stats.weather.description"),
      color: "yellow" as const,
    },
    {
      title: t("dashboard.stats.alerts.title"),
      value: isLoading ? null : alertsCount.toString(),
      icon: AlertTriangle,
      description: t("dashboard.stats.alerts.description"),
      color: "coral" as const,
    },
    {
      title: t("dashboard.stats.reports.title"),
      value: isLoading ? null : reportsCount.toString(),
      icon: TrendingUp,
      description: t("dashboard.stats.reports.description"),
      color: "mint" as const,
    },
  ];

  const accentMap = {
    pink: {
      bg: 'bg-[var(--accent-pink-light)]',
      text: 'text-[var(--accent-pink-dark)]',
      icon: 'text-[var(--accent-pink)]',
    },
    yellow: {
      bg: 'bg-[var(--accent-yellow-light)]',
      text: 'text-[var(--accent-yellow-dark)]',
      icon: 'text-[var(--accent-yellow)]',
    },
    coral: {
      bg: 'bg-[var(--accent-coral-light)]',
      text: 'text-[var(--accent-coral-dark)]',
      icon: 'text-[var(--accent-coral)]',
    },
    mint: {
      bg: 'bg-[var(--accent-mint-light)]',
      text: 'text-[var(--accent-mint-dark)]',
      icon: 'text-[var(--accent-mint)]',
    },
    purple: {
      bg: 'bg-[var(--accent-purple-light)]',
      text: 'text-[var(--accent-purple-dark)]',
      icon: 'text-[var(--accent-purple)]',
    },
  };

  return (
    <>
      <Header title={t("dashboard.title")} />

      <div className="p-6 relative">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 pointer-events-none">
          <OrganicBlob color="mint" size="lg" animated opacity={0.08} />
        </div>
        <GradientMesh colors={{ top: 'pink', middle: 'yellow', bottom: 'mint' }} />

        {/* Welcome message */}
        <div className="mb-8 relative">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-[var(--text-primary)] mb-2">
            {t("dashboard.welcome", { name: user?.displayName || t("dashboard.welcomeDefault") })}
          </h2>
          <p className="text-base md:text-lg text-[var(--text-secondary)]">
            {t("dashboard.overview")}
          </p>
        </div>

        {/* WhatsApp CTA Banner */}
        <div className="mb-8 relative">
          <a
            href="/dashboard/settings"
            className="block group relative overflow-hidden bg-gradient-to-br from-[#25D366]/10 via-[var(--accent-mint-light)] to-[var(--accent-yellow-light)] rounded-[var(--radius-2xl)] p-6 md:p-8 border-2 border-[#25D366]/30 hover:border-[#25D366]/50 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            {/* Background decoration */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#25D366]/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500" />

            <div className="relative flex flex-col md:flex-row items-center gap-6">
              {/* WhatsApp icon */}
              <div className="shrink-0">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-[var(--radius-xl)] bg-[#25D366] flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                  <svg className="h-9 w-9 md:h-11 md:w-11 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                  <h3 className="text-xl md:text-2xl font-display font-bold text-[var(--text-primary)]">
                    Activez les rapports WhatsApp
                  </h3>
                  <div className="px-3 py-1 rounded-full bg-[#25D366] text-white text-xs font-bold animate-pulse">
                    NOUVEAU
                  </div>
                </div>
                <p className="text-sm md:text-base text-[var(--text-secondary)] mb-1">
                  Recevez vos rapports quotidiens directement sur WhatsApp avec des liens cliquables pour accéder aux détails complets
                </p>
                <p className="text-xs md:text-sm text-[var(--text-muted)] flex items-center gap-2 justify-center md:justify-start">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#25D366]" />
                  Configuration en 2 minutes • Aucune application à télécharger
                </p>
              </div>

              {/* Arrow/Button */}
              <div className="shrink-0">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#25D366] group-hover:bg-[#128C7E] transition-colors shadow-lg">
                  <ArrowRight className="h-6 w-6 text-white group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </a>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8 relative">
          {stats.map((stat, index) => (
            <div
              key={stat.title}
              className="relative overflow-hidden bg-[var(--bg-secondary)] rounded-[var(--radius-xl)] p-6 shadow-[var(--shadow-card)] card-float group animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Decorative blob */}
              <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition-opacity bg-[var(--accent-${stat.color})]`} />

              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-[var(--radius-lg)] ${accentMap[stat.color].bg}`}>
                    <stat.icon className={`h-6 w-6 ${accentMap[stat.color].icon}`} />
                  </div>
                  {stat.value !== null && parseInt(stat.value) > 0 && (
                    <Badge variant={stat.color} size="sm">Actif</Badge>
                  )}
                </div>

                <div className="mb-2">
                  {stat.value === null ? (
                    <span className="inline-block w-16 h-10 bg-[var(--bg-muted)] rounded-[var(--radius-md)] animate-pulse" />
                  ) : (
                    <p className="text-3xl md:text-4xl font-display font-bold text-[var(--text-primary)]">
                      {stat.value}
                    </p>
                  )}
                </div>

                <p className="text-xs font-medium text-[var(--text-secondary)] mb-1">
                  {stat.title}
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  {stat.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <Card className="relative overflow-hidden">
          <CardHeader>
            <CardTitle className="font-display text-xl">{t("dashboard.quickActions.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <a
                href="/dashboard/parcelles"
                className="group flex items-center gap-4 rounded-[var(--radius-xl)] border-2 border-[var(--border-light)] p-5 hover:border-[var(--accent-mint)] hover:bg-[var(--accent-mint-light)] transition-all duration-300"
              >
                <div className="p-3 rounded-[var(--radius-lg)] bg-[var(--accent-mint-light)] group-hover:bg-[var(--accent-mint)] group-hover:scale-110 transition-all duration-300">
                  <Map className="h-6 w-6 text-[var(--accent-mint-dark)] group-hover:text-[var(--text-primary)]" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-base text-[var(--text-primary)] mb-1">
                    {t("dashboard.quickActions.addParcelle.title")}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {t("dashboard.quickActions.addParcelle.description")}
                  </p>
                </div>
              </a>

              <a
                href="/dashboard/settings"
                className="group flex items-center gap-4 rounded-[var(--radius-xl)] border-2 border-[var(--border-light)] p-5 hover:border-[var(--accent-yellow)] hover:bg-[var(--accent-yellow-light)] transition-all duration-300"
              >
                <div className="p-3 rounded-[var(--radius-lg)] bg-[var(--accent-yellow-light)] group-hover:bg-[var(--accent-yellow)] group-hover:scale-110 transition-all duration-300">
                  <CloudSun className="h-6 w-6 text-[var(--accent-yellow-dark)] group-hover:text-[var(--text-primary)]" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-base text-[var(--text-primary)] mb-1">
                    {t("dashboard.quickActions.configureAlerts.title")}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {t("dashboard.quickActions.configureAlerts.description")}
                  </p>
                </div>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
