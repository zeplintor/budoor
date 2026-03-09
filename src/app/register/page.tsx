"use client";

import { RegisterForm } from "@/components/auth";
import Link from "next/link";
import { Sprout, Check } from "lucide-react";

export default function RegisterPage() {
  return (
    <div
      className="min-h-screen flex"
      style={{ background: "var(--bg-primary)" }}
    >
      {/* Left panel — brand */}
      <div
        className="hidden lg:flex lg:w-[460px] xl:w-[500px] flex-col justify-between p-12 relative overflow-hidden shrink-0"
        style={{ background: "var(--accent-green)" }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)`,
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative">
          <Link href="/" className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.15)" }}
            >
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-white">
              Budoor
            </span>
          </Link>
        </div>

        <div className="relative space-y-6">
          <h2
            className="font-display font-bold text-white leading-[1.1]"
            style={{ fontSize: "2.6rem" }}
          >
            Commencez
            <br />
            <span style={{ opacity: 0.7 }}>Gratuitement</span>
          </h2>
          <p
            className="text-base leading-relaxed"
            style={{ color: "rgba(255,255,255,0.7)", maxWidth: "320px" }}
          >
            Créez votre compte en moins de 2 minutes et commencez à optimiser
            vos cultures dès aujourd&apos;hui.
          </p>
          <div className="flex flex-col gap-3 pt-2">
            {[
              "Gratuit sans carte bancaire",
              "Jusqu'à 3 parcelles incluses",
              "Rapports IA hebdomadaires",
              "Support par WhatsApp",
            ].map((text) => (
              <div key={text} className="flex items-center gap-3">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: "rgba(255,255,255,0.2)" }}
                >
                  <Check className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm text-white">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
          Rejoignez <span className="text-white font-semibold">500+ agriculteurs</span> qui
          font confiance à Budoor.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12">
        <div className="lg:hidden mb-8">
          <Link href="/" className="flex items-center gap-2 justify-center">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "var(--accent-green)" }}
            >
              <Sprout className="w-4 h-4 text-white" />
            </div>
            <span
              className="font-display font-bold text-xl"
              style={{ color: "var(--text-primary)" }}
            >
              Budoor
            </span>
          </Link>
        </div>
        <div className="w-full max-w-sm">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
