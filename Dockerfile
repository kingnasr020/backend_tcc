# Gunakan image Node.js versi 20
FROM node:20

# Buat direktori kerja di dalam kontainer
WORKDIR /usr/src/app

# Salin file konfigurasi npm terlebih dahulu
COPY package*.json ./

# Install dependencies (sekarang hanya akan menginstal mysql2, express, dll)
RUN npm install

# Salin seluruh sisa kode sumber aplikasi
COPY . .

# Ekspos port 8080 yang digunakan oleh Cloud Run
EXPOSE 8080

# Perintah untuk menjalankan aplikasi
CMD ["npm", "start"]