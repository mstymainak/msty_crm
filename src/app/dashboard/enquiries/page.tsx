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

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [packageFilter, setPackageFilter] = useState('all');
  const [acquireFilter, setAcquireFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [packages, setPackages] = useState<any[]>([]);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Multi-select states
  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deletingBulk, setDeletingBulk] = useState(false);

  // Member Modal States for adding people/family members to an enquiry
  const [memberModalEnquiry, setMemberModalEnquiry] = useState<any | null>(null);
  const [newMemberForm, setNewMemberForm] = useState({ name: '', phone: '', relation: '', city: '' });
  const [savingMember, setSavingMember] = useState(false);

  const [refreshing, setRefreshing] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchEnquiries();
    }, 5000); // Auto refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchEnquiries = () => {
    setRefreshing(true);
    fetch('/api/enquiries?_t=' + Date.now())
      .then(r => r.json())
      .then(d => {
        const newData = Array.isArray(d) ? d : [];
        
        setEnquiries(prev => {
          if (prev.length > 0 && newData.length > prev.length) {
            const newItems = newData.filter(newItem => !prev.some(oldItem => oldItem._id === newItem._id));
            if (newItems.length > 0) {
              // Trigger local notification if permission is granted
              if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(`New Enquiry from ${newItems[0].submittedName || 'Customer'}`, {
                  body: `Phone: ${newItems[0].phone || 'N/A'}`,
                  icon: '/msty_logo.png'
                });
              }
            }
          }
          return newData;
        });
        
        setLoading(false);
        setRefreshing(false);
      })
      .catch(() => { setLoading(false); setRefreshing(false); });
  };

  useEffect(() => { 
    fetchEnquiries(); 
    fetch('/api/packages').then(r => r.json()).then(d => setPackages(Array.isArray(d) ? d : []));
    fetch('/api/auth/me').then(r => r.json()).then(d => setCurrentUser(d.user));
    fetch('/api/users').then(r => r.json()).then(d => setUsers(Array.isArray(d) ? d : []));
    
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
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

  const handleAcquire = async (id: string) => {
    if (!currentUser) return;
    await fetch(`/api/enquiries/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ acquiredBy: currentUser.userId })
    });
    fetchEnquiries();
  };

  const handleAdminChangeAcquire = async (id: string, userId: string) => {
    const payload = userId 
      ? { acquiredBy: userId, acquiredChangedByAdmin: true }
      : { acquiredBy: null, acquiredChangedByAdmin: false };
    await fetch(`/api/enquiries/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    fetchEnquiries();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this enquiry?')) return;
    await fetch(`/api/enquiries/${id}`, { method: 'DELETE' });
    setSelectedIds(prev => prev.filter(item => item !== id));
    fetchEnquiries();
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Delete all ${selectedIds.length} selected enquiries?`)) return;

    setDeletingBulk(true);
    try {
      await Promise.all(
        selectedIds.map(id =>
          fetch(`/api/enquiries/${id}`, { method: 'DELETE' })
        )
      );
      setSelectedIds([]);
      setIsMultiSelect(false);
      fetchEnquiries();
    } catch (err) {
      console.error('Error during bulk deletion:', err);
      alert('An error occurred during bulk deletion. Some records might not have been deleted.');
    } finally {
      setDeletingBulk(false);
    }
  };

  const toggleSelectEnquiry = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(x => x !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Add Member submit logic
  const handleOpenAddMemberModal = (enquiry: any) => {
    setMemberModalEnquiry(enquiry);
    setNewMemberForm({ name: '', phone: '', relation: '', city: '' });
  };

  const handleAddMemberSubmit = async () => {
    if (!newMemberForm.name.trim()) {
      alert('Please enter a full name.');
      return;
    }
    setSavingMember(true);
    try {
      const updatedMembers = [...(memberModalEnquiry.members || []), newMemberForm];
      const res = await fetch(`/api/enquiries/${memberModalEnquiry._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ members: updatedMembers })
      });
      if (res.ok) {
        const updatedEnquiry = await res.json();
        setMemberModalEnquiry(updatedEnquiry);
        setNewMemberForm({ name: '', phone: '', relation: '', city: '' });
        fetchEnquiries();
      } else {
        alert('Failed to add member.');
      }
    } catch (e) {
      console.error(e);
      alert('Error adding member.');
    } finally {
      setSavingMember(false);
    }
  };

  const handleRemoveMember = async (indexToRemove: number) => {
    if (!confirm('Are you sure you want to remove this person?')) return;
    try {
      const updatedMembers = memberModalEnquiry.members.filter((_: any, idx: number) => idx !== indexToRemove);
      const res = await fetch(`/api/enquiries/${memberModalEnquiry._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ members: updatedMembers })
      });
      if (res.ok) {
        const updatedEnquiry = await res.json();
        setMemberModalEnquiry(updatedEnquiry);
        fetchEnquiries();
      } else {
        alert('Failed to remove member.');
      }
    } catch (e) {
      console.error(e);
      alert('Error removing member.');
    }
  };

  const getWhatsAppLink = (phone: string) => {
    const clean = phone.replace(/\D/g, '');
    const withCountry = clean.length === 10 ? `91${clean}` : clean;
    return `https://wa.me/${withCountry}`;
  };

  // Filter logic
  const filteredEnquiries = enquiries.filter(e => {
    if (statusFilter !== 'all' && e.status !== statusFilter) return false;
    if (sourceFilter !== 'all' && e.source !== sourceFilter) return false;
    if (priorityFilter !== 'all' && e.priority !== priorityFilter) return false;
    if (packageFilter !== 'all') {
      if (packageFilter === 'none') {
        if (e.package) return false;
      } else {
        if (e.package !== packageFilter) return false;
      }
    }
    if (acquireFilter !== 'all') {
      if (acquireFilter === 'not_acquired') {
        if (e.acquiredBy) return false;
      } else if (acquireFilter === 'changed_by_admin') {
        if (!e.acquiredChangedByAdmin) return false;
      } else {
        if (!e.acquiredBy || (e.acquiredBy._id || e.acquiredBy) !== acquireFilter) return false;
      }
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const name = e.customer?.name?.toLowerCase() || '';
      const phone = e.customer?.phone?.toLowerCase() || '';
      const email = e.customer?.email?.toLowerCase() || '';
      if (!name.includes(q) && !phone.includes(q) && !email.includes(q)) return false;
    }
    return true;
  });

  // Pagination calculations
  const totalItems = filteredEnquiries.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const activePage = Math.min(currentPage, totalPages || 1);
  const startIndex = (activePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedEnquiries = filteredEnquiries.slice(startIndex, endIndex);

  const toggleSelectAllPage = () => {
    const pageIds = paginatedEnquiries.map(item => item._id);
    const allSelected = pageIds.every(id => selectedIds.includes(id));

    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !pageIds.includes(id)));
    } else {
      setSelectedIds(prev => {
        const union = new Set([...prev, ...pageIds]);
        return Array.from(union);
      });
    }
  };

  const isAllPageSelected = paginatedEnquiries.length > 0 && paginatedEnquiries.map(item => item._id).every(id => selectedIds.includes(id));

  const selectStyle = { padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', background: '#fff', cursor: 'pointer', outline: 'none', color: '#475569' };

  const renderNoteWithAttribution = (note: string) => {
    if (!note) return null;
    const match = note.match(/^([\s\S]*)\s-\s(\w+)$/);
    if (match) {
      return (
        <>
          {match[1]}
          <span style={{ fontSize: '9px', color: '#94a3b8', marginLeft: '4px', fontStyle: 'italic', display: 'inline-block' }}>
            - {match[2]}
          </span>
        </>
      );
    }
    return note;
  };

  return (
    <div>
      {notification && (
        <div style={{ background: '#ecfdf5', color: '#047857', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #a7f3d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: '600' }}>🔔 {notification}</span>
          <button onClick={() => setNotification(null)} style={{ background: 'none', border: 'none', color: '#047857', cursor: 'pointer', fontSize: '16px' }}>×</button>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Enquiries</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: '14px' }}>Manage and track customer enquiries</p>
        </div>
        
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <style>{`
            @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            @media (max-width: 768px) {
              .mobile-row-group {
                display: flex !important;
                gap: 12px !important;
                width: 100% !important;
                flex-basis: 100% !important;
              }
              .mobile-row-group select {
                flex: 1 !important;
                min-width: 0 !important;
                width: 50% !important;
              }
            }
          `}</style>
          <button 
            onClick={fetchEnquiries} 
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
              background: isMultiSelect ? '#fff7ed' : '#fff', 
              color: '#f97316', 
              border: '1px solid #f97316', 
              borderRadius: '8px', 
              fontWeight: '600', 
              cursor: 'pointer', 
              fontSize: '14px',
              transition: 'all 0.2s'
            }}
          >
            {isMultiSelect ? 'Disable Select' : 'Multi Select'}
          </button>
          
          <a href="/contact" target="_blank" style={{ padding: '10px 20px', background: '#f97316', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '14px', textDecoration: 'none' }}>
            + Add Enquiry
          </a>
        </div>
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
        <div className="mobile-row-group" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select value={packageFilter} onChange={e => setPackageFilter(e.target.value)} style={selectStyle}>
            <option value="all">All Packages</option>
            <option value="none">No Package</option>
            {packages.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
          <select value={acquireFilter} onChange={e => setAcquireFilter(e.target.value)} style={selectStyle}>
            <option value="all">All Acquisition</option>
            <option value="not_acquired">Not acquired</option>
            <option value="changed_by_admin">Changed by admin</option>
            {users.map(u => (
              <option key={u._id} value={u._id}>
                {acquireFilter === u._id ? u.name : `Acquired by ${u.name}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Multi-select Action Banner */}
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
                background: '#fff7ed',
                color: '#f97316',
                border: '1px solid #ffedd5',
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
        {loading ? <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading...</div> :
        paginatedEnquiries.length === 0 ? <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No enquiries found</div> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                {['Customer', 'Message', 'Package', 'Source', 'Status', 'Priority', 'Acquired', 'Date', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 8px', textAlign: 'left', fontSize: h === 'Date' ? '10px' : '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedEnquiries.map(e => {
                const sc = statusColors[e.status] || { bg: '#f1f5f9', text: '#64748b' };
                const pc = priorityColors[e.priority] || { bg: '#f1f5f9', text: '#64748b' };
                const isSelected = selectedIds.includes(e._id);
                const isAcquired = !!e.acquiredBy;
                const isMe = e.acquiredBy?._id === currentUser?.userId || e.acquiredBy === currentUser?.userId;
                const isAdmin = currentUser?.role === 'admin';
                const canEdit = !isAcquired || isMe || isAdmin;
                return (
                  <tr 
                    key={e._id} 
                    onClick={(ev) => {
                      if (!isMultiSelect) return;
                      const target = ev.target as HTMLElement;
                      if (['SELECT', 'BUTTON', 'TEXTAREA', 'INPUT', 'SUMMARY', 'DETAILS'].includes(target.tagName) || target.closest('select') || target.closest('button') || target.closest('details') || target.tagName === 'A' || target.closest('a')) return;
                      toggleSelectEnquiry(e._id);
                    }}
                    style={{ 
                      borderBottom: '1px solid #e2e8f0', 
                      background: isSelected ? '#f0f7ff' : pc.bg,
                      borderLeft: isSelected ? '4px solid #3b82f6' : '4px solid transparent',
                      cursor: isMultiSelect ? 'pointer' : 'default',
                      transition: 'all 0.15s'
                    }}
                  >
                    <td style={{ padding: '12px 8px' }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', maxWidth: '120px', wordBreak: 'break-word' }} title={e.submittedName || e.customer?.name || 'Unknown'}>{e.submittedName || e.customer?.name || 'Unknown'}</div>
                      <div style={{ fontSize: '12px', color: '#334155', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {e.customer?.phone ? (
                          <>
                            <a 
                              href={getWhatsAppLink(e.customer.phone)} 
                              target="_blank" 
                              rel="noreferrer"
                              onClick={(ev) => ev.stopPropagation()}
                              style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
                              title="Open WhatsApp Chat"
                            >
                              <WhatsAppIcon />
                            </a>
                            <a 
                              href={`tel:${e.customer.phone}`} 
                              onClick={(ev) => {
                                ev.stopPropagation();
                                if (e.status === 'new') {
                                  updateStatus(e._id, 'contacted');
                                }
                              }}
                              style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '500' }}
                              title="Click to call"
                            >
                              {e.customer.phone}
                            </a>
                          </>
                        ) : ''}

                        {/* ADD MEMBERS BUTTON ICON WITH COUNT */}
                        <button 
                          onClick={(ev) => { ev.stopPropagation(); handleOpenAddMemberModal(e); }}
                          style={{
                            background: '#fff3eb',
                            border: '1px solid #ffd8bf',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 8px',
                            marginLeft: '12px',
                            verticalAlign: 'middle',
                            color: '#ea580c',
                            fontWeight: '700',
                            fontSize: '11px',
                            transition: 'all 0.15s',
                            boxShadow: '0 1px 2px rgba(249, 115, 22, 0.05)'
                          }}
                          title="Add Family Member / Person"
                        >
                          <span style={{ fontSize: '13px', lineHeight: 1 }}>➕👤</span>
                          <span style={{ fontSize: '11px', lineHeight: 1 }}>{e.members?.length || 0}</span>
                        </button>
                      </div>
                    </td>
                    <td style={{ padding: '12px 8px', fontSize: '13px', color: '#1e293b', maxWidth: '280px' }}>
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
                              {renderNoteWithAttribution(e.adminNote)}
                            </div>
                          ) : null}
                        </div>
                      </details>
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <select
                           value={e.package || ''}
                           onChange={(ev) => updatePackage(e._id, ev.target.value)}
                           style={{ 
                             padding: '4px 8px', 
                             fontSize: '12px', 
                             border: '1px solid #cbd5e1', 
                             borderRadius: '4px', 
                             background: '#fff', 
                             color: e.package ? '#0f172a' : '#94a3b8',
                             maxWidth: '140px',
                             textOverflow: 'ellipsis'
                           }}
                        >
                          <option value="">No Package</option>
                          {packages.map(p => (
                            <option key={p._id} value={p._id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                        
                        {e.package && packages.find(p => p._id === e.package)?.groups?.length > 0 && (
                          <select
                            value={e.packageGroup || ''}
                            onChange={(ev) => updatePackageGroup(e._id, ev.target.value)}
                            style={{ 
                              padding: '4px 8px', 
                              fontSize: '12px', 
                              border: '1px solid #cbd5e1', 
                              borderRadius: '4px', 
                              background: '#fff', 
                              color: e.packageGroup ? '#0f172a' : '#94a3b8',
                              maxWidth: '140px',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            <option value="">No Group Selected</option>
                            {packages.find(p => p._id === e.package)?.groups.map((g: any) => (
                              <option key={g._id} value={g._id}>{g.name} ({g.date})</option>
                            ))}
                          </select>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: '10px', fontSize: '12px', fontWeight: '600', background: '#f1f5f9', color: '#475569', textTransform: 'capitalize' }}>{e.source}</span>
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <select
                        value={e.status}
                        onChange={(ev) => updateStatus(e._id, ev.target.value)}
                        disabled={!canEdit}
                        style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', border: 'none', background: sc.bg, color: sc.text, cursor: canEdit ? 'pointer' : 'not-allowed', opacity: canEdit ? 1 : 0.6 }}
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="qualified">Qualified</option>
                        <option value="booked">Booked</option>
                        <option value="lost">Lost</option>
                      </select>
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <select
                        value={e.priority}
                        onChange={(ev) => updatePriority(e._id, ev.target.value)}
                        disabled={!canEdit}
                        style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', border: 'none', background: pc.bg, color: pc.text, cursor: canEdit ? 'pointer' : 'not-allowed', opacity: canEdit ? 1 : 0.6 }}
                      >
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      {(() => {
                        const isAcquired = !!e.acquiredBy;
                        const acquiredByName = e.acquiredBy?.name || 'Unknown';
                        const acquiredByFirstName = acquiredByName.split(' ')[0];
                        const isMe = e.acquiredBy?._id === currentUser?.userId;
                        const isAdmin = currentUser?.role === 'admin';

                        if (isAdmin) {
                          return (
                            <div>
                              <select
                                value={e.acquiredBy?._id || e.acquiredBy || ''}
                                onChange={(ev) => handleAdminChangeAcquire(e._id, ev.target.value)}
                                style={{ padding: '4px 8px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '4px', background: '#fff' }}
                              >
                                <option value="">Not acquired</option>
                                {users.map(u => (
                                  <option key={u._id} value={u._id}>{u.name}</option>
                                ))}
                              </select>
                              {e.acquiredChangedByAdmin && (
                                <div style={{ fontSize: '9px', color: '#64748b', marginTop: '2px' }}>changed by admin</div>
                              )}
                            </div>
                          );
                        }

                        if (!isAcquired) {
                          return (
                            <button
                              onClick={() => handleAcquire(e._id)}
                              style={{ padding: '4px 8px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}
                            >
                              Acquire
                            </button>
                          );
                        }

                        if (isMe) {
                          return (
                            <div>
                              <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: '600' }}>Acquired</span>
                              {e.acquiredChangedByAdmin && (
                                <div style={{ fontSize: '9px', color: '#64748b', marginTop: '2px' }}>changed by admin</div>
                              )}
                            </div>
                          );
                        }

                        return (
                          <div>
                            <span style={{ fontSize: '12px', color: '#0f172a', fontWeight: '600' }}>{acquiredByFirstName}</span>
                            {e.acquiredChangedByAdmin && (
                              <div style={{ fontSize: '9px', color: '#64748b', marginTop: '2px' }}>changed by admin</div>
                            )}
                          </div>
                        );
                      })()}
                    </td>
                    <td style={{ padding: '12px 8px', fontSize: '11px', color: '#334155', fontWeight: '500' }}>
                      <div>{new Date(e.createdAt).toLocaleDateString('en-GB')}</div>
                      <div style={{ fontSize: '10px', marginTop: '2px', color: '#475569' }}>{new Date(e.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</div>
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <button 
                        onClick={() => handleDelete(e._id)} 
                        disabled={!canEdit}
                        style={{ 
                          padding: '4px 10px', 
                          background: canEdit ? '#fef2f2' : '#f1f5f9', 
                          color: canEdit ? '#dc2626' : '#94a3b8', 
                          border: 'none', 
                          borderRadius: '4px', 
                          fontSize: '12px', 
                          cursor: canEdit ? 'pointer' : 'not-allowed'
                        }}
                      >
                        Delete
                      </button>
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
        paginatedEnquiries.length === 0 ? <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No enquiries found</div> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {paginatedEnquiries.map(e => {
              const sc = statusColors[e.status] || { bg: '#f1f5f9', text: '#64748b' };
              const pc = priorityColors[e.priority] || { bg: '#f1f5f9', text: '#64748b' };
              const isSelected = selectedIds.includes(e._id);
              const isAcquired = !!e.acquiredBy;
              const isMe = e.acquiredBy?._id === currentUser?.userId || e.acquiredBy === currentUser?.userId;
              const isAdmin = currentUser?.role === 'admin';
              const canEdit = !isAcquired || isMe || isAdmin;
              return (
                <div 
                  key={e._id} 
                  onClick={(ev) => {
                    if (!isMultiSelect) return;
                    const target = ev.target as HTMLElement;
                    if (['SELECT', 'BUTTON', 'TEXTAREA', 'INPUT', 'SUMMARY', 'DETAILS'].includes(target.tagName) || target.closest('select') || target.closest('button') || target.closest('details') || target.tagName === 'A' || target.closest('a')) return;
                    toggleSelectEnquiry(e._id);
                  }}
                  style={{
                    position: 'relative',
                    background: isSelected ? '#fff7ed' : pc.bg,
                    borderRadius: '12px',
                    border: isSelected ? '2px solid #f97316' : `1px solid ${pc.text}20`,
                    padding: '12px 14px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    cursor: isMultiSelect ? 'pointer' : 'default',
                    transition: 'all 0.15s'
                  }}
                >
                  {/* Date & Time Display (Right Positioned as per mockup) */}
                  <div style={{ position: 'absolute', top: '50px', right: '14px', textAlign: 'right', fontSize: '11px', color: '#64748b', fontWeight: '500', lineHeight: '1.4' }}>
                    <div>{new Date(e.createdAt).toLocaleDateString('en-GB')}</div>
                    <div>{new Date(e.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    {/* First Row: Name, Package Select, Source */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>
                        {e.submittedName || e.customer?.name || 'Unknown'}
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
                            cursor: 'pointer',
                            maxWidth: '100px',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          <option value="">No Package</option>
                          {packages.map(p => (
                            <option key={p._id} value={p._id}>
                              {p.name}
                            </option>
                          ))}
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

                    {/* Second Row: Non-overlapping Contact details (No click details toggler overlay!) */}
                    <div style={{ marginBottom: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ color: '#64748b' }}>📞</span>
                      {e.customer?.phone ? (
                        <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                          <a 
                            href={getWhatsAppLink(e.customer.phone)} 
                            target="_blank" 
                            rel="noreferrer"
                            onClick={(ev) => ev.stopPropagation()}
                            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
                            title="Open WhatsApp Chat"
                          >
                            <WhatsAppIcon />
                          </a>
                          <a 
                            href={`tel:${e.customer.phone}`}
                            onClick={(ev) => {
                              ev.stopPropagation();
                              if (e.status === 'new') {
                                updateStatus(e._id, 'contacted');
                              }
                            }}
                            style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '600' }}
                            title="Click to call"
                          >
                            {e.customer.phone}
                          </a>
                        </div>
                      ) : <span style={{ color: '#94a3b8' }}>No phone</span>}

                      {/* ADD MEMBERS BUTTON ICON WITH COUNT BELOW IT (MOBILE) */}
                      <button 
                        onClick={(ev) => { ev.stopPropagation(); handleOpenAddMemberModal(e); }}
                        style={{
                          background: '#fff3eb',
                          border: '1px solid #ffd8bf',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '2px 6px',
                          marginLeft: '12px',
                          verticalAlign: 'middle',
                          color: '#ea580c',
                          fontWeight: '700',
                          fontSize: '11px',
                          height: '24px'
                        }}
                        title="Add Family Member / Person"
                      >
                        <span style={{ fontSize: '13px', lineHeight: 1 }}>➕👤</span>
                        <span style={{ fontSize: '11px', lineHeight: 1 }}>{e.members?.length || 0}</span>
                      </button>
                    </div>

                    {/* Third Row: Message details toggle (Separate click action so nothing overlaps!) */}
                    <div style={{ marginBottom: '12px', fontSize: '12px' }}>
                      <details style={{ cursor: 'pointer' }}>
                        <summary style={{ outline: 'none', fontWeight: '600', color: '#2563eb', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          💬 Click to view message & notes ▾
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
                              {renderNoteWithAttribution(e.adminNote)}
                            </div>
                          ) : null}
                        </div>
                      </details>
                    </div>

                    {/* Status Select, Priority Select, Acquire & Delete Button (All on the same flat row!) */}
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <select
                        value={e.status}
                        onChange={(ev) => updateStatus(e._id, ev.target.value)}
                        disabled={!canEdit}
                        style={{ padding: '4px 6px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', border: 'none', background: sc.bg, color: sc.text, cursor: canEdit ? 'pointer' : 'not-allowed', maxWidth: '85px', opacity: canEdit ? 1 : 0.6 }}
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="qualified">Qualified</option>
                        <option value="booked">Booked</option>
                        <option value="lost">Lost</option>
                      </select>

                      <select
                        value={e.priority}
                        onChange={(ev) => updatePriority(e._id, ev.target.value)}
                        disabled={!canEdit}
                        style={{ padding: '4px 6px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', border: 'none', background: pc.bg, color: pc.text, cursor: canEdit ? 'pointer' : 'not-allowed', maxWidth: '65px', opacity: canEdit ? 1 : 0.6 }}
                      >
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>

                      {/* ACQUIRE BUTTON (MOBILE - PERFECT POSITION & ALIGNMENT) */}
                      {(() => {
                        const isAcquired = !!e.acquiredBy;
                        const acquiredByName = e.acquiredBy?.name || 'Unknown';
                        const acquiredByFirstName = acquiredByName.split(' ')[0];
                        const isMe = e.acquiredBy?._id === currentUser?.userId;
                        const isAdmin = currentUser?.role === 'admin';

                        if (isAdmin) {
                          return (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                              {e.acquiredChangedByAdmin && (
                                <div style={{ fontSize: '8px', color: '#64748b', marginBottom: '2px', whiteSpace: 'nowrap', lineHeight: '1' }}>changed by admin</div>
                              )}
                              <select
                                value={e.acquiredBy?._id || e.acquiredBy || ''}
                                onChange={(ev) => handleAdminChangeAcquire(e._id, ev.target.value)}
                                style={{ 
                                  padding: '3px 4px', 
                                  fontSize: '11px', 
                                  border: '1px solid #cbd5e1', 
                                  borderRadius: '4px', 
                                  background: '#fff',
                                  width: '75px',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  outline: 'none'
                                }}
                              >
                                <option value="">Not acquired</option>
                                {users.map(u => {
                                  const isSelected = (e.acquiredBy?._id || e.acquiredBy) === u._id;
                                  return (
                                    <option key={u._id} value={u._id}>
                                      {isSelected ? u.name.split(' ')[0] : u.name}
                                    </option>
                                  );
                                })}
                              </select>
                            </div>
                          );
                        }

                        if (!isAcquired) {
                          return (
                            <button
                              onClick={() => handleAcquire(e._id)}
                              style={{ padding: '4px 6px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: '700', width: '75px', textAlign: 'center' }}
                            >
                              Acquire
                            </button>
                          );
                        }

                        if (isMe) {
                          return (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                              {e.acquiredChangedByAdmin && (
                                <div style={{ fontSize: '8px', color: '#64748b', marginBottom: '2px', whiteSpace: 'nowrap', lineHeight: '1' }}>changed by admin</div>
                              )}
                              <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: '700' }}>Acquired</span>
                            </div>
                          );
                        }

                        return (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            {e.acquiredChangedByAdmin && (
                              <div style={{ fontSize: '8px', color: '#64748b', marginBottom: '2px', whiteSpace: 'nowrap', lineHeight: '1' }}>changed by admin</div>
                            )}
                            <span style={{ fontSize: '11px', color: '#0f172a', fontWeight: '700' }}>{acquiredByFirstName}</span>
                          </div>
                        );
                      })()}

                      <button 
                        onClick={() => handleDelete(e._id)} 
                        disabled={!canEdit}
                        style={{ 
                          padding: '4px 8px', 
                          background: canEdit ? '#fef2f2' : '#f1f5f9', 
                          color: canEdit ? '#dc2626' : '#94a3b8', 
                          border: 'none', 
                          borderRadius: '6px', 
                          fontSize: '11px', 
                          cursor: canEdit ? 'pointer' : 'not-allowed',
                          fontWeight: '700'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '20px',
          background: '#fff',
          borderRadius: '12px',
          padding: '12px 16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ fontSize: '13px', color: '#64748b' }}>
            Showing <strong style={{ color: '#0f172a' }}>{startIndex + 1}</strong> to <strong style={{ color: '#0f172a' }}>{endIndex}</strong> of <strong style={{ color: '#0f172a' }}>{totalItems}</strong> enquiries
          </div>

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

      {/* ADD MEMBER DIALOG MODAL (COMPACT & BEAUTIFUL!) */}
      {memberModalEnquiry && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
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
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '24px 20px',
              borderBottom: '1px solid #f1f5f9',
              background: '#fff'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '24px' }}>👥</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#1e293b', letterSpacing: '-0.02em' }}>
                    Enquiry Members
                  </h3>
                  <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#64748b', fontWeight: '500' }}>
                    For Customer: {memberModalEnquiry.customer?.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setMemberModalEnquiry(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '28px',
                  color: '#94a3b8',
                  padding: '4px',
                  lineHeight: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px', overflowY: 'auto', maxHeight: '420px' }}>
              {/* Existing Members List */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 10px', fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Current Members ({memberModalEnquiry.members?.length || 0})
                </h4>
                
                {!memberModalEnquiry.members || memberModalEnquiry.members.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px', background: '#f8fafc', borderRadius: '10px', color: '#94a3b8', fontSize: '13px', border: '1px dashed #e2e8f0' }}>
                    No family members or additional persons added yet.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {memberModalEnquiry.members.map((m: any, idx: number) => (
                      <div 
                        key={idx} 
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '10px 14px',
                          background: '#f8fafc',
                          border: '1px solid #f1f5f9',
                          borderRadius: '8px'
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a', display: 'flex', alignItems: 'center' }}>
                            {m.name} 
                            {m.relation && (
                              <span style={{ fontSize: '10px', color: '#ea580c', background: '#fff3eb', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px', fontWeight: '700' }}>
                                {m.relation}
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                            {m.phone && `📞 ${m.phone}`} {m.phone && m.city && '•'} {m.city && `City: ${m.city}`}
                          </div>
                        </div>
                        
                        <button
                          onClick={() => handleRemoveMember(idx)}
                          style={{
                            background: '#fef2f2',
                            color: '#dc2626',
                            border: 'none',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            cursor: 'pointer',
                            fontWeight: '700',
                            transition: 'all 0.2s'
                          }}
                          title="Remove Member"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add New Member Form */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                <h4 style={{ margin: '0 0 16px', fontSize: '13px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px' }}>➕</span> ADD NEW PERSON
                </h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <input
                    placeholder="Full Name *"
                    value={newMemberForm.name}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, name: e.target.value })}
                    style={{ width: '100%', padding: '14px 16px', border: '1px solid #cbd5e1', borderRadius: '12px', fontSize: '14px', outline: 'none', background: '#fff', boxSizing: 'border-box' }}
                  />
                  <input
                    placeholder="Relation (e.g. Spouse, Brother, Sister)"
                    value={newMemberForm.relation}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, relation: e.target.value })}
                    style={{ width: '100%', padding: '14px 16px', border: '1px solid #cbd5e1', borderRadius: '12px', fontSize: '14px', outline: 'none', background: '#fff', boxSizing: 'border-box' }}
                  />
                  <input
                    placeholder="Phone Number"
                    value={newMemberForm.phone}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, phone: e.target.value })}
                    style={{ width: '100%', padding: '14px 16px', border: '1px solid #cbd5e1', borderRadius: '12px', fontSize: '14px', outline: 'none', background: '#fff', boxSizing: 'border-box' }}
                  />
                  <input
                    placeholder="City"
                    value={newMemberForm.city}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, city: e.target.value })}
                    style={{ width: '100%', padding: '14px 16px', border: '1px solid #cbd5e1', borderRadius: '12px', fontSize: '14px', outline: 'none', background: '#fff', boxSizing: 'border-box' }}
                  />
                </div>
                

              </div>
            </div>
            
            {/* Footer */}
            <div style={{
              padding: '16px 20px 24px',
              background: '#fff',
              borderTop: '1px solid #f1f5f9'
            }}>
              <button
                onClick={handleAddMemberSubmit}
                disabled={savingMember}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: '#f97316',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: '700',
                  fontSize: '15px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 6px -1px rgba(249, 115, 22, 0.2)',
                  transition: 'all 0.2s'
                }}
              >
                {savingMember ? 'Adding...' : 'Add Person to Enquiry'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
