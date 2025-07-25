
# Auto Generate Affiliate Konten

Aplikasi web yang dibuat oleh **Iqbalzcodets** untuk secara otomatis menghasilkan satu set lengkap materi konten pemasaran afiliasi yang dioptimalkan untuk platform media sosial berbasis video pendek. Cukup berikan informasi produk (melalui teks, gambar, URL, atau kamera), dan AI akan membuat semua yang Anda butuhkan untuk kampanye yang sukses.

Aplikasi ini ditenagai oleh Google Gemini API.

![App Screenshot](https://i.ibb.co/L95GvWx/image.png)

## ✨ Fitur Utama

- **Input Multi-Sumber**: Dapatkan informasi produk dengan mengetikkan nama, mengunggah gambar, menempelkan URL web, atau menggunakan kamera perangkat Anda.
- **Generator Konten Komprehensif**: Menghasilkan:
    - Caption Postingan yang Menarik
    - Narasi Subtitle & Voice-Over
    - Hashtag yang Relevan & Sedang Tren
    - Beberapa Opsi Judul Thumbnail yang Clickbait
    - Saran Teks Overlay untuk Video
    - Beberapa Opsi Hook Video (3 detik pertama)
    - Narasi Problem-Solution yang Kuat
    - Call to Action (CTA) yang Mendesak
    - Rekomendasi Musik/Sound yang Sedang Tren
- **Kustomisasi Tingkat Lanjut**: Sesuaikan output dengan memilih:
    - Berbagai Gaya Bahasa (Santai, Profesional, Persuasif, dll.)
    - Gaya Bahasa Voice-Over yang Berbeda (termasuk Storytelling Humor)
    - Target Durasi Video (15 hingga 60 detik)
- **Desain Modern & Responsif**: Antarmuka yang bersih dan dapat digunakan dengan nyaman di desktop, tablet, dan smartphone.
- **Tema Terang & Gelap**: Beralih antara mode terang dan gelap untuk kenyamanan visual.
- **Alat Praktis**:
    - Salin konten apa pun ke clipboard dengan satu klik.
    - Unduh setiap bagian konten atau seluruh hasil sebagai gambar JPG.

## 🚀 Teknologi yang Digunakan

- **Frontend**: React 19 (via CDN, tanpa build step)
- **Styling**: Tailwind CSS (via CDN)
- **Language**: TypeScript
- **AI**: Google Gemini API (`@google/genai`)
- **Icons**: Heroicons

## Local Development Setup

Proyek ini dirancang untuk berjalan tanpa langkah build yang rumit. Namun, untuk menangani variabel lingkungan (API Key) dengan aman, direkomendasikan untuk menggunakan server pengembangan seperti Vite.

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS version)
- Kode editor seperti [Visual Studio Code](https://code.visualstudio.com/)

### Langkah-langkah Instalasi

1.  **Clone repositori:**
    ```bash
    git clone https://github.com/YOUR_USERNAME/auto-generate-affiliate-konten.git
    cd auto-generate-affiliate-konten
    ```

2.  **Dapatkan Google Gemini API Key:**
    - Buka [Google AI Studio](https://aistudio.google.com/).
    - Klik **"Get API key"** dan buat kunci API baru.
    - Salin API key Anda.

3.  **Siapkan Variabel Lingkungan:**
    - Buat file baru di direktori root proyek bernama `.env`.
    - Tambahkan API key Anda ke file `.env` seperti ini:
      ```
      VITE_API_KEY=PASTE_YOUR_GEMINI_API_KEY_HERE
      ```
    *(Catatan: Vite memerlukan prefix `VITE_` agar variabel dapat diakses di sisi klien).*

4.  **Ubah Kode untuk Menggunakan `VITE_API_KEY`:**
    - Karena proyek ini awalnya menggunakan `process.env.API_KEY`, Anda perlu melakukan sedikit penyesuaian agar kompatibel dengan Vite.
    - Buka file `services/geminiService.ts`.
    - Ganti baris ini:
      ```typescript
      const API_KEY = process.env.API_KEY;
      ```
    - Dengan baris ini:
      ```typescript
      const API_KEY = import.meta.env.VITE_API_KEY;
      ```

5.  **Install dependensi dan jalankan server (menggunakan Vite):**
    - Proyek ini tidak memiliki `package.json`, jadi kita akan membuatnya dengan Vite.
    - Inisialisasi proyek Node:
      ```bash
      npm init -y
      ```
    - Tambahkan Vite sebagai dependensi pengembangan:
      ```bash
      npm install --save-dev vite
      ```
    - Tambahkan skrip ke `package.json` Anda:
      ```json
      "scripts": {
        "dev": "vite",
        "build": "vite build",
        "preview": "vite preview"
      },
      ```
    - Jalankan server pengembangan:
      ```bash
      npm run dev
      ```
    - Buka browser Anda dan navigasikan ke `http://localhost:5173` (atau alamat yang ditampilkan di terminal).

## 📝 Cara Menggunakan Aplikasi

1.  **Pilih Sumber Informasi**: Pilih salah satu tab: Ketik Nama Produk, Upload Gambar, URL Web, atau Kamera.
2.  **Masukkan Data & Cari**: Isi input yang sesuai (ketik nama, unggah gambar, dll.). Setelah itu, klik tombol **"Cari Informasi Produk"** untuk memulai. AI akan mencari detail produk, termasuk nomor BPOM jika relevan.
3.  **Atur Preferensi**: Setelah informasi produk ditemukan, atur preferensi konten seperti Gaya Bahasa, Jenis Hook, dan Durasi Video.
4.  **Generate Konten**: Klik tombol **"Generate Konten Afiliasi"**.
5.  **Gunakan Hasilnya**: Review konten yang dihasilkan. Anda dapat menyalin teks ke clipboard atau mengunduhnya sebagai gambar JPG untuk referensi di masa mendatang.

---

Dibuat dengan ❤️ oleh **Iqbalzcodets**.