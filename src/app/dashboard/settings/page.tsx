'use client';

import { useState, useEffect } from 'react';

export default function SettingsPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'agent', phone: '' });
  const [msg, setMsg] = useState('');
  const [currentUserRole, setCurrentUserRole] = useState('agent');
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  
  // Track open 3-dots action menu by User ID
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const [refreshing, setRefreshing] = useState(false);

  const fetchUsers = () => {
    setRefreshing(true);
    fetch('/api/users?_t=' + Date.now())
      .then(r => r.json())
      .then(d => {
        setUsers(Array.isArray(d) ? d : []);
        setLoading(false);
        setRefreshing(false);
      })
      .catch(() => { setLoading(false); setRefreshing(false); });
  };

  useEffect(() => { 
    fetchUsers(); 
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => {
        if(d?.user) setCurrentUserRole(d.user.role);
      });

    // Close 3-dots menu on window click
    const handleCloseMenus = () => setActiveMenuId(null);
    window.addEventListener('click', handleCloseMenus);
    return () => window.removeEventListener('click', handleCloseMenus);
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this staff member?')) return;
    await fetch(`/api/users/${id}`, { method: 'DELETE' });
    fetchUsers();
  };

  const handleChangePassword = async (id: string) => {
    const newPass = prompt('Enter new password for this user:');
    if (!newPass) return;
    await fetch(`/api/users/${id}`, { 
      method: 'PUT', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ password: newPass }) 
    });
    alert('Password updated successfully');
    fetchUsers();
  };

  const handleToggleStatus = async (id: string, newActiveState: boolean) => {
    await fetch(`/api/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: newActiveState })
    });
    fetchUsers();
  };

  const togglePassword = (id: string) => {
    setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('');
    const res = await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    if (!res.ok) {
      const d = await res.json();
      setMsg(d.error || 'Failed');
      return;
    }
    setForm({ name: '', email: '', password: '', role: 'agent', phone: '' });
    setShowForm(false);
    fetchUsers();
  };

  const inputStyle = { padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', width: '100%', boxSizing: 'border-box' as const };

  return (
    <div>
      {/* Header and Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Staff Management</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: '14px' }}>{users.length} staff members</p>
        </div>
        
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <style>{`
            @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          `}</style>
          <button 
            onClick={fetchUsers} 
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

          {currentUserRole === 'admin' && (
            <button 
              onClick={() => setShowForm(true)} 
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
              + Add Staff
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '600' }}>Add Staff Member</h3>
          {msg && <div style={{ padding: '8px 12px', background: '#fef2f2', color: '#dc2626', borderRadius: '6px', fontSize: '13px', marginBottom: '12px' }}>{msg}</div>}
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <input placeholder="Full Name *" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} />
            <input placeholder="Email *" required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={inputStyle} />
            <input placeholder="Password *" required type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} style={inputStyle} />
            <input placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} style={inputStyle} />
            <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} style={inputStyle}>
              <option value="agent">Agent</option>
              <option value="admin">Admin</option>
            </select>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'end' }}>
              <button type="button" onClick={() => setShowForm(false)} style={{ padding: '10px 16px', background: '#f1f5f9', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
              <button type="submit" style={{ padding: '10px 16px', background: '#f97316', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>Save</button>
            </div>
          </form>
        </div>
      )}

      {/* Desktop view (Table layout stays clean with standardized 3-dots action dropdown menus!) */}
      <div className="hidden md:block" style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'visible' }}>
        {loading ? <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading...</div> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                {['Name', 'Email', 'Role', 'Status', 'Joined', currentUserRole === 'admin' ? 'Password' : null, currentUserRole === 'admin' ? 'Actions' : null].filter(Boolean).map(h => (
                  <th key={h as string} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>{h as string}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id} style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: '500', color: '#0f172a' }}>{u.name}</td>
                  <td style={{ padding: '12px 16px', fontSize: '14px', color: '#64748b' }}>{u.email}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: '600', background: u.role === 'admin' ? '#ede9fe' : '#dbeafe', color: u.role === 'admin' ? '#5b21b6' : '#1e40af', textTransform: 'capitalize' }}>{u.role}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: '600', background: u.isActive ? '#dcfce7' : '#fef2f2', color: u.isActive ? '#166534' : '#991b1b' }}>{u.isActive ? 'Active' : 'Inactive'}</span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#94a3b8' }}>
                    <div>{new Date(u.createdAt).toLocaleDateString()}</div>
                    <div style={{ fontSize: '11px', marginTop: '2px' }}>{new Date(u.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</div>
                  </td>
                  {currentUserRole === 'admin' && (
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontFamily: 'monospace', fontSize: '13px', color: '#475569' }}>
                          {showPasswords[u._id] ? (u.visiblePassword || 'hidden') : '••••••••'}
                        </span>
                        {u.visiblePassword && (
                          <button onClick={(ev) => { ev.stopPropagation(); togglePassword(u._id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', padding: '2px 4px' }} title="Toggle Password">
                            {showPasswords[u._id] ? '🙈' : '👁️'}
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                  {currentUserRole === 'admin' && (
                    <td style={{ padding: '12px 16px', position: 'relative' }}>
                      {/* Standardized 3-dots Menu trigger on Web */}
                      <button 
                        onClick={(ev) => {
                          ev.stopPropagation();
                          setActiveMenuId(activeMenuId === u._id ? null : u._id);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          fontSize: '20px',
                          fontWeight: 'bold',
                          color: '#94a3b8',
                          cursor: 'pointer',
                          padding: '4px 8px'
                        }}
                      >
                        ⋮
                      </button>

                      {/* Dropdown menu block */}
                      {activeMenuId === u._id && (
                        <div 
                          onClick={(ev) => ev.stopPropagation()}
                          style={{
                            position: 'absolute',
                            right: '16px',
                            top: '40px',
                            background: '#fff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
                            zIndex: 100,
                            display: 'flex',
                            flexDirection: 'column',
                            padding: '4px',
                            minWidth: '140px'
                          }}
                        >
                          {/* Toggle Active/Inactive */}
                          <button
                            onClick={() => handleToggleStatus(u._id, !u.isActive)}
                            style={{
                              padding: '8px 12px',
                              textAlign: 'left',
                              background: 'none',
                              border: 'none',
                              fontSize: '12px',
                              fontWeight: '600',
                              color: u.isActive ? '#d97706' : '#16a34a',
                              cursor: 'pointer',
                              borderRadius: '4px'
                            }}
                          >
                            {u.isActive ? '⚠️ Inactive (Temp)' : '🟢 Active User'}
                          </button>
                          
                          {/* Change password */}
                          <button
                            onClick={() => { handleChangePassword(u._id); setActiveMenuId(null); }}
                            style={{
                              padding: '8px 12px',
                              textAlign: 'left',
                              background: 'none',
                              border: 'none',
                              fontSize: '12px',
                              fontWeight: '600',
                              color: '#475569',
                              cursor: 'pointer',
                              borderRadius: '4px'
                            }}
                          >
                            🔒 Change Pass
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => { handleDelete(u._id); setActiveMenuId(null); }}
                            style={{
                              padding: '8px 12px',
                              textAlign: 'left',
                              background: 'none',
                              border: 'none',
                              fontSize: '12px',
                              fontWeight: '600',
                              color: '#dc2626',
                              cursor: 'pointer',
                              borderRadius: '4px'
                            }}
                          >
                            🗑️ Delete Staff
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Mobile view (EXACTLY matching the user's uploaded reference screenshot with interactive 3-dot dropdown!) */}
      <div className="block md:hidden">
        {loading ? <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading...</div> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {users.map(u => {
              const firstLetter = u.name ? u.name.charAt(0).toUpperCase() : '👤';
              const isAdmin = u.role === 'admin';
              
              return (
                <div 
                  key={u._id} 
                  style={{
                    background: '#fff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    padding: '16px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    position: 'relative'
                  }}
                >
                  {/* Top Row: Avatar, Name, Email, Status, and Three Dots Menu */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      {/* Round Avatar Icon */}
                      <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        background: isAdmin ? '#ede9fe' : '#e0f2fe',
                        color: isAdmin ? '#5b21b6' : '#0369a1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        fontWeight: '700'
                      }}>
                        {firstLetter}
                      </div>
                      
                      {/* Name & Email & Role Badges */}
                      <div>
                        <div style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>{u.name}</div>
                        <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>{u.email}</div>
                        
                        {/* Badges row */}
                        <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                          <span style={{ 
                            padding: '2px 8px', 
                            borderRadius: '10px', 
                            fontSize: '11px', 
                            fontWeight: '600', 
                            background: isAdmin ? '#ede9fe' : '#dbeafe', 
                            color: isAdmin ? '#5b21b6' : '#1e40af',
                            textTransform: 'capitalize'
                          }}>
                            {u.role}
                          </span>
                          
                          <span style={{ 
                            padding: '2px 8px', 
                            borderRadius: '10px', 
                            fontSize: '11px', 
                            fontWeight: '600', 
                            background: u.isActive ? '#dcfce7' : '#fef2f2', 
                            color: u.isActive ? '#15803d' : '#dc2626'
                          }}>
                            {u.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Three Dots Icon with dropdown on Mobile */}
                    <div style={{ position: 'relative' }}>
                      <button 
                        onClick={(ev) => { ev.stopPropagation(); setActiveMenuId(activeMenuId === u._id ? null : u._id); }}
                        style={{ background: 'none', border: 'none', fontSize: '20px', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                      >
                        ⋮
                      </button>

                      {activeMenuId === u._id && (
                        <div 
                          onClick={(ev) => ev.stopPropagation()}
                          style={{
                            position: 'absolute',
                            right: '0',
                            top: '30px',
                            background: '#fff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
                            zIndex: 100,
                            display: 'flex',
                            flexDirection: 'column',
                            padding: '4px',
                            minWidth: '140px'
                          }}
                        >
                          {/* Toggle Active/Inactive */}
                          <button
                            onClick={() => handleToggleStatus(u._id, !u.isActive)}
                            style={{
                              padding: '8px 12px',
                              textAlign: 'left',
                              background: 'none',
                              border: 'none',
                              fontSize: '12px',
                              fontWeight: '600',
                              color: u.isActive ? '#d97706' : '#16a34a',
                              cursor: 'pointer',
                              borderRadius: '4px'
                            }}
                          >
                            {u.isActive ? '⚠️ Inactive (Temp)' : '🟢 Active User'}
                          </button>
                          
                          {/* Change password */}
                          <button
                            onClick={() => { handleChangePassword(u._id); setActiveMenuId(null); }}
                            style={{
                              padding: '8px 12px',
                              textAlign: 'left',
                              background: 'none',
                              border: 'none',
                              fontSize: '12px',
                              fontWeight: '600',
                              color: '#475569',
                              cursor: 'pointer',
                              borderRadius: '4px'
                            }}
                          >
                            🔒 Change Pass
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => { handleDelete(u._id); setActiveMenuId(null); }}
                            style={{
                              padding: '8px 12px',
                              textAlign: 'left',
                              background: 'none',
                              border: 'none',
                              fontSize: '12px',
                              fontWeight: '600',
                              color: '#dc2626',
                              cursor: 'pointer',
                              borderRadius: '4px'
                            }}
                          >
                            🗑️ Delete Staff
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Divider */}
                  <div style={{ borderTop: '1px solid #f1f5f9', margin: '12px 0' }} />

                  {/* Bottom Info Grid Layout (Joined | Password | Actions) */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: '8px', alignItems: 'start' }}>
                    {/* Col 1: Joined */}
                    <div>
                      <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>
                        📅 Joined
                      </div>
                      <div style={{ fontSize: '12px', color: '#475569', fontWeight: '600' }}>
                        {new Date(u.createdAt).toLocaleDateString('en-GB')}
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                        {new Date(u.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                      </div>
                    </div>

                    {/* Col 2: Password with Eye Toggle Icon */}
                    <div>
                      <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>
                        🔒 Password
                      </div>
                      {currentUserRole === 'admin' ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontFamily: 'monospace', fontSize: '13px', color: '#475569' }}>
                            {showPasswords[u._id] ? (u.visiblePassword || 'hidden') : '••••••••'}
                          </span>
                          {u.visiblePassword && (
                            <button 
                              onClick={(ev) => { ev.stopPropagation(); togglePassword(u._id); }} 
                              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', padding: '2px' }}
                              title="Toggle Password"
                            >
                              {showPasswords[u._id] ? '🙈' : '👁️'}
                            </button>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '12px' }}>🔒 Locked</span>
                      )}
                    </div>

                    {/* Col 3: Actions (Quick status tag indicator) */}
                    <div>
                      <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>
                        Actions
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: u.isActive ? '#16a34a' : '#ef4444' }}>
                        {u.isActive ? '🟢 Click ⋮ to Inactive' : '🔴 Click ⋮ to Active'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', marginTop: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <h3 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: '600' }}>Default Login</h3>
        <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>Email: <code>admin@mstycrm.com</code> | Password: <code>admin123</code></p>
      </div>
    </div>
  );
}
