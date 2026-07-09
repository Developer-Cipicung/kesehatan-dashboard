# COMPONENTS.md

# Reusable Component Documentation

Seluruh UI pada project wajib dibangun menggunakan reusable component.

AI Agent wajib mencari reusable component terlebih dahulu sebelum membuat component baru.

---

# Folder Structure (Actual)

```
src/components/
├── ui/                 ← shadcn/ui primitives (Radix UI)
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── form.tsx
│   ├── input.tsx
│   ├── label.tsx
│   ├── select.tsx
│   ├── table.tsx
│   ├── badge.tsx
│   ├── skeleton.tsx
│   ├── textarea.tsx
│   ├── popover.tsx
│   ├── calendar.tsx
│   ├── alert-dialog.tsx
│   └── pagination.tsx
│
├── common/             ← Komponen utilitas lintas fitur
│   ├── DatePicker.tsx
│   ├── SearchInput.tsx
│   └── NumberInput.tsx
│
├── forms/              ← Wrapper form
│   └── FormField.tsx   ← Wrapper RHF + shadcn FormItem + label + error
│
├── tables/
│   └── DataTable.tsx   ← Generic table (belum dipakai secara luas)
│
├── cards/
│   └── StatisticCard.tsx
│
├── dialogs/
│   └── ConfirmDialog.tsx
│
└── feedback/
    ├── EmptyState.tsx
    ├── ErrorState.tsx
    └── LoadingSkeleton.tsx  ← SkeletonCard
```

---

# shadcn/ui (ui/)

Komponen primitive dari shadcn/ui. Tidak boleh dimodifikasi kecuali styling via CSS variables.

Gunakan komponen ini sebagai building block:
- `Button`, `Input`, `Textarea`, `Select`, `Badge`
- `Card`, `CardHeader`, `CardContent`, `CardTitle`
- `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`
- `Table`, `TableHead`, `TableRow`, `TableCell`, `TableBody`
- `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage`

---

# Common Components (common/)

## DatePicker

```tsx
<DatePicker value={date} onChange={setDate} />
```

Berbasis Calendar + Popover dari shadcn.

---

## SearchInput

```tsx
<SearchInput value={q} onChange={setQ} placeholder="Cari nama atau NIK..." />
```

---

## NumberInput

Untuk input angka desimal (BB, TB, GDS, dll.).

---

# FormField (forms/)

Wrapper React Hook Form + shadcn FormItem.

```tsx
<FormField
  control={methods.control}
  name="nik"
  label={<>NIK <span className="text-red-500">*</span></>}
  placeholder="16 digit NIK"
  type="text"
/>
```

Props:
- `control` — dari `useForm()`
- `name` — nama field
- `label` — `ReactNode | string`
- `placeholder?` — string
- `type?` — HTML input type
- `disabled?` — boolean
- `children?` — render prop untuk custom input

---

# Feature Components (features/warga/)

## SharedPatientList

Komponen tunggal untuk semua halaman daftar pasien.

Props: `title: string`, `kategori: string`

Menampilkan PatientTable (desktop) dan PatientCard (mobile) secara bersamaan berdasarkan screen size.

---

## PatientTable

Tabel warga untuk desktop. Kolom berbeda per kategori:

| Kategori | Kolom utama |
|----------|------------|
| balita/baduta | BB, TB, Lingkar Kepala, Imunisasi |
| bumil | Usia Kehamilan, BB, TB, Lingkar Perut |
| lansia | BB, TB, Tekanan Darah, GDS |
| pasca_persalinan | Tgl Persalinan, TD, Suhu, Kondisi |

---

## PatientCard

Tampilan kartu untuk mobile. Menampilkan data ringkas + aksi + ImunisasiCell untuk balita/baduta.

---

## AddPatientDialog

Dialog tambah warga baru. Field muncul/hilang berdasarkan kategori yang dipilih:
- Balita/Baduta: nama ayah, nama ibu
- Pasca Persalinan: tanggal persalinan
- Ibu-ibu: jenis kelamin otomatis P

---

## ImunisasiCell

Menampilkan dan mengelola riwayat imunisasi di dalam PatientTable/PatientCard.

- Chip/pill per vaksin (teks + tombol X merah terpisah di luar chip)
- Input manual untuk tambah vaksin (tekan Enter atau klik +)
- `disabled` prop untuk mode readonly (setelah pendataan selesai)

---

# Feature Components (features/pemeriksaan/)

## PatientHistoryPage

Halaman detail warga. Komponen:
1. `PatientProfileCard` — info warga + imunisasi
2. `HistoryTimeline` — daftar riwayat pemeriksaan + tombol edit/hapus
3. `MonthlyRecordForm` — dialog edit pemeriksaan (field dinamis per kategori)

---

## PatientProfileCard

Card profil warga di atas halaman riwayat.

Menampilkan data identitas + riwayat imunisasi (chips, readonly) untuk balita/baduta.

---

## HistoryTimeline

Tabel riwayat pemeriksaan. Kolom berbeda per kategori. Setiap baris memiliki tombol Edit dan Hapus (disabled jika periode sudah dikunci).

---

## MonthlyRecordForm

Dialog form edit pemeriksaan. Field muncul berdasarkan kategori:

| Kategori | Field |
|----------|-------|
| balita/baduta | Tanggal, BB, TB, Lingkar Kepala, LILA, Keluhan |
| bumil | Tanggal, Usia Kehamilan, BB, TB, Lingkar Perut, LILA, HPHT, HTP, Keluhan |
| lansia | Tanggal, BB, TB, Tekanan Darah, GDS, Keluhan |
| pasca_persalinan | Tanggal, BB, Suhu, Tekanan Darah, Kondisi Ibu, Keluhan |

---

# Feature Components (features/reports/)

## MonthlyReportTable

Tabel rekap bulanan. Kolom berbeda per kategori. Kolom Imunisasi untuk balita/baduta (format: `BCG, Polio 1, DPT-HB-Hib 1`).

---

## ExportActions

Tombol Download PDF + Download Excel + dropdown pilih kategori.

---

# Feedback Components (feedback/)

## SkeletonCard / LoadingSkeleton

Ditampilkan saat lazy loading halaman.

## EmptyState

Ditampilkan jika data kosong.

## ErrorState

Ditampilkan jika request API gagal. Memiliki props `onRetry`.

---

# Dashboard Components (features/dashboard/)

## StatisticCard

Menampilkan: ikon + judul + nilai angka.

---

# Component Naming

Gunakan PascalCase.

Contoh: `PatientTable`, `ImunisasiCell`, `MonthlyRecordForm`, `ExportActions`

---

# Props Rules

Props harus memiliki TypeScript interface. Hindari `any` sebisa mungkin.

---

# AI Development Rules

AI wajib:
- Menggunakan component yang sudah ada (cek daftar di atas terlebih dahulu).
- Tidak membuat duplicate component.
- Memindahkan component reusable ke folder `components/`.
- Tidak mencampur business logic dengan UI component.
- Menggunakan TypeScript Strict.
- Mengupdate dokumen ini jika menambah component baru.