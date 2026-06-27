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

    // Validasi apakah user sudah login dan memiliki role partner
    if (!session || session.user.role !== "partner") {
      return NextResponse.json(
        { 
          success: false, 
          error: "Unauthorized: Hanya akun partner yang dapat mengakses data scope." 
        }, 
        { status: 401 }
      );
    }

    // Mengambil data scope aktif (subServices) berdasarkan ID partner yang sedang login
    const scopeData = await scopeService.getPartnerScope(session.user.id);

    return NextResponse.json({
      success: true,
      data: scopeData, // Mengembalikan objek berisi subServices aktif dari DB
    });
  } catch (error: any) {
    console.error("GET /api/partner/scope error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Gagal mengambil data konfigurasi scope partner." 
      }, 
      { status: 500 }
    );
  }
}