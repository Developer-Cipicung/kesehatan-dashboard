# ARCHITECTURE.md

# Frontend Architecture

## Project

Pusat Pendataan Kesehatan Posyandu Cipicung

Frontend dibangun menggunakan React + Vite dengan arsitektur **Feature-Based Architecture**.

---

# Technology Stack

| Category | Technology |
|----------|------------|
| Framework | React 18 + Vite |
| Language | TypeScript (strict) |
| Routing | React Router DOM v6 |
| Server State | TanStack Query v5 |
| Client State | useState / Zustand (minimal) |
| Forms | React Hook Form + Zod |
| HTTP Client | Axios (via `src/services/api.ts`) |
| UI Library | shadcn/ui (Radix UI primitives) |
| Styling | Tailwind CSS + CSS Variables |
| Notifications | Sonner (toast) |
| Export | jsPDF + jspdf-autotable (PDF), ExcelJS (Excel) |
| Deployment | Vercel (SPA) |

---

# High Level Architecture

```text
Browser
  ↓
React Application (Vite SPA)
  ↓
React Router → Layout (DashboardLayout / AdminLayout / AuthLayout)
  ↓
Feature Module (warga, pemeriksaan, reports, dashboard, admin, auth)
  ↓
Feature Hook (TanStack Query / useMutation)
  ↓
Feature Service (Axios calls)
  ↓
Backend REST API (kesehatan-API)
  ↓
Database (PostgreSQL via Supabase)
```

Frontend **tidak pernah** berkomunikasi langsung dengan database.

---

# Folder Structure (Actual)

```text
src/
├── components/
│   ├── ui/                 ← shadcn/ui primitives (button, dialog, card, dll.)
│   ├── common/             ← DatePicker, SearchInput, NumberInput
│   ├── forms/              ← FormField (wrapper RHF + shadcn)
│   ├── tables/             ← DataTable
│   ├── cards/              ← StatisticCard
│   ├── dialogs/            ← ConfirmDialog
│   └── feedback/           ← EmptyState, ErrorState, LoadingSkeleton
│
├── features/
│   ├── auth/               ← Login
│   ├── dashboard/          ← DashboardPage, useDashboardStats
│   ├── warga/              ← SharedPatientList, PatientTable, PatientCard,
│   │                           AddPatientDialog, ImunisasiCell
│   │                           useWarga, useImunisasi
│   │                           wargaService, imunisasiService
│   ├── pemeriksaan/        ← PatientHistoryPage, HistoryTimeline,
│   │                           PatientProfileCard, MonthlyRecordForm
│   │                           usePemeriksaan
│   │                           pemeriksaanService
│   ├── pendataan/          ← usePendataanBulanan
│   ├── reports/            ← ReportPage, MonthlyReportTable, ExportActions
│   │                           exportPdf.ts, exportExcel.ts
│   └── admin/              ← AdminDashboardPage, PosyanduManagementPage,
│                               UserManagementPage, AdminStatusPendataanPage
│
├── layouts/
│   ├── DashboardLayout.tsx ← Layout utama kader
│   ├── AdminLayout.tsx     ← Layout admin
│   ├── AuthLayout.tsx      ← Layout login
│   ├── Sidebar.tsx
│   ├── Header.tsx
│   └── PosyanduSelector.tsx
│
├── routes/
│   ├── index.tsx           ← Seluruh routing definisi
│   └── ProtectedRoute.tsx
│
├── services/
│   └── api.ts              ← Axios instance (base URL, interceptors)
│
├── App.tsx
└── main.tsx
```

---

# Routing (Actual)

```text
/login                          ← Public (AuthLayout)
/                               ← Protected (DashboardLayout)
  /                             ← DashboardPage (index)
  /bumil                        ← SharedPatientList kategori="bumil"
  /pasca-persalinan             ← SharedPatientList kategori="pasca_persalinan"
  /baduta                       ← SharedPatientList kategori="baduta"
  /balita                       ← SharedPatientList kategori="balita"
  /lansia                       ← SharedPatientList kategori="lansia"
  /laporan                      ← ReportPage
  /status-pendataan             ← AdminStatusPendataanPage (kader view)
  /:kategori/:id                ← PatientHistoryPage (detail + riwayat)

/admin                          ← Protected Admin (AdminLayout)
  /admin                        ← AdminDashboardPage (index)
  /admin/status-pendataan       ← AdminStatusPendataanPage (admin view)
  /admin/posyandu               ← PosyanduManagementPage
  /admin/users                  ← UserManagementPage
```

**Catatan penting:** Routing aktual menggunakan flat path (`/bumil`, `/balita`) bukan nested (`/ibu/hamil`, `/anak/batita`) seperti dokumen lama. Dokumentasi lama sudah tidak relevan.

---

# Feature: Warga & Pemeriksaan

## SharedPatientList

Komponen tunggal yang melayani semua kategori warga (bumil, baduta, balita, lansia, pasca_persalinan). Menerima props `title` dan `kategori`.

Di dalamnya terdapat:
- **PatientTable** — tampilan desktop (tabel dengan kolom per kategori)
- **PatientCard** — tampilan mobile (card per warga)
- **AddPatientDialog** — dialog tambah warga baru
- **ImunisasiCell** — kelola imunisasi balita/baduta langsung di tabel

---

## PatientHistoryPage (`/:kategori/:id`)

Halaman detail warga. Menampilkan:
- **PatientProfileCard** — informasi identitas warga + riwayat imunisasi (untuk balita/baduta)
- **HistoryTimeline** — daftar seluruh riwayat pemeriksaan
- **MonthlyRecordForm** — dialog edit/tambah pemeriksaan (field dinamis per kategori)

---

## ImunisasiCell

Komponen yang tampil di PatientTable dan PatientCard untuk menampilkan dan mengelola imunisasi balita/baduta.

- Menampilkan chip/pill per vaksin
- Tombol X (merah, terpisah) untuk hapus
- Input teks manual untuk tambah vaksin baru (tekan Enter atau klik +)

---

# Feature: Reports

## ReportPage (`/laporan`)

- Filter berdasarkan Posyandu (Saya / Semua)
- Filter berdasarkan kategori warga
- **MonthlyReportTable** — tabel rekap bulan berjalan dengan kolom imunisasi untuk balita/baduta
- **ExportActions** — tombol Download PDF dan Download Excel
- Export PDF menggunakan jsPDF + autotable
- Export Excel menggunakan ExcelJS + file-saver

---

# Feature: Admin

- **AdminDashboardPage** — statistik global semua posyandu
- **AdminStatusPendataanPage** — status pendataan semua posyandu per bulan/tahun
- **PosyanduManagementPage** — CRUD posyandu
- **UserManagementPage** — CRUD user + assign posyandu + ubah role

---

# State Management

## Server State → TanStack Query

Semua data dari API dikelola via custom hooks menggunakan `useQuery` dan `useMutation`.

Contoh hooks:
- `useGetWargaList`, `useAddWarga`, `useUpdateWarga`
- `useGetPemeriksaanList`, `useUpdatePemeriksaan`, `useDeletePemeriksaan`
- `useGetImunisasiByWarga`, `useCreateImunisasi`, `useDeleteImunisasi`
- `useDashboardStats`
- `useGetPendataanGlobalStatus`, `useSubmitPendataan`

## Client State → useState

Digunakan untuk: dialog open/close, filter aktif, form state lokal.

Tidak menggunakan Zustand secara aktif — auth state dikelola via Supabase session.

---

# Authorization

## Kader / Bidan

- Akses: Dashboard, Pemeriksaan semua kategori, Riwayat, Laporan, Status Pendataan.
- Dibatasi pada data Posyandu sendiri.

## Admin

- Akses: Admin Dashboard, CRUD Posyandu, CRUD User, Status Pendataan semua Posyandu.
- Tidak mengakses pendataan kesehatan langsung.

---

# Form Strategy

Semua form menggunakan **React Hook Form + Zod**:
- `AddPatientDialog` — tambah warga baru
- `MonthlyRecordForm` — edit pemeriksaan (field dinamis per kategori)
- Form admin (posyandu, user)

`FormField` di `src/components/forms/FormField.tsx` adalah wrapper reusable yang menerima `label: ReactNode | string`.

---

# Export

- `exportWargaToPdf(...)` di `features/reports/utils/exportPdf.ts`
- `exportWargaToExcel(...)` di `features/reports/utils/exportExcel.ts`
- Kolom export dinamis berdasarkan `kategoriFilter`
- Kolom Imunisasi untuk balita/baduta menampilkan semua vaksin dipisahkan koma

---

# Design Principles

- Mobile First
- Responsive (PatientTable di desktop, PatientCard di mobile)
- Component Reusability
- Feature Isolation
- Strict TypeScript
- Backend sebagai Single Source of Truth

---

# AI Development Rules

AI wajib:
- Mengikuti struktur folder yang sudah ada
- Tidak membuat folder baru tanpa alasan
- Menggunakan reusable component (cek `components/` terlebih dahulu)
- Tidak mengubah arsitektur tanpa dokumentasi
- Mengupdate dokumentasi jika arsitektur berubah
- Menyelesaikan satu task setiap iterasi

---

# Implemented Features

- ✅ Login (Supabase Auth)
- ✅ Dashboard (statistik + aktivitas terbaru)
- ✅ Daftar warga per kategori (balita, baduta, bumil, lansia, pasca_persalinan)
- ✅ Tambah warga baru
- ✅ Edit data warga
- ✅ Riwayat pemeriksaan per warga (dengan edit/hapus)
- ✅ Imunisasi balita/baduta (tambah, hapus, tampil di tabel dan profil)
- ✅ Pendataan bulanan (status + submit selesai)
- ✅ Laporan & rekap bulanan (tabel + export PDF + export Excel)
- ✅ Admin: CRUD Posyandu, CRUD User, Status Pendataan

---

# Future Improvements

- Notifikasi real-time
- Calendar view pendataan
- Grafik perkembangan BB/TB per anak
- PWA / offline support