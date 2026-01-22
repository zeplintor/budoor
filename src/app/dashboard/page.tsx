"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { Map, CloudSun, AlertTriangle, TrendingUp } from "lucide-react";
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
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: t("dashboard.stats.weather.title"),
      value: isLoading ? null : currentTemp,
      icon: CloudSun,
      description: t("dashboard.stats.weather.description"),
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: t("dashboard.stats.alerts.title"),
      value: isLoading ? null : alertsCount.toString(),
      icon: AlertTriangle,
      description: t("dashboard.stats.alerts.description"),
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
    {
      title: t("dashboard.stats.reports.title"),
      value: isLoading ? null : reportsCount.toString(),
      icon: TrendingUp,
      description: t("dashboard.stats.reports.description"),
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
  ];

  return (
    <>
      <Header title={t("dashboard.title")} />

      <div className="p-6">
        {/* Welcome message */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {t("dashboard.welcome", { name: user?.displayName || t("dashboard.welcomeDefault") })}
          </h2>
          <p className="text-gray-500">
            {t("dashboard.overview")}
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  {stat.title}
                </CardTitle>
                <div className={`rounded-full p-2 ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stat.value === null ? (
                    <span className="inline-block w-8 h-6 bg-gray-200 rounded animate-pulse" />
                  ) : (
                    stat.value
                  )}
                </div>
                <p className="text-xs text-gray-500">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick actions */}
        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.quickActions.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <a
                href="/dashboard/parcelles"
                className="flex items-center gap-4 rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="rounded-full bg-green-100 p-3">
                  <Map className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium">{t("dashboard.quickActions.addParcelle.title")}</h3>
                  <p className="text-sm text-gray-500">
                    {t("dashboard.quickActions.addParcelle.description")}
                  </p>
                </div>
              </a>

              <a
                href="/dashboard/settings"
                className="flex items-center gap-4 rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="rounded-full bg-blue-100 p-3">
                  <CloudSun className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium">{t("dashboard.quickActions.configureAlerts.title")}</h3>
                  <p className="text-sm text-gray-500">
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
