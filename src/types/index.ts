export interface DeviceMetrics {
  battery_percentage: number;
  latency_ms: number;
}

export type DiagnosisType = "Katarak Matur" | "Katarak Imatur" | "Mata Normal";

export interface AIAnalysis {
  diagnosis: DiagnosisType;
  confidence_score: number;
  bounding_box: [number, number, number, number];
}

// PASTIKAN BARIS INI ADA
export interface OcusensePayload {
  scan_id: string;
  timestamp: string;
  device_metrics: DeviceMetrics;
  ai_analysis: AIAnalysis;
}

export type ValidationStatus = "pending" | "validated";

export interface MedicalRecord extends OcusensePayload {
  id?: string;
  validation_status: ValidationStatus;
  doctor_notes?: string;
  referral_issued: boolean;
}