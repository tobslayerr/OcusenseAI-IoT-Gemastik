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
  mac_address: string;
  device_name: string;
  scan_id: string;
  patient: {
    name: string;
    dob: string;
  };
  timestamp: string;
  device_metrics: {
    battery_percentage: number;
    latency_ms: number;
  };
  ai_analysis: {
    diagnosis: string;
    confidence_score: number;
    bounding_box: number[];
  };
  image: string; // Teks Base64 dari foto alat
}

export type ValidationStatus = "pending" | "validated";

export interface MedicalRecord extends OcusensePayload {
  id?: string;
  validation_status: ValidationStatus;
  doctor_notes?: string;
  referral_issued: boolean;
}