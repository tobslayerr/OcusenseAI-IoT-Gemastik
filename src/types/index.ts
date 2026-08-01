/**
 * Kontrak Tipe Data OCUSENSE AI
 * Mengamankan struktur muatan (payload) dari Pialang MQTT dan Basis Data
 */

// Menentukan batasan (strict literal) untuk hasil diagnosis agar terhindar dari salah ketik (typo)
export type DiagnosisResult = "Katarak Matur" | "Katarak Imatur" | "Normal";
export type ValidationStatus = "pending" | "validated";

// 1. Tipe Data Telemetri Perangkat Keras
export interface DeviceMetrics {
  battery_percentage: number; // Dari Sensor INA219
  latency_ms: number;         // Kalkulasi waktu pengiriman (Target: 6.2ms)
}

// 2. Tipe Data Hasil Inferensi Kecerdasan Buatan (AI)
export interface AIAnalysis {
  diagnosis: DiagnosisResult; // Dari CNN EfficientNet
  confidence_score: number;   // Nilai probabilitas (Contoh: 94.2)
  // Koordinat kotak pembatas (Bounding Box) dari YOLOv8: [x, y, lebar, tinggi]
  bounding_box: [number, number, number, number];
}

// 3. Tipe Data Muatan (Payload) Utama dari MQTT
export interface MQTTPayload {
  scan_id: string;            // ID unik pemindaian (Contoh: "SCN-8092")
  timestamp: string;          // Format ISO 8601 (Contoh: "2026-07-30T08:00:00Z")
  device_metrics: DeviceMetrics;
  ai_analysis: AIAnalysis;
}

// 4. Tipe Data Rekam Medis (Pantulan dari Skema Prisma PostgreSQL)
export interface MedicalRecord {
  id: string;                 // UUID dari Basis Data
  scanId: string;
  scannedAt: string | Date;
  diagnosis: DiagnosisResult;
  confidenceScore: number;
  validationStatus: ValidationStatus;
  doctorNotes?: string;       // Opsional (Bisa kosong jika belum divalidasi)
  isReferred: boolean;        // Status penerbitan rujukan operasi
}