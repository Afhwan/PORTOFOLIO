"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { authClient } from "@/lib/auth/client";
import type { ManagedTable } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

type FieldKind = "text" | "textarea" | "date" | "url" | "email" | "boolean" | "tags" | "select" | "media";
type Field = {
  name: string;
  label: string;
  kind?: FieldKind;
  required?: boolean;
  options?: { value: string; label: string }[];
};
type AdminRow = Record<string, unknown> & { id?: string };
type AuthUser = { id: string; email?: string };
type DashboardSection = ManagedTable | "overview";

const fields: Record<ManagedTable, Field[]> = {
  profiles: [
    { name: "name_id", label: "Nama (Bahasa Indonesia)", required: true },
    { name: "name_en", label: "Nama (English)", required: true },
    { name: "title_id", label: "Jabatan (Bahasa Indonesia)", required: true },
    { name: "title_en", label: "Title (English)", required: true },
    { name: "bio_id", label: "Bio (Bahasa Indonesia)", kind: "textarea" },
    { name: "bio_en", label: "Bio (English)", kind: "textarea" },
    { name: "photo_url", label: "URL foto profil", kind: "url" },
    { name: "email", label: "Email", kind: "email" },
    { name: "linkedin", label: "URL LinkedIn", kind: "url" },
    { name: "github", label: "URL GitHub", kind: "url" },
    { name: "cv_url", label: "URL CV", kind: "url" },
    { name: "is_published", label: "Publikasikan profil", kind: "boolean" },
  ],
  certificates: [
    { name: "title", label: "Nama sertifikat", required: true },
    { name: "issuer", label: "Penerbit", required: true },
    { name: "issue_date", label: "Tanggal terbit", kind: "date" },
    { name: "expiry_date", label: "Tanggal kedaluwarsa", kind: "date" },
    { name: "credential_url", label: "URL verifikasi", kind: "url" },
    { name: "image_url", label: "URL gambar sertifikat", kind: "url" },
    { name: "document_url", label: "URL file sertifikat (PDF)", kind: "url" },
    { name: "media_urls", label: "Foto kegiatan / dokumentasi", kind: "media" },
    { name: "category", label: "Kategori", required: true },
    { name: "is_featured", label: "Tampilkan sebagai unggulan", kind: "boolean" },
    { name: "is_published", label: "Publikasikan", kind: "boolean" },
  ],
  competitions: [
    { name: "name", label: "Nama kompetisi / CTF", required: true },
    { name: "organizer", label: "Penyelenggara" },
    { name: "date", label: "Tanggal", kind: "date" },
    { name: "achievement", label: "Pencapaian", required: true },
    { name: "ctf_writeup_url", label: "URL write-up", kind: "url" },
    { name: "description_id", label: "Deskripsi (Bahasa Indonesia)", kind: "textarea" },
    { name: "description_en", label: "Description (English)", kind: "textarea" },
    { name: "media_urls", label: "Foto kegiatan / dokumentasi", kind: "media" },
    { name: "is_featured", label: "Tampilkan sebagai unggulan", kind: "boolean" },
    { name: "is_published", label: "Publikasikan", kind: "boolean" },
  ],
  projects: [
    { name: "title_id", label: "Nama proyek (Bahasa Indonesia)", required: true },
    { name: "title_en", label: "Project name (English)", required: true },
    { name: "slug", label: "Slug unik", required: true },
    { name: "description_id", label: "Deskripsi (Bahasa Indonesia)", kind: "textarea" },
    { name: "description_en", label: "Description (English)", kind: "textarea" },
    { name: "tech_stack", label: "Teknologi (pisahkan dengan koma)", kind: "tags" },
    { name: "repo_url", label: "URL repository", kind: "url" },
    { name: "demo_url", label: "URL demo", kind: "url" },
    { name: "image_url", label: "URL gambar utama", kind: "url" },
    { name: "media_urls", label: "Galeri proyek", kind: "media" },
    {
      name: "category",
      label: "Jenis proyek",
      kind: "select",
      required: true,
      options: [
        { value: "website", label: "Website / aplikasi" },
        { value: "game", label: "Game" },
        { value: "security", label: "Cybersecurity" },
        { value: "research", label: "Riset" },
        { value: "other", label: "Lainnya" },
      ],
    },
    { name: "is_featured", label: "Tampilkan sebagai unggulan", kind: "boolean" },
    { name: "is_published", label: "Publikasikan", kind: "boolean" },
  ],
  experiences: [
    { name: "role_id", label: "Jabatan (Bahasa Indonesia)", required: true },
    { name: "role_en", label: "Role (English)", required: true },
    { name: "company", label: "Organisasi / institusi" },
    {
      name: "experience_type",
      label: "Jenis pengalaman",
      kind: "select",
      required: true,
      options: [
        { value: "work", label: "Pekerjaan / magang" },
        { value: "education", label: "Pendidikan" },
        { value: "seminar", label: "Seminar" },
        { value: "conference", label: "Konferensi" },
        { value: "workshop", label: "Workshop / pelatihan" },
        { value: "volunteering", label: "Relawan / komunitas" },
        { value: "other", label: "Lainnya" },
      ],
    },
    { name: "start_date", label: "Tanggal mulai", kind: "date" },
    { name: "end_date", label: "Tanggal selesai (kosong jika masih berlangsung)", kind: "date" },
    { name: "description_id", label: "Deskripsi (Bahasa Indonesia)", kind: "textarea" },
    { name: "description_en", label: "Description (English)", kind: "textarea" },
    { name: "media_urls", label: "Foto kegiatan / dokumentasi", kind: "media" },
    { name: "is_published", label: "Publikasikan", kind: "boolean" },
  ],
  articles: [
    { name: "title_id", label: "Judul (Bahasa Indonesia)", required: true },
    { name: "title_en", label: "Title (English)", required: true },
    { name: "slug", label: "Slug unik", required: true },
    { name: "excerpt_id", label: "Ringkasan (Bahasa Indonesia)", kind: "textarea" },
    { name: "excerpt_en", label: "Excerpt (English)", kind: "textarea" },
    { name: "body_markdown", label: "Isi write-up (Markdown)", kind: "textarea", required: true },
    { name: "media_urls", label: "Foto pendukung", kind: "media" },
    { name: "tags", label: "Tag (pisahkan dengan koma)", kind: "tags" },
    { name: "published_at", label: "Tanggal publikasi", kind: "date" },
    { name: "is_published", label: "Publikasikan write-up", kind: "boolean" },
  ],
};

const tableLabels: Record<ManagedTable, string> = {
  profiles: "Profil",
  certificates: "Sertifikat",
  competitions: "Kompetisi / CTF",
  projects: "Proyek",
  experiences: "Pengalaman",
  articles: "Write-up / Blog",
};

const tableNames = Object.keys(tableLabels) as ManagedTable[];

function getDisplayName(row: AdminRow, table: ManagedTable) {
  const keys: Record<ManagedTable, string[]> = {
    profiles: ["name_id", "name_en"],
    certificates: ["title", "issuer"],
    competitions: ["name", "organizer"],
    projects: ["title_id", "title_en"],
    experiences: ["role_id", "role_en"],
    articles: ["title_id", "title_en"],
  };
  const key = keys[table].find((candidate) => typeof row[candidate] === "string" && row[candidate]);
  return key ? String(row[key]) : "Untitled entry";
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Terjadi kesalahan yang tidak diketahui.";
}

function getSignupErrorMessage(error: unknown) {
  const message = getErrorMessage(error);
  if (/email and password sign up is not enabled/i.test(message)) {
    return "Pendaftaran email/password belum diaktifkan di Neon. Di Neon Console buka Project → Branch → Auth → Configuration, aktifkan email/password sign-up sementara, lalu coba lagi. Setelah akun pemilik berhasil dibuat, nonaktifkan sign-up di Neon dan set ALLOW_ADMIN_SIGNUP=false.";
  }
  return `Pendaftaran gagal: ${message}`;
}

async function requestAdminApi<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, credentials: "same-origin" });
  const body: unknown = response.status === 204 ? null : await response.json();
  if (!response.ok) {
    const message = body && typeof body === "object" && "error" in body &&
      typeof body.error === "string" ? body.error : `Permintaan gagal (${response.status}).`;
    throw new Error(message);
  }
  return body as T;
}

export function AdminPanel() {
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authorized, setAuthorized] = useState(false);
  const [activeTable, setActiveTable] = useState<DashboardSection>("overview");
  const [rows, setRows] = useState<AdminRow[]>([]);
  const [counts, setCounts] = useState<Record<ManagedTable, number>>({
    profiles: 0, certificates: 0, competitions: 0, projects: 0, experiences: 0, articles: 0,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, string | boolean>>({});
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [allowSignup, setAllowSignup] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [uploadField, setUploadField] = useState("image_url");
  const [showPreview, setShowPreview] = useState(false);
  const [markdownFilename, setMarkdownFilename] = useState("");

  const loadRows = useCallback(async (table: ManagedTable) => {
    const data = await requestAdminApi<AdminRow[]>(`/api/admin/${table}`);
    setRows(data);
  }, []);

  const loadCounts = useCallback(async () => {
    const data = await requestAdminApi<Record<ManagedTable, number>>("/api/admin/counts");
    setCounts(data);
  }, []);

  const verifyAdmin = useCallback(async () => {
    const state = await requestAdminApi<{
      configured: boolean;
      authorized: boolean;
      user: AuthUser | null;
      allowSignup: boolean;
    }>("/api/admin/session");
    setConfigured(state.configured);
    setAuthorized(state.authorized);
    setUser(state.user);
    setAllowSignup(state.allowSignup);
    if (state.configured && !state.authorized) {
      const session = await authClient.getSession();
      if (session.data?.user) {
        setErrorMessage("Akun ini tidak diizinkan mengelola portofolio. Pastikan email sama dengan ADMIN_EMAIL.");
        await authClient.signOut();
      }
    }
  }, []);

  const currentFields = useMemo(() => activeTable === "overview" ? [] : fields[activeTable], [activeTable]);

  useEffect(() => {
    void verifyAdmin().catch((error: unknown) => {
      setConfigured(false);
      setErrorMessage(getErrorMessage(error));
    });
  }, [verifyAdmin]);

  useEffect(() => {
    if (authorized) {
      setErrorMessage("");
      if (activeTable === "overview") {
        void loadCounts().catch((error: unknown) => setErrorMessage(getErrorMessage(error)));
        setRows([]);
      } else {
        void loadRows(activeTable).catch((error: unknown) => setErrorMessage(getErrorMessage(error)));
      }
      setEditingId(null);
      setValues({});
      setMarkdownFilename("");
      setUploadField(currentFields.find((field) => field.kind === "url")?.name ?? "");
    }
  }, [activeTable, authorized, currentFields, loadCounts, loadRows]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setErrorMessage("");
    try {
      const { error } = await authClient.signIn.email({ email, password });
      if (error) {
        setErrorMessage(`Login gagal: ${error.message}`);
        return;
      }
      await verifyAdmin();
    } catch (error: unknown) {
      setErrorMessage(`Login gagal: ${getErrorMessage(error)}`);
    } finally {
      setBusy(false);
    }
  }

  async function handleRegister() {
    setBusy(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      const { error } = await authClient.signUp.email({
        name: "Portfolio Owner",
        email,
        password,
      });
      if (error) {
        setErrorMessage(getSignupErrorMessage(error));
        return;
      }
      await verifyAdmin();
      setSuccessMessage("Akun dibuat. Jika email perlu diverifikasi, buka email Anda lalu masuk kembali.");
    } catch (error: unknown) {
      setErrorMessage(getSignupErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  function editRow(row: AdminRow) {
    if (activeTable === "overview") return;
    const nextValues: Record<string, string | boolean> = {};
    currentFields.forEach((field) => {
      const value = row[field.name];
      if (field.kind === "boolean") nextValues[field.name] = Boolean(value);
      else if (Array.isArray(value)) nextValues[field.name] = value.join(field.kind === "media" ? "\n" : ", ");
      else nextValues[field.name] = typeof value === "string" ? (field.kind === "date" ? value.slice(0, 10) : value) : "";
    });
    setEditingId(typeof row.id === "string" ? row.id : null);
    setValues(nextValues);
    setMarkdownFilename("");
    setSuccessMessage("");
    setErrorMessage("");
  }

  function resetForm() {
    if (activeTable === "overview") return;
    setEditingId(null);
    setValues(Object.fromEntries(currentFields.map((field) => [field.name, field.kind === "boolean" ? field.name === "is_published" && activeTable !== "articles" : ""])));
    setMarkdownFilename("");
    setSuccessMessage("");
  }

  async function saveRow(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (activeTable === "overview") return;
    const missingField = currentFields.find((field) =>
      field.required && !String(values[field.name] ?? "").trim(),
    );
    if (missingField) {
      setErrorMessage(`${missingField.label} wajib diisi.`);
      return;
    }
    if ((activeTable === "projects" || activeTable === "articles") &&
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(values.slug ?? ""))) {
      setErrorMessage("Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung di antara kata.");
      return;
    }
    setBusy(true);
    setErrorMessage("");
    setSuccessMessage("");
    let mutationCommitted = false;
    try {
      const payload: Record<string, string | string[] | boolean | null> = {};
      currentFields.forEach((field) => {
        const value = values[field.name];
        if (field.kind === "boolean") payload[field.name] = Boolean(value);
        else if (field.kind === "tags") payload[field.name] = String(value || "").split(",").map((tag) => tag.trim()).filter(Boolean);
        else if (field.kind === "media") payload[field.name] = String(value || "").split(/\r?\n/).map((url) => url.trim()).filter(Boolean);
        else if (field.kind === "date" || field.kind === "url" || field.kind === "email") payload[field.name] = value ? String(value).trim() || null : null;
        else payload[field.name] = String(value || "").trim();
      });
      await requestAdminApi(`/api/admin/${activeTable}${editingId ? `?id=${encodeURIComponent(editingId)}` : ""}`, {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      mutationCommitted = true;
      await loadRows(activeTable);
      setSuccessMessage(`${tableLabels[activeTable]} berhasil disimpan.`);
      setEditingId(null);
      setValues({});
      await loadCounts().catch((error: unknown) => setErrorMessage(`Konten tersimpan, tetapi ringkasan gagal dimuat: ${getErrorMessage(error)}`));
    } catch (error: unknown) {
      setErrorMessage(mutationCommitted
        ? `Konten tersimpan, tetapi daftar gagal diperbarui: ${getErrorMessage(error)}`
        : `Gagal menyimpan: ${getErrorMessage(error)}`);
    } finally {
      setBusy(false);
    }
  }

  async function deleteRow(row: AdminRow) {
    if (activeTable === "overview" || !row.id || !window.confirm(`Hapus ${getDisplayName(row, activeTable)}? Tindakan ini tidak dapat dibatalkan.`)) return;
    setErrorMessage("");
    let mutationCommitted = false;
    try {
      await requestAdminApi(`/api/admin/${activeTable}?id=${encodeURIComponent(row.id)}`, { method: "DELETE" });
      mutationCommitted = true;
      await loadRows(activeTable);
      setSuccessMessage(`${tableLabels[activeTable]} berhasil dihapus.`);
      await loadCounts().catch((error: unknown) => setErrorMessage(`Konten terhapus, tetapi ringkasan gagal dimuat: ${getErrorMessage(error)}`));
      if (editingId === row.id) resetForm();
    } catch (error: unknown) {
      setErrorMessage(mutationCommitted
        ? `Konten terhapus, tetapi daftar gagal diperbarui: ${getErrorMessage(error)}`
        : `Gagal menghapus: ${getErrorMessage(error)}`);
    }
  }

  async function uploadAssets(files: File[], targetField: string) {
    if (!user || activeTable === "overview") return;
    setErrorMessage("");
    setSuccessMessage("");
    if (!files.length) return;
    if (files.some((file) => file.size > 5 * 1024 * 1024)) {
      setErrorMessage("Setiap file harus berukuran maksimal 5 MB.");
      return;
    }
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (files.some((file) => !allowedTypes.includes(file.type))) {
      setErrorMessage("Format file harus JPG, PNG, WebP, atau PDF.");
      return;
    }
    if (targetField === "media_urls" && files.some((file) => !file.type.startsWith("image/"))) {
      setErrorMessage("Galeri hanya menerima file gambar JPG, PNG, atau WebP.");
      return;
    }
    if (targetField === "media_urls") {
      const currentCount = String(values[targetField] ?? "").split(/\r?\n/).filter((url) => url.trim()).length;
      if (currentCount + files.length > 100) {
        setErrorMessage("Galeri dibatasi hingga 100 foto per konten.");
        return;
      }
    }
    setBusy(true);
    const uploadedUrls: string[] = [];
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.set("file", file);
        const result = await requestAdminApi<{ url: string }>("/api/admin/assets", {
          method: "POST",
          body: formData,
        });
        uploadedUrls.push(result.url);
        setValues((current) => {
          if (targetField !== "media_urls") return { ...current, [targetField]: result.url };
          const existing = String(current[targetField] ?? "").split(/\r?\n/).map((url) => url.trim()).filter(Boolean);
          return { ...current, [targetField]: [...existing, result.url].join("\n") };
        });
      }
      setSuccessMessage(`${uploadedUrls.length} file berhasil diunggah. Simpan formulir untuk menerapkan perubahan.`);
    } catch (error: unknown) {
      const partial = uploadedUrls.length ? ` ${uploadedUrls.length} file sebelumnya berhasil diunggah dan sudah ditambahkan ke formulir.` : "";
      setErrorMessage(`Upload gagal: ${getErrorMessage(error)}${partial}`);
    } finally {
      setBusy(false);
    }
  }

  async function importMarkdown(file: File) {
    setErrorMessage("");
    setSuccessMessage("");
    if (!file.name.toLocaleLowerCase().endsWith(".md") || file.size > 200_000) {
      setErrorMessage("Pilih file .md berukuran maksimal 200 KB.");
      return;
    }
    try {
      const content = await file.text();
      if (content.length > 200_000) {
        setErrorMessage("Isi Markdown melebihi batas 200 KB.");
        return;
      }
      setValues((current) => ({ ...current, body_markdown: content }));
      setMarkdownFilename(file.name);
      setSuccessMessage(`${file.name} dimuat ke editor. Simpan write-up untuk menyimpan perubahan.`);
    } catch (error: unknown) {
      setErrorMessage(`File Markdown tidak dapat dibaca: ${getErrorMessage(error)}`);
    }
  }

  async function logout() {
    try {
      const { error } = await authClient.signOut();
      if (error) {
        setErrorMessage(`Logout gagal: ${error.message}`);
        return;
      }
      setUser(null);
      setAuthorized(false);
      setRows([]);
    } catch (error: unknown) {
      setErrorMessage(`Logout gagal: ${getErrorMessage(error)}`);
    }
  }

  if (configured === null) {
    return <main className="admin-shell"><Link className="brand" href="/">← Portfolio</Link><div className="admin-card"><p className="eyebrow">NEON SETUP</p><h1>Memeriksa konfigurasi...</h1></div></main>;
  }

  if (!configured) {
    return <main className="admin-shell"><Link className="brand" href="/">← Portfolio</Link><div className="admin-card"><p className="eyebrow">NEON SETUP REQUIRED</p><h1>Konfigurasi belum tersedia.</h1><p>Atur <code>DATABASE_URL</code>, <code>NEON_AUTH_BASE_URL</code>, <code>NEON_AUTH_COOKIE_SECRET</code>, dan <code>ADMIN_EMAIL</code> di <code>frontend/.env.local</code>, lalu jalankan migrasi Neon.</p>{errorMessage && <p className="admin-error" role="alert">{errorMessage}</p>}</div></main>;
  }

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <div className="admin-header-brand">
          <Link className="brand" href="/"><span className="brand-mark" aria-hidden="true">N_</span><span>AFHWAN <span className="admin-brand-suffix">/ CMS</span></span></Link>
          <span className="admin-owner-badge">RUANG KERJA PRIBADI</span>
        </div>
        {user && <div className="admin-user"><span className="admin-user-email">{user.email}</span><Link className="button button-quiet" href="/">Lihat situs ↗</Link><button className="button button-quiet" type="button" onClick={logout}>Keluar</button></div>}
      </header>
      {!user || !authorized ? (
        <section className="admin-card login-card">
          <p className="eyebrow">AKSES PEMILIK</p><h1>Masuk ke CMS.</h1>
          <p>Masuk menggunakan akun pemilik portofolio yang terhubung dengan <code>ADMIN_EMAIL</code>.</p>
          <form className="admin-form" onSubmit={handleLogin}>
            <label>Email<Input autoComplete="username" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
            <label>Password<Input autoComplete="current-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
            <Button className="button button-primary" type="submit" disabled={busy}>{busy ? "Memproses..." : "Masuk"}</Button>
            {allowSignup && <Button className="button button-quiet" variant="outline" type="button" disabled={busy || !email || password.length < 8} onClick={() => void handleRegister()}>{busy ? "Memproses..." : "Buat akun pemilik"}</Button>}
          </form>
          {errorMessage && <p className="admin-error" role="alert">{errorMessage}</p>}
          <p className="admin-login-note">CMS pribadi · Akses dibatasi ke akun pemilik yang ditentukan di server.</p>
        </section>
      ) : (
        <div className="admin-layout">
          <aside className="admin-sidebar">
            <nav className="admin-navigation" aria-label="Navigasi CMS">
              <span className="admin-nav-label">RUANG KERJA</span>
              <button className={`admin-nav-button${activeTable === "overview" ? " selected" : ""}`} type="button" aria-pressed={activeTable === "overview"} onClick={() => setActiveTable("overview")}>
                <span>Ringkasan</span>
              </button>
              <span className="admin-nav-label admin-nav-label-spaced">KONTEN</span>
              {tableNames.map((table) => (
                <button className={`admin-nav-button${activeTable === table ? " selected" : ""}`} type="button" aria-pressed={activeTable === table} key={table} onClick={() => setActiveTable(table)}>
                  <span>{tableLabels[table]}</span><span className="admin-nav-count">{counts[table]}</span>
                </button>
              ))}
            </nav>
            <div className="admin-sidebar-foot">
              <span className="admin-owner-dot" aria-hidden="true" />
              <div><strong>Akses pemilik</strong><span>Hanya Anda yang dapat mengelola konten</span></div>
            </div>
          </aside>
          <section className="admin-main">
            {errorMessage && <p className="admin-error" role="alert">{errorMessage}</p>}
            {successMessage && <p className="admin-success" role="status">{successMessage}</p>}
            {activeTable === "overview" ? (
              <>
                <div className="admin-title-row admin-page-heading">
                  <div><h1>Ringkasan</h1><p>Kelola konten yang tampil di portofolio Anda.</p></div>
                  <div className="admin-heading-actions">
                    <span className="admin-save-note">Data disimpan ke Neon</span>
                    <button className="button button-quiet" type="button" onClick={() => void loadCounts().catch((error: unknown) => setErrorMessage(getErrorMessage(error)))}>Muat ulang</button>
                  </div>
                </div>
                <div className="overview-grid">{tableNames.map((table) => <button className="overview-card" type="button" key={table} onClick={() => setActiveTable(table)}>
                  <span className="overview-card-label">{tableLabels[table]}</span>
                  <strong>{counts[table]}</strong>
                  <span className="overview-card-link">Buka koleksi <span aria-hidden="true">↗</span></span>
                </button>)}</div>
                <section className="publishing-guide" aria-labelledby="publishing-guide-title">
                  <div><h2 id="publishing-guide-title">Alur publikasi</h2><p>Tinjau konten sebelum ditampilkan di situs.</p></div>
                  <ol><li><span>1</span> Pilih area konten yang ingin diperbarui.</li><li><span>2</span> Simpan sebagai draft atau tandai untuk dipublikasikan.</li><li><span>3</span> Buka situs publik untuk memeriksa hasilnya.</li></ol>
                  <Link className="card-link" href="/">Buka portofolio publik ↗</Link>
                </section>
              </>
            ) : (
              <>
            <div className="admin-title-row admin-page-heading"><div><h1>{tableLabels[activeTable]}</h1><p>Kelola, perbarui, dan atur status publikasi.</p></div><button className="button button-quiet" type="button" onClick={() => void loadRows(activeTable).catch((error: unknown) => setErrorMessage(getErrorMessage(error)))}>Muat ulang</button></div>
            <div className="admin-content-grid">
              <form className="admin-card admin-form" onSubmit={saveRow}>
                <div className="admin-title-row admin-form-heading"><h2>{editingId ? "Edit konten" : "Konten baru"}</h2>{editingId && <button className="text-button" type="button" onClick={resetForm}>Batal</button>}</div>
                {currentFields.map((field) => {
                  if (field.kind === "media") {
                    const urls = String(values[field.name] ?? "").split(/\r?\n/).map((url) => url.trim()).filter(Boolean);
                    return (
                      <fieldset className="media-manager" key={field.name}>
                        <legend>{field.label}</legend>
                        <p>Unggah beberapa foto sekaligus. Gambar maksimal 5 MB per file.</p>
                        <label className="media-upload-button">
                          <span>{busy ? "Mengunggah..." : "Pilih foto kegiatan"}</span>
                          <Input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            multiple
                            disabled={busy}
                            onChange={(event) => {
                              const selected = Array.from(event.currentTarget.files ?? []);
                              event.currentTarget.value = "";
                              void uploadAssets(selected, field.name);
                            }}
                          />
                        </label>
                        {urls.length > 0 && (
                          <ul className="media-preview-grid">
                            {urls.map((url, index) => (
                              <li key={`${url}-${index}`}>
                                <Image src={url} alt={`Pratinjau foto ${index + 1}`} width={320} height={240} unoptimized />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  type="button"
                                  aria-label={`Hapus foto ${index + 1}`}
                                  onClick={() => setValues((current) => ({
                                    ...current,
                                    [field.name]: urls.filter((_, itemIndex) => itemIndex !== index).join("\n"),
                                  }))}
                                >
                                  Hapus
                                </Button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </fieldset>
                    );
                  }
                  if (field.kind === "boolean") {
                    return (
                      <label className="checkbox-field" key={field.name}>
                        <input
                          type="checkbox"
                          checked={Boolean(values[field.name])}
                          onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.checked }))}
                        />
                        {field.label}
                      </label>
                    );
                  }
                  return (
                    <label key={field.name}>
                      {field.label}
                      {field.kind === "textarea" ? (
                        <Textarea
                          rows={field.name === "body_markdown" ? 14 : 4}
                          required={field.required}
                          value={String(values[field.name] ?? "")}
                          onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))}
                        />
                      ) : field.kind === "select" ? (
                        <select
                          required={field.required}
                          value={String(values[field.name] ?? "")}
                          onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))}
                        >
                          <option value="">Pilih {field.label.toLocaleLowerCase()}</option>
                          {field.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                        </select>
                      ) : (
                        <Input
                          type={field.kind === "date" ? "date" : field.kind === "email" ? "email" : field.kind === "url" ? "url" : "text"}
                          required={field.required}
                          value={String(values[field.name] ?? "")}
                          onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))}
                        />
                      )}
                    </label>
                  );
                })}
                {activeTable === "articles" && (
                  <label className="markdown-import">
                    Impor naskah Markdown (.md, maks. 200 KB)
                    <Input
                      type="file"
                      accept=".md,text/markdown,text/plain"
                      disabled={busy}
                      onChange={(event) => {
                        const file = event.currentTarget.files?.[0];
                        event.currentTarget.value = "";
                        if (file) void importMarkdown(file);
                      }}
                    />
                    {markdownFilename && <span>Terakhir dimuat: {markdownFilename}</span>}
                  </label>
                )}
                {activeTable === "articles" && <div className="preview-control">
                  <button className="button button-quiet" type="button" aria-expanded={showPreview} onClick={() => setShowPreview(!showPreview)}>{showPreview ? "Sembunyikan preview" : "Preview write-up"}</button>
                  {showPreview && <div className="markdown-body admin-preview"><ReactMarkdown remarkPlugins={[remarkGfm]}>{String(values.body_markdown ?? "")}</ReactMarkdown></div>}
                </div>}
                {currentFields.some((field) => field.kind === "url") && <div className="upload-row">
                  <label>Upload ke field
                    <select value={uploadField} onChange={(event) => setUploadField(event.target.value)}>
                      {currentFields.filter((field) => field.kind === "url").map((field) => <option key={field.name} value={field.name}>{field.label}</option>)}
                    </select>
                  </label>
                  <label className="file-label">Pilih file<Input type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" disabled={busy} onChange={(event) => { const file = event.currentTarget.files?.[0]; event.currentTarget.value = ""; if (file) void uploadAssets([file], uploadField); }} /></label>
                </div>}
                <div className="form-actions"><Button className="button button-primary" disabled={busy} type="submit">{busy ? "Menyimpan..." : editingId ? "Simpan perubahan" : "Simpan konten"}</Button><Button className="button button-quiet" variant="outline" type="button" onClick={resetForm}>Kosongkan</Button></div>
              </form>
              <div className="admin-list">
                <div className="admin-list-heading"><div><h2>Konten tersimpan</h2><p>{rows.length} entri di koleksi ini</p></div><span>{rows.length}</span></div>
                {rows.length ? rows.map((row) => <article className="admin-row" key={String(row.id)}>
                  <div className="admin-row-copy"><strong>{getDisplayName(row, activeTable)}</strong><Badge variant="outline" className={`admin-status${row.is_published === false ? " is-draft" : " is-published"}`}>{row.is_published === false ? "Draft" : "Dipublikasikan"}</Badge></div>
                  <div className="row-actions"><button className="text-button" type="button" onClick={() => editRow(row)}>Edit</button><button className="text-button danger" type="button" onClick={() => void deleteRow(row)}>Hapus</button></div>
                </article>) : <p className="admin-empty">Belum ada data untuk bagian ini.</p>}
              </div>
            </div>
              </>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
