/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Trik Next.js 15: Ekstrak ID dengan await
    const { id } = await params;

    const record = await prisma.medicalRecord.findUnique({
      where: { scanId: id },
      include: { device: true } // Tarik juga data nama alat dan operator
    });
    
    if (!record) return NextResponse.json({ success: false, error: 'Data tidak ditemukan' }, { status: 404 });
    return NextResponse.json({ success: true, data: record });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}