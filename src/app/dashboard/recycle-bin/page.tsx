'use client';

import { useState, useEffect } from 'react';

export default function RecycleBinPage() {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'enquiry' | 'customer'>('enquiry');
  const [actioningId, setActioningId] = useState<string | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Multi-select states
  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [actioningBulk, setActioningBulk] = useState(false);

  const [refreshing, setRefreshing] = useState(false);

  const fetchRecycled = () => {
    setLoading(true);
    setRefreshing(true);
    fetch('/api/recycle-bin?_t=' + Date.now())
      .then(res => res.json())
      .then(data => {
        setEnquiries(Array.isArray(data.enquiries) ? data.enquiries : []);
        setCustomers(Array.isArray(data.customers) ? data.customers : []);
        setLoading(false);
        setRefreshing(false);
      })
      .catch(() => { setLoading(false); setRefreshing(false); });
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
        setSelectedIds(prev => prev.filter(x => x !== id));
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

  const handleBulkAction = async (action: 'restore' | 'delete') => {
    if (selectedIds.length === 0) return;
    if (action === 'delete' && !confirm(`Are you absolutely sure you want to permanently delete all ${selectedIds.length} selected items? This CANNOT be undone.`)) {
      return;
    }

    setActioningBulk(true);
    try {
      await Promise.all(
        selectedIds.map(id =>
          fetch('/api/recycle-bin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: activeTab, id, action })
          })
        )
      );
      setSelectedIds([]);
      setIsMultiSelect(false);
      fetchRecycled();
    } catch (err) {
      console.error('Error during bulk action:', err);
      alert('An error occurred. Some records might not have been actioned.');
    } finally {
      setActioningBulk(false);
    }
  };

  const toggleSelectItem = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(x => x !== id);
      } else {
        return [...prev, id];
      }
    });
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

  const getWhatsAppLink = (phone: string) => {
    const clean = phone.replace(/\D/g, '');
    const withCountry = clean.startsWith('91') ? clean : '91' + clean;
    return `https://api.whatsapp.com/send?phone=${withCountry}`;
  };

  // Reset pagination & selections on search or tab change
  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds([]);
  }, [searchQuery, activeTab]);

  // Search logic
  const currentItems = activeTab === 'enquiry' ? enquiries : customers;
  const filtered = currentItems.filter(item => {
    const name = activeTab === 'enquiry' ? (item.customer?.name || '') : (item.name || '');
    const phone = activeTab === 'enquiry' ? (item.customer?.phone || '') : (item.phone || '');
    const email = activeTab === 'enquiry' ? (item.customer?.email || '') : (item.email || '');

    return (
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      phone.includes(searchQuery) ||
      email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Pagination calculations
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const activePage = Math.max(1, Math.min(currentPage, totalPages));

  const startIndex = (activePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedItems = filtered.slice(startIndex, endIndex);

  const toggleSelectAllPage = () => {
    const pageIds = paginatedItems.map(item => item._id);
    const allSelected = pageIds.every(id => selectedIds.includes(id));

    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !pageIds.includes(id)));
    } else {
      setSelectedIds(prev => {
        const unique = new Set([...prev, ...pageIds]);
        return Array.from(unique);
      });
    }
  };

  const isAllPageSelected = paginatedItems.length > 0 && paginatedItems.map(item => item._id).every(id => selectedIds.includes(id));

  return (
    <div>
      {/* Header and Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Recycle Bin</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: '14px' }}>
            Deleted leads and customers are kept here for <strong>7 days</strong> before being permanently purged.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <style>{`
            @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          `}</style>
          <button 
            onClick={fetchRecycled} 
            disabled={refreshing}
            style={{ 
              padding: '10px 18px', 
              background: '#f1f5f9', 
              color: '#475569', 
              border: '1px solid #cbd5e1', 
              borderRadius: '8px', 
              cursor: refreshing ? 'wait' : 'pointer', 
              fontSize: '14px', 
              fontWeight: '600',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span style={{ display: 'inline-block', animation: refreshing ? 'spin 1s linear infinite' : 'none' }}>↻</span> Refresh
          </button>

          <button 
            onClick={() => {
              setIsMultiSelect(!isMultiSelect);
              setSelectedIds([]);
            }} 
            style={{ 
              padding: '10px 18px', 
              background: isMultiSelect ? '#eff6ff' : '#fff', 
              color: '#2563eb', 
              border: '1px solid #2563eb', 
              borderRadius: '8px', 
              fontWeight: '600', 
              cursor: 'pointer', 
              fontSize: '14px',
              transition: 'all 0.2s'
            }}
          >
            {isMultiSelect ? 'Disable Select' : 'Multi Select'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '16px' }}>
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

      {/* Search Input Bar (Matching main tab search layout) */}
      <div style={{ marginBottom: '16px' }}>
        <input 
          type="text" 
          placeholder={`Search recycled ${activeTab === 'enquiry' ? 'enquiries' : 'customers'} by name, email, or phone...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '100%', padding: '10px 16px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }}
        />
      </div>

      {/* Multi-select Action Banner (Exact match to screenshot card layout!) */}
      {isMultiSelect && (
        <div style={{
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '12px' }}>
            {selectedIds.length} selected
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button 
              onClick={toggleSelectAllPage}
              style={{
                padding: '8px 14px',
                fontSize: '12px',
                background: '#eff6ff',
                color: '#2563eb',
                border: '1px solid #bfdbfe',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                whiteSpace: 'nowrap'
              }}
            >
              Select All on Page
            </button>
            
            <button 
              onClick={() => handleBulkAction('restore')}
              disabled={actioningBulk || selectedIds.length === 0}
              style={{
                padding: '8px 14px',
                fontSize: '12px',
                background: selectedIds.length === 0 ? '#f1f5f9' : '#e8f5e9',
                color: selectedIds.length === 0 ? '#94a3b8' : '#2e7d32',
                border: selectedIds.length === 0 ? '1px solid #e2e8f0' : '1px solid #c8e6c9',
                borderRadius: '8px',
                fontWeight: '700',
                cursor: selectedIds.length === 0 ? 'not-allowed' : 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span style={{ color: selectedIds.length === 0 ? '#cbd5e1' : '#2e7d32' }}>🟢</span>
              Restore Selected
            </button>

            <button 
              onClick={() => handleBulkAction('delete')}
              disabled={actioningBulk || selectedIds.length === 0}
              style={{
                padding: '8px 14px',
                fontSize: '12px',
                background: selectedIds.length === 0 ? '#f1f5f9' : '#fee2e2',
                color: selectedIds.length === 0 ? '#94a3b8' : '#c62828',
                border: selectedIds.length === 0 ? '1px solid #e2e8f0' : '1px solid #ffcdd2',
                borderRadius: '8px',
                fontWeight: '700',
                cursor: selectedIds.length === 0 ? 'not-allowed' : 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span style={{ fontSize: '13px' }}>🗑️</span>
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Desktop view (Table layout stays as it is) */}
      <div className="hidden md:block" style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>Loading...</div>
        ) : paginatedItems.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No items found in recycle bin</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>
                  {activeTab === 'enquiry' ? 'Enquiry Contact / Detail' : 'Customer Name'}
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>
                  {activeTab === 'enquiry' ? 'Message' : 'Email & Phone'}
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
              {paginatedItems.map(item => {
                const isSelected = selectedIds.includes(item._id);
                const daysLeft = getDaysRemaining(item.deletedAt);
                const phone = activeTab === 'enquiry' ? (item.customer?.phone || '') : (item.phone || '');
                return (
                  <tr 
                    key={item._id} 
                    onClick={(ev) => {
                      if (!isMultiSelect) return;
                      const target = ev.target as HTMLElement;
                      if (target.tagName === 'BUTTON' || target.closest('button') || target.tagName === 'A' || target.closest('a')) return;
                      toggleSelectItem(item._id);
                    }}
                    style={{ 
                      borderBottom: '1px solid #f1f5f9',
                      background: isSelected ? '#f0f7ff' : 'transparent',
                      borderLeft: isSelected ? '4px solid #3b82f6' : '4px solid transparent',
                      cursor: isMultiSelect ? 'pointer' : 'default',
                      transition: 'all 0.15s'
                    }}
                  >
                    <td style={{ padding: '16px', fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>
                      {activeTab === 'enquiry' ? (
                        <>
                          <div>{item.customer?.name || 'Unknown'}</div>
                          {phone && (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                              <a
                                href={getWhatsAppLink(phone)}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(ev) => ev.stopPropagation()}
                                style={{ display: 'inline-flex', alignItems: 'center' }}
                              >
                                <img src="/whatsapp.png" alt="WhatsApp" style={{ width: '16px', height: '16px' }} />
                              </a>
                              <a href={`tel:${phone}`} onClick={(ev) => ev.stopPropagation()} style={{ color: '#2563eb', textDecoration: 'none' }}>
                                {phone}
                              </a>
                            </div>
                          )}
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
                          {phone && (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                              <a
                                href={getWhatsAppLink(phone)}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(ev) => ev.stopPropagation()}
                                style={{ display: 'inline-flex', alignItems: 'center' }}
                              >
                                <img src="/whatsapp.png" alt="WhatsApp" style={{ width: '16px', height: '16px' }} />
                              </a>
                              <a href={`tel:${phone}`} onClick={(ev) => ev.stopPropagation()} style={{ color: '#2563eb', textDecoration: 'none' }}>
                                {phone}
                              </a>
                            </div>
                          )}
                        </>
                      )}
                    </td>
                    <td style={{ padding: '16px', fontSize: '13px', color: '#64748b' }}>
                      <div>{new Date(item.deletedAt || Date.now()).toLocaleDateString()}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                        {new Date(item.deletedAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
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
                          🔄 Restore
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
                          🗑️ Delete Forever
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Mobile view (EXACTLY matching the user's uploaded reference screenshot!) */}
      <div className="block md:hidden">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading...</div>
        ) : paginatedItems.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No items found</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {paginatedItems.map(item => {
              const isSelected = selectedIds.includes(item._id);
              const daysLeft = getDaysRemaining(item.deletedAt);
              const name = activeTab === 'enquiry' ? (item.customer?.name || 'Unknown') : item.name;
              const phone = activeTab === 'enquiry' ? (item.customer?.phone || '') : (item.phone || '');
              const email = activeTab === 'enquiry' ? (item.customer?.email || '') : item.email;

              return (
                <div
                  key={item._id}
                  onClick={(ev) => {
                    if (!isMultiSelect) return;
                    const target = ev.target as HTMLElement;
                    if (target.tagName === 'BUTTON' || target.closest('button') || target.tagName === 'A' || target.closest('a') || target.tagName === 'IMG') return;
                    toggleSelectItem(item._id);
                  }}
                  style={{
                    background: '#fff',
                    borderRadius: '12px',
                    border: isSelected ? '2px solid #2563eb' : '2px solid #e2e8f0', // Fixed constant 2px size to prevent layout shift jumps!
                    padding: '16px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    position: 'relative',
                    cursor: isMultiSelect ? 'pointer' : 'default',
                    transition: 'all 0.15s'
                  }}
                >
                  {/* Row 1: User icon, Name, and Delete Forever Button */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '18px', color: '#64748b' }}>👤</span>
                      <span style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>{name}</span>
                    </div>
                    <button
                      onClick={(ev) => { ev.stopPropagation(); handleAction(activeTab, item._id, 'delete'); }}
                      style={{
                        padding: '6px 12px',
                        background: '#fef2f2',
                        border: '1px solid #fca5a5',
                        borderRadius: '6px',
                        color: '#dc2626',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      🗑️ Delete Forever
                    </button>
                  </div>

                  {/* Row 2: Contact Details (✉️ email | WhatsApp icon + Clickable phone number) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>
                    {email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>✉️</span>
                        <span>{email}</span>
                      </div>
                    )}
                    {email && phone && <span style={{ color: '#cbd5e1' }}>|</span>}
                    {phone && (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <a
                          href={getWhatsAppLink(phone)}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(ev) => ev.stopPropagation()}
                          style={{ display: 'inline-flex', alignItems: 'center' }}
                        >
                          <img 
                            src="/whatsapp.png" 
                            alt="WhatsApp" 
                            style={{ width: '16px', height: '16px', cursor: 'pointer' }} 
                          />
                        </a>
                        <a
                          href={`tel:${phone}`}
                          onClick={(ev) => ev.stopPropagation()}
                          style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '600' }}
                        >
                          {phone}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Divider Line */}
                  <div style={{ borderTop: '1px solid #f1f5f9', marginBottom: '12px' }} />

                  {/* Row 3: Info Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr 0.9fr', gap: '8px', alignItems: 'start' }}>
                    {/* Col 1: Deleted At */}
                    <div>
                      <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>Deleted At</div>
                      <div style={{ fontSize: '12px', color: '#475569', fontWeight: '600' }}>
                        {new Date(item.deletedAt || Date.now()).toLocaleDateString('en-GB')}
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                        {new Date(item.deletedAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                      </div>
                    </div>

                    {/* Col 2: Auto-Purge In */}
                    <div>
                      <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>Auto-Purge In</div>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '700',
                        background: daysLeft <= 2 ? '#fef2f2' : '#f0fdf4',
                        color: daysLeft <= 2 ? '#ef4444' : '#16a34a',
                        border: `1px solid ${daysLeft <= 2 ? '#fca5a5' : '#bbf7d0'}`,
                        whiteSpace: 'nowrap'
                      }}>
                        ⏰ {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left
                      </span>
                    </div>

                    {/* Col 3: Actions (Restore) */}
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px', textAlign: 'left' }}>Actions</div>
                      <button
                        onClick={(ev) => { ev.stopPropagation(); handleAction(activeTab, item._id, 'restore'); }}
                        style={{
                          padding: '6px 10px',
                          background: '#f0fdf4',
                          border: '1px solid #bbf7d0',
                          borderRadius: '6px',
                          color: '#16a34a',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          width: '100%',
                          justifyContent: 'center'
                        }}
                      >
                        🔄 Restore
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Blue Informational Box at the bottom matching the screenshot */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        background: '#f0f9ff',
        border: '1px solid #bae6fd',
        borderRadius: '12px',
        padding: '12px 16px',
        marginTop: '20px',
        color: '#0369a1',
        fontSize: '13px',
        lineHeight: '1.4'
      }}>
        <span style={{ fontSize: '18px' }}>ℹ️</span>
        <span>
          Items in Recycle Bin will be automatically permanently deleted after <strong>7 days</strong>.
        </span>
      </div>

      {/* Pagination Bar (Page limits of 10, exact same design as customer/enquiries page) */}
      {totalItems > 0 && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '20px',
          padding: '12px 16px',
          background: '#fff',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          {/* Left info */}
          <div style={{ fontSize: '13px', color: '#64748b' }}>
            Showing <strong style={{ color: '#0f172a' }}>{startIndex + 1}</strong> to <strong style={{ color: '#0f172a' }}>{endIndex}</strong> of <strong style={{ color: '#0f172a' }}>{totalItems}</strong> entries
          </div>

          {/* Center page links */}
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <button 
              disabled={activePage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                background: '#fff',
                cursor: activePage === 1 ? 'not-allowed' : 'pointer',
                opacity: activePage === 1 ? 0.5 : 1,
                fontSize: '13px',
                fontWeight: '500'
              }}
            >
              ‹
            </button>
            {Array.from({ length: totalPages }).map((_, index) => {
              const p = index + 1;
              const isActive = p === activePage;
              return (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: isActive ? '1px solid #3b82f6' : '1px solid #e2e8f0',
                    background: isActive ? '#3b82f6' : '#fff',
                    color: isActive ? '#fff' : '#0f172a',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: isActive ? '700' : '500',
                    minWidth: '32px'
                  }}
                >
                  {p}
                </button>
              );
            })}
            <button 
              disabled={activePage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                background: '#fff',
                cursor: activePage === totalPages ? 'not-allowed' : 'pointer',
                opacity: activePage === totalPages ? 0.5 : 1,
                fontSize: '13px',
                fontWeight: '500'
              }}
            >
              ›
            </button>
          </div>

          {/* Right dropdown page limit selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              style={{
                padding: '6px 12px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '13px',
                background: '#fff',
                cursor: 'pointer',
                outline: 'none',
                color: '#475569'
              }}
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
