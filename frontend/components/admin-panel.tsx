"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { createClient } from "@/lib/supabase/client";
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

export function AdminPanel() {
  const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const [supabase, setSupabase] = useState<ReturnType<typeof createClient> | null>(null);
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
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [uploadField, setUploadField] = useState("image_url");
  const [showPreview, setShowPreview] = useState(false);

  const loadRows = useCallback(async (client: ReturnType<typeof createClient>, table: ManagedTable) => {
    const { data, error } = await client.from(table).select("*");
    if (error) throw new Error(`Gagal memuat ${tableLabels[table]}: ${error.message}`);
    setRows(data ?? []);
  }, []);

  const loadCounts = useCallback(async (client: ReturnType<typeof createClient>) => {
    const results = await Promise.all(tableNames.map((table) =>
      client.from(table).select("id", { count: "exact", head: true }),
    ));
    const failed = results.find((result) => result.error);
    if (failed?.error) throw new Error(`Gagal memuat ringkasan konten: ${failed.error.message}`);
    setCounts({
      profiles: results[tableNames.indexOf("profiles")].count ?? 0,
      certificates: results[tableNames.indexOf("certificates")].count ?? 0,
      competitions: results[tableNames.indexOf("competitions")].count ?? 0,
      projects: results[tableNames.indexOf("projects")].count ?? 0,
      experiences: results[tableNames.indexOf("experiences")].count ?? 0,
      articles: results[tableNames.indexOf("articles")].count ?? 0,
    });
  }, []);

  const verifyAdmin = useCallback(async (client: ReturnType<typeof createClient>, currentUser: AuthUser) => {
    const { data, error } = await client.from("admins").select("user_id").eq("user_id", currentUser.id).maybeSingle();
    if (error) throw new Error(`Gagal memeriksa izin admin: ${error.message}`);
    if (!data) {
      setAuthorized(false);
      setErrorMessage("Akun berhasil masuk tetapi belum terdaftar sebagai admin. Minta pemilik proyek menambahkan User ID ke tabel admins.");
      await client.auth.signOut();
      setUser(null);
      return;
    }
    setErrorMessage("");
    setAuthorized(true);
    setUser(currentUser);
  }, []);

  useEffect(() => {
    if (!configured) return;
    const client = createClient();
    setSupabase(client);
    client.auth.getSession().then(({ data, error }) => {
      if (error) {
        setErrorMessage(`Gagal memeriksa sesi: ${error.message}`);
        return;
      }
      if (data.session?.user) {
        void verifyAdmin(client, data.session.user).catch((error: unknown) => setErrorMessage(getErrorMessage(error)));
      }
    });
    const { data: authListener } = client.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        void verifyAdmin(client, session.user).catch((error: unknown) => setErrorMessage(getErrorMessage(error)));
      } else {
        setUser(null);
        setAuthorized(false);
        setRows([]);
      }
    });
    return () => authListener.subscription.unsubscribe();
  }, [configured, verifyAdmin]);

  useEffect(() => {
    if (supabase && authorized) {
      setErrorMessage("");
      if (activeTable === "overview") {
        void loadCounts(supabase).catch((error: unknown) => setErrorMessage(getErrorMessage(error)));
        setRows([]);
      } else {
        void loadRows(supabase, activeTable).catch((error: unknown) => setErrorMessage(getErrorMessage(error)));
      }
      setEditingId(null);
      setValues({});
      setUploadField(currentFields.find((field) => field.kind === "url")?.name ?? "");
    }
  }, [activeTable, authorized, currentFields, loadCounts, loadRows, supabase]);

  const currentFields = useMemo(() => activeTable === "overview" ? [] : fields[activeTable], [activeTable]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setErrorMessage("");
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setErrorMessage(`Login gagal: ${error.message}`);
        return;
      }
      if (data.user) await verifyAdmin(supabase, data.user);
    } catch (error: unknown) {
      setErrorMessage(`Login gagal: ${getErrorMessage(error)}`);
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
    if (!supabase || activeTable === "overview") return;
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
      if (activeTable === "profiles" && editingId) payload.id = editingId;

      const result = editingId
        ? await supabase.from(activeTable).update(payload).eq("id", editingId)
        : await supabase.from(activeTable).insert(payload);
      if (result.error) {
        setErrorMessage(`Gagal menyimpan: ${result.error.message}`);
        return;
      }
      mutationCommitted = true;
      await loadRows(supabase, activeTable);
      setSuccessMessage(`${tableLabels[activeTable]} berhasil disimpan.`);
      setEditingId(null);
      setValues({});
      await loadCounts(supabase).catch((error: unknown) => setErrorMessage(`Konten tersimpan, tetapi ringkasan gagal dimuat: ${getErrorMessage(error)}`));
    } catch (error: unknown) {
      setErrorMessage(mutationCommitted
        ? `Konten tersimpan, tetapi daftar gagal diperbarui: ${getErrorMessage(error)}`
        : `Gagal menyimpan: ${getErrorMessage(error)}`);
    } finally {
      setBusy(false);
    }
  }

  async function deleteRow(row: AdminRow) {
    if (!supabase || activeTable === "overview" || !row.id || !window.confirm(`Hapus ${getDisplayName(row, activeTable)}? Tindakan ini tidak dapat dibatalkan.`)) return;
    setErrorMessage("");
    let mutationCommitted = false;
    try {
      const { error } = await supabase.from(activeTable).delete().eq("id", row.id);
      if (error) {
        setErrorMessage(`Gagal menghapus: ${error.message}`);
        return;
      }
      mutationCommitted = true;
      await loadRows(supabase, activeTable);
      setSuccessMessage(`${tableLabels[activeTable]} berhasil dihapus.`);
      await loadCounts(supabase).catch((error: unknown) => setErrorMessage(`Konten terhapus, tetapi ringkasan gagal dimuat: ${getErrorMessage(error)}`));
      if (editingId === row.id) resetForm();
    } catch (error: unknown) {
      setErrorMessage(mutationCommitted
        ? `Konten terhapus, tetapi daftar gagal diperbarui: ${getErrorMessage(error)}`
        : `Gagal menghapus: ${getErrorMessage(error)}`);
    }
  }

  async function uploadAsset(file: File) {
    if (!supabase || !user || activeTable === "overview") return;
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
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-120);
    const path = `${user.id}/${crypto.randomUUID()}-${safeName}`;
    setBusy(true);
    try {
      const { data, error } = await supabase.storage.from("portfolio-assets").upload(path, file, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      });
      if (error) {
        setErrorMessage(`Upload gagal: ${error.message}`);
        return;
      }
      const { data: publicUrl } = supabase.storage.from("portfolio-assets").getPublicUrl(data.path);
      setValues((current) => ({ ...current, [uploadField]: publicUrl.publicUrl }));
      setSuccessMessage("File berhasil diunggah. Simpan formulir untuk menerapkan tautannya.");
    } catch (error: unknown) {
      setErrorMessage(`Upload gagal: ${getErrorMessage(error)}`);
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    if (!supabase) return;
    try {
      const { error } = await supabase.auth.signOut();
      if (error) setErrorMessage(`Logout gagal: ${error.message}`);
    } catch (error: unknown) {
      setErrorMessage(`Logout gagal: ${getErrorMessage(error)}`);
    }
  }

  if (!configured) {
    return <main className="admin-shell"><Link className="brand" href="/">← Portfolio</Link><div className="admin-card"><p className="eyebrow">SUPABASE SETUP REQUIRED</p><h1>Konfigurasi belum tersedia.</h1><p>Salin <code>.env.example</code> ke <code>.env.local</code>, lalu isi URL proyek Supabase dan anon key.</p></div></main>;
  }

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <div><Link className="brand" href="/">← Portfolio</Link><p className="eyebrow">CONTROL PANEL / SINGLE ADMIN</p></div>
        {user && <div className="admin-user"><span>{user.email}</span><button className="button button-quiet" type="button" onClick={logout}>Keluar</button></div>}
      </header>
      {!user || !authorized || !supabase ? (
        <section className="admin-card login-card">
          <p className="eyebrow">AUTHENTICATED ACCESS</p><h1>Masuk ke dashboard.</h1>
          <p>Gunakan akun admin Supabase yang terdaftar pada allowlist tabel <code>admins</code>.</p>
          <form className="admin-form" onSubmit={handleLogin}>
            <label>Email<input autoComplete="username" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
            <label>Password<input autoComplete="current-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
            <button className="button button-primary" type="submit" disabled={busy}>{busy ? "Memproses..." : "Masuk dengan Supabase Auth"}</button>
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
              <p>Perubahan langsung menggunakan Supabase dengan proteksi RLS.</p>
            </div>
          </aside>
          <section className="admin-main">
            {errorMessage && <p className="admin-error" role="alert">{errorMessage}</p>}
            {successMessage && <p className="admin-success" role="status">{successMessage}</p>}
            {activeTable === "overview" ? (
              <>
                <div className="admin-title-row"><div><p className="eyebrow">CONTENT MANAGEMENT</p><h1>Dashboard</h1></div><button className="button button-quiet" type="button" onClick={() => void loadCounts(supabase).catch((error: unknown) => setErrorMessage(getErrorMessage(error)))}>Muat ulang</button></div>
                <div className="overview-grid">{tableNames.map((table) => <button className="overview-card" type="button" key={table} onClick={() => setActiveTable(table)}><span className="eyebrow">{tableLabels[table]}</span><strong>{counts[table]}</strong><span>Kelola konten →</span></button>)}</div>
                <div className="admin-card setup-checklist"><p className="eyebrow">PUBLISH CHECKLIST</p><h2>Siap untuk diperbarui tanpa redeploy</h2><ol><li>Lengkapi profil bilingual dan email kontak.</li><li>Tambahkan bukti dan proyek; centang <em>Publikasikan</em> untuk menampilkannya.</li><li>Tambahkan write-up Markdown, tanggal publikasi, dan tag.</li><li>Uji tampilan publik melalui tautan Portfolio.</li></ol></div>
              </>
            ) : (
              <>
            <div className="admin-title-row"><div><p className="eyebrow">CONTENT MANAGEMENT</p><h1>{tableLabels[activeTable]}</h1></div><button className="button button-quiet" type="button" onClick={() => void loadRows(supabase, activeTable)}>Muat ulang</button></div>
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
