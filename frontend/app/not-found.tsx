import Link from "next/link";

export default function NotFound() {
  return (
    <main className="error-page">
      <p className="eyebrow">404 / NOT FOUND</p>
      <h1>Halaman tidak ditemukan.</h1>
      <Link className="button button-primary" href="/">
        Kembali ke beranda
      </Link>
    </main>
  );
}
