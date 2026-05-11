'use client';

import { useState, useEffect } from 'react';

export default function PackagesPage() {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [form, setForm] = useState({
    name: '', destinations: '', duration: '', price: '', maxGroupSize: '50', description: '', inclusions: '', exclusions: '', isActive: true,
  });

  const fetchPackages = () => {
    fetch('/api/packages').then(r => r.json()).then(d => { setPackages(Array.isArray(d) ? d : []); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchPackages(); }, []);

  const resetForm = () => {
    setForm({ name: '', destinations: '', duration: '', price: '', maxGroupSize: '50', description: '', inclusions: '', exclusions: '', isActive: true });
    setEditId(null);
    setShowForm(false);
  };

  const editPackage = (pkg: any) => {
    setForm({
      name: pkg.name, destinations: pkg.destinations?.join(', ') || '', duration: pkg.duration,
      price: String(pkg.price), maxGroupSize: String(pkg.maxGroupSize || 50), description: pkg.description || '',
      inclusions: pkg.inclusions?.join(', ') || '', exclusions: pkg.exclusions?.join(', ') || '', isActive: pkg.isActive,
    });
    setEditId(pkg._id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = {
      ...form,
      price: Number(form.price),
      maxGroupSize: Number(form.maxGroupSize),
      destinations: form.destinations.split(',').map(s => s.trim()).filter(Boolean),
      inclusions: form.inclusions.split(',').map(s => s.trim()).filter(Boolean),
      exclusions: form.exclusions.split(',').map(s => s.trim()).filter(Boolean),
    };

    if (editId) {
      await fetch(`/api/packages/${editId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    } else {
      await fetch('/api/packages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    }
    resetForm();
    fetchPackages();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this package?')) return;
    await fetch(`/api/packages/${id}`, { method: 'DELETE' });
    fetchPackages();
  };

  const addGroup = async (pkg: any) => {
    const groupName = prompt('Enter group name (e.g., 15 Aug Batch):');
    if (!groupName) return;
    const groupDate = prompt('Enter start date (e.g., 15-08-2026):');
    if (!groupDate) return;
    const newGroups = [...(pkg.groups || []), { name: groupName, date: groupDate }];
    await fetch(`/api/packages/${pkg._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ groups: newGroups }) });
    fetchPackages();
  };

  const filtered = packages.filter(p => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || (p.destinations?.join(' ') || '').toLowerCase().includes(q);
    }
    return true;
  });

  const inputStyle = { padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', width: '100%', boxSizing: 'border-box' as const };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Yatra Packages</h1>
            <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: '14px' }}>{packages.length} packages</p>
          </div>
          <button onClick={fetchPackages} style={{ padding: '8px 16px', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>↻ Refresh</button>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} style={{ padding: '10px 20px', background: '#f97316', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>
          + Add Package
        </button>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <input 
          type="text" 
          placeholder="Search packages by name or destination..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', width: '300px' }}
        />
      </div>

      {showForm && (
        <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '600' }}>{editId ? 'Edit Package' : 'Add New Package'}</h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <input placeholder="Package Name *" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} />
            <input placeholder="Duration (e.g., 5 Days / 4 Nights) *" required value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} style={inputStyle} />
            <input placeholder="Price (₹) *" required type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} style={inputStyle} />
            <input placeholder="Max Group Size" type="number" value={form.maxGroupSize} onChange={e => setForm({ ...form, maxGroupSize: e.target.value })} style={inputStyle} />
            <input placeholder="Destinations (comma separated)" value={form.destinations} onChange={e => setForm({ ...form, destinations: e.target.value })} style={{ ...inputStyle, gridColumn: '1 / -1' }} />
            <textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} style={{ ...inputStyle, gridColumn: '1 / -1', resize: 'vertical' }} />
            <input placeholder="Inclusions (comma separated)" value={form.inclusions} onChange={e => setForm({ ...form, inclusions: e.target.value })} style={inputStyle} />
            <input placeholder="Exclusions (comma separated)" value={form.exclusions} onChange={e => setForm({ ...form, exclusions: e.target.value })} style={inputStyle} />
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={resetForm} style={{ padding: '8px 16px', background: '#f1f5f9', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
              <button type="submit" style={{ padding: '8px 16px', background: '#f97316', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>{editId ? 'Update' : 'Save'}</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
        {loading ? <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', gridColumn: '1 / -1' }}>Loading...</div> :
        filtered.length === 0 ? <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', gridColumn: '1 / -1' }}>No packages found.</div> :
        filtered.map(pkg => (
          <div key={pkg._id} style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#0f172a' }}>{pkg.name}</h3>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>{pkg.duration}</p>
                </div>
                <span style={{
                  padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '600',
                  background: pkg.isActive ? '#dcfce7' : '#fef2f2',
                  color: pkg.isActive ? '#166534' : '#991b1b',
                }}>{pkg.isActive ? 'Active' : 'Inactive'}</span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', marginBottom: '12px' }}>₹{pkg.price?.toLocaleString()}</div>
              {pkg.destinations?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '12px' }}>
                  {pkg.destinations.map((d: string, i: number) => (
                    <span key={i} style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', background: '#f1f5f9', color: '#475569' }}>{d}</span>
                  ))}
                </div>
              )}
              {pkg.description && <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#64748b', lineHeight: '1.5' }}>{pkg.description.substring(0, 100)}{pkg.description.length > 100 ? '...' : ''}</p>}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <button onClick={() => editPackage(pkg)} style={{ padding: '6px 14px', background: '#f1f5f9', border: 'none', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: '500' }}>Edit</button>
                <button onClick={() => handleDelete(pkg._id)} style={{ padding: '6px 14px', background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}>Delete</button>
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>Groups / Batches</span>
                  <button onClick={() => addGroup(pkg)} style={{ padding: '4px 8px', fontSize: '11px', background: '#f97316', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>+ Add Group</button>
                </div>
                {pkg.groups?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {pkg.groups.map((g: any, i: number) => (
                      <div key={i} style={{ fontSize: '12px', color: '#475569', background: '#f8fafc', padding: '4px 8px', borderRadius: '4px' }}>
                        <strong style={{ color: '#0f172a' }}>{g.name}</strong> - {g.date}
                      </div>
                    ))}
                  </div>
                ) : <div style={{ fontSize: '12px', color: '#94a3b8' }}>No groups created yet</div>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
