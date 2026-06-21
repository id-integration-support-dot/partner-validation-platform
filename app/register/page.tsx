"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth-client";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signUpError } = await signUp.email({
      name,
      email,
      password,
      // field tambahan ini ditolak Better Auth kalau "input: false" di server config —
      // companyName memang sengaja kita biarkan bisa diisi user, lihat lib/auth.ts
      companyName,
    } as Parameters<typeof signUp.email>[0]);

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message ?? "Gagal mendaftar. Coba lagi.");
      return;
    }

    setDone(true);
  }

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
        <div className="w-full max-w-sm rounded-lg border border-neutral-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-lg font-medium text-neutral-900">
            Pendaftaran terkirim
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Akun Anda sedang menunggu approval dari tim kami. Anda akan bisa
            login setelah akun disetujui.
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
        <h1 className="text-xl font-medium text-neutral-900">
          Daftar sebagai partner
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Partner Integration Platform
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Nama lengkap
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Nama perusahaan
            </label>
            <input
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
            />
          </div>

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

          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Password
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
          >
            {loading ? "Memproses..." : "Daftar"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-neutral-500">
          Sudah punya akun?{" "}
          <a href="/login" className="font-medium text-neutral-900 underline">
            Masuk
          </a>
        </p>
      </div>
    </div>
  );
}
