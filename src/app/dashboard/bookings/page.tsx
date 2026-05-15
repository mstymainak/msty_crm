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

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const bookingsPerPage = 10;

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [enquirySearch, setEnquirySearch] = useState('');

  // Dropdowns state
  const [openEnquiryDropdown, setOpenEnquiryDropdown] = useState(false);
  const [openCustomerDropdown, setOpenCustomerDropdown] = useState(false);

  // Notes editing & Payment History state
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState('');
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);
  const [expandedDetailsId, setExpandedDetailsId] = useState<string | null>(null);

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

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, showCompletedOnly]);

  const handleStatusChange = async (booking: any, newStatus: string) => {
    if (newStatus === 'completed' && (booking.balancePending || 0) > 0) {
      alert(`⚠️ Cannot mark booking as "Completed" because there is an outstanding balance due of ₹${booking.balancePending}.\nPlease record the pending payment first!`);
      return;
    }

    try {
      const res = await fetch(`/api/bookings/${booking._id}`, {
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
    if (!confirm('Are you absolutely sure you want to delete this booking?')) return;
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
    const advInput = prompt(`Enter new payment amount to add to advance (₹):\nCurrent Advance: ₹${booking.advancePaid || 0}\nRemaining Due: ₹${booking.balancePending || 0}`, '0');
    if (advInput === null) return;
    const newAmt = Number(advInput);
    if (isNaN(newAmt) || newAmt <= 0) {
      alert('Please enter a valid positive amount.');
      return;
    }

    const methodInput = prompt('Enter payment method (cash / upi / bank_transfer / card):', 'upi');

    try {
      const res = await fetch(`/api/bookings/${booking._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recordNewPayment: {
            amount: newAmt,
            method: methodInput || 'cash'
          }
        }),
      });
      if (res.ok) {
        fetchBookings();
      } else {
        alert('Failed to record payment.');
      }
    } catch (err) {
      alert('Error recording payment.');
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

  // Pagination Logic
  const totalPages = Math.ceil(filteredBookings.length / bookingsPerPage);
  const currentBookings = filteredBookings.slice((currentPage - 1) * bookingsPerPage, currentPage * bookingsPerPage);

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

  const selectedEnqObj = enquiries.find(eq => eq._id === form.enquiry);
  const selectedCustObj = customers.find(c => c._id === form.customer);

  return (
    <div>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .booking-table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.05); }
        .booking-table th { background: #f8fafc; padding: 16px; font-size: 13px; font-weight: 600; color: #475569; text-align: left; border-bottom: 1px solid #e2e8f0; }
        .booking-table td { padding: 16px; font-size: 14px; color: #1e293b; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
        .booking-table tr:hover { background: #f8fafc; }
        
        /* Premium Action Button Cluster Styles */
        .btn-edit { background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; border-radius: 8px; padding: 10px 16px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.15s; display: inline-flex; align-items: center; justify-content: center; gap: 6px; flex: 1; }
        .btn-edit:hover { background: #dbeafe; transform: translateY(-1px); }
        
        .btn-pay { background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; border-radius: 8px; padding: 10px 16px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.15s; display: inline-flex; align-items: center; justify-content: center; gap: 6px; flex: 1; }
        .btn-pay:hover { background: #d1fae5; transform: translateY(-1px); }
        
        .btn-delete { background: #fff1f2; color: #e11d48; border: 1px solid #fecdd3; border-radius: 8px; padding: 10px 16px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.15s; display: inline-flex; align-items: center; justify-content: center; gap: 6px; flex: 1; }
        .btn-delete:hover { background: #ffe4e6; transform: translateY(-1px); }

        /* Responsive Breakpoints maintaining exact Web Layout on Desktop and Full-Width Mockup Ratio on Mobile */
        @media (max-width: 768px) {
          .desktop-table { display: none; }
          .mobile-cards { display: flex; flex-direction: column; gap: 16px; width: 100%; }
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
            Showing {currentBookings.length} of {filteredBookings.length} tracked entries (Page {currentPage} of {totalPages || 1})
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
              gap: '6px',
              transition: 'all 0.15s'
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
              gap: '6px',
              transition: 'all 0.15s'
            }}
          >
            {showCompletedOnly ? '📂 Active Bookings' : '👁️ Completed Bookings'}
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
              fontSize: '14px',
              transition: 'all 0.15s',
              boxShadow: '0 4px 6px -1px rgba(249, 115, 22, 0.2)'
            }}
          >
            {showAddForm ? '✕ Close Form' : '+ New Booking'}
          </button>
        </div>
      </div>

      {/* Add / Edit Booking Form Modal / Box */}
      {showAddForm && (
        <div style={{ background: '#fff', padding: '28px', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', marginBottom: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#f97316' }}>{form.id ? '✏️' : '✨'}</span> {form.id ? 'Edit Yatra Booking' : 'Create New Yatra Booking'}
            </h2>
          </div>

          {/* Quick Fill from Enquiry */}
          {!form.id && (
            <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', padding: '20px', borderRadius: '12px', marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#ea580c', marginBottom: '10px' }}>
                ⚡ Quick Fill: Search & Choose Enquiry to Confirm (Auto-Fetches Family Members & Calculates Cost)
              </label>

              {/* Custom Combined Dropdown with Search */}
              <div style={{ position: 'relative' }}>
                <div 
                  onClick={() => setOpenEnquiryDropdown(!openEnquiryDropdown)} 
                  style={{ width: '100%', padding: '12px 16px', border: '1px solid #fdba74', borderRadius: '8px', background: '#fff', fontSize: '14px', color: '#0f172a', fontWeight: '600', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                >
                  <span>{selectedEnqObj ? `✓ ${selectedEnqObj.submittedName || selectedEnqObj.customer?.name || 'Enquiry'} - ${selectedEnqObj.source} (${selectedEnqObj.members?.length || 0} family added)` : '-- Click to Search & Select Enquiry --'}</span>
                  <span style={{ color: '#ea580c' }}>{openEnquiryDropdown ? '▲' : '▼'}</span>
                </div>

                {openEnquiryDropdown && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '8px', background: '#fff', border: '1px solid #fdba74', borderRadius: '12px', padding: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)', zIndex: 50 }}>
                    <input 
                      type="text" 
                      placeholder="🔍 Search enquiry by name, phone, or message details..." 
                      value={enquirySearch} 
                      onChange={(e) => setEnquirySearch(e.target.value)} 
                      style={{ width: '100%', padding: '10px 14px', border: '1px solid #fdba74', borderRadius: '8px', outline: 'none', fontSize: '13px', marginBottom: '12px', background: '#fff7ed', color: '#0f172a' }}
                      autoFocus 
                    />
                    <div style={{ maxHeight: '240px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {filteredEnquiries.length === 0 ? (
                        <div style={{ padding: '12px', color: '#64748b', fontSize: '13px', textAlign: 'center' }}>No enquiries match search criteria.</div>
                      ) : (
                        filteredEnquiries.map(eq => (
                          <div 
                            key={eq._id} 
                            onClick={() => {
                              const pax = 1 + (eq.members?.length || 0);
                              const selPkg = packages.find(p => p._id === eq.package);
                              const calcAmount = selPkg ? selPkg.price * pax : 0;
                              const memberNames = eq.members?.length > 0 ? '\nFamily members included: ' + eq.members.map((m: any) => `${m.name} (${m.relation || 'Relative'})`).join(', ') : '';

                              let tDate = '';
                              if (selPkg && selPkg.groups?.length > 0 && eq.packageGroup) {
                                const grp = selPkg.groups.find((g: any) => g._id === eq.packageGroup || g._id?.toString() === eq.packageGroup);
                                if (grp && grp.date) tDate = grp.date;
                              }

                              setForm({
                                ...form,
                                enquiry: eq._id,
                                customer: eq.customer?._id || eq.customer || '',
                                package: eq.package || '',
                                packageGroup: eq.packageGroup || '',
                                numberOfTravelers: String(pax),
                                travelDate: tDate || form.travelDate,
                                totalAmount: String(calcAmount),
                                notes: eq.message ? eq.message + memberNames : memberNames
                              });
                              setOpenEnquiryDropdown(false);
                            }}
                            style={{ padding: '12px 14px', borderRadius: '8px', cursor: 'pointer', background: form.enquiry === eq._id ? '#ffedd5' : '#fff', fontWeight: '500', fontSize: '13px', color: '#1e293b', borderBottom: '1px solid #f8fafc', transition: 'background 0.15s' }}
                          >
                            <div style={{ fontWeight: '700', color: '#ea580c', marginBottom: '4px', fontSize: '14px' }}>{eq.submittedName || eq.customer?.name || 'Enquiry'}</div>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>Source: {eq.source} | Family members: {eq.members?.length || 0}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleCreateOrUpdateBooking} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            {/* Custom Combined Search & Choose Customer */}
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>
                Search & Choose Customer * {form.enquiry && <span style={{ color: '#dc2626' }}>(Locked by Quick Fill)</span>}
              </label>
              
              <div style={{ position: 'relative' }}>
                <div 
                  onClick={() => { if (!form.enquiry) setOpenCustomerDropdown(!openCustomerDropdown); }} 
                  style={{ width: '100%', padding: '12px 16px', border: '1px solid #cbd5e1', borderRadius: '8px', background: form.enquiry ? '#f1f5f9' : '#fff', fontSize: '14px', color: '#0f172a', fontWeight: '600', cursor: form.enquiry ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                >
                  <span>{selectedCustObj ? `👤 ${selectedCustObj.name} (${selectedCustObj.phone || selectedCustObj.email})` : '-- Click to Search & Select Customer --'}</span>
                  <span style={{ color: '#64748b' }}>{openCustomerDropdown ? '▲' : '▼'}</span>
                </div>

                {openCustomerDropdown && !form.enquiry && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '8px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)', zIndex: 40 }}>
                    <input 
                      type="text" 
                      placeholder="🔍 Search customer name, phone, or email..." 
                      value={customerSearch} 
                      onChange={(e) => setCustomerSearch(e.target.value)} 
                      style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none', fontSize: '13px', marginBottom: '12px', background: '#f8fafc', color: '#0f172a' }}
                      autoFocus 
                    />
                    <div style={{ maxHeight: '240px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {filteredCustomers.length === 0 ? (
                        <div style={{ padding: '12px', color: '#64748b', fontSize: '13px', textAlign: 'center' }}>No customers match search criteria.</div>
                      ) : (
                        filteredCustomers.map(c => (
                          <div 
                            key={c._id} 
                            onClick={() => {
                              setForm({...form, customer: c._id});
                              setOpenCustomerDropdown(false);
                            }}
                            style={{ padding: '12px 14px', borderRadius: '8px', cursor: 'pointer', background: form.customer === c._id ? '#e2e8f0' : '#fff', fontWeight: '500', fontSize: '13px', color: '#1e293b', borderBottom: '1px solid #f8fafc', transition: 'background 0.15s' }}
                          >
                            <div style={{ fontWeight: '700', color: '#0f172a', marginBottom: '2px', fontSize: '14px' }}>{c.name}</div>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>Phone: {c.phone} | Email: {c.email}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Package & Batch Select */}
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
                  style={{ width: '100%', padding: '12px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none', background: (!!form.enquiry && !!form.package) ? '#f1f5f9' : '#fff', fontSize: '14px', fontWeight: '600' }}
                >
                  <option value="">-- Choose Package --</option>
                  {packages.map(p => (
                    <option key={p._id} value={p._id}>{p.name} (₹{p.price || 0})</option>
                  ))}
                </select>
              </div>

              {form.package && packages.find(p => p._id === form.package)?.groups?.length > 0 && (
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#2563eb', marginBottom: '6px' }}>Select Batch / Group (Auto-Fetches Travel Date)</label>
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
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #bfdbfe', borderRadius: '8px', outline: 'none', background: '#eff6ff', fontSize: '13px', color: '#1d4ed8', fontWeight: '600' }}
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
                min="2020-01-01"
                max="2099-12-31"
                value={form.travelDate} 
                onChange={(e) => setForm({...form, travelDate: e.target.value})} 
                style={{ width: '100%', padding: '12px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none', background: '#fff', fontSize: '14px' }} 
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>End Travel Date</label>
              <input 
                type="date" 
                min="2020-01-01"
                max="2099-12-31"
                value={form.endTravelDate} 
                onChange={(e) => setForm({...form, endTravelDate: e.target.value})} 
                style={{ width: '100%', padding: '12px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none', background: '#fff', fontSize: '14px' }} 
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
                style={{ width: '100%', padding: '12px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none', background: '#fff', fontSize: '14px', fontWeight: '700', color: '#ea580c' }} 
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
                style={{ width: '100%', padding: '12px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none', background: '#fff', fontSize: '14px', fontWeight: '700' }} 
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Advance Paid (₹)</label>
              <input 
                type="number" 
                placeholder="Advance payment" 
                value={form.advancePaid} 
                onChange={(e) => setForm({...form, advancePaid: e.target.value})} 
                style={{ width: '100%', padding: '12px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none', background: '#fff', fontSize: '14px' }} 
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Payment Method</label>
              <select 
                value={form.paymentMethod} 
                onChange={(e) => setForm({...form, paymentMethod: e.target.value})} 
                style={{ width: '100%', padding: '12px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none', background: '#fff', fontSize: '14px' }}
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
                style={{ width: '100%', padding: '12px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none', background: '#fff', fontSize: '14px' }} 
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Booking Notes & Included Family Members</label>
              <textarea 
                rows={3} 
                placeholder="Family members list or travel details..." 
                value={form.notes} 
                onChange={(e) => setForm({...form, notes: e.target.value})} 
                style={{ width: '100%', padding: '12px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none', background: '#fff', fontSize: '14px' }} 
              />
            </div>

            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
              <button 
                type="button" 
                onClick={() => setShowAddForm(false)} 
                style={{ padding: '12px 20px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.15s' }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                style={{ padding: '12px 28px', background: '#f97316', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(249, 115, 22, 0.2)', transition: 'all 0.15s' }}
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
          placeholder="🔍 Search customer name, phone, package..." 
          value={searchQuery} 
          onChange={(e) => setSearchQuery(e.target.value)} 
          style={{ padding: '12px 16px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none', minWidth: '280px', flex: 1, fontSize: '14px' }} 
        />

        {!showCompletedOnly && (
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)} 
            style={{ padding: '12px 16px', border: '1px solid #cbd5e1', borderRadius: '8px', background: '#fff', fontSize: '14px', outline: 'none', color: '#475569', fontWeight: '600' }}
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
        <div style={{ padding: '48px', textAlign: 'center', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', color: '#64748b' }}>
          No {showCompletedOnly ? 'completed' : 'active'} bookings found.
        </div>
      ) : (
        <>
          {/* Desktop Table View (Stays exactly as it is) */}
          <div className="desktop-table">
            <table className="booking-table">
              <thead>
                <tr>
                  <th>Customer & Booking Date</th>
                  <th>Yatra Package, Rate & Batch</th>
                  <th>Travel Dates</th>
                  <th>Travelers & Form Details</th>
                  <th>Financial Breakdown (Click for Logs)</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentBookings.map(b => {
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
                        <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '15px' }}>{b.customer?.name || 'Unknown'}</div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{b.customer?.phone || b.customer?.email}</div>
                        <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '6px', whiteSpace: 'nowrap' }}>
                          Booked: {new Date(b.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}
                        </div>
                      </td>

                      <td>
                        <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '14px' }}>{b.package?.name || 'Custom Package'}</div>
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', marginTop: '2px' }}>Rate: ₹{b.package?.price || 0}</div>
                        {b.package?.duration && (
                          <div style={{ fontSize: '11px', color: '#475569', fontWeight: '600', marginTop: '2px' }}>⏱️ {b.package.duration}</div>
                        )}
                        {batchName && (
                          <div style={{ fontSize: '12px', color: '#2563eb', fontWeight: '700', marginTop: '4px' }}>Batch: {batchName}</div>
                        )}
                      </td>

                      <td>
                        <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '13px' }}>
                          {startD || 'Unassigned'}
                        </div>
                        {endD && (
                          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>to {endD}</div>
                        )}
                      </td>

                      <td style={{ maxWidth: '280px' }}>
                        <div style={{ marginBottom: '8px' }}>
                          <span style={{ display: 'inline-block', padding: '3px 10px', background: '#fff7ed', color: '#ea580c', border: '1px solid #fdba74', borderRadius: '8px', fontWeight: '700', fontSize: '12px' }}>
                            {b.numberOfTravelers} Travelers
                          </span>
                        </div>

                        {/* Expandable Form Details & Note Toggler */}
                        <details style={{ cursor: 'pointer' }}>
                          <summary style={{ outline: 'none', fontSize: '12px', color: '#2563eb', fontWeight: '600' }}>
                            View Details
                          </summary>
                          <div style={{ position: 'relative', padding: '14px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', marginTop: '6px', fontSize: '12px', maxHeight: '250px', overflowY: 'auto', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                            <div style={{ position: 'absolute', top: '8px', right: '8px', display: 'flex', gap: '4px' }}>
                              <button onClick={(ev) => { ev.preventDefault(); setEditingNoteId(b._id); setTempNote(b.notes || ''); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px' }} title="Edit Note">📝</button>
                              {b.notes && <button onClick={(ev) => { ev.preventDefault(); deleteNote(b._id); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px' }} title="Delete Note">🗑️</button>}
                            </div>

                            <div style={{ whiteSpace: 'pre-wrap', color: '#334155', paddingRight: '45px', fontWeight: '500', lineHeight: 1.4 }}>
                              {b.notes || 'No notes added yet.'}
                            </div>

                            {editingNoteId === b._id && (
                              <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed #cbd5e1' }}>
                                <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#64748b', display: 'block', marginBottom: '6px', fontWeight: '700' }}>Edit Booking Note</span>
                                <textarea
                                  value={tempNote}
                                  onChange={(ev) => setTempNote(ev.target.value)}
                                  style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px', boxSizing: 'border-box', minHeight: '60px', resize: 'vertical' }}
                                  placeholder="Type booking note or family members here..."
                                  autoFocus
                                />
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                                  <button onClick={(ev) => { ev.preventDefault(); setEditingNoteId(null); }} style={{ padding: '6px 12px', fontSize: '11px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
                                  <button onClick={(ev) => { ev.preventDefault(); saveNote(b._id, tempNote); }} style={{ padding: '6px 12px', fontSize: '11px', background: '#f97316', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Save</button>
                                </div>
                              </div>
                            )}
                          </div>
                        </details>
                      </td>

                      {/* Financial Breakdown with Clickable Payment History Popover */}
                      <td>
                        <div 
                          onClick={() => setActiveHistoryId(activeHistoryId === b._id ? null : b._id)}
                          style={{ cursor: 'pointer', padding: '8px 12px', borderRadius: '8px', background: activeHistoryId === b._id ? '#f8fafc' : '#f8fafc80', border: '1px solid #e2e8f0', transition: 'all 0.15s' }}
                          title="Click to view payment history"
                        >
                          <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: '#64748b' }}>Total:</span> <strong style={{ color: '#0f172a' }}>₹{b.totalAmount || 0}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: '#64748b' }}>Adv:</span> <strong style={{ color: '#16a34a' }}>₹{b.advancePaid || 0}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '4px', marginTop: '2px', color: (b.balancePending || 0) > 0 ? '#b91c1c' : '#16a34a', fontWeight: '700' }}>
                              <span>Due:</span> <span>₹{b.balancePending || 0}</span>
                            </div>
                          </div>

                          {/* Payment Log Popover Box with Small Font Timestamp */}
                          {activeHistoryId === b._id && (
                            <div style={{ marginTop: '10px', padding: '10px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '11px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
                              <div style={{ fontWeight: '700', color: '#0f172a', marginBottom: '6px', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>📜 Payment Log History</div>
                              {b.paymentHistory?.length > 0 ? b.paymentHistory.map((ph: any, i: number) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#334155', margin: '4px 0', borderBottom: '1px solid #f1f5f9', paddingBottom: '4px' }}>
                                  <div>
                                    <div style={{ fontWeight: '600' }}>{ph.method?.toUpperCase() || 'CASH'}</div>
                                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                                      {new Date(ph.date).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}
                                    </div>
                                  </div>
                                  <strong style={{ color: '#16a34a', fontSize: '12px' }}>+₹{ph.amount}</strong>
                                </div>
                              )) : (
                                <div style={{ color: '#64748b' }}>No separate payment logs recorded.</div>
                              )}
                            </div>
                          )}
                        </div>
                      </td>

                      <td>
                        <select
                          value={b.status}
                          onChange={(e) => handleStatusChange(b, e.target.value)}
                          style={{
                            background: badge.bg,
                            color: badge.text,
                            border: `1px solid ${badge.border}`,
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: '700',
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
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                          <button onClick={() => handleEdit(b)} className="btn-edit" title="Edit Booking">
                            ✏️ Edit
                          </button>
                          <button onClick={() => handleUpdatePayment(b)} className="btn-pay" title="Record Payment">
                            ₹ Pay
                          </button>
                          <button onClick={() => handleDelete(b._id)} className="btn-delete" title="Delete Booking">
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Full-Width Mobile Mockup Card View matching exact attached photo ratio */}
          <div className="mobile-cards">
            {currentBookings.map(b => {
              const badge = getStatusBadgeColor(b.status);
              let batchName = '';
              if (b.package?.groups?.length > 0 && b.packageGroup) {
                const matchedGrp = b.package.groups.find((g: any) => g._id === b.packageGroup || g._id?.toString() === b.packageGroup);
                if (matchedGrp) batchName = matchedGrp.name;
              }

              const startD = b.travelDate ? new Date(b.travelDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
              const endD = b.endTravelDate ? new Date(b.endTravelDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

              return (
                <div key={b._id} style={{ position: 'relative', background: '#fff', borderRadius: '16px', border: '1px solid #f1f5f9', padding: '16px', width: '100%', boxSizing: 'border-box', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', marginBottom: '12px' }}>
                  
                  {/* Top Row: Customer info, Status badge, 3-dot Menu */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ flex: 1, paddingRight: '12px' }}>
                      <div style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em' }}>{b.customer?.name || 'Unknown'}</div>
                      <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px', fontWeight: '500' }}>{b.customer?.phone || b.customer?.email}</div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px', fontWeight: '500' }}>
                        Booked: {new Date(b.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}, {new Date(b.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase()}
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <select
                          value={b.status}
                          onChange={(e) => handleStatusChange(b, e.target.value)}
                          style={{
                            background: badge.bg,
                            color: badge.text,
                            border: `1px solid ${badge.border}`,
                            padding: '4px 8px',
                            borderRadius: '8px',
                            fontSize: '11px',
                            fontWeight: '700',
                            outline: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="confirmed">Confirmed</option>
                          <option value="payment_pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>

                        <button 
                          onClick={() => setExpandedDetailsId(expandedDetailsId === b._id ? null : b._id)}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', fontSize: '20px', color: '#64748b', lineHeight: 1 }}
                          title="View Details & Notes"
                        >
                          ⋮
                        </button>
                      </div>
                      
                      <div style={{ textAlign: 'right', marginTop: '4px', maxWidth: '160px' }}>
                        <div style={{ fontSize: '11px', fontWeight: '800', color: '#1e293b', textTransform: 'uppercase', lineHeight: '1.2', wordBreak: 'break-word' }}>
                          {b.package?.name || 'Custom Package'}
                        </div>
                        <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px', fontWeight: '600' }}>Rate: ₹{b.package?.price || 0}</div>
                      </div>
                    </div>
                  </div>

                  <div style={{ height: '1px', background: '#f1f5f9', margin: '0 -16px 16px', width: 'calc(100% + 32px)' }} />

                  {/* Optional View Details & Notes Drawer / Box */}
                  {expandedDetailsId === b._id && (
                    <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '16px', marginBottom: '16px', fontSize: '13px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                        <span style={{ fontWeight: '700', color: '#0f172a' }}>📝 Booking Form Details & Notes</span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => { setEditingNoteId(b._id); setTempNote(b.notes || ''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }}>✏️ Edit</button>
                          {b.notes && <button onClick={() => deleteNote(b._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }}>🗑️ Delete</button>}
                        </div>
                      </div>

                      <div style={{ whiteSpace: 'pre-wrap', color: '#334155', lineHeight: 1.4, fontWeight: '500' }}>
                        {b.notes || 'No notes added yet.'}
                      </div>

                      {editingNoteId === b._id && (
                        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed #cbd5e1' }}>
                          <textarea
                            value={tempNote}
                            onChange={(ev) => setTempNote(ev.target.value)}
                            style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px', boxSizing: 'border-box', minHeight: '60px', resize: 'vertical' }}
                            placeholder="Type booking note or family members here..."
                            autoFocus
                          />
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                            <button onClick={() => setEditingNoteId(null)} style={{ padding: '6px 12px', fontSize: '11px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
                            <button onClick={() => saveNote(b._id, tempNote)} style={{ padding: '6px 12px', fontSize: '11px', background: '#f97316', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Save</button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Middle Section: Side-by-Side Grid Layout matching the Mockup */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '16px', alignItems: 'center', marginBottom: '20px' }}>
                    
                    {/* Left Column: Package Info List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                      {b.package?.duration && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                          <span style={{ color: '#64748b', fontWeight: '500' }}>Duration:</span>
                          <strong style={{ color: '#0f172a', textTransform: 'uppercase' }}>{b.package.duration}</strong>
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', alignItems: 'flex-start' }}>
                        <span style={{ color: '#64748b', fontWeight: '500' }}>Travel:</span>
                        <div style={{ textAlign: 'right' }}>
                          <strong style={{ color: '#0f172a', display: 'block' }}>{startD || 'Unassigned'}</strong>
                          {endD && <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>to {endD}</div>}
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                        <span style={{ color: '#64748b', fontWeight: '500' }}>Travelers:</span>
                        <strong style={{ color: '#f97316' }}>{b.numberOfTravelers} Pax</strong>
                      </div>
                    </div>

                    {/* Right Column: Gray Financial Breakdown Box */}
                    <div 
                      onClick={() => setActiveHistoryId(activeHistoryId === b._id ? null : b._id)}
                      style={{ background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '12px', padding: '12px', width: '100%', boxSizing: 'border-box', cursor: 'pointer' }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#64748b', fontWeight: '500' }}>Total</span>
                          <strong style={{ color: '#0f172a' }}>₹{b.totalAmount || 0}</strong>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#64748b', fontWeight: '500' }}>Paid</span>
                          <strong style={{ color: '#16a34a' }}>₹{b.advancePaid || 0}</strong>
                        </div>

                        <div style={{ borderTop: '1px dashed #cbd5e1', margin: '4px 0' }} />

                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ef4444', fontWeight: '800' }}>
                          <span>Due:</span>
                          <span>₹{b.balancePending || 0}</span>
                        </div>
                      </div>

                      {/* Clickable Payment Log History inside Financial Box */}
                      {activeHistoryId === b._id && (
                        <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #cbd5e1', fontSize: '11px' }}>
                          <div style={{ fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>📜 Payment Logs</div>
                          {b.paymentHistory?.length > 0 ? b.paymentHistory.map((ph: any, i: number) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#334155', margin: '2px 0' }}>
                              <span>{ph.method?.toUpperCase()} ({new Date(ph.date).toLocaleDateString()})</span>
                              <strong style={{ color: '#16a34a' }}>+₹{ph.amount}</strong>
                            </div>
                          )) : (
                            <div style={{ color: '#64748b' }}>No separate payment logs recorded.</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom Row: 3 Equal-Width Action Buttons Cluster */}
                  <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                    <button onClick={() => handleEdit(b)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', borderRadius: '10px', border: '1px solid #dbeafe', background: '#eff6ff', color: '#2563eb', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
                      <span style={{ fontSize: '14px' }}>✏️</span> Edit
                    </button>
                    <button onClick={() => handleUpdatePayment(b)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', borderRadius: '10px', border: '1px solid #dcfce7', background: '#f0fdf4', color: '#16a34a', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
                      <span style={{ fontSize: '14px' }}>₹</span> Pay
                    </button>
                    <button onClick={() => handleDelete(b._id)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', borderRadius: '10px', border: '1px solid #fee2e2', background: '#fef2f2', color: '#ef4444', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
                      <span style={{ fontSize: '14px' }}>🗑️</span> Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Page Selector Controls */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '28px', padding: '16px 0', flexWrap: 'wrap' }}>
              <button 
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} 
                disabled={currentPage === 1}
                style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: currentPage === 1 ? '#f8fafc' : '#fff', color: currentPage === 1 ? '#94a3b8' : '#0f172a', fontWeight: '600', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontSize: '13px' }}
              >
                Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button 
                  key={page} 
                  onClick={() => setCurrentPage(page)}
                  style={{ padding: '8px 14px', borderRadius: '8px', border: page === currentPage ? '1px solid #f97316' : '1px solid #cbd5e1', background: page === currentPage ? '#f97316' : '#fff', color: page === currentPage ? '#fff' : '#0f172a', fontWeight: '700', cursor: 'pointer', fontSize: '13px', boxShadow: page === currentPage ? '0 2px 4px rgba(249,115,22,0.2)' : 'none' }}
                >
                  {page}
                </button>
              ))}

              <button 
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} 
                disabled={currentPage === totalPages}
                style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: currentPage === totalPages ? '#f8fafc' : '#fff', color: currentPage === totalPages ? '#94a3b8' : '#0f172a', fontWeight: '600', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', fontSize: '13px' }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
