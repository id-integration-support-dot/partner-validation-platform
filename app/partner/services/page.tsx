"use client";  
  
import { useEffect, useMemo, useState } from "react";  
  
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
  
export default function PartnerServicesPage() {  
  const [services, setServices] = useState<Service[]>([]);  
  const [selectedSubServiceIds, setSelectedSubServiceIds] = useState<Set<string>>(new Set());  
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
  
        const servicesJson = await servicesRes.json();  
        const scopeJson = await scopeRes.json();  
  
        if (!servicesRes.ok || !servicesJson.success) {  
          throw new Error(servicesJson?.error?.message || "Gagal memuat service catalog.");  
        }  
  
        setServices(servicesJson.data ?? []);  
  
        if (scopeRes.ok && scopeJson.success && scopeJson.data) {  
          const scopeData = scopeJson.data as ScopeResponse;  
          setSelectedSubServiceIds(new Set(scopeData.subServiceIds));  
        }  
      } catch (err) {  
        setError(err instanceof Error ? err.message : "Terjadi kesalahan saat memuat data.");  
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
  
      const result = await response.json();  
  
      if (!response.ok || !result.success) {  
        throw new Error(result?.error?.message || "Gagal menyimpan scope selection.");  
      }  
  
      setSuccessMessage("Pilihan service berhasil disimpan.");  
    } catch (err) {  
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan scope.");  
    } finally {  
      setSaving(false);  
    }  
  }  
  
  const totalSelected = useMemo(() => selectedSubServiceIds.size, [selectedSubServiceIds]);  
  
  if (loading) {  
    return (  
      <div className="min-h-screen bg-neutral-50 px-4 py-10">  
        <div className="mx-auto w-full max-w-5xl rounded-lg border border-neutral-200 bg-white p-8 shadow-sm">  
          <h1 className="text-xl font-medium text-neutral-900">Services</h1>  
          <p className="mt-2 text-sm text-neutral-500">Memuat service catalog...</p>  
        </div>  
      </div>  
    );  
  }  
  
  return (  
    <div className="min-h-screen bg-neutral-50 px-4 py-10">  
      <div className="mx-auto w-full max-w-5xl space-y-6">  
        <div className="rounded-lg border border-neutral-200 bg-white p-8 shadow-sm">  
          <h1 className="text-xl font-medium text-neutral-900">Services</h1>  
          <p className="mt-1 text-sm text-neutral-500">  
            Pilih layanan yang akan diimplementasikan untuk proses pengujian dan integrasi.  
          </p>  
  
          <div className="mt-6 rounded-md border border-neutral-200 bg-neutral-50 p-4">  
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">  
              <div>  
                <p className="text-sm font-medium text-neutral-900">  
                  Ringkasan Pilihan  
                </p>  
                <p className="text-sm text-neutral-500">  
                  {totalSelected} sub-service dipilih  
                </p>  
              </div>  
  
              <button  
                type="button"  
                onClick={handleSaveScope}  
                disabled={saving}  
                className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"  
              >  
                {saving ? "Menyimpan..." : "Simpan Pilihan"}  
              </button>  
            </div>  
          </div>  
  
          {error ? (  
            <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">  
              {error}  
            </div>  
          ) : null}  
  
          {successMessage ? (  
            <div className="mt-4 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">  
              {successMessage}  
            </div>  
          ) : null}  
        </div>  
  
        <div className="space-y-4">  
          {services.map((service) => (  
            <div  
              key={service.id}  
              className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm"  
            >  
              <div className="mb-4">  
                <h2 className="text-lg font-medium text-neutral-900">  
                  {service.name}  
                </h2>  
                <p className="mt-1 text-sm text-neutral-500">  
                  {service.description || "Tidak ada deskripsi tambahan."}  
                </p>  
              </div>  
  
              <div className="space-y-3">  
                {service.subServices.map((subService) => {  
                  const checked = selectedSubServiceIds.has(subService.id);  
  
                  return (  
                    <label  
                      key={subService.id}  
                      className="flex cursor-pointer items-start gap-3 rounded-md border border-neutral-200 p-4 transition hover:border-neutral-300 hover:bg-neutral-50"  
                    >  
                      <input  
                        type="checkbox"  
                        checked={checked}  
                        onChange={() => toggleSubService(subService.id)}  
                        className="mt-1 h-4 w-4 rounded border-neutral-300"  
                      />  
  
                      <div className="min-w-0">  
                        <p className="text-sm font-medium text-neutral-900">  
                          {subService.name}  
                        </p>  
                        <p className="mt-1 text-xs text-neutral-500">  
                          {subService.code}  
                        </p>  
                        {subService.description ? (  
                          <p className="mt-2 text-sm text-neutral-500">  
                            {subService.description}  
                          </p>  
                        ) : null}  
                      </div>  
                    </label>  
                  );  
                })}  
              </div>  
            </div>  
          ))}  
        </div>  
      </div>  
    </div>  
  );  
}