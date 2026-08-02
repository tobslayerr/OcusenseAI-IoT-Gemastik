# Arsitektur Sistem dan Integrasi MQTT OCUSENSE AI

Dokumen ini menjelaskan topologi pergerakan data dari perangkat keras ke antarmuka pengguna. Arsitektur ini dirancang secara *decoupled* (terpisah), yang berarti tim pengembang perangkat keras/kecerdasan buatan dapat bekerja secara independen tanpa terikat pada bahasa pemrograman yang digunakan oleh tim pengembang web.

## Topologi Jaringan Tiga Pilar

Proyek ini menggunakan Pialang (Broker) MQTT sebagai terminal lalu lintas data sentral. Ekosistem aplikasi web (Next.js) tidak hanya bertindak sebagai antarmuka pasif, melainkan memiliki peladen latar belakang (Backend API) untuk pemrosesan permanen.

### 1. Perangkat Tepi (Edge Device - Area Kerja Tim AI/Hardware)
*   Perangkat fisik (Raspberry Pi 5) menjalankan proses inferensi YOLOv8 dan CNN EfficientNet secara lokal.
*   **Simulasi Telemetri Interaktif:** Perangkat tepi dilengkapi dengan antarmuka baris perintah (CLI) untuk memanipulasi status perangkat secara langsung, seperti menguras daya (`/drain`), mengisi daya (`/charge`), atau mensimulasikan jaringan buruk (`/lag`).
*   **Integrasi Bebas Hambatan:** Pengembang AI tidak perlu mengetahui cara kerja Next.js atau PostgreSQL. Setelah AI menghasilkan kesimpulan, perangkat cukup mempublikasikan (*publish*) data tersebut dalam bentuk objek JSON standar ke topik `ocusense/scans` dan `ocusense/telemetry` melalui protokol TCP (Port 1883).
*   **Last Will and Testament (LWT):** Perangkat dikonfigurasi untuk secara otomatis mengirimkan status *offline* ke peladen apabila koneksi terputus secara tiba-tiba.

### 2. Pialang Pesan (MQTT Broker)
*   Bertindak sebagai penyalur pesan (Router). Dapat menggunakan solusi seperti Eclipse Mosquitto.

### 3. Ekosistem Web Next.js (Area Kerja Tim Pengembangan Web)
Aplikasi Next.js menjalankan dua peran berlangganan (*subscriber*) secara bersamaan:

*   **Sisi Klien (Frontend WebSockets):** Menggunakan pustaka klien WebSockets (Port 9001 atau wss://) untuk mendengarkan lalu lintas data. Tujuannya murni untuk visualisasi antarmuka waktu nyata (mengubah persentase daya baterai, menampilkan indikator pengisian daya, atau memunculkan peringatan interupsi layar saat latensi melebihi batas).
*   **Sisi Peladen (Backend Route Handlers):** Menjalankan layanan daemon latar belakang (Node.js) yang terhubung ke Pialang MQTT via TCP. Saat muatan (payload) baru terdeteksi:
    1.  Peladen memvalidasi struktur JSON.
    2.  Peladen menyimpan data ke Basis Data PostgreSQL dan mengisolasinya secara ketat berdasarkan Alamat MAC perangkat (Data Isolation).
    3.  **Logika Peringatan Otomatis:** Peladen mengevaluasi parameter `diagnosis`. Jika nilainya adalah "Katarak Matur", peladen secara otomatis mengeksekusi pengiriman surel (SMTP) berformat laporan medis presisi, serta mengirimkan pesan WhatsApp ke nomor yang telah didaftarkan.

## Skema Kontrak Muatan (JSON Payload Schema)
Tim Kecerdasan Buatan mempublikasikan dua jenis data ke Pialang MQTT:

**1. Topik: `ocusense/telemetry`**
```json
{
  "mac_address": "00:1A:2B:3C:4D:5E",
  "battery_percentage": 86,
  "latency_ms": 6.2,
  "is_charging": false
}
```

**2. Topik: `ocusense/scans`**
```json
{
  "mac_address": "00:1A:2B:3C:4D:5E",
  "device_name": "Ocusense Node A",
  "scan_id": "SCN-102945",
  "timestamp": "2026-07-30T08:00:00Z",
  "ai_analysis": {
    "diagnosis": "Katarak Matur",
    "confidence_score": 94.2,
    "bounding_box": [120, 80, 520, 400]
  },
  "image": "<base64_encoded_string>"
}
```
