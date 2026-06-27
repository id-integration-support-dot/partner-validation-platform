import Link from "next/link";  
import { headers } from "next/headers";  
import { redirect } from "next/navigation";  
import { getAuth } from "@/lib/auth/auth";  
import { SignOutButton } from "@/components/sign-out-button";  
  
type PartnerLayoutProps = {  
  children: React.ReactNode;  
};  
  
export default async function PartnerLayout({  
  children,  
}: PartnerLayoutProps) {  
  const auth = await getAuth();  
  const session = await auth.api.getSession({  
    headers: await headers(),  
  });  
  
  if (!session) {  
    redirect("/login");  
  }  
  
  const currentUser = session.user as {  
    role?: string;  
    status?: string;  
    name?: string;  
    email?: string;  
  };  
  
  if (currentUser.role !== "partner") {  
    redirect("/dashboard");  
  }  
  
  if (currentUser.status === "pending") {  
    redirect("/partner/pending");  
  }  
  
  if (currentUser.status === "rejected") {  
    redirect("/partner/rejected");  
  }  
  
  return (  
    <div className="min-h-screen bg-neutral-50">  
      <header className="border-b border-neutral-200 bg-white">  
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">  
          <div>  
            <Link href="/partner/home" className="text-lg font-medium text-neutral-900">  
              Partner Integration Platform  
            </Link>  
            <p className="text-sm text-neutral-500">  
              Workspace Partner  
            </p>  
          </div>  
  
          <div className="flex items-center gap-6">  
            <nav className="flex items-center gap-4 text-sm">  
              <Link  
                href="/partner/home"  
                className="font-medium text-neutral-700 hover:text-neutral-900"  
              >  
                Home  
              </Link>  

              {/* MENU BARU: Dashboard berhasil disisipkan dengan aman di sisi Server */}
              <Link  
                href="/partner/dashboard"  
                className="font-medium text-neutral-700 hover:text-neutral-900"  
              >  
                Dashboard  
              </Link>  
  
              <Link  
                href="/partner/services"  
                className="font-medium text-neutral-700 hover:text-neutral-900"  
              >  
                Services  
              </Link>  
  
              <Link  
                href="/partner/info"  
                className="font-medium text-neutral-700 hover:text-neutral-900"  
              >  
                Info  
              </Link>  
            </nav>  
  
            <SignOutButton />  
          </div>  
        </div>  
      </header>  
  
      <main>{children}</main>  
    </div>  
  );  
}