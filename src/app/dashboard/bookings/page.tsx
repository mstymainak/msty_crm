'use client';

import { useState, useEffect } from 'react';

export default function BookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Add / Edit Form State
  const [form, setForm] = useState({
    customer: '',
    package: '',
    numberOfTravelers: '1',
    travelDate: '',
    totalAmount: '',
    advancePaid: '0',
    paymentMethod: 'cash',
    specialRequirements: '',
    notes: '',
  });

  const fetchBookings = () => {
    setRefreshing(true);
    fetch('/api/bookings?_t=' + Date.now())
      .then(r => r.json())
      .then(d => {
        setBookings(Array.isArray(d) ? d : []);
        setLoading(false);
        setRefreshing(false);
      })
      .catch(() => { setLoading(false); setRefreshing(false); });
  };

  useEffect(() => {
    fetchBookings();
    fetch('/api/customers').then(r => r.json()).then(d => setCustomers(Array.isArray(d) ? d : []));
    fetch('/api/packages').then(r => r.json()).then(d => setPackages(Array.isArray(d) ? d : []));
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchBookings();
      } else {
        alert('Failed to update status.');
      }
    } catch (err) {
      alert('Error updating status.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you absolutely sure you want to cancel and delete this booking?')) return;
    try {
      const res = await fetch(`/api/bookings/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchBookings();
      } else {
        alert('Failed to delete booking.');
      }
    } catch (err) {
      alert('Error deleting booking.');
    }
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customer || !form.package || !form.travelDate || !form.totalAmount) {
      alert('Please fill out all required fields (Customer, Package, Travel Date, Total Amount).');
      return;
    }

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: form.customer,
          package: form.package,
          numberOfTravelers: Number(form.numberOfTravelers || 1),
          travelDate: new Date(form.travelDate),
          totalAmount: Number(form.totalAmount),
          advancePaid: Number(form.advancePaid || 0),
          paymentMethod: form.paymentMethod,
          specialRequirements: form.specialRequirements,
          notes: form.notes,
        }),
      });

      if (res.ok) {
        setShowAddForm(false);
        setForm({
          customer: '',
          package: '',
          numberOfTravelers: '1',
          travelDate: '',
          totalAmount: '',
          advancePaid: '0',
          paymentMethod: 'cash',
          specialRequirements: '',
          notes: '',
        });
        fetchBookings();
      } else {
        alert('Failed to create booking.');
      }
    } catch (err) {
      alert('Error creating booking.');
    }
  };

  const handleUpdatePayment = async (booking: any) => {
    const advInput = prompt('Update Advance Paid amount (₹):', String(booking.advancePaid || 0));
    if (advInput === null) return;
    const newAdv = Number(advInput);
    if (isNaN(newAdv)) {
      alert('Invalid amount entered.');
      return;
    }

    try {
      const res = await fetch(`/api/bookings/${booking._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ advancePaid: newAdv }),
      });
      if (res.ok) {
        fetchBookings();
      } else {
        alert('Failed to update payment.');
      }
    } catch (err) {
      alert('Error updating payment.');
    }
  };

  // Filter Bookings
  const filteredBookings = bookings.filter(b => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const custName = b.customer?.name?.toLowerCase() || '';
      const custPhone = b.customer?.phone?.toLowerCase() || '';
      const pkgName = b.package?.name?.toLowerCase() || '';
      if (!custName.includes(q) && !custPhone.includes(q) && !pkgName.includes(q)) return false;
    }
    return true;
  });

  const getStatusBadgeColor = (status: string) => {
    switch(status) {
      case 'confirmed': return { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' };
      case 'payment_pending': return { bg: '#fef9c3', text: '#a16207', border: '#fef08a' };
      case 'paid': return { bg: '#dbeafe', text: '#1d4ed8', border: '#bfdbfe' };
      case 'in_progress': return { bg: '#e0e7ff', text: '#4338ca', border: '#c7d2fe' };
      case 'completed': return { bg: '#f3e8ff', text: '#6b21a8', border: '#e9d5ff' };
      case 'cancelled': return { bg: '#fee2e2', text: '#b91c1c', border: '#fecaca' };
      default: return { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1' };
    }
  };

  return (
    <div>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .booking-table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .booking-table th { background: #f8fafc; padding: 14px 16px; font-size: 13px; font-weight: 600; color: #475569; text-align: left; border-bottom: 1px solid #e2e8f0; }
        .booking-table td { padding: 14px 16px; font-size: 14px; color: #1e293b; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
        .booking-table tr:hover { background: #f8fafc; }
        @media (max-width: 768px) {
          .desktop-table { display: none; }
          .mobile-cards { display: flex; flexDirection: column; gap: 16px; }
        }
        @media (min-width: 769px) {
          .desktop-table { display: block; }
          .mobile-cards { display: none; }
        }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Yatra Bookings</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: '14px' }}>{bookings.length} reservations tracked</p>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button 
            onClick={fetchBookings} 
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
            onClick={() => setShowAddForm(!showAddForm)} 
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
            {showAddForm ? '✕ Close Form' : '+ New Booking'}
          </button>
        </div>
      </div>

      {/* Add Booking Form Modal / Box */}
      {showAddForm && (
        <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginTop: 0, marginBottom: '16px' }}>Create New Yatra Booking</h2>
          <form onSubmit={handleCreateBooking} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Select Customer *</label>
              <select 
                required 
                value={form.customer} 
                onChange={(e) => setForm({...form, customer: e.target.value})} 
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none', background: '#fff', fontSize: '14px' }}
              >
                <option value="">-- Choose Existing Customer --</option>
                {customers.map(c => (
                  <option key={c._id} value={c._id}>{c.name} ({c.phone || c.email})</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Select Package *</label>
              <select 
                required 
                value={form.package} 
                onChange={(e) => {
                  const selPkg = packages.find(p => p._id === e.target.value);
                  setForm({...form, package: e.target.value, totalAmount: selPkg ? String(selPkg.price || '') : form.totalAmount});
                }} 
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none', background: '#fff', fontSize: '14px' }}
              >
                <option value="">-- Choose Package --</option>
                {packages.map(p => (
                  <option key={p._id} value={p._id}>{p.name} (₹{p.price || 0})</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Travel Date *</label>
              <input 
                type="date" 
                required 
                value={form.travelDate} 
                onChange={(e) => setForm({...form, travelDate: e.target.value})} 
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none', background: '#fff', fontSize: '14px' }} 
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Number of Travelers (Pax) *</label>
              <input 
                type="number" 
                min="1" 
                required 
                value={form.numberOfTravelers} 
                onChange={(e) => setForm({...form, numberOfTravelers: e.target.value})} 
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none', background: '#fff', fontSize: '14px' }} 
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Total Package Amount (₹) *</label>
              <input 
                type="number" 
                required 
                placeholder="Total cost" 
                value={form.totalAmount} 
                onChange={(e) => setForm({...form, totalAmount: e.target.value})} 
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none', background: '#fff', fontSize: '14px' }} 
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Advance Paid (₹)</label>
              <input 
                type="number" 
                placeholder="Advance payment" 
                value={form.advancePaid} 
                onChange={(e) => setForm({...form, advancePaid: e.target.value})} 
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none', background: '#fff', fontSize: '14px' }} 
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Payment Method</label>
              <select 
                value={form.paymentMethod} 
                onChange={(e) => setForm({...form, paymentMethod: e.target.value})} 
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none', background: '#fff', fontSize: '14px' }}
              >
                <option value="cash">Cash</option>
                <option value="upi">UPI / PhonePe / GPay</option>
                <option value="bank_transfer">Bank Transfer / NEFT</option>
                <option value="card">Credit / Debit Card</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Special Requirements</label>
              <input 
                type="text" 
                placeholder="e.g. Ground floor room, wheelchair support..." 
                value={form.specialRequirements} 
                onChange={(e) => setForm({...form, specialRequirements: e.target.value})} 
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none', background: '#fff', fontSize: '14px' }} 
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Booking Notes</label>
              <textarea 
                rows={2} 
                placeholder="Any additional travel details..." 
                value={form.notes} 
                onChange={(e) => setForm({...form, notes: e.target.value})} 
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none', background: '#fff', fontSize: '14px' }} 
              />
            </div>

            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
              <button 
                type="button" 
                onClick={() => setShowAddForm(false)} 
                style={{ padding: '10px 18px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                style={{ padding: '10px 24px', background: '#f97316', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
              >
                Confirm Booking
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters & Search */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input 
          type="text" 
          placeholder="Search customer name, phone, package..." 
          value={searchQuery} 
          onChange={(e) => setSearchQuery(e.target.value)} 
          style={{ padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none', minWidth: '260px', flex: 1, fontSize: '14px' }} 
        />

        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)} 
          style={{ padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', background: '#fff', fontSize: '14px', outline: 'none', color: '#475569', fontWeight: '500' }}
        >
          <option value="all">All Statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="payment_pending">Payment Pending</option>
          <option value="paid">Paid</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <div style={{ padding: '48px', textAlign: 'center', color: '#64748b', fontSize: '15px' }}>Loading bookings...</div>
      ) : filteredBookings.length === 0 ? (
        <div style={{ padding: '48px', textAlign: 'center', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#64748b' }}>
          No bookings match your filter criteria.
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="desktop-table">
            <table className="booking-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Yatra Package</th>
                  <th>Travel Date</th>
                  <th>Travelers</th>
                  <th>Financial Breakdown</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map(b => {
                  const badge = getStatusBadgeColor(b.status);
                  return (
                    <tr key={b._id}>
                      <td>
                        <div style={{ fontWeight: '600', color: '#0f172a' }}>{b.customer?.name || 'Unknown'}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{b.customer?.phone || b.customer?.email}</div>
                      </td>

                      <td>
                        <div style={{ fontWeight: '600', color: '#1e293b' }}>{b.package?.name || 'Custom Package'}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{b.package?.duration || ''}</div>
                      </td>

                      <td>
                        <div style={{ fontWeight: '500', color: '#334155' }}>
                          {b.travelDate ? new Date(b.travelDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Unassigned'}
                        </div>
                      </td>

                      <td>
                        <span style={{ display: 'inline-block', padding: '2px 8px', background: '#fff3eb', color: '#ea580c', border: '1px solid #ffd8bf', borderRadius: '6px', fontWeight: '700', fontSize: '12px' }}>
                          {b.numberOfTravelers} Pax
                        </span>
                      </td>

                      <td>
                        <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <div>Total: <strong style={{ color: '#0f172a' }}>₹{b.totalAmount || 0}</strong></div>
                          <div>Adv: <strong style={{ color: '#16a34a' }}>₹{b.advancePaid || 0}</strong></div>
                          <div style={{ color: (b.balancePending || 0) > 0 ? '#b91c1c' : '#16a34a', fontWeight: '600' }}>
                            Bal: ₹{b.balancePending || 0}
                          </div>
                        </div>
                      </td>

                      <td>
                        <select
                          value={b.status}
                          onChange={(e) => handleStatusChange(b._id, e.target.value)}
                          style={{
                            background: badge.bg,
                            color: badge.text,
                            border: `1px solid ${badge.border}`,
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '600',
                            outline: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="confirmed">Confirmed</option>
                          <option value="payment_pending">Payment Pending</option>
                          <option value="paid">Paid</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>

                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button 
                            onClick={() => handleUpdatePayment(b)}
                            style={{ padding: '6px 12px', background: '#f1f5f9', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                          >
                            ₹ Pay
                          </button>
                          <button 
                            onClick={() => handleDelete(b._id)}
                            style={{ padding: '6px 12px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="mobile-cards">
            {filteredBookings.map(b => {
              const badge = getStatusBadgeColor(b.status);
              return (
                <div key={b._id} style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>{b.customer?.name || 'Unknown'}</div>
                      <div style={{ fontSize: '13px', color: '#64748b' }}>{b.customer?.phone || b.customer?.email}</div>
                    </div>
                    <select
                      value={b.status}
                      onChange={(e) => handleStatusChange(b._id, e.target.value)}
                      style={{
                        background: badge.bg,
                        color: badge.text,
                        border: `1px solid ${badge.border}`,
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="confirmed">Confirmed</option>
                      <option value="payment_pending">Payment Pending</option>
                      <option value="paid">Paid</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Package:</span>
                      <strong style={{ color: '#0f172a' }}>{b.package?.name || 'Custom Package'}</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Travel Date:</span>
                      <strong style={{ color: '#1e293b' }}>
                        {b.travelDate ? new Date(b.travelDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Unassigned'}
                      </strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Travelers:</span>
                      <span style={{ background: '#fff3eb', color: '#ea580c', border: '1px solid #ffd8bf', padding: '1px 6px', borderRadius: '4px', fontWeight: '700', fontSize: '11px' }}>
                        {b.numberOfTravelers} Pax
                      </span>
                    </div>

                    <div style={{ borderTop: '1px solid #e2e8f0', margin: '6px 0' }} />

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Total Cost:</span>
                      <strong style={{ color: '#0f172a' }}>₹{b.totalAmount || 0}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Advance Paid:</span>
                      <strong style={{ color: '#16a34a' }}>₹{b.advancePaid || 0}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700' }}>
                      <span style={{ color: '#64748b' }}>Balance Due:</span>
                      <span style={{ color: (b.balancePending || 0) > 0 ? '#b91c1c' : '#16a34a' }}>₹{b.balancePending || 0}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => handleUpdatePayment(b)}
                      style={{ flex: 1, padding: '10px', background: '#f1f5f9', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', textAlign: 'center' }}
                    >
                      ₹ Record Payment
                    </button>
                    <button 
                      onClick={() => handleDelete(b._id)}
                      style={{ padding: '10px 16px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
