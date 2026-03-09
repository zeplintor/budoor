"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/dashboard";
import {
  Button,
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

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      setNotification({ type: "success", message: t("pricing.successMessage") });
    }
    if (searchParams.get("cancelled") === "true") {
      setNotification({ type: "error", message: t("pricing.cancelledMessage") });
    }
  }, [searchParams, t]);

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      await upgradeToPro();
    } catch {
      setNotification({ type: "error", message: t("pricing.error") });
      setIsUpgrading(false);
    }
  };

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      await cancelSubscription();
      setShowCancelDialog(false);
      setNotification({ type: "success", message: t("pricing.subscriptionCancelled") });
    } catch {
      setNotification({ type: "error", message: t("pricing.cancelError") });
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
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: "var(--accent-green)" }} />
        </div>
      </>
    );
  }

  return (
    <>
      <Header title={t("pricing.title")} />

      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Notification */}
        {notification && (
          <div
            className="p-4 rounded-xl flex items-center gap-3 animate-fade-in-up border"
            style={{
              background: notification.type === "success"
                ? "var(--status-success-light)"
                : "var(--status-error-light)",
              borderColor: notification.type === "success"
                ? "var(--status-success)"
                : "var(--status-error)",
            }}
          >
            {notification.type === "success" ? (
              <CheckCircle className="h-5 w-5 shrink-0" style={{ color: "var(--status-success)" }} />
            ) : (
              <AlertTriangle className="h-5 w-5 shrink-0" style={{ color: "var(--status-error)" }} />
            )}
            <p className="text-sm font-medium flex-1" style={{ color: "var(--text-primary)" }}>
              {notification.message}
            </p>
            <button
              onClick={() => setNotification(null)}
              className="p-1 rounded transition-colors hover:bg-black/10"
            >
              <X className="h-4 w-4" style={{ color: "var(--text-secondary)" }} />
            </button>
          </div>
        )}

        {/* Current plan banner */}
        <div
          className="rounded-2xl p-6 border flex flex-col md:flex-row md:items-center justify-between gap-4"
          style={{
            background: isPro ? "var(--accent-green)" : "white",
            borderColor: isPro ? "transparent" : "var(--border-light)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <div className="flex items-center gap-4">
            <div
              className="p-3 rounded-xl"
              style={{
                background: isPro ? "rgba(255,255,255,0.15)" : "var(--accent-green-light)",
              }}
            >
              {isPro ? (
                <Crown className="h-6 w-6 text-white" />
              ) : (
                <Sparkles className="h-6 w-6" style={{ color: "var(--accent-green)" }} />
              )}
            </div>
            <div>
              <h2
                className="font-display font-bold text-xl"
                style={{ color: isPro ? "white" : "var(--text-primary)" }}
              >
                {isPro ? t("pricing.currentPlan.pro") : t("pricing.currentPlan.free")}
              </h2>
              <p
                className="text-sm"
                style={{ color: isPro ? "rgba(255,255,255,0.7)" : "var(--text-secondary)" }}
              >
                {isPro ? t("pricing.currentPlan.proDescription") : t("pricing.currentPlan.freeDescription")}
              </p>
            </div>
          </div>
          {isPro && status === "active" && (
            <button
              onClick={() => setShowCancelDialog(true)}
              className="text-sm font-medium px-4 py-2 rounded-lg border transition-all hover:opacity-80"
              style={{ background: "rgba(255,255,255,0.15)", color: "white", borderColor: "rgba(255,255,255,0.3)" }}
            >
              {t("pricing.cancelSubscription")}
            </button>
          )}
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-2 gap-5">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="rounded-2xl border overflow-hidden"
              style={{
                background: plan.popular ? "var(--accent-green)" : "white",
                borderColor: plan.popular ? "transparent" : "var(--border-light)",
                boxShadow: plan.popular ? "var(--shadow-elevated)" : "var(--shadow-card)",
              }}
            >
              <div className="p-7">
                {/* Badges */}
                <div className="flex gap-2 mb-5">
                  {plan.popular && (
                    <span
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
                      style={{ background: "var(--accent-gold)", color: "white" }}
                    >
                      <Sparkles className="h-3 w-3" />
                      {t("pricing.popular")}
                    </span>
                  )}
                  {plan.current && (
                    <span
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{
                        background: plan.popular ? "rgba(255,255,255,0.2)" : "var(--accent-green-light)",
                        color: plan.popular ? "white" : "var(--accent-green)",
                      }}
                    >
                      <Check className="h-3 w-3" />
                      {t("pricing.currentPlan.badge")}
                    </span>
                  )}
                </div>

                {/* Name + price */}
                <h3
                  className="font-display font-bold text-2xl mb-1"
                  style={{ color: plan.popular ? "white" : "var(--text-primary)" }}
                >
                  {plan.name}
                </h3>
                <p
                  className="text-sm mb-5"
                  style={{ color: plan.popular ? "rgba(255,255,255,0.7)" : "var(--text-secondary)" }}
                >
                  {plan.description}
                </p>
                <div className="flex items-baseline gap-1 mb-6 pb-6 border-b"
                  style={{ borderColor: plan.popular ? "rgba(255,255,255,0.2)" : "var(--border-light)" }}>
                  <span
                    className="font-display font-bold text-5xl"
                    style={{ color: plan.popular ? "white" : "var(--text-primary)" }}
                  >
                    {plan.price}€
                  </span>
                  <span
                    className="text-sm"
                    style={{ color: plan.popular ? "rgba(255,255,255,0.6)" : "var(--text-muted)" }}
                  >
                    /{t("pricing.perMonth")}
                  </span>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-7">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      {feature.included ? (
                        <Check
                          className="h-4 w-4 shrink-0"
                          style={{ color: plan.popular ? "rgba(255,255,255,0.8)" : "var(--accent-green)" }}
                        />
                      ) : (
                        <X className="h-4 w-4 shrink-0" style={{ color: "var(--text-muted)" }} />
                      )}
                      <span
                        style={{
                          color: feature.included
                            ? (plan.popular ? "white" : "var(--text-primary)")
                            : "var(--text-muted)",
                        }}
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {plan.id === "pro" && !isPro && (
                  <button
                    onClick={handleUpgrade}
                    disabled={isUpgrading}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-sm transition-all hover:opacity-95 active:scale-[0.98] disabled:opacity-60"
                    style={{ background: "white", color: "var(--accent-green)" }}
                  >
                    {isUpgrading ? (
                      <><Loader2 className="h-4 w-4 animate-spin" />{t("pricing.processing")}</>
                    ) : (
                      <><CreditCard className="h-4 w-4" />{t("pricing.upgrade")}</>
                    )}
                  </button>
                )}
                {plan.id === "free" && isPro && (
                  <button
                    disabled
                    className="w-full px-5 py-3.5 rounded-xl font-semibold text-sm border opacity-50 cursor-not-allowed"
                    style={{ borderColor: "var(--border-light)", color: "var(--text-muted)" }}
                  >
                    {t("pricing.downgrade")}
                  </button>
                )}
                {plan.current && (
                  <button
                    disabled
                    className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-sm border cursor-not-allowed"
                    style={{
                      borderColor: plan.popular ? "rgba(255,255,255,0.3)" : "var(--border-light)",
                      color: plan.popular ? "rgba(255,255,255,0.6)" : "var(--text-muted)",
                    }}
                  >
                    <Check className="h-4 w-4" />
                    {t("pricing.currentPlan.badge")}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Benefits */}
        <div
          className="rounded-2xl border p-7"
          style={{ background: "white", borderColor: "var(--border-light)", boxShadow: "var(--shadow-card)" }}
        >
          <h3
            className="font-display font-bold text-xl mb-6"
            style={{ color: "var(--text-primary)" }}
          >
            {t("pricing.benefits.title")}
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: t("pricing.benefits.secure.title"), desc: t("pricing.benefits.secure.description"), color: "var(--accent-green-light)", icolor: "var(--accent-green)" },
              { icon: Clock, title: t("pricing.benefits.flexible.title"), desc: t("pricing.benefits.flexible.description"), color: "var(--accent-gold-light)", icolor: "var(--accent-gold)" },
              { icon: Zap, title: t("pricing.benefits.trial.title"), desc: t("pricing.benefits.trial.description"), color: "var(--accent-purple-light)", icolor: "var(--accent-purple)" },
            ].map(({ icon: Icon, title, desc, color, icolor }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl shrink-0" style={{ background: color }}>
                  <Icon className="h-5 w-5" style={{ color: icolor }} />
                </div>
                <div>
                  <p className="font-semibold text-sm mb-1" style={{ color: "var(--text-primary)" }}>{title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div
          className="rounded-2xl border p-7"
          style={{ background: "white", borderColor: "var(--border-light)", boxShadow: "var(--shadow-card)" }}
        >
          <h3
            className="font-display font-bold text-xl mb-5"
            style={{ color: "var(--text-primary)" }}
          >
            {t("pricing.faq.title")}
          </h3>
          <div className="divide-y" style={{ borderColor: "var(--border-light)" }}>
            {[
              { q: t("pricing.faq.q1.question"), a: t("pricing.faq.q1.answer") },
              { q: t("pricing.faq.q2.question"), a: t("pricing.faq.q2.answer") },
              { q: t("pricing.faq.q3.question"), a: t("pricing.faq.q3.answer") },
            ].map(({ q, a }) => (
              <details key={q} className="group py-4">
                <summary className="flex items-center justify-between cursor-pointer list-none gap-4">
                  <span className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>{q}</span>
                  <span className="text-lg transition-transform group-open:rotate-45 shrink-0" style={{ color: "var(--text-muted)" }}>+</span>
                </summary>
                <p className="pt-3 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>

      {/* Cancel dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" style={{ color: "var(--status-error)" }}>
              <AlertTriangle className="h-5 w-5" />
              {t("pricing.cancelDialog.title")}
            </DialogTitle>
            <DialogDescription>{t("pricing.cancelDialog.description")}</DialogDescription>
          </DialogHeader>
          <p className="text-sm py-3" style={{ color: "var(--text-secondary)" }}>
            {t("pricing.cancelDialog.warning")}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              {t("common.cancel")}
            </Button>
            <Button variant="destructive" onClick={handleCancel} disabled={isCancelling}>
              {isCancelling && <Loader2 className="h-4 w-4 animate-spin" />}
              {t("pricing.cancelDialog.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
