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

function LineChart({ data, height = 240, startDate, endDate }: { data: { _id: string; count: number }[], height?: number, startDate: string, endDate: string }) {
  // Fill missing days with zero for the selected range
  const getDaysArray = (start: string, end: string) => {
    const arr = [];
    const dt = new Date(start);
    const endDt = new Date(end);
    let count = 0;
    // Limit to safe number of days to prevent UI lockup if range is huge
    while (dt <= endDt && count < 100) {
      arr.push(new Date(dt).toISOString().split('T')[0]);
      dt.setDate(dt.getDate() + 1);
      count++;
    }
    return arr;
  };
  
  const days = getDaysArray(startDate, endDate);

  const chartData = days.map(date => {
    const found = data.find(d => d._id === date);
    return { label: date, value: found ? found.count : 0 };
  });

  const maxVal = Math.max(...chartData.map(d => d.value), 5);
  const width = 500;
  const paddingX = 40;
  const paddingY = 30;

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
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" style={{ overflow: 'visible' }}>
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
  
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7); // Default to last 7 days
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  useEffect(() => {
    setLoading(true);
    fetch(`/api/dashboard/stats?startDate=${startDate}&endDate=${endDate}`)
      .then(res => res.json())
      .then(data => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [startDate, endDate]);

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

  const sourceData = (stats.enquiriesBySource || []).map((src: any) => ({
    label: src._id,
    value: src.count,
  }));
  const sourceChartColors = sourceData.map((d: any) => sourceColors[d.label] || '#64748b');

  const statusMap: Record<string, number> = {};
  (stats.enquiriesByStatus || []).forEach((st: any) => { statusMap[st._id] = st.count; });

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
    { label: 'Total Enquiries', value: s.totalEnquiries, sub: `↑ ${s.newEnquiries || 7} new`, icon: '📋', color: '#f97316', bg: '#fff7ed', href: '/dashboard/enquiries' },
    { label: 'Total Customers', value: s.totalCustomers, sub: `↑ 5 new`, icon: '👥', color: '#10b981', bg: '#ecfdf5', href: '/dashboard/customers' },
    { label: 'Total Bookings', value: s.totalBookings, sub: `↑ 2 new`, icon: '📦', color: '#8b5cf6', bg: '#f5f3ff', href: '/dashboard/bookings' },
  ];

  return (
    <div>
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .dash-card { animation: fadeInUp 0.4s ease both; background: #fff; border: 1px solid #f1f5f9; border-radius: 16px; box-shadow: 0 1px 4px rgba(0,0,0,0.03); }
        .stat-card { padding: 16px; }
        .view-btn { padding: 6px 16px; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s; border: none; }
        .view-btn.active { background: #f97316; color: #fff; }
        .view-btn.inactive { background: transparent; color: #64748b; }
        
        @media (max-width: 768px) {
          .stats-row { grid-template-columns: 1fr !important; }
          .split-grid { grid-template-columns: 1fr !important; }
          .revenue-stats { flex-direction: column !important; align-items: flex-start !important; gap: 12px !important; }
        }
      `}</style>

      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Dashboard</h1>
          <p style={{ color: '#64748b', fontSize: '13px', marginTop: '4px', fontWeight: '500' }}>Welcome back, Mahesh Sharma! Here&apos;s what&apos;s happening today.</p>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input 
              type="date" 
              value={startDate} 
              onChange={e => setStartDate(e.target.value)} 
              style={{ padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', color: '#0f172a', outline: 'none', background: '#fff' }}
            />
            <span style={{ color: '#64748b', fontSize: '13px' }}>to</span>
            <input 
              type="date" 
              value={endDate} 
              onChange={e => setEndDate(e.target.value)} 
              style={{ padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', color: '#0f172a', outline: 'none', background: '#fff' }}
            />
          </div>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
        {statCards.map((card, i) => (
          <Link key={i} href={card.href} style={{ textDecoration: 'none' }}>
            <div className="dash-card stat-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                  {card.icon}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>{card.label}</div>
              </div>
              <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a' }}>{card.value}</div>
              <div style={{ fontSize: '12px', color: '#10b981', marginTop: '6px', fontWeight: '700' }}>
                {card.sub} <span style={{ color: '#94a3b8', fontWeight: '500' }}>vs yesterday</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Revenue Card */}
      <div className="dash-card" style={{ padding: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>💰</div>
          <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '700' }}>Revenue</div>
        </div>
        <div style={{ fontSize: '36px', fontWeight: '800', color: '#0f172a', marginBottom: '16px' }}>₹{(s.revenue || 0).toLocaleString()}</div>
        <div className="revenue-stats" style={{ display: 'flex', gap: '24px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
          <div>
            <div style={{ fontSize: '13px', color: '#10b981', fontWeight: '800' }}>₹{(s.collected || 0).toLocaleString()} collected</div>
            <div style={{ width: '100px', height: '4px', background: '#dcfce7', borderRadius: '2px', marginTop: '4px' }}>
              <div style={{ width: '65%', height: '100%', background: '#10b981', borderRadius: '2px' }}></div>
            </div>
          </div>
          <div>
            <div style={{ fontSize: '13px', color: '#ef4444', fontWeight: '800' }}>₹{totalDue.toLocaleString()} total due</div>
            <div style={{ width: '100px', height: '4px', background: '#fee2e2', borderRadius: '2px', marginTop: '4px' }}>
              <div style={{ width: '35%', height: '100%', background: '#ef4444', borderRadius: '2px' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Grid */}
      <div className="split-grid" style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '20px', marginBottom: '24px' }}>
        
        {/* Enquiries Overview */}
        <div className="dash-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>Enquiries Overview</h3>
            <select style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '6px', border: '1px solid #e2e8f0', color: '#64748b', outline: 'none', background: '#fff' }}>
              <option>This Week</option>
              <option>Last 30 Days</option>
              <option>Last 90 Days</option>
              <option>This Year</option>
            </select>
          </div>
          
          <LineChart data={stats.enquiryHistory || []} height={180} startDate={startDate} endDate={endDate} />

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '20px' }}>
            {[
              { label: 'Total', value: s.totalEnquiries, color: '#2563eb', bg: '#eff6ff' },
              { label: 'New', value: statusMap['new'] || 0, color: '#10b981', bg: '#ecfdf5' },
              { label: 'Qualified', value: statusMap['qualified'] || 0, color: '#8b5cf6', bg: '#f5f3ff' },
              { label: 'Booked', value: statusMap['booked'] || 0, color: '#f97316', bg: '#fff7ed' },
              { label: 'Cancelled', value: statusMap['lost'] || 0, color: '#ef4444', bg: '#fef2f2' },
            ].map((item, i) => (
              <div key={i} style={{ flex: 1, minWidth: '70px', padding: '10px 4px', background: item.bg, borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '18px', fontWeight: '800', color: item.color }}>{item.value}</div>
                <div style={{ fontSize: '9px', fontWeight: '800', color: item.color, textTransform: 'uppercase' }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Enquiries by Source */}
        <div className="dash-card" style={{ padding: '20px' }}>
          <h3 style={{ margin: '0 0 20px', fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>Enquiries by Source</h3>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <DonutChart data={sourceData} colors={sourceChartColors.length > 0 ? sourceChartColors : donutChartColors} size={140} />
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {sourceData.map((d: any, i: number) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: sourceChartColors[i] || donutChartColors[i] }} />
                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '700', textTransform: 'capitalize' }}>{d.label}</span>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a' }}>{d.value} ({s.totalEnquiries > 0 ? Math.round((d.value / s.totalEnquiries) * 100) : 0}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="split-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        {/* Enquiries by Status */}
        <div className="dash-card" style={{ padding: '20px' }}>
          <h3 style={{ margin: '0 0 20px', fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>Enquiries by Status</h3>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <DonutChart data={bookingsStatusData} colors={bookingsChartColors} size={140} />
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {bookingsStatusData.map((d: any, i: number) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: bookingsChartColors[i] }} />
                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>{bookingStatusLabels[d.label] || d.label}</span>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a' }}>{d.value} ({totalBookingsForChart > 0 ? Math.round((d.value / totalBookingsForChart) * 100) : 0}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Bookings */}
        <div className="dash-card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>Upcoming Bookings</h3>
            <Link href="/dashboard/bookings" style={{ fontSize: '12px', color: '#2563eb', fontWeight: '700', textDecoration: 'none' }}>View all →</Link>
          </div>
          {(stats.upcomingBookings || []).length > 0 ? (stats.upcomingBookings || []).map((b: any) => (
            <div key={b._id} style={{ padding: '12px 20px', borderBottom: '1px solid #f8fafc', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>✈️</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{b.package?.name}</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>📅 {new Date(b.travelDate).toLocaleDateString('en-GB')}</div>
              </div>
              <span style={{ padding: '4px 8px', borderRadius: '8px', fontSize: '10px', fontWeight: '800', background: bookingStatusColors[b.status]?.bg, color: bookingStatusColors[b.status]?.text }}>
                {bookingStatusLabels[b.status]}
              </span>
            </div>
          )) : <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>No upcoming bookings</div>}
        </div>
      </div>

      {/* Recent Enquiries */}
      <div className="dash-card" style={{ overflow: 'hidden', marginBottom: '20px' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>Recent Enquiries</h3>
          <Link href="/dashboard/enquiries" style={{ fontSize: '12px', color: '#2563eb', fontWeight: '700', textDecoration: 'none' }}>View all →</Link>
        </div>
        {stats.recentEnquiries?.length > 0 ? stats.recentEnquiries.map((e: any) => {
          const initials = (e.customer?.name || 'U').charAt(0).toUpperCase();
          const color = ['#f97316', '#8b5cf6', '#10b981', '#2563eb', '#06b6d4'][initials.charCodeAt(0) % 5];
          return (
            <div key={e._id} style={{ padding: '12px 20px', borderBottom: '1px solid #f8fafc', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '800', fontSize: '15px' }}>{initials}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>{e.customer?.name}</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '1px' }}>{e.customer?.phone || 'No phone'}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'capitalize' }}>{e.source}</div>
                <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '1px' }}>{new Date(e.createdAt).toLocaleDateString('en-GB')}, {new Date(e.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</div>
              </div>
              <span style={{ padding: '4px 10px', borderRadius: '10px', fontSize: '10px', fontWeight: '800', background: `${statusColors[e.status]}15`, color: statusColors[e.status], textTransform: 'uppercase', minWidth: '60px', textAlign: 'center' }}>
                {e.status === 'lost' ? 'NEW' : e.status}
              </span>
            </div>
          );
        }) : <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>No enquiries found.</div>}
      </div>
    </div>
  );
}
