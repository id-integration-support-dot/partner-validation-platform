import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Anda bisa mengganti mock data di bawah ini dengan query ke database Anda (Prisma/Drizzle) nanti.
    const mockProfile = {
      name: "partner",
      email: "ab@gmail.com",
      role: "Partner",
      status: "Approved"
    };

    return NextResponse.json({
      success: true,
      data: mockProfile
    }, { status: 200 });

  } catch (error) {
    console.error("Error pada API Profile:", error);
    return NextResponse.json({
      success: false,
      error: {
        message: "Gagal mengambil data profil partner."
      }
    }, { status: 500 });
  }
}