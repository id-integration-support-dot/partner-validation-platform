"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

interface Submission {
  id: string;
  partnerUserId: string;
  serviceId: string;
  subServiceId: string;
  caseType: "positive" | "negative";
  status: string;
  fileName: string;
}

const SUB_SERVICE_NAMES: Record<string, string> = {
  ss_balance_001: "Balance Inquiry",
  ss_statement_002: "Mini Statement",
  ss_transfer_003: "Fund Transfer Intra-Bank",
};

export default function AdminPartnerAssessmentPage({ params }: PageProps) {
  const { id } = use(params);

  const [partner, setPartner] = useState<any>(null);
  const [scope, setScope] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [activeModalSubService, setActiveModalSubService] = useState<string | null>(null);
  const [isProcessingId, setIsProcessingId] = useState<string | null>(null);

  const loadDashboardData = async () => {
    try {
      const subRes = await fetch("/api/track-a/submissions");
      
      // BYPASS: Memaksa compiler mengabaikan aturan strict 'unknown' khusus pada data JSON ini
      const subResult: any = await subRes.json();
      
      if (subResult && subResult.success && Array.isArray(subResult.data)) {
        setSubmissions(subResult.data.filter((s: any) => s.partnerUserId === id));
      }

      setPartner({ id, name: "Partner Active Sandbox", email: "partner@sandbox.com" });
      setScope({
        activeCount: 1,
        subServices: [
          { id: "ss_balance_001", serviceName: "Transfer & Balance", name: "Balance Inquiry", code: "BAL_001" }
        ]
      });
      setProgress({ progressPercentage: 50 });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [id]);

  const handleUpdateStatus = async (documentId: string, newStatus: "validated" | "rejected") => {
    setIsProcessingId(documentId);
    try {
      const res = await fetch(`/api/track-a/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId, status: newStatus }),
      });
      
      const result: any = await res.json();
      
      if (result && result.success) {
        await loadDashboardData();
      } else {
        alert(result?.error || "Gagal mengubah status dokumen");
      }
    } catch (error) {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setIsProcessingId(null);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-sm text-slate-500">Memuat data assessment partner...</div>;
  }

  return (
    <div className="px-4 py-8 text-slate-900 selection:bg-blue-50">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        
        {/* Top Header Nav */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Assessment Platform</h1>
            <p className="mt-2 text-sm text-slate-500">
              Ringkasan hasil pengerjaan partner dan status pemenuhan kelayakan integrasi sandbox.
            </p>
          </div>
          <Link
            href="/admin/partners"
            className="inline-flex rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            Kembali ke Daftar Partner
          </Link>
        </div>

        {/* Dashboard Cards Summary */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500 font-medium">Nama Perusahaan Partner</p>
            <p className="mt-2 text-lg font-bold text-slate-900">{partner?.name}</p>
            <p className="mt-1 text-sm text-slate-400 font-mono">{partner?.email}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500 font-medium">Total Aktif Scope</p>
            <p className="mt-2 text-3xl font-bold">{scope?.activeCount ?? 0}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500 font-medium">Overall Progress Compliance</p>
            <p className="mt-2 text-3xl font-bold text-[#0d5ddf]">{progress?.progressPercentage ?? 0}%</p>
          </div>
        </div>

        {/* Main Table Scope Area */}
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-800 mb-4">Hasil Pengerjaan Scope Layanan</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-700">
                  <th className="px-4 py-3 text-left font-semibold">Service</th>
                  <th className="px-4 py-3 text-left font-semibold">Sub-service</th>
                  <th className="px-4 py-3 text-left font-semibold">Code</th>
                  <th className="px-4 py-3 text-center font-semibold text-[#0d5ddf]">Developer Site Testing</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-500">Track B (API Core Test)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {scope?.subServices.map((item: any) => {
                  const cases = submissions.filter((s) => s.subServiceId === item.id);
                  const positiveCase = cases.find((c) => c.caseType === "positive");
                  const negativeCase = cases.find((c) => c.caseType === "negative");

                  let trackAStatusLabel = "Missing Case";
                  let badgeColor = "bg-rose-50 text-rose-700 border border-rose-200";

                  if (positiveCase && negativeCase) {
                    if (positiveCase.status === "validated" && negativeCase.status === "validated") {
                      trackAStatusLabel = "Complete ✅";
                      badgeColor = "bg-emerald-50 text-emerald-700 border border-emerald-200";
                    } else {
                      trackAStatusLabel = "Waiting Review ⏳";
                      badgeColor = "bg-amber-50 text-amber-700 border border-amber-200";
                    }
                  } else if (positiveCase || negativeCase) {
                    trackAStatusLabel = "Partial Upload 👥";
                    badgeColor = "bg-blue-50 text-blue-700 border border-blue-200";
                  }

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-4 py-3.5 text-slate-500">{item.serviceName}</td>
                      <td className="px-4 py-3.5 font-medium text-slate-900">{item.name}</td>
                      <td className="px-4 py-3.5 text-slate-400 font-mono text-xs">{item.code}</td>
                      
                      <td className="px-4 py-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => setActiveModalSubService(item.id)}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition shadow-sm hover:scale-105 active:scale-95 ${badgeColor}`}
                        >
                          {trackAStatusLabel}
                        </button>
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-500">pending</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* MODAL PENINJAUAN POSITIVE & NEGATIVE CASE */}
      {activeModalSubService && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl border border-slate-200 shadow-2xl overflow-hidden">
            
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Developer Site Testing Review</h3>
                <p className="text-xs text-slate-500 mt-0.5">Sub-Service: {SUB_SERVICE_NAMES[activeModalSubService] || activeModalSubService}</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalSubService(null)}
                className="text-slate-400 hover:text-slate-600 font-semibold text-sm cursor-pointer"
              >
                Tutup
              </button>
            </div>

            <div className="p-6 space-y-4">
              {["positive", "negative"].map((type) => {
                const doc = submissions.find(
                  (s) => s.subServiceId === activeModalSubService && s.caseType === type
                );

                return (
                  <div key={type} className="border border-slate-200 rounded-xl p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        type === "positive" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                      }`}>
                        {type} case
                      </span>
                      <p className="text-sm font-medium text-slate-800">
                        {doc ? doc.fileName : "Berkas belum diunggah partner"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {doc ? (
                        <>
                          <span className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold uppercase ${
                            doc.status === "validated" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                          }`}>
                            {doc.status}
                          </span>
                          
                          {doc.status !== "validated" && (
                            <button
                              type="button"
                              disabled={isProcessingId === doc.id}
                              onClick={() => handleUpdateStatus(doc.id, "validated")}
                              className="px-3 h-8 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition cursor-pointer"
                            >
                              {isProcessingId === doc.id ? "..." : "Sahkan"}
                            </button>
                          )}
                        </>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Missing Submission</span>
                      )}
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
}