# ROUTING.md

# Routing Documentation

Project menggunakan **React Router DOM v6** dengan `createBrowserRouter` dan nested routing.

Seluruh routing didefinisikan di:

```
src/routes/index.tsx
```

---

# Actual Route Structure

```
/login                          ← Public

/                               ← Protected (ProtectedRoute)
  /                             ← DashboardLayout
    /                 (index)   ← DashboardPage
    /bumil                      ← SharedPatientList (kategori="bumil")
    /pasca-persalinan           ← SharedPatientList (kategori="pasca_persalinan")
    /baduta                     ← SharedPatientList (kategori="baduta")
    /balita                     ← SharedPatientList (kategori="balita")
    /lansia                     ← SharedPatientList (kategori="lansia")
    /laporan                    ← ReportPage
    /status-pendataan           ← AdminStatusPendataanPage (kader view)
    /:kategori/:id              ← PatientHistoryPage (detail + riwayat + edit)

  /admin                        ← AdminLayout
    /admin            (index)   ← AdminDashboardPage
    /admin/status-pendataan     ← AdminStatusPendataanPage (admin view)
    /admin/posyandu             ← PosyanduManagementPage
    /admin/users                ← UserManagementPage
```

---

# Route Groups

## Public

Tidak membutuhkan login.

```
/login
```

---

## Protected Kader

Hanya dapat diakses user yang sudah login.

```
/
/bumil
/pasca-persalinan
/baduta
/balita
/lansia
/laporan
/status-pendataan
/:kategori/:id
```

---

## Protected Admin

```
/admin
/admin/status-pendataan
/admin/posyandu
/admin/users
```

---

# Authentication & Route Guard

Menggunakan `ProtectedRoute` di `src/routes/ProtectedRoute.tsx`.

`ProtectedRoute` mengecek Supabase session:
- Jika belum login → redirect ke `/login`
- Jika sudah login → render children (outlet)

Redirect setelah login:
- Kader/Bidan → `/` (Dashboard)
- Admin → `/admin` (Admin Dashboard)

---

# Lazy Loading

Semua halaman menggunakan `React.lazy()` + `Suspense` melalui helper `Loadable`:

```tsx
const Loadable = (Component) => (props) => (
  <Suspense fallback={<SkeletonCard />}>
    <Component {...props} />
  </Suspense>
)
```

Halaman yang di-lazy-load:
- LoginPage
- DashboardPage
- SharedPatientList
- PatientHistoryPage
- ReportPage
- AdminDashboardPage
- AdminStatusPendataanPage
- PosyanduManagementPage
- UserManagementPage

---

# Dynamic Route: PatientHistoryPage

```
/:kategori/:id
```

Halaman detail warga yang berlaku untuk semua kategori:

| URL contoh | Kategori |
|------------|----------|
| `/bumil/uuid-warga` | Ibu Hamil |
| `/balita/uuid-warga` | Balita |
| `/baduta/uuid-warga` | Baduta |
| `/lansia/uuid-warga` | Lansia |
| `/pasca-persalinan/uuid-warga` | Pasca Persalinan |

---

# Navigation (Sidebar Kader)

```
Dashboard           /
Ibu Hamil           /bumil
Pasca Persalinan    /pasca-persalinan
Baduta              /baduta
Balita              /balita
Lansia              /lansia
Laporan             /laporan
Status Pendataan    /status-pendataan
```

---

# Navigation (Sidebar Admin)

```
Dashboard           /admin
Status Pendataan    /admin/status-pendataan
Posyandu            /admin/posyandu
Users               /admin/users
```

---

# AI Development Rules

AI wajib:
- Tidak mengubah route tanpa memperbarui dokumentasi ini.
- Tidak membuat duplicate route.
- Menggunakan nested routing (`DashboardLayout` / `AdminLayout`).
- Menggunakan `ProtectedRoute` sebagai route guard.
- Menggunakan `Loadable` untuk lazy loading.
- Mengupdate `src/routes/index.tsx` untuk menambah route baru.

---

# Summary

Frontend memiliki tiga kelompok route:

- **Public** (`/login`)
- **Protected Kader** (semua halaman utama, `DashboardLayout`)
- **Protected Admin** (`/admin/*`, `AdminLayout`)

Halaman **PatientHistoryPage** (`/:kategori/:id`) menjadi satu-satunya halaman untuk melihat dan mengedit detail pemeriksaan warga selama periode belum dikunci.