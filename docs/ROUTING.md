# ROUTING.md

# Routing Documentation

Project menggunakan **React Router DOM** dengan nested routing.

Seluruh halaman harus didefinisikan di folder:

```
src/routes
```

Tidak diperbolehkan membuat routing di dalam feature.

---

# Routing Structure

```
/

├── login
├── dashboard
│
├── ibu
│   ├── hamil
│   ├── pasca-persalinan
│   └── calon-menikah
│
├── anak
│   ├── batita
│   ├── balita
│   └── sekolah
│
├── lansia
│
├── riwayat
│   └── :recordId
│
├── laporan
│
└── superadmin
    ├── login
    ├── dashboard
    ├── posyandu
    └── users
```

---

# Route Groups

Route dibagi menjadi tiga kelompok.

## Public

Tidak membutuhkan login.

```
/login

/superadmin/login
```

---

## Protected Kader

Hanya dapat diakses kader.

```
/dashboard

/ibu/*

/anak/*

/lansia

/riwayat/:id

/laporan
```

---

## Protected Super Admin

```
/superadmin/dashboard

/superadmin/posyandu

/superadmin/users
```

---

# Authentication Flow

```
Login

↓

Backend

↓

JWT

↓

Save Session

↓

Redirect Dashboard
```

Jika token tidak valid

↓

Logout

↓

Kembali ke Login

---

# Authorization

## Kader

Allowed

```
Dashboard

Kategori Pasien

Riwayat

Laporan
```

Forbidden

```
Superadmin
```

---

## Super Admin

Allowed

```
Dashboard Admin

CRUD Posyandu

CRUD User
```

Forbidden

```
Pendataan kesehatan
```

---

# Main Navigation

Sidebar kader.

```
Dashboard

Ibu
    Ibu Hamil
    Pasca Persalinan
    Calon Menikah

Anak
    Batita
    Balita
    Anak Sekolah

Lansia

Laporan
```

---

Sidebar Super Admin

```
Dashboard

Posyandu

Users
```

---

# Dashboard Route

```
/dashboard
```

Menampilkan:

- statistik
- aktivitas
- grafik
- shortcut

---

# Ibu Routes

## Ibu Hamil

```
/ibu/hamil
```

Menampilkan daftar ibu hamil.

---

## Pasca Persalinan

```
/ibu/pasca-persalinan
```

---

## Calon Menikah

```
/ibu/calon-menikah
```

---

# Anak Routes

## Batita

```
/anak/batita
```

---

## Balita

```
/anak/balita
```

---

## Anak Sekolah

```
/anak/sekolah
```

---

# Lansia

```
/lansia
```

---

# Riwayat Pemeriksaan

```
/riwayat/:recordId
```

Halaman ini menjadi **pusat seluruh detail pemeriksaan**.

Semua edit dilakukan di halaman ini.

Halaman daftar pasien hanya menjadi entry point.

---

# Riwayat Behaviour

Jika record:

Draft

↓

Edit diperbolehkan.

Jika:

Verified

↓

Readonly.

---

# Laporan

```
/laporan
```

Berisi:

- Rekap Bulanan
- Export PDF
- Export Excel

---

# Super Admin

Dashboard

```
/superadmin/dashboard
```

---

CRUD Posyandu

```
/superadmin/posyandu
```

---

CRUD User

```
/superadmin/users
```

---

# Route Protection

Menggunakan:

```
ProtectedRoute

ProtectedAdminRoute

PublicRoute
```

AI wajib menggunakan wrapper.

Tidak boleh mengecek login di setiap halaman.

---

# Redirect Rules

Belum login

↓

```
/login
```

---

Login sebagai kader

↓

```
/dashboard
```

---

Login sebagai admin

↓

```
/superadmin/dashboard
```

---

Akses halaman tanpa izin

↓

403

atau redirect dashboard.

---

# Breadcrumb

Contoh.

```
Dashboard

↓

Ibu

↓

Ibu Hamil
```

---

```
Dashboard

↓

Anak

↓

Balita
```

---

```
Dashboard

↓

Laporan
```

---

# Page Title

Setiap route harus mengubah:

```
document.title
```

Contoh

```
Dashboard

Ibu Hamil

Lansia

Balita

Rekapitulasi
```

---

# Lazy Loading

Seluruh halaman menggunakan

```
React.lazy()

Suspense
```

Contoh

```
Dashboard

Laporan

Riwayat

Superadmin
```

---

# Not Found

```
*
```

↓

404 Page

Berisi:

- ilustrasi
- tombol kembali dashboard

---

# Loading

Saat lazy loading.

↓

Skeleton

atau

Loading Screen.

---

# Future Expansion

Struktur routing harus mudah ditambah.

Contoh.

```
/remaja

/disabilitas

/rujukan
```

Tidak perlu mengubah struktur route utama.

---

# AI Development Rules

AI wajib:

- Tidak mengubah route tanpa dokumentasi.
- Tidak membuat duplicate route.
- Menggunakan nested routing.
- Menggunakan route guard.
- Menggunakan lazy loading.
- Memperbarui dokumentasi jika route berubah.

---

# Summary

Frontend memiliki tiga kelompok route:

- Public
- Protected Kader
- Protected Super Admin

Halaman **Riwayat Pemeriksaan** menjadi satu-satunya halaman untuk melihat dan mengedit detail pemeriksaan (selama periode belum dikunci).

Semua navigasi mengikuti struktur sidebar dan business flow yang telah disepakati.