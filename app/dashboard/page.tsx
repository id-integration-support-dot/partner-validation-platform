import { headers } from "next/headers";  
import { redirect } from "next/navigation";  
import { getAuth } from "@/lib/auth/auth";  
  
export default async function DashboardPage() {  
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
  };  
  
  if (user.role === "super_admin") {  
    redirect("/admin/dashboard");  
  }  
  
  if (user.role === "partner") {  
    if (user.status === "approved") {  
      redirect("/partner/dashboard");  
    }  
  
    if (user.status === "pending") {  
      redirect("/partner/pending");  
    }  
  
    if (user.status === "rejected") {  
      redirect("/partner/rejected");  
    }  
  }  
  
  redirect("/login");  
}