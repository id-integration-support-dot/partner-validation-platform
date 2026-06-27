import { headers } from "next/headers";  
import { NextRequest, NextResponse } from "next/server";  
import { getAuth } from "@/lib/auth/auth";  
import { developerSiteTestingService } from "@/services/DeveloperSiteTestingService";
  
type SubmitDeveloperSiteTestingRequest = {  
  serviceId?: string;  
  subServiceId?: string;  
  caseType?: "positive" | "negative";  
  fileName?: string;  
  mimeType?: string;  
  fileSize?: number;  
  base64Content?: string;  
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
  
    // Ditambahkan type casting explicit ke SubmitDeveloperSiteTestingRequest untuk mematikan error 'unknown'
    const body = (await request.json()) as SubmitDeveloperSiteTestingRequest;  
  
    const result = await developerSiteTestingService.submitDocument({  
      partnerUserId: currentUser.id,  
      serviceId: String(body.serviceId || ""),  
      subServiceId: String(body.subServiceId || ""),  
      caseType: (body.caseType || "positive") as "positive" | "negative",  
      fileName: String(body.fileName || ""),  
      mimeType: String(body.mimeType || ""),  
      fileSize: Number(body.fileSize || 0),  
      base64Content: String(body.base64Content || ""),  
    });  
  
    return NextResponse.json({  
      success: true,  
      data: result,  
      message: "Developer Site Testing document uploaded successfully",  
    });  
  } catch (error) {  
    console.error("POST /api/track-a/submit error", error);  
  
    return NextResponse.json(  
      {  
        success: false,  
        error:  
          error instanceof Error  
            ? error.message  
            : "Failed to submit document",  
      },  
      { status: 500 }  
    );  
  }  
}