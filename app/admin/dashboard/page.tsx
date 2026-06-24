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
    <div className="min-h-screen bg-neutral-50 px-4 py-10">  
      <div className="mx-auto max-w-3xl">  
        <div className="flex items-center justify-between">  
          <h1 className="text-xl font-medium text-neutral-900">  
            Admin Dashboard  
          </h1>  
          <SignOutButton />  
        </div>  
  
        <div className="mt-6 rounded-lg border border-neutral-200 bg-white p-6">  
          <p className="text-sm text-neutral-600">  
            Selamat datang di dashboard administrator.  
          </p>  
  
          <div className="mt-4">  
            <Link  
              href="/admin/partners"  
              className="inline-flex rounded-md bg-black px-4 py-2 text-sm text-white"  
            >  
              Lihat Request Register Partner  
            </Link>  
          </div>  
        </div>  
      </div>  
    </div>  
  );  
}