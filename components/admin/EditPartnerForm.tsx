"use client";  
  
import { useState } from "react";  
import { useRouter } from "next/navigation";  
  
type EditPartnerFormProps = {  
  partnerId: string;  
  defaultName: string;  
  defaultEmail: string;  
  defaultCompanyName: string;  
};  
  
type UpdatePartnerApiResponse = {  
  success?: boolean;  
  message?: string;  
  error?: string;  
};  
  
export default function EditPartnerForm({  
  partnerId,  
  defaultName,  
  defaultEmail,  
  defaultCompanyName,  
}: EditPartnerFormProps) {  
  const router = useRouter();  
  
  const [name, setName] = useState(defaultName);  
  const [email, setEmail] = useState(defaultEmail);  
  const [companyName, setCompanyName] = useState(defaultCompanyName);  
  const [loading, setLoading] = useState(false);  
  const [error, setError] = useState<string | null>(null);  
  const [successMessage, setSuccessMessage] = useState<string | null>(null);  
  
  async function handleSubmit(e: React.FormEvent) {  
    e.preventDefault();  
    setLoading(true);  
    setError(null);  
    setSuccessMessage(null);  
  
    try {  
      const response = await fetch(`/api/admin/partners/${partnerId}`, {  
        method: "PATCH",  
        headers: {  
          "Content-Type": "application/json",  
        },  
        body: JSON.stringify({  
          name,  
          email,  
          companyName,  
        }),  
      });  
  
      const result = (await response.json()) as UpdatePartnerApiResponse;  
  
      if (!response.ok || !result.success) {  
        throw new Error(result.error || "Gagal memperbarui partner.");  
      }  
  
      setSuccessMessage("Data partner berhasil diperbarui.");  
      router.refresh();  
    } catch (err) {  
      setError(  
        err instanceof Error  
          ? err.message  
          : "Terjadi kesalahan saat memperbarui partner."  
      );  
    } finally {  
      setLoading(false);  
    }  
  }  
  
  return (  
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">  
      <h2 className="text-lg font-semibold text-slate-900">Edit Partner</h2>  
  
      <form onSubmit={handleSubmit} className="mt-5 space-y-4">  
        <div>  
          <label className="block text-sm font-medium text-slate-700">  
            Nama  
          </label>  
          <input  
            value={name}  
            onChange={(e) => setName(e.target.value)}  
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#0d5ddf]"  
            required  
          />  
        </div>  
  
        <div>  
          <label className="block text-sm font-medium text-slate-700">  
            Email  
          </label>  
          <input  
            type="email"  
            value={email}  
            onChange={(e) => setEmail(e.target.value)}  
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#0d5ddf]"  
            required  
          />  
        </div>  
  
        <div>  
          <label className="block text-sm font-medium text-slate-700">  
            Nama Perusahaan  
          </label>  
          <input  
            value={companyName}  
            onChange={(e) => setCompanyName(e.target.value)}  
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#0d5ddf]"  
          />  
        </div>  
  
        {error ? (  
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">  
            {error}  
          </div>  
        ) : null}  
  
        {successMessage ? (  
          <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">  
            {successMessage}  
          </div>  
        ) : null}  
  
        <button  
          type="submit"  
          disabled={loading}  
          className="rounded-md bg-[#0d5ddf] px-4 py-2 text-sm font-medium text-white hover:bg-[#0b4fc2] disabled:opacity-50"  
        >  
          {loading ? "Menyimpan..." : "Simpan Perubahan"}  
        </button>  
      </form>  
    </div>  
  );  
}