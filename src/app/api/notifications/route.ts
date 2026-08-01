import { NextResponse } from "next/server";
import { sendEmailAlert } from "@/lib/notifications/mailer";
import { sendWhatsAppMessage } from "@/lib/notifications/wa-client";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { scanId, diagnosis, confidenceScore } = body;

    const targetEmail = process.env.ALERT_TARGET_EMAIL || "default@gmail.com";
    const targetPhone = process.env.ALERT_TARGET_PHONE || "+62000000000";

    // Mengeksekusi Email dan WhatsApp secara paralel (bersamaan) agar cepat
    const [emailResult, waResult] = await Promise.all([
      sendEmailAlert(targetEmail, scanId, diagnosis, confidenceScore),
      sendWhatsAppMessage(targetPhone, scanId, diagnosis, confidenceScore)
    ]);

    return NextResponse.json({ 
      success: true, 
      message: "Peringatan darurat berhasil didistribusikan",
      details: { email: emailResult, whatsapp: waResult }
    }, { status: 200 });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json({ success: false, message: "Gagal memproses peringatan" }, { status: 500 });
  }
}