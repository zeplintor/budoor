"use client";

import { LoginForm } from "@/components/auth";
import { Sprout } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <Sprout className="h-10 w-10 text-green-600" />
        <span className="text-2xl font-bold text-gray-900">Budoor</span>
      </Link>
      <LoginForm />
    </div>
  );
}
