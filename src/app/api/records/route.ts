import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client"; // Impor modul Prisma untuk tipe aman
import { OcusensePayload } from "@/types";

export async function GET() {
  try {
    const records = await prisma.medicalRecord.findMany({
      orderBy: { timestamp: 'desc' },
    });

    return NextResponse.json({ success: true, data: records }, { status: 200 });
  } catch (error) {
    console.error("Gagal mengambil data rekam medis:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada peladen" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as OcusensePayload;
    const { scan_id, timestamp, device_metrics, ai_analysis } = body;

    if (!scan_id || !device_metrics || !ai_analysis) {
      return NextResponse.json(
        { success: false, message: "Struktur payload tidak valid/lengkap" },
        { status: 400 }
      );
    }

    const savedData = await prisma.$transaction(async (tx) => {
      // 1. Simpan Payload Mentah dengan tipe yang aman (tanpa 'any')
      await tx.deviceLog.create({
        data: {
          scanId: scan_id,
          payload: body as unknown as Prisma.InputJsonValue, 
        },
      });

      // 2. Ekstraksi ke tabel MedicalRecord
      const newRecord = await tx.medicalRecord.create({
        data: {
          scanId: scan_id,
          timestamp: new Date(timestamp),
          batteryPercentage: device_metrics.battery_percentage,
          latencyMs: device_metrics.latency_ms,
          diagnosis: ai_analysis.diagnosis,
          confidenceScore: ai_analysis.confidence_score,
          boundingBox: ai_analysis.bounding_box,
        },
      });

      return newRecord;
    });

    return NextResponse.json(
      { success: true, message: "Data medis berhasil disimpan", data: savedData },
      { status: 201 }
    );
  } catch (error: unknown) { // Mengganti 'any' dengan 'unknown' yang disetujui ESLint
    console.error("Gagal menyimpan data IoT:", error);
    
    // Pengecekan error spesifik menggunakan instance Prisma secara aman
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { success: false, message: "Duplikasi data: scan_id sudah ada di basis data" },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { success: false, message: "Kesalahan internal peladen" },
      { status: 500 }
    );
  }
}