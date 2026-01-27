"use client";

import { useState, useEffect, useRef } from "react";
import { Header } from "@/components/dashboard";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui";
import {
  FileText,
  Loader2,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Droplets,
  Bug,
  ListChecks,
  CloudSun,
  Layers,
  ChevronDown,
  ChevronUp,
  Map,
  Download,
  Share2,
  Sprout,
  MapPin,
  Ruler,
  History,
  Trash2,
  Clock,
  Volume2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getParcelles } from "@/lib/firebase/parcelles";
import { saveReport, getReports, deleteReport, type SavedReport } from "@/lib/firebase/reports";
import { getParcelleData } from "@/lib/api/parcelleData";
import { generateReport, type AgronomicReport } from "@/lib/api/claudeService";
import type { Parcelle } from "@/types";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function ReportsPage() {
  const t = useTranslations();
  const { firebaseUser } = useAuth();
  const [parcelles, setParcelles] = useState<Parcelle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedParcelle, setSelectedParcelle] = useState<Parcelle | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>("");
  const [currentReport, setCurrentReport] = useState<AgronomicReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const [activeTab, setActiveTab] = useState<"generate" | "history">("generate");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    parcelle: true,
    weather: true,
    soil: true,
    recommendations: true,
    disease: true,
    irrigation: true,
    audio: false,
    actions: true,
  });
  const reportRef = useRef<HTMLDivElement>(null);

  // Load parcelles
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

  // Load saved reports
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
    if (!firebaseUser) return;

    setSelectedParcelle(parcelle);
    setError(null);
    setIsGenerating(true);
    setCurrentReport(null);
    setGenerationStep("Collecte des données de la parcelle...");

    try {
      const data = await getParcelleData(parcelle);

      // Check if we have all required data
      if (!data.weather || !data.soil || !data.elevation) {
        const missing = [];
        if (!data.weather) missing.push("météo");
        if (!data.soil) missing.push("sol");
        if (!data.elevation) missing.push("topographie");
        throw new Error(`Données manquantes: ${missing.join(", ")}. Veuillez réessayer.`);
      }

      setGenerationStep("Génération du rapport agronomique avec IA...");
      const report = await generateReport({
        parcelle,
        weather: data.weather,
        soil: data.soil,
        elevation: data.elevation,
      });

      setGenerationStep("Finalisation du rapport...");
      setCurrentReport(report);

      // Save report to Firestore
      setGenerationStep("Enregistrement du rapport...");
      await saveReport(firebaseUser.uid, report);

      // Note: Audio generation is now manual via button in report details

      // Reload saved reports
      const reports = await getReports(firebaseUser.uid);
      setSavedReports(reports);
    } catch (err) {
      console.error("Error generating report:", err);
      setError(err instanceof Error ? err.message : t("reports.errorTitle"));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleViewReport = (report: SavedReport) => {
    // Find the corresponding parcelle
    const parcelle = parcelles.find(p => p.id === report.parcelleId);
    if (parcelle) {
      setSelectedParcelle(parcelle);
    }
    setCurrentReport(report);
    setActiveTab("generate");
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!firebaseUser) return;
    if (!confirm(t("reports.deleteConfirm"))) return;

    try {
      await deleteReport(firebaseUser.uid, reportId);
      setSavedReports(prev => prev.filter(r => r.odId !== reportId));
    } catch (err) {
      console.error("Error deleting report:", err);
    }
  };

  const handleDownloadPdf = async () => {
    if (!currentReport || !selectedParcelle) return;

    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();

    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;
    const margin = 15;
    const lineHeight = 7;

    // Helper function to add wrapped text
    const addWrappedText = (text: string, x: number, startY: number, maxWidth: number): number => {
      const lines = doc.splitTextToSize(text, maxWidth);
      doc.text(lines, x, startY);
      return startY + (lines.length * lineHeight);
    };

    // Title
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text(`Rapport - ${currentReport.parcelleName}`, margin, y);
    y += 10;

    // Status
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    const statusText = currentReport.status === "ok" ? "Optimal" : currentReport.status === "vigilance" ? "Vigilance" : "Alerte";
    doc.text(`Statut: ${statusText}`, margin, y);
    y += lineHeight;

    // Date
    doc.text(`Date: ${formatDate(currentReport.generatedAt)}`, margin, y);
    y += lineHeight;

    // Parcelle info
    doc.text(`Culture: ${selectedParcelle.culture.type} | Surface: ${selectedParcelle.areaHectares} ha`, margin, y);
    y += lineHeight * 2;

    // Summary
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Resume", margin, y);
    y += lineHeight;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    y = addWrappedText(currentReport.summary, margin, y, pageWidth - margin * 2);
    y += lineHeight;

    // Weather Analysis
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Analyse Meteo", margin, y);
    y += lineHeight;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    y = addWrappedText(currentReport.weatherAnalysis, margin, y, pageWidth - margin * 2);
    y += lineHeight;

    // Check if we need a new page
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    // Soil Analysis
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Analyse du Sol", margin, y);
    y += lineHeight;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    y = addWrappedText(currentReport.soilAnalysis, margin, y, pageWidth - margin * 2);
    y += lineHeight;

    // Recommendations
    if (y > 220) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Recommandations", margin, y);
    y += lineHeight;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    currentReport.recommendations.forEach((rec) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      y = addWrappedText(`- ${rec}`, margin, y, pageWidth - margin * 2);
    });
    y += lineHeight;

    // Irrigation
    if (y > 240) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Conseils Irrigation", margin, y);
    y += lineHeight;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    y = addWrappedText(currentReport.irrigationAdvice, margin, y, pageWidth - margin * 2);
    y += lineHeight;

    // Footer
    doc.setFontSize(8);
    doc.text("Rapport genere par Budoor", margin, 285);

    // Save
    doc.save(`rapport-${currentReport.parcelleName}-${new Date().toISOString().split("T")[0]}.pdf`);
  };

  const handleShareWhatsapp = () => {
    if (!currentReport || !selectedParcelle) return;

    const statusEmoji = currentReport.status === "ok" ? "✅" : currentReport.status === "vigilance" ? "⚠️" : "🚨";
    const statusText = t(`reports.status.${currentReport.status}`);

    const message = `🌾 *${t("reports.title")} - ${currentReport.parcelleName}*
${statusEmoji} ${statusText}

📍 ${selectedParcelle.culture.type} | ${selectedParcelle.areaHectares} ha

📋 *${t("reports.sections.recommendations")}:*
${currentReport.recommendations.slice(0, 3).map(r => `• ${r}`).join("\n")}

💧 *${t("reports.sections.irrigation")}:*
${currentReport.irrigationAdvice}

🌱 ${t("reports.poweredBy")}`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, "_blank");
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "alerte":
        return "bg-red-100 text-red-700 border-red-300";
      case "vigilance":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      default:
        return "bg-green-100 text-green-700 border-green-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "alerte":
        return <AlertTriangle className="h-5 w-5" />;
      case "vigilance":
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <CheckCircle className="h-5 w-5" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700";
      case "medium":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-green-100 text-green-700";
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "high":
        return "text-red-600";
      case "medium":
        return "text-yellow-600";
      default:
        return "text-green-600";
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <Header title={t("reports.title")} />

      <div className="p-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left sidebar - Tabs */}
          <div className="lg:col-span-1 space-y-4">
            {/* Tab buttons */}
            <div className="bg-gray-100 p-1 rounded-xl flex">
              <button
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
                  activeTab === "generate"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                onClick={() => setActiveTab("generate")}
              >
                <Sparkles className="h-4 w-4" />
                {t("reports.generateReport")}
              </button>
              <button
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
                  activeTab === "history"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                onClick={() => setActiveTab("history")}
              >
                <History className="h-4 w-4" />
                {t("reports.history")}
              </button>
            </div>

            {activeTab === "generate" ? (
              /* Parcelles list */
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Map className="h-5 w-5 text-green-600" />
                    {t("reports.myParcelles")}
                  </CardTitle>
                  <CardDescription>
                    {t("reports.selectParcelle")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-green-600" />
                    </div>
                  ) : parcelles.length === 0 ? (
                    <div className="text-center py-8">
                      <Map className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 mb-4">{t("reports.noParcelle")}</p>
                      <Link href="/dashboard/parcelles">
                        <Button size="sm">{t("reports.createParcelle")}</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {parcelles.map((parcelle) => (
                        <div
                          key={parcelle.id}
                          className="p-4 rounded-lg border-2 border-gray-200 hover:border-green-300 hover:shadow-md transition-all bg-white"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-full bg-green-100 text-green-600">
                              <Sprout className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{parcelle.name}</p>
                              <p className="text-sm text-gray-500">
                                {parcelle.culture.type} • {parcelle.areaHectares} ha
                              </p>
                            </div>
                          </div>

                          {/* Generate button directly on card */}
                          <Button
                            className="w-full"
                            size="sm"
                            disabled={isGenerating && selectedParcelle?.id === parcelle.id}
                            onClick={() => handleGenerateReport(parcelle)}
                          >
                            {isGenerating && selectedParcelle?.id === parcelle.id ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                {t("reports.generating")}
                              </>
                            ) : (
                              <>
                                <Sparkles className="h-4 w-4" />
                                {t("reports.generateReport")}
                              </>
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              /* Reports history - Improved design */
              <div className="space-y-4">
                {/* Header with count */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <History className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{t("reports.history")}</h3>
                      <p className="text-sm text-gray-500">
                        {savedReports.length} {t("reports.savedReports")}
                      </p>
                    </div>
                  </div>
                </div>

                {isLoadingReports ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
                      <p className="text-sm text-gray-500 mt-2">{t("common.loading")}</p>
                    </div>
                  </div>
                ) : savedReports.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="py-12">
                      <div className="text-center">
                        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <FileText className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="font-medium text-gray-900 mb-1">{t("reports.empty")}</p>
                        <p className="text-sm text-gray-500 mb-4">{t("reports.historyEmptyDesc")}</p>
                        <Button variant="outline" size="sm" onClick={() => setActiveTab("generate")}>
                          <Sparkles className="h-4 w-4" />
                          {t("reports.generateFirst")}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                    {savedReports.map((report) => {
                      const parcelle = parcelles.find(p => p.id === report.parcelleId);
                      const isSelected = currentReport?.id === report.id;

                      return (
                        <Card
                          key={report.odId}
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            isSelected
                              ? "ring-2 ring-blue-500 shadow-md"
                              : "hover:border-gray-300"
                          }`}
                          onClick={() => handleViewReport(report)}
                        >
                          <CardContent className="p-4">
                            {/* Header with status and delete */}
                            <div className="flex items-start justify-between mb-3">
                              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(report.status)}`}>
                                {getStatusIcon(report.status)}
                                {t(`reports.status.${report.status}`)}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteReport(report.odId);
                                }}
                                className="p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                                title={t("common.delete")}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>

                            {/* Parcelle info */}
                            <div className="flex items-center gap-3 mb-3">
                              <div className="p-2 bg-green-100 rounded-lg">
                                <Sprout className="h-5 w-5 text-green-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 truncate">
                                  {report.parcelleName}
                                </p>
                                {parcelle && (
                                  <p className="text-sm text-gray-500">
                                    {parcelle.culture.type} • {parcelle.areaHectares} ha
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Summary preview */}
                            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                              {report.summary}
                            </p>

                            {/* Footer with date and quick actions */}
                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                <Clock className="h-3.5 w-3.5" />
                                {formatDate(report.generatedAt)}
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setCurrentReport(report);
                                    setSelectedParcelle(parcelle || null);
                                    handleDownloadPdf();
                                  }}
                                  className="p-1.5 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                                  title={t("reports.downloadPdf")}
                                >
                                  <Download className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setCurrentReport(report);
                                    setSelectedParcelle(parcelle || null);
                                    handleShareWhatsapp();
                                  }}
                                  className="p-1.5 rounded text-gray-400 hover:text-green-600 hover:bg-green-50 transition-all"
                                  title={t("reports.shareWhatsapp")}
                                >
                                  <Share2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Report display */}
          <div className="lg:col-span-2">
            {isGenerating ? (
              <Card>
                <CardContent className="py-16">
                  <div className="max-w-md mx-auto">
                    <div className="text-center mb-8">
                      <div className="relative mx-auto w-16 h-16 mb-4">
                        <Sprout className="h-16 w-16 text-green-600 animate-pulse" />
                      </div>
                      <p className="text-lg font-medium text-gray-900">
                        {t("reports.generating")}
                      </p>
                      <p className="text-gray-500 mt-2">
                        {t("reports.generatingDesc")}
                      </p>
                    </div>

                    {/* Progress steps */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border-2 border-green-200">
                        <Loader2 className="h-5 w-5 text-green-600 animate-spin flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-green-900">{generationStep}</p>
                        </div>
                      </div>

                      {/* Progress timeline */}
                      <div className="pl-8 pt-2 space-y-2 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Collecte des données météo, sol et topographie</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Loader2 className={`h-4 w-4 ${generationStep.includes("IA") || generationStep.includes("Finalisation") || generationStep.includes("Enregistrement") ? "text-green-500" : "text-gray-300"} animate-spin`} />
                          <span className={generationStep.includes("IA") || generationStep.includes("Finalisation") || generationStep.includes("Enregistrement") ? "text-gray-900 font-medium" : ""}>
                            Analyse agronomique par intelligence artificielle
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Loader2 className={`h-4 w-4 ${generationStep.includes("Finalisation") || generationStep.includes("Enregistrement") ? "text-green-500" : "text-gray-300"} animate-spin`} />
                          <span className={generationStep.includes("Finalisation") || generationStep.includes("Enregistrement") ? "text-gray-900 font-medium" : ""}>
                            Génération du script audio en darija
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Loader2 className={`h-4 w-4 ${generationStep.includes("Enregistrement") ? "text-green-500" : "text-gray-300"} animate-spin`} />
                          <span className={generationStep.includes("Enregistrement") ? "text-gray-900 font-medium" : ""}>
                            Synthèse vocale et enregistrement
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 text-center">
                      <p className="text-xs text-gray-400">Temps estimé: 20-30 secondes</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : error ? (
              <Card className="border-red-300 bg-red-50">
                <CardContent className="py-8">
                  <div className="text-center">
                    <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-lg font-medium text-red-700">
                      {t("reports.errorTitle")}
                    </p>
                    <p className="text-red-600 mt-2">{error}</p>
                    <Button
                      className="mt-4"
                      variant="outline"
                      onClick={() => selectedParcelle && handleGenerateReport(selectedParcelle)}
                    >
                      {t("reports.retry")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : currentReport && selectedParcelle ? (
              <div className="space-y-4" ref={reportRef}>
                {/* Report Header with actions */}
                <Card className={`border-2 ${getStatusColor(currentReport.status)}`}>
                  <CardContent className="py-4">
                    <div className="flex items-center gap-4">
                      {getStatusIcon(currentReport.status)}
                      <div className="flex-1">
                        <h2 className="text-xl font-bold">{currentReport.parcelleName}</h2>
                        <p className="text-sm opacity-80">
                          {t("reports.generatedAt")}{" "}
                          {formatDate(currentReport.generatedAt)}
                        </p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-sm font-medium capitalize">
                        {t(`reports.status.${currentReport.status}`)}
                      </span>
                    </div>
                    {/* Action buttons */}
                    <div className="flex gap-2 mt-4 pt-4 border-t border-current border-opacity-20">
                      <Button size="sm" variant="outline" onClick={handleDownloadPdf}>
                        <Download className="h-4 w-4" />
                        {t("reports.downloadPdf")}
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleShareWhatsapp}>
                        <Share2 className="h-4 w-4" />
                        {t("reports.shareWhatsapp")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Parcelle Info Card */}
                <Card>
                  <CardHeader
                    className="cursor-pointer py-3"
                    onClick={() => toggleSection("parcelle")}
                  >
                    <CardTitle className="flex items-center justify-between text-base">
                      <span className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-green-600" />
                        {t("reports.parcelleInfo")}
                      </span>
                      {expandedSections.parcelle ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </CardTitle>
                  </CardHeader>
                  {expandedSections.parcelle && (
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <Sprout className="h-6 w-6 text-green-600 mx-auto mb-1" />
                          <p className="text-sm text-gray-500">Culture</p>
                          <p className="font-medium">{selectedParcelle.culture.type}</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <Ruler className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                          <p className="text-sm text-gray-500">Surface</p>
                          <p className="font-medium">{selectedParcelle.areaHectares} ha</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <MapPin className="h-6 w-6 text-red-600 mx-auto mb-1" />
                          <p className="text-sm text-gray-500">Latitude</p>
                          <p className="font-medium">{selectedParcelle.centroid.lat.toFixed(4)}</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <MapPin className="h-6 w-6 text-red-600 mx-auto mb-1" />
                          <p className="text-sm text-gray-500">Longitude</p>
                          <p className="font-medium">{selectedParcelle.centroid.lng.toFixed(4)}</p>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>

                {/* Summary */}
                <Card>
                  <CardContent className="py-4">
                    <p className="text-gray-700 leading-relaxed">{currentReport.summary}</p>
                  </CardContent>
                </Card>

                {/* Weather Analysis */}
                <Card>
                  <CardHeader
                    className="cursor-pointer py-3"
                    onClick={() => toggleSection("weather")}
                  >
                    <CardTitle className="flex items-center justify-between text-base">
                      <span className="flex items-center gap-2">
                        <CloudSun className="h-5 w-5 text-blue-500" />
                        {t("reports.sections.weather")}
                      </span>
                      {expandedSections.weather ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </CardTitle>
                  </CardHeader>
                  {expandedSections.weather && (
                    <CardContent className="pt-0">
                      <p className="text-gray-700">{currentReport.weatherAnalysis}</p>
                      {currentReport.weeklyForecast && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                          <p className="font-medium text-blue-800 mb-1">{t("reports.sections.weeklyForecast")}</p>
                          <p className="text-blue-700 text-sm">{currentReport.weeklyForecast}</p>
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>

                {/* Soil Analysis */}
                <Card>
                  <CardHeader
                    className="cursor-pointer py-3"
                    onClick={() => toggleSection("soil")}
                  >
                    <CardTitle className="flex items-center justify-between text-base">
                      <span className="flex items-center gap-2">
                        <Layers className="h-5 w-5 text-amber-600" />
                        {t("reports.sections.soil")}
                      </span>
                      {expandedSections.soil ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </CardTitle>
                  </CardHeader>
                  {expandedSections.soil && (
                    <CardContent className="pt-0">
                      <p className="text-gray-700">{currentReport.soilAnalysis}</p>
                    </CardContent>
                  )}
                </Card>

                {/* Recommendations */}
                <Card>
                  <CardHeader
                    className="cursor-pointer py-3"
                    onClick={() => toggleSection("recommendations")}
                  >
                    <CardTitle className="flex items-center justify-between text-base">
                      <span className="flex items-center gap-2">
                        <ListChecks className="h-5 w-5 text-green-600" />
                        {t("reports.sections.recommendations")}
                      </span>
                      {expandedSections.recommendations ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </CardTitle>
                  </CardHeader>
                  {expandedSections.recommendations && (
                    <CardContent className="pt-0">
                      <ul className="space-y-2">
                        {currentReport.recommendations.map((rec, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  )}
                </Card>

                {/* Disease Risk */}
                <Card>
                  <CardHeader
                    className="cursor-pointer py-3"
                    onClick={() => toggleSection("disease")}
                  >
                    <CardTitle className="flex items-center justify-between text-base">
                      <span className="flex items-center gap-2">
                        <Bug className="h-5 w-5 text-purple-600" />
                        {t("reports.sections.disease")}
                        <span
                          className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${getRiskColor(
                            currentReport.diseaseRisk.level
                          )}`}
                        >
                          {t(`reports.diseaseRisk.${currentReport.diseaseRisk.level}`)}
                        </span>
                      </span>
                      {expandedSections.disease ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </CardTitle>
                  </CardHeader>
                  {expandedSections.disease && (
                    <CardContent className="pt-0">
                      {currentReport.diseaseRisk.diseases.length > 0 && (
                        <div className="mb-4">
                          <p className="font-medium text-gray-900 mb-2">{t("reports.diseaseRisk.toWatch")}:</p>
                          <ul className="list-disc list-inside text-gray-700 space-y-1">
                            {currentReport.diseaseRisk.diseases.map((d, i) => (
                              <li key={i}>{d}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {currentReport.diseaseRisk.preventiveActions.length > 0 && (
                        <div>
                          <p className="font-medium text-gray-900 mb-2">{t("reports.diseaseRisk.preventive")}:</p>
                          <ul className="list-disc list-inside text-gray-700 space-y-1">
                            {currentReport.diseaseRisk.preventiveActions.map((a, i) => (
                              <li key={i}>{a}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>

                {/* Irrigation */}
                <Card>
                  <CardHeader
                    className="cursor-pointer py-3"
                    onClick={() => toggleSection("irrigation")}
                  >
                    <CardTitle className="flex items-center justify-between text-base">
                      <span className="flex items-center gap-2">
                        <Droplets className="h-5 w-5 text-blue-600" />
                        {t("reports.sections.irrigation")}
                      </span>
                      {expandedSections.irrigation ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </CardTitle>
                  </CardHeader>
                  {expandedSections.irrigation && (
                    <CardContent className="pt-0">
                      <p className="text-gray-700">{currentReport.irrigationAdvice}</p>
                    </CardContent>
                  )}
                </Card>

                {/* Audio & Darija Script */}
                {(currentReport.audioUrl || currentReport.darijaScript) && (
                  <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
                    <CardHeader
                      className="cursor-pointer py-3"
                      onClick={() => toggleSection("audio")}
                    >
                      <CardTitle className="flex items-center justify-between text-base">
                        <span className="flex items-center gap-2">
                          <Volume2 className="h-5 w-5 text-purple-600" />
                          Rapport Audio & Darija
                        </span>
                        {expandedSections.audio ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </CardTitle>
                    </CardHeader>
                    {expandedSections.audio && (
                      <CardContent className="pt-0 space-y-4">
                        {currentReport.audioUrl && (
                          <div className="p-4 bg-white rounded-lg border border-purple-200">
                            <p className="font-medium text-gray-900 mb-3">🎙️ Rapport Audio</p>
                            <audio
                              controls
                              className="w-full"
                              src={currentReport.audioUrl}
                            >
                              Votre navigateur ne supporte pas la balise audio.
                            </audio>
                            <p className="text-xs text-gray-500 mt-2">
                              Narration en Darija (Marocain) du rapport agronomique
                            </p>
                          </div>
                        )}
                        {currentReport.darijaScript && (
                          <div className="p-4 bg-white rounded-lg border border-purple-200">
                            <p className="font-medium text-gray-900 mb-2">📝 Script Darija</p>
                            <div className="bg-purple-50 p-3 rounded text-gray-700 text-sm leading-relaxed max-h-40 overflow-y-auto">
                              {currentReport.darijaScript}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    )}
                  </Card>
                )}

                {/* Next Actions */}
                {currentReport.nextActions.length > 0 && (
                  <Card>
                    <CardHeader
                      className="cursor-pointer py-3"
                      onClick={() => toggleSection("actions")}
                    >
                      <CardTitle className="flex items-center justify-between text-base">
                        <span className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-gray-600" />
                          {t("reports.sections.actions")}
                        </span>
                        {expandedSections.actions ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </CardTitle>
                    </CardHeader>
                    {expandedSections.actions && (
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          {currentReport.nextActions.map((action, i) => (
                            <div
                              key={i}
                              className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                            >
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(
                                  action.priority
                                )}`}
                              >
                                {t(`reports.priority.${action.priority}`)}
                              </span>
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">{action.action}</p>
                                <p className="text-sm text-gray-500">{action.timing}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                )}

                {/* Footer */}
                <div className="text-center text-sm text-gray-400 py-2">
                  🌱 {t("reports.poweredBy")}
                </div>
              </div>
            ) : (
              <Card>
                <CardContent className="py-16">
                  <div className="text-center">
                    <Sparkles className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-900">
                      {t("reports.generateReport")}
                    </p>
                    <p className="text-gray-500 mt-2">
                      {t("reports.generatePrompt")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
