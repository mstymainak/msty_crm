'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Multi-select states
  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deletingBulk, setDeletingBulk] = useState(false);

  const fetchCustomers = () => {
    fetch('/api/customers')
      .then(r => r.json())
      .then(d => {
        setCustomers(Array.isArray(d) ? d : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    setForm({ name: '', email: '', phone: '', address: '' });
    setShowAdd(false);
    fetchCustomers();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this customer?')) return;
    await fetch(`/api/customers/${id}`, { method: 'DELETE' });
    // Reset selection if deleted item was selected
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

  const filtered = customers.filter(c =>
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone?.includes(searchQuery) ||
    c.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Customers</h1>
            <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: '14px' }}>{customers.length} total customers</p>
          </div>
          <button onClick={fetchCustomers} style={{ padding: '8px 16px', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>↻ Refresh</button>
        </div>
        
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
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
            {isMultiSelect ? 'Disable Select' : '⬜ Multi Select'}
          </button>
          
          <button onClick={() => setShowAdd(true)} style={{ padding: '10px 20px', background: '#f97316', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>
            + Add Customer
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <input 
          type="text" 
          placeholder="Search customers by name, email, or phone..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '100%', padding: '10px 16px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }}
        />
      </div>

      {showAdd && (
        <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '600' }}>Add New Customer</h3>
          <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <input placeholder="Full Name *" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={{ padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }} />
            <input placeholder="Email *" required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={{ padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }} />
            <input placeholder="Phone *" required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} style={{ padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }} />
            <input placeholder="Address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} style={{ padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }} />
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowAdd(false)} style={{ padding: '8px 16px', background: '#f1f5f9', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
              <button type="submit" style={{ padding: '8px 16px', background: '#f97316', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>Save</button>
            </div>
          </form>
        </div>
      )}

      {/* Multi-select Action Banner */}
      {isMultiSelect && selectedIds.length > 0 && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '16px'
        }}>
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
            {selectedIds.length} {selectedIds.length === 1 ? 'customer' : 'customers'} selected
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => setSelectedIds([])}
              style={{
                padding: '6px 12px',
                fontSize: '13px',
                background: '#fff',
                color: '#475569',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button 
              onClick={handleBulkDelete}
              disabled={deletingBulk}
              style={{
                padding: '6px 12px',
                fontSize: '13px',
                background: '#fecaca',
                color: '#dc2626',
                border: '1px solid #fca5a5',
                borderRadius: '6px',
                fontWeight: '600',
                cursor: 'pointer'
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
              {isMultiSelect && (
                <th style={{ padding: '12px 16px', width: '40px', textAlign: 'left' }}>
                  <input 
                    type="checkbox" 
                    checked={isAllPageSelected} 
                    onChange={toggleSelectAllPage}
                    style={{ transform: 'scale(1.25)', cursor: 'pointer' }}
                  />
                </th>
              )}
              {['Name', 'Email', 'Phone', 'Source', 'Date', 'Actions'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={isMultiSelect ? 7 : 6} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading...</td></tr> :
            paginatedCustomers.length === 0 ? <tr><td colSpan={isMultiSelect ? 7 : 6} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No customers found.</td></tr> :
            paginatedCustomers.map(c => (
              <tr key={c._id} style={{ borderBottom: '1px solid #f8fafc', background: selectedIds.includes(c._id) ? '#eff6ff' : 'transparent' }}>
                {isMultiSelect && (
                  <td style={{ padding: '12px 16px' }}>
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(c._id)} 
                      onChange={() => toggleSelectCustomer(c._id)}
                      style={{ transform: 'scale(1.2)', cursor: 'pointer' }}
                    />
                  </td>
                )}
                <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: '500', color: '#0f172a' }}>{c.name}</td>
                <td style={{ padding: '12px 16px', fontSize: '14px', color: '#64748b' }}>{c.email}</td>
                <td style={{ padding: '12px 16px', fontSize: '14px', color: '#64748b' }}>{c.phone}</td>
                <td style={{ padding: '12px 16px' }}>
                  {c.whatsappNumber && <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '11px', background: '#dcfce7', color: '#166534' }}>WhatsApp</span>}
                  {c.facebookId && <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '11px', background: '#dbeafe', color: '#1e40af' }}>Facebook</span>}
                  {!c.whatsappNumber && !c.facebookId && <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '11px', background: '#f1f5f9', color: '#64748b' }}>Website</span>}
                </td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#94a3b8' }}>
                  <div>{new Date(c.createdAt).toLocaleDateString()}</div>
                  <div style={{ fontSize: '11px', marginTop: '2px' }}>{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <button onClick={() => handleDelete(c._id)} style={{ padding: '4px 10px', background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}>Delete</button>
                </td>
              </tr>
            ))}
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
                <div key={c._id} style={{
                  background: isSelected ? '#eff6ff' : '#fff',
                  borderRadius: '12px',
                  border: isSelected ? '1px solid #3b82f6' : '1px solid #e2e8f0',
                  padding: '12px 14px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start'
                }}>
                  {isMultiSelect && (
                    <div style={{ paddingTop: '2px' }}>
                      <input 
                        type="checkbox" 
                        checked={isSelected} 
                        onChange={() => toggleSelectCustomer(c._id)}
                        style={{ transform: 'scale(1.2)', cursor: 'pointer' }}
                      />
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    {/* Header: Name and Badge */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <div style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>{c.name}</div>
                      <div>
                        {c.whatsappNumber && <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '11px', background: '#dcfce7', color: '#166534' }}>WhatsApp</span>}
                        {c.facebookId && <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '11px', background: '#dbeafe', color: '#1e40af' }}>Facebook</span>}
                        {!c.whatsappNumber && !c.facebookId && <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '11px', background: '#f1f5f9', color: '#64748b' }}>Website</span>}
                      </div>
                    </div>

                    {/* Email and Phone */}
                    <div style={{ fontSize: '13px', color: '#475569', marginBottom: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>📧</span>
                        <span style={{ wordBreak: 'break-all' }}>{c.email}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>📞</span>
                        <span>{c.phone}</span>
                      </div>
                      {c.address && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span>📍</span>
                          <span>{c.address}</span>
                        </div>
                      )}
                    </div>

                    {/* Footer: Date / Time and Delete Button */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                        <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                        <span style={{ marginLeft: '6px' }}>{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
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
