"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Lock, Eye, EyeOff, Waves, ShieldAlert, Building2 } from "lucide-react";
import { loginAction } from "@/application/actions/adminActions";
import { ADMIN_DIVISIONS, AdminDivisionSlug } from "@/lib/adminDivisions";
import { Button } from "@/presentation/components/ui/Button";
import { Typography } from "@/presentation/components/ui/Typography";

export default function AdminLoginPage() {
  const [divisionSlug, setDivisionSlug] = useState<AdminDivisionSlug>("bph");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError("Password tidak boleh kosong");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await loginAction(divisionSlug, password);
      if (res.success) {
        window.location.href = "/admin";
      } else {
        setError(res.error || "Password salah!");
        setIsLoading(false);
      }
    } catch {
      setError("Terjadi kesalahan sistem, silakan coba lagi.");
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-primary via-secondary to-accent overflow-hidden px-4">
      {/* Background graphic elements */}
      <div className="absolute inset-0 z-0 opacity-10">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Floating waves illustration */}
      <div className="absolute -bottom-24 -left-20 w-96 h-96 bg-cta/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -top-24 -right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8 md:p-10 transition-all duration-300">
        <div className="flex flex-col items-center mb-8">
          <div className="p-4 rounded-full bg-primary/10 text-primary mb-4 ring-8 ring-primary/5">
            <Waves className="h-10 w-10 text-primary" />
          </div>
          <Typography variant="h2" className="text-primary text-2xl font-bold tracking-tight text-center">
            HMTKBA Admin
          </Typography>
          <Typography variant="p" className="text-secondary/70 text-sm text-center mt-1">
            Portal Login Tiap Divisi
          </Typography>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600 animate-shake">
            <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
            <p className="font-semibold">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="division"
              className="text-sm font-bold text-primary tracking-wide block"
            >
              Pilih Divisi
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Building2 className="h-5 w-5" />
              </div>
              <select
                id="division"
                value={divisionSlug}
                onChange={(e) => setDivisionSlug(e.target.value as AdminDivisionSlug)}
                disabled={isLoading}
                className="block w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-primary font-medium transition duration-200 disabled:opacity-50"
              >
                {ADMIN_DIVISIONS.map((division) => (
                  <option key={division.slug} value={division.slug}>
                    {division.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-bold text-primary tracking-wide block"
            >
              Kata Sandi Admin
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="h-5 w-5" />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Masukkan kata sandi..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="block w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-primary font-medium transition duration-200 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-primary transition duration-150"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={isLoading}
            className="w-full py-3.5 bg-primary text-cream rounded-xl font-bold shadow-md hover:bg-secondary transition duration-200 flex justify-center items-center gap-2"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Memproses...
              </>
            ) : (
              "Masuk ke Dashboard"
            )}
          </Button>
        </form>

        <div className="mt-8 border-t border-slate-100 pt-6 text-center">
          <Link
            href="/"
            className="text-xs font-semibold text-secondary hover:text-primary transition duration-150"
          >
            ← Kembali ke Website Utama
          </Link>
        </div>
      </div>
    </div>
  );
}
