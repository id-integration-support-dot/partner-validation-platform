import { NextResponse } from "next/server";  
import { serviceRepository } from "@/repositories/ServiceRepository";  
  
export async function GET() {  
  try {  
    const data = await serviceRepository.getAllServices();  
  
    return NextResponse.json({  
      success: true,  
      data,  
    });  
  } catch (error) {  
    console.error("GET /api/services error", error);  
  
    return NextResponse.json(  
      {  
        success: false,  
        error: {  
          code: "INTERNAL_SERVER_ERROR",  
          message: "Failed to load services",  
        },  
      },  
      { status: 500 }  
    );  
  }  
}