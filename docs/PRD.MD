# Product Requirements Document (PRD)

**Nama Sistem:** OCUSENSE AI - Web Dashboard
**Versi:** 1.1.0
**Tahap:** Pengembangan dan Stabilisasi

## 1. Latar Belakang dan Tujuan
Katarak menyumbang 47,8% dari penyebab kebutaan global, yang mayoritas diakibatkan oleh keterlambatan skrining klinis. Ocusense AI dikembangkan untuk memecahkan hambatan aksesibilitas ini dengan menyediakan instrumen portabel berbasis komputasi tepi. 

Aplikasi web ini dirancang sebagai portal pusat kendali bagi tenaga medis. Tujuannya adalah untuk menerima data secara instan dari lapangan, memvalidasi temuan kecerdasan buatan, mengotomatisasi peringatan kepada pemangku kepentingan, dan menerbitkan rujukan formal.

## 2. Kebutuhan Fungsional Pengguna

### 2.1. Modul Konektivitas dan Isolasi Keamanan
*   Sistem mengharuskan pengguna melewati halaman inisialisasi jaringan dengan memasukkan PIN unik dari perangkat keras.
*   Sistem secara proaktif memblokir akses atau mengeluarkan pengguna (Auto-Kick) dari dasbor apabila perangkat fisik dimatikan atau kehabisan daya.
*   Sistem menerapkan isolasi data secara ketat. Riwayat rekam medis hanya dapat diakses oleh sesi yang terhubung dengan Identitas Perangkat (MAC Address) yang sesuai.

### 2.2. Modul Pemantauan Kondisi Perangkat (Live Monitor)
*   Dasbor merender metrik daya kelistrikan alat secara waktu nyata dari pembacaan Sensor INA219, mencakup indikator daya lemah, kritis, dan status pengisian daya (charging).
*   Sistem akan memunculkan interupsi layar penuh (Modal) apabila latensi jaringan (Ping) memburuk hingga melebihi 300ms, atau saat baterai menyentuh angka 0%.
*   Dasbor merender citra medis beserta identifikasi kotak pembatas (bounding box) area mata yang diekstraksi secara presisi oleh model YOLOv8.
*   Dasbor menampilkan probabilitas akurasi (Confidence Score) dan klasifikasi kondisi mata yang dihasilkan oleh CNN EfficientNet.

### 2.3. Modul Ruang Kerja Medis & Ekspor PDF
*   Sistem menyimpan status hasil pindaian. Saat pindaian diselesaikan, data akan disimpan ke dalam penyimpanan lokal peramban agar tidak muncul kembali di layar pemantauan utama.
*   Sistem memiliki fitur konversi riwayat diagnostik menjadi dokumen PDF berformat A4 (800x1131 piksel).
*   Pembentukan PDF menggunakan metode **Kloning Bayangan (Shadow Cloning)**, yang mencegah kerusakan tata letak situs web yang responsif, serta menghalau masalah keamanan (CORS) saat mengekspor dokumen.

### 2.4. Modul Penjaluran Peringatan Otomatis (Notifikasi)
*   Sistem menyediakan halaman konfigurasi untuk mendaftarkan nomor kontak darurat.
*   Jika sistem menerima status "Katarak Matur", peladen secara otomatis mengirimkan peringatan surel yang memuat templat laporan klinis presisi, mempertahankan tata letak lokalisasi YOLO dengan teknik rasio aspek (padding-bottom 75%) agar kompatibel pada klien surel yang ketat seperti Gmail.

## 3. Metrik Kinerja dan Responsivitas
*   Target latensi telemetri antara pengiriman data dari perangkat portabel ke dasbor berada di kisaran 6,2 milidetik.
*   Antarmuka web harus beradaptasi dengan sempurna pada resolusi monitor desktop hingga layar telepon pintar, tanpa memengaruhi rasio ukuran cetak dokumen PDF.