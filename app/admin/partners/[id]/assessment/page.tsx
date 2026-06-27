import Link from "next/link";  
import { headers } from "next/headers";  
import { redirect } from "next/navigation";  
import { getAuth } from "@/lib/auth/auth";  
import { UserRepository } from "@/repositories/UserRepository";  
import { scopeService } from "@/services/ScopeService";  
  
type AdminPartnerAssessmentPageProps = {  
  params: Promise<{  
    id: string;  
  }>;  
};  
  
export default async function AdminPartnerAssessmentPage({  
  params,  
}: AdminPartnerAssessmentPageProps) {  
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
  
  const { id } = await params;  
  
  const userRepository = new UserRepository();  
  const partner = await userRepository.findPartnerById(id);  
  
  if (!partner || partner.role !== "partner") {  
    return (  
      <div className="px-4 py-8">  
        <div className="mx-auto w-full max-w-7xl rounded-lg border border-slate-200 bg-white p-8 shadow-sm">  
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">  
            Assessment tidak dapat dibuka  
          </h1>  
          <p className="mt-2 text-sm text-slate-500">  
            Partner tidak ditemukan atau tidak valid.  
          </p>  
        </div>  
      </div>  
    );  
  }  
  
  const scope = await scopeService.getPartnerScope(partner.id);  
  const progress = await scopeService.calculatePartnerProgress(partner.id);  
  
  return (  
    <div className="px-4 py-8">  
      <div className="mx-auto w-full max-w-7xl space-y-6">  
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">  
          <div>  
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">  
              Assessment  
            </h1>  
            <p className="mt-2 text-sm text-slate-500">  
              Ringkasan hasil pengerjaan partner dan status layanan yang dipilih.  
            </p>  
          </div>  
  
          <div className="flex flex-wrap gap-3">  
            <Link  
              href={`/admin/partners/${partner.id}`}  
              className="inline-flex rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"  
            >  
              Kembali ke Detail Partner  
            </Link>  
          </div>  
        </div>  
  
        <div className="grid gap-4 md:grid-cols-3">  
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">  
            <p className="text-sm text-slate-500">Partner</p>  
            <p className="mt-2 text-lg font-semibold text-slate-900">  
              {partner.name}  
            </p>  
            <p className="mt-1 text-sm text-slate-500">{partner.email}</p>  
          </div>  
  
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">  
            <p className="text-sm text-slate-500">Total Scope</p>  
            <p className="mt-2 text-3xl font-semibold text-slate-900">  
              {scope?.activeCount ?? 0}  
            </p>  
          </div>  
  
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">  
            <p className="text-sm text-slate-500">Progress</p>  
            <p className="mt-2 text-3xl font-semibold text-slate-900">  
              {progress?.progressPercentage ?? 0}%  
            </p>  
          </div>  
        </div>  
  
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">  
          <h2 className="text-lg font-semibold text-slate-900">  
            Hasil Pengerjaan Scope  
          </h2>  
  
          {!scope ? (  
            <div className="mt-4 rounded-md bg-slate-50 p-4 text-sm text-slate-500">  
              Partner belum memiliki scope yang dipilih.  
            </div>  
          ) : (  
            <div className="mt-5 overflow-x-auto">  
              <table className="w-full min-w-[800px] text-sm">  
                <thead>  
                  <tr className="border-b border-slate-200 bg-slate-50">  
                    <th className="px-4 py-3 text-left font-medium text-slate-700">  
                      Service  
                    </th>  
                    <th className="px-4 py-3 text-left font-medium text-slate-700">  
                      Sub-service  
                    </th>  
                    <th className="px-4 py-3 text-left font-medium text-slate-700">  
                      Code  
                    </th>  
                    <th className="px-4 py-3 text-left font-medium text-slate-700">  
                      Track A  
                    </th>  
                    <th className="px-4 py-3 text-left font-medium text-slate-700">  
                      Track B  
                    </th>  
                    <th className="px-4 py-3 text-left font-medium text-slate-700">  
                      Overall  
                    </th>  
                  </tr>  
                </thead>  
                <tbody>  
                  {scope.subServices.map((item) => (  
                    <tr  
                      key={item.id}  
                      className="border-b border-slate-100 last:border-b-0"  
                    >  
                      <td className="px-4 py-3 text-slate-600">  
                        {item.serviceName}  
                      </td>  
                      <td className="px-4 py-3 text-slate-900">  
                        {item.name}  
                      </td>  
                      <td className="px-4 py-3 text-slate-500">{item.code}</td>  
                      <td className="px-4 py-3">  
                        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">  
                          pending  
                        </span>  
                      </td>  
                      <td className="px-4 py-3">  
                        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">  
                          pending  
                        </span>  
                      </td>  
                      <td className="px-4 py-3">  
                        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">  
                          pending  
                        </span>  
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