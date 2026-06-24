import { headers } from "next/headers";  
import { redirect } from "next/navigation";  
import { getAuth } from "@/lib/auth/auth";  
import { SignOutButton } from "@/components/sign-out-button";  
  
export default async function PartnerDashboardPage() {  
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
    name?: string;  
    email?: string;  
  };  
  
  if (user.role !== "partner") {  
    redirect("/dashboard");  
  }  
  
  if (user.status !== "approved") {  
    redirect("/dashboard");  
  }  
  
  return (  
    <div className="min-h-screen bg-neutral-50 px-4 py-10">  
      <div className="mx-auto max-w-2xl">  
        <div className="flex items-center justify-between">  
          <h1 className="text-xl font-medium text-neutral-900">  
            Partner Dashboard  
          </h1>  
          <SignOutButton />  
        </div>  
  
        <div className="mt-6 rounded-lg border border-neutral-200 bg-white p-6">  
          <dl className="space-y-3 text-sm">  
            <div className="flex justify-between border-b border-neutral-100 pb-3">  
              <dt className="text-neutral-500">Nama</dt>  
              <dd className="font-medium text-neutral-900">{user.name}</dd>  
            </div>  
            <div className="flex justify-between border-b border-neutral-100 pb-3">  
              <dt className="text-neutral-500">Email</dt>  
              <dd className="font-medium text-neutral-900">{user.email}</dd>  
            </div>  
            <div className="flex justify-between border-b border-neutral-100 pb-3">  
              <dt className="text-neutral-500">Role</dt>  
              <dd className="font-medium text-neutral-900">{user.role}</dd>  
            </div>  
            <div className="flex justify-between">  
              <dt className="text-neutral-500">Status</dt>  
              <dd className="font-medium text-neutral-900">{user.status}</dd>  
            </div>  
          </dl>  
        </div>  
      </div>  
    </div>  
  );  
}