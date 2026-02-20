"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/dashboard";
import {
  Loader2,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Sprout,
  Clock,
  FileText,
  ChevronRight,
  Volume2,
  Map,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getParcelles } from "@/lib/firebase/parcelles";
import { saveReport, getReports, deleteReport, type SavedReport } from "@/lib/firebase/reports";
import { getParcelleData } from "@/lib/api/parcelleData";
import { generateReport } from "@/lib/api/claudeService";
import type { Parcelle } from "@/types";
import Link from "next/link";
import { useRouter } from "next/navigation";

const GENERATION_STEPS = [
  "Collecte des données météo...",
  "Analyse du sol en cours...",
  "Génération du rapport IA...",
  "Finalisation et enregistrement...",
];

export default function ReportsPage() {
  const router = useRouter();
  const { firebaseUser } = useAuth();
  const [parcelles, setParcelles] = useState<Parcelle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [generationStep, setGenerationStep] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(false);

  useEffect(() => {
    async function loadParcelles() {
      if (!firebaseUser) return;
      try {
        setIsLoading(true);
        const data = await getParcelles(firebaseUser.uid);
        setParcelles(data);
      } catch (err) {
        console.error("Error loading parcelles:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadParcelles();
  }, [firebaseUser]);

  useEffect(() => {
    async function loadReports() {
      if (!firebaseUser) return;
      try {
        setIsLoadingReports(true);
        const reports = await getReports(firebaseUser.uid);
        setSavedReports(reports);
      } catch (err) {
        console.error("Error loading reports:", err);
      } finally {
        setIsLoadingReports(false);
      }
    }
    loadReports();
  }, [firebaseUser]);

  const handleGenerateReport = async (parcelle: Parcelle) => {
    if (!firebaseUser || generatingId) return;

    setGeneratingId(parcelle.id);
    setErrors((prev) => ({ ...prev, [parcelle.id]: "" }));
    setGenerationStep(GENERATION_STEPS[0]);

    try {
      const data = await getParcelleData(parcelle);
      setGenerationStep(GENERATION_STEPS[1]);

      if (!data.weather || !data.soil || !data.elevation) {
        const missing = [];
        if (!data.weather) missing.push("météo");
        if (!data.soil) missing.push("sol");
        if (!data.elevation) missing.push("topographie");
        throw new Error(`Données manquantes : ${missing.join(", ")}`);
      }

      setGenerationStep(GENERATION_STEPS[2]);
      const report = await generateReport({
        parcelle,
        weather: data.weather,
        soil: data.soil,
        elevation: data.elevation,
      });

      setGenerationStep(GENERATION_STEPS[3]);
      const firestoreDocId = await saveReport(firebaseUser.uid, report);

      const reports = await getReports(firebaseUser.uid);
      setSavedReports(reports);

      router.push(`/dashboard/reports/${firestoreDocId}`);
    } catch (err) {
      console.error("Error generating report:", err);
      setErrors((prev) => ({
        ...prev,
        [parcelle.id]: err instanceof Error ? err.message : "Erreur lors de la génération",
      }));
    } finally {
      setGeneratingId(null);
    }
  };

  const handleDeleteReport = async (reportId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!firebaseUser) return;
    if (!confirm("Supprimer ce rapport ?")) return;
    try {
      await deleteReport(firebaseUser.uid, reportId);
      setSavedReports((prev) => prev.filter((r) => r.odId !== reportId));
    } catch (err) {
      console.error("Error deleting report:", err);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "alerte":
        return {
          label: "Alerte",
          Icon: AlertTriangle,
          pillBg: "bg-red-50",
          pillBorder: "border-red-200",
          pillText: "text-red-700",
          dot: "bg-red-500",
          iconColor: "text-red-500",
          cardBg: "bg-red-50",
        };
      case "vigilance":
        return {
          label: "Vigilance",
          Icon: AlertCircle,
          pillBg: "bg-amber-50",
          pillBorder: "border-amber-200",
          pillText: "text-amber-700",
          dot: "bg-amber-500",
          iconColor: "text-amber-500",
          cardBg: "bg-amber-50",
        };
      default:
        return {
          label: "Optimal",
          Icon: CheckCircle,
          pillBg: "bg-emerald-50",
          pillBorder: "border-emerald-200",
          pillText: "text-emerald-700",
          dot: "bg-emerald-500",
          iconColor: "text-emerald-500",
          cardBg: "bg-emerald-50",
        };
    }
  };

  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });

  const formatDateFull = (date: Date) =>
    new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  // Latest report per parcelle for quick status display
  const lastReportByParcelle = savedReports.reduce(
    (acc, report) => {
      if (
        !acc[report.parcelleId] ||
        new Date(report.generatedAt) > new Date(acc[report.parcelleId].generatedAt)
      ) {
        acc[report.parcelleId] = report;
      }
      return acc;
    },
    {} as Record<string, SavedReport>
  );

  const alertsCount = savedReports.filter(
    (r) => r.status === "alerte" || r.status === "vigilance"
  ).length;

  return (
    <>
      <Header title="Rapports IA" />

      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-8 pb-24 md:pb-8">

        {/* ── Stats row ── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: savedReports.length, label: "Rapports", textColor: "text-gray-900" },
            {
              value: alertsCount,
              label: "Alertes",
              textColor: alertsCount > 0 ? "text-red-600" : "text-emerald-600",
            },
            { value: parcelles.length, label: "Parcelles", textColor: "text-gray-900" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center"
            >
              <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* ── Parcelles ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Sprout className="h-4 w-4 text-emerald-600" />
              Vos parcelles
            </h2>
            <Link
              href="/dashboard/parcelles"
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
            >
              Gérer →
            </Link>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-7 w-7 animate-spin text-emerald-500" />
            </div>
          ) : parcelles.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center">
              <Map className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="font-semibold text-gray-900 mb-1">Aucune parcelle</p>
              <p className="text-sm text-gray-500 mb-5">
                Commencez par tracer votre première parcelle sur la carte.
              </p>
              <Link href="/dashboard/parcelles">
                <button className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 active:scale-95 transition-all shadow-sm">
                  Ajouter une parcelle
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {parcelles.map((parcelle) => {
                const lastReport = lastReportByParcelle[parcelle.id];
                const isGenerating = generatingId === parcelle.id;
                const errorMsg = errors[parcelle.id];
                const sc = lastReport ? getStatusConfig(lastReport.status) : null;

                return (
                  <div
                    key={parcelle.id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-all duration-200"
                  >
                    {/* Card header */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                        <Sprout className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate text-sm">
                          {parcelle.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {parcelle.culture.type} · {parcelle.areaHectares} ha
                        </p>
                      </div>
                    </div>

                    {/* Status */}
                    {sc ? (
                      <div
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${sc.pillBg} ${sc.pillBorder} mb-3`}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                        <p className={`text-xs font-medium ${sc.pillText}`}>{sc.label}</p>
                        <span className="text-xs text-gray-400 ml-auto">
                          {formatDate(lastReport!.generatedAt)}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border bg-gray-50 border-gray-100 mb-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                        <p className="text-xs font-medium text-gray-400">Aucun rapport</p>
                      </div>
                    )}

                    {/* Generation progress */}
                    {isGenerating && (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 border border-blue-100 mb-3">
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600 shrink-0" />
                        <p className="text-xs font-medium text-blue-700 truncate">
                          {generationStep}
                        </p>
                      </div>
                    )}

                    {/* Error */}
                    {errorMsg && (
                      <div className="flex items-start gap-2 px-3 py-2 rounded-xl bg-red-50 border border-red-100 mb-3">
                        <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-red-600">{errorMsg}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 mt-1">
                      {lastReport && (
                        <Link
                          href={`/dashboard/reports/${lastReport.odId}`}
                          className="flex-1 text-center px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all"
                        >
                          Voir le rapport →
                        </Link>
                      )}
                      <button
                        onClick={() => handleGenerateReport(parcelle)}
                        disabled={!!generatingId}
                        className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white ${
                          !lastReport ? "flex-1" : ""
                        }`}
                      >
                        {isGenerating ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : lastReport ? (
                          <RefreshCw className="h-3.5 w-3.5" />
                        ) : (
                          <Sparkles className="h-3.5 w-3.5" />
                        )}
                        {lastReport ? "Nouveau" : "Générer"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── History feed ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" />
              Historique
            </h2>
            <span className="text-sm text-gray-400">
              {savedReports.length} rapport{savedReports.length > 1 ? "s" : ""}
            </span>
          </div>

          {isLoadingReports ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-7 w-7 animate-spin text-gray-300" />
            </div>
          ) : savedReports.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center">
              <FileText className="h-10 w-10 text-gray-200 mx-auto mb-3" />
              <p className="font-semibold text-gray-900 mb-1">Aucun rapport</p>
              <p className="text-sm text-gray-400">
                Sélectionnez une parcelle ci-dessus pour générer votre premier rapport.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {savedReports.map((report, index) => {
                const sc = getStatusConfig(report.status);
                const StatusIcon = sc.Icon;
                return (
                  <Link
                    key={report.odId}
                    href={`/dashboard/reports/${report.odId}`}
                    className={`flex items-center gap-4 px-4 py-3.5 hover:bg-gray-50 active:bg-gray-100 transition-colors group ${
                      index < savedReports.length - 1 ? "border-b border-gray-50" : ""
                    }`}
                  >
                    <div className={`p-2 rounded-xl shrink-0 ${sc.cardBg}`}>
                      <StatusIcon className={`h-4 w-4 ${sc.iconColor}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">
                        {report.parcelleName}
                      </p>
                      <p className="text-xs text-gray-400 truncate mt-0.5">
                        {formatDateFull(report.generatedAt)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {report.audioUrl && (
                        <div className="p-1.5 rounded-lg bg-purple-50">
                          <Volume2 className="h-3.5 w-3.5 text-purple-400" />
                        </div>
                      )}
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${sc.pillBg} ${sc.pillBorder} ${sc.pillText} hidden sm:inline-flex`}
                      >
                        {sc.label}
                      </span>
                      <button
                        onClick={(e) => handleDeleteReport(report.odId, e)}
                        className="p-1.5 rounded-lg text-gray-200 hover:text-red-400 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                        title="Supprimer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                      <ChevronRight className="h-4 w-4 text-gray-200 group-hover:text-gray-400 transition-colors" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
