import { headers } from "next/headers";  
import { NextResponse } from "next/server";  
import { getAuth } from "@/lib/auth/auth";  
import { scopeService } from "@/services/ScopeService";  
  
export async function GET() {  
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
            message: "Only partner can access scope",  
          },  
        },  
        { status: 403 }  
      );  
    }  
  
    const scope = await scopeService.getPartnerScope(currentUser.id);  
  
    if (!scope) {  
      return NextResponse.json({  
        success: true,  
        data: null,  
        message: "Partner has not selected scope yet",  
      });  
    }  
  
    const progress = await scopeService.calculatePartnerProgress(currentUser.id);  
  
    return NextResponse.json({  
      success: true,  
      data: {  
        ...scope,  
        progress: progress ?? {  
          totalActive: 0,  
          passedCount: 0,  
          progressPercentage: 0,  
        },  
      },  
    });  
  } catch (error) {  
    console.error("GET /api/scope error", error);  
  
    return NextResponse.json(  
      {  
        success: false,  
        error: {  
          code: "INTERNAL_SERVER_ERROR",  
          message: "Failed to load scope",  
        },  
      },  
      { status: 500 }  
    );  
  }  
}