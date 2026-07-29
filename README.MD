# OCUSENSE AI: Cataract Screening System Dashboard

Portal dasbor web dan sistem rekam medis digital terpadu untuk OCUSENSE AI. Proyek ini merupakan sistem deteksi dini katarak berbasis Internet of Things (IoT) yang mengintegrasikan komputasi tepi (Edge Computing) pada perangkat Raspberry Pi 5 dengan algoritma YOLOv8 dan CNN EfficientNet[cite: 16].

## Tumpukan Teknologi (Tech Stack) Terintegrasi

Sistem ini dikembangkan dengan arsitektur modern yang memisahkan antarmuka pengguna, logika bisnis, dan lapisan basis data untuk memastikan skalabilitas dan keamanan data medis.

### Lapisan Antarmuka (Frontend)
*   **Kerangka Kerja:** Next.js 14 (App Router)
*   **Bahasa Pemrograman:** TypeScript (Keamanan tipe data statis)
*   **Pemformatan Antarmuka:** Tailwind CSS v3
*   **Manajemen Keadaan (State):** Zustand (Sinkronisasi data telemetri waktu nyata)
*   **Pembangkit Dokumen:** html2pdf.js (Kompilasi rekam medis berformat PDF)

### Lapisan Peladen & Pangkalan Data (Backend & Database)
*   **Lingkungan Eksekusi:** Node.js (Next.js Route Handlers)
*   **Protokol Komunikasi:** MQTT via TCP (Alat ke Peladen) dan WebSockets (Peladen ke Klien)
*   **ORM (Object-Relational Mapping):** Prisma
*   **Sistem Basis Data:** PostgreSQL (Penyimpanan relasional yang tangguh)
*   **Layanan Peringatan:** Integrasi SMTP (Email) dan WhatsApp API / Gateway[cite: 16].

### Lapisan Keamanan
*   **Enkripsi Transmisi:** WSS (WebSocket Secure) dan HTTPS.
*   **Validasi Muatan (Payload):** Pustaka Zod untuk memvalidasi struktur JSON dari perangkat tepi sebelum dimasukkan ke basis data, mencegah serangan injeksi.
*   **Manajemen Rahasia:** Isolasi kredensial layanan pihak ketiga melalui variabel lingkungan (.env).

## Cakupan Fitur

1.  **Simulasi Jabat Tangan Jaringan:** Modul autentikasi untuk memverifikasi ketersambungan antara klien web dan pialang MQTT.
2.  **Pemantauan Waktu Nyata:** Pemantauan status daya perangkat (Sensor INA219) dan tangkapan visual kamera dengan latensi jaringan empiris 6,2 milidetik[cite: 16].
3.  **Manajemen Validasi Klinis:** Sistem antrean bagi dokter spesialis mata untuk memvalidasi hasil diagnosis kecerdasan buatan dan menetapkan rujukan bedah (Phacoemulsification).
4.  **Penjaluran Peringatan Otomatis:** Sistem yang mengirimkan notifikasi darurat secara otonom melalui pesan WhatsApp dan Surel (Email) ketika indikasi katarak berat terdeteksi[cite: 16].
5.  **Cetak Rekam Medis Digital:** Pembangkit dokumen PDF presisi tinggi (ukuran A4) yang bersih dari elemen navigasi web.

## Panduan Instalasi (Draf)

*(Instruksi untuk NPM Install, konfigurasi Prisma, dan eksekusi Docker akan dilengkapi pada tahap pengembangan kode sumber).*