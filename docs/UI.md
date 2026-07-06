# DESIGN_SYSTEM.md

# Design System

Frontend Pusat Pendataan Kesehatan Posyandu Cipicung menggunakan **Design System tunggal**.

Seluruh halaman wajib mengikuti dokumen ini.

Tujuan:

- Konsisten
- Mudah dipelihara
- Reusable
- Mobile First
- Mudah dikembangkan AI

---

# Design Principles

UI harus memiliki karakteristik berikut:

- Bersih
- Minimalis
- Profesional
- Mudah dibaca
- Cepat digunakan kader Posyandu
- Tidak banyak animasi
- Fokus pada data

Target utama adalah pengguna yang **bukan orang IT**, sehingga seluruh navigasi harus sederhana.

---

# Theme

Project hanya memiliki **Light Theme**.

Dark Mode tidak diimplementasikan.

---

# Color System

Seluruh warna berasal dari:

```

src/app.css

```

Tidak boleh hardcode warna.

---

## Primary

Digunakan untuk:

- Button utama
- Link aktif
- Sidebar aktif
- Icon aktif

---

## Secondary

Digunakan untuk:

- Card
- Section
- Hover ringan

---

## Success

Digunakan untuk:

- Toast berhasil
- Badge sukses
- Export berhasil

---

## Warning

Digunakan untuk:

- Konfirmasi
- Draft
- Perhatian

---

## Danger

Digunakan untuk:

- Delete
- Error
- Validation

---

## Background

Digunakan untuk:

Background aplikasi.

---

## Card

Digunakan untuk:

Semua Card.

---

## Sidebar

Digunakan untuk:

Background Sidebar.

---

## Border

Semua border menggunakan warna yang sama.

Tidak membuat border berwarna-warni.

---

# CSS Variables

Minimal memiliki:

```css
:root {

--primary

--primary-hover

--secondary

--success

--warning

--danger

--background

--card

--sidebar

--border

--text-primary

--text-secondary

--radius

}
```

AI tidak boleh membuat variable baru tanpa alasan.

---

# Typography

Menggunakan satu font.

Contoh:

```
Inter
```

atau

```
Geist
```

Tidak mencampur banyak font.

---

## Heading

```
H1

Dashboard
```

---

```
H2

Judul Halaman
```

---

```
H3

Section
```

---

## Body

Digunakan untuk:

Isi tabel

Label

Form

---

## Caption

Digunakan untuk:

Tanggal

Keterangan kecil

---

# Spacing

Gunakan skala konsisten.

```
4

8

12

16

20

24

32

40

48
```

Tidak menggunakan spacing acak.

---

# Border Radius

Gunakan radius yang sama.

Misalnya

```
12px
```

atau

```
16px
```

Jangan mencampur banyak radius.

---

# Shadow

Gunakan maksimal dua jenis.

```
Card

Modal
```

Tidak membuat shadow berlebihan.

---

# Icon

Seluruh icon menggunakan:

Lucide React.

Ukuran konsisten.

---

# Button

Jenis button.

## Primary

Aksi utama.

Misalnya:

```
Simpan

Login

Tambah Data
```

---

## Secondary

Aksi kedua.

```
Batal
```

---

## Ghost

Toolbar.

---

## Danger

Delete.

---

## Disabled

Button harus terlihat nonaktif.

---

## Loading

Button berubah menjadi loading saat request berlangsung.

---

# Form

Seluruh form memiliki:

- Label
- Placeholder
- Helper Text bila perlu
- Error Message

Urutan.

```
Label

↓

Input

↓

Error
```

---

# Input

Semua input memiliki tinggi yang sama.

Tidak membuat ukuran berbeda.

---

# Select

Menggunakan component yang sama.

---

# Date Picker

Seluruh tanggal menggunakan component yang sama.

Tidak boleh membuat date picker berbeda.

---

# Text Area

Digunakan hanya jika benar-benar diperlukan.

---

# Table

Seluruh halaman data menggunakan DataTable.

Karakteristik:

- Responsive
- Horizontal Scroll jika diperlukan
- Sticky Header
- Search
- Pagination
- Empty State

---

# Search

Search selalu berada di kiri atas tabel.

Placeholder.

```
Cari nama atau NIK...
```

---

# Pagination

Selalu berada di kanan bawah.

---

# Card

Semua card memiliki:

- Padding sama
- Radius sama
- Shadow sama

---

# Statistic Card

Dashboard menggunakan satu jenis card statistik.

Berisi:

- Icon
- Judul
- Nilai

---

# Badge

Digunakan untuk:

- Draft
- Verified

Status kesehatan belum digunakan.

---

# Dialog

Digunakan untuk:

- Konfirmasi
- Delete
- Submit Pendataan

Semua dialog menggunakan component yang sama.

---

# Toast

Menggunakan Sonner.

Jenis:

Success

Warning

Error

Info

Tidak menggunakan alert().

---

# Empty State

Jika data kosong.

Tampilkan:

- Ilustrasi
- Judul
- Deskripsi
- Button bila diperlukan

Jangan menampilkan tabel kosong.

---

# Loading

Loading menggunakan:

Skeleton.

Spinner hanya untuk:

Button.

---

# Error State

Jika request gagal.

Tampilkan:

- Icon
- Pesan
- Retry Button

---

# Sidebar

Sidebar memiliki:

- Logo
- Menu
- Collapse pada mobile

Menu aktif harus memiliki highlight.

---

# Header

Header berisi:

- Nama halaman
- Profil User

Tidak terlalu banyak informasi.

---

# Mobile First

Target utama aplikasi adalah smartphone.

Layout harus dibuat mulai dari layar kecil.

Kemudian berkembang ke:

Tablet

↓

Desktop

---

# Responsive Rules

Mobile

Sidebar menjadi drawer.

---

Tablet

Sidebar dapat collapse.

---

Desktop

Sidebar tetap.

---

# Animation

Gunakan animasi ringan.

Misalnya:

- Dialog
- Dropdown
- Toast

Tidak membuat animasi yang mengganggu.

---

# Accessibility

Minimal memenuhi:

- Keyboard Navigation
- Focus Ring
- Label Input
- Color Contrast

---

# Consistency Rules

AI wajib:

- Menggunakan component yang sama.
- Menggunakan spacing yang sama.
- Menggunakan typography yang sama.
- Menggunakan warna dari app.css.
- Tidak membuat style inline.

---

# Don't

AI tidak boleh:

❌ Hardcode warna

❌ Hardcode radius

❌ Hardcode shadow

❌ Inline Style

❌ Membuat Button baru

❌ Membuat Table baru

❌ Membuat Modal baru

❌ Menggunakan icon selain Lucide

---

# Summary

Design System menjadi sumber utama seluruh tampilan aplikasi.

Seluruh UI harus:

- Mobile First
- Konsisten
- Reusable
- Menggunakan CSS Variable
- Menggunakan reusable component
- Mengikuti desain Figma yang telah disetujui.