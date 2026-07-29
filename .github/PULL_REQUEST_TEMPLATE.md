## Deskripsi Perubahan
Berikan ringkasan terperinci mengenai perubahan logika atau antarmuka yang Anda lakukan dalam Pull Request ini. Jelaskan juga motivasi dan konteks dari perubahan tersebut.

## Terkait dengan Issue
Tautkan nomor Issue yang diselesaikan oleh Pull Request ini.
Tutup # [Nomor Issue]

## Jenis Perubahan
Beri tanda 'x' pada kurung siku yang sesuai dengan jenis pembaruan Anda:
- [ ] Kutu / Bugfix (Perbaikan masalah yang tidak mengganggu fungsionalitas lain)
- [ ] Fitur Baru (Penambahan fungsionalitas sistem)
- [ ] Perubahan Kritis / Breaking Change (Perbaikan atau fitur yang mengharuskan pembaruan konfigurasi sistem/basis data)
- [ ] Pembaruan Dokumentasi (Perubahan pada README, PRD, atau komentar kode)

## Daftar Periksa (Checklist) Keamanan & Standar
Sebelum meminta tinjauan kode (Code Review), pastikan Anda telah memenuhi hal berikut:
- [ ] Saya telah membaca dan mematuhi `CONTRIBUTING.md`.
- [ ] Kode saya telah mengikuti standar linting (ESLint/Prettier) dari proyek ini.
- [ ] Saya telah melakukan pengujian lokal dan memastikan perubahan ini tidak merusak integrasi Pialang MQTT atau perutean Next.js.
- [ ] Variabel lingkungan (.env) rahasia tidak ikut terunggah dalam komit ini.
- [ ] Skema Basis Data (Prisma) atau Skema Validasi (Zod) telah diperbarui jika ada perubahan struktur muatan (payload) IoT.

## Tangkapan Layar (Jika ada perubahan UI)
Lampirkan perbandingan antarmuka sebelum dan sesudah perubahan dilakukan.