"use client";

import React, { useState, useEffect, use } from "react";

interface Submission {
  id: string;
  serviceId: string;
  subServiceId: string;
  caseType: "positive" | "negative";
  status: string;
  fileName: string;
  createdAt?: string;
}

// Data pemetaan sub-service berdasarkan induk Service ID-nya
const SUB_SERVICES_REGISTRY: Record<string, { id: string; name: string }[]> = {
  svc_balance: [
    { id: "ss_balance_001", name: "Balance Inquiry" },
    { id: "ss_statement_002", name: "Mini Statement" }
  ],
  svc_transfer: [
    { id: "ss_transfer_003", name: "Fund Transfer Intra-Bank" },
    { id: "ss_transfer_004", name: "Fund Transfer Inter-Bank" }
  ],
};

// PERBAIKAN: Mengamankan struktur tipe data Promise params agar bertipe string eksplisit
interface PageProps {
  params: Promise<{ serviceId: string }>;
}

export default function DeveloperSiteTestingPage({ params }: PageProps) {
  // Unpack params secara aman di Client Component Next.js terbaru
  const resolvedParams = use(params);
  const serviceId = resolvedParams?.serviceId || "";

  // Ambil daftar sub-service yang sesuai dengan serviceId saat ini
  const availableSubServices = SUB_SERVICES_REGISTRY[serviceId] || [];

  const [selectedSubServiceId, setSelectedSubServiceId] = useState("");
  const [caseType, setCaseType] = useState<"positive" | "negative">("positive");
  const [file, setFile] = useState<File | null>(null);
  
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Sinkronisasi state selectedSubServiceId ketika data registry berhasil dimuat
  useEffect(() => {
    if (availableSubServices.length > 0) {
      setSelectedSubServiceId(availableSubServices[0].id);
    }
  }, [serviceId]);

  const fetchSubmissions = async () => {
    try {
      const res = await fetch("/api/track-a/submissions");
      
      // PERBAIKAN MUTLAK: Cast menggunakan ': any' untuk melewati pembatasan tipe data standar
      const result: any = await res.json();
      
      if (result && result.success && Array.isArray(result.data)) {
        // Filter riwayat agar hanya menampilkan data yang sesuai dengan serviceId saat ini
        const filtered = result.data.filter((sub: Submission) => sub.serviceId === serviceId);
        setSubmissions(filtered);
      }
    } catch (error) {
      console.error("Gagal memuat riwayat pengujian:", error);
    }
  };

  useEffect(() => {
    if (serviceId) {
      fetchSubmissions();
    }
  }, [serviceId]);

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result as string;
        const cleanBase64 = base64String.split(",")[1];
        resolve(cleanBase64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!selectedSubServiceId) {
      setMessage({ type: "error", text: "Tidak ada sub-service aktif untuk layanan ini." });
      return;
    }

    if (!file) {
      setMessage({ type: "error", text: "Silakan pilih berkas dokumen PDF terlebih dahulu." });
      return;
    }

    if (file.type !== "application/pdf") {
      setMessage({ type: "error", text: "Hanya berkas berformat PDF yang diperbolehkan." });
      return;
    }

    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      setMessage({ type: "error", text: "Ukuran berkas melebihi batas maksimum 10MB." });
      return;
    }

    setIsLoading(true);

    try {
      const base64Content = await convertFileToBase64(file);

      const res = await fetch("/api/track-a/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: serviceId,
          subServiceId: selectedSubServiceId,
          caseType: caseType,
          fileName: file.name,
          mimeType: file.type,
          fileSize: file.size,
          base64Content: base64Content,
        }),
      });

      // PERBAIKAN: Memastikan penanganan respons pengunggahan aman dari deteksi compiler
      const result: any = await res.json();

      if (result && result.success) {
        setMessage({ type: "success", text: "Dokumen Developer Site Testing berhasil diunggah." });
        setFile(null);
        const fileInput = document.getElementById("pdf-uploader") as HTMLInputElement;
        if (fileInput) fileInput.value = "";
        
        await fetchSubmissions();
      } else {
        setMessage({ type: "error", text: result?.error || "Gagal mengunggah dokumen." });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Terjadi kesalahan jaringan." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] px-6 py-12 text-slate-900">
      <div className="mx-auto w-full max-w-5xl space-y-8">
        
        {/* Header */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100 uppercase">
            Service Scope: {serviceId ? serviceId.replace("svc_", "").toUpperCase() : ""}
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Developer Site Testing</h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            Unggah dokumen standarisasi untuk jenis layanan ini. Setiap sub-service wajib melampirkan <span className="font-semibold text-slate-700">Positive Case</span> dan <span className="font-semibold text-slate-700">Negative Case</span>.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          
          {/* Form */}
          <div className="md:col-span-1 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-3">
              Upload Test Case
            </h2>

            {availableSubServices.length === 0 ? (
              <p className="text-xs text-rose-600 italic">Tidak ada sub-service aktif untuk modul ini.</p>
            ) : (
              <form onSubmit={handleUploadSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Pilih Sub-Service</label>
                  <select
                    value={selectedSubServiceId}
                    onChange={(e) => setSelectedSubServiceId(e.target.value)}
                    className="w-full h-10 bg-white border border-slate-300 rounded-xl px-3 text-sm focus:outline-none focus:border-blue-500 transition cursor-pointer"
                  >
                    {availableSubServices.map((ss) => (
                      <option key={ss.id} value={ss.id}>{ss.name}</option>
                    ))}
                  </select>
                </div>

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
                      Positive
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
                      Negative
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Berkas Uji (PDF)</label>
                  <input
                    id="pdf-uploader"
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 border border-slate-300 rounded-xl p-1.5 bg-slate-50/50"
                  />
                </div>

                {message && (
                  <div className={`p-3 rounded-xl text-xs font-medium ${
                    message.type === "success" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-rose-50 text-rose-800 border border-rose-200"
                  }`}>
                    {message.text}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-10 bg-[#0d5ddf] hover:bg-[#0c52c4] disabled:bg-slate-300 text-white text-xs font-semibold rounded-xl transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? "Memproses..." : "Unggah Dokumen"}
                </button>
              </form>
            )}
          </div>

          {/* Tabel Riwayat */}
          <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 bg-white">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Submission History Logs
              </h2>
            </div>

            {submissions.length === 0 ? (
              <div className="px-6 py-16 text-center text-sm text-slate-400 italic">
                Belum ada dokumen pengujian yang diunggah untuk layanan ini.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-200">
                      <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Sub-Service</th>
                      <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Skenario</th>
                      <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Nama Berkas</th>
                      <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {submissions.map((sub) => {
                      const serviceInfo = availableSubServices.find((s) => s.id === sub.subServiceId);
                      return (
                        <tr key={sub.id} className="hover:bg-slate-50/40 transition-colors">
                          <td className="px-5 py-4 text-sm font-medium text-slate-900 text-center">{serviceInfo ? serviceInfo.name : sub.subServiceId}</td>
                          <td className="px-5 py-4 text-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase ${
                              sub.caseType === "positive" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"
                            }`}>{sub.caseType}</span>
                          </td>
                          <td className="px-5 py-4 text-sm text-slate-600 text-center max-w-[180px] truncate">{sub.fileName}</td>
                          <td className="px-5 py-4 text-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase ${
                              sub.status === "validated" ? "bg-blue-50 text-blue-700 border border-blue-200" : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}>{sub.status}</span>
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