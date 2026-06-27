"use client";

import React from "react";
import Link from "next/link";

export default function PartnerCoreTestingPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto text-slate-900">
      <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Track B: API Core Test Suite</h1>
          <p className="text-sm text-slate-500 mt-1">
            Gunakan Kredensial Sandbox Anda untuk menguji coba keandalan API Endpoint Platform.
          </p>
        </div>
        <Link href="/partner/dashboard" className="text-sm font-medium text-blue-600 hover:underline">
          Kembali ke Peta Jalan
        </Link>
      </div>

      <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-6 space-y-3">
        <h3 className="text-emerald-950 font-bold text-base flex items-center gap-2">
          🎉 Selamat! Akses Sandbox Terbuka
        </h3>
        <p className="text-xs text-emerald-800 leading-relaxed">
          Dokumen Track A Anda telah disahkan sepenuhnya oleh Admin. Sekarang sistem backend Anda diizinkan untuk melakukan simulasi transaksi langsung menggunakan Client-ID Sandbox Anda.
        </p>
        <div className="pt-2">
          <span className="inline-flex items-center px-3 py-1 bg-white text-xs font-mono font-bold text-slate-700 rounded-md shadow-xs border border-emerald-100">
            Status: Ready to Integration Testing
          </span>
        </div>
      </div>
    </div>
  );
}