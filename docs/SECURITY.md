# SECURITY.md

# Frontend Security Guidelines

## Tujuan

Dokumen ini mendefinisikan standar keamanan Frontend.

Frontend **bukan** penanggung jawab utama keamanan aplikasi.

Seluruh validasi bisnis dan hak akses tetap dilakukan oleh Backend.

Frontend hanya membantu meningkatkan keamanan dan pengalaman pengguna.

---

# Security Principles

Frontend wajib mengikuti prinsip berikut.

- Never Trust Client
- Backend is Source of Truth
- Least Privilege
- Secure by Default

Frontend tidak boleh menganggap data dari browser sebagai data yang valid.

---

# Authentication

Seluruh proses autentikasi dilakukan oleh Backend.

Frontend hanya bertugas:

- Login
- Logout
- Menyimpan session
- Mengirim Authorization Header

Frontend tidak boleh membuat autentikasi sendiri.

---

# Authorization

Frontend boleh menyembunyikan menu berdasarkan role.

Namun frontend **tidak boleh** menjadi penentu hak akses.

Semua endpoint tetap harus diverifikasi oleh Backend.

Contoh:

```
Frontend

↓

Hide Menu

↓

Backend

↓

Validate Permission
```

---

# Token Handling

Frontend tidak boleh:

- Menampilkan token
- Menyimpan token di source code
- Mengirim token ke third-party

Seluruh token berasal dari proses login Backend.

---

# API Endpoint

Base URL berasal dari Environment Variable.

Contoh:

```
VITE_API_URL
```

Tidak boleh melakukan hardcode URL.

---

# Environment Variables

Contoh:

```
VITE_API_URL
```

Environment Variable hanya boleh berisi informasi yang memang aman untuk diketahui client.

Jangan pernah menyimpan:

- Database URL
- Secret Key
- JWT Secret
- Supabase Service Role Key
- API Secret

di Frontend.

---

# Validation

Frontend melakukan validasi untuk meningkatkan User Experience.

Contoh:

- Required Field
- Format Email
- Panjang Input
- Angka

Namun validasi Backend tetap wajib dilakukan.

---

# Input Sanitization

Seluruh input harus divalidasi menggunakan Zod.

Frontend tidak boleh mengirim data yang jelas tidak valid.

---

# Error Message

Frontend tidak boleh menampilkan:

- Stack Trace
- SQL Error
- Prisma Error
- Internal Server Error Detail

Gunakan pesan yang ramah pengguna.

Contoh:

```
Terjadi kesalahan.

Silakan coba kembali.
```

---

# Route Protection

Halaman yang memerlukan login wajib menggunakan Protected Route.

Pengguna yang belum login harus diarahkan ke halaman Login.

---

# HTTPS

Production wajib menggunakan HTTPS.

Frontend tidak boleh memaksa penggunaan HTTP.

---

# Console Log

Dilarang meninggalkan:

```
console.log()

console.table()

console.dir()
```

di production.

---

# Sensitive Information

Frontend tidak boleh menyimpan:

- Password
- Secret
- Credential
- API Key

ke local state atau source code.

---

# XSS Prevention

Frontend tidak boleh menggunakan:

```
dangerouslySetInnerHTML
```

kecuali benar-benar diperlukan dan telah melalui proses sanitasi.

---

# File Upload

Apabila di masa depan terdapat upload file.

Frontend wajib:

- Membatasi ukuran file.
- Membatasi tipe file.
- Menampilkan progress upload.

Validasi utama tetap dilakukan Backend.

---

# Download

Seluruh download dilakukan melalui Backend.

Frontend tidak membuat file laporan sendiri.

---

# Third Party Library

AI tidak boleh menambahkan dependency baru tanpa alasan yang jelas.

Gunakan library yang telah ditetapkan dalam TECH_STACK.md.

---

# Dependency Management

Package harus:

- Aktif dipelihara
- Banyak digunakan komunitas
- Memiliki lisensi yang sesuai

---

# Development Rules

AI wajib:

- Tidak menyimpan secret di frontend.
- Tidak melakukan autentikasi sendiri.
- Tidak melakukan otorisasi sendiri.
- Tidak mempercayai data dari browser.
- Selalu mengikuti dokumentasi Backend API.

---

# Summary

Frontend bertanggung jawab terhadap:

- User Experience
- Session Handling
- Route Protection
- Input Validation

Backend tetap menjadi penanggung jawab utama:

- Authentication
- Authorization
- Business Validation
- Database Security