'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const statusColors: Record<string, string> = {
  new: '#f97316',
  contacted: '#f59e0b',
  qualified: '#8b5cf6',
  booked: '#10b981',
  lost: '#ef4444',
};

const bookingStatusColors: Record<string, { bg: string; text: string }> = {
  confirmed: { bg: '#dcfce7', text: '#16a34a' },
  payment_pending: { bg: '#fef3c7', text: '#d97706' },
  paid: { bg: '#dbeafe', text: '#2563eb' },
  in_progress: { bg: '#e0e7ff', text: '#6366f1' },
  completed: { bg: '#f0fdf4', text: '#15803d' },
  cancelled: { bg: '#fee2e2', text: '#dc2626' },
};

const bookingStatusLabels: Record<string, string> = {
  confirmed: 'Confirmed',
  payment_pending: 'Payment Pending',
  paid: 'Paid',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const sourceColors: Record<string, string> = {
  website: '#f97316',
  whatsapp: '#22c55e',
  facebook: '#1d4ed8',
  instagram: '#e1306c',
  phone: '#f59e0b',
  email: '#8b5cf6',
  referral: '#10b981',
  'walk-in': '#06b6d4',
  other: '#64748b',
};

const donutChartColors = ['#f97316', '#10b981', '#06b6d4', '#f59e0b', '#8b5cf6', '#1d4ed8', '#e1306c', '#64748b'];
const bookingDonutColors = ['#16a34a', '#d97706', '#dc2626', '#2563eb', '#6366f1', '#15803d'];

function DonutChart({ data, colors, size = 140 }: { data: { label: string; value: number }[], colors: string[], size?: number }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return <div style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '13px' }}>No data</div>;

  const strokeWidth = 28;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let cumulativeOffset = 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {data.map((d, i) => {
        const pct = d.value / total;
        const dashLength = pct * circumference;
        const dashOffset = -cumulativeOffset;
        cumulativeOffset += dashLength;
        return (
          <circle
            key={i}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={colors[i % colors.length]}
            strokeWidth={strokeWidth}
            strokeDasharray={`${dashLength} ${circumference - dashLength}`}
            strokeDashoffset={dashOffset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: 'all 0.5s ease' }}
          />
        );
      })}
      <circle cx={size / 2} cy={size / 2} r={radius - strokeWidth / 2 + 2} fill="#fff" />
    </svg>
  );
}

function LineChart({ data, height = 240 }: { data: { _id: string; count: number }[], height?: number }) {
  // Fill missing days with zero for last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const chartData = last7Days.map(date => {
    const found = data.find(d => d._id === date);
    return { label: date, value: found ? found.count : 0 };
  });

  const maxVal = Math.max(...chartData.map(d => d.value), 5);
  const width = 1000;
  const paddingX = 60;
  const paddingY = 40;

  const points = chartData.map((d, i) => ({
    x: (i / (chartData.length - 1)) * (width - paddingX * 2) + paddingX,
    y: height - ((d.value / maxVal) * (height - paddingY * 2) + paddingY),
    label: d.label,
    value: d.value
  }));

  const pathLine = points.reduce((acc, p, i) => i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`, "");
  const pathArea = `${pathLine} L ${points[points.length-1].x} ${height - 20} L ${points[0].x} ${height - 20} Z`;

  return (
    <div style={{ width: '100%', height, marginTop: '20px' }}>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Horizontal Grid Lines */}
        {[0, 1, 2, 3, 4].map(i => {
          const y = height - ((i / 4) * (height - paddingY * 2) + paddingY);
          return (
            <g key={i}>
              <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="#f1f5f9" strokeWidth="1" />
              <text x={paddingX - 10} y={y + 4} fontSize="12" fill="#94a3b8" textAnchor="end">{Math.round((i / 4) * maxVal)}</text>
            </g>
          );
        })}

        <path d={pathArea} fill="url(#lineGradient)" />
        <path d={pathLine} fill="none" stroke="#8b5cf6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="6" fill="#fff" stroke="#8b5cf6" strokeWidth="3" />
            <text x={p.x} y={height - 5} fontSize="13" fill="#64748b" textAnchor="middle" fontWeight="500">
              {new Date(p.label).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })}
            </text>
            <text x={p.x} y={p.y - 12} fontSize="12" fill="#8b5cf6" textAnchor="middle" fontWeight="700">{p.value}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

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
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid #f1f5f9', borderTopColor: '#f97316', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <div style={{ color: '#64748b', fontSize: '14px' }}>Loading dashboard...</div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
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
  const totalDue = (s.revenue || 0) - (s.collected || 0);

  // Process enquiries by source for donut chart
  const sourceData = (stats.enquiriesBySource || []).map((src: any) => ({
    label: src._id,
    value: src.count,
  }));
  const sourceChartColors = sourceData.map((d: any) => sourceColors[d.label] || '#64748b');

  // Process enquiries by status for summary badges
  const statusMap: Record<string, number> = {};
  (stats.enquiriesByStatus || []).forEach((st: any) => { statusMap[st._id] = st.count; });

  // Process bookings by status for donut chart
  const bookingsStatusData = (stats.bookingsByStatus || []).map((bst: any) => ({
    label: bst._id,
    value: bst.count,
  }));
  const bookingsChartColors = bookingsStatusData.map((d: any) => {
    const c = bookingStatusColors[d.label];
    return c ? c.text : '#64748b';
  });

  const totalBookingsForChart = bookingsStatusData.reduce((s: number, d: any) => s + d.value, 0);

  const statCards = [
    { label: 'Total Enquiries', value: s.totalEnquiries, sub: `↑ ${s.newEnquiries} new`, subColor: '#f97316', icon: '📋', iconBg: '#fff7ed', href: '/dashboard/enquiries' },
    { label: 'Total Customers', value: s.totalCustomers, sub: null, subColor: '', icon: '👥', iconBg: '#ecfdf5', href: '/dashboard/customers' },
    { label: 'Total Bookings', value: s.totalBookings, sub: null, subColor: '', icon: '📦', iconBg: '#f5f3ff', href: '/dashboard/bookings' },
    { label: 'Active Packages', value: s.totalPackages, sub: null, subColor: '', icon: '🗂️', iconBg: '#fffbeb', href: '/dashboard/packages' },
  ];

  return (
    <div>
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .dash-card { animation: fadeInUp 0.4s ease both; }
        .dash-card:nth-child(2) { animation-delay: 0.05s; }
        .dash-card:nth-child(3) { animation-delay: 0.1s; }
        .dash-card:nth-child(4) { animation-delay: 0.15s; }
        .dash-card:nth-child(5) { animation-delay: 0.2s; }
        .stat-hover { transition: transform 0.2s ease, box-shadow 0.2s ease; cursor: pointer; display: flex; flexDirection: column; }
        .stat-hover:hover { transform: translateY(-4px); box-shadow: 0 12px 24px -4px rgba(0,0,0,0.1) !important; }
        .stats-grid > a { display: flex; }
        .stats-grid .dash-card { flex: 1; min-height: 140px; display: flex; flex-direction: column; }
        .enquiry-row { transition: background 0.15s ease; }
        .enquiry-row:hover { background: #f8fafc !important; }
        @media (max-width: 768px) {
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
          .main-grid { grid-template-columns: 1fr !important; }
          .bottom-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Dashboard</h1>
        <p style={{ color: '#64748b', margin: '6px 0 0', fontSize: '14px', fontWeight: '500' }}>Welcome back! Here&apos;s what&apos;s happening with your business today.</p>
      </div>

      {/* Top Stats Row */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '28px' }}>
        {statCards.map((card, i) => (
          <Link key={i} href={card.href} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="dash-card stat-hover" style={{ background: '#fff', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: card.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                  {card.icon}
                </div>
                <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>{card.label}</div>
              </div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#0f172a' }}>{card.value}</div>
              {card.sub && <div style={{ fontSize: '12px', color: card.subColor, marginTop: '6px', fontWeight: '600' }}>{card.sub} <span style={{ color: '#94a3b8', fontWeight: '400' }}>vs yesterday</span></div>}
            </div>
          </Link>
        ))}

        {/* Revenue Card */}
        <Link href="/dashboard/bookings" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="dash-card stat-hover" style={{ background: '#fff', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                💰
              </div>
              <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Revenue</div>
            </div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#0f172a' }}>₹{(s.revenue || 0).toLocaleString()}</div>
            <div style={{ fontSize: '12px', color: '#10b981', marginTop: '6px', fontWeight: '600' }}>₹{(s.collected || 0).toLocaleString()} collected</div>
            <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '2px', fontWeight: '700' }}>₹{totalDue.toLocaleString()} total due</div>
          </div>
        </Link>
      </div>

      {/* Middle Row: Enquiry Status Summary + Enquiries by Source */}
      <div className="main-grid" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px', marginBottom: '24px' }}>
        
        {/* Enquiry Status Summary Card with Graph */}
        <div className="dash-card" style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>Enquiries Overview</h3>
            <select style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '6px', border: '1px solid #e2e8f0', color: '#64748b', outline: 'none' }}>
              <option>This Week</option>
            </select>
          </div>
          
          <LineChart data={stats.enquiryHistory || []} />

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '24px' }}>
            {[
              { label: 'Total', value: s.totalEnquiries, bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' },
              { label: 'New', value: statusMap['new'] || 0, bg: '#fff7ed', text: '#ea580c', border: '#fed7aa' },
              { label: 'Qualified', value: statusMap['qualified'] || 0, bg: '#f5f3ff', text: '#7c3aed', border: '#ddd6fe' },
              { label: 'Booked', value: statusMap['booked'] || 0, bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' },
              { label: 'Cancelled', value: statusMap['lost'] || 0, bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
            ].map((item, i) => (
              <div key={i} style={{
                flex: 1,
                minWidth: '80px',
                textAlign: 'center',
                padding: '12px 8px',
                background: item.bg,
                borderRadius: '12px',
                border: `1px solid ${item.border}`,
              }}>
                <div style={{ fontSize: '20px', fontWeight: '700', color: item.text }}>{item.value}</div>
                <div style={{ fontSize: '10px', fontWeight: '700', color: item.text, textTransform: 'uppercase', marginTop: '2px' }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Enquiries by Source - Donut Chart */}
        <div className="dash-card" style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', padding: '24px' }}>
          <h3 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>Enquiries by Source</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <DonutChart data={sourceData} colors={sourceChartColors.length > 0 ? sourceChartColors : donutChartColors} size={140} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
              {sourceData.map((d: any, i: number) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: sourceChartColors[i] || donutChartColors[i] || '#64748b', flexShrink: 0 }} />
                    <span style={{ fontSize: '13px', color: '#374151', textTransform: 'capitalize', fontWeight: '500' }}>{d.label}</span>
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>
                    {d.value} ({s.totalEnquiries > 0 ? Math.round((d.value / s.totalEnquiries) * 100) : 0}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Enquiries + Bookings by Status + Upcoming */}
      <div className="bottom-grid" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px' }}>
        
        {/* Recent Enquiries */}
        <div className="dash-card" style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>Recent Enquiries</h3>
            <Link href="/dashboard/enquiries" style={{ fontSize: '13px', color: '#f97316', textDecoration: 'none', fontWeight: '600' }}>View all →</Link>
          </div>
          {stats.recentEnquiries?.length > 0 ? stats.recentEnquiries.map((e: any) => {
            const initials = (e.customer?.name || 'U').charAt(0).toUpperCase();
            const initialColors = ['#f97316', '#8b5cf6', '#10b981', '#2563eb', '#06b6d4'];
            const bgColor = initialColors[initials.charCodeAt(0) % initialColors.length];
            return (
              <div key={e._id} className="enquiry-row" style={{ padding: '14px 24px', borderBottom: '1px solid #f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '14px', fontWeight: '700', flexShrink: 0 }}>
                    {initials}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.customer?.name || 'Unknown'}</div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '1px' }}>{e.customer?.phone || 'No phone'}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'capitalize' }}>{e.source}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '1px' }}>
                    {new Date(e.createdAt).toLocaleDateString('en-GB')}, {new Date(e.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                  </div>
                </div>
                <span style={{
                  padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700',
                  background: `${statusColors[e.status] || '#64748b'}18`,
                  color: statusColors[e.status] || '#64748b',
                  textTransform: 'capitalize',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}>{e.status}</span>
              </div>
            );
          }) : <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>No enquiries yet</div>}
        </div>

        {/* Right Column: Bookings by Status + Upcoming Bookings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Bookings by Status */}
          <div className="dash-card" style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', padding: '24px' }}>
            <h3 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>Bookings by Status</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <DonutChart data={bookingsStatusData} colors={bookingsChartColors.length > 0 ? bookingsChartColors : bookingDonutColors} size={120} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                {bookingsStatusData.map((d: any, i: number) => {
                  const c = bookingStatusColors[d.label] || { text: '#64748b' };
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: c.text, flexShrink: 0 }} />
                        <span style={{ fontSize: '13px', color: '#374151', fontWeight: '500' }}>{bookingStatusLabels[d.label] || d.label}</span>
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>
                        {d.value} ({totalBookingsForChart > 0 ? Math.round((d.value / totalBookingsForChart) * 100) : 0}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Upcoming Bookings */}
          <div className="dash-card" style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>Upcoming Bookings</h3>
              <Link href="/dashboard/bookings" style={{ fontSize: '13px', color: '#f97316', textDecoration: 'none', fontWeight: '600' }}>View all →</Link>
            </div>
            {(stats.upcomingBookings || []).length > 0 ? (stats.upcomingBookings || []).map((b: any) => {
              const bColor = bookingStatusColors[b.status] || { bg: '#f1f5f9', text: '#64748b' };
              return (
                <div key={b._id} style={{ padding: '14px 24px', borderBottom: '1px solid #f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: '16px' }}>✈️</span>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.package?.name || 'Package'}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                    📅 {new Date(b.travelDate).toLocaleDateString('en-GB')}
                  </div>
                  <span style={{
                    padding: '4px 10px', borderRadius: '12px', fontSize: '10px', fontWeight: '700',
                    background: bColor.bg, color: bColor.text,
                    whiteSpace: 'nowrap', flexShrink: 0
                  }}>{bookingStatusLabels[b.status] || b.status}</span>
                </div>
              );
            }) : <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>No upcoming bookings</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
