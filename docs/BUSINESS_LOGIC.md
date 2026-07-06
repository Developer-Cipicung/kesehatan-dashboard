# STATE_MANAGEMENT.md

# State Management

## Tujuan

Frontend menggunakan beberapa jenis state management dengan tanggung jawab yang berbeda.

Setiap jenis state memiliki fungsi masing-masing dan tidak boleh saling menggantikan tanpa alasan.

---

# Jenis State

Project menggunakan empat jenis state:

- Local State
- Global UI State
- Server State
- Form State

---

# Local State

Menggunakan:

```
useState
```

atau

```
useReducer
```

Digunakan untuk state yang hanya digunakan oleh satu component.

Contoh:

- Dialog terbuka/tutup
- Tab aktif
- Accordion
- Dropdown
- Input pencarian sementara
- Stepper

Local State tidak boleh digunakan untuk menyimpan data dari Backend.

---

# Global UI State

Menggunakan:

```
Zustand
```

Digunakan apabila state dipakai oleh banyak halaman atau banyak component.

Contoh:

- User Login
- Sidebar Collapse
- Selected Posyandu
- Theme
- Global Filter

Zustand tidak digunakan untuk menyimpan data API.

---

# Server State

Menggunakan:

```
TanStack Query
```

Seluruh data yang berasal dari Backend harus menggunakan TanStack Query.

Contoh:

- Dashboard
- Data Pasien
- Riwayat Pemeriksaan
- Pendataan Bulanan
- Posyandu
- User
- Laporan

---

# Form State

Menggunakan:

```
React Hook Form
```

Seluruh validasi menggunakan:

```
Zod
```

Contoh:

- Login
- Tambah Pasien
- Pemeriksaan
- CRUD Posyandu
- CRUD User

Tidak menggunakan useState untuk form kompleks.

---

# State Ownership

| Jenis Data | State |
|------------|-------|
| Dashboard | TanStack Query |
| Data Pasien | TanStack Query |
| Riwayat Pemeriksaan | TanStack Query |
| Login Form | React Hook Form |
| Pemeriksaan Form | React Hook Form |
| Sidebar | Zustand |
| User Session | Zustand |
| Dialog | useState |
| Dropdown | useState |
| Tab | useState |

---

# TanStack Query Rules

Gunakan Query untuk:

- GET

Gunakan Mutation untuk:

- POST
- PATCH
- PUT
- DELETE

Setelah Mutation berhasil:

- Invalidate Query yang berkaitan.

Jangan melakukan reload halaman.

---

# Query Key Convention

Gunakan Query Key yang konsisten.

Contoh:

```
["dashboard"]

["bumil"]

["balita"]

["lansia"]

["riwayat", id]

["laporan"]

["users"]

["posyandu"]
```

---

# Zustand Rules

Store hanya berisi state global.

Contoh:

```
authStore

sidebarStore

themeStore
```

Store tidak boleh berisi business logic berat.

---

# React Hook Form Rules

Seluruh form harus menggunakan schema Zod.

Contoh:

```
loginSchema

bumilSchema

lansiaSchema

userSchema
```

Validasi manual hanya dilakukan apabila tidak dapat direpresentasikan oleh Zod.

---

# Data Flow

```
Backend API

↓

TanStack Query

↓

Feature Hook

↓

Component
```

Untuk form:

```
Component

↓

React Hook Form

↓

Zod Validation

↓

Mutation

↓

Backend API
```

---

# Don't

AI tidak boleh:

- Menyimpan response API di Zustand.
- Menggunakan useEffect untuk fetch data.
- Menggunakan useState untuk form besar.
- Menggunakan Context API untuk state global yang sudah ditangani Zustand.
- Menggandakan state yang sama di beberapa tempat.

---

# Development Rules

AI wajib:

- Menggunakan TanStack Query untuk seluruh server state.
- Menggunakan Zustand hanya untuk global UI state.
- Menggunakan React Hook Form + Zod untuk seluruh form.
- Menggunakan useState hanya untuk local component state.
- Mengikuti konvensi Query Key yang telah ditentukan.

---

# Summary

Project menggunakan pembagian state sebagai berikut:

- **useState / useReducer** → Local Component State
- **Zustand** → Global UI State
- **TanStack Query** → Server State
- **React Hook Form + Zod** → Form State

Setiap jenis state memiliki tanggung jawab yang jelas dan tidak boleh digunakan di luar peruntukannya.