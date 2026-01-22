"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { Button, Input, Label, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui";
import { Loader2, Mail, Lock, User } from "lucide-react";
import { useTranslations } from "next-intl";

export function RegisterForm() {
  const t = useTranslations();
  const router = useRouter();
  const { signUp, signInWithGoogle } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const registerSchema = z.object({
    displayName: z.string().min(2, t("auth.validation.displayNameMin")),
    email: z.string().email(t("auth.validation.emailInvalid")),
    password: z.string().min(6, t("auth.validation.passwordMin")),
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t("auth.validation.passwordMismatch"),
    path: ["confirmPassword"],
  });

  type RegisterFormData = z.infer<typeof registerSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      await signUp(data.email, data.password, data.displayName);
      router.push("/dashboard");
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes("email-already-in-use")) {
        setError(t("auth.register.errorEmailInUse"));
      } else {
        setError(t("auth.register.errorGeneric"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      setError(null);
      await signInWithGoogle();
      // Page will redirect to Google, no need to navigate here
    } catch (err) {
      setError(t("auth.register.errorGoogle"));
      setIsGoogleLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{t("auth.register.title")}</CardTitle>
        <CardDescription>
          {t("auth.register.description")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="displayName">{t("auth.register.displayName")}</Label>
            <div className="relative">
              <User className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="displayName"
                type="text"
                placeholder={t("auth.register.displayNamePlaceholder")}
                className="ps-10"
                {...register("displayName")}
              />
            </div>
            {errors.displayName && (
              <p className="text-sm text-red-500">{errors.displayName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t("auth.register.email")}</Label>
            <div className="relative">
              <Mail className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder={t("auth.register.emailPlaceholder")}
                className="ps-10"
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t("auth.register.password")}</Label>
            <div className="relative">
              <Lock className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                type="password"
                placeholder={t("auth.register.passwordPlaceholder")}
                className="ps-10"
                {...register("password")}
              />
            </div>
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t("auth.register.confirmPassword")}</Label>
            <div className="relative">
              <Lock className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="confirmPassword"
                type="password"
                placeholder={t("auth.register.confirmPasswordPlaceholder")}
                className="ps-10"
                {...register("confirmPassword")}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="animate-spin" />}
            {t("auth.register.submit")}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">{t("common.or")}</span>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading}
        >
          {isGoogleLoading ? (
            <Loader2 className="animate-spin" />
          ) : (
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
          )}
          {t("auth.register.withGoogle")}
        </Button>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-gray-500">
          {t("auth.register.hasAccount")}{" "}
          <Link href="/login" className="text-green-600 hover:underline">
            {t("auth.register.signIn")}
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
