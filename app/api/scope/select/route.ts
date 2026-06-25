import { headers } from "next/headers";  
import { NextRequest, NextResponse } from "next/server";  
import { getAuth } from "@/lib/auth/auth";  
import { scopeService } from "@/services/ScopeService";  
  
type SelectScopeRequest = {  
  sub_service_ids: string[];  
};  
  
export async function POST(request: NextRequest) {  
  try {  
    const auth = await getAuth();  
    const session = await auth.api.getSession({  
      headers: await headers(),  
    });  
  
    if (!session) {  
      return NextResponse.json(  
        {  
          success: false,  
          error: {  
            code: "AUTH_REQUIRED",  
            message: "Not authenticated",  
          },  
        },  
        { status: 401 }  
      );  
    }  
  
    const currentUser = session.user as {  
      id: string;  
      role?: string;  
    };  
  
    if (currentUser.role !== "partner") {  
      return NextResponse.json(  
        {  
          success: false,  
          error: {  
            code: "FORBIDDEN",  
            message: "Only partner can select scope",  
          },  
        },  
        { status: 403 }  
      );  
    }  
  
    const body = (await request.json()) as SelectScopeRequest;  
  
    if (!body.sub_service_ids || body.sub_service_ids.length === 0) {  
      return NextResponse.json(  
        {  
          success: false,  
          error: {  
            code: "VALIDATION_ERROR",  
            message: "sub_service_ids is required and must not be empty",  
          },  
        },  
        { status: 400 }  
      );  
    }  
  
    const scope = await scopeService.setPartnerScope(  
      currentUser.id,  
      body.sub_service_ids  
    );  
  
    return NextResponse.json({  
      success: true,  
      data: scope,  
    });  
  } catch (error) {  
    console.error("POST /api/scope/select error", error);  
  
    return NextResponse.json(  
      {  
        success: false,  
        error: {  
          code: "INTERNAL_SERVER_ERROR",  
          message:  
            error instanceof Error ? error.message : "Failed to save scope",  
        },  
      },  
      { status: 500 }  
    );  
  }  
}