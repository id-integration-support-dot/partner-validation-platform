import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth/auth";
import { scopeService } from "@/services/ScopeService";
import { developerSiteTestingService } from "@/services/DeveloperSiteTestingService";

export async function GET() {
  try {
    const auth = await getAuth();
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || session.user.role !== "partner") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const partnerId = session.user.id;

    // 1. Ambil data scope yang dipilih partner
    const scopeData = await scopeService.getPartnerScope(partnerId);
    const activeSubServices = scopeData?.subServices || [];

    if (activeSubServices.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          hasScope: false,
          trackA: { isCompleted: false, statusLabel: "Scope Belum Dipilih" },
          trackB: { isOpen: false, isCompleted: false, statusLabel: "Terkunci" }
        }
      });
    }

    // 2. Ambil data dokumen yang sudah diupload partner
    const submissions = await developerSiteTestingService.listDocumentsByPartnerId(partnerId);

    // 3. Validasi apakah SEMUA sub-service sudah memiliki Positive & Negative Case berstatus 'validated'
    let totalRequiredCases = activeSubServices.length * 2; // Tiap sub-service butuh 2 case
    let validatedCasesCount = 0;

    activeSubServices.forEach((sub) => {
      const cases = submissions.filter((s) => s.subServiceId === sub.id);
      const posValid = cases.find((c) => c.caseType === "positive" && c.status === "validated");
      const negValid = cases.find((c) => c.caseType === "negative" && c.status === "validated");
      
      if (posValid) validatedCasesCount++;
      if (negValid) validatedCasesCount++;
    });

    const isTrackAComplete = validatedCasesCount >= totalRequiredCases && totalRequiredCases > 0;

    // 4. Cek status Track B (Dummy check, bisa disesuaikan dengan hit log database Anda nanti)
    const isTrackBComplete = false; 

    return NextResponse.json({
      success: true,
      data: {
        hasScope: true,
        trackA: {
          isCompleted: isTrackAComplete,
          statusLabel: isTrackAComplete ? "Complete ✅" : "In Progress ⏳",
          progressDetails: `${validatedCasesCount}/${totalRequiredCases} Kasus Disahkan`
        },
        trackB: {
          isOpen: isTrackAComplete, // Track B terbuka HANYA JIKA Track A Complete
          isCompleted: isTrackBComplete,
          statusLabel: !isTrackAComplete 
            ? "🔒 Terkunci (Selesaikan Track A)" 
            : isTrackBComplete ? "Complete ✅" : "Ready for Test 🚀"
        }
      }
    });
  } catch (error: any) {
    console.error("GET /api/partner/progress error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}