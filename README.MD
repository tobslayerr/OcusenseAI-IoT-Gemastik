# OCUSENSE AI: Cataract Screening System Dashboard

Portal dasbor web dan sistem rekam medis digital terpadu untuk OCUSENSE AI. Proyek ini merupakan sistem deteksi dini katarak berbasis Internet of Things (IoT) yang mengintegrasikan komputasi tepi (Edge Computing) pada perangkat Raspberry Pi 5 dengan algoritma YOLOv8 dan CNN EfficientNet.

## Tumpukan Teknologi (Tech Stack) Terintegrasi

Sistem ini dikembangkan dengan arsitektur modern yang memisahkan antarmuka pengguna, logika bisnis, dan lapisan basis data untuk memastikan skalabilitas dan keamanan data medis.

### Lapisan Antarmuka (Frontend)
*   **Kerangka Kerja:** Next.js 14 (App Router)
*   **Bahasa Pemrograman:** TypeScript
*   **Pemformatan Antarmuka:** Tailwind CSS v3
*   **Manajemen Keadaan (State):** Zustand (Sinkronisasi data telemetri waktu nyata)
*   **Pembangkit Dokumen PDF:** `html-to-image` dan `jsPDF` (Kompilasi rekam medis dengan isolasi kloning bayangan untuk menghindari konflik CORS dan kompatibilitas warna tingkat lanjut).

### Lapisan Peladen & Pangkalan Data (Backend & Database)
*   **Lingkungan Eksekusi:** Node.js (Next.js Route Handlers)
*   **Protokol Komunikasi:** MQTT via TCP (Alat ke Peladen) dan WebSockets (Peladen ke Klien)
*   **ORM (Object-Relational Mapping):** Prisma
*   **Sistem Basis Data:** PostgreSQL
*   **Layanan Peringatan:** Integrasi SMTP (Surel dengan tipografi Plus Jakarta Sans dan tata letak rasio absolut) serta Gateway WhatsApp.

### Lapisan Keamanan & Kendali Mutu
*   **Enkripsi Transmisi:** WSS (WebSocket Secure) dan HTTPS.
*   **Isolasi Data Identitas:** API Rekam Medis dikunci berdasarkan kueri parameter Identitas Perangkat (`deviceId`).
*   **Penjaga Sesi Waktu Nyata:** Pemutusan sesi otomatis apabila perangkat keras terputus dari protokol MQTT atau kehabisan daya listrik.

## Cakupan Fitur

1.  **Simulasi Perangkat Keras Dinamis:** Pialang MQTT mendukung input baris perintah (`/drain`, `/charge`, `/lag`) untuk mensimulasikan fluktuasi kinerja fisik alat.
2.  **Pemantauan Waktu Nyata:** Pemantauan status daya perangkat dan latensi jaringan empiris (6,2 milidetik) yang divisualisasikan melalui dasbor interaktif.
3.  **Manajemen Validasi Klinis:** Sistem pencatatan status pindaian yang ditautkan pada penyimpanan lokal (Local Storage), memastikan layar utama tetap bersih dari antrean pasien yang telah ditinjau.
4.  **Penjaluran Peringatan Otomatis:** Sistem yang mengirimkan laporan diagnostik tingkat klinis melalui Surel dan WhatsApp ketika indikasi katarak berat terdeteksi.
5.  **Cetak Rekam Medis Digital:** Pembangkit PDF presisi mutlak (kertas A4) ganda, memuat rekaman data pasien, hasil inferensi AI, serta bukti lokalisasi kornea mata.

## Panduan Instalasi

*(Instruksi untuk instalasi Node Package Manager, konfigurasi relasi Prisma, dan inisialisasi Pialang MQTT akan didokumentasikan lebih lanjut pada tahap penerapan akhir).*