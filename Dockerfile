# Menggunakan base image node versi terbaru
FROM node:latest

# Menjalankan perintah apt-get update dan menginstal paket-paket yang diperlukan
RUN apt-get update && apt-get install -y \
    ffmpeg \
    python \
 && rm -rf /var/lib/apt/lists/*

# Menginstal speedtest-cli menggunakan pip
RUN pip install speedtest-cli

# Menyalin file package.json dan package-lock.json untuk instalasi dependensi Node.js
COPY package*.json ./

# Menginstal dependensi Node.js
RUN npm install

# Menyalin seluruh kode aplikasi ke dalam image Docker
COPY . .

# Menjalankan perintah npm run start untuk menjalankan aplikasi
CMD ["npm", "run", "start"]
