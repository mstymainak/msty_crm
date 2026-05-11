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
  const [packages, setPackages] = useState<any[]>([]);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState('');

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
    await fetch(`/api/enquiries/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ package: packageId || null }) });
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

  const filtered = enquiries.filter(e => {
    if (statusFilter !== 'all' && e.status !== statusFilter) return false;
    if (sourceFilter !== 'all' && e.source !== sourceFilter) return false;
    if (priorityFilter !== 'all' && e.priority !== priorityFilter) return false;
    return true;
  });

  const selectStyle = { padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', background: '#fff', cursor: 'pointer' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Enquiries</h1>
            <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: '14px' }}>{enquiries.length} total enquiries</p>
          </div>
          <button onClick={fetchEnquiries} style={{ padding: '8px 16px', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>↻ Refresh</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
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
      </div>

      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        {loading ? <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading...</div> :
        filtered.length === 0 ? <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No enquiries found</div> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
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
                      <select
                        value={e.package || ''}
                        onChange={(ev) => updatePackage(e._id, ev.target.value)}
                        style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '12px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', maxWidth: '120px' }}
                      >
                        <option value="">No Package</option>
                        {packages.map(p => (
                          <option key={p._id} value={p._id}>{p.name}</option>
                        ))}
                      </select>
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
    </div>
  );
}
