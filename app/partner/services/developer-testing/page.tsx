"use client";

import React, { useState, useEffect } from "react";

// Struktur tipe data sesuai dengan arsitektur backend D1 yang lolos uji
interface Submission {
  id: string;
  serviceId: string;
  subServiceId: string;
  caseType: "positive" | "negative";
  status: string;
  fileName: string;
  createdAt?: string;
}

// Dummy data untuk active scope sub-service milik partner (Bisa diganti dari API/Props nanti)
const ACTIVE_SUB_SERVICES = [
  { id: "ss_balance_001", name: "Balance Inquiry", serviceId: "svc_balance" },
  { id: "ss_statement_002", name: "Mini Statement", serviceId: "svc_statement" },
  { id: "ss_transfer_003", name: "Fund Transfer Intra-Bank", serviceId: "svc_transfer" },
];

export default function DeveloperSiteTestingPartnerPage() {
  // States untuk form upload
  const [selectedSubServiceId, setSelectedSubServiceId] = useState(ACTIVE_SUB_SERVICES[0].id);
  const [caseType, setCaseType] = useState<"positive" | "negative">("positive");
  const [file, setFile] = useState<File | null>(null);
  
  // States untuk manajemen data & UI
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // 1. Ambil riwayat submission saat komponen dimuat (Sesuai Step 7 backend test)
  const fetchSubmissions = async () => {
    try {
      const res = await fetch("/api/track-a/submissions");
      const result = await res.json();
      if (result.success) {
        setSubmissions(result.data);
      }
    } catch (error) {
      console.error("Gagal memuat riwayat pengujian:", error);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  // 2. Fungsi Helper konversi File objek ke format string Base64
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result as string;
        // Hapus prefix meta data url (e.g., "data:application/pdf;base64,")
        const cleanBase64 = base64String.split(",")[1];
        resolve(cleanBase64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  // 3. Handler Submit Formulir Pengujian
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!file) {
      setMessage({ type: "error", text: "Silakan pilih berkas dokumen PDF terlebih dahulu." });
      return;
    }

    // Validasi Client-Side 1: Format Berkas Wajib PDF
    if (file.type !== "application/pdf") {
      setMessage({ type: "error", text: "Hanya berkas berformat PDF yang diperbolehkan." });
      return;
    }

    // Validasi Client-Side 2: Ukuran Berkas Maksimal 10MB
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 Megabytes
    if (file.size > MAX_FILE_SIZE) {
      setMessage({ type: "error", text: "Ukuran berkas melebihi batas maksimum 10MB." });
      return;
    }

    setIsLoading(true);

    try {
      const targetSubService = ACTIVE_SUB_SERVICES.find(s => s.id === selectedSubServiceId);
      const base64Content = await convertFileToBase64(file);

      // Tembak API backend sesuai uji coba console yang sukses sebelumnya
      const res = await fetch("/api/track-a/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceId: targetSubService?.serviceId || "unknown",
          subServiceId: selectedSubServiceId,
          caseType: caseType,
          fileName: file.name,
          mimeType: file.type,
          fileSize: file.size,
          base64Content: base64Content,
        }),
      });

      const result = await res.json();

      if (result.success) {
        setMessage({ type: "success", text: "Dokumen pengujian berhasil diunggah ke sistem sandbox." });
        setFile(null); // Reset input file
        // Reset element input file manual
        const fileInput = document.getElementById("pdf-uploader") as HTMLInputElement;
        if (fileInput) fileInput.value = "";
        
        // Refresh tabel riwayat agar data terbaru muncul
        await fetchSubmissions();
      } else {
        setMessage({ type: "error", text: result.error || "Gagal mengunggah dokumen." });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Terjadi kesalahan jaringan saat menghubungi server." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] px-6 py-12 text-slate-900 selection:bg-blue-50">
      <div className="mx-auto w-full max-w-5xl space-y-8">
        
        {/* Header Title Section */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wider bg-blue-50 text-blue-700 border border-blue-100 uppercase">
            Sprint 4 — Active Module
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Developer Site Testing
          </h1>
          <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
            Unggah dokumen standarisasi integrasi sistem Anda di bawah ini. Setiap sub-service yang aktif diwajibkan memiliki sepasang pengujian yaitu <span className="font-semibold text-slate-700">Positive Case</span> dan <span className="font-semibold text-slate-700">Negative Case</span>.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          
          {/* Form Card Input (Kiri) */}
          <div className="md:col-span-1 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-3">
              Upload Test Case
            </h2>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              
              {/* Dropdown Sub-Service */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Pilih Sub-Service</label>
                <select
                  value={selectedSubServiceId}
                  onChange={(e) => setSelectedSubServiceId(e.target.value)}
                  className="w-full h-10 bg-white border border-slate-300 rounded-xl px-3 text-sm font-normal text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition cursor-pointer"
                >
                  {ACTIVE_SUB_SERVICES.map((ss) => (
                    <option key={ss.id} value={ss.id}>
                      {ss.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Radio Case Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Jenis Skenario Kasus</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCaseType("positive")}
                    className={`h-10 text-xs font-medium rounded-xl border transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      caseType === "positive"
                        ? "bg-emerald-50 border-emerald-300 text-emerald-800 ring-1 ring-emerald-300"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${caseType === "positive" ? "bg-emerald-500" : "bg-slate-400"}`}></span>
                    Positive Case
                  </button>

                  <button
                    type="button"
                    onClick={() => setCaseType("negative")}
                    className={`h-10 text-xs font-medium rounded-xl border transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      caseType === "negative"
                        ? "bg-rose-50 border-rose-300 text-rose-800 ring-1 ring-rose-300"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${caseType === "negative" ? "bg-rose-500" : "bg-slate-400"}`}></span>
                    Negative Case
                  </button>
                </div>
              </div>

              {/* Input File PDF */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Berkas Hasil Uji (PDF)</label>
                <input
                  id="pdf-uploader"
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 file:cursor-pointer border border-slate-300 rounded-xl p-1.5 bg-slate-50/50"
                />
                <p className="text-[10px] text-slate-400">Maksimal ukuran file 10MB format khusus .pdf</p>
              </div>

              {/* Notifikasi Alert */}
              {message && (
                <div className={`p-3 rounded-xl text-xs font-medium leading-relaxed ${
                  message.type === "success" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-rose-50 text-rose-800 border border-rose-200"
                }`}>
                  {message.text}
                </div>
              )}

              {/* Tombol Submit Action */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 bg-[#0d5ddf] hover:bg-[#0c52c4] active:bg-[#0a46a6] disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-xl transition shadow-sm flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Memproses...
                  </>
                ) : (
                  "Unggah Dokumen"
                )}
              </button>
            </form>
          </div>

          {/* Tabel Riwayat Unggahan Granular (Kanan) */}
          <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 bg-white">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Submission History Logs
              </h2>
            </div>

            {submissions.length === 0 ? (
              <div className="px-6 py-16 text-center text-sm text-slate-400 italic">
                Belum ada berkas pengujian yang diunggah. Silakan gunakan form di samping kiri.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-200">
                      <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">
                        Sub-Service
                      </th>
                      <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">
                        Skenario Kasus
                      </th>
                      <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">
                        Nama Berkas
                      </th>
                      <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">
                        Status Validasi
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {submissions.map((sub) => {
                      // Temukan nama asli sub-service berdasarkan ID internalnya
                      const serviceInfo = ACTIVE_SUB_SERVICES.find((s) => s.id === sub.subServiceId);
                      
                      return (
                        <tr key={sub.id} className="hover:bg-slate-50/40 transition-colors">
                          
                          {/* Nama Sub-Service */}
                          <td className="px-5 py-4 text-sm font-medium text-slate-900 whitespace-nowrap text-center">
                            {serviceInfo ? serviceInfo.name : sub.subServiceId}
                          </td>

                          {/* Badge Case Type */}
                          <td className="px-5 py-4 whitespace-nowrap text-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase ${
                              sub.caseType === "positive" 
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                            }`}>
                              {sub.caseType === "positive" ? "Positive" : "Negative"}
                            </span>
                          </td>

                          {/* Nama Berkas */}
                          <td className="px-5 py-4 text-sm font-normal text-slate-600 whitespace-nowrap text-center max-w-[180px] truncate">
                            {sub.fileName}
                          </td>

                          {/* Badge Status Review */}
                          <td className="px-5 py-4 whitespace-nowrap text-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider ${
                              sub.status === "validated"
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : sub.status === "uploaded"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-slate-100 text-slate-600"
                            }`}>
                              {sub.status}
                            </span>
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}