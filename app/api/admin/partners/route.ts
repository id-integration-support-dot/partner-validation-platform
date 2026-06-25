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
  
  const currentUser = session.user as {  
    role?: string;  
    name?: string;  
  };  
  
  if (currentUser.role !== "super_admin") {  
    redirect("/dashboard");  
  }  
  
  const approvalService = new UserApprovalService();  
  const pendingPartners = await approvalService.getPendingPartners();  
  
  return (  
    <div className="min-h-screen bg-neutral-50 px-4 py-8">  
      <div className="mx-auto max-w-6xl">  
        <div className="mb-6 flex items-center justify-between">  
          <div>  
            <h1 className="text-2xl font-semibold text-neutral-900">  
              Request Register Partner  
            </h1>  
            <p className="mt-1 text-sm text-neutral-500">  
              Review partner yang masih menunggu approval.  
            </p>  
          </div>  
          <SignOutButton />  
        </div>  
  
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">  
          <div className="border-b border-neutral-200 px-6 py-4">  
            <h2 className="text-sm font-medium text-neutral-900">  
              Pending Requests  
            </h2>  
          </div>  
  
          {pendingPartners.length === 0 ? (  
            <div className="px-6 py-10 text-center text-sm text-neutral-500">  
              Tidak ada request register yang pending.  
            </div>  
          ) : (  
            <div className="overflow-x-auto">  
              <table className="min-w-full text-sm">  
                <thead className="bg-neutral-50">  
                  <tr className="border-b border-neutral-200">  
                    <th className="px-6 py-4 text-left font-semibold text-neutral-700">  
                      Nama  
                    </th>  
                    <th className="px-6 py-4 text-left font-semibold text-neutral-700">  
                      Email  
                    </th>  
                    <th className="px-6 py-4 text-left font-semibold text-neutral-700">  
                      Perusahaan  
                    </th>  
                    <th className="px-6 py-4 text-left font-semibold text-neutral-700">  
                      Status  
                    </th>  
                    <th className="px-6 py-4 text-left font-semibold text-neutral-700">  
                      Action  
                    </th>  
                  </tr>  
                </thead>  
                <tbody>  
                  {pendingPartners.map((partner) => (  
                    <tr  
                      key={partner.id}  
                      className="border-b border-neutral-100 last:border-b-0"  
                    >  
                      <td className="px-6 py-4 text-neutral-900">  
                        {partner.name}  
                      </td>  
                      <td className="px-6 py-4 text-neutral-700">  
                        {partner.email}  
                      </td>  
                      <td className="px-6 py-4 text-neutral-700">  
                        {partner.companyName ?? "-"}  
                      </td>  
                      <td className="px-6 py-4">  
                        <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">  
                          {partner.status}  
                        </span>  
                      </td>  
                      <td className="px-6 py-4">  
                        <div className="flex flex-wrap gap-2">  
                          <form  
                            action={`/api/admin/partners/${partner.id}/approve`}  
                            method="post"  
                          >  
                            <button  
                              type="submit"  
                              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"  
                            >  
                              Approve  
                            </button>  
                          </form>  
  
                          <form  
                            action={`/api/admin/partners/${partner.id}/reject`}  
                            method="post"  
                          >  
                            <input  
                              type="hidden"  
                              name="reason"  
                              value="Rejected by admin"  
                            />  
                            <button  
                              type="submit"  
                              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"  
                            >  
                              Reject  
                            </button>  
                          </form>  
                        </div>  
                      </td>  
                    </tr>  
                  ))}  
                </tbody>  
              </table>  
            </div>  
          )}  
        </div>  
      </div>  
    </div>  
  );  
}