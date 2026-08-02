/* eslint-disable @typescript-eslint/no-unused-vars */
import { PrismaClient } from '@prisma/client';
import mqtt from 'mqtt';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();
const client = mqtt.connect('mqtt://localhost:1883');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const sendSimulatedWhatsApp = (phone: string, message: string) => {
  console.log('\n' + '🟩'.repeat(25));
  console.log(`📱 [SIMULASI WHATSAPP] Pesan terkirim ke: ${phone}`);
  console.log('-'.repeat(50));
  console.log(message);
  console.log('🟩'.repeat(25) + '\n');
};

client.on('connect', () => {
  console.log('\n======================================================');
  console.log('✅ 📡 MQTT LISTENER AKTIF & SIAP MENERIMA DATA');
  console.log('======================================================\n');
  client.subscribe('ocusense/register');
  client.subscribe('ocusense/scans');
});

client.on('error', (err) => console.error('\n❌ [MQTT ERROR]:', err.message));

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

      const patientName = device.operatorName || "Pasien Anonim";
      let calculatedAge = 0;
      if (device.operatorDob) {
        calculatedAge = new Date().getFullYear() - new Date(device.operatorDob).getFullYear();
      }

      // 1. SIMPAN KE DATABASE TERLEBIH DAHULU (PISAHKAN DARI EMAIL)
      try {
        await prisma.medicalRecord.create({
          data: {
            scanId: payload.scan_id,
            patientName: patientName,
            patientDob: device.operatorDob || new Date(),
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
        console.log(`💾 [DATABASE] Data #${payload.scan_id} berhasil diamankan ke History!`);
      } catch (dbError) {
        console.error("❌ Gagal menyimpan ke Database:", dbError);
        return; // Hentikan jika gagal simpan
      }

      const scanTime = new Date(payload.timestamp).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
      const isMatur = payload.ai_analysis.diagnosis === "Katarak Matur";
      const isImatur = payload.ai_analysis.diagnosis === "Katarak Imatur";

      // 2. PROSES PENGIRIMAN NOTIFIKASI (TIDAK AKAN MENGGANGGU DATABASE JIKA GAGAL)
      try {
        if (device.alertPhone) {
          const waMessage = `*Laporan Pemindaian Ocusense AI* 👁️\n\nHalo, ini adalah ringkasan hasil periksa mata cerdas Anda:\n\n👤 *Pasien:* ${patientName} (${calculatedAge} Thn)\n🕒 *Waktu:* ${scanTime} WIB\n\n🔍 *Hasil Diagnosis AI:* ${payload.ai_analysis.diagnosis}\n🎯 *Akurasi AI:* ${payload.ai_analysis.confidence_score}%\n\n${isMatur ? '⚠️ *PERINGATAN:* Segera konsultasikan ke dokter spesialis mata.' : '✅ *STATUS:* Aman / Tahap Awal.'}`;
          sendSimulatedWhatsApp(device.alertPhone, waMessage);
        }

        if (device.alertEmail) {
          const colorTheme = isMatur ? "#ef4444" : isImatur ? "#f97316" : "#10B981";
          
          const bbox = payload.ai_analysis.bounding_box;
          const left = (bbox[0] / 640) * 100;
          const top = (bbox[1] / 480) * 100;
          const width = ((bbox[2] - bbox[0]) / 640) * 100;
          const height = ((bbox[3] - bbox[1]) / 480) * 100;

          const htmlTemplate = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
              <div style="background-color: ${colorTheme}; padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0;">Laporan Ocusense AI</h1>
              </div>
              <div style="padding: 30px;">
                <h2>Pasien: ${patientName} (${calculatedAge} Tahun)</h2>
                <h3 style="color: ${colorTheme};">${payload.ai_analysis.diagnosis} (${payload.ai_analysis.confidence_score}%)</h3>
                
                <div style="position: relative; width: 100%; background-color: #000; border-radius: 12px; overflow: hidden; margin: 20px 0; aspect-ratio: 4/3;">
                  <img src="cid:scanImage" style="width: 100%; height: 100%; object-fit: cover; filter: grayscale(100%); opacity: 0.9;" />
                  
                  <div style="position: absolute; left: ${left}%; top: ${top}%; width: ${width}%; height: ${height}%; border: 2px solid ${colorTheme}; background-color: ${colorTheme}1A;">
                    <span style="position: absolute; top: 0; left: 0; background-color: ${colorTheme}; color: white; font-size: 10px; font-weight: bold; padding: 4px 8px; border-bottom-right-radius: 8px;">EYE : ${payload.ai_analysis.confidence_score}%</span>
                  </div>
                </div>
              </div>
            </div>
          `;

          await transporter.sendMail({
            from: '"Ocusense AI" <no-reply@ocusense.id>',
            to: device.alertEmail,
            subject: `Laporan Scan - ${patientName} (${payload.ai_analysis.diagnosis})`,
            html: htmlTemplate,
            attachments: [{ filename: `SCN.jpg`, content: payload.image, encoding: 'base64', cid: 'scanImage' }]
          });
          console.log(`📧 [EMAIL TERKIRIM] Berhasil dikirim ke: ${device.alertEmail}`);
        }
      } catch (notifError) {
        console.error("⚠️ [INFO] Data tersimpan, tapi Gagal kirim Email/WA. Cek konfigurasi Sandi Gmail Anda!");
      }
    }
  } catch (error) {
    console.error('❌ Galat MQTT Utama:', error);
  }
});