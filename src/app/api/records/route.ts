/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const records = await prisma.medicalRecord.findMany({
      include: { device: true },
      orderBy: { timestamp: 'desc' }
    });
    return NextResponse.json({ success: true, data: records });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Gagal memuat rekam medis' }, { status: 500 });
  }
}