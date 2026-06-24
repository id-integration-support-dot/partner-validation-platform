import { NextResponse } from "next/server";  
import { PartnerService } from "@/services/PartnerService";  
  
export async function GET() {  
  try {  
    const partnerService = new PartnerService();  
    const data = await partnerService.getPendingPartners();  
  
    return NextResponse.json({ data });  
  } catch (error) {  
    console.error("GET /api/admin/partners error", error);  
    return NextResponse.json(  
      { error: "Failed to load partners" },  
      { status: 500 }  
    );  
  }  
}