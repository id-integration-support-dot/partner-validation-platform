"use client";  
  
import { useRouter } from "next/navigation";  
import { authClient } from "@/lib/auth/auth-client";  
  
export function SignOutButton() {  
  const router = useRouter();  
  
  const handleSignOut = async () => {  
    await authClient.signOut();  
    router.push("/login");  
    router.refresh();  
  };  
  
  return (  
    <button  
      type="button"  
      onClick={handleSignOut}  
      className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"  
    >  
      Keluar  
    </button>  
  );  
}