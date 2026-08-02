import { PrismaClient } from '@prisma/client';
import mqtt from 'mqtt';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();
const client = mqtt.connect('mqtt://localhost:1883');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

client.on('connect', () => {
  console.log('\n======================================================');
  console.log('✅ 📡 MQTT LISTENER AKTIF & SIAP MENERIMA DATA');
  console.log('======================================================\n');
  client.subscribe('ocusense/register');
  client.subscribe('ocusense/scans');
});

client.on('message', async (topic, message) => {
  try {
    const payload = JSON.parse(message.toString());

    if (topic === 'ocusense/register') {
      const device = await prisma.device.upsert({
        where: { macAddress: payload.mac_address },
        update: { name: payload.device_name, pairingCode: payload.pairing_code },
        create: { macAddress: payload.mac_address, name: payload.device_name, pairingCode: payload.pairing_code }
      });
      if (device.operatorName) {
        client.publish(`ocusense/paired/${device.macAddress}`, JSON.stringify({ status: "success", operator: device.operatorName }));
      }
      return; 
    }

    if (topic === 'ocusense/scans') {
      console.log(`📥 [DATA MASUK] Pindaian baru diterima: #${payload.scan_id}`);

      const device = await prisma.device.findUnique({ where: { macAddress: payload.mac_address } });
      if(!device) return;

      const patientName = device.operatorName || "Data Pasien Tidak Diketahui";
      const patientDob = device.operatorDob ? new Date(device.operatorDob) : new Date();
      
      let calculatedAge = 0;
      if (device.operatorDob) {
        calculatedAge = new Date().getFullYear() - patientDob.getFullYear();
      }

      try {
        await prisma.medicalRecord.create({
          data: {
            scanId: payload.scan_id,
            patientName: patientName,
            patientDob: patientDob,
            patientAge: calculatedAge,
            timestamp: new Date(payload.timestamp),
            batteryPercentage: 100,
            latencyMs: 5.0,
            diagnosis: payload.ai_analysis.diagnosis,
            confidenceScore: payload.ai_analysis.confidence_score,
            boundingBox: payload.ai_analysis.bounding_box,
            image: payload.image,
            deviceId: device.id
          },
        });
      } catch (dbError) {
        console.error("❌ Gagal menyimpan ke Database:", dbError);
        return; 
      }

      const scanTime = new Date(payload.timestamp).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
      const dobFormatted = patientDob.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
      
      const isMatur = payload.ai_analysis.diagnosis === "Katarak Matur";
      const handlingStatus = isMatur ? 'PERLU RUJUKAN BEDAH SEGERA' : 'BATAS AMAN / OBSERVASI KLINIS';
      const colorTheme = isMatur ? "#dc2626" : payload.ai_analysis.diagnosis === "Katarak Imatur" ? "#ea580c" : "#059669";

      // 🟢 TRIK EMAIL: KALKULASI GRID TABEL PIXEL-PERFECT (Untuk Mengganti Absolute Positioning)
      const bbox = payload.ai_analysis.bounding_box;
      const x = Math.round(bbox[0]);
      const y = Math.round(bbox[1]);
      const w = Math.round(bbox[2] - bbox[0]);
      const h = Math.round(bbox[3] - bbox[1]);

      if (device.alertEmail) {
        const htmlTemplate = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
          </head>
          <body style="margin: 0; padding: 20px; background-color: #f1f5f9; font-family: 'Plus Jakarta Sans', Arial, sans-serif;">
            <div style="max-width: 640px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
              
              <div style="background-color: #0f172a; padding: 25px 30px; text-align: left; border-bottom: 4px solid ${colorTheme};">
                <h1 style="color: #ffffff; margin: 0; font-size: 18px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;">LAPORAN HASIL PENAPISAN MEDIS</h1>
                <p style="color: #94a3b8; margin-top: 5px; font-size: 12px; letter-spacing: 1px; text-transform: uppercase;">Sistem Diagnostik Ocusense AI</p>
              </div>
              
              <div style="padding: 30px;">
                
                <h3 style="color: #0f172a; font-size: 13px; margin-top: 0; margin-bottom: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">Informasi Pasien & Pindai</h3>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 13px;">
                  <tr>
                    <td style="padding: 10px 0; color: #475569; width: 40%;">Nama Lengkap</td>
                    <td style="padding: 10px 0; color: #0f172a; font-weight: 600; text-align: right;">${patientName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-top: 1px solid #f1f5f9; color: #475569;">Usia & Tanggal Lahir</td>
                    <td style="padding: 10px 0; border-top: 1px solid #f1f5f9; color: #0f172a; font-weight: 600; text-align: right;">${calculatedAge} Tahun (${dobFormatted})</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-top: 1px solid #f1f5f9; color: #475569;">Tanggal & Waktu Periksa</td>
                    <td style="padding: 10px 0; border-top: 1px solid #f1f5f9; color: #0f172a; font-weight: 600; text-align: right;">${scanTime} WIB</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-top: 1px solid #f1f5f9; color: #475569;">Lokasi Pemindaian (Alat)</td>
                    <td style="padding: 10px 0; border-top: 1px solid #f1f5f9; color: #0f172a; font-weight: 600; text-align: right;">${device.name}</td>
                  </tr>
                </table>

                <h3 style="color: #0f172a; font-size: 13px; margin-top: 0; margin-bottom: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">Kesimpulan Analisis Klinis</h3>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 13px;">
                  <tr>
                    <td style="padding: 10px 0; color: #475569; width: 40%;">Diagnosis Primer</td>
                    <td style="padding: 10px 0; color: ${colorTheme}; font-weight: 800; font-size: 16px; text-align: right; text-transform: uppercase;">${payload.ai_analysis.diagnosis}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-top: 1px solid #f1f5f9; color: #475569;">Tingkat Kepercayaan (Akurasi)</td>
                    <td style="padding: 10px 0; border-top: 1px solid #f1f5f9; color: #0f172a; font-weight: 700; text-align: right;">${payload.ai_analysis.confidence_score}%</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-top: 1px solid #f1f5f9; color: #475569;">Status Penanganan</td>
                    <td style="padding: 10px 0; border-top: 1px solid #f1f5f9; color: #0f172a; font-weight: 700; text-align: right;">${handlingStatus}</td>
                  </tr>
                </table>

                <h3 style="color: #0f172a; font-size: 13px; margin-top: 0; margin-bottom: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">Citra Medis & Lokalisasi (YOLO Vision)</h3>
                
                <!-- 🟢 STRUKTUR TABEL GRID AMAN EMAIL (CLONING DASBOR) -->
                <div style="background-color: #000000; border: 2px solid #cbd5e1; border-radius: 8px; overflow: hidden; margin-bottom: 30px; width: 100%; max-width: 640px; margin-left: auto; margin-right: auto;">
                  
                  <table background="cid:scanImage" width="100%" height="480" cellpadding="0" cellspacing="0" border="0" style="background-image: url('cid:scanImage'); background-size: cover; background-position: center; width: 100%; height: 480px; max-width: 640px; border-collapse: collapse;">
                    <!-- BARIS 1: Spasi Kosong Atas -->
                    <tr>
                      <td width="${x}" height="${y}"></td>
                      <td width="${w}" height="${y}"></td>
                      <td width="${640 - x - w}" height="${y}"></td>
                    </tr>
                    <!-- BARIS 2: Kotak Bounding Box YOLO -->
                    <tr>
                      <td width="${x}" height="${h}"></td>
                      <td width="${w}" height="${h}" style="border: 3px solid ${colorTheme}; vertical-align: top;">
                         <div style="background-color: ${colorTheme}; color: #ffffff; font-size: 11px; font-weight: bold; display: inline-block; padding: 4px 8px; border-bottom-right-radius: 6px;">EYE: ${payload.ai_analysis.confidence_score}%</div>
                      </td>
                      <td width="${640 - x - w}" height="${h}"></td>
                    </tr>
                    <!-- BARIS 3: Spasi Kosong Bawah -->
                    <tr>
                      <td width="${x}" height="${480 - y - h}"></td>
                      <td width="${w}" height="${480 - y - h}"></td>
                      <td width="${640 - x - w}" height="${480 - y - h}"></td>
                    </tr>
                  </table>

                </div>

                <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center;">
                  <p style="font-size: 11px; color: #64748b; line-height: 1.6; margin: 0;">
                    Dokumen elektronik ini digenerasi secara otomatis oleh sistem komputasi Ocusense.<br/>
                    Laporan ini bersifat sebagai penunjang skrining awal dan bukan merupakan vonis diagnosis mutlak.<br/>
                    Harap konsultasikan hasil ini kepada Dokter Spesialis Mata (Sp.M).
                  </p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `;

        await transporter.sendMail({
          from: '"Departemen Diagnostik Ocusense" <no-reply@ocusense.id>',
          to: device.alertEmail,
          subject: `Laporan Medis [${payload.scan_id}] - ${patientName}`,
          html: htmlTemplate,
          attachments: [{ filename: `Citra_${payload.scan_id}.jpg`, content: payload.image, encoding: 'base64', cid: 'scanImage' }]
        });
      }
    }
  } catch (error) {
    console.error('❌ Galat MQTT Utama:', error);
  }
});