# Product Requirements Document (PRD)

**Nama Sistem:** OCUSENSE AI - Web Dashboard
**Versi:** 1.0.0
**Tahap:** Perancangan Arsitektur

## 1. Latar Belakang dan Tujuan
Katarak menyumbang 47,8% dari penyebab kebutaan global, yang mayoritas diakibatkan oleh keterlambatan skrining klinis[cite: 16]. Ocusense AI dikembangkan untuk memecahkan hambatan aksesibilitas ini dengan menyediakan instrumen portabel berbasis komputasi tepi[cite: 16]. 

Aplikasi web ini dirancang sebagai portal pusat kendali bagi tenaga medis. Tujuannya adalah untuk menerima data secara instan dari lapangan, memvalidasi temuan kecerdasan buatan, mengotomatisasi peringatan kepada pemangku kepentingan, dan menerbitkan rujukan formal.

## 2. Kebutuhan Fungsional Pengguna

### 2.1. Modul Konektivitas Awal (Simulasi Jabat Tangan)
*   Sistem mengharuskan pengguna melewati halaman inisialisasi jaringan (koneksi).
*   Sistem hanya akan membuka akses menuju dasbor utama setelah koneksi klien WebSockets dengan Pialang MQTT dinyatakan berhasil.

### 2.2. Modul Pemantauan Langsung (Live Monitor)
*   Dasbor merender metrik daya kelistrikan alat (baterai) secara waktu nyata dari pembacaan Sensor INA219[cite: 16].
*   Dasbor merender citra medis beserta identifikasi kotak pembatas (bounding box) area mata yang diekstraksi oleh model YOLOv8[cite: 16].
*   Dasbor menampilkan probabilitas akurasi (Confidence Score) dan klasifikasi kondisi mata yang dihasilkan oleh CNN EfficientNet[cite: 16].

### 2.3. Modul Ruang Kerja Medis & Ekspor PDF
*   Sistem menampung riwayat pemindaian dan memisahkan statusnya menjadi "Perlu Ditinjau" dan "Selesai Divalidasi".
*   Sistem menyediakan antarmuka khusus (saklar/toggle) untuk menyetujui penerbitan rujukan operasi bedah.
*   Sistem memiliki fitur konversi riwayat diagnostik menjadi dokumen PDF berformat vertikal A4 yang mencakup tanda tangan digital tenaga medis.

### 2.4. Modul Penjaluran Peringatan Otomatis (Notifikasi)
*   Sistem menyediakan halaman konfigurasi untuk memasukkan nomor WhatsApp dan alamat Surel (Email) tujuan peringatan[cite: 16].
*   Jika sistem menerima muatan (payload) MQTT dengan status diagnosis "Katarak Matur" atau setara dengan tingkat keparahan tinggi, sistem wajib memicu peringatan antarmuka (merah) pada web, serta menginstruksikan peladen latar belakang (backend) untuk mengirimkan pesan WhatsApp dan Surel darurat secara otonom ke kontak yang terdaftar[cite: 16].

## 3. Metrik Kinerja dan Responsivitas
*   Target latensi telemetri antara pengiriman data dari perangkat portabel ke dasbor adalah di kisaran 6,2 milidetik[cite: 16].
*   Antarmuka web harus beradaptasi dengan sempurna pada resolusi monitor desktop hingga layar tablet komersial.