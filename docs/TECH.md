# TECH_STACK.md

# Technology Stack

Project Frontend Pusat Pendataan Kesehatan Posyandu Cipicung dibangun menggunakan modern React ecosystem.

Pemilihan library telah dipertimbangkan berdasarkan:

- Maintainability
- Scalability
- Performance
- Type Safety
- Reusability
- AI-Friendly Development

AI Agent tidak diperbolehkan mengganti technology stack tanpa persetujuan.

---

# Core Framework

## React

Versi:

Latest Stable

Alasan:

- Component Based
- Ecosystem besar
- Mudah dipelihara
- Mendukung reusable UI
- Sangat cocok untuk SPA

---

## TypeScript

Mode:

Strict

Tidak diperbolehkan menggunakan:

```
any
```

kecuali benar-benar tidak dapat dihindari.

Seluruh interface harus didefinisikan.

---

## Vite

Digunakan sebagai build tool.

Alasan:

- Fast HMR
- Startup cepat
- Build ringan
- Konfigurasi sederhana

---

# Styling

## Tailwind CSS

Digunakan sebagai utility CSS.

Namun Tailwind **bukan sumber utama warna**.

Seluruh warna berasal dari:

```
app.css
```

Tailwind hanya digunakan untuk:

- spacing
- flex
- grid
- typography
- responsive
- positioning

Tidak boleh hardcode:

```
bg-blue-500

text-red-600

bg-green-500
```

Gunakan CSS Variable.

---

## CSS Variables

Seluruh design token disimpan pada

```
app.css
```

Contoh

```css
:root {

--primary

--secondary

--background

--card

--sidebar

--danger

--warning

--success

--text-primary

--text-secondary

--border

--radius

}
```

AI wajib menggunakan variable tersebut.

---

# UI Components

## shadcn/ui

Digunakan sebagai base component.

Contoh:

- Button
- Dialog
- Dropdown
- Select
- Table
- Popover
- Sheet
- Tabs
- Card

Jika component tersedia di shadcn,

AI wajib menggunakannya.

---

## Lucide React

Seluruh icon menggunakan:

Lucide React

Tidak diperbolehkan menggunakan icon library lain.

---

# Routing

## React Router

Menggunakan:

React Router DOM

Semua halaman menggunakan nested routing.

Tidak boleh menggunakan routing manual.

---

# HTTP Client

## Axios

Seluruh komunikasi backend menggunakan Axios.

Dilarang menggunakan:

```
fetch()
```

langsung di component.

Seluruh request berada pada:

```
services/
```

---

# Server State

## TanStack Query

Digunakan untuk:

- Dashboard
- Daftar Warga
- Pemeriksaan
- Riwayat
- Rekapitulasi
- Posyandu
- User

Keuntungan:

- Cache
- Retry
- Loading
- Refetch
- Mutation
- Invalidation

AI wajib menggunakan Query.

Tidak boleh menggunakan useEffect untuk fetch API.

---

# Client State

## Zustand

Digunakan hanya untuk state global.

Contoh:

```
Auth

Sidebar

User

Selected Posyandu

Theme

Global Filter
```

Tidak digunakan untuk menyimpan data API.

---

# Form

## React Hook Form

Seluruh form menggunakan:

React Hook Form

Tidak diperbolehkan menggunakan useState untuk form besar.

---

## Zod

Seluruh validasi form menggunakan:

Zod

Tidak diperbolehkan membuat validasi manual apabila dapat dibuat menggunakan schema.

Contoh:

```
Login

Input Warga

Pemeriksaan

Super Admin

Posyandu
```

---

# Notification

## Sonner

Digunakan untuk:

Toast Notification

Contoh:

```
Berhasil menyimpan

Gagal login

Pendataan selesai

Export berhasil
```

Tidak menggunakan alert browser.

---

# Table

Menggunakan:

shadcn Table

atau reusable DataTable.

Tidak membuat tabel sendiri di setiap halaman.

---

# Chart

Menggunakan:

Recharts

Untuk:

- Dashboard
- Statistik
- Rekapitulasi

Tidak menggunakan Chart.js kecuali benar-benar diperlukan.

---

# Date Handling

Menggunakan:

date-fns

Untuk:

- format tanggal
- parsing
- manipulasi bulan

Tidak menggunakan Moment.js.

---

# Class Utilities

Menggunakan:

```
clsx

tailwind-merge
```

Untuk merge className.

---

# Environment Variables

Menggunakan:

```
VITE_API_URL
```

Seluruh endpoint berasal dari variable tersebut.

Tidak boleh hardcode URL.

---

# Folder Convention

```
components/

features/

hooks/

layouts/

services/

stores/

types/

utils/
```

AI tidak boleh membuat folder baru tanpa alasan kuat.

---

# Code Style

Seluruh project menggunakan:

- ESLint
- Prettier

Rules:

- semicolon mengikuti konfigurasi project
- import terurut
- unused import dihapus
- no any
- no console.log di production

---

# Responsive Design

Target utama:

✅ Mobile

Didukung:

- Tablet
- Desktop

Seluruh halaman wajib mobile-first.

---

# Browser Support

Mendukung:

- Chrome
- Edge
- Firefox
- Safari

Versi modern.

Tidak mendukung Internet Explorer.

---

# Performance

Gunakan:

- Lazy Route
- React.lazy
- Suspense
- Memo bila diperlukan

Hindari re-render yang tidak perlu.

---

# Accessibility

Minimal memenuhi:

- Label pada input
- Keyboard navigation
- Focus state
- ARIA bila diperlukan
- Kontras warna memadai

---

# API Convention

Seluruh API melalui:

```
Axios Service

↓

TanStack Query

↓

Feature Hook

↓

Component
```

Component tidak boleh memanggil Axios secara langsung.

---

# Authentication

Menggunakan JWT dari backend.

Frontend hanya:

- Login
- Menyimpan token
- Logout
- Mengirim Authorization Header

Frontend tidak melakukan autentikasi sendiri.

---

# AI Development Rules

AI wajib:

- Menggunakan library yang telah ditentukan.
- Tidak mengganti stack.
- Tidak menambah dependency tanpa alasan.
- Mengutamakan reusable component.
- Mengikuti seluruh dokumentasi project.

---

# Summary

| Kebutuhan | Library |
|-----------|----------|
| Framework | React |
| Language | TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS + CSS Variables |
| UI Component | shadcn/ui |
| Routing | React Router |
| HTTP | Axios |
| Server State | TanStack Query |
| Client State | Zustand |
| Form | React Hook Form |
| Validation | Zod |
| Notification | Sonner |
| Icon | Lucide React |
| Date | date-fns |
| Chart | Recharts |
| Utility | clsx + tailwind-merge |