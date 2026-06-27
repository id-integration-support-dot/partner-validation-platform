import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth/auth";
import { developerSiteTestingService } from "@/services/DeveloperSiteTestingService";

/**
 * GET /api/admin/track-a/review?partnerId=...
 * Digunakan oleh Admin untuk melihat daftar berkas milik partner spesifik
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await getAuth();
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || session.user.role !== "super_admin") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Admin Only" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const partnerId = searchParams.get("partnerId");

    if (!partnerId) {
      return NextResponse.json(
        { success: false, error: "Missing partnerId parameter" },
        { status: 400 }
      );
    }

    // Mengambil data dokumen menggunakan service yang baru saja kita perbarui
    const documents = await developerSiteTestingService.listDocumentsByPartnerId(partnerId);

    return NextResponse.json({
      success: true,
      data: documents,
    });
  } catch (error) {
    console.error("GET /api/admin/track-a/review error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to load submissions",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/track-a/review
 * Digunakan oleh Admin untuk menyetujui (Sahkan) atau menolak dokumen partner
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuth();
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || session.user.role !== "super_admin") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Admin Only" },
        { status: 403 }
      );
    }

    const body = await request.json() as { documentId?: string; status?: "validated" | "rejected" };
    const { documentId, status } = body;

    if (!documentId || !status) {
      return NextResponse.json(
        { success: false, error: "Missing documentId or status parameter" },
        { status: 400 }
      );
    }

    // Mengeksekusi pembaruan status ke database lewat service layer
    await developerSiteTestingService.reviewDocument(documentId, status);

    return NextResponse.json({
      success: true,
      message: `Document status successfully updated to ${status}`,
    });
  } catch (error) {
    console.error("POST /api/admin/track-a/review error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update review status",
      },
      { status: 500 }
    );
  }
}