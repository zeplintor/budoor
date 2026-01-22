"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/dashboard";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui";
import { useTranslations } from "next-intl";
import { useSubscription, PLAN_LIMITS } from "@/hooks/useSubscription";
import {
  Check,
  X,
  Loader2,
  CreditCard,
  Crown,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  Zap,
  Shield,
  Clock,
} from "lucide-react";

export default function PricingPage() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const { status, isPro, loading, upgradeToPro, cancelSubscription } =
    useSubscription();

  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Check for success/cancel from redirect
  useEffect(() => {
    if (searchParams.get("success") === "true") {
      setNotification({
        type: "success",
        message: t("pricing.successMessage"),
      });
    }
    if (searchParams.get("cancelled") === "true") {
      setNotification({
        type: "error",
        message: t("pricing.cancelledMessage"),
      });
    }
  }, [searchParams, t]);

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      await upgradeToPro();
    } catch (error) {
      setNotification({
        type: "error",
        message: t("pricing.error"),
      });
      setIsUpgrading(false);
    }
  };

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      await cancelSubscription();
      setShowCancelDialog(false);
      setNotification({
        type: "success",
        message: t("pricing.subscriptionCancelled"),
      });
    } catch (error) {
      setNotification({
        type: "error",
        message: t("pricing.cancelError"),
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const plans = [
    {
      id: "free",
      name: t("pricing.plans.free.name"),
      price: "0",
      description: t("pricing.plans.free.description"),
      features: [
        { text: t("pricing.plans.free.features.parcelles", { count: PLAN_LIMITS.free.maxParcelles }), included: true },
        { text: t("pricing.plans.free.features.reports", { count: PLAN_LIMITS.free.maxReportsPerMonth }), included: true },
        { text: t("pricing.plans.free.features.weather"), included: true },
        { text: t("pricing.plans.free.features.soil"), included: true },
        { text: t("pricing.plans.free.features.whatsapp"), included: true },
        { text: t("pricing.plans.pro.features.unlimited"), included: false },
        { text: t("pricing.plans.pro.features.daily"), included: false },
        { text: t("pricing.plans.pro.features.history"), included: false },
        { text: t("pricing.plans.pro.features.support"), included: false },
      ],
      current: !isPro,
    },
    {
      id: "pro",
      name: t("pricing.plans.pro.name"),
      price: "29",
      description: t("pricing.plans.pro.description"),
      popular: true,
      features: [
        { text: t("pricing.plans.pro.features.unlimited"), included: true },
        { text: t("pricing.plans.pro.features.reports"), included: true },
        { text: t("pricing.plans.free.features.weather"), included: true },
        { text: t("pricing.plans.free.features.soil"), included: true },
        { text: t("pricing.plans.pro.features.daily"), included: true },
        { text: t("pricing.plans.pro.features.history"), included: true },
        { text: t("pricing.plans.pro.features.support"), included: true },
        { text: t("pricing.plans.pro.features.export"), included: true },
        { text: t("pricing.plans.pro.features.api"), included: true },
      ],
      current: isPro,
    },
  ];

  if (loading) {
    return (
      <>
        <Header title={t("pricing.title")} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--accent-pink)]" />
        </div>
      </>
    );
  }

  return (
    <>
      <Header title={t("pricing.title")} />

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Notification */}
        {notification && (
          <div
            className={`p-4 rounded-lg flex items-center gap-3 ${
              notification.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
            )}
            <p>{notification.message}</p>
            <button
              onClick={() => setNotification(null)}
              className="ml-auto text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Current plan status */}
        <Card className="bg-gradient-to-r from-[var(--accent-mint-light)] to-[var(--accent-yellow-light)] border-0">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div
                  className={`p-3 rounded-full ${
                    isPro
                      ? "bg-[var(--accent-pink)]"
                      : "bg-[var(--accent-mint)]"
                  }`}
                >
                  {isPro ? (
                    <Crown className="h-6 w-6 text-white" />
                  ) : (
                    <Sparkles className="h-6 w-6 text-[var(--text-primary)]" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">
                    {isPro
                      ? t("pricing.currentPlan.pro")
                      : t("pricing.currentPlan.free")}
                  </h2>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {isPro
                      ? t("pricing.currentPlan.proDescription")
                      : t("pricing.currentPlan.freeDescription")}
                  </p>
                </div>
              </div>
              {isPro && status === "active" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCancelDialog(true)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  {t("pricing.cancelSubscription")}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Plans grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {plans.map((planItem) => (
            <Card
              key={planItem.id}
              className={`relative overflow-hidden ${
                planItem.popular
                  ? "border-2 border-[var(--accent-pink)] shadow-lg"
                  : "border border-[var(--border-light)]"
              } ${planItem.current ? "ring-2 ring-[var(--accent-mint)]" : ""}`}
            >
              {planItem.popular && (
                <div className="absolute top-0 right-0">
                  <Badge
                    variant="pink"
                    className="rounded-none rounded-bl-lg px-3 py-1"
                  >
                    {t("pricing.popular")}
                  </Badge>
                </div>
              )}

              {planItem.current && (
                <div className="absolute top-0 left-0">
                  <Badge
                    variant="mint"
                    className="rounded-none rounded-br-lg px-3 py-1"
                  >
                    {t("pricing.currentPlan.badge")}
                  </Badge>
                </div>
              )}

              <CardHeader className="pt-8">
                <CardTitle className="text-2xl">{planItem.name}</CardTitle>
                <CardDescription>{planItem.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-[var(--text-primary)]">
                    {planItem.price}€
                  </span>
                  <span className="text-[var(--text-secondary)]">
                    /{t("pricing.perMonth")}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {planItem.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className="h-5 w-5 text-[var(--status-success)] shrink-0 mt-0.5" />
                      ) : (
                        <X className="h-5 w-5 text-[var(--text-muted)] shrink-0 mt-0.5" />
                      )}
                      <span
                        className={
                          feature.included
                            ? "text-[var(--text-primary)]"
                            : "text-[var(--text-muted)]"
                        }
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {planItem.id === "pro" && !isPro && (
                  <Button
                    className="w-full"
                    variant="primary"
                    size="lg"
                    onClick={handleUpgrade}
                    disabled={isUpgrading}
                  >
                    {isUpgrading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t("pricing.processing")}
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4" />
                        {t("pricing.upgrade")}
                      </>
                    )}
                  </Button>
                )}

                {planItem.id === "free" && isPro && (
                  <Button
                    className="w-full"
                    variant="outline"
                    size="lg"
                    disabled
                  >
                    {t("pricing.downgrade")}
                  </Button>
                )}

                {planItem.current && (
                  <Button
                    className="w-full"
                    variant="outline"
                    size="lg"
                    disabled
                  >
                    <Check className="h-4 w-4" />
                    {t("pricing.currentPlan.badge")}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Benefits section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-[var(--accent-yellow)]" />
              {t("pricing.benefits.title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-[var(--accent-mint-light)]">
                  <Shield className="h-5 w-5 text-[var(--accent-mint-dark)]" />
                </div>
                <div>
                  <h4 className="font-medium text-[var(--text-primary)]">
                    {t("pricing.benefits.secure.title")}
                  </h4>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {t("pricing.benefits.secure.description")}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-[var(--accent-yellow-light)]">
                  <Clock className="h-5 w-5 text-[var(--accent-yellow-dark)]" />
                </div>
                <div>
                  <h4 className="font-medium text-[var(--text-primary)]">
                    {t("pricing.benefits.flexible.title")}
                  </h4>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {t("pricing.benefits.flexible.description")}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-[var(--accent-pink-light)]">
                  <CreditCard className="h-5 w-5 text-[var(--accent-pink-dark)]" />
                </div>
                <div>
                  <h4 className="font-medium text-[var(--text-primary)]">
                    {t("pricing.benefits.trial.title")}
                  </h4>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {t("pricing.benefits.trial.description")}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle>{t("pricing.faq.title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-[var(--text-primary)]">
                {t("pricing.faq.q1.question")}
              </h4>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                {t("pricing.faq.q1.answer")}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-[var(--text-primary)]">
                {t("pricing.faq.q2.question")}
              </h4>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                {t("pricing.faq.q2.answer")}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-[var(--text-primary)]">
                {t("pricing.faq.q3.question")}
              </h4>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                {t("pricing.faq.q3.answer")}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cancel subscription dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              {t("pricing.cancelDialog.title")}
            </DialogTitle>
            <DialogDescription>
              {t("pricing.cancelDialog.description")}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-[var(--text-secondary)]">
              {t("pricing.cancelDialog.warning")}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={isCancelling}
            >
              {isCancelling && <Loader2 className="h-4 w-4 animate-spin" />}
              {t("pricing.cancelDialog.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
