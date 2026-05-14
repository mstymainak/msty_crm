'use client';

import { useState, useEffect } from 'react';

export default function BookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCompletedOnly, setShowCompletedOnly] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [enquirySearch, setEnquirySearch] = useState('');

  // Notes editing state
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState('');

  // Add / Edit Form State
  const [form, setForm] = useState({
    id: '',
    enquiry: '',
    customer: '',
    package: '',
    packageGroup: '',
    numberOfTravelers: '1',
    travelDate: '',
    endTravelDate: '',
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
    fetch('/api/enquiries').then(r => r.json()).then(d => setEnquiries(Array.isArray(d) ? d : []));
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

  const saveNote = async (id: string, newNote: string) => {
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: newNote }),
      });
      if (res.ok) {
        setEditingNoteId(null);
        fetchBookings();
      } else {
        alert('Failed to save note.');
      }
    } catch (err) {
      alert('Error saving note.');
    }
  };

  const deleteNote = async (id: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: '' }),
      });
      if (res.ok) {
        setEditingNoteId(null);
        fetchBookings();
      } else {
        alert('Failed to delete note.');
      }
    } catch (err) {
      alert('Error deleting note.');
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

  const handleEdit = (b: any) => {
    setForm({
      id: b._id,
      enquiry: b.enquiry?._id || b.enquiry || '',
      customer: b.customer?._id || b.customer || '',
      package: b.package?._id || b.package || '',
      packageGroup: b.packageGroup || '',
      numberOfTravelers: String(b.numberOfTravelers || 1),
      travelDate: b.travelDate ? new Date(b.travelDate).toISOString().split('T')[0] : '',
      endTravelDate: b.endTravelDate ? new Date(b.endTravelDate).toISOString().split('T')[0] : '',
      totalAmount: String(b.totalAmount || ''),
      advancePaid: String(b.advancePaid || 0),
      paymentMethod: b.paymentMethod || 'cash',
      specialRequirements: b.specialRequirements || '',
      notes: b.notes || '',
    });
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCreateOrUpdateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customer || !form.package || !form.travelDate || !form.totalAmount) {
      alert('Please fill out all required fields (Customer, Package, Travel Date, Total Amount).');
      return;
    }

    const payload = {
      enquiry: form.enquiry || undefined,
      customer: form.customer,
      package: form.package,
      packageGroup: form.packageGroup || undefined,
      numberOfTravelers: Number(form.numberOfTravelers || 1),
      travelDate: new Date(form.travelDate),
      endTravelDate: form.endTravelDate ? new Date(form.endTravelDate) : undefined,
      totalAmount: Number(form.totalAmount),
      advancePaid: Number(form.advancePaid || 0),
      paymentMethod: form.paymentMethod,
      specialRequirements: form.specialRequirements,
      notes: form.notes,
    };

    try {
      let res;
      if (form.id) {
        res = await fetch(`/api/bookings/${form.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        if (form.enquiry && !form.id) {
          try {
            await fetch(`/api/enquiries/${form.enquiry}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: 'booked' })
            });
          } catch(e) {}
        }

        setShowAddForm(false);
        setForm({
          id: '',
          enquiry: '',
          customer: '',
          package: '',
          packageGroup: '',
          numberOfTravelers: '1',
          travelDate: '',
          endTravelDate: '',
          totalAmount: '',
          advancePaid: '0',
          paymentMethod: 'cash',
          specialRequirements: '',
          notes: '',
        });
        setCustomerSearch('');
        setEnquirySearch('');
        fetchBookings();
      } else {
        alert('Failed to save booking.');
      }
    } catch (err) {
      alert('Error saving booking.');
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

  // Filter Bookings by Tab (Completed vs Active)
  const filteredBookings = bookings.filter(b => {
    if (showCompletedOnly) {
      return b.status === 'completed';
    } else {
      return b.status !== 'completed' && b.status !== 'cancelled';
    }
  }).filter(b => {
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

  // Filter Enquiries for Quick Fill Dropdown
  const filteredEnquiries = enquiries.filter(eq => eq.status !== 'lost').filter(eq => {
    if (!enquirySearch) return true;
    const q = enquirySearch.toLowerCase();
    const name = eq.submittedName?.toLowerCase() || eq.customer?.name?.toLowerCase() || '';
    const phone = eq.customer?.phone?.toLowerCase() || '';
    const msg = eq.message?.toLowerCase() || '';
    return name.includes(q) || phone.includes(q) || msg.includes(q);
  });

  // Filter Customers for Form Dropdown
  const filteredCustomers = customers.filter(c => {
    if (!customerSearch) return true;
    const q = customerSearch.toLowerCase();
    return c.name?.toLowerCase().includes(q) || c.phone?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q);
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
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
            {showCompletedOnly ? 'Completed Yatra Bookings' : 'Active Yatra Bookings'}
          </h1>
          <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: '14px' }}>
            {filteredBookings.length} {showCompletedOnly ? 'completed' : 'active'} reservations
          </p>
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

          {/* Toggle Active vs Completed Bookings */}
          <button 
            onClick={() => {
              setShowCompletedOnly(!showCompletedOnly);
              setStatusFilter('all');
            }} 
            style={{ 
              padding: '10px 18px', 
              background: showCompletedOnly ? '#1e293b' : '#10b981', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '8px', 
              fontWeight: '600', 
              cursor: 'pointer', 
              fontSize: '14px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {showCompletedOnly ? '📂 View Active Bookings' : '✅ View Completed Bookings'}
          </button>

          <button 
            onClick={() => {
              if (!showAddForm) {
                setForm({
                  id: '', enquiry: '', customer: '', package: '', packageGroup: '',
                  numberOfTravelers: '1', travelDate: '', endTravelDate: '', totalAmount: '',
                  advancePaid: '0', paymentMethod: 'cash', specialRequirements: '', notes: '',
                });
              }
              setShowAddForm(!showAddForm);
            }} 
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

      {/* Add / Edit Booking Form Modal / Box */}
      {showAddForm && (
        <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
              {form.id ? '✏️ Edit Yatra Booking' : 'Create New Yatra Booking'}
            </h2>
          </div>

          {/* Quick Fill from Enquiry */}
          {!form.id && (
            <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#ea580c', marginBottom: '6px' }}>
                ⚡ Quick Fill: Search & Select Enquiry to Confirm (Auto-Fetches Family Members & Calculates Cost)
              </label>
              <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                <input 
                  type="text" 
                  placeholder="🔍 Type enquiry name, phone, or message details to search..." 
                  value={enquirySearch} 
                  onChange={(e) => setEnquirySearch(e.target.value)} 
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #fdba74', borderRadius: '6px', outline: 'none', background: '#fff', fontSize: '13px' }} 
                />
                <select
                  value={form.enquiry}
                  onChange={(e) => {
                    const val = e.target.value;
                    const selEnq = enquiries.find(eq => eq._id === val);
                    if (selEnq) {
                      const pax = 1 + (selEnq.members?.length || 0);
                      const selPkg = packages.find(p => p._id === selEnq.package);
                      const calcAmount = selPkg ? selPkg.price * pax : 0;
                      const memberNames = selEnq.members?.length > 0 ? '\nFamily members included: ' + selEnq.members.map((m: any) => `${m.name} (${m.relation || 'Relative'})`).join(', ') : '';

                      let tDate = '';
                      if (selPkg && selPkg.groups?.length > 0 && selEnq.packageGroup) {
                        const grp = selPkg.groups.find((g: any) => g._id === selEnq.packageGroup || g._id?.toString() === selEnq.packageGroup);
                        if (grp && grp.date) tDate = grp.date;
                      }

                      setForm({
                        ...form,
                        enquiry: selEnq._id,
                        customer: selEnq.customer?._id || selEnq.customer || '',
                        package: selEnq.package || '',
                        packageGroup: selEnq.packageGroup || '',
                        numberOfTravelers: String(pax),
                        travelDate: tDate || form.travelDate,
                        totalAmount: String(calcAmount),
                        notes: selEnq.message ? selEnq.message + memberNames : memberNames
                      });
                    } else {
                      setForm({ ...form, enquiry: '' });
                    }
                  }}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #fdba74', borderRadius: '8px', outline: 'none', background: '#fff', fontSize: '14px', color: '#0f172a', fontWeight: '600' }}
                >
                  <option value="">-- Choose Enquiry to Confirm --</option>
                  {filteredEnquiries.map(eq => (
                    <option key={eq._id} value={eq._id}>
                      {eq.submittedName || eq.customer?.name || 'Enquiry'} - {eq.source} ({eq.members?.length || 0} family members added)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <form onSubmit={handleCreateOrUpdateBooking} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            {/* Search & Select Customer */}
            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>
                Search & Choose Customer * {form.enquiry && <span style={{ color: '#dc2626' }}>(Locked by Quick Fill)</span>}
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px', alignItems: 'center' }}>
                <input 
                  type="text" 
                  placeholder="🔍 Search customer name/phone..." 
                  value={customerSearch} 
                  disabled={!!form.enquiry}
                  onChange={(e) => setCustomerSearch(e.target.value)} 
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none', background: form.enquiry ? '#f1f5f9' : '#fff', fontSize: '13px' }} 
                />
                <select 
                  required 
                  disabled={!!form.enquiry}
                  value={form.customer} 
                  onChange={(e) => setForm({...form, customer: e.target.value})} 
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none', background: form.enquiry ? '#f1f5f9' : '#fff', fontSize: '14px', fontWeight: '600' }}
                >
                  <option value="">-- Choose Customer --</option>
                  {filteredCustomers.map(c => (
                    <option key={c._id} value={c._id}>{c.name} ({c.phone || c.email})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Package & Batch Select */}
            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>
                  Select Package * {!!form.enquiry && !!form.package && <span style={{ color: '#dc2626' }}>(Locked by Quick Fill)</span>}
                </label>
                <select 
                  required 
                  disabled={!!form.enquiry && !!form.package}
                  value={form.package} 
                  onChange={(e) => {
                    const val = e.target.value;
                    const selPkg = packages.find(p => p._id === val);
                    const calc = selPkg ? selPkg.price * Number(form.numberOfTravelers || 1) : form.totalAmount;
                    setForm({...form, package: val, packageGroup: '', totalAmount: String(calc)});
                  }} 
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none', background: (!!form.enquiry && !!form.package) ? '#f1f5f9' : '#fff', fontSize: '14px', fontWeight: '600' }}
                >
                  <option value="">-- Choose Package --</option>
                  {packages.map(p => (
                    <option key={p._id} value={p._id}>{p.name} (₹{p.price || 0})</option>
                  ))}
                </select>
              </div>

              {form.package && packages.find(p => p._id === form.package)?.groups?.length > 0 && (
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#2563eb', marginBottom: '4px' }}>Select Batch / Group (Auto-Fetches Travel Date)</label>
                  <select
                    value={form.packageGroup}
                    onChange={(e) => {
                      const val = e.target.value;
                      const selPkg = packages.find(p => p._id === form.package);
                      let tDate = form.travelDate;
                      if (selPkg && selPkg.groups) {
                        const matched = selPkg.groups.find((g: any) => g._id === val || g._id?.toString() === val);
                        if (matched && matched.date) tDate = matched.date;
                      }
                      setForm({...form, packageGroup: val, travelDate: tDate});
                    }}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #bfdbfe', borderRadius: '6px', outline: 'none', background: '#eff6ff', fontSize: '13px', color: '#1d4ed8', fontWeight: '600' }}
                  >
                    <option value="">-- No Specific Batch --</option>
                    {packages.find(p => p._id === form.package)?.groups.map((g: any) => (
                      <option key={g._id} value={g._id}>{g.name} ({g.date})</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Start Travel Date *</label>
              <input 
                type="date" 
                required 
                value={form.travelDate} 
                onChange={(e) => setForm({...form, travelDate: e.target.value})} 
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none', background: '#fff', fontSize: '14px' }} 
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>End Travel Date</label>
              <input 
                type="date" 
                value={form.endTravelDate} 
                onChange={(e) => setForm({...form, endTravelDate: e.target.value})} 
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
                onChange={(e) => {
                  const val = e.target.value;
                  const selPkg = packages.find(p => p._id === form.package);
                  const calc = selPkg ? selPkg.price * Number(val || 1) : form.totalAmount;
                  setForm({...form, numberOfTravelers: val, totalAmount: String(calc)});
                }} 
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none', background: '#fff', fontSize: '14px', fontWeight: '700', color: '#ea580c' }} 
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
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none', background: '#fff', fontSize: '14px', fontWeight: '700' }} 
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
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Booking Notes & Included Family Members</label>
              <textarea 
                rows={3} 
                placeholder="Family members list or travel details..." 
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
                {form.id ? 'Save Updates' : 'Confirm Booking'}
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

        {!showCompletedOnly && (
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)} 
            style={{ padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', background: '#fff', fontSize: '14px', outline: 'none', color: '#475569', fontWeight: '500' }}
          >
            <option value="all">All Active Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="payment_pending">Payment Pending</option>
            <option value="paid">Paid</option>
            <option value="in_progress">In Progress</option>
          </select>
        )}
      </div>

      {loading ? (
        <div style={{ padding: '48px', textAlign: 'center', color: '#64748b', fontSize: '15px' }}>Loading bookings...</div>
      ) : filteredBookings.length === 0 ? (
        <div style={{ padding: '48px', textAlign: 'center', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#64748b' }}>
          No {showCompletedOnly ? 'completed' : 'active'} bookings found.
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="desktop-table">
            <table className="booking-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Yatra Package & Batch</th>
                  <th>Travel Dates</th>
                  <th>Travelers & Form Details</th>
                  <th>Financial Breakdown</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map(b => {
                  const badge = getStatusBadgeColor(b.status);
                  let batchName = '';
                  if (b.package?.groups?.length > 0 && b.packageGroup) {
                    const matchedGrp = b.package.groups.find((g: any) => g._id === b.packageGroup || g._id?.toString() === b.packageGroup);
                    if (matchedGrp) batchName = matchedGrp.name;
                  }

                  const startD = b.travelDate ? new Date(b.travelDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
                  const endD = b.endTravelDate ? new Date(b.endTravelDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

                  return (
                    <tr key={b._id}>
                      <td>
                        <div style={{ fontWeight: '600', color: '#0f172a' }}>{b.customer?.name || 'Unknown'}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{b.customer?.phone || b.customer?.email}</div>
                      </td>

                      <td>
                        <div style={{ fontWeight: '600', color: '#1e293b' }}>{b.package?.name || 'Custom Package'}</div>
                        {batchName ? (
                          <div style={{ fontSize: '12px', color: '#2563eb', fontWeight: '600' }}>Batch: {batchName}</div>
                        ) : (
                          <div style={{ fontSize: '12px', color: '#64748b' }}>{b.package?.duration || ''}</div>
                        )}
                      </td>

                      <td>
                        <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '13px' }}>
                          {startD || 'Unassigned'}
                        </div>
                        {endD && (
                          <div style={{ fontSize: '12px', color: '#64748b' }}>to {endD}</div>
                        )}
                      </td>

                      <td style={{ maxWidth: '280px' }}>
                        <div style={{ marginBottom: '6px' }}>
                          <span style={{ display: 'inline-block', padding: '2px 8px', background: '#fff3eb', color: '#ea580c', border: '1px solid #ffd8bf', borderRadius: '6px', fontWeight: '700', fontSize: '12px' }}>
                            {b.numberOfTravelers} Pax
                          </span>
                        </div>

                        {/* Expandable Form Details & Note Toggler */}
                        <details style={{ cursor: 'pointer' }}>
                          <summary style={{ outline: 'none', fontSize: '12px', color: '#2563eb', fontWeight: '600' }}>
                            View Form Details & Notes 📝
                          </summary>
                          <div style={{ position: 'relative', padding: '12px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px', marginTop: '6px', fontSize: '12px', maxHeight: '250px', overflowY: 'auto' }}>
                            <div style={{ position: 'absolute', top: '8px', right: '8px', display: 'flex', gap: '4px' }}>
                              <button onClick={(ev) => { ev.preventDefault(); setEditingNoteId(b._id); setTempNote(b.notes || ''); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px' }} title="Edit Note">📝</button>
                              {b.notes && <button onClick={(ev) => { ev.preventDefault(); deleteNote(b._id); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px' }} title="Delete Note">🗑️</button>}
                            </div>

                            <div style={{ whiteSpace: 'pre-wrap', color: '#334155', paddingRight: '45px', fontWeight: '500' }}>
                              {b.notes || 'No notes added yet.'}
                            </div>

                            {editingNoteId === b._id && (
                              <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed #cbd5e1' }}>
                                <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#64748b', display: 'block', marginBottom: '6px', fontWeight: '600' }}>Edit Booking Note</span>
                                <textarea
                                  value={tempNote}
                                  onChange={(ev) => setTempNote(ev.target.value)}
                                  style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '12px', boxSizing: 'border-box', minHeight: '60px', resize: 'vertical' }}
                                  placeholder="Type booking note or family members here..."
                                  autoFocus
                                />
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                                  <button onClick={(ev) => { ev.preventDefault(); setEditingNoteId(null); }} style={{ padding: '6px 12px', fontSize: '11px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}>Cancel</button>
                                  <button onClick={(ev) => { ev.preventDefault(); saveNote(b._id, tempNote); }} style={{ padding: '6px 12px', fontSize: '11px', background: '#f97316', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}>Save</button>
                                </div>
                              </div>
                            )}
                          </div>
                        </details>
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
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          <button 
                            onClick={() => handleEdit(b)}
                            style={{ padding: '6px 10px', background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                          >
                            ✏️ Edit
                          </button>
                          <button 
                            onClick={() => handleUpdatePayment(b)}
                            style={{ padding: '6px 10px', background: '#f1f5f9', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                          >
                            ₹ Pay
                          </button>
                          <button 
                            onClick={() => handleDelete(b._id)}
                            style={{ padding: '6px 10px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
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
              let batchName = '';
              if (b.package?.groups?.length > 0 && b.packageGroup) {
                const matchedGrp = b.package.groups.find((g: any) => g._id === b.packageGroup || g._id?.toString() === b.packageGroup);
                if (matchedGrp) batchName = matchedGrp.name;
              }

              const startD = b.travelDate ? new Date(b.travelDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
              const endD = b.endTravelDate ? new Date(b.endTravelDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

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

                    {batchName && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>Batch:</span>
                        <strong style={{ color: '#2563eb' }}>{batchName}</strong>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Travel Dates:</span>
                      <strong style={{ color: '#1e293b' }}>
                        {startD || 'Unassigned'} {endD ? ` to ${endD}` : ''}
                      </strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#64748b' }}>Travelers:</span>
                      <span style={{ background: '#fff3eb', color: '#ea580c', border: '1px solid #ffd8bf', padding: '1px 6px', borderRadius: '4px', fontWeight: '700', fontSize: '11px' }}>
                        {b.numberOfTravelers} Pax
                      </span>
                    </div>

                    {/* Expandable Form Details & Note Toggler */}
                    <div style={{ marginTop: '6px', paddingTop: '6px', borderTop: '1px solid #e2e8f0' }}>
                      <details style={{ cursor: 'pointer' }}>
                        <summary style={{ outline: 'none', fontSize: '12px', color: '#2563eb', fontWeight: '600' }}>
                          View Form Details & Notes 📝
                        </summary>
                        <div style={{ position: 'relative', padding: '12px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px', marginTop: '6px', fontSize: '12px' }}>
                          <div style={{ position: 'absolute', top: '8px', right: '8px', display: 'flex', gap: '4px' }}>
                            <button onClick={(ev) => { ev.preventDefault(); setEditingNoteId(b._id); setTempNote(b.notes || ''); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px' }} title="Edit Note">📝</button>
                            {b.notes && <button onClick={(ev) => { ev.preventDefault(); deleteNote(b._id); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px' }} title="Delete Note">🗑️</button>}
                          </div>

                          <div style={{ whiteSpace: 'pre-wrap', color: '#334155', paddingRight: '45px', fontWeight: '500' }}>
                            {b.notes || 'No notes added yet.'}
                          </div>

                          {editingNoteId === b._id && (
                            <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed #cbd5e1' }}>
                              <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#64748b', display: 'block', marginBottom: '6px', fontWeight: '600' }}>Edit Booking Note</span>
                              <textarea
                                value={tempNote}
                                onChange={(ev) => setTempNote(ev.target.value)}
                                style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '12px', boxSizing: 'border-box', minHeight: '60px', resize: 'vertical' }}
                                placeholder="Type booking note or family members here..."
                                autoFocus
                              />
                              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                                <button onClick={(ev) => { ev.preventDefault(); setEditingNoteId(null); }} style={{ padding: '6px 12px', fontSize: '11px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}>Cancel</button>
                                <button onClick={(ev) => { ev.preventDefault(); saveNote(b._id, tempNote); }} style={{ padding: '6px 12px', fontSize: '11px', background: '#f97316', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}>Save</button>
                              </div>
                            </div>
                          )}
                        </div>
                      </details>
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

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button 
                      onClick={() => handleEdit(b)}
                      style={{ flex: 1, padding: '10px', background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', textAlign: 'center' }}
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      onClick={() => handleUpdatePayment(b)}
                      style={{ flex: 1, padding: '10px', background: '#f1f5f9', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', textAlign: 'center' }}
                    >
                      ₹ Pay
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
