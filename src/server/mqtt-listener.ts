import mqtt from 'mqtt';
import { PrismaClient, Prisma } from '@prisma/client';

// Menginisialisasi koneksi Prisma baru khusus untuk worker
const prisma = new PrismaClient();

// Terhubung via TCP Murni (Bukan WebSockets) -> Standar Mesin-ke-Mesin
const client = mqtt.connect('mqtt://localhost:1883');

client.on('connect', () => {
  console.log('🤖 Pekerja Latar Belakang (Backend) Terhubung ke MQTT TCP Port 1883');
  client.subscribe('ocusense/scans');
});

client.on('message', async (topic, message) => {
  if (topic === 'ocusense/scans') {
    try {
      const payload = JSON.parse(message.toString());
      console.log(`📥 Menerima Payload Scan ID: ${payload.scan_id}`);

      // Menyimpan data secara atomik ke PostgreSQL (Sama seperti rute POST API)
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
    } catch (error) {
      console.error(`❌ Gagal memproses/menyimpan data MQTT:`, error);
    }
  }
});