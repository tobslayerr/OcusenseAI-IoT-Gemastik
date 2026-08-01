import nodemailer from 'nodemailer';

export const sendEmailAlert = async (to: string, scanId: string, diagnosis: string, confidence: number) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px; max-width: 600px;">
        <h2 style="color: #ef4444; margin-top: 0;">🚨 PERINGATAN DARURAT: Ocusense AI</h2>
        <p>Sistem Edge AI baru saja mendeteksi pasien dengan indikasi katarak tingkat lanjut yang membutuhkan penanganan medis segera.</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px; font-weight: bold;">ID Laporan</td>
            <td style="padding: 10px; font-family: monospace;">${scanId}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px; font-weight: bold;">Diagnosis AI</td>
            <td style="padding: 10px; color: #ef4444; font-weight: bold;">${diagnosis}</td>
          </tr>
          <tr style="background-color: #f8fafc;">
            <td style="padding: 10px; font-weight: bold;">Akurasi Deteksi</td>
            <td style="padding: 10px; color: #2563eb;">${confidence}%</td>
          </tr>
        </table>
        <p style="margin-top: 20px; font-size: 12px; color: #64748b;">Harap segera buka dasbor Ocusense untuk melakukan validasi klinis dan menerbitkan rujukan operasi.</p>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"Ocusense AI IoT" <${process.env.SMTP_USER}>`,
      to,
      subject: `🚨 [URGENT] Deteksi ${diagnosis} - ID: ${scanId}`,
      html: htmlContent,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Gagal mengirim email SMTP:", error);
    return { success: false, error };
  }
};