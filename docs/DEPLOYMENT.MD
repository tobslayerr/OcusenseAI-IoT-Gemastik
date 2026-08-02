# Panduan Implementasi Ocusense AI

Dokumen ini memuat prosedur resmi untuk mengimplementasikan sistem Ocusense AI ke dalam lingkungan produksi, mencakup pialang MQTT, peladen web, dan konfigurasi perangkat keras fisik.

## Prasyarat Lingkungan
Sebelum memulai, pastikan infrastruktur berikut telah tersedia:
*   Peladen Jaringan (VPS atau Komputer Lokal) dengan Node.js (v18+) dan PostgreSQL terinstal.
*   Pialang MQTT (Eclipse Mosquitto) yang dikonfigurasi untuk menerima koneksi TCP (Port 1883) dan WebSockets (Port 9001).
*   Raspberry Pi 5 dengan sistem operasi Raspberry Pi OS (64-bit Lite disarankan).

---

## Fase 1: Implementasi Peladen Web & Basis Data (Next.js)

Langkah ini dilakukan pada komputer peladen atau instans komputasi awan.

1.  **Kloning Repositori & Instalasi Dependensi:**
    ```bash
    git clone [https://github.com/organisasi/ocusense-project.git](https://github.com/organisasi/ocusense-project.git)
    cd ocusense-project
    npm install
    ```

2.  **Konfigurasi Variabel Lingkungan:**
    Salin fail templat lingkungan dan sesuaikan nilainya.
    ```bash
    cp .env.example .env
    ```
    Pastikan `DATABASE_URL` mengarah ke instans PostgreSQL Anda, dan lengkapi kredensial `EMAIL_USER` serta `EMAIL_PASS` untuk fitur notifikasi.

3.  **Migrasi Basis Data:**
    Sinkronkan skema Prisma dengan PostgreSQL.
    ```bash
    npx prisma migrate dev --name init_ocusense
    ```

4.  **Kompilasi dan Eksekusi Produksi:**
    ```bash
    npm run build
    npm start
    ```

5.  **Aktivasi Layanan Pendengar MQTT:**
    Buka sesi terminal baru pada peladen yang sama untuk menjalankan daemon pendengar latar belakang.
    ```bash
    npm run listener
    ```

---

## Fase 2: Implementasi Perangkat Tepi (Raspberry Pi 5)

Langkah ini dilakukan langsung melalui terminal antarmuka Raspberry Pi 5.

1.  **Pembaruan Sistem dan Instalasi Dependensi Dasar:**
    ```bash
    sudo apt update && sudo apt upgrade -y
    sudo apt install python3-pip python3-venv libgl1-mesa-glx i2c-tools -y
    ```

2.  **Aktivasi Antarmuka Perangkat Keras:**
    Jalankan perintah konfigurasi untuk mengaktifkan modul Kamera (CSI) dan antarmuka I2C.
    ```bash
    sudo raspi-config
    # Pilih "Interface Options" -> Aktifkan "Camera" dan "I2C"
    # Lakukan reboot jika diminta.
    ```

3.  **Inisialisasi Lingkungan Virtual Python:**
    Direkomendasikan menggunakan lingkungan virtual untuk menghindari konflik dependensi.
    ```bash
    mkdir ocusense-edge
    cd ocusense-edge
    python3 -m venv ocusense-env
    source ocusense-env/bin/activate
    ```

4.  **Instalasi Pustaka Fisik dan Kecerdasan Buatan:**
    Sesuai panduan migrasi, instal seluruh modul yang dibutuhkan untuk perangkat fisik.
    ```bash
    pip install paho-mqtt opencv-python pi-ina219 Adafruit-SSD1306
    pip install ultralytics tensorflow
    ```

5.  **Persiapan Fail Eksekusi:**
    Salin fail `edge_node.py` ke dalam direktori saat ini. Unduh model praterlatih (`yolov8_katarak.pt` dan `cnn_frequentlynet.h5`) lalu letakkan pada direktori yang sama.

6.  **Migrasi Kode Python:**
    Buka `edge_node.py` menggunakan penyunting teks (misalnya `nano`).
    *   Hapus tanda pagar (`#`) pada blok **1** (Impor Pustaka).
    *   Ubah `MQTT_BROKER` pada blok **2** dengan alamat IP peladen Anda.
    *   Hapus tanda pagar (`#`) pada blok **3** (Inisialisasi Model & Perangkat I/O).
    *   Gantikan logika simulasi di blok **4** dengan pembacaan sensor tegangan `ina.voltage()`.
    *   Gantikan pembacaan gambar statis di blok **5** dengan alur tangkapan `cv2.VideoCapture` dan fungsi prediksi `model_yolo` serta `model_cnn`.

7.  **Eksekusi Sistem Pemindaian:**
    ```bash
    python edge_node.py
    ```
    Catat **KODE OTENTIKASI PERANGKAT (PIN)** yang muncul di layar terminal untuk melakukan jabat tangan (login) pada Dasbor Web.

    # Panduan Implementasi Ocusense AI

Dokumen ini memuat prosedur resmi untuk mengimplementasikan sistem Ocusense AI ke dalam lingkungan produksi. Implementasi dibagi menjadi dua fase utama: Peladen Pusat (menggunakan Docker) dan Perangkat Tepi (menggunakan lingkungan fisik).

---

## Fase 3: Implementasi Peladen Pusat (Dengan Docker)

Pendekatan ini menggunakan `docker-compose` untuk mengorkestrasi empat layanan sekaligus: Basis Data PostgreSQL, Pialang MQTT Eclipse Mosquitto, Aplikasi Web Next.js, dan Layanan Pendengar (Listener) MQTT.

### 3.1. Persiapan Struktur Direktori dan Berkas Konfigurasi

Pastikan Anda berada di direktori akar (root) proyek Ocusense Anda. Buat berkas-berkas berikut ini:

**A. Buat berkas `Dockerfile` di direktori akar:**
Berkas ini mendefinisikan citra kontainer untuk aplikasi Next.js dan layanan pendengar (listener).

```dockerfile
FROM node:18-alpine

# Menginstal OpenSSL yang dibutuhkan oleh mesin Prisma ORM
RUN apk add --no-cache openssl

WORKDIR /app

# Menyalin berkas dependensi dan melakukan instalasi
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci

# Menyalin seluruh kode sumber dan melakukan kompilasi
COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 3000

# Perintah bawaan, dapat ditimpa oleh docker-compose untuk layanan pendengar
CMD ["npm", "start"]