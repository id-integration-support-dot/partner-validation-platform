import Link from "next/link";  
import { headers } from "next/headers";  
import { redirect } from "next/navigation";  
import { getAuth } from "@/lib/auth/auth";  
import { SignOutButton } from "@/components/sign-out-button";  
  
type AdminLayoutProps = {  
  children: React.ReactNode;  
};  
  
export default async function AdminLayout({ children }: AdminLayoutProps) {  
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
    email?: string;  
  };  
  
  if (currentUser.role !== "super_admin") {  
    redirect("/dashboard");  
  }  
  
  return (  
    <div className="min-h-screen bg-slate-50">  
      <div className="flex min-h-screen">  
        <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-slate-900 text-white lg:flex lg:flex-col">  
          <div className="border-b border-slate-800 px-6 py-5">  
            <Link href="/admin/dashboard" className="block">  
              <p className="text-lg font-semibold tracking-tight">PartnerHub</p>  
              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">  
                admin portal  
              </p>  
            </Link>  
          </div>  
  
          <nav className="flex-1 px-4 py-6">  
            <div className="space-y-2">  
              <Link  
                href="/admin/dashboard"  
                className="block rounded-lg px-4 py-3 text-sm font-medium text-slate-200 hover:bg-slate-800 hover:text-white"  
              >  
                Dashboard  
              </Link>  
  
              <Link  
                href="/admin/partners"  
                className="block rounded-lg px-4 py-3 text-sm font-medium text-slate-200 hover:bg-slate-800 hover:text-white"  
              >  
                Partners  
              </Link>  
  
              <Link  
                href="/admin/analytics"  
                className="block rounded-lg px-4 py-3 text-sm font-medium text-slate-200 hover:bg-slate-800 hover:text-white"  
              >  
                Analytics & Assessment  
              </Link>  
            </div>  
          </nav>  
  
          <div className="border-t border-slate-800 px-4 py-4">  
            <SignOutButton />  
          </div>  
        </aside>  
  
        <div className="flex min-w-0 flex-1 flex-col">  
          <header className="border-b border-slate-200 bg-white">  
            <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4">  
              <div>  
                <p className="text-lg font-semibold tracking-tight text-slate-900">  
                  admin portal  
                </p>  
                <p className="text-sm text-slate-500">  
                  Partner Integration Platform  
                </p>  
              </div>  
  
              <div className="flex items-center gap-4">  
                <div className="hidden text-right sm:block">  
                  <p className="text-sm font-medium text-slate-900">  
                    {currentUser.name ?? "Administrator"}  
                  </p>  
                  <p className="text-xs text-slate-500">  
                    {currentUser.email ?? "-"}  
                  </p>  
                </div>  
  
                <div className="lg:hidden">  
                  <SignOutButton />  
                </div>  
              </div>  
            </div>  
          </header>  
  
          <main className="flex-1">{children}</main>  
        </div>  
      </div>  
    </div>  
  );  
}