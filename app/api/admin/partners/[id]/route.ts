import { headers } from "next/headers";  
import { NextRequest, NextResponse } from "next/server";  
import { getAuth } from "@/lib/auth/auth";  
import { UserApprovalService } from "@/services/UserApprovalService";  
  
type RouteContext = {  
  params: Promise<{  
    id: string;  
  }>;  
};  
  
type UpdatePartnerRequestBody = {  
  name?: string;  
  email?: string;  
  companyName?: string;  
};  
  
export async function PATCH(request: NextRequest, context: RouteContext) {  
  try {  
    const auth = await getAuth();  
    const session = await auth.api.getSession({  
      headers: await headers(),  
    });  
  
    if (!session) {  
      return NextResponse.json(  
        { success: false, error: "Unauthorized" },  
        { status: 401 }  
      );  
    }  
  
    const currentUser = session.user as {  
      role?: string;  
    };  
  
    if (currentUser.role !== "super_admin") {  
      return NextResponse.json(  
        { success: false, error: "Forbidden" },  
        { status: 403 }  
      );  
    }  
  
    const { id } = await context.params;  
    const body = (await request.json()) as UpdatePartnerRequestBody;  
  
    const name = String(body.name || "").trim();  
    const email = String(body.email || "").trim();  
    const companyNameRaw = String(body.companyName || "").trim();  
  
    if (!name) {  
      return NextResponse.json(  
        { success: false, error: "Name is required" },  
        { status: 400 }  
      );  
    }  
  
    if (!email) {  
      return NextResponse.json(  
        { success: false, error: "Email is required" },  
        { status: 400 }  
      );  
    }  
  
    const approvalService = new UserApprovalService();  
  
    await approvalService.updatePartnerBasicInfo(id, {  
      name,  
      email,  
      companyName: companyNameRaw || null,  
    });  
  
    return NextResponse.json({  
      success: true,  
      message: "Partner updated successfully",  
    });  
  } catch (error) {  
    console.error("PATCH /api/admin/partners/[id] error", error);  
  
    return NextResponse.json(  
      {  
        success: false,  
        error:  
          error instanceof Error  
            ? error.message  
            : "Failed to update partner",  
      },  
      { status: 500 }  
    );  
  }  
}