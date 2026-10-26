import Link from 'next/link';
export default function NotFound() {
  return <main className="container section"><span className="mono">V / 404</span><h1 style={{ fontSize: 48, marginBlock: 28 }}>Nie znaleziono / Not found</h1><Link className="button" href="/pl/">Strona główna →</Link><Link className="button outline" href="/en/" style={{ marginLeft: 15 }}>Home →</Link></main>;
}
