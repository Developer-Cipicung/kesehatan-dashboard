# API_INTEGRATION.md

# API Integration

## Tujuan

Frontend tidak memiliki dokumentasi endpoint sendiri.

Seluruh spesifikasi endpoint, request, response, authentication, dan error code mengikuti dokumentasi Backend API.

Frontend hanya mendefinisikan aturan penggunaan API.

---

# Source of Truth

Backend API merupakan satu-satunya sumber dokumentasi API.

Developer maupun AI wajib membaca dokumentasi Backend sebelum melakukan implementasi.

Frontend tidak boleh membuat asumsi mengenai:

- endpoint
- request body
- response body
- authentication
- pagination
- query parameter

Apabila terdapat perubahan pada Backend API, frontend harus mengikuti perubahan tersebut.

---

# API Documentation

Seluruh dokumentasi API terdapat pada repository Backend.

Contoh:

```
backend/

docs/

API.md

swagger.yaml

Swagger UI
```

Frontend tidak menduplikasi isi dokumentasi tersebut.

---

# Integration Flow

```
React Component

↓

Feature Hook

↓

Service Layer

↓

Axios Client

↓

Backend REST API
```

Component tidak boleh melakukan HTTP Request secara langsung.

---

# Service Layer

Seluruh komunikasi API dilakukan melalui folder:

```
src/services
```

Contoh:

```
auth.service.ts

dashboard.service.ts

bumil.service.ts

balita.service.ts

laporan.service.ts
```

---

# HTTP Client

Menggunakan Axios.

Seluruh konfigurasi Axios berada pada:

```
src/lib/axios.ts
```

Axios bertanggung jawab terhadap:

- Base URL
- Authorization Header
- Timeout
- Interceptor
- Global Error Handling

---

# Server State

Seluruh data dari Backend dikelola menggunakan TanStack Query.

Tidak diperbolehkan menyimpan response API ke Zustand.

---

# Mutation

Seluruh POST, PATCH, PUT, dan DELETE menggunakan TanStack Query Mutation.

Mutation wajib melakukan invalidate query yang berkaitan.

Tidak diperbolehkan melakukan refresh halaman.

---

# Authentication

Frontend menggunakan JWT yang diberikan Backend.

Frontend tidak melakukan autentikasi sendiri.

Token disimpan sesuai mekanisme yang ditentukan Backend.

---

# Error Handling

Frontend hanya menampilkan pesan error.

Logika penentuan error berasal dari Backend.

---

# API Versioning

Frontend selalu mengikuti versi API yang digunakan Backend.

Apabila Backend melakukan breaking changes, frontend wajib diperbarui.

---

# Development Rules

AI wajib:

- Membaca dokumentasi Backend API sebelum implementasi.
- Tidak membuat endpoint sendiri.
- Tidak mengubah kontrak API.
- Tidak membuat asumsi terhadap response.
- Tidak menduplikasi dokumentasi Backend.

---

# Summary

Backend API adalah source of truth.

Frontend hanya bertanggung jawab mengintegrasikan API melalui Service Layer menggunakan Axios dan TanStack Query.