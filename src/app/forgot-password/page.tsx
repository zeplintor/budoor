"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { Button, Input, Label, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui";
import { Sprout, Loader2, Mail, ArrowLeft, CheckCircle } from "lucide-react";

const forgotPasswordSchema = z.object({
  email: z.string().email("Email invalide"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      await resetPassword(data.email);
      setEmailSent(true);
    } catch (err) {
      setError("Erreur lors de l'envoi de l'email");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <Sprout className="h-10 w-10 text-green-600" />
        <span className="text-2xl font-bold text-gray-900">Budoor</span>
      </Link>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Mot de passe oublie</CardTitle>
          <CardDescription>
            Entrez votre email pour recevoir un lien de reinitialisation
          </CardDescription>
        </CardHeader>
        <CardContent>
          {emailSent ? (
            <div className="text-center py-4">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-gray-700">
                Un email de reinitialisation a ete envoye. Verifiez votre boite de reception.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    className="pl-10"
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="animate-spin" />}
                Envoyer le lien
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="justify-center">
          <Link
            href="/login"
            className="flex items-center gap-1 text-sm text-green-600 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour a la connexion
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
