"use client";  
  
import React, { useEffect, useMemo, useState } from "react";  
import { useRouter } from "next/navigation";
import { 
  Save, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  ChevronDown,
  ChevronUp,
  CheckSquare,
  Square
} from "lucide-react";
  
type SubService = {  
  id: string;  
  name: string;  
  code: string;  
  description?: string | null;  
};  
  
type Service = {  
  id: string;  
  name: string;  
  description?: string | null;  
  subServices: SubService[];  
};  
  
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
  
type ServicesApiResponse = {  
  success: boolean;  
  data?: Service[];  
  error?: ApiError;  
};  
  
type ScopeApiResponse = {  
  success: boolean;  
  data?: ScopeResponse | null;  
  message?: string;  
  error?: ApiError;  
};  
  
type SaveScopeApiResponse = {  
  success: boolean;  
  data?: ScopeResponse;  
  error?: ApiError;  
};  
  
export default function PartnerServicesPage() {  
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);  
  const [selectedSubServiceIds, setSelectedSubServiceIds] = useState<Set<string>>(  
    new Set()  
  );  
  const [expandedServiceId, setExpandedServiceId] = useState<string | null>(null);  
  const [loading, setLoading] = useState(true);  
  const [saving, setSaving] = useState(false);  
  const [error, setError] = useState<string | null>(null);  
  const [successMessage, setSuccessMessage] = useState<string | null>(null);  
  
  useEffect(() => {  
    async function loadData() {  
      try {  
        setLoading(true);  
        setError(null);  
  
        const [servicesRes, scopeRes] = await Promise.all([  
          fetch("/api/services", { cache: "no-store" }),  
          fetch("/api/scope", { cache: "no-store" }),  
        ]);  
  
        const servicesJson = (await servicesRes.json()) as ServicesApiResponse;  
        const scopeJson = (await scopeRes.json()) as ScopeApiResponse;  
  
        if (!servicesRes.ok || !servicesJson.success) {  
          throw new Error(  
            servicesJson.error?.message || "Gagal memuat service catalog."  
          );  
        }  
  
        setServices(servicesJson.data ?? []);  
  
        if (scopeRes.ok && scopeJson.success && scopeJson.data) {  
          setSelectedSubServiceIds(new Set(scopeJson.data.subServiceIds));  
        }  
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
  
    loadData();  
  }, []);  
  
  function toggleSubService(subServiceId: string) {  
    setSuccessMessage(null);  
  
    setSelectedSubServiceIds((prev) => {  
      const next = new Set(prev);  
  
      if (next.has(subServiceId)) {  
        next.delete(subServiceId);  
      } else {  
        next.add(subServiceId);  
      }  
  
      return next;  
    });  
  }  
  
  function isAllSubServicesSelected(service: Service) {  
    return service.subServices.every((subService) =>  
      selectedSubServiceIds.has(subService.id)  
    );  
  }  
  
  function getSelectedCount(service: Service) {  
    return service.subServices.filter((subService) =>  
      selectedSubServiceIds.has(subService.id)  
    ).length;  
  }  
  
  function toggleSelectAll(service: Service) {  
    setSuccessMessage(null);  
  
    setSelectedSubServiceIds((prev) => {  
      const next = new Set(prev);  
      const allSelected = service.subServices.every((subService) =>  
        next.has(subService.id)  
      );  
  
      if (allSelected) {  
        service.subServices.forEach((subService) => {  
          next.delete(subService.id);  
        });  
      } else {  
        service.subServices.forEach((subService) => {  
          next.add(subService.id);  
        });  
      }  
  
      return next;  
    });  
  }  
  
  function getServiceStatus(service: Service) {  
    const selectedCount = getSelectedCount(service);  
    const totalCount = service.subServices.length;  
  
    if (selectedCount === 0) {  
      return {  
        label: "Belum dipilih",  
        className: "bg-slate-100 text-slate-700 border-slate-300",  
      };  
    }  
  
    if (selectedCount === totalCount) {  
      return {  
        label: "Semua dipilih",  
        className: "bg-emerald-50 text-[#10b981] border-emerald-300",  
      };  
    }  
  
    return {  
      label: `${selectedCount}/${totalCount} Terpilih`,  
      className: "bg-blue-50 text-[#0d5ddf] border-blue-300",  
    };  
  }  
  
  async function handleSaveScope() {  
    try {  
      setSaving(true);  
      setError(null);  
      setSuccessMessage(null);  
  
      if (selectedSubServiceIds.size === 0) {  
        setError("Pilih minimal satu sub-service untuk melanjutkan.");  
        return;  
      }  
  
      const response = await fetch("/api/scope/select", {  
        method: "POST",  
        headers: {  
          "Content-Type": "application/json",  
        },  
        body: JSON.stringify({  
          sub_service_ids: Array.from(selectedSubServiceIds),  
        }),  
      });  
  
      const result = (await response.json()) as SaveScopeApiResponse;  
  
      if (!response.ok || !result.success) {  
        throw new Error(  
          result.error?.message || "Gagal menyimpan scope selection."  
        );  
      }  
  
      setSuccessMessage("Pilihan service berhasil disimpan. Mengalihkan halaman...");  
      
      // Mengalihkan secara aman ke halaman dashboard utama setelah 1.5 detik
      setTimeout(() => {
        router.push("/partner/dashboard");
      }, 1500);

    } catch (err) {  
      setError(  
        err instanceof Error  
          ? err.message  
          : "Terjadi kesalahan saat menyimpan scope."  
      );  
    } finally {  
      setSaving(false);  
    }  
  }  
  
  const totalSelected = useMemo(  
    () => selectedSubServiceIds.size,  
    [selectedSubServiceIds]  
  );  
  
  if (loading) {  
    return (  
      <div className="min-h-screen bg-[#f8fafc] px-6 py-12 flex items-center justify-center">  
        <div className="w-full max-w-5xl text-center space-y-4">  
          <Loader2 className="h-10 w-10 animate-spin text-[#0d5ddf] mx-auto" />  
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Memuat Service Catalog...</p>  
        </div>  
      </div>  
    );  
  }  
  
  return (  
    <div className="min-h-screen bg-[#f8fafc] px-4 sm:px-6 py-12 text-slate-900">  
      <div className="mx-auto w-full max-w-6xl space-y-6">  
        
        {/* Header Section */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">  
          <div className="space-y-1.5 max-w-2xl">
            <div className="text-[#0d5ddf]">
              <span className="text-xs font-bold uppercase tracking-wider">Phase 0 — Scope Selection</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Pilih Layanan Integrasi</h1>  
            <p className="text-sm text-slate-500 leading-relaxed">  
              Silakan tentukan modul sub-layanan yang akan diimplementasikan untuk pengujian modul API Anda sebelum masuk ke tahap sandbox.
            </p>  
          </div>  

          {/* Widget Ringkasan Kontras Utama */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shrink-0 flex flex-col sm:flex-row sm:items-center gap-6 min-w-[320px]">
            <div className="flex-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Terpilih</span>
              <p className="text-base font-bold text-slate-800">{totalSelected} Sub-Service</p>
            </div>
            <button  
              type="button"  
              onClick={handleSaveScope}  
              disabled={saving}  
              className="h-10 bg-[#0d5ddf] hover:bg-[#0c52c4] text-white rounded-lg text-xs font-semibold px-5 flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-sm uppercase tracking-wider cursor-pointer"  
            >  
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Simpan Pilihan
                </>
              )}  
            </button>
          </div>
        </div>  

        {/* Notifikasi Alerts */}
        {(error || successMessage) && (
          <div className="space-y-3">
            {error && (  
              <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-[#ee4d2d] flex items-start gap-3 shadow-sm">  
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{error}</span>  
              </div>  
            )}  
            {successMessage && (  
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-semibold text-[#10b981] flex items-start gap-3 shadow-sm">  
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{successMessage}</span>  
              </div>  
            )}
          </div>
        )}  
  
        {/* Balanced Grid System */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">  
          {services.map((service) => {  
            const selectedCount = getSelectedCount(service);  
            const totalCount = service.subServices.length;  
            const status = getServiceStatus(service);  
            const isExpanded = expandedServiceId === service.id;  
  
            return (  
              <div  
                key={service.id}  
                className={isExpanded ? "flex flex-col rounded-2xl border bg-white shadow-md transition-all duration-300 md:col-span-2 lg:col-span-3 border-[#0d5ddf]/30" : "flex flex-col rounded-2xl border bg-white shadow-sm transition-all duration-300 border-slate-200"}  
              >  
                {/* Bagian Utama Kartu */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase border tracking-wider ${status.className}`}>  
                        {status.label}  
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <h2 className="text-lg font-bold leading-snug text-slate-800">  
                        {service.name}  
                      </h2>  
                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">  
                        {service.description || "Tidak ada deskripsi tambahan untuk kategori layanan ini."}  
                      </p>  
                    </div>  
                  </div>

                  {/* Penghitung Informasi Status */}
                  <div className="grid grid-cols-2 gap-3 bg-slate-50 border border-slate-200/50 rounded-xl p-4 text-xs">
                    <div>
                      <span className="text-slate-400 block mb-0.5">Sub-Service</span>
                      <span className="font-mono font-bold text-slate-800 text-sm">{totalCount} Scope</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Dipilih</span>
                      <span className="font-mono font-bold text-[#0d5ddf] text-sm">{selectedCount} Scope</span>
                    </div>
                  </div>

                  {/* Tombol Aksi Bawah */}
                  <div className="flex gap-2 pt-1">  
                    <button  
                      type="button"  
                      onClick={() => toggleSelectAll(service)}  
                      className="flex-1 h-10 rounded-lg border border-slate-400 bg-slate-100 text-slate-800 font-bold hover:bg-slate-200 active:bg-slate-300 text-xs uppercase tracking-wider transition-all cursor-pointer"  
                    >  
                      {isAllSubServicesSelected(service) ? "Batalkan" : "Pilih semua"}  
                    </button>  
  
                    <button  
                      type="button"  
                      onClick={() =>  
                        setExpandedServiceId((prev) =>  
                          prev === service.id ? null : service.id  
                        )  
                      }  
                      className={isExpanded ? "flex-1 h-10 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer bg-slate-700 text-white border border-slate-800 hover:bg-slate-800 active:bg-slate-900 shadow-sm" : "flex-1 h-10 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer bg-[#0d5ddf] text-white hover:bg-[#0c52c4] active:bg-[#0a46a6] shadow-sm"}  
                    >  
                      {isExpanded ? (
                        <>Tutup <ChevronUp className="w-3.5 h-3.5" /></>
                      ) : (
                        <>Scope <ChevronDown className="w-3.5 h-3.5" /></>
                      )}
                    </button>  
                  </div>
                </div>  
  
                {/* Laci Kontainer Menampilkan Sub-Services */}
                {isExpanded && (
                  <div className="border-t border-slate-200 bg-slate-50/50 rounded-b-2xl p-6 transition-all duration-300">  
                    <div className="space-y-4">
                      <div className="text-slate-800 font-bold text-xs uppercase tracking-wider">
                        <h4>Daftar Sub-Service — {service.name}</h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">  
                        {service.subServices.map((subService) => {  
                          const isChecked = selectedSubServiceIds.has(subService.id);  
  
                          return (  
                            <div  
                              key={subService.id}  
                              onClick={() => toggleSubService(subService.id)}
                              className={isChecked ? "flex items-start gap-4 rounded-xl border p-5 transition-all duration-200 cursor-pointer bg-white border-[#0d5ddf] bg-[#0d5ddf]/5 shadow-sm" : "flex items-start gap-4 rounded-xl border p-5 transition-all duration-200 cursor-pointer bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"}  
                            >  
                              <div className="mt-0.5 shrink-0">
                                {isChecked ? (
                                  <CheckSquare className="w-5 h-5 text-[#0d5ddf]" />
                                ) : (
                                  <Square className="w-5 h-5 text-slate-300" />
                                )}
                              </div>
  
                              <div className="min-w-0 flex-1 space-y-1">  
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="text-xs font-bold text-slate-800 leading-tight">  
                                    {subService.name}  
                                  </p>  
                                  <span className="font-mono text-[9px] font-bold tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200 uppercase">  
                                    {subService.code}  
                                  </span>  
                                </div>  
                                
                                {subService.description ? (  
                                  <p className="text-[11px] text-slate-400 leading-relaxed">  
                                    {subService.description}  
                                  </p>  
                                ) : null}  
                              </div>  
                            </div>  
                          );  
                        })}  
                      </div>  
                    </div>
                  </div>
                )}  
              </div>  
            );  
          })}  
        </div>  

        {/* Informasi Footer */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 flex gap-4 text-xs text-slate-500 leading-relaxed shadow-sm">
          <div className="space-y-1">
            <span className="font-bold text-slate-800 block">Informasi Sinkronisasi Scope:</span>
            <p>
              Setiap kali Anda mengubah pilihan modul layanan, pastikan untuk mengklik tombol <strong>Simpan Pilihan</strong> untuk mengunggah konfigurasi terbaru Anda ke sandbox server pengujian PartnerHub.
            </p>
          </div>
        </div>

      </div>  
    </div>  
  );  
}