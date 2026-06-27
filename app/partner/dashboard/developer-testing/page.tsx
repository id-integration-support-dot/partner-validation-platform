"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface SubService {
  id: string;
  name: string;
  serviceId: string;
  code: string;
}

interface Submission {
  id: string;
  subServiceId: string;
  caseType: "positive" | "negative";
  status: string;
  fileName: string;
}

interface ScopeResponse {
  success: boolean;
  data?: {
    subServices: SubService[];
  };
}

interface SubmissionResponse {
  success: boolean;
  data?: Submission[];
}

export default function PartnerDeveloperTestingPage() {
  const [subServices, setSubServices] = useState<SubService[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const loadPartnerData = async () => {
    try {
      const scopeRes = await fetch("/api/partner/scope");
      const scopeResult = (await scopeRes.json()) as ScopeResponse;

      if (scopeResult.success && scopeResult.data?.subServices) {
        setSubServices(scopeResult.data.subServices);
      }

      const subRes = await fetch("/api/track-a/submissions");
      const subResult = (await subRes.json()) as SubmissionResponse;

      if (subResult.success && subResult.data) {
        setSubmissions(subResult.data);
      }
    } catch (err) {
      console.error("Gagal memuat data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPartnerData();
  }, []);

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    subService: SubService,
    caseType: "positive" | "negative"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Hanya file PDF yang diperbolehkan!");
      return;
    }

    const uniqueKey = `${subService.id}-${caseType}`;
    setUploadingId(uniqueKey);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const base64Content = (reader.result as string).split(",")[1];

        const res = await fetch("/api/track-a/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            serviceId: subService.serviceId,
            subServiceId: subService.id,
            caseType: caseType,
            fileName: file.name,
            mimeType: file.type,
            fileSize: file.size,
            base64Content: base64Content,
          }),
        });

        const result = (await res.json()) as any;
        
        if (result.success) {
          alert("Berhasil mengunggah dokumen.");
          await loadPartnerData();
        } else {
          alert(result.error || "Gagal mengunggah dokumen");
        }
      } catch (err) {
        alert("Terjadi kesalahan sistem.");
      } finally {
        setUploadingId(null);
      }
    };
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-sm text-slate-500">
        Memuat rincian testing scope Anda...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto text-slate-900">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Track A: Developer Site Testing</h1>
          <p className="text-sm text-slate-500 mt-1">
            Unggah dokumentasi Positive Case dan Negative Case berupa PDF untuk setiap sub-service scope Anda.
          </p>
        </div>
        <Link href="/partner/dashboard" className="text-sm font-medium text-blue-600 hover:underline">
          Kembali ke Dashboard
        </Link>
      </div>

      {subServices.length === 0 ? (
        <div className="p-8 border border-dashed border-slate-300 rounded-xl bg-slate-50 text-center">
          <p className="text-sm text-slate-500 italic">Anda belum memilih atau menyimpan Scope Layanan.</p>
          <p className="text-xs text-slate-400 mt-1">Silakan pilih scope terlebih dahulu agar lembar pengujian muncul.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {subServices.map((sub) => {
            const posDoc = submissions.find((s) => s.subServiceId === sub.id && s.caseType === "positive");
            const negDoc = submissions.find((s) => s.subServiceId === sub.id && s.caseType === "negative");

            return (
              <div key={sub.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <div className="mb-4">
                  <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold uppercase">
                    Code: {sub.code}
                  </span>
                  <h3 className="text-base font-semibold text-slate-800 mt-1">{sub.name}</h3>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* POSITIVE CASE */}
                  <div className="border border-slate-100 bg-slate-50/50 rounded-lg p-4 flex flex-col justify-between gap-3">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">Positive Case</span>
                        {posDoc && (
                          <span className="text-[11px] px-2 py-0.5 rounded-sm bg-emerald-50 text-emerald-600 font-medium border border-emerald-100">
                            {posDoc.status}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-2 truncate font-medium">
                        {posDoc ? `📄 ${posDoc.fileName}` : "Belum ada berkas diunggah"}
                      </p>
                    </div>
                    <label className="w-full text-center bg-white hover:bg-slate-100 border border-slate-200 rounded-lg py-2 text-xs font-semibold shadow-xs cursor-pointer block transition">
                      {uploadingId === `${sub.id}-positive` ? "Mengunggah..." : "Pilih Berkas (PDF)"}
                      <input
                        type="file"
                        accept="application/pdf"
                        disabled={uploadingId !== null}
                        onChange={(e) => handleFileChange(e, sub, "positive")}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* NEGATIVE CASE */}
                  <div className="border border-slate-100 bg-slate-50/50 rounded-lg p-4 flex flex-col justify-between gap-3">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-rose-700 uppercase tracking-wide">Negative Case</span>
                        {negDoc && (
                          <span className="text-[11px] px-2 py-0.5 rounded-sm bg-rose-50 text-rose-600 font-medium border border-rose-100">
                            {negDoc.status}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-2 truncate font-medium">
                        {negDoc ? `📄 ${negDoc.fileName}` : "Belum ada berkas diunggah"}
                      </p>
                    </div>
                    <label className="w-full text-center bg-white hover:bg-slate-100 border border-slate-200 rounded-lg py-2 text-xs font-semibold shadow-xs cursor-pointer block transition">
                      {uploadingId === `${sub.id}-negative` ? "Mengunggah..." : "Pilih Berkas (PDF)"}
                      <input
                        type="file"
                        accept="application/pdf"
                        disabled={uploadingId !== null}
                        onChange={(e) => handleFileChange(e, sub, "negative")}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}