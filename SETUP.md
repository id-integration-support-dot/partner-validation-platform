# Fase 1 — Auth & Database Schema

## 1. Taruh file-file ini di project Anda

Struktur folder yang dibuat (copy persis ke root project, timpa file lama yang sama nama):

```
db/schema.ts
lib/db.ts
lib/auth.ts
lib/auth-client.ts
app/api/auth/[...all]/route.ts
app/login/page.tsx
app/register/page.tsx
app/dashboard/page.tsx
components/sign-out-button.tsx
middleware.ts
drizzle.config.ts
package.json   (ganti yang lama, sudah ada script db:generate & db:migrate)
```

## 2. Set environment variables

**Untuk development lokal** — buat file `.dev.vars` di root project (file ini JANGAN di-commit, tambahkan ke `.gitignore`):

```
BETTER_AUTH_SECRET=ganti-dengan-string-acak-panjang
BETTER_AUTH_URL=http://localhost:3000
```

Generate string acak untuk secret:
```bash
openssl rand -base64 32
```

**Untuk production** — di dashboard Cloudflare project Anda → Settings → Variables and Secrets, tambahkan:
- `BETTER_AUTH_SECRET` (tipe Secret) — boleh pakai nilai acak yang beda dari lokal
- `BETTER_AUTH_URL` (tipe Variable) — isi dengan URL produksi Anda, contoh `https://partner-validation-platform.xxxx.workers.dev`

## 3. Generate & jalankan migrasi database

```bash
npm install
npx drizzle-kit generate
npm run db:migrate:local
```

`drizzle-kit generate` akan baca `db/schema.ts` lalu membuat file SQL migrasi di folder `drizzle/migrations`. Command `db:migrate:local` menerapkan migrasi itu ke database D1 versi lokal (dipakai saat `next dev`).

## 4. Coba jalan di lokal

```bash
npm run dev
```
Buka `http://localhost:3000/register`, daftar satu akun. Lalu coba login di `/login` — akan **gagal** karena status akun masih `pending`. Itu memang disengaja (lihat langkah 5).

## 5. Jadikan akun pertama Anda sebagai admin

Karena belum ada UI admin approval (itu Fase 5), untuk sekarang ubah manual lewat SQL:

```bash
npx wrangler d1 execute partner_integration_db --local --command "UPDATE user SET role='super_admin', status='approved' WHERE email='email-anda@contoh.com';"
```

Sekarang coba login lagi di `/login` — harus berhasil dan diarahkan ke `/dashboard`.

## 6. Terapkan migrasi ke database production

```bash
npm run db:migrate:remote
```

Lalu commit & push semua file:

```bash
git add .
git commit -m "feat: auth + database schema (Fase 1)"
git push
```

Setelah Cloudflare selesai deploy, ulangi langkah 5 tapi dengan `--remote` (bukan `--local`) supaya akun admin Anda juga ada di database production:

```bash
npx wrangler d1 execute partner_integration_db --remote --command "UPDATE user SET role='super_admin', status='approved' WHERE email='email-anda@contoh.com';"
```

## Yang sudah jadi di Fase 1 ini

- Skema database: `user`, `session`, `account`, `verification` (standar Better Auth) + field `role`, `companyName`, `status` khusus platform Anda
- Registrasi partner self-service (`/register`) — status otomatis `pending`
- Login (`/login`) dengan email + password
- **Single Active Session** — login dari device baru otomatis logout sesi lama (lihat hook di `lib/auth.ts`)
- Halaman terproteksi (`/dashboard`) yang menampilkan data user yang sedang login
- Middleware yang redirect ke `/login` kalau belum punya sesi

## Yang BELUM ada (menyusul di fase berikutnya)

- UI admin untuk approve/reject partner (Fase 5)
- Pembedaan dashboard partner vs admin berdasarkan role (mulai relevan di Fase 2)
- Dynamic scope selection (Fase 2)
