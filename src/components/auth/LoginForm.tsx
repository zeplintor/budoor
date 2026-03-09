"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { Input, Label } from "@/components/ui";
import { Loader2, Mail, Lock } from "lucide-react";
import { useTranslations } from "next-intl";

export function LoginForm() {
  const t = useTranslations();
  const router = useRouter();
  const { signIn, signInWithGoogle } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const loginSchema = z.object({
    email: z.string().email(t("auth.validation.emailInvalid")),
    password: z.string().min(6, t("auth.validation.passwordMin")),
  });

  type LoginFormData = z.infer<typeof loginSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      await signIn(data.email, data.password);
      router.push("/dashboard");
    } catch {
      setError(t("auth.login.errorInvalid"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      setError(null);
      await signInWithGoogle();
      router.push("/dashboard");
    } catch (err) {
      console.error("Google Auth Error:", err);
      setError(t("auth.login.errorGoogle"));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Heading */}
      <div className="mb-8">
        <h1
          className="font-display font-bold text-3xl mb-1.5"
          style={{ color: "var(--text-primary)" }}
        >
          {t("auth.login.title")}
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          {t("auth.login.description")}
        </p>
      </div>

      {/* Error */}
      {error && (
        <div
          className="p-3.5 mb-5 text-sm rounded-xl border"
          style={{
            background: "var(--status-error-light)",
            color: "var(--status-error)",
            borderColor: "rgba(220,38,38,0.2)",
          }}
        >
          {error}
        </div>
      )}

      {/* Google button */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isGoogleLoading}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border font-medium text-sm transition-all hover:bg-[var(--bg-muted)] active:scale-[0.98] mb-5 disabled:opacity-60"
        style={{
          borderColor: "var(--border-light)",
          color: "var(--text-primary)",
          background: "white",
        }}
      >
        {isGoogleLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
        )}
        {t("auth.login.withGoogle")}
      </button>

      {/* Divider */}
      <div className="relative mb-5">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" style={{ borderColor: "var(--border-light)" }} />
        </div>
        <div className="relative flex justify-center">
          <span
            className="px-3 text-xs uppercase tracking-wide"
            style={{ background: "var(--bg-primary)", color: "var(--text-muted)" }}
          >
            {t("common.or")}
          </span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label
            htmlFor="email"
            className="text-sm font-medium"
            style={{ color: "var(--text-primary)" }}
          >
            {t("auth.login.email")}
          </Label>
          <div className="relative">
            <Mail
              className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4"
              style={{ color: "var(--text-muted)" }}
            />
            <Input
              id="email"
              type="email"
              placeholder={t("auth.login.emailPlaceholder")}
              className="ps-10"
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="text-xs" style={{ color: "var(--status-error)" }}>
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="password"
              className="text-sm font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              {t("auth.login.password")}
            </Label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium transition-colors hover:opacity-80"
              style={{ color: "var(--accent-green)" }}
            >
              {t("auth.login.forgotPassword")}
            </Link>
          </div>
          <div className="relative">
            <Lock
              className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4"
              style={{ color: "var(--text-muted)" }}
            />
            <Input
              id="password"
              type="password"
              placeholder={t("auth.login.passwordPlaceholder")}
              className="ps-10"
              {...register("password")}
            />
          </div>
          {errors.password && (
            <p className="text-xs" style={{ color: "var(--status-error)" }}>
              {errors.password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 mt-1"
          style={{ background: "var(--accent-green)" }}
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {t("auth.login.submit")}
        </button>
      </form>

      {/* Footer link */}
      <p
        className="text-sm text-center mt-7"
        style={{ color: "var(--text-muted)" }}
      >
        {t("auth.login.noAccount")}{" "}
        <Link
          href="/register"
          className="font-semibold transition-colors hover:opacity-80"
          style={{ color: "var(--accent-green)" }}
        >
          {t("auth.login.createAccount")}
        </Link>
      </p>
    </div>
  );
}
