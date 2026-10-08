"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { authClient } from "@/lib/auth/client";
import type { ManagedTable } from "@/lib/types";

type FieldKind = "text" | "textarea" | "date" | "url" | "email" | "boolean" | "tags";
type Field = { name: string; label: string; kind?: FieldKind; required?: boolean };
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
    { name: "image_url", label: "URL gambar", kind: "url" },
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
    { name: "image_url", label: "URL gambar", kind: "url" },
    { name: "category", label: "Kategori: appsec, blue, research, other", required: true },
    { name: "is_featured", label: "Tampilkan sebagai unggulan", kind: "boolean" },
    { name: "is_published", label: "Publikasikan", kind: "boolean" },
  ],
  experiences: [
    { name: "role_id", label: "Jabatan (Bahasa Indonesia)", required: true },
    { name: "role_en", label: "Role (English)", required: true },
    { name: "company", label: "Organisasi / institusi" },
    { name: "start_date", label: "Tanggal mulai", kind: "date" },
    { name: "end_date", label: "Tanggal selesai (kosong jika masih berlangsung)", kind: "date" },
    { name: "description_id", label: "Deskripsi (Bahasa Indonesia)", kind: "textarea" },
    { name: "description_en", label: "Description (English)", kind: "textarea" },
    { name: "is_published", label: "Publikasikan", kind: "boolean" },
  ],
  articles: [
    { name: "title_id", label: "Judul (Bahasa Indonesia)", required: true },
    { name: "title_en", label: "Title (English)", required: true },
    { name: "slug", label: "Slug unik", required: true },
    { name: "excerpt_id", label: "Ringkasan (Bahasa Indonesia)", kind: "textarea" },
    { name: "excerpt_en", label: "Excerpt (English)", kind: "textarea" },
    { name: "body_markdown", label: "Isi write-up (Markdown)", kind: "textarea", required: true },
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
      else if (Array.isArray(value)) nextValues[field.name] = value.join(", ");
      else nextValues[field.name] = typeof value === "string" ? (field.kind === "date" ? value.slice(0, 10) : value) : "";
    });
    setEditingId(typeof row.id === "string" ? row.id : null);
    setValues(nextValues);
    setSuccessMessage("");
    setErrorMessage("");
  }

  function resetForm() {
    if (activeTable === "overview") return;
    setEditingId(null);
    setValues(Object.fromEntries(currentFields.map((field) => [field.name, field.kind === "boolean" ? field.name === "is_published" && activeTable !== "articles" : ""])));
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

  async function uploadAsset(file: File) {
    if (!user || activeTable === "overview") return;
    setErrorMessage("");
    setSuccessMessage("");
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Ukuran file maksimal 5 MB.");
      return;
    }
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      setErrorMessage("Format file harus JPG, PNG, WebP, atau PDF.");
      return;
    }
    setBusy(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const result = await requestAdminApi<{ url: string }>("/api/admin/assets", {
        method: "POST",
        body: formData,
      });
      setValues((current) => ({ ...current, [uploadField]: result.url }));
      setSuccessMessage("File berhasil diunggah. Simpan formulir untuk menerapkan tautannya.");
    } catch (error: unknown) {
      setErrorMessage(`Upload gagal: ${getErrorMessage(error)}`);
    } finally {
      setBusy(false);
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
        <div><Link className="brand" href="/">← Portfolio</Link><p className="eyebrow">CONTROL PANEL / SINGLE ADMIN</p></div>
        {user && <div className="admin-user"><span>{user.email}</span><button className="button button-quiet" type="button" onClick={logout}>Keluar</button></div>}
      </header>
      {!user || !authorized ? (
        <section className="admin-card login-card">
          <p className="eyebrow">AUTHENTICATED ACCESS</p><h1>Masuk ke dashboard.</h1>
          <p>Gunakan akun Neon Auth dengan alamat email yang sama seperti <code>ADMIN_EMAIL</code>.</p>
          <form className="admin-form" onSubmit={handleLogin}>
            <label>Email<input autoComplete="username" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
            <label>Password<input autoComplete="current-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
            <button className="button button-primary" type="submit" disabled={busy}>{busy ? "Memproses..." : "Masuk dengan Neon Auth"}</button>
            {allowSignup && <button className="button button-quiet" type="button" disabled={busy || !email || password.length < 8} onClick={() => void handleRegister()}>{busy ? "Memproses..." : "Buat akun pemilik"}</button>}
          </form>
          {errorMessage && <p className="admin-error" role="alert">{errorMessage}</p>}
        </section>
      ) : (
        <div className="admin-layout">
          <aside className="admin-sidebar">
            <p className="eyebrow">CONTENT</p>
            <button className={`admin-nav-button${activeTable === "overview" ? " selected" : ""}`} type="button" onClick={() => setActiveTable("overview")}>
              <span>Ringkasan</span>
            </button>
            {tableNames.map((table) => (
              <button className={`admin-nav-button${activeTable === table ? " selected" : ""}`} key={table} type="button" onClick={() => setActiveTable(table)}>
                <span>{tableLabels[table]}</span><span>{counts[table]}</span>
              </button>
            ))}
            <div className="admin-counts">
              <strong>{activeTable === "overview" ? Object.values(counts).reduce((total, count) => total + count, 0) : rows.length}</strong><span>{activeTable === "overview" ? "ITEM KONTEN" : tableLabels[activeTable].toLocaleUpperCase()}</span>
              <p>Perubahan dikirim ke API server dan hanya dapat dilakukan oleh akun pemilik.</p>
            </div>
          </aside>
          <section className="admin-main">
            {errorMessage && <p className="admin-error" role="alert">{errorMessage}</p>}
            {successMessage && <p className="admin-success" role="status">{successMessage}</p>}
            {activeTable === "overview" ? (
              <>
                <div className="admin-title-row"><div><p className="eyebrow">CONTENT MANAGEMENT</p><h1>Dashboard</h1></div><button className="button button-quiet" type="button" onClick={() => void loadCounts().catch((error: unknown) => setErrorMessage(getErrorMessage(error)))}>Muat ulang</button></div>
                <div className="overview-grid">{tableNames.map((table) => <button className="overview-card" type="button" key={table} onClick={() => setActiveTable(table)}><span className="eyebrow">{tableLabels[table]}</span><strong>{counts[table]}</strong><span>Kelola konten →</span></button>)}</div>
                <div className="admin-card setup-checklist"><p className="eyebrow">PUBLISH CHECKLIST</p><h2>Siap untuk diperbarui tanpa redeploy</h2><ol><li>Lengkapi profil bilingual dan email kontak.</li><li>Tambahkan bukti dan proyek; centang <em>Publikasikan</em> untuk menampilkannya.</li><li>Tambahkan write-up Markdown, tanggal publikasi, dan tag.</li><li>Uji tampilan publik melalui tautan Portfolio.</li></ol></div>
              </>
            ) : (
              <>
            <div className="admin-title-row"><div><p className="eyebrow">CONTENT MANAGEMENT</p><h1>{tableLabels[activeTable]}</h1></div><button className="button button-quiet" type="button" onClick={() => void loadRows(activeTable).catch((error: unknown) => setErrorMessage(getErrorMessage(error)))}>Muat ulang</button></div>
            <div className="admin-content-grid">
              <form className="admin-card admin-form" onSubmit={saveRow}>
                <div className="admin-title-row"><h2>{editingId ? "Edit konten" : "Tambah konten"}</h2>{editingId && <button className="text-button" type="button" onClick={resetForm}>Batal</button>}</div>
                {currentFields.map((field) => (
                  <label className={field.kind === "boolean" ? "checkbox-field" : ""} key={field.name}>
                    {field.kind === "boolean" ? <><input type="checkbox" checked={Boolean(values[field.name])} onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.checked }))} />{field.label}</> : <>{field.label}{field.kind === "textarea" ? <textarea rows={field.name === "body_markdown" ? 14 : 4} required={field.required} value={String(values[field.name] ?? "")} onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))} /> : <input type={field.kind === "date" ? "date" : field.kind === "email" ? "email" : field.kind === "url" ? "url" : "text"} required={field.required} value={String(values[field.name] ?? "")} onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))} />}</>}
                  </label>
                ))}
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
                  <label className="file-label">Pilih file<input type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadAsset(file); event.currentTarget.value = ""; }} /></label>
                </div>}
                <div className="form-actions"><button className="button button-primary" disabled={busy} type="submit">{busy ? "Menyimpan..." : editingId ? "Simpan perubahan" : "Tambah konten"}</button><button className="button button-quiet" type="button" onClick={resetForm}>Bersihkan</button></div>
              </form>
              <div className="admin-list">
                <h2>Konten tersimpan <span>{rows.length}</span></h2>
                {rows.length ? rows.map((row) => <article className="admin-row" key={String(row.id)}>
                  <div><strong>{getDisplayName(row, activeTable)}</strong><p>{row.is_published === false ? "Draft / tidak dipublikasikan" : "Dipublikasikan"}</p></div>
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
