# Dokumentasi UI/UX — Rema-AntigravityV2

> **Versi:** 2.0  
> **Tanggal:** 2026-03-03  
> **Status:** Referensi Audit Desain — Baca-saja  
> **Tujuan:** Panduan keseragaman desain per modul untuk kebutuhan audit konsistensi UI/UX aplikasi manajemen pesanan, produksi & keuangan bisnis percetakan.

---

## Daftar Isi

1. [Prinsip Desain Global](#1-prinsip-desain-global)
2. [Design System](#2-design-system)
   - 2.1 Tipografi
   - 2.2 Skema Warna
   - 2.3 Spacing & Layout
   - 2.4 Iconografi
3. [Komponen Global Standar](#3-komponen-global-standar)
4. [Dokumentasi Per Modul](#4-dokumentasi-per-modul)
   - 4.1 Dashboard
   - 4.2 Pesanan (List & Baru)
   - 4.3 Detail Pesanan & Produksi
   - 4.4 Mitra
   - 4.5 Produk & Kategori
   - 4.6 Keuangan
   - 4.7 Aktivitas / Audit Trail
5. [Checklist Audit Keseragaman](#5-checklist-audit-keseragaman)

---

## 1. Prinsip Desain Global

### 1.1 Mobile-First

- Semua layout dirancang untuk viewport mobile (maks. 640px lebar efektif).
- Lebar konten dibatasi `max-w-2xl mx-auto w-full` pada halaman-halaman list dan detail.
- Tidak ada breakpoint tablet/desktop — aplikasi bersifat full mobile.
- Padding horizontal halaman: `p-4` (16px) secara konsisten.

### 1.2 Tanpa Hover State

- **Larangan keras:** Tidak boleh ada class `hover:*` pada elemen interaktif.
- Semua interaksi menggunakan `active:*` (touch/press) sebagai pengganti:
  - `active:bg-brand-border/40` untuk background feedback
  - `active:scale-95` atau `active:scale-[0.93]` untuk scale-down press
  - `active:opacity-60` untuk opacity feedback pada link/button ringan
- Transisi menggunakan `transition-all duration-150` atau `transition-colors`.

### 1.3 Sticky Element

- **Hanya bottom navigation** yang diperbolehkan menggunakan `position: fixed` atau `sticky`.
- Header halaman **tidak sticky** — scroll bersama konten.
- Tidak ada floating action button atau sticky header di dalam halaman.

### 1.4 Bottom Navigation

- **Maksimal 3 item** navigasi pada bottom navigation bar.
- Bottom navigation muncul di semua halaman utama melalui `MobileLayout`.
- Padding bawah halaman: `pb-24` untuk menghindari konten tertutup bottom nav.

### 1.5 State-Driven UI

- Semua tampilan elemen interaktif (tombol aksi, form, status badge) bergantung **sepenuhnya pada state** dari backend/store, bukan kalkulasi lokal.
- Backend adalah **single source of truth** — UI tidak boleh menampilkan status atau nilai yang tidak dikonfirmasi backend.
- Loading state wajib ditampilkan saat fetch berlangsung (spinner atau skeleton).
- Empty state wajib ditampilkan saat data kosong, dengan ikon relevan dan teks deskriptif.
- Error state ditampilkan menggunakan toast notifikasi melalui fungsi `notify`.

### 1.6 Konfirmasi Aksi Kritis

- Semua aksi destruktif (hapus, batalkan) **wajib menggunakan `ConfirmationModal`** dengan:
  - `variant: 'danger'` (merah) untuk aksi hapus permanen
  - `requiresDoubleConfirm: true` untuk menambahkan checkbox konfirmasi kedua
  - Daftar `consequences` yang menjelaskan dampak aksi secara konkret
  - `confirmLabel` yang deskriptif (mis. "Hapus Permanen", bukan "OK")
- Perubahan status pesanan menggunakan `StatusConfirmationModal` khusus yang menampilkan status asal, status tujuan, prasyarat, dan konsekuensi.

### 1.7 Backend sebagai Single Source of Truth

- Data tidak boleh di-mutasi langsung di state lokal — semua mutasi melewati store (Zustand) yang memanggil Supabase API.
- Kalkulasi keuangan, status, dan statistik dihitung di sisi backend/database.
- UI hanya **merefleksikan** nilai dari store, tidak pernah menghitung atau menyimpulkan nilai sendiri.

---

## 2. Design System

### 2.1 Tipografi

#### Font Family

| Peran | Font | Fallback |
|---|---|---|
| **Display / Heading** | Outfit | system-ui, sans-serif |
| **Body / UI** | Inter | system-ui, sans-serif |

- Elemen `h1–h6` otomatis menggunakan `font-family-display` (Outfit) via base reset.
- Elemen `body`, `p`, `input`, `textarea`, `select` menggunakan `font-family-sans` (Inter).

#### Hierarki Tipografi

| Level | Tag / Kelas | Ukuran | Weight | Line Height | Letter Spacing | Penggunaan |
|---|---|---|---|---|---|---|
| **H1 — Hero** | `h1` | 28px (1.75rem) | 800 | 1.25 | -0.025em | Dashboard hero, brand title |
| **H2 — Page Title** | `h2`, `.page-title` | 20px (1.25rem) | 700 | 1.35 | -0.015em | Judul halaman utama (header) |
| **H3 — Section Title** | `h3` | 16px (1rem) | 600 | 1.45 | -0.01em | Judul card, judul section |
| **H4 — Card Primary** | `h4` | 15px (0.9375rem) | 700 | 1.35 | — | Nama utama dalam card item |
| **Body** | `p`, `--text-body` | 15px (0.9375rem) | 400 | 1.55 | 0 | Teks konten utama |
| **Caption** | `small`, `.caption`, `.page-subtitle` | 12px (0.75rem) | 400 | 1.45 | 0.01em | Deskripsi bawah judul, waktu, metadata |
| **Label** | `.section-label` | 11px (0.6875rem) | 700 | 1.35 | 0.08em | Label section uppercase, metadata penting |
| **Form Label** | `.form-label` | 12px | 500 | — | — | Label field form |
| **Badge / Tag** | — | 10–11px | 700 | — | 0.08–0.12em | Status badge, section label, tag |

#### Aturan Penggunaan

- `.page-title` harus selalu berada di dalam header halaman bersama `.page-subtitle`.
- `font-display` (Outfit) digunakan untuk nama utama dalam card item (`h4 font-display`), bukan untuk teks body.
- Nilai spesifik inline (`fontSize: '12px'`, dsb.) diperbolehkan untuk kasus khusus yang tidak dicakup oleh kelas utility.
- Jangan menggunakan `text-xs` / `text-sm` / `text-base` Tailwind untuk teks body — gunakan token sistem (`--text-body`, `--text-caption`).

---

### 2.2 Skema Warna

#### Palette Permukaan (Surface)

| Token | Nilai | Penggunaan |
|---|---|---|
| `--color-brand-bg` | `#f9fafb` (gray-50) | Latar belakang halaman utama |
| `--color-brand-surface` | `#ffffff` | Card, form, modal, dropdown |
| `--color-brand-border` | `#e5e7eb` (gray-200) | Border card, divider, input border |
| `--color-brand-overlay` | `rgba(15,23,42,0.3)` | Backdrop modal |

#### Palette Aksen (Interactive)

| Token | Nilai | Penggunaan |
|---|---|---|
| `--color-brand-accent` | `#2563eb` (blue-600) | Tombol primary, focus ring, link, icon aktif |
| `--color-brand-accent-dark` | `#1d4ed8` (blue-700) | State pressed pada tombol primary |
| `--color-brand-accent-light` | `#eff6ff` (blue-50) | Background aksen ringan, highlight |

**Gradient Primary:** `linear-gradient(to bottom right, #2563eb, #1d4ed8)` atau `from-blue-600 to-blue-700`  
Digunakan pada: tombol primary, banner dashboard, icon container Operasional.

#### Palette Teks

| Token | Nilai | Penggunaan | Kontras (pada white) |
|---|---|---|---|
| `--color-text-primary` | `#111827` (gray-900) | Konten utama, heading | ✅ AAA 16:1 |
| `--color-text-secondary` | `#4b5563` (gray-600) | Teks pendukung | ✅ AA 7:1 |
| `--color-text-tertiary` | `#6b7280` (gray-500) | Caption, metadata, ikon | ✅ AA 4.6:1 |
| `--color-text-muted` | `#9ca3af` (gray-400) | Placeholder, disabled | ⚠️ AA Large only 2.9:1 |

> **Aturan WCAG AA:** Gunakan `text-muted` **hanya** untuk placeholder dan teks non-esensial berukuran ≥14px bold atau ≥18px normal. Jangan gunakan untuk body text, label, atau nilai data.

#### Status Colors

| Status | Background | Text | Border | Kelas Utility |
|---|---|---|---|---|
| **Success** | `#ecfdf5` (emerald-50) | `#059669` (emerald-600) | `#d1fae5` | `.badge-success` |
| **Warning** | `#fffbeb` (amber-50) | `#b45309` (amber-700) | `#fef3c7` | `.badge-warning` |
| **Error** | `#fef2f2` (red-50) | `#dc2626` (red-600) | `#fee2e2` | `.badge-error` |
| **Info** | `#eff6ff` (blue-50) | `#2563eb` (blue-600) | `#dbeafe` | `.badge-info` |
| **Neutral** | `#f3f4f6` (gray-100) | `#4b5563` (gray-600) | `#e5e7eb` | `.badge-neutral` |
| **Production** | `#f5f3ff` (violet-50) | `#4f46e5` (indigo-600) | `#e0e7ff` | `.badge-production` |

#### Aturan Transparansi

- Transparansi pada warna diperbolehkan **hanya via Tailwind opacity modifier** (`/40`, `/60`, `/[0.04]`) atau inline `rgba()`.
- Jangan menggunakan hex dengan alpha (#ffffff99) — gunakan `rgba()` atau Tailwind modifier.
- Transparansi pada overlay backdrop: `rgba(15,23,42,0.3)` — nilai ini baku, jangan diubah.

#### Gradient ikon per grup menu

| Grup | Gradient | Kode |
|---|---|---|
| **Operasional** (Pesanan, Produksi) | Biru tua | `linear-gradient(135deg, #3b82f6, #1e40af)` |
| **Master Data** (Mitra, Kategori, Produk) | Slate/neutral | `linear-gradient(135deg, #64748b, #334155)` |
| **Keuangan** | Emerald | `linear-gradient(135deg, #10b981, #065f46)` |
| **Sistem** (Aktivitas) | Violet | `linear-gradient(135deg, #8b5cf6, #5b21b6)` |

---

### 2.3 Spacing & Layout

#### Spacing System (Berbasis 8px)

| Nilai | px | Kegunaan Umum |
|---|---|---|
| `0.5` | 2px | Jarak minimal antar elemen inline |
| `1` | 4px | Gap antar badge/icon item |
| `1.5` | 6px | Gap label-value dalam satu row |
| `2` | 8px | Padding kecil, gap dalam list item |
| `3` | 12px | Gap antar card dalam list |
| `4` | 16px | Padding halaman horizontal (standar) |
| `5` | 20px | Padding card, jarak antar section |
| `6` | 24px | Padding bawah halaman terakhir |
| `24` PB | 96px | Padding bawah konten (clearance bottom nav) |

#### Standar Padding & Margin Halaman

```
Halaman List:   p-4 (16px all), pb-24 (clearance bottom nav)
Halaman Detail: p-4 space-y-6, pb-24
Card:           px-5 py-5 (20px) atau via Card component default
Header Halaman: flex items-center gap-3, mb-5
```

#### Standar Ukuran Elemen & Touch Target

| Elemen | Ukuran | Catatan |
|---|---|---|
| **Touch target minimum** | 44×44px | Wajib untuk semua elemen interaktif |
| **Icon container (Dashboard)** | 60×60px | border-radius 18px |
| **Icon dalam container** | 24×24px | strokeWidth 2.5 |
| **Button icon-only** | `!p-2.5` = ~40×40px | Dengan area touch minimal 44px |
| **Status badge** | otomatis, min-h auto | px-2.5 py-1 (size sm: px-2 py-0.5) |
| **Input form** | `w-full`, h otomatis | padding: 12px 16px |
| **Card border-radius** | `rounded-2xl` (16px) atau `rounded-3xl` (24px) | Kartu utama pakai 3xl |
| **Icon navigasi** | `w-5 h-5` (20px) | Ikon di header halaman |
| **Icon dalam list item** | `w-4 h-4` (16px) atau `w-3 h-3` (12px) | Sesuai konteks |

---

### 2.4 Iconografi

- **Library:** Lucide React (`lucide-react`) — icon outline style.
- **strokeWidth standar:** `2` untuk semua icon, kecuali:
  - Icon aksen/brand: `strokeWidth={2.5}` (mis. ikon di dashboard icon container)
  - Icon kecil informasional: `strokeWidth={1.8}`
- **Ukuran:**
  - `w-5 h-5` (20px): Icon navigasi back, tombol aksi header
  - `w-4 h-4` (16px): Icon dalam button/action bar
  - `w-3 h-3` (12px): Icon inline dalam teks/badge
  - `w-3.5 h-3.5` (14px): Icon dalam tag/status kecil
- **Warna icon:** Harus menggunakan token warna (`text-text-secondary`, `text-text-tertiary`, `text-brand-accent`), bukan nilai hardcoded.
- **Icon dalam icon container** menggunakan `text-white` dengan `drop-shadow(0 2px 4px rgba(0,0,0,0.1))`.
- Jangan menggunakan icon sebagai pengganti teks pada elemen yang membutuhkan label (kecuali diikuti label visual).

---

## 3. Komponen Global Standar

### 3.1 Button (`Button.tsx`)

```tsx
<Button variant="primary" | "outline" | "ghost" size="sm" | "md" fullWidth disabled />
```

| Varian | Penggunaan | Style Dasar |
|---|---|---|
| `primary` | Aksi utama (simpan, proses, konfirmasi) | `bg-brand-accent text-white`, shadow biru |
| `outline` | Aksi sekunder (batal, filter, navigasi minor) | `border-brand-border bg-transparent` |
| `ghost` | Aksi tersier, link-like | Tanpa border, tanpa background |

- Semua button menggunakan `active:scale-95` untuk press feedback.
- Button primary gradient: `bg-gradient-to-br from-blue-600 to-blue-700`.
- Button dengan icon-only: `!p-2.5` untuk padding khusus.
- State disabled: `opacity-40` atau `disabled:opacity-40`.
- Loading state: teks berubah mis. "Menyimpan..." saat `isLoading`.

### 3.2 Form Elements

```tsx
<input className="form-input" />
<textarea className="form-input resize-none" />
<select className="form-input font-bold" />
<label className="form-label font-bold text-text-secondary" />
```

- Semua form input menggunakan kelas `.form-input` dari `index.css`.
- Background default: `bg-brand-bg/50` (sedikit abu-abu), berubah ke `bg-brand-surface` saat focus.
- Border focus: `border-color: brand-accent` + `box-shadow 0 0 0 1px brand-accent`.
- Placeholder: `color: text-muted` (gray-400).
- Field wajib ditandai dengan `<span className="text-red-500">*</span>` pada label.
- Error state pada field: border berubah ke `border-status-error-text`.
- Spacing antar field: `space-y-4` atau `space-y-5` untuk form section.

### 3.3 Modal Konfirmasi (`ConfirmationModal.tsx`)

```tsx
const { confirm, ConfirmDialog } = useConfirmation();
await confirm({
  title: 'Hapus Pesanan?',
  description: 'Tindakan destruktif ini tidak dapat diurungkan.',
  subject: 'NO-001 — Mitra A',
  variant: 'danger',
  confirmLabel: 'Hapus Permanen',
  requiresDoubleConfirm: true,
  consequences: ['Item 1', 'Item 2'],
});
```

- `ConfirmDialog` harus di-render di dalam komponen yang memanggil `useConfirmation`.
- `variant: 'danger'` menampilkan tombol konfirmasi merah.
- `requiresDoubleConfirm: true` menampilkan checkbox "Saya memahami konsekuensinya".
- Modal menggunakan backdrop `--color-brand-overlay` dan animasi `animate-slide-up`.
- Tombol "Batal" selalu ada dan tampil pertama (sebelah kiri).

### 3.4 StatusConfirmationModal (`orders/StatusConfirmationModal`)

```tsx
<StatusConfirmationModal
  isOpen={boolean}
  currentStatus="Diproses"
  targetStatus="Packing"
  prerequisiteError={string | null}
  consequences={string[]}
  requiresReason={boolean}
  isLoading={boolean}
  onClose={() => {}}
  onConfirm={(reason?) => {}}
/>
```

- Digunakan **khusus** untuk perubahan status pesanan dan item produksi.
- Menampilkan visualisasi `currentStatus → targetStatus`.
- Jika `prerequisiteError` tidak null, tombol konfirmasi dinonaktifkan dan error ditampilkan.
- `requiresReason: true` menampilkan textarea alasan pembatalan.

### 3.5 Toast Notifikasi (`notify`)

```tsx
const toastId = notify.loading('Memproses...');
notify.success('Berhasil disimpan', toastId);
notify.warning('Nama mitra wajib diisi');
notify.error('Terjadi kesalahan', toastId);
```

- `notify.loading()` mengembalikan `toastId` yang harus diteruskan ke `success`/`error` untuk replace.
- Toast muncul di posisi atas tengah layar, auto-dismiss setelah beberapa detik.
- Jangan menampilkan raw error object — gunakan `handleBackendError(error, label, toastId, 'NamaModul')` untuk parsing error backend.

### 3.6 Card (`Card.tsx`)

```tsx
<Card className="border-brand-border bg-brand-surface shadow-sm">
  {/* konten */}
</Card>
```

- Padding default card: ditentukan oleh kelas yang ditambahkan (`px-5 py-5`).
- Border-radius: `rounded-2xl` standar.
- Shadow: `.shadow-soft` atau `.shadow-medium` dari utility; jangan pakai `shadow-xl` kecuali untuk form modal baru.
- Card dalam keadaan interaktif: `active:scale-[0.99] active:border-brand-accent/30 transition-all`.
- Aksen kiri (left accent bar): `absolute top-0 left-0 w-1 h-full bg-brand-accent` untuk card form aktif.

### 3.7 StatusBadge & StatusStepper (`StatusBadge.tsx`)

```tsx
<StatusBadge status="Diproses" size="sm" | "md" />
<StatusStepper currentStatus="Cetak DTF" type="detail" | "order" />
```

**Pemetaan status pesanan ke badge style:**

| Status Pesanan | Kelas Badge | Warna Teks |
|---|---|---|
| Menunggu Konfirmasi | `.badge-neutral` | gray-600 |
| Diproses / Dikonfirmasi | `.badge-info` | blue-600 |
| Packing | `.badge-warning` | amber-700 |
| Selesai | `.badge-success` | emerald-600 |
| Dibatalkan | `.badge-error` | red-600 |

**Pemetaan status item produksi:**

| Status Item | Kelas Badge |
|---|---|
| Menunggu | `.badge-neutral` |
| Cetak DTF | `.badge-info` |
| Sablon | `.badge-production` (violet) |
| Selesai | `.badge-success` |

**StatusStepper** menampilkan alur visual tahapan produksi secara horizontal (icon-only), menandai tahap aktif.

### 3.8 Empty State Standard

```tsx
<div className="text-center py-20 px-6 rounded-[32px] border-2 border-dashed border-brand-border bg-brand-surface/30">
  <div className="bg-brand-bg w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4">
    <IconName className="w-8 h-8 text-text-tertiary/40" />
  </div>
  <h4 className="text-text-primary font-bold text-lg font-display">Belum ada data</h4>
  <p className="text-text-tertiary text-sm mt-1.5 max-w-[240px] mx-auto leading-relaxed">Deskripsi singkat...</p>
</div>
```

### 3.9 Loading State Standard

```tsx
<div className="flex flex-col items-center py-16 gap-4">
  <div className="w-10 h-10 border-[3px] border-brand-accent/10 border-t-brand-accent rounded-full animate-spin" />
  <p className="text-center text-text-tertiary text-sm font-bold tracking-wide">Memuat data...</p>
</div>
```

---

## 4. Dokumentasi Per Modul

### 4.1 Dashboard

**Path:** `/` → `Dashboard.tsx`  
**Deskripsi:** Halaman utama aplikasi berisi grid menu navigasi yang dikelompokkan berdasarkan fungsi.

#### Struktur Layout

```
[Welcome Banner — full width]
[MenuGroupCard: Operasional]
[MenuGroupCard: Master Data]
[MenuGroupCard: Keuangan]
[MenuGroupCard: Sistem]
```

#### Welcome Banner

- Background: multi-layer gradient `from-blue-600 via-blue-700 to-blue-800` + overlay hitam tipis + grid pattern (opacity 0.1) + elemen dekoratif blur.
- Isi: icon building (`Building2`, 10×10px) + nama perusahaan, lalu `h2` "Selamat Datang 👋", lalu deskripsi 12px `text-white/90`.
- Ikon kanan: 46×46px container dengan `bg-white/15`, ikon `Sparkles` 20×20px.
- Margin horizontal: `16px`, border-radius: `rounded-2xl`.

#### Struktur MenuGroupCard

```
MenuGroupCard (rounded-3xl, border brand-border/60, shadow-premium)
├── Group Header (padding 12px 16px 10px)
│   └── Label uppercase, 10px, font-extrabold, tracking 0.12em, text-secondary
├── Divider (1px, margin horizontal 16px)
└── 4-Column Fixed Grid (padding 18px 12px, gap-y 24px)
    └── MenuCell × N (center-aligned, max 4 per row)
        ├── IconContainer (60×60px, border-radius 18px, gradient bg, shadow)
        │   └── Icon (24×24px, text-white, strokeWidth 2.5, drop-shadow)
        └── Label (12px, font-bold 700, text-secondary, max-width 72px, truncate)
```

#### Aturan Grid 4-Kolom Fixed

- Grid selalu 4 kolom (`repeat(4, 1fr)`) tidak peduli jumlah item.
- Item yang kurang dari 4 tetap berada pada kolom kiri; slot kolom kanan kosong.
- `justifyItems: center` agar setiap item center di kolom masing-masing.
- Tidak ada override menjadi grid 2 atau 3 kolom.

#### Pengelompokan Menu

| Grup | Menu Item | Icon | Gradient |
|---|---|---|---|
| **Operasional** | Pesanan | ShoppingCart | blue `#3b82f6 → #1e40af` |
| **Operasional** | Produksi | PackageOpen | blue `#3b82f6 → #1e40af` |
| **Master Data** | Mitra | Users | slate `#64748b → #334155` |
| **Master Data** | Kategori | LayoutGrid | slate `#64748b → #334155` |
| **Master Data** | Produk | Package | slate `#64748b → #334155` |
| **Keuangan** | Keuangan | Wallet | emerald `#10b981 → #065f46` |
| **Sistem** | Aktivitas | Activity | violet `#8b5cf6 → #5b21b6` |

- MenuCell menggunakan `group-active:scale-[0.93]` untuk press animation.
- Animasi slide-up dengan delay bertahap (`cumulativeDelay` per group).

---

### 4.2 Modul Pesanan

#### 4.2.1 Pesanan List

**Path:** `/pesanan` → `PesananList.tsx`

##### Struktur Header Halaman

```
[← ArrowLeft] [h2 "Data Pesanan" + p subtitle] [Button + Plus icon]
```

- 3 kolom: back button (kiri), title block (flex-1 tengah), add button (kanan).
- Back button: `p-2 -ml-2 rounded-full`, touch target ≥44px.
- Add button: `!p-2.5 bg-gradient-to-br from-blue-600 to-blue-700 border-none shadow-lg shadow-blue-600/20`.

##### Struktur Card Item Pesanan (PesananListItem)

```
Card (overflow-hidden, border-brand-border/80, !p-0)
├── Left accent bar (w-1, h-full, gradient biru saat expanded)
├── [Clickable Area → navigate ke /pesanan/:id]
│   ├── Header Row (px-4 pl-5, pt-4 pb-3)
│   │   ├── Kiri: h3 nama_mitra + meta row (tanggal • no_pesanan • qty)
│   │   └── Kanan: <StatusBadge size="sm" />
│   └── Expanded Content (grid rows transition, opacity animation)
│       └── List order_details (border-l-2, klik → /pesanan/detail-item/:id)
└── Expand/Collapse Handle (py-1.5, border-t)
    ├── Pill bar (w-10 h-1, rounded-full)
    └── ChevronDown (rotate-180 saat expanded)
```

##### Meta Row dalam Header Card

- Format: `[tanggal]` • `[no_pesanan uppercase monospace]` • `[Package icon] [qty] Pcs`
- Tanggal format: `dd MMM yyyy` via `id-ID` locale.
- No pesanan menggunakan `font-mono text-xs uppercase tracking-wider`.

##### Collapse List (Expanded Content)

- Menggunakan `grid-rows-[1fr]/[0fr]` trick untuk animasi collapse tanpa pengukuran height.
- Item detail dalam collapse: klik navigasi ke `/pesanan/detail-item/:id`, `e.stopPropagation()` agar tidak trigger navigasi halaman.
- Setiap detail item: nama produk (h4, font-bold), qty chip (10px), deskripsi (italic, line-clamp-1).
- Jika `deskripsi_desain` kosong: teks "Tanpa deskripsi" italic muted.

##### Aturan Hapus vs Batalkan

| Kondisi | Aksi yang Tersedia | Warna |
|---|---|---|
| Status `Menunggu Konfirmasi` | Hapus Permanen | Merah destructive |
| Status `Dibatalkan` | Hapus Permanen | Merah destructive |
| Status `Diproses`, `Packing`, `Selesai` | Batalkan | Orange (tidak merah) |
| Status `Diproses` | Edit juga tersedia | — |

```tsx
const canDelete = status === 'Menunggu Konfirmasi' || status === 'Dibatalkan';
const canCancel = ['Diproses', 'Packing', 'Selesai'].includes(status);
```

---

### 4.3 Detail Pesanan & Produksi

**Path:** `/pesanan/:id` → `PesananDetail.tsx`

#### Struktur Header Halaman (3 Kolom)

```
grid grid-cols-[auto_1fr_auto]
├── [← ArrowLeft] (kolom auto)
├── [h2 "Detail Pesanan" + StatusBadge] (kolom 1fr)
└── [tombol Batalkan dan/atau Hapus] (kolom auto)
```

- Tombol "Batalkan" (canCancel): border-orange-100, text-orange-600, `active:bg-orange-50`.
- Tombol "Hapus" (canDelete): border-red-100, text-red-600, `active:bg-red-50`.
- Keduanya memiliki `px-3 py-1.5` dan ikon `Trash2`.

#### Card Utama Detail Pesanan (Order Overview Card)

```
Card (bg-brand-surface, shadow-sm)
├── Dekorasi sudut (absolute, w-32 h-32, blue-600/[0.02], rounded-bl-120)
├── Row 1: Nama Mitra + No Pesanan | Tombol Edit/Proses/Selesaikan
│   └── h3 font-bold text-lg: "[nama_mitra] - [no_pesanan font-mono]"
├── Row 2: grid 2 kolom
│   ├── Kiri: [Calendar icon] Tanggal (format: dd MMMM yyyy)
│   └── Kanan: [Globe icon] Sumber Pesanan
├── Row 3: Total Pembayaran (kanan-aligned)
│   └── text-2xl font-bold text-brand-accent font-display
└── Row 4: Informasi Pengiriman
    ├── Online: tombol "Lihat Dokumen Resi" (biru) atau warning "Resi belum diunggah" (merah)
    └── Offline: nama penerima + kontak + alamat
```

#### Tombol Aksi Status Kondisional (inline dalam Card)

| Status Pesanan | Tombol Ditampilkan | Warna |
|---|---|---|
| `Menunggu Konfirmasi` | Edit + **Proses** | Biru |
| `Diproses` | (tidak ada di card, hanya canCancel di header) | — |
| `Packing` | **Selesaikan** | Emerald |
| `Selesai` | (tidak ada) | — |

#### Sistem Status Dinamis: "Dikonfirmasi"

- Jika status order = `Diproses` **dan** semua `order_details` berstatus `Menunggu`, maka tampilkan display status **"Dikonfirmasi"** (via `getOrderDisplayStatus()`).
- Segera setelah satu detail berubah dari `Menunggu`, display status kembali ke `Diproses`.
- Ini adalah **status tampilan saja** — tidak mengubah nilai DB.

#### Kartu Produksi (Per Item)

```
Card (clickable → /pesanan/detail-item/:id, cursor-pointer, active:scale-[0.99])
├── Row 1: Nama Produk (h4 font-bold font-display text-lg) + Tombol Aksi Status
│   └── Chip Qty: bg-brand-accent/10 text-brand-accent px-2 py-0.5 rounded
├── Status Progress Track (hanya jika status != 'Menunggu Konfirmasi')
│   └── Kontainer bg-brand-bg p-5 rounded-3xl
│       └── Label "TAHAPAN PRODUKSI" (section-label) + <StatusStepper />
├── Deskripsi Desain (tag inline: Tag icon + teks italic, truncate)
├── Grid Aset Desain (horizontal scroll, 96×96px per tile)
│   └── Gambar atau FileText icon untuk file non-gambar
└── Subtotal Item (border-t, section-label + nilai bold)
```

#### Tombol Aksi Status Item (Icon-only di atas card)

| Status Item | Tombol | Warna |
|---|---|---|
| `Menunggu` | Cetak | Biru, shadow-blue-600/20 |
| `Cetak DTF` | Sablon | Indigo, shadow-indigo-600/20 |
| `Sablon` | Selesai | Emerald, shadow-emerald-600/20 |
| `Selesai` | (tidak ada) | — |
| `Menunggu Konfirmasi` (order) | (semua aksi tersembunyi) | — |

---

### 4.4 Modul Mitra

**Path:** `/mitra` → `MitraList.tsx`

#### Validasi Nama Unik

- Backend memvalidasi `nama_mitra` tidak boleh duplikat.
- Error dari backend ditangkap `handleBackendError()` dan ditampilkan sebagai toast error.
- Tidak ada validasi duplikat di sisi client (backend is source of truth).

#### Struktur Header

```
[← ArrowLeft] [h2 "Data Mitra" + p subtitle] [Button + Plus] (if !showAddForm)
```

- Tombol Plus (`!p-2.5`) hanya muncul jika form tidak sedang tampil.

#### Form Tambah/Edit Mitra (inline card)

```
Card (border-accent/20, animate-slide-up, relative overflow-hidden)
├── Left accent bar biru (absolute, w-1, h-full)
├── Form header: [h3 "Tambah/Edit Mitra"] + [X button]
├── Field: Nama Mitra* (required)
├── Field: Kontak (WhatsApp/Telp) - type tel
├── Field: Alamat Lengkap (textarea rows=3)
├── 2-Kolom: [Status Kerjasama select] [Limit Tagihan NumberInput]
└── 2-Kolom buttons: [Batal outline] [Simpan primary]
```

- Saat mode edit (`editingId` tidak null), item yang sedang diedit **tidak muncul di list** (difilter via `mitras.filter(m => m.id !== editingId)`).
- Scroll ke atas otomatis (`window.scrollTo({ top: 0, behavior: 'smooth' })`) saat form edit terbuka.

#### Card Item Mitra

```
Card (shadow-sm, active:scale-[0.99])
├── Flex row:
│   ├── Kiri: h4 nama_mitra (font-extrabold 16px) + kontak (text 13px) + alamat (chip bg-brand-bg)
│   └── Kanan: StatusBadge + [Edit2 button] + [Trash2 button]
└── Footer bar (bg-brand-bg/30, border-t):
    ├── Kiri: label "LIMIT TAGIHAN" + nilai IDR (font-extrabold 15px)
    └── Kanan: ID singkat uppercase monospace
```

#### Konfirmasi Hapus Mitra

- `variant: 'danger'` + `requiresDoubleConfirm: true`.
- Consequences: mitra tidak muncul di transaksi baru, riwayat keuangan tetap disimpan.
- Backend mencegah penghapusan jika ada pesanan aktif terkait.

---

### 4.5 Modul Produk & Kategori

#### 4.5.1 Produk

**Path:** `/produk` → `ProdukList.tsx`

##### Relasi Produk-Kategori

- Setiap produk wajib memiliki `category_id` (required, tidak boleh null).
- Label kategori tampil di dalam card produk: `text-xs font-bold text-brand-accent uppercase tracking-wider`.
- Filter berdasarkan kategori tersedia melalui klik badge kategori pada tampilan Kategori.

##### Statistik Qty Pesanan Aktif

- Tampil di footer card produk jika `activeQty > 0`.
- Sumber data: `activeOrderQtyMap` dari `useProductStore` — dihitung dari pesanan berstatus `Diproses`.
- Chip: `bg-blue-50 text-blue-700 border-blue-100`, ikon `ShoppingBag 3.5`, teks `[qty] pcs aktif`.

##### Aturan Edit Mode di List

- Item yang sedang diedit (`editingId`) **tidak ditampilkan** pada list (`visibleProducts = products.filter(p => p.id !== editingId)`).
- Ini mencegah duplikasi visual antara form edit dan card list.

##### Validasi Penghapusan Produk

- Backend mencegah penghapusan jika ada pesanan aktif yang menggunakan produk.
- Frontend menampilkan `activeQty` dalam daftar consequences saat konfirmasi hapus.
- Foto produk dihapus dari storage sebelum record dihapus.

##### Struktur Card Produk

```
Card (shadow-sm, active:scale-[0.99])
├── Flex row:
│   ├── Product Image (72×72px, rounded-xl, object-cover)
│   │   └── Fallback: Package icon opacity-40
│   └── Info:
│       ├── h4 nama_produk (font-extrabold 15px font-display) + StatusBadge + Edit + Trash buttons
│       └── Kategori nama (text-xs brand-accent uppercase)
└── Footer bar (bg-brand-bg/30, border-t):
    ├── Kiri: label "HARGA BASE" + nilai IDR (15px font-extrabold tabular-nums)
    └── Kanan: chip "N pcs aktif" (jika activeQty > 0)
```

#### 4.5.2 Kategori

**Path:** `/kategori` → `KategoriList.tsx`

- Klik kategori pada list menampilkan produk-produk terkait dalam panel bawah atau navigasi ke filter produk.
- Backend mencegah penghapusan kategori yang masih memiliki produk terkait — error ditampilkan via toast.
- Form kategori mengikuti pola yang sama dengan Mitra dan Produk (inline card, left accent bar, `animate-slide-up`).

---

### 4.6 Modul Keuangan

**Path:** `/keuangan` → `FinanceList.tsx` + `FinanceDetail.tsx`

#### Struktur Header FinanceList

```
[← ArrowLeft] [h2 "Sistem Keuangan" + p "Ringkasan Arus Kas per Mitra"] [RefreshCw button]
```

- Tombol refresh: `p-2 rounded-xl active:bg-brand-border/40 disabled:opacity-40`, ikon berputar saat loading.

#### Struktur Card Ringkasan Keuangan per Mitra

```
Card (clickable → /keuangan/:mitra_id, active:border-emerald-600/30 active:bg-emerald-50/10)
├── Header: [label "MITRA" + h4 nama_mitra] | [label "Saldo Tagihan" + nilai IDR (emerald/rose)]
│   └── Nilai saldo: emerald-600 (positif) atau rose-600 (negatif)
└── Tagihan Pending bar (bg-amber-50, border-amber-100, shadow-amber-600/5)
    └── [Clock icon amber-700] "Tagihan Pending" | nilai IDR font-extrabold amber-700
```

#### Logic Tagihan Pending

- **Definisi:** Estimasi tagihan dari pesanan yang belum lunas tapi sudah diproses.
- **Hanya mencakup** pesanan dengan status `Diproses` dan `Packing`.
- Pesanan `Menunggu Konfirmasi`, `Selesai`, dan `Dibatalkan` **tidak masuk** kalkulasi.
- Nilai dikalkulasi di backend/database view, bukan di frontend.

#### Relabeling Konsisten Keuangan

| Label Lama | Label Baru |
|---|---|
| Saldo Kas | Saldo Tagihan |
| Total Masuk | Total Tagihan |
| Estimasi Tagihan | Tagihan Pending |

#### FinanceDetail (Filter Date Range)

- Terdapat tombol filter (kalender icon) untuk memilih tanggal mulai–selesai.
- **Total Tagihan** dan **Total Pembayaran** hanya tampil jika filter aktif.
- Filter aktif ditampilkan secara ringkas di bawah header ("1 Jan – 28 Feb 2026").
- Daftar transaksi difilter berdasarkan date range yang dipilih.
- Reset filter mengembalikan tampilan ke kondisi default (tanpa summary total).

---

### 4.7 Modul Aktivitas / Audit Trail

**Path:** `/aktivitas` → `AktivitasList.tsx`

#### Struktur Log Minimal Standar Audit

Setiap log activity (`ActivityLog`) berisi:

| Field | Tipe | Keterangan |
|---|---|---|
| `id` | UUID | Identifier unik |
| `action` | `CREATE` \| `UPDATE` \| `DELETE` \| `STATUS_CHANGE` \| `CANCEL` | Jenis aksi |
| `module` | string | Modul sumber (Pesanan, Produk, dll) |
| `description` | string | Deskripsi human-readable |
| `reference_id` | string | ID entitas terkait |
| `user_id` | string | Identifikasi pengguna |
| `timestamp` | ISO datetime | Waktu aksi (Jakarta timezone) |
| `old_value` | JSON \| null | Nilai sebelum perubahan |
| `new_value` | JSON \| null | Nilai setelah perubahan |

#### Struktur ActivityCard

```
div (bg-brand-surface, border, rounded-2xl, shadow-sm)
├── Top Row: [ActionBadge] [ModuleBadge] | [Clock icon + time relative]
├── Description (text-13px, text-primary, font-semibold)
└── Footer (border-t):
    ├── Kiri: [REF: id singkat] + "oleh [user_id]"
    └── Kanan: tombol "Detail ↕" (jika ada old/new value)
        └── Expanded: ValueDiff (field: lama → baru, format monospace)
```

#### ActionBadge Styles

| Action | Icon | Label | Style |
|---|---|---|---|
| `CREATE` | Plus | Buat | badge-success (hijau) |
| `UPDATE` | Pencil | Ubah | badge-info (biru) |
| `DELETE` | Trash2 | Hapus | badge-error (merah) |
| `STATUS_CHANGE` | ArrowRightLeft | Status | badge-warning (amber) |
| `CANCEL` | XCircle | Batal | badge-error (merah) |

#### Filter & Paginasi

- Tombol filter (Filter icon) toggle panel filter.
- Panel filter: search teks bebas, dropdown Modul, dropdown Aksi, date range dari-sampai.
- Tombol "Reset" muncul di header panel filter hanya jika ada filter aktif.
- Hasil: label total aktivitas + counter halaman.
- Paginasi: 25 item per halaman, tombol Sebelumnya/Selanjutnya (disabled di batas).
- Navigasi halaman otomatis scroll ke atas.

#### Waktu Relatif & Format Timestamp

- Tampil relatif di card: "Baru saja", "5 menit lalu", "2 jam lalu", "3 hari lalu".
- Jika > 7 hari: format `dd MMM yyyy HH:mm` (id-ID, timezone Asia/Jakarta).
- Expanded detail: format lengkap dengan hari + tanggal + jam + detik.

---

## 5. Checklist Audit Keseragaman

✅ Audit kesisteman telah dilakukan pada **Maret 2026**.
Seluruh komponen `hover:` dan `group-hover:` telah direfaktor menggunakan pseudoclass `active:` dan `group-active:` untuk mematuhi prinsip mobile-first.
Seluruh elemen notifikasi toast telah diperbarui untuk merujuk pada CSS token warna sistem dari `index.css`.
Tidak ditemukan sisa-sisa elemen antarmuka peninggalan skema dark-mode.
Aplikasi dipastikan **tampil secara konsisten dan memenuhi standar.**
Gunakan checklist ini untuk memverifikasi setiap halaman atau komponen baru.

### 5.1 Tipografi

- [ ] Heading halaman menggunakan `.page-title` (Outfit, 20px, 700)
- [ ] Deskripsi bawah heading menggunakan `.page-subtitle` (12px, 400, text-tertiary)
- [ ] Nama utama dalam card menggunakan `h4 font-display font-extrabold`
- [ ] Label section uppercase menggunakan `.section-label` (11px, 700, uppercase)
- [ ] Body text menggunakan Inter, 15px, 400
- [ ] Caption/metadata menggunakan 12px (text-xs atau `.caption`)
- [ ] Badge/tag terkecil tidak kurang dari 10px
- [ ] `font-mono` hanya digunakan untuk nilai ID, nomor referensi, dan kode teknis

### 5.2 Warna

- [ ] Tidak ada nilai warna hardcoded hex di luar CSS variable (`--color-*`)
- [ ] Teks utama (konten) menggunakan `text-text-primary`
- [ ] Teks pendukung menggunakan `text-text-secondary`
- [ ] Metadata/caption menggunakan `text-text-tertiary`
- [ ] `text-muted` hanya untuk placeholder dan teks non-esensial
- [ ] Status badge menggunakan utility class `.badge-*` yang sesuai
- [ ] Gradient tombol primary: `from-blue-600 to-blue-700` (tidak ada variasi lain)
- [ ] Tidak ada sisa class `dark:` atau nilai warna dark mode
- [ ] Background halaman menggunakan `bg-brand-bg`
- [ ] Card background menggunakan `bg-brand-surface`

### 5.3 Spacing

- [ ] Padding halaman konsisten `p-4` (16px)
- [ ] Padding bawah `pb-24` untuk clearance bottom navigation
- [ ] Gap antar card dalam list: `space-y-3` atau `space-y-4`
- [ ] Padding card: `px-5 py-5` (via Card props atau className)
- [ ] Tidak ada magic number padding/margin di luar kelipatan 4px
- [ ] Header halaman menggunakan `flex items-center gap-3 mb-5`

### 5.4 Iconografi

- [ ] Semua ikon dari `lucide-react`
- [ ] `strokeWidth` standar: 2 (atau 2.5 untuk ikon dalam container/aksen)
- [ ] Ukuran ikon konsisten sesuai konteks (w-5 h-5 navigasi, w-4 h-4 action, w-3 h-3 inline)
- [ ] Warna ikon menggunakan Tailwind token (bukan nilai hardcoded)
- [ ] Ikon dalam container berwarna `text-white` dengan drop-shadow

### 5.5 Navigasi & Interaksi

- [ ] Tidak ada class `hover:*` pada elemen interaktif
- [ ] Semua elemen interaktif menggunakan `active:*` untuk touch feedback
- [ ] Touch target minimum 44×44px untuk semua tombol/link
- [ ] Back button: `p-2 -ml-2 rounded-full active:bg-brand-border/40 transition-colors`
- [ ] Bottom navigation tidak melebihi 3 item
- [ ] Tidak ada header sticky/fixed

### 5.6 Konsistensi State

- [ ] Loading state menggunakan pola spinner standar (spinner biru + teks)
- [ ] Empty state menggunakan pola standar (ikon dalam container rounded, heading, deskripsi)
- [ ] Error state ditampilkan via toast `notify.error()`, bukan inline teks merah bebas
- [ ] Aksi destruktif selalu menggunakan `ConfirmationModal` dengan `variant: 'danger'`
- [ ] Aksi hapus permanen menggunakan `requiresDoubleConfirm: true`
- [ ] Perubahan status pesanan menggunakan `StatusConfirmationModal`
- [ ] Semua mutasi melewati Zustand store dan dikonfirmasi backend sebelum UI diperbarui
- [ ] Item yang sedang diedit tidak ditampilkan di list

### 5.7 Kepatuhan Aturan Desain Sistem

- [ ] Tidak ada perubahan struktur layout (grid, flex direction) tanpa alasan UX yang jelas
- [ ] Tidak ada logic bisnis di komponen UI (kalkulasi status, filter, dll di luar store/utils)
- [ ] Format angka IDR menggunakan `Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })`
- [ ] Format tanggal menggunakan `toLocaleDateString('id-ID', { ... })` dengan locale yang konsisten
- [ ] `animate-slide-up` digunakan untuk elemen yang muncul (form, card baru)
- [ ] `animate-fade-in` digunakan untuk overlay/backdrop
- [ ] Scrollbar hidden pada area scroll horizontal: `.no-scrollbar`
- [ ] Tidak ada `overflow-x-scroll` tanpa `.no-scrollbar`

---

*Dokumen ini diperbarui secara berkala seiring perkembangan aplikasi. Setiap penambahan komponen atau modul baru wajib disertai pembaruan dokumentasi ini.*

## Changelog

- 2026-03-04: Penyesuaian UI Detail View Pesanan (PesananDetail.tsx). Header disesuaikan ke tiga kolom dengan nama mitra sebagai judul utama. Card utama (detail pelanggan) menampilkan Nomor Pesanan dan Badge Status sejajar, serta tidak lagi menampilkan nama pelanggan.
