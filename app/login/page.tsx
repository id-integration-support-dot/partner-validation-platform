"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, Shield, Zap } from "lucide-react";

export default function LoginSelectionPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f1f5f9] px-4">
      <div className="w-full max-w-[500px] rounded-3xl border border-slate-100 bg-white p-12 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand text-white shadow-sm">
            <Zap className="h-8 w-8" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">ShopeePay Partner Hub</h1>
          <p className="mt-2 text-sm text-slate-400">Pilih tipe akun untuk masuk</p>
        </div>

        <div className="mt-10 space-y-4">
          {/* Mengarahkan langsung ke sub-folder partner */}
          <button
            type="button"
            onClick={() => router.push("/login/partner")}
            className="group flex w-full items-start gap-4 rounded-2xl border border-slate-200 bg-white p-6 text-left transition duration-200 hover:border-brand/40 hover:shadow-md hover:shadow-slate-100"
          >
            <div className="mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition-colors group-hover:bg-emerald-100">
              <Building2 size={22} />
            </div>
            <div>
              <p className="text-base font-semibold text-slate-800">Partner</p>
              <p className="mt-1 text-sm text-slate-400 leading-relaxed">
                Akses portal pengujian layanan, upload dokumen, dan lihat panduan integrasi API.
              </p>
            </div>
          </button>

          {/* Mengarahkan langsung ke sub-folder admin */}
          <button
            type="button"
            onClick={() => router.push("/login/admin")}
            className="group flex w-full items-start gap-4 rounded-2xl border border-slate-200 bg-white p-6 text-left transition duration-200 hover:border-brand/40 hover:shadow-md hover:shadow-slate-100"
          >
            <div className="mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-brand transition-colors group-hover:bg-blue-100">
              <Shield size={22} />
            </div>
            <div>
              <p className="text-base font-semibold text-slate-800">Administrator</p>
              <p className="mt-1 text-sm text-slate-400 leading-relaxed">
                Kelola partner, review submission, dan akses dashboard.
              </p>
            </div>
          </button>
        </div>

        <div className="mt-10 text-center text-sm text-slate-400">
          Belum punya akun?{" "}
          <Link href="/register" className="font-semibold text-brand hover:underline">
            Daftar di sini
          </Link>
        </div>
      </div>
    </div>
  );
}