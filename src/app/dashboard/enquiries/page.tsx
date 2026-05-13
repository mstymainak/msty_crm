'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const statusColors: Record<string, { bg: string; text: string }> = {
  new: { bg: '#ffedd5', text: '#c2410c' },
  contacted: { bg: '#fef3c7', text: '#92400e' },
  qualified: { bg: '#ede9fe', text: '#5b21b6' },
  booked: { bg: '#dcfce7', text: '#166534' },
  lost: { bg: '#fef2f2', text: '#991b1b' },
};

const priorityColors: Record<string, { bg: string; text: string }> = {
  high: { bg: '#fef2f2', text: '#dc2626' },
  medium: { bg: '#fef3c7', text: '#d97706' },
  low: { bg: '#f0fdf4', text: '#16a34a' },
};

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [packageFilter, setPackageFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [packages, setPackages] = useState<any[]>([]);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState('');
  const [selectedEnquiryIds, setSelectedEnquiryIds] = useState<string[]>([]);

  const fetchEnquiries = () => {
    fetch('/api/enquiries').then(r => r.json()).then(d => { setEnquiries(Array.isArray(d) ? d : []); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { 
    fetchEnquiries(); 
    fetch('/api/packages').then(r => r.json()).then(d => setPackages(Array.isArray(d) ? d : []));
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/enquiries/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    fetchEnquiries();
  };

  const updatePriority = async (id: string, priority: string) => {
    await fetch(`/api/enquiries/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ priority }) });
    fetchEnquiries();
  };

  const updatePackage = async (id: string, packageId: string) => {
    await fetch(`/api/enquiries/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ package: packageId || null, packageGroup: null }) });
    fetchEnquiries();
  };

  const updatePackageGroup = async (id: string, groupId: string) => {
    await fetch(`/api/enquiries/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ packageGroup: groupId || null }) });
    fetchEnquiries();
  };

  const saveNote = async (id: string, noteText: string) => {
    await fetch(`/api/enquiries/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ adminNote: noteText }) });
    setEditingNoteId(null);
    fetchEnquiries();
  };

  const deleteNote = async (id: string) => {
    if (!confirm('Delete this note?')) return;
    await fetch(`/api/enquiries/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ adminNote: '' }) });
    fetchEnquiries();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this enquiry?')) return;
    await fetch(`/api/enquiries/${id}`, { method: 'DELETE' });
    fetchEnquiries();
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedEnquiryIds.length} selected enquiries?`)) return;
    setLoading(true);
    try {
      await Promise.all(selectedEnquiryIds.map(id => fetch(`/api/enquiries/${id}`, { method: 'DELETE' })));
      setSelectedEnquiryIds([]);
      fetchEnquiries();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectEnquiry = (id: string) => {
    setSelectedEnquiryIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleSelectAllEnquiries = () => {
    if (selectedEnquiryIds.length === filtered.length && filtered.length > 0) {
      setSelectedEnquiryIds([]);
    } else {
      setSelectedEnquiryIds(filtered.map(e => e._id));
    }
  };

  const filtered = enquiries.filter(e => {
    if (statusFilter !== 'all' && e.status !== statusFilter) return false;
    if (sourceFilter !== 'all' && e.source !== sourceFilter) return false;
    if (priorityFilter !== 'all' && e.priority !== priorityFilter) return false;
    if (packageFilter !== 'all' && e.package !== packageFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const n = (e.customer?.name || '').toLowerCase();
      const p = (e.customer?.phone || '').toLowerCase();
      const em = (e.customer?.email || '').toLowerCase();
      if (!n.includes(q) && !p.includes(q) && !em.includes(q)) return false;
    }
    return true;
  });

  const selectStyle = { padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', background: '#fff', cursor: 'pointer' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Enquiries</h1>
            <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: '14px' }}>Manage and track customer enquiries</p>
          </div>
          <button onClick={fetchEnquiries} style={{ padding: '8px 16px', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>↻ Refresh</button>
        </div>
        <a href="/contact" target="_blank" style={{ padding: '10px 20px', background: '#f97316', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '14px', textDecoration: 'none' }}>
          + Add Enquiry
        </a>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input 
          type="text" 
          placeholder="Search name, phone, email..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', width: '250px' }}
        />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={selectStyle}>
          <option value="all">All Status</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="qualified">Qualified</option>
          <option value="booked">Booked</option>
          <option value="lost">Lost</option>
        </select>
        <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} style={selectStyle}>
          <option value="all">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)} style={selectStyle}>
          <option value="all">All Sources</option>
          <option value="website">Website</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="facebook">Facebook</option>
          <option value="instagram">Instagram</option>
          <option value="phone">Phone</option>
          <option value="email">Email</option>
        </select>
        <select value={packageFilter} onChange={e => setPackageFilter(e.target.value)} style={selectStyle}>
          <option value="all">All Packages</option>
          {packages.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
        </select>
      </div>

      {/* Bulk Actions Container */}
      {selectedEnquiryIds.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px' }}>
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#991b1b' }}>
            {selectedEnquiryIds.length} selected
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
            onClick={() => setSelectedEnquiryIds([])}
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
        {loading ? <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading...</div> :
        filtered.length === 0 ? <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No enquiries found</div> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                <th style={{ padding: '12px 16px', width: '40px', textAlign: 'left' }}>
                  <input
                    type="checkbox"
                    checked={selectedEnquiryIds.length === filtered.length && filtered.length > 0}
                    onChange={toggleSelectAllEnquiries}
                    style={{ cursor: 'pointer', width: '15px', height: '15px' }}
                  />
                </th>
                {['Customer', 'Message', 'Package', 'Source', 'Status', 'Priority', 'Date', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(e => {
                const sc = statusColors[e.status] || { bg: '#f1f5f9', text: '#64748b' };
                const pc = priorityColors[e.priority] || { bg: '#f1f5f9', text: '#64748b' };
                return (
                  <tr key={e._id} style={{ borderBottom: '1px solid #e2e8f0', background: pc.bg }}>
                    <td style={{ padding: '12px 16px', width: '40px' }}>
                      <input
                        type="checkbox"
                        checked={selectedEnquiryIds.includes(e._id)}
                        onChange={() => toggleSelectEnquiry(e._id)}
                        style={{ cursor: 'pointer', width: '15px', height: '15px' }}
                      />
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>{e.customer?.name || 'Unknown'}</div>
                      <div style={{ fontSize: '12px', color: '#334155', fontWeight: '500' }}>{e.customer?.phone || ''}</div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#1e293b', maxWidth: '250px' }}>
                      <details style={{ cursor: 'pointer' }}>
                        <summary style={{ outline: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: '500' }}>
                          {e.message.split('\n')[0] || 'View message'}
                        </summary>
                        <div style={{ position: 'relative', padding: '12px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px', marginTop: '6px', fontSize: '12px', maxHeight: '350px', overflowY: 'auto' }}>
                          
                          <div style={{ position: 'absolute', top: '8px', right: '8px', display: 'flex', gap: '4px' }}>
                            <button onClick={(ev) => { ev.preventDefault(); setEditingNoteId(e._id); setTempNote(e.adminNote || ''); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px' }} title={e.adminNote ? "Edit Note" : "Add Note"}>📝</button>
                            {e.adminNote && <button onClick={(ev) => { ev.preventDefault(); deleteNote(e._id); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px' }} title="Delete Note">🗑️</button>}
                          </div>

                          <div style={{ whiteSpace: 'pre-wrap', marginBottom: '8px', color: '#334155', paddingRight: '45px' }}>{e.message}</div>
                          
                          {editingNoteId === e._id ? (
                            <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed #cbd5e1' }}>
                              <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#64748b', display: 'block', marginBottom: '6px', fontWeight: '600' }}>Edit Note</span>
                              <textarea
                                value={tempNote}
                                onChange={(ev) => setTempNote(ev.target.value)}
                                style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '12px', boxSizing: 'border-box', minHeight: '60px', resize: 'vertical' }}
                                placeholder="Type your note here..."
                                autoFocus
                              />
                              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                                <button onClick={(ev) => { ev.preventDefault(); setEditingNoteId(null); }} style={{ padding: '6px 12px', fontSize: '11px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}>Cancel</button>
                                <button onClick={(ev) => { ev.preventDefault(); saveNote(e._id, tempNote); }} style={{ padding: '6px 12px', fontSize: '11px', background: '#f97316', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}>Save</button>
                              </div>
                            </div>
                          ) : e.adminNote ? (
                            <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed #cbd5e1', color: '#0f172a', fontWeight: '500', whiteSpace: 'pre-wrap' }}>
                              <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#64748b', display: 'block', marginBottom: '4px', fontWeight: '600' }}>Note</span>
                              {e.adminNote}
                            </div>
                          ) : null}
                        </div>
                      </details>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <select
                          value={e.package || ''}
                          onChange={(ev) => updatePackage(e._id, ev.target.value)}
                          style={{ padding: '4px 8px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '4px', background: '#fff', color: e.package ? '#0f172a' : '#94a3b8' }}
                        >
                          <option value="">No Package</option>
                          {packages.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                        </select>
                        
                        {e.package && packages.find(p => p._id === e.package)?.groups?.length > 0 && (
                          <select
                            value={e.packageGroup || ''}
                            onChange={(ev) => updatePackageGroup(e._id, ev.target.value)}
                            style={{ padding: '4px 8px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '4px', background: '#fff', color: e.packageGroup ? '#0f172a' : '#94a3b8' }}
                          >
                            <option value="">No Group Selected</option>
                            {packages.find(p => p._id === e.package)?.groups.map((g: any) => (
                              <option key={g._id} value={g._id}>{g.name} ({g.date})</option>
                            ))}
                          </select>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: '600', background: '#f1f5f9', color: '#475569', textTransform: 'capitalize' }}>{e.source}</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <select
                        value={e.status}
                        onChange={(ev) => updateStatus(e._id, ev.target.value)}
                        style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', border: 'none', background: sc.bg, color: sc.text, cursor: 'pointer' }}
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="qualified">Qualified</option>
                        <option value="booked">Booked</option>
                        <option value="lost">Lost</option>
                      </select>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <select
                        value={e.priority}
                        onChange={(ev) => updatePriority(e._id, ev.target.value)}
                        style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', border: 'none', background: pc.bg, color: pc.text, cursor: 'pointer' }}
                      >
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#334155', fontWeight: '500' }}>
                      <div>{new Date(e.createdAt).toLocaleDateString()}</div>
                      <div style={{ fontSize: '11px', marginTop: '2px', color: '#475569' }}>{new Date(e.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <button onClick={() => handleDelete(e._id)} style={{ padding: '4px 10px', background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}>Delete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Mobile view (Card layout) */}
      <div className="block md:hidden">
        {loading ? <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading...</div> :
        filtered.length === 0 ? <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No enquiries found</div> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filtered.map(e => {
              const sc = statusColors[e.status] || { bg: '#f1f5f9', text: '#64748b' };
              const pc = priorityColors[e.priority] || { bg: '#f1f5f9', text: '#64748b' };
              return (
                <div key={e._id} style={{
                  background: pc.bg,
                  borderRadius: '12px',
                  border: `1px solid ${pc.text}20`,
                  padding: '12px 14px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}>
                  {/* First Row: Name, Package Select, Source */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="checkbox"
                        checked={selectedEnquiryIds.includes(e._id)}
                        onChange={() => toggleSelectEnquiry(e._id)}
                        style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                      />
                      <div style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>
                        {e.customer?.name || 'Unknown'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <select
                        value={e.package || ''}
                        onChange={(ev) => updatePackage(e._id, ev.target.value)}
                        style={{
                          padding: '4px 8px',
                          fontSize: '11px',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          background: '#fff',
                          color: e.package ? '#0f172a' : '#94a3b8',
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="">No Package</option>
                        {packages.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                      </select>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '600',
                        background: '#eff6ff',
                        color: '#3b82f6',
                        textTransform: 'capitalize'
                      }}>
                        {e.source}
                      </span>
                    </div>
                  </div>

                  {/* Second Row: Contact details / click to view full message & notes */}
                  <div style={{ marginBottom: '12px', fontSize: '12px', color: '#475569' }}>
                    <details style={{ cursor: 'pointer' }}>
                      <summary style={{ outline: 'none', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>📞</span>
                        <span>{e.customer?.phone || ''} {e.message ? ` - ${e.message.split('\n')[0]}` : ''}</span>
                      </summary>
                      <div style={{ padding: '8px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px', marginTop: '6px' }}>
                        <div style={{ whiteSpace: 'pre-wrap', marginBottom: '8px', color: '#1e293b' }}>{e.message}</div>
                        
                        {e.package && packages.find(p => p._id === e.package)?.groups?.length > 0 && (
                          <div style={{ marginBottom: '10px' }}>
                            <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#64748b', display: 'block', marginBottom: '4px', fontWeight: '600' }}>Package Group</span>
                            <select
                              value={e.packageGroup || ''}
                              onChange={(ev) => updatePackageGroup(e._id, ev.target.value)}
                              style={{ padding: '4px 8px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '4px', background: '#fff', width: '100%' }}
                            >
                              <option value="">No Group Selected</option>
                              {packages.find(p => p._id === e.package)?.groups.map((g: any) => (
                                <option key={g._id} value={g._id}>{g.name} ({g.date})</option>
                              ))}
                            </select>
                          </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '8px', marginTop: '8px' }}>
                          <span style={{ fontSize: '11px', fontWeight: '600', color: '#475569' }}>Admin Note</span>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={(ev) => { ev.preventDefault(); setEditingNoteId(e._id); setTempNote(e.adminNote || ''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }}>📝</button>
                            {e.adminNote && <button onClick={(ev) => { ev.preventDefault(); deleteNote(e._id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }}>🗑️</button>}
                          </div>
                        </div>

                        {editingNoteId === e._id ? (
                          <div style={{ marginTop: '6px' }}>
                            <textarea
                              value={tempNote}
                              onChange={(ev) => setTempNote(ev.target.value)}
                              style={{ width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '12px', minHeight: '50px', boxSizing: 'border-box' }}
                              placeholder="Type note..."
                            />
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '6px' }}>
                              <button onClick={() => setEditingNoteId(null)} style={{ padding: '4px 8px', fontSize: '11px', background: '#f1f5f9', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                              <button onClick={() => saveNote(e._id, tempNote)} style={{ padding: '4px 8px', fontSize: '11px', background: '#f97316', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Save</button>
                            </div>
                          </div>
                        ) : e.adminNote ? (
                          <div style={{ fontSize: '11px', color: '#0f172a', background: '#f8fafc', padding: '6px', borderRadius: '4px', marginTop: '4px' }}>
                            {e.adminNote}
                          </div>
                        ) : null}
                      </div>
                    </details>
                  </div>

                  {/* Third Row: Status select, Priority select, Date / Time, Delete */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto auto', alignItems: 'center', gap: '10px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Status</span>
                      <select
                        value={e.status}
                        onChange={(ev) => updateStatus(e._id, ev.target.value)}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '600',
                          border: `1px solid ${sc.text}`,
                          background: sc.bg,
                          color: sc.text,
                          cursor: 'pointer',
                          outline: 'none'
                        }}
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="qualified">Qualified</option>
                        <option value="booked">Booked</option>
                        <option value="lost">Lost</option>
                      </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Priority</span>
                      <select
                        value={e.priority}
                        onChange={(ev) => updatePriority(e._id, ev.target.value)}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '600',
                          border: `1px solid ${pc.text}`,
                          background: pc.bg,
                          color: pc.text,
                          cursor: 'pointer',
                          outline: 'none'
                        }}
                      >
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>

                    <div style={{ fontSize: '11px', color: '#475569', fontWeight: '500', textAlign: 'right', lineHeight: '1.3', paddingRight: '4px' }}>
                      <div>{new Date(e.createdAt).toLocaleDateString()}</div>
                      <div style={{ fontSize: '10px', marginTop: '2px', color: '#64748b' }}>
                        {new Date(e.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    <div>
                      <button
                        onClick={() => handleDelete(e._id)}
                        style={{
                          padding: '6px 8px',
                          background: '#fef2f2',
                          border: '1px solid #fee2e2',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <span style={{ color: '#dc2626', fontSize: '14px' }}>🗑️</span>
                      </button>
                    </div>
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
