'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const getAvatarStyle = (name: string) => {
  const colors = [
    { bg: '#fef3c7', text: '#d97706' }, // yellow
    { bg: '#e0e7ff', text: '#4f46e5' }, // indigo
    { bg: '#dcfce7', text: '#15803d' }, // green
    { bg: '#e0f2fe', text: '#0369a1' }, // sky
    { bg: '#fce7f3', text: '#be185d' }, // pink
    { bg: '#ffedd5', text: '#c2410c' }, // orange
    { bg: '#f3e8ff', text: '#7e22ce' }, // purple
  ];
  const charCodeSum = (name || '').split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const index = charCodeSum % colors.length;
  return colors[index] || colors[0];
};

const renderAvatarText = (name: string) => {
  const parts = (name || '').split(' ').slice(0, 3);
  return parts.map((p, i) => <div key={i}>{p}</div>);
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' });
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);

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
    setSelectedCustomerIds(prev => prev.filter(x => x !== id));
    fetchCustomers();
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedCustomerIds.length} selected customers?`)) return;
    setLoading(true);
    try {
      await Promise.all(selectedCustomerIds.map(id => fetch(`/api/customers/${id}`, { method: 'DELETE' })));
      setSelectedCustomerIds([]);
      fetchCustomers();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectCustomer = (id: string) => {
    setSelectedCustomerIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleSelectAllCustomers = () => {
    if (selectedCustomerIds.length === filtered.length && filtered.length > 0) {
      setSelectedCustomerIds([]);
    } else {
      setSelectedCustomerIds(filtered.map(c => c._id));
    }
  };

  const filtered = customers.filter(c =>
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone?.includes(searchQuery) ||
    c.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Customers</h1>
            <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: '14px' }}>{customers.length} total customers</p>
          </div>
          <button onClick={fetchCustomers} style={{ padding: '8px 16px', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>↻ Refresh</button>
        </div>
        <button onClick={() => setShowAdd(true)} style={{ padding: '10px 20px', background: '#f97316', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>
          + Add Customer
        </button>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <input 
          type="text" 
          placeholder="Search by name, email, phone, or source..." 
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

      {/* Bulk Actions Container */}
      {selectedCustomerIds.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px' }}>
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#991b1b' }}>
            {selectedCustomerIds.length} selected
          </span>
          <button
            onClick={handleBulkDelete}
            style={{
              padding: '6px 12px',
              background: '#dc2626',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: '600',
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            Delete Selected
          </button>
          <button
            onClick={() => setSelectedCustomerIds([])}
            style={{
              padding: '6px 12px',
              background: 'transparent',
              color: '#475569',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              fontWeight: '500',
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            Deselect All
          </button>
        </div>
      )}

      {/* Desktop view (Table layout) */}
      <div className="hidden md:block" style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
              <th style={{ padding: '12px 16px', width: '40px', textAlign: 'left' }}>
                <input
                  type="checkbox"
                  checked={selectedCustomerIds.length === filtered.length && filtered.length > 0}
                  onChange={toggleSelectAllCustomers}
                  style={{ cursor: 'pointer', width: '15px', height: '15px' }}
                />
              </th>
              {['Name', 'Email', 'Phone', 'Source', 'Date', 'Actions'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={7} style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>Loading...</td></tr> :
            filtered.length === 0 ? <tr><td colSpan={7} style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>No customers found.</td></tr> :
            filtered.map(c => (
              <tr key={c._id} style={{ borderBottom: '1px solid #f8fafc' }}>
                <td style={{ padding: '12px 16px', width: '40px' }}>
                  <input
                    type="checkbox"
                    checked={selectedCustomerIds.includes(c._id)}
                    onChange={() => toggleSelectCustomer(c._id)}
                    style={{ cursor: 'pointer', width: '15px', height: '15px' }}
                  />
                </td>
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

      {/* Mobile view (Card layout) */}
      <div className="block md:hidden">
        {loading ? <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading...</div> :
        filtered.length === 0 ? <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No customers found</div> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filtered.map(c => {
              const avatar = getAvatarStyle(c.name);
              const isWhatsApp = !!c.whatsappNumber;
              const isFacebook = !!c.facebookId;
              const sourceLabel = isWhatsApp ? 'WhatsApp' : isFacebook ? 'Facebook' : 'Website';
              const sourceBg = isWhatsApp ? '#dcfce7' : isFacebook ? '#dbeafe' : '#f1f5f9';
              const sourceColor = isWhatsApp ? '#166534' : isFacebook ? '#1e40af' : '#64748b';

              return (
                <div key={c._id} style={{
                  background: '#fff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  padding: '16px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}>
                  {/* Left Side: Checkbox & Avatar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input
                      type="checkbox"
                      checked={selectedCustomerIds.includes(c._id)}
                      onChange={() => toggleSelectCustomer(c._id)}
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <div style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      background: avatar.bg,
                      color: avatar.text,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '9px',
                      fontWeight: '700',
                      lineHeight: '1.1',
                      textAlign: 'center',
                      textTransform: 'uppercase',
                      padding: '4px',
                      boxSizing: 'border-box',
                      flexShrink: 0
                    }}>
                      {renderAvatarText(c.name)}
                    </div>
                  </div>

                  {/* Middle Section: Name, Email, Phone */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', marginBottom: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#64748b', marginBottom: '3px' }}>
                      <span style={{ fontSize: '11px' }}>✉️</span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.email}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#64748b' }}>
                      <span style={{ fontSize: '11px' }}>📞</span>
                      <span>{c.phone}</span>
                    </div>
                  </div>

                  {/* Right Section: Source, Date, and Delete Button */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', flexShrink: 0 }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '600',
                      background: sourceBg,
                      color: sourceColor,
                      textTransform: 'capitalize'
                    }}>
                      {sourceLabel}
                    </span>
                    <div style={{ fontSize: '11px', color: '#64748b', textAlign: 'right', lineHeight: '1.2' }}>
                      <div>{new Date(c.createdAt).toLocaleDateString()}</div>
                      <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '1px' }}>
                        {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(c._id)}
                      style={{
                        padding: '6px 12px',
                        background: '#fef2f2',
                        border: '1px solid #fee2e2',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: '#dc2626',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}
                    >
                      <span>🗑️ Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
