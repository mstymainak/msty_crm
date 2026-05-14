'use client';

import { useState, useEffect } from 'react';

export default function PackagesPage() {
  const [packages, setPackages] = useState<any[]>([]);
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [form, setForm] = useState({
    name: '', destinations: '', duration: '', price: '', maxGroupSize: '50', description: '', inclusions: '', exclusions: '', isActive: true,
  });

  // Zoom Field States for mobile ratio typing convenience
  const [activeZoomField, setActiveZoomField] = useState<'description' | 'inclusions' | 'exclusions' | null>(null);
  const [zoomValue, setZoomValue] = useState('');

  // Track expanded package details
  const [expandedPkgId, setExpandedPkgId] = useState<string | null>(null);

  const [refreshing, setRefreshing] = useState(false);

  const fetchPackages = () => {
    setRefreshing(true);
    fetch('/api/packages?_t=' + Date.now())
      .then(r => r.json())
      .then(d => { 
        setPackages(Array.isArray(d) ? d : []); 
        setLoading(false); 
        setRefreshing(false);
      })
      .catch(() => { setLoading(false); setRefreshing(false); });
  };

  const fetchEnquiries = () => {
    fetch('/api/enquiries?_t=' + Date.now())
      .then(r => r.json())
      .then(d => setEnquiries(Array.isArray(d) ? d : []));
  };

  useEffect(() => { 
    fetchPackages(); 
    fetchEnquiries(); 
  }, []);

  const resetForm = () => {
    setForm({ name: '', destinations: '', duration: '', price: '', maxGroupSize: '50', description: '', inclusions: '', exclusions: '', isActive: true });
    setEditId(null);
    setShowForm(false);
  };

  const editPackage = (pkg: any) => {
    setForm({
      name: pkg.name, 
      destinations: pkg.destinations?.join(', ') || '', 
      duration: pkg.duration,
      price: String(pkg.price), 
      maxGroupSize: String(pkg.maxGroupSize || 50), 
      description: pkg.description || '',
      inclusions: pkg.inclusions?.join(', ') || '', 
      exclusions: pkg.exclusions?.join(', ') || '', 
      isActive: pkg.isActive,
    });
    setEditId(pkg._id);
    setShowForm(true);
    // Scroll to top smoothly so the user sees the Edit Form immediately!
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const deleteGroup = async (pkg: any, index: number) => {
    if (!confirm('Delete this group?')) return;
    const newGroups = pkg.groups.filter((_: any, i: number) => i !== index);
    await fetch(`/api/packages/${pkg._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ groups: newGroups }) });
    fetchPackages();
  };

  // Trigger mobile typing zoom box helper
  const handleFieldFocus = (field: 'description' | 'inclusions' | 'exclusions') => {
    if (window.innerWidth < 768) {
      setActiveZoomField(field);
      setZoomValue(form[field] || '');
      // Blur immediate keyboard focus on the main underlying screen
      (document.activeElement as HTMLElement)?.blur();
    }
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
      {/* Header and Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Yatra Packages</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: '14px' }}>{packages.length} packages</p>
        </div>
        
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <style>{`
            @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          `}</style>
          <button 
            onClick={() => { fetchPackages(); fetchEnquiries(); }} 
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
            onClick={() => { resetForm(); setShowForm(true); }} 
            style={{ 
              padding: '10px 20px', 
              background: '#f97316', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '8px', 
              fontWeight: '600', 
              cursor: 'pointer', 
              fontSize: '14px' 
            }}
          >
            + Add Package
          </button>
        </div>
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

      {/* Package Form (Desktop/Mobile Inputs) */}
      {showForm && (
        <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '600' }}>{editId ? 'Edit Package' : 'Add New Package'}</h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <input placeholder="Package Name *" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} />
            <input placeholder="Duration (e.g., 5 Days / 4 Nights) *" required value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} style={inputStyle} />
            <input placeholder="Price (₹) *" required type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} style={inputStyle} />
            <input placeholder="Max Group Size" type="number" value={form.maxGroupSize} onChange={e => setForm({ ...form, maxGroupSize: e.target.value })} style={inputStyle} />
            <input placeholder="Destinations (comma separated)" value={form.destinations} onChange={e => setForm({ ...form, destinations: e.target.value })} style={{ ...inputStyle, gridColumn: '1 / -1' }} />
            
            {/* Description Textarea with Mobile-zoom Trigger support */}
            <textarea 
              placeholder="Description (Tap on mobile to open full zoom helper)" 
              value={form.description} 
              onChange={e => setForm({ ...form, description: e.target.value })} 
              onFocus={() => handleFieldFocus('description')}
              rows={3} 
              style={{ ...inputStyle, gridColumn: '1 / -1', resize: 'vertical' }} 
            />
            
            {/* Inclusions & Exclusions Inputs with Mobile-zoom Trigger support */}
            <input 
              placeholder="Inclusions (comma separated - Tap on mobile to zoom)" 
              value={form.inclusions} 
              onChange={e => setForm({ ...form, inclusions: e.target.value })} 
              onFocus={() => handleFieldFocus('inclusions')}
              style={inputStyle} 
            />
            <input 
              placeholder="Exclusions (comma separated - Tap on mobile to zoom)" 
              value={form.exclusions} 
              onChange={e => setForm({ ...form, exclusions: e.target.value })} 
              onFocus={() => handleFieldFocus('exclusions')}
              style={inputStyle} 
            />
            
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={resetForm} style={{ padding: '8px 16px', background: '#f1f5f9', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
              <button type="submit" style={{ padding: '8px 16px', background: '#f97316', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>{editId ? 'Update' : 'Save'}</button>
            </div>
          </form>
        </div>
      )}

      {/* Package Cards Grid */}
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

              {/* Click to expand description, inclusions & exclusions standard details! */}
              <div 
                onClick={() => setExpandedPkgId(expandedPkgId === pkg._id ? null : pkg._id)}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #f1f5f9',
                  borderRadius: '10px',
                  padding: '12px',
                  marginBottom: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {expandedPkgId === pkg._id ? (
                  <div>
                    {pkg.description && (
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>Description</div>
                        <p style={{ margin: 0, fontSize: '13px', color: '#334155', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                          {pkg.description}
                        </p>
                      </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                      {/* Inclusions */}
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: '700', color: '#16a34a', textTransform: 'uppercase', marginBottom: '6px' }}>Inclusions</div>
                        {pkg.inclusions && pkg.inclusions.length > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {pkg.inclusions.map((inc: string, idx: number) => (
                              <div key={idx} style={{ fontSize: '12px', color: '#15803d', display: 'flex', gap: '4px', alignItems: 'start' }}>
                                <span style={{ fontWeight: 'bold' }}>✓</span>
                                <span>{inc}</span>
                              </div>
                            ))}
                          </div>
                        ) : <div style={{ fontSize: '11px', color: '#94a3b8' }}>None specified</div>}
                      </div>

                      {/* Exclusions */}
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: '700', color: '#dc2626', textTransform: 'uppercase', marginBottom: '6px' }}>Exclusions</div>
                        {pkg.exclusions && pkg.exclusions.length > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {pkg.exclusions.map((exc: string, idx: number) => (
                              <div key={idx} style={{ fontSize: '12px', color: '#b91c1c', display: 'flex', gap: '4px', alignItems: 'start' }}>
                                <span style={{ fontWeight: 'bold' }}>×</span>
                                <span>{exc}</span>
                              </div>
                            ))}
                          </div>
                        ) : <div style={{ fontSize: '11px', color: '#94a3b8' }}>None specified</div>}
                      </div>
                    </div>
                    
                    <div style={{ textAlign: 'center', fontSize: '11px', color: '#f97316', fontWeight: '700', marginTop: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '8px' }}>
                      Click to collapse details ▴
                    </div>
                  </div>
                ) : (
                  <div>
                    {pkg.description ? (
                      <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#64748b', lineHeight: '1.5' }}>
                        {pkg.description.substring(0, 85)}{pkg.description.length > 85 ? '...' : ''}
                      </p>
                    ) : (
                      <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#94a3b8', fontStyle: 'italic' }}>
                        No description provided.
                      </p>
                    )}
                    <div style={{ fontSize: '11px', color: '#2563eb', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>📂</span> Click to view inclusions, exclusions & details ▾
                    </div>
                  </div>
                )}
              </div>

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
                    {pkg.groups.map((g: any, i: number) => {
                      const pax = enquiries
                        .filter(e => e.packageGroup === g._id)
                        .reduce((sum, e) => sum + 1 + (e.members?.length || 0), 0);
                      return (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#475569', background: '#f8fafc', padding: '4px 8px', borderRadius: '4px' }}>
                          <div><strong style={{ color: '#0f172a' }}>{g.name}</strong> - {g.date}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: '600', color: pax >= (pkg.maxGroupSize || 50) ? '#dc2626' : '#16a34a' }}>Pax: {pax}/{pkg.maxGroupSize || 50}</span>
                            <button onClick={() => deleteGroup(pkg, i)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '14px', padding: 0 }} title="Delete Group">×</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : <div style={{ fontSize: '12px', color: '#94a3b8' }}>No groups created yet</div>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Typing Zoom Box Modal overlay for description, inclusions & exclusions on Mobile size screen ratios */}
      {activeZoomField && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '500px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 20px',
              borderBottom: '1px solid #f1f5f9',
              background: '#f8fafc'
            }}>
              <span style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', textTransform: 'capitalize' }}>
                ✍️ Type {activeZoomField}
              </span>
              <button
                type="button"
                onClick={() => {
                  setForm(prev => ({ ...prev, [activeZoomField]: zoomValue }));
                  setActiveZoomField(null);
                }}
                style={{
                  background: '#dcfce7',
                  color: '#15803d',
                  border: '1px solid #bbf7d0',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}
                title="Confirm & Save"
              >
                ✓
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px' }}>
              <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#64748b' }}>
                Write your complete text for {activeZoomField} below (comma separated for inclusions/exclusions):
              </p>
              <textarea
                value={zoomValue}
                onChange={(e) => setZoomValue(e.target.value)}
                rows={8}
                autoFocus
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  resize: 'none',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            {/* Modal Footer */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '8px',
              padding: '12px 20px',
              background: '#f8fafc',
              borderTop: '1px solid #f1f5f9'
            }}>
              <button
                type="button"
                onClick={() => setActiveZoomField(null)}
                style={{
                  padding: '8px 16px',
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '13px',
                  color: '#475569',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setForm(prev => ({ ...prev, [activeZoomField]: zoomValue }));
                  setActiveZoomField(null);
                }}
                style={{
                  padding: '8px 16px',
                  background: '#f97316',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Confirm ✓
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
