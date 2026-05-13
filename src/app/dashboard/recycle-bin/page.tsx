'use client';

import { useState, useEffect } from 'react';

export default function RecycleBinPage() {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'enquiry' | 'customer'>('enquiry');
  const [actioningId, setActioningId] = useState<string | null>(null);

  const fetchRecycled = () => {
    setLoading(true);
    fetch('/api/recycle-bin')
      .then(res => res.json())
      .then(data => {
        setEnquiries(Array.isArray(data.enquiries) ? data.enquiries : []);
        setCustomers(Array.isArray(data.customers) ? data.customers : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchRecycled();
  }, []);

  const handleAction = async (type: 'enquiry' | 'customer', id: string, action: 'restore' | 'delete') => {
    if (action === 'delete' && !confirm('Are you absolutely sure you want to permanently delete this item? This action CANNOT be undone.')) {
      return;
    }

    setActioningId(id);
    try {
      const res = await fetch('/api/recycle-bin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, id, action })
      });

      if (res.ok) {
        fetchRecycled();
      } else {
        alert('Action failed. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred. Please try again.');
    } finally {
      setActioningId(null);
    }
  };

  const getDaysRemaining = (deletedAtStr: string) => {
    if (!deletedAtStr) return 7;
    const deletedTime = new Date(deletedAtStr).getTime();
    const elapsedTimeMs = Date.now() - deletedTime;
    const totalDurationMs = 7 * 24 * 60 * 60 * 1000;
    const remainingMs = totalDurationMs - elapsedTimeMs;
    const remainingDays = Math.max(0, Math.ceil(remainingMs / (24 * 60 * 60 * 1000)));
    return remainingDays;
  };

  const activeItems = activeTab === 'enquiry' ? enquiries : customers;

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Recycle Bin</h1>
        <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: '14px' }}>
          Deleted leads and customers are kept here for <strong>7 days</strong> before being permanently purged.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('enquiry')}
          style={{
            padding: '8px 16px',
            fontSize: '14px',
            fontWeight: '600',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            background: activeTab === 'enquiry' ? '#f97316' : 'transparent',
            color: activeTab === 'enquiry' ? '#fff' : '#64748b',
            transition: 'all 0.2s'
          }}
        >
          Enquiries ({enquiries.length})
        </button>
        <button
          onClick={() => setActiveTab('customer')}
          style={{
            padding: '8px 16px',
            fontSize: '14px',
            fontWeight: '600',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            background: activeTab === 'customer' ? '#f97316' : 'transparent',
            color: activeTab === 'customer' ? '#fff' : '#64748b',
            transition: 'all 0.2s'
          }}
        >
          Customers ({customers.length})
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#64748b', fontSize: '15px' }}>Loading recycle bin contents...</div>
      ) : activeItems.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: '12px', padding: '60px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', color: '#94a3b8' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>🗑️</div>
          <p style={{ fontWeight: '600', color: '#64748b', margin: 0 }}>Recycle Bin is empty</p>
          <p style={{ fontSize: '13px', margin: '4px 0 0' }}>Deleted {activeTab === 'enquiry' ? 'enquiries' : 'customers'} will show up here.</p>
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>
                  {activeTab === 'enquiry' ? 'Enquiry Contact / Detail' : 'Customer Name'}
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>
                  {activeTab === 'enquiry' ? 'Message / Note' : 'Email & Phone'}
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>
                  Deleted At
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>
                  Auto-Purge In
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {activeItems.map(item => {
                const daysLeft = getDaysRemaining(item.deletedAt);
                return (
                  <tr key={item._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px', fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>
                      {activeTab === 'enquiry' ? (
                        <>
                          <div>{item.customer?.name || 'Unknown'}</div>
                          <div style={{ fontSize: '12px', fontWeight: '500', color: '#64748b', marginTop: '2px' }}>{item.customer?.phone || ''}</div>
                        </>
                      ) : (
                        item.name
                      )}
                    </td>
                    <td style={{ padding: '16px', fontSize: '13px', color: '#334155', maxWidth: '300px' }}>
                      {activeTab === 'enquiry' ? (
                        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.message}>
                          {item.message}
                        </div>
                      ) : (
                        <>
                          <div>{item.email}</div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{item.phone || '-'}</div>
                        </>
                      )}
                    </td>
                    <td style={{ padding: '16px', fontSize: '13px', color: '#64748b' }}>
                      <div>{new Date(item.deletedAt || Date.now()).toLocaleDateString()}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                        {new Date(item.deletedAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '700',
                        background: daysLeft <= 2 ? '#fef2f2' : '#f0fdf4',
                        color: daysLeft <= 2 ? '#ef4444' : '#16a34a',
                        border: `1px solid ${daysLeft <= 2 ? '#fca5a5' : '#bbf7d0'}`
                      }}>
                        ⏰ {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left
                      </span>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                          disabled={actioningId === item._id}
                          onClick={() => handleAction(activeTab, item._id, 'restore')}
                          style={{
                            padding: '6px 12px',
                            background: '#f0fdf4',
                            border: '1px solid #bbf7d0',
                            borderRadius: '6px',
                            color: '#16a34a',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          🟢 Restore
                        </button>
                        <button
                          disabled={actioningId === item._id}
                          onClick={() => handleAction(activeTab, item._id, 'delete')}
                          style={{
                            padding: '6px 12px',
                            background: '#fef2f2',
                            border: '1px solid #fca5a5',
                            borderRadius: '6px',
                            color: '#dc2626',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          🔴 Delete Forever
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
