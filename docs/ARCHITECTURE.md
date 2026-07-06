# ARCHITECTURE.md

# Frontend Architecture

## Project

Pusat Pendataan Kesehatan Posyandu Cipicung

Frontend dibangun menggunakan React dengan arsitektur **Feature-Based Architecture**.

Tujuan utama arsitektur ini adalah:

- mudah dikembangkan
- scalable
- reusable
- mudah dipahami AI Agent
- mudah dipelihara developer

---

# High Level Architecture

```
Browser

↓

React Application

↓

React Router

↓

Layout

↓

Feature Module

↓

Reusable Components

↓

Service Layer

↓

Axios Client

↓

Backend API

↓

Database
```

Frontend **tidak pernah** berkomunikasi langsung dengan database.

Semua komunikasi dilakukan melalui Backend API.

---

# Design Principles

Frontend harus memenuhi prinsip berikut:

- Mobile First
- Responsive
- Component Reusability
- Feature Isolation
- Single Responsibility
- Separation of Concerns
- Strict Type Safety
- Predictable State
- Maintainable Structure

---

# Folder Structure

```
src/

│

├── app/

├── assets/

│

├── components/

│   ├── ui/

│   ├── common/

│   ├── layout/

│   ├── forms/

│   ├── tables/

│   ├── cards/

│   ├── dialogs/

│   └── charts/

│

├── features/

│   ├── auth/

│   ├── dashboard/

│   ├── bumil/

│   ├── pasca-persalinan/

│   ├── calon-menikah/

│   ├── lansia/

│   ├── batita/

│   ├── balita/

│   ├── anak-sekolah/

│   ├── riwayat/

│   ├── laporan/

│   └── superadmin/

│

├── hooks/

├── layouts/

├── lib/

├── routes/

├── services/

├── stores/

├── types/

├── utils/

├── App.tsx

└── main.tsx
```

---

# Folder Responsibilities

## app/

Global provider.

Contoh:

- QueryClientProvider
- RouterProvider
- ThemeProvider

---

## assets/

Static assets.

- image
- icon
- logo
- font

---

## components/

Reusable UI.

Tidak boleh mengandung business logic.

Contoh:

```
Button

Input

Modal

Badge

Table

Card

Sidebar

Navbar
```

---

## features/

Setiap fitur berdiri sendiri.

Contoh:

```
features/

dashboard/

bumil/

lansia/
```

Masing-masing memiliki:

```
components/

hooks/

pages/

services/

types/
```

---

## hooks/

Reusable hooks.

Misalnya

```
useDebounce

useMediaQuery

usePagination

useDisclosure
```

---

## layouts/

Layout aplikasi.

Misalnya

```
AuthLayout

DashboardLayout

SuperAdminLayout
```

---

## routes/

Seluruh routing.

Tidak boleh ada routing di dalam feature.

---

## services/

Seluruh komunikasi API.

Contoh

```
dashboard.service.ts

bumil.service.ts

lansia.service.ts
```

Component dilarang menggunakan axios secara langsung.

---

## stores/

Global state menggunakan Zustand.

Contoh

```
authStore

sidebarStore

themeStore
```

Tidak digunakan untuk server state.

---

## types/

Seluruh interface global.

Contoh

```
User

ApiResponse

Pagination

Patient
```

---

## utils/

Helper.

Misalnya

```
dateFormatter

numberFormatter

validators

constants
```

---

# Feature Structure

Setiap feature memiliki struktur sama.

Contoh

```
features/

bumil/

│

components/

hooks/

pages/

services/

types/

index.ts
```

Tidak boleh membuat struktur berbeda.

---

# Component Architecture

```
Page

↓

Feature Component

↓

Reusable Component

↓

Primitive UI
```

Contoh

```
BumilPage

↓

BumilTable

↓

DataTable

↓

Table
```

---

# Layout Hierarchy

```
App

↓

Router

↓

Layout

↓

Page

↓

Section

↓

Card

↓

Table

↓

Input
```

---

# State Management

State dibagi menjadi dua.

## Server State

Menggunakan TanStack Query.

Contoh

- dashboard
- warga
- pemeriksaan
- laporan

Tidak boleh disimpan ke Zustand.

---

## Client State

Menggunakan Zustand atau useState.

Contoh

- sidebar
- dialog
- auth
- selected month
- selected kategori

---

# Data Flow

```
User

↓

React Component

↓

React Hook Form

↓

Validation

↓

Service

↓

Axios

↓

Backend API

↓

Response

↓

React Query

↓

Component
```

---

# Authentication Flow

```
Login

↓

Backend

↓

Token

↓

Store

↓

Protected Route

↓

Dashboard
```

Semua halaman selain login harus menggunakan Protected Route.

---

# Authorization

## Kader

Dapat mengakses:

- Dashboard
- Pemeriksaan
- Riwayat
- Laporan

---

## Super Admin

Dapat mengakses:

- CRUD Posyandu
- CRUD User

Tidak memiliki akses ke pendataan kesehatan.

---

# API Layer

Semua API berada pada folder:

```
services/
```

Contoh

```
bumil.service.ts

dashboard.service.ts
```

Dilarang:

```tsx
axios.get(...)
```

langsung di component.

---

# UI Layer

Semua styling menggunakan:

- Tailwind CSS
- CSS Variables pada app.css

Tidak boleh hardcode:

```
text-blue-500

bg-red-500

text-green-400
```

Gunakan design token.

---

# Routing

Setiap halaman menggunakan React Router.

Tidak boleh membuat router sendiri.

---

# Error Handling

Semua error ditangani oleh:

- Axios Interceptor
- TanStack Query
- Error Boundary

Component tidak menangani error API secara manual kecuali untuk kebutuhan UI tertentu.

---

# Loading Strategy

Seluruh halaman menggunakan:

- Skeleton Loading
- Spinner
- Disabled Button

Tidak boleh menampilkan halaman kosong saat fetch.

---

# Form Strategy

Semua form menggunakan:

- React Hook Form
- Zod

Tidak boleh menggunakan useState untuk form yang kompleks.

---

# Table Strategy

Semua tabel menggunakan komponen yang sama.

Tidak boleh membuat tabel baru untuk setiap halaman.

Contoh:

```
DataTable
```

dipakai oleh:

- Bumil
- Lansia
- Balita
- Batita
- Anak Sekolah

---

# Business Modules

Frontend dibagi menjadi module berikut.

```
Authentication

Dashboard

Ibu Hamil

Pasca Persalinan

Calon Menikah

Lansia

Batita

Balita

Anak Sekolah

Riwayat Pemeriksaan

Rekapitulasi

Super Admin
```

Tidak boleh mencampur business logic antar module.

---

# Reusability Rules

Setiap komponen harus dipertimbangkan reusable.

Jika komponen dapat digunakan minimal dua halaman,

maka harus dipindahkan ke:

```
components/
```

---

# AI Development Rules

AI wajib:

- mengikuti struktur folder
- tidak membuat folder baru tanpa alasan
- menggunakan reusable component
- tidak mengubah arsitektur
- mengupdate dokumentasi jika arsitektur berubah
- menyelesaikan satu task setiap iterasi

---

# Summary

Frontend menggunakan:

- Feature-Based Architecture
- Mobile First Design
- Reusable Components
- TanStack Query
- React Hook Form
- Axios Service Layer
- Zustand untuk Global UI State
- CSS Variables sebagai Design Token
- Strict TypeScript
- Backend sebagai Single Source of Truth