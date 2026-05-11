import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f172a, #1e293b)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '100px',
          height: '100px',
          background: '#fff',
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          padding: '6px'
        }}>
          <img src="/logo.png" alt="MSTY Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        <h1 style={{ fontSize: '36px', fontWeight: '700', color: '#f8fafc', margin: '0 0 8px' }}>
          Mahesh Sharma Tirth Yatra CRM
        </h1>
        <p style={{ fontSize: '18px', color: '#94a3b8', margin: '0 0 32px' }}>
          Complete CRM system for pilgrimage management
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <Link href="/login" style={{ padding: '12px 32px', background: '#f97316', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '15px' }}>
            Admin Login
          </Link>
          <Link href="/contact" style={{ padding: '12px 32px', background: 'transparent', color: '#94a3b8', border: '1px solid #334155', borderRadius: '8px', textDecoration: 'none', fontWeight: '500', fontSize: '15px' }}>
            Submit Enquiry
          </Link>
        </div>
      </div>
    </div>
  );
}