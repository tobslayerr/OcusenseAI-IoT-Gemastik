# Tahap Basis
FROM node:18-alpine AS base
WORKDIR /app

# Tahap Instalasi Dependensi (Draf)
FROM base AS deps
COPY package.json package-lock.json* ./
# Perintah instalasi akan disisipkan di sini pada tahap eksekusi kode

# Tahap Pembangunan Aplikasi
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Perintah Prisma Generate dan Next Build akan disisipkan di sini

# Tahap Lingkungan Produksi
FROM base AS runner
ENV NODE_ENV production
# Pengaturan port dan eksekusi peladen node akan disisipkan di sini