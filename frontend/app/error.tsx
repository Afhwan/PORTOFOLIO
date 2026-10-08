"use client";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="error-page">
      <p className="eyebrow">CONTENT LOAD ERROR</p>
      <h1>Konten portofolio gagal dimuat.</h1>
      <p>Periksa koneksi Neon dan konfigurasi server, lalu coba kembali.</p>
      <button className="button button-primary" onClick={reset} type="button">
        Coba lagi
      </button>
    </main>
  );
}
