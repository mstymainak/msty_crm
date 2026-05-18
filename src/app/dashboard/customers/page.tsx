'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const WhatsAppIcon = () => (
  <img 
    src="/whatsapp.png" 
    alt="WhatsApp" 
    style={{ 
      width: '18px', 
      height: '18px', 
      marginRight: '6px', 
      display: 'inline-block', 
      verticalAlign: 'middle', 
      cursor: 'pointer' 
    }} 
  />
);

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '', source: 'website' });
  const [users, setUsers] = useState<any[]>([]);
  const [userFilter, setUserFilter] = useState('all');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Multi-select states
  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deletingBulk, setDeletingBulk] = useState(false);

  const [refreshing, setRefreshing] = useState(false);

  const fetchCustomers = () => {
    setRefreshing(true);
    fetch('/api/customers?_t=' + Date.now())
      .then(r => r.json())
      .then(d => {
        setCustomers(Array.isArray(d) ? d : []);
        setLoading(false);
        setRefreshing(false);
      })
      .catch(() => { setLoading(false); setRefreshing(false); });
  };

  useEffect(() => {
    fetchCustomers();
    fetch('/api/users').then(r => r.json()).then(d => setUsers(Array.isArray(d) ? d : []));
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    setForm({ name: '', email: '', phone: '', source: 'website' });
    setShowAdd(false);
    fetchCustomers();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this customer?')) return;
    await fetch(`/api/customers/${id}`, { method: 'DELETE' });
    setSelectedIds(prev => prev.filter(item => item !== id));
    fetchCustomers();
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Delete all ${selectedIds.length} selected customers?`)) return;

    setDeletingBulk(true);
    try {
      await Promise.all(
        selectedIds.map(id =>
          fetch(`/api/customers/${id}`, { method: 'DELETE' })
        )
      );
      setSelectedIds([]);
      setIsMultiSelect(false);
      fetchCustomers();
    } catch (err) {
      console.error('Error during bulk deletion:', err);
      alert('An error occurred during bulk deletion. Some records might not have been deleted.');
    } finally {
      setDeletingBulk(false);
    }
  };

  const toggleSelectCustomer = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(x => x !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Reset pagination when searching
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const filtered = customers.filter(c => {
    if (userFilter !== 'all' && (c.createdBy?._id || c.createdBy) !== userFilter) return false;
    
    const search = searchQuery.toLowerCase();
    return (
      c.name?.toLowerCase().includes(search) ||
      c.phone?.includes(searchQuery) ||
      c.email?.toLowerCase().includes(search)
    );
  });

  // Pagination Calculations
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const activePage = Math.max(1, Math.min(currentPage, totalPages));

  const startIndex = (activePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedCustomers = filtered.slice(startIndex, endIndex);

  const toggleSelectAllPage = () => {
    const pageIds = paginatedCustomers.map(c => c._id);
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

  const isAllPageSelected = paginatedCustomers.length > 0 && paginatedCustomers.map(c => c._id).every(id => selectedIds.includes(id));

  const getWhatsAppLink = (phone: string) => {
    const clean = phone.replace(/\D/g, '');
    if (!clean) return '#';
    if (clean.length === 10) {
      return `https://wa.me/91${clean}`;
    }
    return `https://wa.me/${clean}`;
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Customers</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: '14px' }}>{customers.length} total customers</p>
        </div>
        
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <style>{`
            @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          `}</style>
          <button 
            onClick={fetchCustomers} 
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
          
          <button onClick={() => setShowAdd(true)} style={{ padding: '10px 20px', background: '#f97316', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>
            + Add Customer
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input 
          type="text" 
          placeholder="Search customers by name, email, or phone..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ flex: 1, minWidth: '250px', padding: '10px 16px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }}
        />
        <select 
          value={userFilter} 
          onChange={e => setUserFilter(e.target.value)}
          style={{ padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', background: '#fff', color: '#475569', outline: 'none' }}
        >
          <option value="all">All Users</option>
          {users.map(u => (
            <option key={u._id} value={u._id}>{u.name}</option>
          ))}
        </select>
      </div>

      {showAdd && (
        <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '600' }}>Add New Customer</h3>
          <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
            <input placeholder="Full Name *" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={{ padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }} />
            <input placeholder="Email (Optional)" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={{ padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }} />
            <input placeholder="Phone *" required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} style={{ padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }} />
            <select 
              value={form.source} 
              onChange={e => setForm({ ...form, source: e.target.value })} 
              style={{ padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', background: '#fff' }}
            >
              <option value="whatsapp">WhatsApp</option>
              <option value="facebook">Facebook</option>
              <option value="instagram">Instagram</option>
              <option value="website">Website</option>
              <option value="phone">Phone Call</option>
              <option value="email">Email</option>
              <option value="crm">CRM</option>
              <option value="other">Other</option>
            </select>
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowAdd(false)} style={{ padding: '8px 16px', background: '#f1f5f9', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
              <button type="submit" style={{ padding: '8px 16px', background: '#f97316', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>Save</button>
            </div>
          </form>
        </div>
      )}

      {/* Multi-select Action Banner (Cancel button removed, sizes and styles adjusted) */}
      {isMultiSelect && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '10px 14px',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <span style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>
            {selectedIds.length} selected
          </span>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button 
              onClick={toggleSelectAllPage}
              style={{
                padding: '8px 12px',
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
              {isAllPageSelected ? 'Deselect Page' : 'Select All on Page'}
            </button>
            <button 
              onClick={handleBulkDelete}
              disabled={deletingBulk || selectedIds.length === 0}
              style={{
                padding: '8px 12px',
                fontSize: '12px',
                background: selectedIds.length === 0 ? '#f1f5f9' : '#fee2e2',
                color: selectedIds.length === 0 ? '#94a3b8' : '#dc2626',
                border: selectedIds.length === 0 ? '1px solid #e2e8f0' : '1px solid #fecaca',
                borderRadius: '8px',
                fontWeight: '700',
                cursor: selectedIds.length === 0 ? 'not-allowed' : 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {deletingBulk ? 'Deleting...' : '🗑️ Delete Selected'}
            </button>
          </div>
        </div>
      )}

      {/* Desktop view (Table layout) */}
      <div className="hidden md:block" style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
              {['Name', 'Email', 'Phone', 'Source', 'Date', 'Actions'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading...</td></tr> :
            paginatedCustomers.length === 0 ? <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No customers found.</td></tr> :
            paginatedCustomers.map(c => {
              const isSelected = selectedIds.includes(c._id);
              return (
                <tr 
                  key={c._id} 
                  onClick={(ev) => {
                    if (!isMultiSelect) return;
                    const target = ev.target as HTMLElement;
                    if (target.tagName === 'BUTTON' || target.closest('button') || target.tagName === 'A' || target.closest('a')) return;
                    toggleSelectCustomer(c._id);
                  }}
                  style={{ 
                    borderBottom: '1px solid #f8fafc', 
                    background: isSelected ? '#f0f7ff' : 'transparent',
                    borderLeft: isSelected ? '4px solid #3b82f6' : '4px solid transparent',
                    cursor: isMultiSelect ? 'pointer' : 'default',
                    transition: 'all 0.15s'
                  }}
                >
                  <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: '500', color: '#0f172a' }}>{c.name}</td>
                  <td style={{ padding: '12px 16px', fontSize: '14px', color: '#64748b' }}>{c.email}</td>
                  <td style={{ padding: '12px 16px', fontSize: '14px', color: '#64748b' }}>
                    {c.phone ? (
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <a 
                          href={getWhatsAppLink(c.phone)} 
                          target="_blank" 
                          rel="noreferrer"
                          onClick={(ev) => ev.stopPropagation()}
                          style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
                          title="Open WhatsApp Chat"
                        >
                          <WhatsAppIcon />
                        </a>
                        <a 
                          href={`tel:${c.phone}`} 
                          onClick={(ev) => ev.stopPropagation()}
                          style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '500' }}
                          title="Click to call"
                        >
                          {c.phone}
                        </a>
                        {c.createdBy?.name && (
                          <span style={{ fontSize: '9px', color: '#94a3b8', marginLeft: '6px', fontStyle: 'italic' }}>
                            - {c.createdBy.name.split(' ')[0]}
                          </span>
                        )}
                      </div>
                    ) : '-'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ 
                      padding: '2px 8px', 
                      borderRadius: '10px', 
                      fontSize: '11px', 
                      background: c.source === 'whatsapp' ? '#dcfce7' : c.source === 'crm' ? '#fef3c7' : '#f1f5f9', 
                      color: c.source === 'whatsapp' ? '#166534' : c.source === 'crm' ? '#92400e' : '#64748b',
                      textTransform: 'capitalize'
                    }}>
                      {c.source || 'Website'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#94a3b8' }}>
                    <div>{new Date(c.createdAt).toLocaleDateString('en-GB')}</div>
                    <div style={{ fontSize: '11px', marginTop: '2px' }}>{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <button onClick={() => handleDelete(c._id)} style={{ padding: '4px 10px', background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}>Delete</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile view (Card layout matching enquiries ratio) */}
      <div className="block md:hidden">
        {loading ? <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading...</div> :
        paginatedCustomers.length === 0 ? <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No customers found.</div> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {paginatedCustomers.map(c => {
              const isSelected = selectedIds.includes(c._id);
              return (
                <div 
                  key={c._id} 
                  onClick={(ev) => {
                    if (!isMultiSelect) return;
                    const target = ev.target as HTMLElement;
                    if (target.tagName === 'BUTTON' || target.closest('button') || target.tagName === 'A' || target.closest('a')) return;
                    toggleSelectCustomer(c._id);
                  }}
                  style={{
                    background: isSelected ? '#f0f7ff' : '#fff',
                    borderRadius: '12px',
                    border: isSelected ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                    padding: '12px 14px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    cursor: isMultiSelect ? 'pointer' : 'default',
                    transition: 'all 0.15s'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    {/* Header: Name and Badge */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <div style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>{c.name}</div>
                      <div>
                        <span style={{ 
                          padding: '2px 8px', 
                          borderRadius: '10px', 
                          fontSize: '11px', 
                          background: c.source === 'whatsapp' ? '#dcfce7' : c.source === 'crm' ? '#fef3c7' : '#f1f5f9', 
                          color: c.source === 'whatsapp' ? '#166534' : c.source === 'crm' ? '#92400e' : '#64748b',
                          textTransform: 'capitalize'
                        }}>
                          {c.source || 'Website'}
                        </span>
                      </div>
                    </div>

                    {/* Email and Phone */}
                    <div style={{ fontSize: '13px', color: '#475569', marginBottom: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>📧</span>
                        <span style={{ wordBreak: 'break-all' }}>{c.email}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>📞</span>
                        {c.phone ? (
                          <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                            <a 
                              href={getWhatsAppLink(c.phone)} 
                              target="_blank" 
                              rel="noreferrer"
                              onClick={(ev) => ev.stopPropagation()}
                              style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
                              title="Open WhatsApp Chat"
                            >
                              <WhatsAppIcon />
                            </a>
                            <a 
                              href={`tel:${c.phone}`}
                              onClick={(ev) => ev.stopPropagation()}
                              style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '600' }}
                              title="Click to call"
                            >
                              {c.phone}
                            </a>
                            {c.createdBy?.name && (
                              <span style={{ fontSize: '9px', color: '#94a3b8', marginLeft: '6px', fontStyle: 'italic' }}>
                                - {c.createdBy.name.split(' ')[0]}
                              </span>
                            )}
                          </div>
                        ) : '-'}
                      </div>
                      {/* Redundant source removed as per request */}
                    </div>

                    {/* Footer: Date / Time and Delete Button */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                        <span>{new Date(c.createdAt).toLocaleDateString('en-GB')}</span>
                        <span style={{ marginLeft: '6px' }}>{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                      </div>
                      <button onClick={() => handleDelete(c._id)} style={{ padding: '4px 10px', background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}>Delete</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination Bar (Matching Screenshot layout perfectly) */}
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
            Showing <strong style={{ color: '#0f172a' }}>{startIndex + 1}</strong> to <strong style={{ color: '#0f172a' }}>{endIndex}</strong> of <strong style={{ color: '#0f172a' }}>{totalItems}</strong> customers
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
