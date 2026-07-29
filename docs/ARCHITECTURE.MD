# Arsitektur Sistem dan Integrasi MQTT OCUSENSE AI

Dokumen ini menjelaskan topologi pergerakan data dari perangkat keras ke antarmuka pengguna. Arsitektur ini dirancang secara *decoupled* (terpisah), yang berarti tim pengembang perangkat keras/kecerdasan buatan dapat bekerja secara independen tanpa terikat pada bahasa pemrograman yang digunakan oleh tim web.

## Topologi Jaringan Tiga Pilar

Proyek ini menggunakan Pialang (Broker) MQTT sebagai terminal lalu lintas data sentral. Ekosistem aplikasi web (Next.js) tidak hanya bertindak sebagai antarmuka pasif, melainkan memiliki peladen latar belakang (Backend API) untuk pemrosesan permanen.

### 1. Perangkat Tepi (Edge Device - Area Kerja Tim AI/Hardware)
*   Perangkat fisik (Raspberry Pi 5) menjalankan proses inferensi YOLOv8 dan CNN EfficientNet secara lokal[cite: 16].
*   **Integrasi Bebas Hambatan:** Pengembang AI tidak perlu mengetahui cara kerja Next.js atau PostgreSQL. Setelah AI menghasilkan kesimpulan, mereka cukup menggunakan pustaka klien MQTT (misalnya `paho-mqtt` di Python) untuk mempublikasikan (*publish*) data tersebut dalam bentuk objek JSON standar ke topik `ocusense/scan` melalui protokol TCP (Port 1883).

### 2. Pialang Pesan (MQTT Broker)
*   Bertindak sebagai penyalur pesan (Router). Dapat menggunakan solusi seperti Eclipse Mosquitto.

### 3. Ekosistem Web Next.js (Area Kerja Tim Pengembangan Web)
Aplikasi Next.js menjalankan dua peran berlangganan (*subscriber*) secara bersamaan:

*   **Sisi Klien (Frontend WebSockets):** Menggunakan pustaka klien WebSockets (Port 9001 atau wss://) untuk mendengarkan lalu lintas data. Tujuannya murni untuk visualisasi antarmuka waktu nyata (mengubah persentase daya baterai atau memunculkan peringatan lonceng di layar).
*   **Sisi Peladen (Backend Route Handlers):** Menjalankan layanan daemon latar belakang (Node.js) yang terhubung ke Pialang MQTT via TCP. Saat muatan (payload) baru terdeteksi:
    1.  Peladen memvalidasi struktur JSON (menggunakan Zod).
    2.  Peladen menyimpan data ke Basis Data PostgreSQL (menggunakan Prisma).
    3.  **Logika Peringatan:** Peladen mengevaluasi parameter `diagnosis`. Jika nilainya adalah "Katarak Matur", peladen secara otomatis mengeksekusi layanan `mailer.ts` (SMTP) dan `wa-client.ts` (Gateway WhatsApp API) untuk mengirimkan notifikasi tanpa campur tangan pengguna[cite: 16].

## Skema Kontrak Muatan (JSON Payload Schema)
Tim Kecerdasan Buatan harus memublikasikan data ke Pialang MQTT dengan format mutlak berikut agar dapat dibaca oleh Basis Data Web:

```json
{
  "scan_id": "SCN-1029",
  "timestamp": "2026-07-30T08:00:00Z",
  "device_metrics": {
    "battery_percentage": 86,
    "latency_ms": 6.2
  },
  "ai_analysis": {
    "diagnosis": "Katarak Matur",
    "confidence_score": 94.2,
    "bounding_box": [x, y, width, height]
  }
}