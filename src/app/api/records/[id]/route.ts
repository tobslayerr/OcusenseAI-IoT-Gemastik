import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Mendapatkan 1 Spesifik Rekam Medis berdasarkan Scan ID
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params; // Next.js 15: params harus di-await di Server
  
  try {
    const record = await prisma.medicalRecord.findUnique({
      where: { scanId: resolvedParams.id },
    });

    if (!record) {
      return NextResponse.json({ success: false, message: "Rekam medis tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: record }, { status: 200 });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json({ success: false, message: "Kesalahan server" }, { status: 500 });
  }
}

// Memperbarui Status Validasi & Catatan Dokter
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  try {
    const body = await request.json();
    const { validationStatus, doctorNotes, referralIssued, diagnosis } = body;

    const updatedRecord = await prisma.medicalRecord.update({
      where: { scanId: resolvedParams.id },
      data: {
        validationStatus,
        doctorNotes,
        referralIssued,
        diagnosis, // Memperbarui diagnosis jika dokter menyanggah AI
      },
    });

    return NextResponse.json({ success: true, message: "Validasi berhasil disimpan", data: updatedRecord }, { status: 200 });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json({ success: false, message: "Gagal menyimpan validasi" }, { status: 500 });
  }
}