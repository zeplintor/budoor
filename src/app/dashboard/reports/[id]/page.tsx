"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Header } from "@/components/dashboard";
import { Card, CardContent, CardHeader, CardTitle, Badge, OrganicBlob, GradientMesh } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { CloudSun, Calendar, MapPin, Loader2, AlertTriangle, CheckCircle, TrendingUp, Droplets, Wind, ThermometerSun, Volume2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Report {
  id: string;
  parcelleName: string;
  cultureType: string;
  content: string;
  status: "normal" | "vigilance" | "alerte";
  recommendations: string[];
  weather: {
    temperature: number;
    humidity: number;
    precipitation: number;
    windSpeed: number;
  };
  audioUrl?: string;
  darijaScript?: string;
  createdAt: any;
  debug?: {
    audioGenerated?: boolean;
    audioError?: string;
  };
}

export default function ReportDetailPage() {
  const params = useParams();
  const reportId = params.id as string;
  const { firebaseUser } = useAuth();
  const t = useTranslations();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

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

    try {
      const response = await fetch("/api/generate-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: firebaseUser.uid,
          reportId: report.id,
          parcelleName: report.parcelleName,
          status: report.status,
          summary: report.content,
          recommendations: report.recommendations || [],
          weather: report.weather,
        }),
      });

      if (!response.ok) {
        throw new Error("Échec de la génération audio");
      }

      const data = await response.json();

      if (data.success) {
        // Reload report to get updated audio
        const reportRef = doc(db!, "users", firebaseUser.uid, "reports", reportId);
        const reportSnap = await getDoc(reportRef);

        if (reportSnap.exists()) {
          setReport({
            id: reportSnap.id,
            ...reportSnap.data(),
          } as Report);
        }
      }
    } catch (err) {
      console.error("Error generating audio:", err);
      setAudioError(err instanceof Error ? err.message : "Erreur lors de la génération audio");
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const statusConfig = {
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
  };

  if (loading) {
    return (
      <>
        <Header title="Détails du rapport" />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--accent-mint)]" />
        </div>
      </>
    );
  }

  if (error || !report) {
    return (
      <>
        <Header title="Détails du rapport" />
        <div className="p-6">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8 text-center">
              <AlertTriangle className="h-12 w-12 text-[var(--accent-coral)] mx-auto mb-4" />
              <h2 className="text-xl font-display font-bold text-[var(--text-primary)] mb-2">
                {error || "Rapport introuvable"}
              </h2>
              <p className="text-[var(--text-secondary)]">
                Ce rapport n'existe pas ou vous n'avez pas les permissions pour y accéder.
              </p>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  const status = statusConfig[report.status];
  const StatusIcon = status.icon;

  return (
    <>
      <Header title="Détails du rapport" />

      <div className="p-6 max-w-5xl mx-auto relative">
        {/* Background decorative elements */}
        <div className="absolute -top-20 -right-20 pointer-events-none">
          <OrganicBlob color="mint" size="xl" animated opacity={0.06} />
        </div>
        <div className="absolute top-1/2 -left-32 pointer-events-none">
          <OrganicBlob color="yellow" size="lg" animated opacity={0.08} />
        </div>
        <GradientMesh colors={{ top: 'mint', middle: 'yellow', bottom: 'coral' }} />

        <div className="space-y-6 relative">
          {/* Header Card */}
          <Card className="shadow-xl overflow-hidden animate-fade-in-up">
            <div className={`absolute top-0 left-0 w-full h-1 ${
              report.status === 'alerte' ? 'bg-gradient-to-r from-[var(--accent-coral)] to-[var(--accent-pink)]' :
              report.status === 'vigilance' ? 'bg-gradient-to-r from-[var(--accent-yellow)] to-[var(--accent-coral)]' :
              'bg-gradient-to-r from-[var(--accent-mint)] to-[var(--accent-yellow)]'
            }`} />

            <CardHeader className="pb-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-display font-bold text-[var(--text-primary)]">
                      {report.parcelleName}
                    </h1>
                    <Badge variant={status.color} size="lg" className="shadow-md">
                      <StatusIcon className="h-4 w-4 mr-1" />
                      {status.label}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--text-secondary)]">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{report.cultureType}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {report.createdAt?.toDate?.()?.toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        }) || 'Date inconnue'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Audio generation button */}
          {!report.audioUrl && (
            <Card className="shadow-xl animate-fade-in-up border-2 border-[var(--accent-purple)]/30" style={{ animationDelay: '50ms' }}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-[var(--accent-purple-light)] shrink-0">
                      <Volume2 className="h-5 w-5 text-[var(--accent-purple-dark)]" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-[var(--text-primary)] mb-1">
                        Audio non disponible
                      </p>
                      <p className="text-sm text-[var(--text-secondary)] mb-3">
                        Générez l'audio en darija pour écouter le résumé de votre rapport (~15-20 secondes)
                      </p>
                      <button
                        onClick={handleGenerateAudio}
                        disabled={isGeneratingAudio}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent-purple)] hover:bg-[var(--accent-purple-dark)] text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isGeneratingAudio ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Génération en cours...
                          </>
                        ) : (
                          <>
                            <Volume2 className="h-4 w-4" />
                            Générer l'audio
                          </>
                        )}
                      </button>
                      {audioError && (
                        <div className="mt-3 p-3 rounded-lg bg-[var(--accent-coral-light)] border border-[var(--accent-coral)]">
                          <p className="text-sm text-[var(--accent-coral-dark)]">
                            ⚠️ {audioError}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Audio Summary Card */}
          {report.audioUrl && (
            <Card className="shadow-xl animate-fade-in-up border-2 border-[var(--accent-purple)]/30" style={{ animationDelay: '50ms' }}>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-pink)]" />

              <CardHeader className="pb-4 bg-gradient-to-br from-[var(--accent-purple)]/5 to-transparent">
                <CardTitle className="flex items-center gap-3 font-display text-2xl">
                  <div className="p-2 rounded-[var(--radius-lg)] bg-[var(--accent-purple-light)]">
                    <Volume2 className="h-6 w-6 text-[var(--accent-purple-dark)]" />
                  </div>
                  Résumé audio en darija
                  <Badge variant="purple" size="sm">Nouveau</Badge>
                </CardTitle>
                <p className="text-sm text-[var(--text-secondary)] mt-2">
                  Écoutez votre rapport agronomique en dialecte marocain (~1 minute)
                </p>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {/* Audio Player */}
                  <div className="p-6 rounded-[var(--radius-xl)] bg-gradient-to-br from-[var(--accent-purple-light)] to-[var(--accent-pink-light)] border-2 border-[var(--accent-purple)]">
                    <audio
                      controls
                      className="w-full"
                      style={{
                        filter: 'hue-rotate(250deg)',
                      }}
                    >
                      <source src={report.audioUrl} type="audio/mpeg" />
                      Votre navigateur ne supporte pas la lecture audio.
                    </audio>
                  </div>

                  {/* Darija Script (if available) */}
                  {report.darijaScript && (
                    <details className="group">
                      <summary className="cursor-pointer list-none p-4 rounded-[var(--radius-lg)] bg-[var(--bg-muted)] hover:bg-[var(--bg-muted)]/70 transition-colors border border-[var(--border-light)]">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-[var(--text-primary)]">
                            📝 Voir le script en darija
                          </span>
                          <svg
                            className="h-5 w-5 text-[var(--text-secondary)] group-open:rotate-180 transition-transform"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </summary>
                      <div className="mt-3 p-4 rounded-[var(--radius-lg)] bg-white border border-[var(--border-light)]">
                        <p className="text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap text-right" dir="rtl" style={{ fontFamily: 'var(--font-arabic)' }}>
                          {report.darijaScript}
                        </p>
                      </div>
                    </details>
                  )}

                  {/* Info box */}
                  <div className="flex items-start gap-3 p-4 rounded-[var(--radius-lg)] bg-[var(--accent-mint-light)] border border-[var(--accent-mint)]">
                    <div className="p-1.5 rounded-full bg-[var(--accent-mint)] shrink-0">
                      <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-[var(--text-primary)] mb-1">
                        Rapport audio personnalisé
                      </p>
                      <p className="text-xs text-[var(--text-secondary)]">
                        Ce résumé audio a été généré automatiquement en dialecte marocain (darija) pour faciliter la compréhension des recommandations agricoles.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Weather Card */}
          <Card className="shadow-xl animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 font-display text-2xl">
                <div className="p-2 rounded-[var(--radius-lg)] bg-[var(--accent-yellow-light)]">
                  <CloudSun className="h-6 w-6 text-[var(--accent-yellow-dark)]" />
                </div>
                Conditions météorologiques
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-[var(--radius-xl)] bg-[var(--accent-coral-light)] border-2 border-[var(--accent-coral)]">
                  <ThermometerSun className="h-6 w-6 text-[var(--accent-coral-dark)] mb-2" />
                  <p className="text-2xl font-display font-bold text-[var(--text-primary)]">
                    {report.weather.temperature}°C
                  </p>
                  <p className="text-sm text-[var(--text-secondary)]">Température</p>
                </div>

                <div className="p-4 rounded-[var(--radius-xl)] bg-[var(--accent-mint-light)] border-2 border-[var(--accent-mint)]">
                  <Droplets className="h-6 w-6 text-[var(--accent-mint-dark)] mb-2" />
                  <p className="text-2xl font-display font-bold text-[var(--text-primary)]">
                    {report.weather.humidity}%
                  </p>
                  <p className="text-sm text-[var(--text-secondary)]">Humidité</p>
                </div>

                <div className="p-4 rounded-[var(--radius-xl)] bg-[var(--accent-purple-light)] border-2 border-[var(--accent-purple)]">
                  <CloudSun className="h-6 w-6 text-[var(--accent-purple-dark)] mb-2" />
                  <p className="text-2xl font-display font-bold text-[var(--text-primary)]">
                    {report.weather.precipitation}mm
                  </p>
                  <p className="text-sm text-[var(--text-secondary)]">Précipitations</p>
                </div>

                <div className="p-4 rounded-[var(--radius-xl)] bg-[var(--accent-yellow-light)] border-2 border-[var(--accent-yellow)]">
                  <Wind className="h-6 w-6 text-[var(--accent-yellow-dark)] mb-2" />
                  <p className="text-2xl font-display font-bold text-[var(--text-primary)]">
                    {report.weather.windSpeed} km/h
                  </p>
                  <p className="text-sm text-[var(--text-secondary)]">Vent</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Report Content */}
          <Card className="shadow-xl animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 font-display text-2xl">
                <div className="p-2 rounded-[var(--radius-lg)] bg-[var(--accent-pink-light)]">
                  <TrendingUp className="h-6 w-6 text-[var(--accent-pink-dark)]" />
                </div>
                Rapport détaillé
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm md:prose-base max-w-none">
                <div className="whitespace-pre-wrap text-[var(--text-primary)] leading-relaxed">
                  {report.content}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          {report.recommendations && report.recommendations.length > 0 && (
            <Card className="shadow-xl animate-fade-in-up" style={{ animationDelay: '300ms' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 font-display text-2xl">
                  <div className="p-2 rounded-[var(--radius-lg)] bg-[var(--accent-mint-light)]">
                    <CheckCircle className="h-6 w-6 text-[var(--accent-mint-dark)]" />
                  </div>
                  Recommandations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {report.recommendations.map((recommendation, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 p-4 rounded-[var(--radius-lg)] bg-[var(--bg-muted)] border border-[var(--border-light)]"
                    >
                      <div className="p-1.5 rounded-full bg-[var(--accent-mint)] mt-0.5 shrink-0">
                        <CheckCircle className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-[var(--text-primary)] flex-1">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* WhatsApp Info */}
          <Card className="shadow-xl animate-fade-in-up bg-gradient-to-br from-[var(--accent-mint-light)] to-[var(--accent-yellow-light)]" style={{ animationDelay: '400ms' }}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-[#25D366]">
                  <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-display font-semibold text-lg text-[var(--text-primary)] mb-1">
                    Rapport envoyé par WhatsApp
                  </p>
                  <p className="text-sm text-[var(--text-primary)]/80">
                    Ce rapport vous a été automatiquement envoyé sur WhatsApp. Configurez vos préférences de notification dans les réglages.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
