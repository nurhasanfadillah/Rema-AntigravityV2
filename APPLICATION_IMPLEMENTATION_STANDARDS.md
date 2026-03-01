## Implementasi Aplikasi Mobile ##
1. Teknologi dan Arsitektur
   1.1 Approach: Mobile-first
   1.2 Frontend:
      1.2.1 React
      1.2.3 Vite
      1.2.4 Tailwind CSS
      1.2.5 Progressive Web App (PWA)
   1.3 Backend: Supabase
   1.4 Database: PostgreSQL
   1.5 Deployment:
      1.5.1 Netlify
      1.5.2 Implementasikan aplikasi mobile berdasarkan dokumen yang telah diberikan.
      1.5.3 Integrasikan Supabase sebagai backend, database, dan penyimpanan file.
      1.5.4 Implementasikan PWA secara optimal pada sisi frontend.

2. Standar UX dan UI
   2.1 Optimalkan UI/UX untuk layar mobile dengan gaya modern, elegan, dan futuristik.
   2.2 Gunakan tema UI/UX Corporate Modern.
   2.3 Gunakan skema warna yang paling relevan dengan fungsi aplikasi, seperti Dark Gray dengan aksen gradasi blue ke dark blue or dark blue ke dark.
   2.4 Navigasi harus ringkas dan intuitif.
   2.5 Kebijakan Layout: Hanya bottom navigation yang diperbolehkan menggunakan posisi sticky/fixed. Komponen lain seperti header, tab, filter bar, dan action bar harus mengikuti flow layout responsif (scroll normal) untuk menjaga stabilitas pengalaman pengguna.
   2.6 Standar Header & Logo: Gunakan layout header yang compact dengan padding proposional (`px-4 py-2.5`). Logo utama (`LOGO_HEADER_REMVAV2`) harus diletakkan di tengah (*center alignment*) dengan skala visual yang dominan namun tidak menyebabkan header terlalu tinggi (`h-9` atau ±36px untuk mobile).
   2.7 Proses input data harus cepat dan efisien.
   2.8 Gunakan Bahasa Indonesia pada antarmuka (UI).
   2.9 Pola Interaksi Kartu (Card Interaction Pattern): Gunakan area kartu yang luas untuk navigasi utama (Full Card Click), pisahkan mekanisme sekunder seperti expand/collapse menggunakan pegangan (handle) visual di bagian bawah, dan pastikan setiap elemen daftar internal mandiri memiliki trigger navigasi yang unik melalui stopPropagation untuk efisiensi alur kerja.
   2.10 Standar Ikon Navigasi Dashboard: Gunakan container ikon dengan ukuran 60x60px dan radius 18px menggunakan gradasi solid yang tegas (tanpa transparansi). Warna dikategorikan berdasarkan fungsi: Operasional (Gradasi Biru), Master Data (Gradasi Biru-Neutral/Slate), dan Keuangan (Gradasi Hijau/Emerald). Ikon menggunakan warna putih dengan stroke-width minimal 2.5 untuk tampilan yang kuat dan profesional.

3. Standar Regional
   3.1 Gunakan format Indonesia untuk mata uang, angka, dan tanggal.
   3.2 Tetapkan timezone: Indonesia/Jakarta.

4. Dokumentasi, Pengujian dan Referensi Teknis
   4.1 Dokumentasikan alur (flow) sistem sejak tahap awal pengembangan dan gunakan ToDo dalam mengerjakan tugas.
   4.2 Lakukan pengujian setelah setiap tugas diselesaikan dan perbaiki jika ditemukan kesalahan.
   4.3 Selalu gunakan Context7 MCP untuk kebutuhan dokumentasi library/API, code generation, serta langkah setup atau konfigurasi tanpa perlu diminta secara eksplisit.