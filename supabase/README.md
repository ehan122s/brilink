## Setup Supabase

1. Buat project baru di Supabase.
2. Buka SQL Editor lalu jalankan isi file [schema.sql](C:/Users/Hype/Documents/e-pkl/sisfo/supabase/schema.sql).
3. Copy file `.env.example` menjadi `.env`.
4. Isi:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Jalankan ulang aplikasi Vite setelah `.env` terisi.

Catatan:
- Policy di `schema.sql` masih longgar agar MVP front end bisa langsung terhubung dari browser.
- Setelah login owner/kasir sudah dibuat, policy sebaiknya diperketat memakai auth dan role pengguna.
- Halaman `dashboard`, `activity`, dan `reports` membaca tabel `transactions` dan `expenses`.
- Halaman `customers` membaca tabel `customers`.
- Halaman `transactions` sekarang juga membaca tabel `balance_settings` untuk `saldo awal` dan `cash awal`.
- Halaman `expenses` memakai tabel `expenses` untuk CRUD pengeluaran usaha.
- Kalau `customers` atau `expenses` belum Anda buat di project Supabase, halaman tetap hidup tetapi akan menampilkan fallback/status setup.
- Kalau fitur saldo dan cash belum muncul live, jalankan ulang isi [schema.sql](C:/Users/Hype/Documents/e-pkl/sisfo/supabase/schema.sql) agar tabel `balance_settings` ikut dibuat.
- Kalau Anda memakai fitur `admin bank`, jalankan ulang isi `schema.sql` agar kolom `bank_admin_fee` ikut ditambahkan ke tabel `transactions`.
