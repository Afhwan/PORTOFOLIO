# Product Requirements Document (PRD)
## Portfolio Website — Junior Cybersecurity Engineer

**Versi:** 1.0
**Tanggal:** 7 Oktober 2026
**Status:** Draft untuk Development
**Pemilik Produk:** Junior Cybersecurity Engineer (personal portfolio)

---

## 1. Ringkasan Produk

### 1.1 Latar Belakang
Seorang junior cybersecurity engineer membutuhkan portfolio website profesional untuk menampilkan sertifikat, pengalaman kompetisi (CTF, bug bounty, dll.), proyek, dan informasi profesional lainnya. Website ini menargetkan dua pasar sekaligus: **Indonesia** dan **global (internasional)**, sehingga harus mendukung multi-bahasa (Bahasa Indonesia & Inggris).

Masalah utama yang ingin dipecahkan: pemilik bukan ingin mengedit kode setiap kali ada update (sertifikat baru, lomba baru, dll.). Dibutuhkan **control panel (admin dashboard)** agar pemilik bisa menambah/mengubah konten portfolio secara mandiri tanpa menyentuh codebase.

### 1.2 Tujuan Produk
- Menjadi "single source of truth" untuk personal branding profesional di bidang cybersecurity.
- Memudahkan rekruter/HR/perusahaan (dalam & luar negeri) menilai kredibilitas kandidat.
- Mengurangi effort maintenance konten hingga < 5 menit per update melalui control panel.

### 1.3 Ruang Lingkup
**In-scope:**
- Website portfolio publik (frontend) dengan dukungan bilingual (ID/EN).
- Control panel dengan autentikasi untuk CRUD konten.
- Konten dinamis: profil, sertifikat, kompetisi, proyek, pengalaman, blog/write-up (opsional fase lanjut).
- Deployment di Vercel dengan database Supabase.

**Out-of-scope (untuk saat ini):**
- Komentar publik / forum.
- Multi-user / multi-admin.
- E-commerce atau pembayaran.
- Integrasi ATS rekruter.

---

## 2. Target Pengguna & Persona

### 2.1 Pengguna Akhir (Visitor)
| Persona | Deskripsi | Kebutuhan |
|---|---|---|
| Rekruter Indonesia | HR/tech recruiter perusahaan lokal | Melihat CV, sertifikat, kontak; bahasa Indonesia |
| Rekruter Global | Hiring manager / security lead luar negeri | Versi Inggris, bukti kompetisi & sertifikat internasional |
| Sesama profesional | Komunitas security, CTF player | Write-up, proyek, link GitHub/LinkedIn |

### 2.2 Pengguna Admin (Pemilik Website)
- Junior cybersecurity engineer (pemilik) yang ingin update konten tanpa deploy ulang kode.

---

## 3. Arsitektur Teknis

### 3.1 Tech Stack
| Layer | Teknologi |
|---|---|
| Frontend | Next.js (App Router), Tailwind CSS |
| Backend API | Express.js (REST API) |
| Database | Supabase (PostgreSQL + Supabase Auth + Supabase Storage) |
| Deployment | Vercel (frontend + serverless API), Supabase Cloud (DB) |
| i18n | next-intl / next-i18next (ID & EN) |
| Autentikasi Admin | Supabase Auth (email/password) + JWT |

### 3.2 Arsitektur Tingkat Tinggi
```
[Visitor] ──► [Next.js Frontend (Vercel)] ──► [Express.js API (Vercel Serverless)] ──► [Supabase]
[Admin]   ──► [Control Panel /admin]       ──► [Express.js API + Auth Middleware] ──► [Supabase]
```

### 3.3 Skema Database (Draft Awal)
- **profiles**: id, name_id, name_en, title_id, title_en, bio_id, bio_en, photo_url, email, linkedin, github, cv_url, updated_at
- **certificates**: id, title, issuer, issue_date, expiry_date, credential_url, image_url, category, is_featured, created_at
- **competitions**: id, name, organizer, date, result/achievement, ctf_writeup_url, description_id, description_en, created_at
- **projects**: id, title_id, title_en, description_id, description_en, tech_stack[], repo_url, demo_url, image_url, is_featured, created_at
- **experiences**: id, role_id, role_en, company, start_date, end_date, description_id, description_en
- **site_settings**: key, value (untuk konfigurasi global, mis. mode maintenance)

---

## 4. Kebutuhan Fungsional

### 4.1 Frontend Publik
| ID | Fitur | Prioritas |
|---|---|---|
| F-01 | Landing page: hero, about, sertifikat, kompetisi, proyek, pengalaman, kontak | Must |
| F-02 | Language switcher (ID/EN) | Must |
| F-03 | Dark mode (relevan untuk tema cybersecurity) | Must |
| F-04 | Responsive design (mobile-first) | Must |
| F-05 | SEO optimization (meta tags, Open Graph, sitemap) | Must |
| F-06 | Download CV (PDF) | Should |
| F-07 | Filter/pencarian sertifikat & proyek berdasarkan kategori/tech stack | Should |
| F-08 | Halaman blog/write-up CTF | Could (Fase 3) |

### 4.2 Control Panel (Admin)
| ID | Fitur | Prioritas |
|---|---|---|
| A-01 | Login admin (Supabase Auth, single user) | Must |
| A-02 | Dashboard ringkasan konten | Must |
| A-03 | CRUD Sertifikat (dengan upload gambar ke Supabase Storage) | Must |
| A-04 | CRUD Kompetisi | Must |
| A-05 | CRUD Proyek | Must |
| A-06 | Edit profil & pengalaman | Must |
| A-07 | Upload/ganti CV | Should |
| A-08 | Toggle "featured" untuk konten unggulan | Should |
| A-09 | Preview konten sebelum publish | Could |
| A-10 | CRUD blog/write-up | Could (Fase 3) |

### 4.3 Non-Fungsional
- **Performance:** LCP < 2.5s, Lighthouse score ≥ 90.
- **Security:** HTTPS, rate limiting API, input sanitization, RLS (Row Level Security) di Supabase, JWT untuk endpoint admin, env variables tidak terekspos.
- **Availability:** Mengikuti SLA Vercel & Supabase (target 99.9%).
- **Scalability:** Konten bertambah tanpa perlu perubahan skema besar.

---

## 5. Timeline Pengembangan (3 Fase)

### 🟢 Fase 1 — Foundation & Public Website (Minggu 1–4)
**Goal:** Website publik live dengan konten statis/hardcoded dari database (read-only).

| Minggu | Deliverable |
|---|---|
| 1 | Setup project (Next.js + Tailwind), desain UI/UX (wireframe → mockup), setup Supabase project & skema database |
| 2 | Setup Express.js API (struktur, koneksi Supabase, endpoint GET publik), implementasi i18n (ID/EN) |
| 3 | Pengembangan halaman publik: hero, about, sertifikat, kompetisi, proyek, pengalaman, kontak; dark mode; responsive |
| 4 | SEO, integrasi API ke frontend, deploy staging di Vercel, QA & bug fixing, **launch v1.0 publik** |

**Kriteria Sukses Fase 1:**
- Website publik dapat diakses di domain Vercel, bilingual, responsive.
- Data sertifikat/kompetisi/proyek diambil dari Supabase (bukan hardcoded).

---

### 🟡 Fase 2 — Control Panel (Minggu 5–8)
**Goal:** Admin dapat mengelola seluruh konten tanpa menyentuh kode.

| Minggu | Deliverable |
|---|---|
| 5 | Implementasi Supabase Auth + JWT middleware di Express; halaman login admin; proteksi route `/admin` |
| 6 | CRUD Sertifikat & Kompetisi (API + UI control panel), upload gambar ke Supabase Storage |
| 7 | CRUD Proyek, edit Profil & Pengalaman, upload CV; dashboard ringkasan |
| 8 | Validasi form, error handling, RLS policy di Supabase, security hardening, QA end-to-end, **launch v2.0** |

**Kriteria Sukses Fase 2:**
- Admin login dan dapat menambah sertifikat baru dalam < 5 menit tanpa redeploy.
- Semua endpoint admin terproteksi; data publik read-only untuk visitor.

---

### 🔵 Fase 3 — Enhancement & Growth (Minggu 9–12)
**Goal:** Fitur pendukung untuk meningkatkan kredibilitas & jangkauan.

| Minggu | Deliverable |
|---|---|
| 9 | Blog/write-up CTF (CRUD di control panel + halaman publik) dengan markdown editor |
| 10 | Filter & pencarian konten, toggle featured, preview sebelum publish |
| 11 | Analytics (Vercel Analytics/Plausible), optimasi performance, custom domain + konfigurasi DNS |
| 12 | Final QA, dokumentasi (README + panduan admin), penyerahan & **launch v3.0 final** |

**Kriteria Sukses Fase 3:**
- Blog aktif dengan minimal 1 write-up terpublish.
- Custom domain live, analytics terpasang, dokumentasi admin lengkap.

---

## 6. Metrik Keberhasilan
| Metrik | Target |
|---|---|
| Waktu update konten via control panel | < 5 menit |
| Lighthouse performance score | ≥ 90 |
| Uptime | ≥ 99.9% |
| Bounce rate visitor rekruter | < 50% (via analytics, Fase 3) |

## 7. Risiko & Mitigasi
| Risiko | Mitigasi |
|---|---|
| Kredensial Supabase bocor | Env variables di Vercel, RLS aktif, jangan commit `.env` |
| Free tier Vercel/Supabase limit (serverless timeout, DB storage) | Optimasi query, kompresi gambar, monitoring usage; upgrade plan jika perlu |
| Serangan pada endpoint admin (brute force) | Rate limiting, Supabase Auth policy, opsi 2FA |
| Scope creep (fitur baru di tengah fase) | Semua permintaan baru masuk backlog Fase 3+ |

## 8. Asumsi & Ketergantungan
- Pemilik sudah memiliki akun Vercel & Supabase.
- Aset konten awal (foto, CV, daftar sertifikat) tersedia sebelum Minggu 3 Fase 1.
- Satu orang admin; tidak ada kebutuhan role management.
