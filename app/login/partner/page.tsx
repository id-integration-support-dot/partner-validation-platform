"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Building2, Mail, Lock, Loader2 } from "lucide-react";
import { signIn } from "@/lib/auth/auth-client";

export default function PartnerLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error: signInError } = await signIn.email({ email, password });

      setLoading(false);

      if (signInError) {
        setError(signInError.message ?? "Email atau password salah.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError("Terjadi kesalahan sistem. Silakan coba lagi.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f1f5f9] px-4">
      <div className="flex w-full max-w-[500px] flex-col items-center">
        <div className="mb-6 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm">
            <Building2 className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Partner Login</h1>
          <p className="mt-1 text-sm text-slate-400">Masuk ke Partner Portal</p>
        </div>

        <div className="w-full rounded-3xl border border-slate-100 bg-white p-10 shadow-sm">
          {error && (
            <div className="mb-5 rounded-xl border border-red-100 bg-red-50 p-3.5 text-sm font-medium text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-600">Email</label>
              <div className="relative mt-2">
                <Mail className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  autoFocus
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 w-full rounded-xl border border-slate-200 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-slate-600">Password</label>
                <Link href="/forgot-password" className="text-xs font-semibold text-brand hover:underline">
                  Lupa password?
                </Link>
              </div>

              <div className="relative mt-2">
                <Lock className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 w-full rounded-xl border border-slate-200 pl-11 pr-12 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-3 flex h-12 w-full items-center justify-center rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={18} className="animate-spin" />
                  Memproses...
                </span>
              ) : (
                "Masuk sebagai Partner"
              )}
            </button>
          </form>
        </div>

        <div className="mt-6 flex flex-col gap-2 text-center text-sm text-slate-400">
          <Link href="/login" className="font-semibold text-slate-500 hover:text-slate-700 hover:underline">
            ← Kembali pilih tipe akun
          </Link>
          <p className="mt-2">
            Belum punya akun?{" "}
            <Link href="/register" className="font-semibold text-brand hover:underline">
              Daftar sebagai partner
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}