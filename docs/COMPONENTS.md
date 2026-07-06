# COMPONENTS.md

# Reusable Component Documentation

Seluruh UI pada project wajib dibangun menggunakan reusable component.

AI Agent wajib mencari reusable component terlebih dahulu sebelum membuat component baru.

Jika sebuah component dapat digunakan oleh minimal dua halaman, component tersebut harus dipindahkan ke folder:

```

src/components

```

Tidak diperbolehkan membuat duplicate component.

---

# Folder Structure

```
components/

ui/

layout/

forms/

tables/

cards/

dialogs/

feedback/

navigation/

charts/

common/

```

---

# Component Hierarchy

```
Primitive UI

↓

Reusable Component

↓

Feature Component

↓

Page

```

Contoh

```
Button

↓

SearchInput

↓

PatientToolbar

↓

BumilPage
```

---

# Primitive Components

Primitive adalah komponen dasar yang tidak memiliki business logic.

## Button

Digunakan pada seluruh aplikasi.

Variant:

```
Primary

Secondary

Outline

Ghost

Danger

Success

```

Props

```
children

variant

size

loading

disabled

onClick

type

```

Tidak diperbolehkan membuat button baru.

---

## Input

Digunakan untuk seluruh text input.

Props

```
label

placeholder

error

disabled

required

```

---

## NumberInput

Untuk:

- Berat badan
- Tinggi badan
- Gula darah
- Tekanan darah

Harus otomatis menerima angka.

---

## DatePicker

Seluruh tanggal menggunakan component ini.

Tidak boleh menggunakan input type=date secara langsung.

---

## TextArea

Digunakan untuk:

- Keluhan
- Catatan

---

## Select

Digunakan untuk:

- Dropdown
- Status
- Pilihan

---

## Checkbox

Digunakan bila diperlukan.

---

## RadioGroup

Digunakan bila diperlukan.

---

# Layout Components

## Sidebar

Berisi:

- Logo
- Navigation
- User

Responsif.

Mobile menjadi drawer.

---

## Header

Berisi

- Judul Halaman

- Breadcrumb

- User Menu

---

## DashboardLayout

Layout utama kader.

---

## SuperAdminLayout

Layout admin.

---

## AuthLayout

Layout login.

---

# Navigation Components

## SidebarItem

Digunakan untuk seluruh menu.

---

## Breadcrumb

Seluruh halaman menggunakan component yang sama.

---

## UserDropdown

Dropdown profile.

---

# Table Components

## DataTable

Component paling penting.

Digunakan oleh:

- Bumil
- Pasca Persalinan
- Calon Menikah
- Lansia
- Batita
- Balita
- Anak Sekolah
- Posyandu
- User

Props

```
columns

data

loading

pagination

search

emptyState

```

---

## TableToolbar

Berisi

Search

Tambah Data

Filter (future)

Export

---

## TablePagination

Reusable.

---

## SearchInput

Placeholder

```
Cari nama atau NIK...
```

---

# Card Components

## Card

Base card.

---

## StatisticCard

Dashboard.

Isi

```
Icon

Title

Value

```

---

## PatientCard

Digunakan untuk mobile view.

Karena tabel kurang nyaman di layar kecil.

Berisi

Nama

NIK

Aksi

---

# Dialog Components

## ConfirmDialog

Digunakan untuk:

Delete

Submit Pendataan

Logout

---

## PatientDialog

Tambah pasien.

---

## PosyanduDialog

CRUD Posyandu.

---

## UserDialog

CRUD User.

---

# Form Components

## FormField

Wrapper.

Berisi

```
Label

Input

Error

```

---

## FormSection

Mengelompokkan beberapa field.

Misalnya

```
Data Kehamilan

↓

Usia Kehamilan

↓

HPHT

↓

HTP

```

---

# History Components

## HistoryTable

Menampilkan seluruh riwayat pemeriksaan.

---

## HistoryTimeline

Future.

Belum digunakan.

---

# Dashboard Components

## ActivityCard

Aktivitas terbaru.

---

## ChartCard

Membungkus grafik.

---

## SummaryCard

Jumlah warga.

---

# Feedback Components

## LoadingScreen

Loading halaman.

---

## SkeletonTable

Loading tabel.

---

## EmptyState

Jika data kosong.

---

## ErrorState

Jika request gagal.

---

## Toast

Menggunakan Sonner.

Tidak membuat toast sendiri.

---

# Export Components

## ExportButton

Membuka pilihan

PDF

Excel

---

# Authentication Components

## LoginForm

Form login kader.

---

## AdminLoginForm

Form login admin.

---

# Business Components

## PatientToolbar

Berisi

Search

Tambah Pasien

---

## AddRecordButton

Button

```
Tambah Data
```

Muncul apabila pasien belum memiliki record pada bulan berjalan.

Klik

↓

Membuat record kosong

↓

Redirect ke halaman Riwayat.

---

## HistoryButton

Jika record bulan berjalan sudah ada.

Button berubah menjadi

```
Riwayat
```

Klik

↓

Masuk halaman Riwayat.

---

## SubmitMonthlyButton

Button

```
Selesai Pendataan Bulan Ini
```

Hanya muncul apabila status masih Draft.

Jika status Verified

↓

Hidden.

---

# Component Rules

Semua component harus:

- Reusable
- Typed
- Functional Component
- Tidak memiliki duplicate
- Tidak memiliki business logic berat

---

# Business Logic Placement

Component hanya menangani UI.

Business Logic berada pada:

```
features/

↓

hooks

↓

services

```

---

# Component Naming

Gunakan PascalCase.

Contoh

```
PatientTable

PatientCard

StatisticCard

AddRecordButton

```

Tidak menggunakan nama generik seperti

```
Table1

ButtonNew

Card2

```

---

# Props Rules

Props harus memiliki interface.

Contoh

```ts
interface ButtonProps {

children: ReactNode

variant: ButtonVariant

loading?: boolean

}
```

Tidak menggunakan any.

---

# Children Rules

Jika component dapat menggunakan children,

gunakan

```
ReactNode
```

---

# AI Development Rules

AI wajib:

- Menggunakan component yang sudah ada.
- Tidak membuat duplicate component.
- Memindahkan component reusable ke folder components.
- Tidak mencampur business logic.
- Menggunakan TypeScript Strict.

---

# Future Components

Disiapkan untuk pengembangan.

- NotificationCenter
- AuditTimeline
- HealthChart
- Calendar
- ReportPreview

Belum perlu diimplementasikan.

---

# Summary

Seluruh UI aplikasi dibangun dari reusable component.

AI wajib mengutamakan penggunaan component yang sudah tersedia dibanding membuat component baru.

Business Logic tidak boleh berada di reusable component.