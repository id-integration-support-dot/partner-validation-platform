"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth/auth-client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: reqError } = await authClient.requestPasswordReset({
      email,
      redirectTo: "/reset-password",
    });

    setLoading(false);

    if (reqError) {
      setError(reqError.message ?? "Gagal mengirim email. Coba lagi.");
      return;
    }

    setDone(true);
  }

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
        <div className="w-full max-w-sm rounded-lg border border-neutral-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-lg font-medium text-neutral-900">Email terkirim</h1>
          <p className="mt-2 text-sm text-neutral-500">
            Kalau email {email} terdaftar di sistem kami, Anda akan menerima
            link untuk reset password dalam beberapa menit.
          </p>
          <p className="mt-2 text-xs text-neutral-400">
            Cek folder spam kalau tidak muncul di inbox.
          </p>
          <a
            href="/login"
            className="mt-4 inline-block text-sm font-medium text-neutral-900 underline"
          >
            Kembali ke halaman login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm rounded-lg border border-neutral-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-medium text-neutral-900">Lupa password</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Masukkan email Anda dan kami akan kirimkan link untuk reset password.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
          >
            {loading ? "Mengirim..." : "Kirim link reset password"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-neutral-500">
          Ingat password?{" "}
          <a href="/login" className="font-medium text-neutral-900 underline">
            Kembali login
          </a>
        </p>
      </div>
    </div>
  );
}