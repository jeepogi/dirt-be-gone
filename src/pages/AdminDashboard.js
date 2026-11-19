import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import '../styles/SignIn.css';
import Logo from '../assets/picture/laundry-logo.png';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const avatarOptions = [
  { id: 1, url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4' },
  { id: 2, url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack&backgroundColor=c0aede' },
  { id: 3, url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica&backgroundColor=ffdfbf' },
  { id: 4, url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&backgroundColor=ffd5dc' },
  { id: 5, url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Leo&backgroundColor=ffdfbf' },
  { id: 6, url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria&backgroundColor=d1d4f9' },
];

const emojiOptions = ['🧺', '👕', '⚡', '👔', '🧼', '✨', '🧴', '👖', '👗', '🧦'];

const PROFILE_KEY = 'staffProfile';
const readProfile = () => {
  try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null'); }
  catch { return null; }
};

const peso = (n) => `₱${Number(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 0 })}`;

const isServiceAvailable = (service) => {
  const a = service?.availability;
  const b = service?.available;
  return (
    a === 1 || a === '1' || a === true || a === 'true' ||
    b === 1 || b === '1' || b === true || b === 'true'
  );
};

const getStatusStyles = (status) => {
  const s = (status || '').toLowerCase();
  const base = { border: '1px solid transparent' };
  switch (s) {
    case 'pending': return { ...base, backgroundColor: '#fef3c7', color: '#92400e', borderColor: '#fde68a' };
    case 'ongoing': return { ...base, backgroundColor: '#dbeafe', color: '#1e40af', borderColor: '#bfdbfe' };
    case 'done': return { ...base, backgroundColor: '#d1fae5', color: '#065f46', borderColor: '#a7f3d0' };
    case 'cancelled': return { ...base, backgroundColor: '#fee2e2', color: '#991b1b', borderColor: '#fecaca' };
    default: return { ...base, backgroundColor: '#f3f4f6', color: '#374151', borderColor: '#e5e7eb' };
  }
};

const DashboardIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect>
  </svg>
);

const ServicesIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line>
  </svg>
);

const ProfileIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const AdminDashboard = ({ services, setServices, orders, setOrders }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');
    if (!token || role !== 'Staff') {
      navigate('/signin', { replace: true });
    }
  }, [navigate]);

  const storedName = localStorage.getItem('userName') || 'Admin';
  const storedRole = localStorage.getItem('userRole') || 'Staff';

  const savedProfile = readProfile();
  const [profileData, setProfileData] = useState({
    name: savedProfile?.name || storedName,
    email: savedProfile?.email || 'admin@example.com',
    role: storedRole,
    phone: savedProfile?.phone || '',
    photo: savedProfile?.photo || avatarOptions[1].url,
  });

  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [tempAvatar, setTempAvatar] = useState(profileData.photo);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ ...profileData });

  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [serviceForm, setServiceForm] = useState({ id: null, name: '', desc: '', price: '', unit: 'kg', available: true, icon: '🧺' });
  const [isSavingService, setIsSavingService] = useState(false);
  const [serviceError, setServiceError] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);

  const fetchAllData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/profile`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        const merged = { ...profileData, name: data.name || profileData.name, email: data.email || profileData.email, phone: data.phone || '', photo: data.photo || avatarOptions[1].url, role: 'Staff' };
        setProfileData(merged);
        localStorage.setItem(PROFILE_KEY, JSON.stringify(merged));
      }
    } catch (err) { console.error("Failed to load profile:", err); }

    try {
      const res = await fetch(`${API_BASE}/services`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setServices(await res.json()); 
    } catch (err) { console.error("Failed to load services:", err); }

    try {
      const res = await fetch(`${API_BASE}/request_service`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
      if (res.ok) {
        const requestData = await res.json();
        setOrders(Array.isArray(requestData) ? requestData : []);
      }
    } catch (err) { console.error("Failed to load service requests:", err); }
  };

  useEffect(() => {
    (async () => {
      await fetchAllData();
      setIsInitialLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persistProfile = async (next) => {
    setProfileData(next);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
    const token = localStorage.getItem('token');
    if (!token) return { ok: false, error: 'No token' };
    try {
      const res = await fetch(`${API_BASE}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: next.name, email: next.email, phone: next.phone, photo: next.photo }),
      });
      if (!res.ok) throw new Error('Failed to update');
      return { ok: true };
    } catch (err) { return { ok: false, error: err.message }; }
  };

  const openAvatarModal = () => { setTempAvatar(profileData.photo); setIsAvatarModalOpen(true); };
  const saveAvatar = async () => {
    const next = { ...profileData, photo: tempAvatar };
    setIsAvatarModalOpen(false); 
    const result = await persistProfile(next);
    if (!result.ok) showToast(result.error, 'error');
    else showToast('Profile picture updated!', 'success');
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return showToast("File is too large. Max 2MB.", 'error');
    const reader = new FileReader();
    reader.onloadend = () => setTempAvatar(reader.result);
    reader.readAsDataURL(file);
  };

  const openEditModal = () => { setEditForm({ ...profileData }); setIsEditModalOpen(true); };
  
  const saveProfileInfo = async (e) => {
    e.preventDefault();
    const next = { ...editForm, role: 'Staff' };
    const result = await persistProfile(next);
    if (result.ok) { setIsEditModalOpen(false); showToast('Personal Information Updated!', 'success'); }
    else showToast(result.error, 'error');
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/signin');
  };

  const stats = useMemo(() => {
    const revenue = orders.reduce((sum, o) => sum + Number(o.total_amount || o.price || 0), 0);
    const totalRequests = orders.length;
    const pending = orders.filter((o) => o.request_status === 'Pending' || o.status === 'Pending').length;
    const ongoing = orders.filter((o) => o.request_status === 'Ongoing' || o.status === 'Ongoing').length;
    const done = orders.filter((o) => o.request_status === 'Done' || o.status === 'Done').length;
    const cancelled = orders.filter((o) => o.request_status === 'Cancelled' || o.status === 'Cancelled').length;
    const avgRequestValue = totalRequests > 0 ? revenue / totalRequests : 0;
    return { revenue, totalRequests, pending, ongoing, done, cancelled, avgRequestValue };
  }, [orders]);

  const [feedbacks, setFeedbacks] = useState([]);
  useEffect(() => {
    const fetchFeedbacks = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE}/feedback`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setFeedbacks(await res.json());
      } catch (err) { console.error(err); }
    };
    if (activeTab === 'profile') fetchFeedbacks();
  }, [activeTab]);

  const [requestSearch, setRequestSearch] = useState('');
  const filteredRequests = useMemo(() => {
    const q = requestSearch.toLowerCase().trim();
    if (!q) return orders;
    return orders.filter((o) =>
        (o.customerName || '').toLowerCase().includes(q) ||
        String(o.request_id || o.id).toLowerCase().includes(q) ||
        (o.serviceName || '').toLowerCase().includes(q)
    );
  }, [orders, requestSearch]);

  const handleStatusChange = async (request, newStatus) => {
    const rawId = request.request_id || request.id;
    const numericId = parseInt(String(rawId).replace(/\D/g, ''), 10);

    if (!numericId || isNaN(numericId)) {
      showToast('Cannot update: invalid request ID.', 'error');
      return;
    }

    const previousOrders = [...orders];
    
    setOrders(orders.map((o) =>
      (String(o.request_id || o.id) === String(rawId))
        ? { ...o, request_status: newStatus, status: newStatus } 
        : o
    ));

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE}/request_service/${numericId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Server error ${res.status}`);
      }

      showToast(`Status updated to ${newStatus}`, 'success');
    } catch (err) {
      console.error('Status update failed:', err);
      showToast(err.message, 'error');
      setOrders(previousOrders); 
    }
  };

  const openAddService = () => {
    setServiceError('');
    setServiceForm({ id: null, name: '', desc: '', price: '', unit: 'kg', available: true, icon: '🧺' });
    setIsServiceModalOpen(true);
  };

  const openEditService = (service) => {
    setServiceError('');
    setServiceForm({ 
      id: service.service_id || service.id,
      name: service.service_name || service.name,
      desc: service.description || service.desc || '', 
      price: service.price_rate || service.price,
      unit: service.unit || 'kg',
      available: isServiceAvailable(service),
      icon: service.icon || '🧺'
    });
    setIsServiceModalOpen(true);
  };

  const handleSaveService = async (e) => {
    e.preventDefault();
    setServiceError('');
    setIsSavingService(true);
    const token = localStorage.getItem('token');
    
    if (!token) {
      setServiceError('Authentication error: No token found. Please log out and log back in.');
      setIsSavingService(false);
      return;
    }

    const isEdit = !!serviceForm.id;

    const payload = {
      service_name: serviceForm.name, 
      description: serviceForm.desc, 
      price_rate: Number(serviceForm.price),
      unit: serviceForm.unit, 
      availability: serviceForm.available ? 1 : 0, 
      icon: serviceForm.icon
    };

    try {
      const url = isEdit ? `${API_BASE}/services/${serviceForm.id}` : `${API_BASE}/services`;
      
      const res = await fetch(url, { 
        method: isEdit ? 'PUT' : 'POST', 
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}`
        }, 
        body: JSON.stringify(payload) 
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("Backend Error Response:", errorData);
        if (res.status === 403) {
          throw new Error('Forbidden: Your account does not have Staff permissions to update services.');
        }
        throw new Error(errorData.message || `Server error: ${res.status}`);
      }

      const data = await res.json();
      const normalized = { ...payload, available: payload.availability === 1 };

      if (isEdit) {
        setServices(services.map(s =>
          (s.service_id || s.id) === serviceForm.id ? { ...s, ...normalized, id: serviceForm.id } : s
        ));
      } else {
        setServices([...services, { ...normalized, service_id: data.service_id, id: data.service_id }]);
      }
      
      showToast(isEdit ? 'Service updated!' : 'Service added!', 'success');
      setIsServiceModalOpen(false);
      await fetchAllData();
    } catch (err) { 
      setServiceError(err.message); 
    } finally { 
      setIsSavingService(false); 
    }
  };

  const confirmDeleteService = (service) => { setServiceToDelete(service); setIsDeleteModalOpen(true); };

  const executeDeleteService = async () => {
    if (!serviceToDelete) return;
    const token = localStorage.getItem('token');
    const sId = serviceToDelete.service_id || serviceToDelete.id;
    try {
      const res = await fetch(`${API_BASE}/services/${sId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to delete');
      setServices(services.filter((s) => (s.service_id || s.id) !== sId));
      showToast('Service deleted.', 'success');
      setIsDeleteModalOpen(false);
    } catch (err) { showToast(err.message, 'error'); }
  };

  const renderServiceCard = (service) => {
    const sId = service.service_id || service.id;
    const sName = service.service_name || service.name || 'Unnamed Service';
    const sDesc = service.description || service.desc || 'No description';
    const sPrice = service.price_rate || service.price;
    const sUnit = service.unit || 'kg';
    const sIcon = service.icon || '🧺';
    const isAvailable = isServiceAvailable(service);

    return (
      <div key={sId} style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', border: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
          <span style={{ fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px', backgroundColor: isAvailable ? '#ecfdf5' : '#fef2f2', color: isAvailable ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: isAvailable ? '#10b981' : '#ef4444' }}></span> {isAvailable ? 'Available' : 'Unavailable'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>{sIcon}</div>
          <h4 style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: '#111827', lineHeight: '1.3' }}>{sName}</h4>
        </div>
        <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#6b7280', lineHeight: '1.5', flex: 1 }}>{sDesc}</p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '20px' }}>
          <span style={{ fontSize: '24px', fontWeight: '800', color: '#111827' }}>{peso(sPrice)}</span>
          <span style={{ fontSize: '13px', fontWeight: '500', color: '#9ca3af' }}>/ {sUnit}</span>
        </div>
        <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid #f3f4f6', paddingTop: '16px' }}>
          <button onClick={() => openEditService(service)} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: '#fff', color: '#374151', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>Edit</button>
          <button onClick={() => confirmDeleteService(service)} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #fecaca', backgroundColor: '#fef2f2', color: '#ef4444', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>Delete</button>
        </div>
      </div>
    );
  };

  const NavItem = ({ tab, icon, label }) => {
    const isActive = activeTab === tab;
    return (
      <div onClick={() => setActiveTab(tab)} style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
        padding: '8px 12px', borderRadius: '10px', cursor: 'pointer', boxSizing: 'border-box',
        color: isActive ? '#2563eb' : '#6b7280',
        backgroundColor: isActive ? '#eff6ff' : 'transparent',
        transition: 'all 0.2s'
      }}>
        {icon}
        <span style={{ fontSize: '11px', fontWeight: isActive ? '700' : '500' }}>{label}</span>
      </div>
    );
  };

  return (
    <div className="dashboard-container" style={{ overflowX: 'hidden', width: '100%' }}>
      <div style={{ position: 'fixed', top: '20px', right: '20px', padding: '12px 24px', borderRadius: '8px', backgroundColor: toast.type === 'error' ? '#ef4444' : '#10b981', color: 'white', fontWeight: '600', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', zIndex: 9999, transition: 'all 0.3s ease', transform: toast.show ? 'translateX(0)' : 'translateX(150%)', opacity: toast.show ? 1 : 0 }}>
        {toast.message}
      </div>

      <div className="dashboard-glass" style={{ width: '100%', maxWidth: '100vw', boxSizing: 'border-box' }}>
        
        {/* ADMIN NAVBAR */}
        <div className="dashboard-nav" style={{ 
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
          padding: '10px 15px', width: '100%', boxSizing: 'border-box' 
        }}>
          
          <div className="nav-brand" style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src={Logo} alt="Laundry Logo" style={{ height: '45px', objectFit: 'contain' }} />
            <span style={{ fontSize: '20px', fontWeight: '700', color: '#111827', display: window.innerWidth < 600 ? 'none' : 'inline' }}>Dirt Be Gone</span>
          </div>
          
          <div style={{ 
            display: 'flex', gap: '8px', backgroundColor: '#f8fafc', padding: '4px', 
            borderRadius: '12px', border: '1px solid #e2e8f0' 
          }}>
            <NavItem tab="dashboard" icon={<DashboardIcon />} label="Dashboard" />
            <NavItem tab="services" icon={<ServicesIcon />} label="Services" />
            <NavItem tab="profile" icon={<ProfileIcon />} label="Profile" />
          </div>

        </div>

        <div className="dashboard-content">
          {activeTab === 'dashboard' && (
            <div className="tab-content fade-in">
              <h1 className="page-title">Admin Overview</h1>
              
              <div className="stats-grid">
                <div className="stat-card no-hover">
                  <p>Total Revenue</p>
                  <div className="stat-bottom">
                    <h2>{isInitialLoading ? '—' : peso(stats.revenue)}</h2>
                  </div>
                </div>
                <div className="stat-card no-hover">
                  <p>Total Requests</p>
                  <div className="stat-bottom">
                    <h2>{isInitialLoading ? '—' : stats.totalRequests}</h2>
                  </div>
                </div>
                <div className="stat-card no-hover">
                  <p>Avg. Request Value</p>
                  <div className="stat-bottom">
                    <h2>{isInitialLoading ? '—' : peso(Math.round(stats.avgRequestValue))}</h2>
                  </div>
                </div>
              </div>
              
              <h3 className="section-title">Service Request Status Summary</h3>
              <div className="status-summary-grid">
                <div className="status-box pending no-hover">
                  <h4>{isInitialLoading ? '—' : stats.pending}</h4>
                  <p>Pending</p>
                </div>
                <div className="status-box ongoing no-hover">
                  <h4>{isInitialLoading ? '—' : stats.ongoing}</h4>
                  <p>Ongoing</p>
                </div>
                <div className="status-box done no-hover">
                  <h4>{isInitialLoading ? '—' : stats.done}</h4>
                  <p>Done</p>
                </div>
                <div className="status-box canceled no-hover">
                  <h4>{isInitialLoading ? '—' : stats.cancelled}</h4>
                  <p>Cancelled</p>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '30px', marginBottom: '16px' }}>
                <h3 className="section-title" style={{ margin: 0 }}>Customer Service Requests</h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input type="text" placeholder="Search by customer, ID, or service..." value={requestSearch} onChange={(e) => setRequestSearch(e.target.value)} style={{ padding: '10px 16px', borderRadius: '10px', border: '1px solid #d1d5db', width: '300px', fontSize: '14px', outline: 'none', fontFamily: 'Poppins' }} />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {isInitialLoading ? (
                  <p style={{ color: '#6b7280', textAlign: 'center', padding: '40px', backgroundColor: '#fff', borderRadius: '16px', border: '1px dashed #d1d5db', fontFamily: 'Poppins' }}>Loading service requests…</p>
                ) : filteredRequests.length === 0 ? (
                  <p style={{ color: '#6b7280', textAlign: 'center', padding: '40px', backgroundColor: '#fff', borderRadius: '16px', border: '1px dashed #d1d5db', fontFamily: 'Poppins' }}>No customer service requests found.</p>
                ) : null}
                
                {!isInitialLoading && filteredRequests.map((request, index) => {
                  const currentStatus = request.request_status || request.status || 'Pending';
                  const requestId = request.request_id || request.id;
                  
                  return (
                    <div key={requestId || index} style={{ display: 'flex', flexDirection: 'column', padding: '24px', borderRadius: '16px', background: '#fff', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', width: '100%', boxSizing: 'border-box', fontFamily: 'Poppins' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #f3f4f6' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#111827' }}>
                            {request.customerName || 'Unknown Customer'}
                          </h4>
                          <span style={{ fontSize: '12px', color: '#6b7280', backgroundColor: '#f3f4f6', padding: '4px 10px', borderRadius: '8px', fontWeight: '600', letterSpacing: '0.3px' }}>
                            REQ-{requestId}
                          </span>
                        </div>
                        <div style={{ fontSize: '13px', color: '#9ca3af', fontWeight: '500' }}>
                          {new Date(request.request_date || request.date || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '24px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                          <p style={{ margin: 0, fontSize: '15px', color: '#111827', fontWeight: '600' }}>
                            {request.serviceName || 'Laundry Service'} <span style={{ color: '#9ca3af', fontWeight: '400' }}>· {request.weight} kg</span>
                          </p>
                          {request.withDelivery && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#059669', fontWeight: '600', backgroundColor: '#ecfdf5', padding: '4px 10px', borderRadius: '6px', width: 'fit-content' }}>
                              🚚 Delivery Included
                            </span>
                          )}
                          {request.customerAddress && (
                            <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              📍 {request.customerAddress}
                            </p>
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                          <div style={{ textAlign: 'right', backgroundColor: '#f8fafc', padding: '12px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', minWidth: '120px' }}>
                            <p style={{ margin: 0, fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total</p>
                            <h3 style={{ margin: 0, color: '#10b981', fontSize: '22px', fontWeight: '800', lineHeight: '1.2' }}>{peso(request.total_amount || request.price)}</h3>
                          </div>

                          <div style={{ position: 'relative' }}>
                            <select value={currentStatus} onChange={(e) => handleStatusChange(request, e.target.value)} style={{ appearance: 'none', WebkitAppearance: 'none', padding: '10px 36px 10px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', outline: 'none', minWidth: '140px', fontFamily: 'Poppins', ...getStatusStyles(currentStatus) }}>
                              <option value="Pending">Pending</option>
                              <option value="Ongoing">Ongoing</option>
                              <option value="Done">Done</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                            <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', display: 'flex', alignItems: 'center' }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'services' && (
            <div className="tab-content fade-in">
              <div className="admin-services-header" style={{ marginBottom: '20px' }}>
                <div><h1 className="page-title" style={{ marginBottom: '4px' }}>Manage Services</h1></div>
                <button className="btn-blue" onClick={openAddService}>+ Add New Service</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {services.map(renderServiceCard)}
                {services.length === 0 && <p style={{ color: '#ef4444', textAlign: 'center', marginTop: '40px', gridColumn: '1 / -1' }}>No services available. Please add one.</p>}
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="tab-content fade-in profile-section">
              <div className="profile-card glass-panel no-hover" style={{ padding: '25px' }}>
                <div className="photo-upload-area" style={{ alignItems: 'center' }}>
                  <div className="avatar-container">
                    <div className="profile-avatar-large"><img src={profileData.photo} alt="Avatar" style={{ objectFit: 'cover' }} /></div>
                    <div className="edit-pen-btn" onClick={openAvatarModal}>✎</div>
                  </div>
                  <div className="photo-actions">
                    <h3 style={{ fontSize: '22px', marginBottom: '0px' }}>{profileData.name}</h3>
                    <span className="role-badge role-staff">{profileData.role}</span>
                  </div>
                </div>
              </div>
              <div className="profile-card glass-panel no-hover" style={{ padding: '25px', marginTop: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 className="card-title" style={{ margin: 0 }}>Personal Information</h3>
                  <button className="btn-blue" onClick={openEditModal} style={{ padding: '6px 16px', fontSize: '12px' }}>Edit Details</button>
                </div>
                <div className="info-display-grid">
                  <div><p className="info-label">Full Name</p><p className="info-value">{profileData.name}</p></div>
                  <div><p className="info-label">Email Address</p><p className="info-value">{profileData.email}</p></div>
                  <div><p className="info-label">Contact Number</p><p className="info-value">+{profileData.phone}</p></div>
                </div>
              </div>
              
              <h1 className="page-title" style={{ marginTop: '30px' }}>User Feedback</h1>
              <div className="orders-list">
                {feedbacks.map((fb) => (
                  <div key={fb.feedback_id} className="order-row no-hover">
                    <div><h4>{fb.user} ({fb.type})</h4><p>{fb.text}</p></div>
                    <div style={{ textAlign: 'right' }}><p style={{ color: '#f59e0b' }}>{'⭐'.repeat(fb.rating)}</p></div>
                  </div>
                ))}
              </div>
              <div className="logout-container"><button onClick={handleLogout} className="logout-btn-full">Logout</button></div>
            </div>
          )}
        </div>
      </div>

      {/* MODALS */}
      {isAvatarModalOpen && (
        <div className="modal-overlay"><div className="modal-content"><h2>Choose Avatar</h2><div className="avatar-grid">
          <label className="avatar-option" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', background: '#d1d5db' }}>
            <svg width="45" height="45" viewBox="0 0 24 24" fill="none"><path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" fill="#f3f4f6"/><path d="M12 14C7.58172 14 4 17.5817 4 22H20C20 17.5817 16.4183 14 12 14Z" fill="#f3f4f6"/></svg>
            <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
          </label>
          {avatarOptions.map(a => <img key={a.id} src={a.url} alt="" className={`avatar-option ${tempAvatar === a.url ? 'selected' : ''}`} onClick={() => setTempAvatar(a.url)} />)}
        </div><div className="modal-actions"><button className="cancel-btn" onClick={() => setIsAvatarModalOpen(false)}>Cancel</button><button className="submit-btn" onClick={saveAvatar}>Save</button></div></div></div>
      )}

      {isEditModalOpen && (
        <div className="modal-overlay"><div className="modal-content" style={{ textAlign: 'left' }}><h2 style={{ textAlign: 'center' }}>Edit Profile</h2>
          <form onSubmit={saveProfileInfo}>
            <div className="form-group"><label>Full Name</label><input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required style={{ width: '100%', padding: '10px' }} /></div>
            <div className="form-group"><label>Email</label><input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} required style={{ width: '100%', padding: '10px' }} /></div>
            <div className="form-group"><label>Phone</label><PhoneInput country={'ph'} value={editForm.phone} onChange={(val) => setEditForm({ ...editForm, phone: val })} inputStyle={{ width: '100%', height: '40px' }} /></div>
            <div className="modal-actions"><button type="button" className="cancel-btn" onClick={() => setIsEditModalOpen(false)}>Cancel</button><button type="submit" className="submit-btn">Save</button></div>
          </form>
        </div></div>
      )}

      {isServiceModalOpen && (
        <div className="modal-overlay" style={{ backdropFilter: 'blur(4px)', backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <div className="modal-content" style={{ textAlign: 'left', maxWidth: '440px', padding: '35px', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '25px', fontSize: '24px', color: '#111827', fontWeight: '800' }}>
              {serviceForm.id ? 'Edit Service' : 'Create New Service'}
            </h2>
            {serviceError && (
              <div style={{ backgroundColor: '#fef2f2', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                {serviceError}
              </div>
            )}
            <form onSubmit={handleSaveService}>
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', color: '#374151', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Service Icon</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                  {emojiOptions.map(emoji => (
                    <button key={emoji} type="button" onClick={() => setServiceForm({ ...serviceForm, icon: emoji })} style={{ fontSize: '24px', padding: '8px', borderRadius: '10px', cursor: 'pointer', backgroundColor: serviceForm.icon === emoji ? '#eff6ff' : '#f9fafb', border: `2px solid ${serviceForm.icon === emoji ? '#3b82f6' : '#e5e7eb'}`, transition: 'all 0.2s' }}>{emoji}</button>
                  ))}
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', color: '#374151', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Service Name</label>
                <div style={{ position: 'relative', marginTop: '8px' }}>
                  <input type="text" value={serviceForm.name} onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })} required placeholder="e.g. Normal Laundry" style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '15px', backgroundColor: '#f9fafb', transition: 'all 0.2s' }} />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', color: '#374151', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Description</label>
                <div style={{ position: 'relative', marginTop: '8px' }}>
                  <input type="text" value={serviceForm.desc} onChange={(e) => setServiceForm({ ...serviceForm, desc: e.target.value })} placeholder="Short description" style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '15px', backgroundColor: '#f9fafb', transition: 'all 0.2s' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px' }}>
                <div className="form-group">
                  <label style={{ fontSize: '13px', fontWeight: '700', color: '#374151', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Price (₱)</label>
                  <div style={{ position: 'relative', marginTop: '8px' }}>
                    <input type="number" value={serviceForm.price} onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })} required placeholder="0" style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '15px', backgroundColor: '#f9fafb', transition: 'all 0.2s' }} />
                  </div>
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '13px', fontWeight: '700', color: '#374151', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Unit</label>
                  <select value={serviceForm.unit} onChange={(e) => setServiceForm({ ...serviceForm, unit: e.target.value })} style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '15px', backgroundColor: '#f9fafb', marginTop: '8px', cursor: 'pointer' }}>
                    <option value="kg">kg</option>
                    <option value="piece">piece</option>
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: '35px', padding: '16px', borderRadius: '10px', border: '1px solid #d1d5db', backgroundColor: serviceForm.available ? '#ecfdf5' : '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.2s' }}>
                <div>
                  <p style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#111827' }}>Available for Booking</p>
                </div>
                <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '26px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={serviceForm.available} onChange={(e) => setServiceForm({ ...serviceForm, available: e.target.checked })} style={{ opacity: 0, width: 0, height: 0 }} />
                  <span style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: serviceForm.available ? '#10b981' : '#d1d5db', transition: '.4s', borderRadius: '34px' }}>
                    <span style={{ position: 'absolute', content: '""', height: '20px', width: '20px', left: serviceForm.available ? '24px' : '4px', bottom: '3px', backgroundColor: 'white', transition: '.4s', borderRadius: '50%' }}></span>
                  </span>
                </label>
              </div>
              <div className="modal-actions" style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                <button type="button" className="cancel-btn" onClick={() => setIsServiceModalOpen(false)} disabled={isSavingService} style={{ flex: 1, padding: '12px', borderRadius: '10px', backgroundColor: '#f3f4f6', color: '#4b5563', fontWeight: '600', border: 'none', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={isSavingService} style={{ flex: 1, padding: '12px', borderRadius: '10px', backgroundColor: '#2563eb', color: 'white', fontWeight: '600', border: 'none', cursor: 'pointer', opacity: isSavingService ? 0.7 : 1, transition: 'background 0.2s' }}>{isSavingService ? 'Saving...' : 'Save Service'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="modal-overlay"><div className="modal-content" style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#1f2937' }}>Delete Service?</h2>
          <p style={{ color: '#6b7280', marginBottom: '25px' }}>Are you sure you want to delete <strong>{serviceToDelete?.service_name || serviceToDelete?.name}</strong>? This action cannot be undone.</p>
          <div className="modal-actions" style={{ justifyContent: 'center' }}>
            <button className="cancel-btn" onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
            <button className="submit-btn" onClick={executeDeleteService} style={{ backgroundColor: '#ef4444' }}>Delete</button>
          </div>
        </div></div>
      )}
    </div>
  );
};

export default AdminDashboard;