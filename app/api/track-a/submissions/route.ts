import { headers } from "next/headers";  
import { NextResponse } from "next/server";  
import { getAuth } from "@/lib/auth/auth";  
import { developerSiteTestingService } from "@/services/DeveloperSiteTestingService";
  
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
          error: "Unauthorized",  
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
          error: "Forbidden",  
        },  
        { status: 403 }  
      );  
    }  
  
    const documents = await developerSiteTestingService.listPartnerDocuments(  
      currentUser.id  
    );  
  
    return NextResponse.json({  
      success: true,  
      data: documents,  
    });  
  } catch (error) {  
    console.error("GET /api/track-a/submissions error", error);  
  
    return NextResponse.json(  
      {  
        success: false,  
        error:  
          error instanceof Error  
            ? error.message  
            : "Failed to load submissions",  
      },  
      { status: 500 }  
    );  
  }  
}