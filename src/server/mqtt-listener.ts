import mqtt from 'mqtt';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();
const client = mqtt.connect('mqtt://localhost:1883');

client.on('connect', () => {
  console.log('🤖 Pekerja Latar Belakang (Backend) Terhubung ke MQTT TCP Port 1883');
  client.subscribe('ocusense/scans');
});

client.on('message', async (topic, message) => {
  if (topic === 'ocusense/scans') {
    try {
      const payload = JSON.parse(message.toString());
      console.log(`\n📥 Menerima Payload Scan ID: ${payload.scan_id}`);

      // 1. Menyimpan data secara atomik ke PostgreSQL
      await prisma.$transaction(async (tx) => {
        await tx.deviceLog.create({
          data: {
            scanId: payload.scan_id,
            payload: payload as unknown as Prisma.InputJsonValue,
          },
        });

        await tx.medicalRecord.create({
          data: {
            scanId: payload.scan_id,
            timestamp: new Date(payload.timestamp),
            batteryPercentage: payload.device_metrics.battery_percentage,
            latencyMs: payload.device_metrics.latency_ms,
            diagnosis: payload.ai_analysis.diagnosis,
            confidenceScore: payload.ai_analysis.confidence_score,
            boundingBox: payload.ai_analysis.bounding_box,
          },
        });
      });

      console.log(`✅ Sukses menyimpan Scan ID: ${payload.scan_id} ke Pangkalan Data`);

      // =========================================================================
      // 2. LOGIKA PEMICU PERINGATAN DARURAT (TAHAP 5)
      // =========================================================================
      if (payload.ai_analysis.diagnosis === "Katarak Matur") {
        console.log(`⚠️ INDIKASI KATARAK MATUR TERDETEKSI! Memicu sistem peringatan darurat...`);
        
        // Menembak API lokal kita sendiri
        fetch('http://localhost:3000/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scanId: payload.scan_id,
            diagnosis: payload.ai_analysis.diagnosis,
            confidenceScore: payload.ai_analysis.confidence_score
          })
        }).then(res => res.json())
          .then(data => {
            if(data.success) console.log(`📢 [SUKSES] Notifikasi Email & WA terkirim untuk ${payload.scan_id}`);
          })
          .catch(err => console.error(`❌ [GAGAL] API Notifikasi tidak merespons:`, err));
      }

    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        console.log(`⚠️ Data Diabaikan: Scan ID tersebut sudah ada di basis data (Duplikat).`);
      } else {
        console.error(`❌ Gagal memproses data MQTT:`, error);
      }
    }
  }
});