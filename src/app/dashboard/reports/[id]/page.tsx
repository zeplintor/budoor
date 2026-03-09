"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { Header } from "@/components/dashboard";
import { useAuth } from "@/contexts/AuthContext";
import { CloudSun, Calendar, MapPin, Loader2, AlertTriangle, CheckCircle, Droplets, Wind, ThermometerSun, Volume2, ShieldAlert, Zap, ArrowRight, Download } from "lucide-react";
import { getDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Report {
  id: string;
  parcelleId: string;
  parcelleName: string;
  generatedAt: any;
  status: "ok" | "vigilance" | "alerte";
  summary: string;
  weatherAnalysis: string;
  soilAnalysis: string;
  recommendations: string[];
  diseaseRisk: {
    level: "low" | "medium" | "high";
    diseases: string[];
    preventiveActions: string[];
  };
  irrigationAdvice: string;
  nextActions: {
    action: string;
    priority: "high" | "medium" | "low";
    timing: string;
  }[];
  weeklyForecast: string;
  audioUrl?: string;
  darijaScript?: string;
  createdAt: any;
  debug?: {
    audioGenerated?: boolean;
    audioError?: string;
  };
  // Legacy fields for backward compatibility
  content?: string;
  cultureType?: string;
  weather?: {
    temperature: number;
    humidity: number;
    precipitation: number;
    windSpeed: number;
  };
}

const AUDIO_STEPS = [
  { label: "Génération du script en darija…", duration: 8000 },
  { label: "Synthèse vocale ElevenLabs…", duration: 10000 },
  { label: "Enregistrement de l'audio…", duration: 4000 },
];

export default function ReportDetailPage() {
  const params = useParams();
  const reportId = params.id as string;
  const { firebaseUser } = useAuth();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioStep, setAudioStep] = useState(0);
  const [audioError, setAudioError] = useState<string | null>(null);
  const audioStepIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function loadReport() {
      if (!firebaseUser || !reportId || !db) return;

      try {
        setLoading(true);
        const reportRef = doc(db, "users", firebaseUser.uid, "reports", reportId);
        const reportSnap = await getDoc(reportRef);

        if (reportSnap.exists()) {
          const reportData = {
            id: reportSnap.id,
            ...reportSnap.data(),
          } as Report;
          console.log("📊 Report loaded:", {
            id: reportData.id,
            parcelleName: reportData.parcelleName,
            hasAudioUrl: !!reportData.audioUrl,
            audioUrl: reportData.audioUrl,
            keys: Object.keys(reportSnap.data())
          });
          setReport(reportData);
        } else {
          setError("Rapport introuvable");
        }
      } catch (err) {
        console.error("Error loading report:", err);
        setError("Erreur lors du chargement du rapport");
      } finally {
        setLoading(false);
      }
    }

    loadReport();
  }, [firebaseUser, reportId]);

  const handleGenerateAudio = async () => {
    if (!firebaseUser || !report) return;

    setIsGeneratingAudio(true);
    setAudioError(null);
    setAudioStep(0);

    // Cycle through visual steps every ~8 seconds
    let step = 0;
    audioStepIntervalRef.current = setInterval(() => {
      step = Math.min(step + 1, AUDIO_STEPS.length - 1);
      setAudioStep(step);
    }, 8000);

    try {
      const audioStatus = report.status === "ok" ? "normal" : report.status;

      const response = await fetch("/api/generate-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: firebaseUser.uid,
          reportId: report.id,
          parcelleName: report.parcelleName,
          status: audioStatus,
          summary: report.summary || report.content || "",
          recommendations: report.recommendations || [],
          weather: report.weather || { temperature: 20, humidity: 60, precipitation: 0, windSpeed: 10 },
        }),
      });

      if (!response.ok) {
        let errMsg = "Échec de la génération audio";
        try {
          const errData = await response.json();
          if (errData.error) errMsg = errData.error;
        } catch {}
        throw new Error(errMsg);
      }

      const data = await response.json();

      if (data.success) {
        // Write audioUrl + darijaScript to Firestore using the client SDK
        // (the service account used server-side lacks Firestore IAM permissions)
        const reportRef = doc(db!, "users", firebaseUser.uid, "reports", reportId);
        await updateDoc(reportRef, {
          audioUrl: data.audioUrl,
          darijaScript: data.darijaScript,
        });
        const reportSnap = await getDoc(reportRef);
        if (reportSnap.exists()) {
          setReport({ id: reportSnap.id, ...reportSnap.data() } as Report);
        }
      }
    } catch (err) {
      console.error("Error generating audio:", err);
      setAudioError(err instanceof Error ? err.message : "Erreur lors de la génération audio");
    } finally {
      if (audioStepIntervalRef.current) clearInterval(audioStepIntervalRef.current);
      setIsGeneratingAudio(false);
    }
  };

  const statusConfig = {
    ok: {
      label: "Normal",
      icon: CheckCircle,
      color: "mint" as const,
      bgColor: "bg-[var(--accent-mint-light)]",
      textColor: "text-[var(--accent-mint-dark)]",
    },
    normal: {
      label: "Normal",
      icon: CheckCircle,
      color: "mint" as const,
      bgColor: "bg-[var(--accent-mint-light)]",
      textColor: "text-[var(--accent-mint-dark)]",
    },
    vigilance: {
      label: "Vigilance",
      icon: AlertTriangle,
      color: "yellow" as const,
      bgColor: "bg-[var(--accent-yellow-light)]",
      textColor: "text-[var(--accent-yellow-dark)]",
    },
    alerte: {
      label: "Alerte",
      icon: AlertTriangle,
      color: "coral" as const,
      bgColor: "bg-[var(--accent-coral-light)]",
      textColor: "text-[var(--accent-coral-dark)]",
    },
  } as const;

  if (loading) {
    return (
      <>
        <Header title="Détails du rapport" />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: "var(--accent-green)" }} />
        </div>
      </>
    );
  }

  if (error || !report) {
    return (
      <>
        <Header title="Détails du rapport" />
        <div className="p-6">
          <div
            className="max-w-2xl mx-auto rounded-xl border p-8 text-center"
            style={{ background: "white", borderColor: "var(--border-light)", boxShadow: "var(--shadow-card)" }}
          >
            <AlertTriangle className="h-10 w-10 mx-auto mb-4" style={{ color: "var(--accent-coral)" }} />
            <h2 className="text-xl font-display font-bold mb-2" style={{ color: "var(--text-primary)" }}>
              {error || "Rapport introuvable"}
            </h2>
            <p style={{ color: "var(--text-secondary)" }}>
              Ce rapport n'existe pas ou vous n'avez pas les permissions pour y accéder.
            </p>
          </div>
        </div>
      </>
    );
  }

  const status = statusConfig[report.status];
  const StatusIcon = status.icon;

  const statusBorderColor =
    report.status === "alerte" ? "var(--accent-coral)" :
    report.status === "vigilance" ? "var(--accent-gold)" :
    "var(--accent-green)";

  const statusBg =
    report.status === "alerte" ? "var(--accent-coral-light)" :
    report.status === "vigilance" ? "var(--accent-gold-light)" :
    "var(--accent-green-light)";

  const statusTextColor =
    report.status === "alerte" ? "var(--accent-coral)" :
    report.status === "vigilance" ? "var(--accent-gold)" :
    "var(--accent-green)";

  const diseaseRiskColor =
    report.diseaseRisk?.level === "high" ? "var(--accent-coral)" :
    report.diseaseRisk?.level === "medium" ? "var(--accent-gold)" :
    "var(--accent-green)";

  const diseaseRiskBg =
    report.diseaseRisk?.level === "high" ? "var(--accent-coral-light)" :
    report.diseaseRisk?.level === "medium" ? "var(--accent-gold-light)" :
    "var(--accent-green-light)";

  const diseaseRiskLabel =
    report.diseaseRisk?.level === "high" ? "Risque élevé" :
    report.diseaseRisk?.level === "medium" ? "Risque modéré" :
    "Risque faible";

  const dateLabel =
    report.createdAt?.toDate?.()?.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) ||
    report.generatedAt?.toDate?.()?.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) ||
    "Date inconnue";

  const cardStyle = { background: "white", borderColor: "var(--border-light)", boxShadow: "var(--shadow-card)" };

  return (
    <>
      <Header title="Détails du rapport" />

      <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-4 sm:space-y-5">

        {/* ── Print-only branding header ─────────────────── */}
        <div
          data-print-header=""
          className="hidden items-center justify-between mb-6 pb-4 border-b"
          style={{ borderColor: "var(--border-light)" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--accent-green)" }}>
              <div className="w-4 h-4 bg-white rounded-sm" />
            </div>
            <span className="font-display font-bold text-lg" style={{ color: "var(--text-primary)" }}>Budoor</span>
          </div>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>budoor.me · Rapport généré par IA</span>
        </div>

        {/* ── Toolbar ───────────────────────────────────── */}
        <div className="flex justify-end" data-print-hide="">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all hover:bg-[var(--bg-muted)] active:scale-[0.98]"
            style={{ borderColor: "var(--border-light)", color: "var(--text-secondary)", background: "white" }}
          >
            <Download className="h-4 w-4" />
            Exporter PDF
          </button>
        </div>

        {/* ── Header ────────────────────────────────────── */}
        <div
          className="rounded-xl border p-4 sm:p-5 animate-fade-in-up"
          style={{ ...cardStyle, borderLeftWidth: "4px", borderLeftColor: statusBorderColor }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="font-display font-bold text-xl sm:text-2xl md:text-3xl mb-1" style={{ color: "var(--text-primary)" }}>
                {report.parcelleName}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-sm" style={{ color: "var(--text-secondary)" }}>
                {report.cultureType && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {report.cultureType}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {dateLabel}
                </span>
              </div>
            </div>
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold shrink-0"
              style={{ background: statusBg, color: statusTextColor }}
            >
              <StatusIcon className="h-4 w-4" />
              {status.label}
            </span>
          </div>

          {/* Summary */}
          {report.summary && (
            <p className="mt-4 text-sm leading-relaxed" style={{ color: "var(--text-primary)" }}>
              {report.summary}
            </p>
          )}
          {!report.summary && report.content && (
            <p className="mt-4 text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "var(--text-primary)" }}>
              {report.content}
            </p>
          )}
        </div>

        {/* ── Weather strip ─────────────────────────────── */}
        {report.weather && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fade-in-up" style={{ animationDelay: "70ms" }}>
            {[
              { icon: ThermometerSun, value: `${report.weather.temperature}°C`, label: "Température", iconBg: "var(--accent-coral-light)", iconColor: "var(--accent-coral)" },
              { icon: Droplets, value: `${report.weather.humidity}%`, label: "Humidité", iconBg: "var(--accent-green-light)", iconColor: "var(--accent-green)" },
              { icon: CloudSun, value: `${report.weather.precipitation} mm`, label: "Précipitations", iconBg: "var(--accent-purple-light)", iconColor: "var(--accent-purple)" },
              { icon: Wind, value: `${report.weather.windSpeed} km/h`, label: "Vent", iconBg: "var(--accent-gold-light)", iconColor: "var(--accent-gold)" },
            ].map((m) => (
              <div key={m.label} className="rounded-xl border p-4" style={cardStyle}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ background: m.iconBg }}>
                  <m.icon className="h-4 w-4" style={{ color: m.iconColor }} />
                </div>
                <p className="font-display font-bold text-xl" style={{ color: "var(--text-primary)" }}>{m.value}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{m.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Disease Risk ──────────────────────────────── */}
        {report.diseaseRisk && (
          <div
            className="rounded-xl border p-4 sm:p-5 animate-fade-in-up"
            style={{ animationDelay: "100ms", ...cardStyle, borderColor: diseaseRiskColor }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: diseaseRiskBg }}>
                <ShieldAlert className="h-5 w-5" style={{ color: diseaseRiskColor }} />
              </div>
              <div>
                <p className="font-display font-bold text-base" style={{ color: "var(--text-primary)" }}>
                  Risque phytosanitaire
                </p>
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: diseaseRiskBg, color: diseaseRiskColor }}
                >
                  {diseaseRiskLabel}
                </span>
              </div>
            </div>

            {report.diseaseRisk.diseases && report.diseaseRisk.diseases.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--text-muted)" }}>
                  Maladies détectées
                </p>
                <div className="flex flex-wrap gap-2">
                  {report.diseaseRisk.diseases.map((d, i) => (
                    <span
                      key={i}
                      className="text-sm px-2.5 py-1 rounded-lg border"
                      style={{ background: diseaseRiskBg, borderColor: diseaseRiskColor, color: diseaseRiskColor }}
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {report.diseaseRisk.preventiveActions && report.diseaseRisk.preventiveActions.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--text-muted)" }}>
                  Actions préventives
                </p>
                <ul className="space-y-1.5">
                  {report.diseaseRisk.preventiveActions.map((a, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "var(--text-primary)" }}>
                      <ArrowRight className="h-3.5 w-3.5 mt-0.5 shrink-0" style={{ color: diseaseRiskColor }} />
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* ── Recommendations ───────────────────────────── */}
        {report.recommendations && report.recommendations.length > 0 && (
          <div className="rounded-xl border p-4 sm:p-5 animate-fade-in-up" style={{ animationDelay: "140ms", ...cardStyle }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: "var(--accent-green-light)" }}>
                <CheckCircle className="h-5 w-5" style={{ color: "var(--accent-green)" }} />
              </div>
              <p className="font-display font-bold text-base" style={{ color: "var(--text-primary)" }}>
                Recommandations IA
              </p>
            </div>
            <ul className="space-y-2.5">
              {report.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                    style={{ background: "var(--accent-green-light)", color: "var(--accent-green)" }}
                  >
                    {i + 1}
                  </span>
                  <span className="text-sm leading-relaxed" style={{ color: "var(--text-primary)" }}>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ── Next Actions ──────────────────────────────── */}
        {report.nextActions && report.nextActions.length > 0 && (
          <div className="rounded-xl border p-4 sm:p-5 animate-fade-in-up" style={{ animationDelay: "170ms", ...cardStyle }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: "var(--accent-gold-light)" }}>
                <Zap className="h-5 w-5" style={{ color: "var(--accent-gold)" }} />
              </div>
              <p className="font-display font-bold text-base" style={{ color: "var(--text-primary)" }}>
                Actions à planifier
              </p>
            </div>
            <div className="space-y-2">
              {report.nextActions.map((action, i) => {
                const priorityColor =
                  action.priority === "high" ? "var(--accent-coral)" :
                  action.priority === "medium" ? "var(--accent-gold)" :
                  "var(--accent-green)";
                const priorityBg =
                  action.priority === "high" ? "var(--accent-coral-light)" :
                  action.priority === "medium" ? "var(--accent-gold-light)" :
                  "var(--accent-green-light)";
                const priorityLabel =
                  action.priority === "high" ? "Urgent" :
                  action.priority === "medium" ? "Moyen" : "Faible";
                return (
                  <div
                    key={i}
                    className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 rounded-lg border"
                    style={{ borderColor: "var(--border-light)" }}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full shrink-0"
                        style={{ background: priorityBg, color: priorityColor }}
                      >
                        {priorityLabel}
                      </span>
                      <span className="text-sm" style={{ color: "var(--text-primary)" }}>{action.action}</span>
                    </div>
                    {action.timing && (
                      <span className="text-xs sm:shrink-0 pl-0 sm:pl-2" style={{ color: "var(--text-muted)" }}>{action.timing}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Detailed Analysis ─────────────────────────── */}
        {(report.weatherAnalysis || report.soilAnalysis || report.irrigationAdvice || report.weeklyForecast) && (
          <div className="rounded-xl border animate-fade-in-up" style={{ animationDelay: "200ms", ...cardStyle }}>
            <details className="group">
              <summary className="cursor-pointer list-none p-5 flex items-center justify-between">
                <p className="font-display font-bold text-base" style={{ color: "var(--text-primary)" }}>
                  Analyse détaillée
                </p>
                <svg className="h-4 w-4 transition-transform group-open:rotate-180" style={{ color: "var(--text-muted)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-5 pb-5 space-y-5 border-t" style={{ borderColor: "var(--border-light)" }}>
                {report.weatherAnalysis && (
                  <div className="pt-4">
                    <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--text-muted)" }}>Analyse météo</p>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "var(--text-primary)" }}>{report.weatherAnalysis}</p>
                  </div>
                )}
                {report.soilAnalysis && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--text-muted)" }}>Analyse du sol</p>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "var(--text-primary)" }}>{report.soilAnalysis}</p>
                  </div>
                )}
                {report.irrigationAdvice && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--text-muted)" }}>Conseils d'irrigation</p>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "var(--text-primary)" }}>{report.irrigationAdvice}</p>
                  </div>
                )}
                {report.weeklyForecast && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--text-muted)" }}>Prévisions hebdomadaires</p>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "var(--text-primary)" }}>{report.weeklyForecast}</p>
                  </div>
                )}
              </div>
            </details>
          </div>
        )}

        {/* ── Audio ─────────────────────────────────────── */}
        <div className="rounded-xl border p-4 sm:p-5 animate-fade-in-up" data-print-hide="" style={{ animationDelay: "230ms", ...cardStyle }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: "var(--accent-green-light)" }}>
              <Volume2 className="h-5 w-5" style={{ color: "var(--accent-green)" }} />
            </div>
            <p className="font-display font-bold text-base" style={{ color: "var(--text-primary)" }}>
              Résumé audio en darija
            </p>
          </div>

          {report.audioUrl ? (
            <div className="space-y-3">
              <audio controls className="w-full rounded-lg">
                <source src={report.audioUrl} type="audio/mpeg" />
                Votre navigateur ne supporte pas la lecture audio.
              </audio>
              {report.darijaScript && (
                <details className="group">
                  <summary className="cursor-pointer list-none flex items-center justify-between p-3 rounded-lg border text-sm font-medium transition-colors hover:bg-[var(--bg-muted)]" style={{ borderColor: "var(--border-light)", color: "var(--text-primary)" }}>
                    Voir le script en darija
                    <svg className="h-4 w-4 transition-transform group-open:rotate-180" style={{ color: "var(--text-muted)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="mt-2 p-4 rounded-lg border" style={{ borderColor: "var(--border-light)" }}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap text-right" dir="rtl" style={{ color: "var(--text-primary)", fontFamily: "var(--font-arabic)" }}>
                      {report.darijaScript}
                    </p>
                  </div>
                </details>
              )}
            </div>
          ) : isGeneratingAudio ? (
            <div className="space-y-2">
              {AUDIO_STEPS.map((step, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg border transition-all duration-500"
                  style={{
                    background: i < audioStep ? "var(--accent-green-light)" : i === audioStep ? "var(--bg-muted)" : "transparent",
                    borderColor: i < audioStep ? "var(--accent-green)" : i === audioStep ? "var(--border-light)" : "var(--border-light)",
                    opacity: i > audioStep ? 0.4 : 1,
                  }}
                >
                  {i < audioStep ? (
                    <CheckCircle className="h-4 w-4 shrink-0" style={{ color: "var(--accent-green)" }} />
                  ) : i === audioStep ? (
                    <Loader2 className="h-4 w-4 animate-spin shrink-0" style={{ color: "var(--text-secondary)" }} />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 shrink-0" style={{ borderColor: "var(--border-light)" }} />
                  )}
                  <p className="text-sm" style={{ color: i === audioStep ? "var(--text-primary)" : "var(--text-secondary)", fontWeight: i === audioStep ? 500 : 400 }}>
                    {step.label}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Obtenez un résumé audio narré en darija marocain (~20 secondes).
              </p>
              <button
                onClick={handleGenerateAudio}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ background: "var(--accent-green)" }}
              >
                <Volume2 className="h-4 w-4" />
                Générer l'audio en darija
              </button>
              {audioError && (
                <div className="flex items-start gap-2 p-3 rounded-lg border text-sm" style={{ background: "var(--accent-coral-light)", borderColor: "rgba(220,38,38,0.2)", color: "var(--accent-coral)" }}>
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  {audioError}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── WhatsApp info ─────────────────────────────── */}
        <div
          data-print-hide=""
          className="rounded-xl border p-4 flex items-center gap-4 animate-fade-in-up"
          style={{ animationDelay: "260ms", ...cardStyle }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#25D366" }}>
            <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>Rapport envoyé par WhatsApp</p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Configurez vos préférences dans les réglages.
            </p>
          </div>
        </div>

      </div>
    </>
  );
}
