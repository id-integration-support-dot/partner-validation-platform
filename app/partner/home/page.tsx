"use client";  
  
import Link from "next/link";  
import { useEffect, useState } from "react";  
  
type ScopeResponse = {  
  id: string;  
  partnerUserId: string;  
  activeCount: number;  
  passedCount: number;  
  progressPercentage: number;  
  subServiceIds: string[];  
  subServices: {  
    id: string;  
    name: string;  
    code: string;  
    serviceId: string;  
    serviceName: string;  
  }[];  
};  
  
type ApiError = {  
  code: string;  
  message: string;  
};  
  
type ScopeApiResponse = {  
  success: boolean;  
  data?: ScopeResponse | null;  
  message?: string;  
  error?: ApiError;  
};  
  
export default function PartnerHomePage() {  
  const [scope, setScope] = useState<ScopeResponse | null>(null);  
  const [loading, setLoading] = useState(true);  
  const [error, setError] = useState<string | null>(null);  
  
  useEffect(() => {  
    async function loadScope() {  
      try {  
        setLoading(true);  
        setError(null);  
  
        const response = await fetch("/api/scope", { cache: "no-store" });  
        const result = (await response.json()) as ScopeApiResponse;  
  
        if (!response.ok || !result.success) {  
          throw new Error(result.error?.message || "Gagal memuat progress partner.");  
        }  
  
        setScope(result.data ?? null);  
      } catch (err) {  
        setError(  
          err instanceof Error  
            ? err.message  
            : "Terjadi kesalahan saat memuat data."  
        );  
      } finally {  
        setLoading(false);  
      }  
    }  
  
    loadScope();  
  }, []);  
  
  return (  
    <div className="min-h-screen bg-[#f3f5f9] px-6 py-12 flex flex-col justify-start items-center">  
      <div className="w-full max-w-6xl space-y-6">  
        
        {/* Header Section */}
        <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">  
          <h1 className="text-xl font-medium text-slate-900">  
            Home  
          </h1>  
          <p className="mt-1 text-sm text-slate-500">  
            Halaman ini menjelaskan tahapan pengerjaan integrasi dan status progress Anda.  
          </p>  
        </div>  
  
        {/* Status / Loading / Error Section */}
        {loading ? (  
          <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm flex items-center gap-3">  
            {/* Native Tailwind Loading Spinner */}
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-[#0d5ddf]"></div>
            <p className="text-sm text-slate-500">Memuat ringkasan progress...</p>  
          </div>  
        ) : error ? (  
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 shadow-sm flex items-center gap-2">  
            <span className="font-bold">⚠️</span>  
            <span>{error}</span>  
          </div>  
        ) : (  
          <div className="grid gap-4 md:grid-cols-3">  
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">  
              <p className="text-sm text-slate-500">Scope dipilih</p>  
              <p className="mt-2 text-3xl font-medium text-slate-900">  
                {scope?.activeCount ?? 0}  
              </p>  
            </div>  
  
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">  
              <p className="text-sm text-slate-500">Scope selesai</p>  
              <p className="mt-2 text-3xl font-medium text-slate-900">  
                {scope?.passedCount ?? 0}  
              </p>  
            </div>  
  
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">  
              <p className="text-sm text-slate-500">Progress</p>  
              <p className="mt-2 text-3xl font-medium text-slate-900">  
                {scope?.progressPercentage ?? 0}%  
              </p>  
            </div>  
          </div>  
        )}  
  
        {/* Alur Pengerjaan */}
        <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">  
          <h2 className="text-lg font-medium text-slate-900">  
            Alur Pengerjaan  
          </h2>  
  
          <div className="mt-6 grid gap-4 md:grid-cols-3">  
            <div className="rounded-xl border border-slate-200 p-5 bg-white">  
              <p className="text-sm font-medium text-slate-900">  
                1. Pilih Scope  
              </p>  
              <p className="mt-2 text-sm leading-6 text-slate-500">  
                Tentukan service dan sub-service yang akan diimplementasikan pada menu Services.  
              </p>  
            </div>  
  
            <div className="rounded-xl border border-slate-200 p-5 bg-white">  
              <p className="text-sm font-medium text-slate-900">  
                2. Lengkapi pengujian  
              </p>  
              <p className="mt-2 text-sm leading-6 text-slate-500">  
                Selesaikan pengujian sesuai scope yang telah dipilih untuk masing-masing service.  
              </p>  
            </div>  
  
            <div className="rounded-xl border border-slate-200 p-5 bg-white">  
              <p className="text-sm font-medium text-slate-900">  
                3. Tinjau informasi teknis  
              </p>  
              <p className="mt-2 text-sm leading-6 text-slate-500">  
                Gunakan menu Info untuk melihat API specification dan dokumen pendukung integrasi.  
              </p>  
            </div>  
          </div>  
        </div>  
  
        {/* Quick Actions */}
        <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">  
          <h2 className="text-lg font-medium text-slate-900">  
            Navigasi Cepat  
          </h2>  
  
          <div className="mt-4 flex flex-wrap gap-3">  
            <Link  
              href="/partner/services"  
              className="rounded-xl bg-[#0d5ddf] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#0c52c4] active:bg-[#0a46a6] transition-all shadow-sm"  
            >  
              Buka Services  
            </Link>  
  
            <Link  
              href="/partner/info"  
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition-all"  
            >  
              Lihat Info  
            </Link>  
          </div>  
        </div>  
  
      </div>  
    </div>  
  );  
}