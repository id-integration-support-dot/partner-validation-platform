"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Loader2, 
  Layers, 
  FileCheck, 
  PlayCircle,
  CheckCircle, 
  AlertCircle 
} from "lucide-react";

interface PartnerProfile {
  name: string;
  email: string;
  role: string;
  status: string;
}

interface DashboardMetrics {
  activeCount: number;
  trackAPassedCount: number; // Jumlah case PDF yang lolos aturan otomatis
  trackBPassedCount: number; // Jumlah case Fungsional yang lolos aturan otomatis
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { message: string };
}

export default function PartnerDashboardPage() {
  const [profile, setProfile] = useState<PartnerProfile | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        setError(null);

        const [profileRes, metricsRes] = await Promise.all([
          fetch("/api/partner/profile", { cache: "no-store" }),
          fetch("/api/scope", { cache: "no-store" })
        ]);

        let profileData: PartnerProfile = {
          name: "partner",
          email: "ab@gmail.com",
          role: "Partner",
          status: "Approved"
        };

        let metricsData: DashboardMetrics = {
          activeCount: 0,
          trackAPassedCount: 0,
          trackBPassedCount: 0
        };

        if (profileRes.ok && profileRes.headers.get("content-type")?.includes("application/json")) {
          const profileJson = (await profileRes.json()) as ApiResponse<PartnerProfile>;
          if (profileJson.success && profileJson.data) profileData = profileJson.data;
        }

        if (metricsRes.ok && metricsRes.headers.get("content-type")?.includes("application/json")) {
          const metricsJson = (await metricsRes.json()) as ApiResponse<DashboardMetrics>;
          if (metricsJson.success && metricsJson.data) metricsData = metricsJson.data;
        }

        setProfile(profileData);
        setMetrics(metricsData);
      } catch (err) {
        console.error(err);
        setError("Gagal memvalidasi jembatan data API internal sandbox.");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#0d5ddf] mx-auto" />
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Memuat Workspace Dashboard...</p>
        </div>
      </div>
    );
  }

  // Pengali target test case (contoh: setiap 1 scope sub-service butuh 2 skenario (positive & negative))
  const totalTargetCases = (metrics?.activeCount || 0) * 2;

  return (
    <div className="min-h-screen bg-[#f8fafc] px-4 sm:px-6 py-10 text-slate-900">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        
        {error && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs font-medium text-amber-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Info Sistem: {error} (Berhasil dialihkan menggunakan profil lokal).</span>
          </div>
        )}

        {/* Header Dashboard */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Partner Dashboard</h1>
            <p className="text-sm text-slate-500">Silakan selesaikan seluruh otomatisasi skenario pengujian di bawah ini.</p>
          </div>
          <Link 
            href="/partner/services" 
            className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 shadow-xs transition hover:bg-slate-50 hover:text-blue-600 shrink-0"
          >
            ← Ubah Cakupan Scope Service
          </Link>
        </div>

        {/* Metadata Akun */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="space-y-0.5">
            <span className="text-slate-400 block font-medium">Nama Institusi</span>
            <span className="font-bold text-slate-800 break-words">{profile?.name}</span>
          </div>
          <div className="space-y-0.5">
            <span className="text-slate-400 block font-medium">Email Korespondensi</span>
            <span className="font-bold text-slate-800 break-words">{profile?.email}</span>
          </div>
          <div className="space-y-0.5">
            <span className="text-slate-400 block font-medium">Akses Sistem</span>
            <span className="font-bold text-slate-800">{profile?.role}</span>
          </div>
          <div className="space-y-0.5">
            <span className="text-slate-400 block font-medium">Status Pengisian Scope</span>
            <span className="font-bold text-blue-600">{metrics?.activeCount || 0} Sub-Service Terpilih</span>
          </div>
        </div>

        {/* Ruang Integrasi Sandbox Tahapan Track (Dua-duanya Terbuka Secara Paralel) */}
        <div className="space-y-4">
          <div className="space-y-0.5">
            <h2 className="text-base font-bold text-slate-800">Skenario Pengujian Sandbox</h2>
            <p className="text-xs text-slate-400">Sistem akan melakukan pembacaan aturan (validation rules) secara instan dan otomatis.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            
            {/* TAHAP 1: TRACK A — DEVELOPER SITE TESTING */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-50 border border-blue-200 text-blue-700">
                    Track A
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600">
                    Dokumen Validator
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-slate-500" />
                    Developer Site Testing (PDF)
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Unggah lembar dokumen PDF hasil test-case portal Anda. Sistem otomatis akan membaca teks dan memvalidasi kecocokan data *knowledge rules*.
                  </p>
                </div>

                {/* Progress Tracker Real-Time */}
                <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3 text-[11px] text-slate-600 font-medium flex justify-between items-center">
                  <span>Progres Validasi Aturan:</span>
                  <span className="font-mono font-bold text-slate-900 bg-white border px-2 py-0.5 rounded">
                    {metrics?.trackAPassedCount || 0} / {totalTargetCases} Skenario Lolos
                  </span>
                </div>
              </div>

              <Link 
                href="/partner/dashboard/developer-testing"
                className="w-full h-10 bg-[#0d5ddf] hover:bg-[#0c52c4] text-white text-xs font-semibold rounded-xl transition shadow-xs flex items-center justify-center cursor-pointer"
              >
                Buka Portal Upload PDF
              </Link>
            </div>

            {/* TAHAP 2: TRACK B — FUNCTIONAL TESTING (SEKARANG SUDAH TERBUKA PARALEL) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-50 border border-emerald-200 text-emerald-700">
                    Track B
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                    Functional Automation
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <PlayCircle className="w-4 h-4 text-slate-500" />
                    Core API Functional Testing
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Pengujian interaksi fungsional langsung. Jalankan pengujian endpoint atau unggah log respon transaksi untuk dibaca oleh sistem automation suite.
                  </p>
                </div>

                {/* Progress Tracker Real-Time */}
                <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3 text-[11px] text-slate-600 font-medium flex justify-between items-center">
                  <span>Skenario Terpenuhi:</span>
                  <span className="font-mono font-bold text-emerald-700 bg-white border px-2 py-0.5 rounded">
                    {metrics?.trackBPassedCount || 0} / {totalTargetCases} Selesai
                  </span>
                </div>
              </div>

              <Link
                href="/partner/dashboard/functional-testing"
                className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition shadow-xs flex items-center justify-center cursor-pointer"
              >
                Masuk Skenario Fungsional
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}