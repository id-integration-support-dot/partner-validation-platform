import { headers } from "next/headers";  
import { NextRequest, NextResponse } from "next/server";  
import { getAuth } from "@/lib/auth/auth";  
import { UserApprovalService } from "@/services/UserApprovalService";  
  
type RouteContext = {  
  params: Promise<{  
    id: string;  
  }>;  
};  
  
export async function POST(request: NextRequest, context: RouteContext) {  
  try {  
    const auth = await getAuth();  
    const session = await auth.api.getSession({  
      headers: await headers(),  
    });  
  
    if (!session) {  
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });  
    }  
  
    const currentUser = session.user as {  
      id: string;  
      role?: string;  
    };  
  
    if (currentUser.role !== "super_admin") {  
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });  
    }  
  
    const { id } = await context.params;  
  
    const formData = await request.formData();  
    const reason = String(formData.get("reason") || "Rejected by admin");  
  
    const approvalService = new UserApprovalService();  
    await approvalService.rejectPartner(id, currentUser.id, reason);  
  
    return NextResponse.redirect(new URL("/admin/partners", request.url));  
  } catch (error) {  
    console.error("POST reject partner error", error);  
  
    return NextResponse.json(  
      {  
        error: error instanceof Error ? error.message : "Failed to reject partner",  
      },  
      { status: 400 }  
    );  
  }  
}