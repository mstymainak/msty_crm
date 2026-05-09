'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

const menuItems = [
  { label: 'Dashboard', href: '/dashboard', icon: '📊' },
  { label: 'Enquiries', href: '/dashboard/enquiries', icon: '📩' },
  { label: 'Customers', href: '/dashboard/customers', icon: '👥' },
  { label: 'Packages', href: '/dashboard/packages', icon: '🛕' },
  { label: 'Bookings', href: '/dashboard/bookings', icon: '📋' },
  { label: 'Staff', href: '/dashboard/settings', icon: '⚙️' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me').then(res => {
      if (!res.ok) { router.push('/login'); return; }
      return res.json();
    }).then(data => { if (data?.user) setUser(data.user); });
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/me', { method: 'DELETE' });
    router.push('/login');
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }}
        />
      )}

      {/* Sidebar */}
      <aside style={{
        width: '260px',
        background: '#0f172a',
        color: '#e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        zIndex: 50,
        transition: 'transform 0.3s',
        transform: sidebarOpen ? 'translateX(0)' : undefined,
      }}
        className="sidebar-desktop"
      >
        {/* Brand */}
        <div style={{
          padding: '24px 20px',
          borderBottom: '1px solid #1e293b',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px', height: '40px',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '20px', color: '#fff', fontWeight: 'bold',
            }}>M</div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '16px', color: '#f8fafc' }}>MSTY CRM</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Tirth Yatra Management</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
          {menuItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: isActive(item.href) ? '600' : '400',
                color: isActive(item.href) ? '#fff' : '#94a3b8',
                background: isActive(item.href) ? '#1e40af' : 'transparent',
                textDecoration: 'none',
                marginBottom: '4px',
                transition: 'all 0.2s',
              }}
            >
              <span style={{ fontSize: '18px' }}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User section */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid #1e293b',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#f8fafc' }}>
                {user?.name || 'Loading...'}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>
                {user?.role || ''}
              </div>
            </div>
            <button
              onClick={handleLogout}
              style={{
                padding: '6px 12px',
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '6px',
                color: '#94a3b8',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, marginLeft: '260px', minHeight: '100vh' }}>
        {/* Top bar (mobile) */}
        <div style={{
          display: 'none',
          padding: '12px 20px',
          background: '#fff',
          borderBottom: '1px solid #e2e8f0',
          alignItems: 'center',
          justifyContent: 'space-between',
        }} className="mobile-topbar">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ fontSize: '24px', background: 'none', border: 'none', cursor: 'pointer' }}
          >☰</button>
          <span style={{ fontWeight: '700', color: '#0f172a' }}>MSTY CRM</span>
          <div style={{ width: '24px' }} />
        </div>

        <div style={{ padding: '24px 32px' }}>
          {children}
        </div>
      </main>

      <style>{`
        @media (max-width: 768px) {
          .sidebar-desktop { transform: translateX(-100%); }
          .mobile-topbar { display: flex !important; }
          main { margin-left: 0 !important; }
        }
      `}</style>
    </div>
  );
}
