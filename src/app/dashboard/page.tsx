'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const cardStyle = (color: string) => ({
  background: '#fff',
  borderRadius: '12px',
  padding: '24px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  borderLeft: `4px solid ${color}`,
});

const statusColors: Record<string, string> = {
  new: '#f97316',
  contacted: '#f59e0b',
  qualified: '#8b5cf6',
  booked: '#10b981',
  lost: '#ef4444',
};

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then(res => res.json())
      .then(data => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>Loading dashboard...</div>;
  }

  if (!stats || stats.error) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <p style={{ fontSize: '18px', color: '#ef4444', marginBottom: '8px' }}>⚠️ Database not connected</p>
        <p style={{ color: '#64748b' }}>Please configure MONGODB_URI in .env.local</p>
      </div>
    );
  }

  const s = stats.stats;

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Dashboard</h1>
        <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: '14px' }}>Welcome to Mahesh Sharma Tirth Yatra CRM</p>
      </div>

      <style>{`
        .stat-card-link {
          text-decoration: none;
          color: inherit;
          display: block;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .stat-card-link:hover {
          transform: translateY(-4px);
        }
        .stat-card-link:hover .stat-card {
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05) !important;
        }
      `}</style>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <Link href="/dashboard/enquiries" className="stat-card-link">
          <div className="stat-card" style={cardStyle('#f97316')}>
            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Total Enquiries</div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#0f172a' }}>{s.totalEnquiries}</div>
            <div style={{ fontSize: '12px', color: '#f97316', marginTop: '4px' }}>{s.newEnquiries} new</div>
          </div>
        </Link>

        <Link href="/dashboard/customers" className="stat-card-link">
          <div className="stat-card" style={cardStyle('#10b981')}>
            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Total Customers</div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#0f172a' }}>{s.totalCustomers}</div>
          </div>
        </Link>

        <Link href="/dashboard/bookings" className="stat-card-link">
          <div className="stat-card" style={cardStyle('#8b5cf6')}>
            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Total Bookings</div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#0f172a' }}>{s.totalBookings}</div>
          </div>
        </Link>

        <Link href="/dashboard/packages" className="stat-card-link">
          <div className="stat-card" style={cardStyle('#f59e0b')}>
            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Active Packages</div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#0f172a' }}>{s.totalPackages}</div>
          </div>
        </Link>

        <Link href="/dashboard/bookings" className="stat-card-link">
          <div className="stat-card" style={cardStyle('#10b981')}>
            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Revenue</div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#0f172a' }}>₹{(s.revenue || 0).toLocaleString()}</div>
            <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px' }}>₹{(s.collected || 0).toLocaleString()} collected</div>
          </div>
        </Link>
      </div>

      {/* Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Recent Enquiries */}
        <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#0f172a' }}>Recent Enquiries</h3>
            <Link href="/dashboard/enquiries" style={{ fontSize: '13px', color: '#f97316', textDecoration: 'none' }}>View all →</Link>
          </div>
          {stats.recentEnquiries?.length > 0 ? stats.recentEnquiries.map((e: any) => (
            <div key={e._id} style={{ padding: '12px 20px', borderBottom: '1px solid #f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '500', color: '#0f172a' }}>{e.customer?.name || 'Unknown'}</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{e.message?.substring(0, 50)}...</div>
              </div>
              <span style={{
                padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '600',
                background: `${statusColors[e.status] || '#64748b'}20`,
                color: statusColors[e.status] || '#64748b',
              }}>{e.status}</span>
            </div>
          )) : <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>No enquiries yet</div>}
        </div>

        {/* Enquiries by Source */}
        <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#0f172a' }}>Enquiries by Source</h3>
          </div>
          <div style={{ padding: '20px' }}>
            {stats.enquiriesBySource?.length > 0 ? stats.enquiriesBySource.map((s: any) => {
              const sourceColors: Record<string, string> = {
                website: '#f97316', whatsapp: '#22c55e', facebook: '#1d4ed8', phone: '#f59e0b', email: '#8b5cf6', other: '#64748b',
              };
              return (
                <div key={s._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f8fafc' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: sourceColors[s._id] || '#64748b' }} />
                    <span style={{ fontSize: '14px', color: '#374151', textTransform: 'capitalize' }}>{s._id}</span>
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>{s.count}</span>
                </div>
              );
            }) : <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>No data yet</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
