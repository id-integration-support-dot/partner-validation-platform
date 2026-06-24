import { headers } from "next/headers";  
import { redirect } from "next/navigation";  
import { getAuth } from "@/lib/auth/auth";  
import { SignOutButton } from "@/components/sign-out-button";  
  
export default async function PartnerRejectedPage() {  
  const auth = await getAuth();  
  const session = await auth.api.getSession({  
    headers: await headers(),  
  });  
  
  if (!session) {  
    redirect("/login");  
  }  
  
  const user = session.user as {  
    role?: string;  
    status?: string;  
    rejectionReason?: string;  
  };  
  
  if (user.role !== "partner") {  
    redirect("/dashboard");  
  }  
  
  if (user.status === "approved") {  
    redirect("/partner/dashboard");  
  }  
  
  if (user.status === "pending") {  
    redirect("/partner/pending");  
  }  
  
  return (  
    <div className="min-h-screen bg-neutral-50 px-4 py-10">  
      <div className="mx-auto max-w-2xl">  
        <div className="flex items-center justify-between">  
          <h1 className="text-xl font-medium text-neutral-900">  
            Akun Ditolak  
          </h1>  
          <SignOutButton />  
        </div>  
  
        <div className="mt-6 rounded-lg border border-neutral-200 bg-white p-6">  
          <p className="text-sm text-neutral-600">  
            Akun Anda belum dapat digunakan. Silakan hubungi admin untuk informasi lebih lanjut.  
          </p>  
  
          {user.rejectionReason ? (  
            <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">  
              Alasan: {user.rejectionReason}  
            </div>  
          ) : null}  
        </div>  
      </div>  
    </div>  
  );  
}