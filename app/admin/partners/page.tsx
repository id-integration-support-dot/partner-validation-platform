import Link from "next/link";  
import { headers } from "next/headers";  
import { redirect } from "next/navigation";  
import { getAuth } from "@/lib/auth/auth";  
import { UserApprovalService } from "@/services/UserApprovalService";  
  
function getStatusBadgeClass(status: string | undefined) {  
  switch (status) {  
    case "approved":  
      return "bg-green-100 text-green-700";  
    case "pending":  
      return "bg-amber-100 text-amber-700";  
    case "rejected":  
      return "bg-red-100 text-red-700";  
    default:  
      return "bg-slate-100 text-slate-700";  
  }  
}  
  
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
  };  
  
  if (currentUser.role !== "super_admin") {  
    redirect("/dashboard");  
  }  
  
  const approvalService = new UserApprovalService();  
  const partners = await approvalService.getAllPartners();  
  
  return (  
    <div className="px-4 py-8">  
      <div className="mx-auto w-full max-w-7xl space-y-6">  
        <div>  
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">  
            Partners  
          </h1>  
          <p className="mt-2 text-sm text-slate-500">  
            Lihat ringkasan partner, status registrasi, dan akses detail assessment.  
          </p>  
        </div>  
  
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">  
          <div className="border-b border-slate-200 px-6 py-4">  
            <h2 className="text-sm font-medium text-slate-900">  
              Partner Directory  
            </h2>  
          </div>  
  
          {partners.length === 0 ? (  
            <div className="px-6 py-10 text-center text-sm text-slate-500">  
              Belum ada partner terdaftar.  
            </div>  
          ) : (  
            <div className="overflow-x-auto">  
              <table className="w-full min-w-[1100px] text-sm">  
                <thead>  
                  <tr className="border-b border-slate-200 bg-slate-50">  
                    <th className="px-6 py-4 text-left font-medium text-slate-700">  
                      Nama  
                    </th>  
                    <th className="px-6 py-4 text-left font-medium text-slate-700">  
                      Email  
                    </th>  
                    <th className="px-6 py-4 text-left font-medium text-slate-700">  
                      Perusahaan  
                    </th>  
                    <th className="px-6 py-4 text-left font-medium text-slate-700">  
                      Status  
                    </th>  
                    <th className="px-6 py-4 text-left font-medium text-slate-700">  
                      Actions  
                    </th>  
                  </tr>  
                </thead>  
                <tbody>  
                  {partners.map((partner) => (  
                    <tr  
                      key={partner.id}  
                      className="border-b border-slate-100 last:border-b-0"  
                    >  
                      <td className="px-6 py-4 text-slate-900">  
                        {partner.name}  
                      </td>  
                      <td className="px-6 py-4 text-slate-600">  
                        {partner.email}  
                      </td>  
                      <td className="px-6 py-4 text-slate-600">  
                        {partner.companyName ?? "-"}  
                      </td>  
                      <td className="px-6 py-4">  
                        <span  
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusBadgeClass(  
                            partner.status  
                          )}`}  
                        >  
                          {partner.status}  
                        </span>  
                      </td>  
                      <td className="px-6 py-4">  
                        <div className="flex flex-wrap gap-2">  
                          <Link  
                            href={`/admin/partners/${partner.id}`}  
                            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"  
                          >  
                            Detail  
                          </Link>  
  
                          <Link  
                            href={`/admin/partners/${partner.id}/assessment`}  
                            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"  
                          >  
                            Assessment  
                          </Link>  
  
                          {partner.status === "pending" ? (  
                            <>  
                              <form  
                                action={`/api/admin/partners/${partner.id}/approve`}  
                                method="post"  
                              >  
                                <button  
                                  type="submit"  
                                  className="rounded-md bg-[#0d5ddf] px-3 py-2 text-sm font-medium text-white hover:bg-[#0b4fc2]"  
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
                                  value="Rejected by administrator"  
                                />  
                                <button  
                                  type="submit"  
                                  className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"  
                                >  
                                  Reject  
                                </button>  
                              </form>  
                            </>  
                          ) : null}  
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