# STYLE_GUIDE.md

# Frontend Style Guide

Project: **Pusat Pendataan Kesehatan Posyandu Cipicung**

---

# Purpose

Dokumen ini mendefinisikan standar visual seluruh aplikasi.

AI Agent wajib mengikuti dokumen ini sebelum membuat UI.

Seluruh styling harus konsisten pada seluruh halaman.

---

# Design Principles

UI harus memiliki karakteristik berikut:

- Bersih (Clean)
- Modern
- Minimalis
- Mudah dibaca
- Mobile First
- Konsisten
- Ramah digunakan oleh kader Posyandu

---

# Color Palette

## Primary

| Name | Hex |
|------|------|
| Primary Light | `#83FFBB` |
| Primary | `#36C56F` |
| Primary Dark | `#165E33` |

Primary digunakan sebagai identitas utama aplikasi.

Digunakan untuk:

- Primary Button
- Active Sidebar
- Active Navigation
- Success Action
- Highlight

---

## Accent

| Name | Hex |
|------|------|
| Accent | `#E8B921` |

Digunakan untuk:

- Highlight
- Warning
- Badge
- Statistik tertentu

Tidak digunakan sebagai warna utama.

---

# Neutral Colors

Gunakan warna netral dari shadcn/ui untuk:

- Background
- Border
- Text
- Card
- Input

Jangan membuat palette abu-abu sendiri.

---

# Typography

## Font Family

```
Segoe UI
```

Fallback:

```
Segoe UI

Roboto

Arial

sans-serif
```

---

# Font Size

| Style | Size |
|-------|------|
| Title | 60px |
| Heading 1 | 40px |
| Heading 2 | 36px |
| Heading 3 | 32px |
| Heading 4 | 16px |
| Body Text | 14px |

---

# Font Weight

| Style | Weight |
|-------|---------|
| Title | Bold |
| Heading | Semibold |
| Body | Regular |

---

# Text Color

Gunakan warna default dari Design Token.

Jangan menggunakan warna hitam murni.

---

# Spacing

Gunakan sistem spacing 4px.

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

64
```

Hindari spacing acak.

---

# Border Radius

Gunakan radius berikut.

| Name | Size |
|------|------|
| Small | 6px |
| Medium | 8px |
| Large | 12px |
| Extra Large | 16px |

---

# Shadow

Gunakan shadow ringan.

Card tidak boleh memiliki shadow yang terlalu besar.

Prioritaskan:

```
shadow-sm

shadow-md
```

---

# Buttons

Semua button menggunakan reusable component.

Variant:

- Primary
- Secondary
- Outline
- Ghost
- Danger

---

## Primary Button

Background

```
Primary
```

Text

```
White
```

---

## Secondary Button

Background

```
White
```

Border

```
Primary
```

Text

```
Primary
```

---

## Danger Button

Gunakan warna default destructive dari shadcn/ui.

---

# Cards

Seluruh card memiliki:

- Background putih
- Rounded
- Shadow ringan
- Padding konsisten

---

# Forms

Seluruh form menggunakan komponen reusable.

Input memiliki:

- Label
- Placeholder
- Error Message
- Disabled State

---

# Tables

Karena aplikasi berpusat pada data, seluruh tabel harus konsisten.

Tabel memiliki:

- Header tebal
- Hover row
- Pagination
- Search
- Empty State
- Loading Skeleton

Pada layar kecil, tabel dapat diganti menjadi Card View apabila diperlukan.

---

# Icons

Gunakan:

```
lucide-react
```

Tidak menggunakan icon dari library lain.

---

# Dialog

Dialog menggunakan komponen shadcn/ui.

Pada mobile, dialog dapat berubah menjadi fullscreen.

---

# Toast

Gunakan:

```
Sonner
```

Variant:

- Success
- Error
- Warning
- Info

---

# Loading

Gunakan:

- Skeleton
- Spinner

Tidak menggunakan teks "Loading..." sebagai satu-satunya indikator.

---

# Empty State

Setiap halaman yang tidak memiliki data wajib memiliki Empty State.

Minimal berisi:

- Icon
- Judul
- Deskripsi singkat
- Tombol aksi (jika relevan)

---

# Responsive Design

Project menggunakan pendekatan Mobile First.

Breakpoint mengikuti default Tailwind CSS.

Pada layar kecil:

- Sidebar menjadi Drawer
- Table dapat berubah menjadi Card
- Dialog dapat fullscreen
- Grid menjadi satu kolom

---

# Accessibility

Seluruh komponen harus:

- Dapat digunakan dengan keyboard
- Memiliki focus state
- Memiliki kontras warna yang baik
- Menggunakan semantic HTML

---

# Styling Rules

AI wajib:

- Menggunakan Tailwind CSS.
- Menggunakan design token dari app.css.
- Menggunakan reusable component.
- Menghindari inline style.
- Menghindari hardcode warna.

---

# Do Not

AI tidak boleh:

- Menggunakan warna di luar palette tanpa alasan.
- Menggunakan lebih dari satu font.
- Menggunakan radius yang tidak konsisten.
- Menggunakan shadow berlebihan.
- Membuat komponen dengan style berbeda dari design system.

---

# Future Improvements

Apabila branding berubah, perubahan cukup dilakukan pada design token di `app.css`.

Komponen tidak perlu diubah satu per satu.

---

# Summary

Seluruh tampilan aplikasi harus:

- Konsisten
- Mobile First
- Mudah dibaca
- Modern
- Menggunakan reusable component
- Mengikuti color palette dan typography pada dokumen ini