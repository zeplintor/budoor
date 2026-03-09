"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/dashboard";
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
        const parcelles = await getParcelles(firebaseUser.uid);
        setParcellesCount(parcelles.length);
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
        const reports = await getReports(firebaseUser.uid);
        setReportsCount(reports.length);
        setAlertsCount(
          reports.filter((r) => r.status === "alerte" || r.status === "vigilance").length
        );
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
      iconBg: "var(--accent-green-light)",
      iconColor: "var(--accent-green)",
    },
    {
      title: t("dashboard.stats.weather.title"),
      value: isLoading ? null : currentTemp,
      icon: CloudSun,
      description: t("dashboard.stats.weather.description"),
      iconBg: "var(--accent-gold-light)",
      iconColor: "var(--accent-gold)",
    },
    {
      title: t("dashboard.stats.alerts.title"),
      value: isLoading ? null : alertsCount.toString(),
      icon: AlertTriangle,
      description: t("dashboard.stats.alerts.description"),
      iconBg: "var(--accent-coral-light)",
      iconColor: "var(--accent-coral)",
    },
    {
      title: t("dashboard.stats.reports.title"),
      value: isLoading ? null : reportsCount.toString(),
      icon: TrendingUp,
      description: t("dashboard.stats.reports.description"),
      iconBg: "var(--accent-purple-light)",
      iconColor: "var(--accent-purple)",
    },
  ];

  return (
    <>
      <Header title={t("dashboard.title")} />

      <div className="p-6 space-y-5">
        {/* Welcome */}
        <div>
          <h2
            className="font-display font-bold text-2xl md:text-3xl mb-1"
            style={{ color: "var(--text-primary)" }}
          >
            {t("dashboard.welcome", {
              name: user?.displayName || t("dashboard.welcomeDefault"),
            })}
          </h2>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {t("dashboard.overview")}
          </p>
        </div>

        {/* WhatsApp CTA — flat card */}
        <a
          href="/dashboard/settings"
          className="group flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 hover:border-[#25D366]"
          style={{
            background: "white",
            borderColor: "var(--border-light)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "#25D366" }}
          >
            <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                Activez les rapports WhatsApp
              </p>
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ background: "var(--accent-green-light)", color: "var(--accent-green)" }}
              >
                Nouveau
              </span>
            </div>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Configuration en 2 minutes · Rapports quotidiens sur WhatsApp
            </p>
          </div>

          <ArrowRight
            className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5"
            style={{ color: "var(--text-muted)" }}
          />
        </a>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((stat, i) => (
            <div
              key={stat.title}
              className="rounded-xl p-4 border animate-fade-in-up"
              style={{
                background: "white",
                borderColor: "var(--border-light)",
                boxShadow: "var(--shadow-card)",
                animationDelay: `${i * 70}ms`,
              }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
                style={{ background: stat.iconBg }}
              >
                <stat.icon className="h-4 w-4" style={{ color: stat.iconColor }} />
              </div>

              {stat.value === null ? (
                <div
                  className="h-7 w-12 rounded animate-pulse mb-1"
                  style={{ background: "var(--bg-muted)" }}
                />
              ) : (
                <p
                  className="font-display font-bold text-2xl mb-0.5"
                  style={{ color: "var(--text-primary)" }}
                >
                  {stat.value}
                </p>
              )}

              <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                {stat.title}
              </p>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div
          className="rounded-xl border p-5"
          style={{
            background: "white",
            borderColor: "var(--border-light)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <p
            className="font-display font-bold text-sm mb-4"
            style={{ color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em" }}
          >
            {t("dashboard.quickActions.title")}
          </p>

          <div className="grid gap-2.5 md:grid-cols-2">
            {[
              {
                href: "/dashboard/parcelles",
                icon: Map,
                title: t("dashboard.quickActions.addParcelle.title"),
                desc: t("dashboard.quickActions.addParcelle.description"),
                color: "var(--accent-green)",
                colorLight: "var(--accent-green-light)",
              },
              {
                href: "/dashboard/settings",
                icon: CloudSun,
                title: t("dashboard.quickActions.configureAlerts.title"),
                desc: t("dashboard.quickActions.configureAlerts.description"),
                color: "var(--accent-gold)",
                colorLight: "var(--accent-gold-light)",
              },
            ].map((action) => (
              <a
                key={action.href}
                href={action.href}
                className="group flex items-center gap-3 rounded-lg border p-3.5 transition-colors duration-150"
                style={{ borderColor: "var(--border-light)" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = action.color;
                  (e.currentTarget as HTMLAnchorElement).style.background = action.colorLight;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border-light)";
                  (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                }}
              >
                <div
                  className="p-2 rounded-lg shrink-0"
                  style={{ background: action.colorLight }}
                >
                  <action.icon className="h-4 w-4" style={{ color: action.color }} />
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                    {action.title}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {action.desc}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
