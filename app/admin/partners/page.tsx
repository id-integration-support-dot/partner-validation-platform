import { headers } from "next/headers";  
import { redirect } from "next/navigation";  
import { getAuth } from "@/lib/auth/auth";  
import { UserApprovalService } from "@/services/UserApprovalService";  
import { SignOutButton } from "@/components/sign-out-button";  
  
export default async function AdminPartnersPage() {  
  const auth = await getAuth();  
  const session = await auth.api.getSession({  
    headers: await headers(),  
  });  
  
  if (!session) {  
    redirect("/login");  
  }  
  
  const user = session.user as {  
    role?: string;  
  };  
  
  if (user.role !== "super_admin") {  
    redirect("/dashboard");  
  }  
  
  const approvalService = new UserApprovalService();  
  const pendingPartners = await approvalService.getPendingPartners();  
  
  return (  
    <div className="min-h-screen bg-neutral-50 px-4 py-10">  
      <div className="mx-auto max-w-5xl">  
        <div className="flex items-center justify-between">  
          <h1 className="text-xl font-medium text-neutral-900">  
            Request Register Partner  
          </h1>  
          <SignOutButton />  
        </div>  
  
        <div className="mt-6 overflow-x-auto rounded-lg border border-neutral-200 bg-white">  
          <table className="w-full border-collapse text-sm">  
            <thead>  
              <tr className="border-b border-neutral-200 bg-neutral-50">  
                <th className="p-3 text-left">Nama</th>  
                <th className="p-3 text-left">Email</th>  
                <th className="p-3 text-left">Perusahaan</th>  
                <th className="p-3 text-left">Status</th>  
                <th className="p-3 text-left">Action</th>  
              </tr>  
            </thead>  
            <tbody>  
              {pendingPartners.length === 0 ? (  
                <tr>  
                  <td colSpan={5} className="p-4 text-center text-neutral-500">  
                    Tidak ada request register yang pending.  
                  </td>  
                </tr>  
              ) : (  
                pendingPartners.map((partner) => (  
                  <tr key={partner.id} className="border-b border-neutral-100">  
                    <td className="p-3">{partner.name}</td>  
                    <td className="p-3">{partner.email}</td>  
                    <td className="p-3">{partner.companyName ?? "-"}</td>  
                    <td className="p-3">{partner.status}</td>  
                    <td className="p-3">  
                      <div className="flex gap-2">  
                        <form action={`/api/admin/partners/${partner.id}/approve`} 
                        method="post">
                        className="inline-block"   
                          <button  
                            type="submit"  
                            className="inline-flex min-w-[90px] items-center justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white border border-green-700"
                          >  
                            Approve  
                          </button>  
                        </form>  
  
                        <form action={`/api/admin/partners/${partner.id}/reject`} 
                        method="post">  
                          <input type="hidden" name="reason" value="Rejected by admin" />  
                          <button  
                            type="submit"  
                            className="inline-flex min-w-[90px] items-center justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white border border-red-700"
                          >  
                            Reject  
                          </button>  
                        </form>  
                      </div>  
                    </td>  
                  </tr>  
                ))  
              )}  
            </tbody>  
          </table>  
        </div>  
      </div>  
    </div>  
  );  
}