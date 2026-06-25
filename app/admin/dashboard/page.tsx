import Link from "next/link";  
import { headers } from "next/headers";  
import { redirect } from "next/navigation";  
import { getAuth } from "@/lib/auth/auth";  
import { SignOutButton } from "@/components/sign-out-button";  
  
export default async function AdminDashboardPage() {  
  const auth = await getAuth();  
  const session = await auth.api.getSession({  
    headers: await headers(),  
  });  
  
  if (!session) {  
    redirect("/login");  
  }  
  
  const user = session.user as {  
    role?: string;  
    name?: string;  
    email?: string;  
  };  
  
  if (user.role !== "super_admin") {  
    redirect("/dashboard");  
  }  
  
  return (  
    <div className="min-h-screen bg-neutral-50">  
      <div className="mx-auto max-w-6xl px-6 py-8">  
        <div className="mb-8 flex items-center justify-between">  
          <div>  
            <h1 className="text-2xl font-semibold text-neutral-900">  
              Admin Dashboard  
            </h1>  
            <p className="mt-1 text-sm text-neutral-500">  
              Kelola approval partner dari dashboard administrator.  
            </p>  
          </div>  
          <SignOutButton />  
        </div>  
  
        <div className="grid gap-6 md:grid-cols-2">  
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">  
            <h2 className="text-sm font-medium text-neutral-500">  
              Administrator  
            </h2>  
            <div className="mt-4 space-y-3 text-sm">  
              <div className="flex justify-between border-b border-neutral-100 pb-3">  
                <span className="text-neutral-500">Nama</span>  
                <span className="font-medium text-neutral-900">  
                  {user.name ?? "-"}  
                </span>  
              </div>  
              <div className="flex justify-between border-b border-neutral-100 pb-3">  
                <span className="text-neutral-500">Email</span>  
                <span className="font-medium text-neutral-900">  
                  {user.email ?? "-"}  
                </span>  
              </div>  
              <div className="flex justify-between">  
                <span className="text-neutral-500">Role</span>  
                <span className="font-medium text-neutral-900">  
                  {user.role ?? "-"}  
                </span>  
              </div>  
            </div>  
          </div>  
  
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">  
            <h2 className="text-sm font-medium text-neutral-500">  
              Approval Queue  
            </h2>  
            <p className="mt-4 text-sm text-neutral-600">  
              Buka daftar request register partner yang masih menunggu approval.  
            </p>  
            <div className="mt-6">  
              <Link  
                href="/admin/partners"  
                className="inline-flex rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"  
              >  
                Lihat Request Partner  
              </Link>  
            </div>  
          </div>  
        </div>  
      </div>  
    </div>  
  );  
}