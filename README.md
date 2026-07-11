# Posyandu Digital Dashboard (Frontend)

Dashboard interaktif untuk Sistem Digitalisasi Posyandu. Proyek ini dibangun menggunakan **React**, **TypeScript**, dan **Vite**, serta dirancang dengan pendekatan **Mobile-First UX** untuk memudahkan kader di lapangan.

## 🚀 Fitur Utama

- **One-Stop Action Center**: Kader dapat langsung mencari pasien secara global dari halaman beranda (Dashboard) dengan pendeteksian kategori otomatis (Balita, Lansia, Bumil, Pasca Salin) dan langsung membuka *form pop-up* pemeriksaan tanpa berpindah halaman.
- **Buku Register Read-Only**: Halaman daftar pasien dikunci (*read-only*) untuk mencegah kesalahan input (*typo*) secara tidak sengaja saat melakukan *scrolling* di HP, dengan tombol khusus `[Tambah Catatan]` dan `[Profil Lengkap]` di setiap baris.
- **Mobile-Responsive UI**: Form input dan tabel dioptimasi menggunakan `Tailwind CSS` dan `shadcn/ui` agar tampil sempurna di *smartphone*.
- **State Management**: Menggunakan Zustand untuk pengaturan autentikasi.
- **Data Fetching & Caching**: Menggunakan React Query (`@tanstack/react-query`) untuk manajemen *cache* yang cepat dan efisien.

## 📋 Struktur Aplikasi

- `/src/features` — Modularisasi fitur per ranah (warga, pemeriksaan, pendataan, dashboard).
- `/src/components` — Komponen UI re-usable (berbasis shadcn).
- `/src/layouts` — Layout navigasi (Sidebar, Header, SpeedDial).
- `/src/stores` — State management global (Zustand).
- `/src/services` — Integrasi dengan API Axios.

## 🛠 Teknologi

- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM v6
- **UI Components**: Radix UI + shadcn/ui
- **Icons**: Lucide React

## 📦 Instalasi

1. Clone repositori ini.
2. Pindah ke direktori frontend:
   ```bash
   cd kesehatan-dashboard
   ```
3. Install dependensi:
   ```bash
   npm install
   ```
4. Sesuaikan variabel di dalam `.env`:
   ```env
   VITE_API_URL=http://localhost:3000/api/v1
   ```

## 🚀 Menjalankan Server

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

## 🌐 Deploy ke Vercel

Dashboard ini sudah siap deploy ke Vercel sebagai *single-page application*.

- **Build command**: `npm run build`
- **Output directory**: `dist`
- **Environment variable wajib**: `VITE_API_URL` (arahkan ke URL backend production Anda)

File `vercel.json` telah disertakan untuk menambahkan mekanisme *rewrite* agar route React Router (seperti `/login`, `/admin`, `/warga/123`) tetap dapat diakses secara langsung (*direct access*) saat halamannya di-*refresh*.
