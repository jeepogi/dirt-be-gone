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

const PROFILE_KEY = 'customerProfile';
const readProfile = () => {
  try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null'); }
  catch { return null; }
};

const getStatusStyles = (status) => {
  const s = (status || '').toLowerCase();
  const base = { border: '1px solid transparent' };

  switch (s) {
    case 'pending': return { ...base, backgroundColor: '#fef3c7', color: '#92400e', borderColor: '#fde68a' };
    case 'in progress':
    case 'processing':
    case 'ongoing': return { ...base, backgroundColor: '#dbeafe', color: '#1e40af', borderColor: '#bfdbfe' };
    case 'ready':
    case 'ready for pickup': return { ...base, backgroundColor: '#e0e7ff', color: '#3730a3', borderColor: '#c7d2fe' };
    case 'completed':
    case 'done':
    case 'delivered': return { ...base, backgroundColor: '#d1fae5', color: '#065f46', borderColor: '#a7f3d0' };
    case 'cancelled':
    case 'canceled': return { ...base, backgroundColor: '#fee2e2', color: '#991b1b', borderColor: '#fecaca' };
    default: return { ...base, backgroundColor: '#f3f4f6', color: '#374151', borderColor: '#e5e7eb' };
  }
};

const StatusPill = ({ status }) => {
  const label = status || 'Pending';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 16px', borderRadius: '20px',
      fontSize: '12px', fontWeight: '700', textTransform: 'capitalize', letterSpacing: '0.3px', ...getStatusStyles(label),
    }}>
      <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: 'currentColor' }} />
      {label}
    </span>
  );
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

const BellIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
  </svg>
);

const CustomerDashboard = ({ services, setServices, orders, setOrders }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');
    if (!token || role !== 'Customer') navigate('/signin', { replace: true });
  }, [navigate]);

  const storedName = localStorage.getItem('userName') || 'Customer';
  const savedProfile = readProfile();
  const [profileData, setProfileData] = useState({
    name: savedProfile?.name || storedName,
    email: savedProfile?.email || 'customer@example.com',
    role: 'Customer',
    phone: savedProfile?.phone || '',
    address: savedProfile?.address || '',
    photo: savedProfile?.photo || avatarOptions[1].url,
  });

  const profileReady = !!(profileData.phone?.trim() && profileData.address?.trim());
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [tempAvatar, setTempAvatar] = useState(profileData.photo);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ ...profileData });
  const [showProfileWarning, setShowProfileWarning] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const res = await fetch(`${API_BASE}/profile?t=${Date.now()}`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          const merged = { 
            ...profileData, name: data.name || profileData.name, email: data.email || profileData.email,
            phone: data.phone || '', address: data.address || '', photo: data.photo || avatarOptions[1].url, role: 'Customer'
          };
          setProfileData(merged); localStorage.setItem(PROFILE_KEY, JSON.stringify(merged));
        }
      } catch (err) { console.error("Profile error:", err); }

      try {
        const res = await fetch(`${API_BASE}/services?t=${Date.now()}`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const freshServices = await res.json();
          setServices(freshServices);
        }
      } catch (err) { console.error("Services error:", err); }

      try {
        const res = await fetch(`${API_BASE}/request_service?t=${Date.now()}`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          setOrders(Array.isArray(data) ? data : data.orders || []);
        }
      } catch (err) { console.error("Requests error:", err); }

      try {
        const res = await fetch(`${API_BASE}/notifications?t=${Date.now()}`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
        }
      } catch (err) { console.error("Notifications error:", err); }
    };

    const initFetch = async () => { 
      await fetchData(); 
      setIsInitialLoading(false); 
    };
    initFetch();
    
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markAllNotificationsRead = async () => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API_BASE}/notifications/read`, { 
        method: 'PUT', 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setNotifications(notifications.map(n => ({ ...n, is_read: 1 })));
    } catch (err) { console.error(err); }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const persistProfile = async (next) => {
    setProfileData(next); localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
    const token = localStorage.getItem('token');
    if (!token) return { ok: false, error: 'No auth token' };
    try {
      const res = await fetch(`${API_BASE}/profile`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: next.name, email: next.email, phone: next.phone, address: next.address, photo: next.photo }),
      });
      if (!res.ok) throw new Error('Failed to update profile.');
      return { ok: true };
    } catch (err) { return { ok: false, error: err.message }; }
  };

  const openAvatarModal = () => { setTempAvatar(profileData.photo); setIsAvatarModalOpen(true); };
  const saveAvatar = async () => {
    const next = { ...profileData, photo: tempAvatar };
    setIsAvatarModalOpen(false); 
    const result = await persistProfile(next);
    if (!result.ok) showToast(result.error, 'error'); else showToast('Profile picture updated!', 'success');
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
    setIsSavingProfile(true);
    const result = await persistProfile({ ...editForm, role: 'Customer' });
    setIsSavingProfile(false);
    if (result.ok) { setIsEditModalOpen(false); setShowProfileWarning(false); showToast('Profile updated!', 'success'); }
    else showToast(result.error, 'error');
  };

  const handleLogout = () => {
    localStorage.removeItem('token'); localStorage.removeItem('userRole');
    localStorage.removeItem('userName'); localStorage.removeItem(PROFILE_KEY);
    navigate('/signin');
  };

  const [newWeight, setNewWeight] = useState(8);
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [withDelivery, setWithDelivery] = useState(false);
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  const applyCoupon = () => {
    if (couponCode.toUpperCase() === 'SAVE10') { setAppliedDiscount(0.10); showToast('Coupon applied: 10% off.', 'success'); }
    else { setAppliedDiscount(0); showToast('Invalid coupon code.', 'error'); }
  };

  const weightNum = Number(newWeight) || 0;
  const selectedService = services.find(s => String(s.id || s.service_id) === String(selectedServiceId));
  const isPiece = selectedService?.unit?.toLowerCase().includes('piece') || selectedService?.unit?.toLowerCase().includes('pcs');
  const unitLabel = isPiece ? 'pcs' : 'kg';
  const weightLabel = isPiece ? 'Quantity' : 'Weight';

  const totals = useMemo(() => {
    if (!selectedService) return { base: 0, discount: 0, delivery: 0, final: 0 };
    const perKg = Number(selectedService.price_rate || selectedService.price || 30);
    const base = weightNum * perKg;
    const discount = base * appliedDiscount;
    const delivery = withDelivery ? 50 : 0;
    return { base, discount, delivery, final: base - discount + delivery };
  }, [selectedService, weightNum, withDelivery, appliedDiscount]);

  const handlePlaceRequest = async (e) => {
    e.preventDefault();
    if (!profileReady) { setShowProfileWarning(true); setActiveTab('profile'); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    if (weightNum <= 0) return showToast('Please enter a valid amount.', 'error');
    if (!selectedServiceId) return showToast('Please select a service.', 'error');

    const payload = {
      customer_id: localStorage.getItem('userId') || 1, 
      service_id: Number(String(selectedServiceId).replace(/\D/g, '')), 
      weight: weightNum, total_amount: totals.final, withDelivery: withDelivery,
      customerName: profileData.name, customerAddress: profileData.address,
      serviceName: selectedService?.service_name || selectedService?.name,
      coupon_used: appliedDiscount > 0 ? couponCode : null
    };

    setIsSubmittingRequest(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/request_service`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to send request');
      const saved = await res.json().catch(() => payload);
      setOrders([saved, ...orders]);
      showToast('Service request sent successfully!', 'success');
      setNewWeight(8); setSelectedServiceId(null); setWithDelivery(false); setCouponCode(''); setAppliedDiscount(0); setActiveTab('dashboard');
    } catch (err) { showToast(err.message, 'error'); } finally { setIsSubmittingRequest(false); }
  };

  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackRating, setFeedbackRating] = useState('5');
  const [feedbackType, setFeedbackType] = useState('General');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackText.trim()) return showToast('Please write your feedback.', 'error');
    setIsSubmittingFeedback(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/feedback`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ type: feedbackType, rating: Number(feedbackRating), message: feedbackText.trim() }),
      });
      if (!res.ok) throw new Error('Failed to send feedback');
      showToast('Thank you! Your feedback has been sent.', 'success');
      setFeedbackText(''); setFeedbackType('General'); setFeedbackRating('5');
    } catch (err) { showToast(err.message, 'error'); } finally { setIsSubmittingFeedback(false); }
  };

  const myRequests = orders.filter((o) => o.customerName === profileData.name);

  const NavItem = ({ tab, icon, label }) => {
    const isActive = activeTab === tab;
    return (
      <div onClick={() => setActiveTab(tab)} style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
        padding: '8px 0', cursor: 'pointer', boxSizing: 'border-box',
        color: isActive ? '#2563eb' : '#9ca3af',
        transition: 'all 0.2s'
      }}>
        <div style={{ 
          padding: '6px 16px', borderRadius: '20px', 
          backgroundColor: isActive ? '#eff6ff' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          {icon}
        </div>
        <span style={{ fontSize: '11px', fontWeight: isActive ? '700' : '500' }}>{label}</span>
      </div>
    );
  };

  return (
    <div className="dashboard-container" style={{ overflowX: 'hidden', width: '100%' }}>
      <div style={{ position: 'fixed', top: '20px', right: '20px', padding: '12px 24px', borderRadius: '8px', backgroundColor: toast.type === 'error' ? '#ef4444' : '#10b981', color: 'white', fontWeight: '600', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', zIndex: 9999, transition: 'all 0.3s ease', transform: toast.show ? 'translateX(0)' : 'translateX(150%)', opacity: toast.show ? 1 : 0 }}>
        {toast.message}
      </div>

      <div className="dashboard-glass" style={{ width: '100%', maxWidth: '100vw', boxSizing: 'border-box', paddingBottom: '80px' }}>
        
        {/* TOP HEADER: Logo and Bell only */}
        <div className="dashboard-nav" style={{ 
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
          padding: '15px', width: '100%', boxSizing: 'border-box', 
          borderBottom: '1px solid #f1f5f9'
        }}>
          <img src={Logo} alt="Laundry Logo" style={{ height: '45px', objectFit: 'contain' }} />
          
          <div style={{ position: 'relative' }}>
            <div 
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (!showNotifications && unreadCount > 0) markAllNotificationsRead();
              }}
              style={{ cursor: 'pointer', color: '#4b5563', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}
            >
              <BellIcon />
              {unreadCount > 0 && (
                <span style={{ position: 'absolute', top: '-2px', right: '-2px', backgroundColor: '#ef4444', color: 'white', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold' }}>
                  {unreadCount}
                </span>
              )}
            </div>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div style={{ position: 'absolute', top: '50px', right: 0, width: '300px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb', zIndex: 1000, overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6', backgroundColor: '#f8fafc', fontWeight: 'bold', fontSize: '14px' }}>
                  Notifications
                </div>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <p style={{ padding: '20px', textAlign: 'center', fontSize: '13px', color: '#9ca3af' }}>No notifications yet</p>
                  ) : (
                    notifications.map((n, i) => (
                      <div key={i} style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6', backgroundColor: n.is_read ? 'white' : '#eff6ff' }}>
                        <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#111827' }}>{n.message}</p>
                        <span style={{ fontSize: '11px', color: '#9ca3af' }}>{new Date(n.created_at || Date.now()).toLocaleTimeString()}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-content" style={{ padding: '15px' }}>
          {activeTab === 'dashboard' && (
            <div className="tab-content fade-in">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
                {isInitialLoading ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6b7280' }}>Loading...</div>
                ) : myRequests.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6b7280', backgroundColor: '#fff', borderRadius: '16px', border: '1px dashed #d1d5db' }}>
                    <p style={{ margin: 0, fontSize: '15px' }}>No service requests yet.</p>
                  </div>
                ) : null}
                
                {!isInitialLoading && myRequests.map((request, index) => {
                  const requestStatus = request.request_status || request.status || 'Pending';
                  return (
                    <div key={request.request_id || index} style={{ 
                      display: 'flex', flexDirection: 'column', padding: '16px', borderRadius: '16px', 
                      background: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' 
                    }}>
                      
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #f3f4f6' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#111827' }}>REQ-{request.request_id || index + 1}</h4>
                          <span style={{ fontSize: '12px', color: '#6b7280', backgroundColor: '#f3f4f6', padding: '2px 8px', borderRadius: '6px' }}>
                            {new Date(request.request_date || request.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <StatusPill status={requestStatus} />
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: '1 1 100%' }}>
                          <p style={{ margin: 0, fontSize: '15px', color: '#111827', fontWeight: '700' }}>{request.serviceName}</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '13px', color: '#4b5563', fontWeight: '500' }}>⚖️ {request.weight} kg</span>
                            {request.withDelivery && (
                              <span style={{ fontSize: '11px', color: '#059669', fontWeight: '600', backgroundColor: '#ecfdf5', padding: '4px 8px', borderRadius: '6px', border: '1px solid #d1fae5' }}>🚚 Delivery</span>
                            )}
                          </div>
                          {request.customerAddress && (
                            <p style={{ margin: 0, fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'flex-start', gap: '4px' }}><span>📍</span> {request.customerAddress}</p>
                          )}
                        </div>

                        <div style={{ 
                          display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center',
                          backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '12px',
                          width: '100%', border: '1px solid #e2e8f0'
                        }}>
                          <p style={{ margin: 0, fontSize: '10px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', marginBottom: '2px' }}>Total</p>
                          <h3 style={{ margin: 0, color: '#10b981', fontSize: '22px', fontWeight: '800' }}>₱{request.total_amount || request.price}</h3>
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
              <div className="services-header" style={{ marginBottom: '20px' }}>
                <h1 className="page-title" style={{ marginBottom: '5px', fontSize: '24px' }}>Request a Service</h1>
                <p style={{ color: '#6b7280', fontSize: '13px' }}>Select a service and enter your details.</p>
              </div>

              {showProfileWarning && !profileReady && (
                <div className="glass-panel no-hover" style={{ padding: '14px 18px', marginBottom: '16px', borderRadius: '12px', background: '#fef2f2', border: '1px solid #ef4444', color: '#991b1b' }}>
                  <strong>Missing required info</strong>
                  <p style={{ margin: '4px 0 10px', fontSize: '13px' }}>Please add your contact number and street address before requesting a service.</p>
                  <button type="button" className="btn-blue" onClick={() => { setActiveTab('profile'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={{ padding: '8px 16px', fontSize: '13px' }}>Go to Profile →</button>
                </div>
              )}

              <div className="calculator-layout" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                <form onSubmit={handlePlaceRequest} className="calculator-card glass-panel no-hover" style={{ flex: '1 1 100%', minWidth: '0' }}>
                  
                  <label style={{ fontSize: '14px', fontWeight: '600', display: 'block', marginBottom: '10px', color: '#4b5563' }}>Select a Service</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '25px' }}>
                    {isInitialLoading ? <p style={{ fontSize: '13px', color: '#6b7280' }}>Loading...</p> : 
                     services.length === 0 ? <p style={{ fontSize: '13px', color: '#ef4444' }}>No services available.</p> : 
                     services.map(service => (
                        <ServiceCard key={service.service_id || service.id} service={service} isSelected={String(selectedServiceId) === String(service.service_id || service.id)} onSelect={setSelectedServiceId} />
                     ))
                    }
                  </div>

                  <div className="form-group" style={{ marginBottom: '20px', backgroundColor: '#f8fafc', padding: '15px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <label style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>Enter {isPiece ? 'Quantity (pieces)' : 'Laundry Weight (kg)'}</label>
                    <div className="weight-input-wrapper" style={{ marginTop: '8px' }}>
                      <input type="number" min="1" step={isPiece ? '1' : '0.1'} value={newWeight} onChange={(e) => setNewWeight(e.target.value)} className="weight-input-field" required />
                      <span className="weight-input-suffix">{unitLabel}</span>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f9fafb', borderRadius: '10px', border: '1px dashed #d1d5db' }}>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: '#4b5563' }}>Have a Promo Code?</label>
                    
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px', width: '100%' }}>
                      <input 
                        type="text" placeholder="e.g. SAVE10" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} 
                        style={{ flex: 1, minWidth: 0, padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', fontSize: '14px' }} 
                      />
                      <button 
                        type="button" onClick={applyCoupon} className="btn-blue" 
                        style={{ flexShrink: 0, padding: '10px 16px', backgroundColor: '#4b5563', borderRadius: '8px', fontSize: '13px', fontWeight: '600' }}
                      >
                        Apply
                      </button>
                    </div>

                    {appliedDiscount > 0 && <p style={{ fontSize: '12px', color: '#10b981', marginTop: '8px', fontWeight: '600' }}>✓ Coupon applied: 10% off!</p>}
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', padding: '16px', borderRadius: '10px', border: withDelivery ? '2px solid #10b981' : '1px solid #d1d5db', backgroundColor: withDelivery ? '#ecfdf5' : '#fff', cursor: 'pointer', transition: 'all 0.2s' }}>
                      <input type="checkbox" checked={withDelivery} onChange={(e) => setWithDelivery(e.target.checked)} style={{ width: '22px', height: '22px', accentColor: '#10b981', marginRight: '12px' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: withDelivery ? '#065f46' : '#1f2937' }}>Request Delivery</div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>Pickup and delivered to your door.</div>
                      </div>
                      <div style={{ fontSize: '15px', fontWeight: '800', color: '#10b981' }}>+₱50</div>
                    </label>
                  </div>

                  <button type="submit" className="btn-blue" style={{ width: '100%', padding: '14px', fontSize: '15px', opacity: isSubmittingRequest ? 0.6 : 1 }} disabled={isSubmittingRequest}>
                    {isSubmittingRequest ? 'Submitting…' : 'Confirm Service Request'}
                  </button>
                </form>

                <div className="request-summary-card no-hover" style={{ 
                  background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '0', 
                  overflow: 'hidden', boxShadow: '0 4px 12px -2px rgba(0,0,0,0.08)', display: 'flex', 
                  flexDirection: 'column', flex: '1 1 100%', height: 'fit-content',
                  position: window.innerWidth > 900 ? 'sticky' : 'static', top: '20px'
                }}>
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>🧾</div>
                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#111827' }}>Request Summary</h4>
                  </div>

                  <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>Total {weightLabel}</span>
                      <span style={{ fontSize: '14px', color: '#111827', fontWeight: '700' }}>{newWeight || 0} {unitLabel}</span>
                    </div>
                    <div style={{ height: '1px', background: '#f1f5f9' }} />
                    
                    {!selectedService ? (
                      <p style={{ fontSize: '13px', color: '#9ca3af', fontStyle: 'italic', textAlign: 'center', margin: '12px 0' }}>Select a service to see pricing</p>
                    ) : (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500', flex: 1 }}>{selectedService.service_name}</span>
                          <span style={{ fontSize: '14px', color: '#111827', fontWeight: '600' }}>₱{totals.base.toFixed(2)}</span>
                        </div>
                        {totals.discount > 0 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '13px', color: '#ef4444', fontWeight: '600' }}>🎟️ Discount</span>
                            <span style={{ fontSize: '14px', color: '#ef4444', fontWeight: '700' }}>-₱{totals.discount.toFixed(2)}</span>
                          </div>
                        )}
                        {withDelivery && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '13px', color: '#059669', fontWeight: '600' }}>🚚 Delivery</span>
                            <span style={{ fontSize: '14px', color: '#059669', fontWeight: '700' }}>₱{totals.delivery.toFixed(2)}</span>
                          </div>
                        )}
                        {profileReady && withDelivery && (
                          <>
                            <div style={{ height: '1px', background: '#f1f5f9' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                              <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>To</span>
                              <span style={{ fontSize: '12px', color: '#374151', textAlign: 'right' }}>{profileData.address}</span>
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </div>

                  <div style={{ padding: '16px 20px', background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)', borderTop: '1px solid #d1fae5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#065f46', textTransform: 'uppercase' }}>Total Amount</span>
                    <span style={{ fontSize: '24px', fontWeight: '800', color: '#059669' }}>₱{totals.final.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="tab-content fade-in profile-section">
              {showProfileWarning && !profileReady && (
                <div className="glass-panel no-hover" style={{ padding: '14px 18px', marginBottom: '16px', borderRadius: '12px', background: '#fef2f2', border: '1px solid #ef4444', color: '#991b1b' }}>
                  <strong>Please complete your info below</strong>
                  <p style={{ margin: '4px 0 0', fontSize: '13px' }}>We need your contact number and street address before you can request a service.</p>
                </div>
              )}

              <div className="profile-card glass-panel no-hover" style={{ padding: '24px', marginBottom: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', border: '3px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                      <img src={profileData.photo} alt="User Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div onClick={openAvatarModal} style={{ position: 'absolute', bottom: 0, right: 0, width: '26px', height: '26px', backgroundColor: '#3b82f6', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '12px', border: '2px solid #fff' }}>
                      ✎
                    </div>
                  </div>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <h2 style={{ margin: '0 0 6px 0', fontSize: '24px', fontWeight: '800', color: '#111827' }}>
                      {profileData.name}
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      <span className={`role-badge role-${profileData.role.toLowerCase()}`} style={{ margin: 0 }}>
                        {profileData.role}
                      </span>
                      <button className="btn-blue" onClick={openEditModal} style={{ padding: '6px 16px', fontSize: '12px', borderRadius: '20px' }}>
                        Edit Profile
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="profile-card glass-panel no-hover" style={{ padding: '20px', marginTop: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <h3 className="card-title" style={{ margin: 0, fontSize: '18px' }}>Personal Info</h3>
                </div>
                <div className="info-display-grid">
                  <div><p className="info-label">Full Name</p><p className="info-value">{profileData.name}</p></div>
                  <div><p className="info-label">Email</p><p className="info-value">{profileData.email}</p></div>
                  <div><p className="info-label">Contact</p><p className="info-value" style={{ color: profileData.phone?.trim() ? undefined : '#ef4444' }}>{profileData.phone?.trim() ? `+${profileData.phone}` : 'Not set'}</p></div>
                  <div><p className="info-label">Address</p><p className="info-value" style={{ color: profileData.address?.trim() ? undefined : '#ef4444' }}>{profileData.address?.trim() || 'Not set'}</p></div>
                </div>
              </div>

              <h1 className="page-title" style={{ marginTop: '25px', fontSize: '20px' }}>Send Feedback</h1>
              <div className="profile-card glass-panel no-hover" style={{ padding: '20px' }}>
                <form onSubmit={handleFeedbackSubmit}>
                  <div className="form-group">
                    <label>Type</label>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '5px' }}>
                      {['General', 'Bug', 'Feature', 'Rating'].map((type) => (
                        <button type="button" key={type} onClick={() => setFeedbackType(type)}
                          style={{ padding: '6px 12px', borderRadius: '20px', border: '1px solid #d1d5db', background: feedbackType === type ? '#3b82f6' : '#fff', color: feedbackType === type ? '#fff' : '#4b5563', fontSize: '12px', cursor: 'pointer' }}
                        >{type}</button>
                      ))}
                    </div>
                  </div>
                  <div className="form-group" style={{ marginTop: '15px' }}>
                    <label>Message</label>
                    <textarea value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} placeholder="Tell us what you think..." required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', minHeight: '80px', fontFamily: 'Poppins', fontSize: '14px' }} />
                  </div>
                  <div className="form-group" style={{ marginTop: '15px' }}>
                    <label>Rating</label>
                    <select value={feedbackRating} onChange={(e) => setFeedbackRating(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', fontFamily: 'Poppins', fontSize: '14px' }}>
                      <option value="5">5 Stars (Excellent)</option>
                      <option value="4">4 Stars (Good)</option>
                      <option value="3">3 Stars (Okay)</option>
                      <option value="2">2 Stars (Needs Improvement)</option>
                      <option value="1">1 Star (Bad)</option>
                    </select>
                  </div>
                  <button type="submit" className="btn-blue" style={{ padding: '10px 16px', marginTop: '10px', opacity: isSubmittingFeedback ? 0.6 : 1, width: '100%', fontSize: '14px' }} disabled={isSubmittingFeedback}>
                    {isSubmittingFeedback ? 'Sending…' : 'Submit Feedback'}
                  </button>
                </form>
              </div>

              <div className="logout-container">
                <button onClick={handleLogout} className="logout-btn-full">Logout</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ✅ BOTTOM NAVIGATION BAR */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0',
        display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        padding: '8px 0', zIndex: 999,
        boxShadow: '0 -4px 12px rgba(0,0,0,0.05)'
      }}>
        <NavItem tab="dashboard" icon={<DashboardIcon />} label="Home" />
        <NavItem tab="services" icon={<ServicesIcon />} label="Services" />
        <NavItem tab="profile" icon={<ProfileIcon />} label="Profile" />
      </div>

      {isAvatarModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Choose your avatar</h2>
            <div className="avatar-grid">
              <label className="avatar-option" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', background: '#d1d5db', position: 'relative', overflow: 'hidden' }} title="Upload your own photo">
                <svg width="45" height="45" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" fill="#f3f4f6"/>
                  <path d="M12 14C7.58172 14 4 17.5817 4 22H20C20 17.5817 16.4183 14 12 14Z" fill="#f3f4f6"/>
                </svg>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
              </label>
              {avatarOptions.map((avatar) => (
                <img key={avatar.id} src={avatar.url} alt="" className={`avatar-option ${tempAvatar === avatar.url ? 'selected' : ''}`} onClick={() => setTempAvatar(avatar.url)} />
              ))}
            </div>
            <div className="modal-actions" style={{ marginTop: '20px' }}>
              <button className="cancel-btn" onClick={() => setIsAvatarModalOpen(false)}>Cancel</button>
              <button className="submit-btn" onClick={saveAvatar}>Save Picture</button>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ textAlign: 'left' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Edit Info</h2>
            <form onSubmit={saveProfileInfo}>
              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label>Full Name</label>
                <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
              </div>
              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label>Email Address</label>
                <input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
              </div>
              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label>Contact Number <span style={{ color: '#ef4444' }}>*</span></label>
                <PhoneInput country={'ph'} value={editForm.phone} onChange={(val) => setEditForm({ ...editForm, phone: val })} format={null}
                  inputStyle={{ width: '100%', height: '40px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                  buttonStyle={{ borderRadius: '8px 0 0 8px', border: '1px solid #d1d5db', borderRight: 'none', backgroundColor: '#f3f4f6' }}
                  containerStyle={{ width: '100%' }}
                />
              </div>
              <div className="form-group" style={{ marginBottom: '25px' }}>
                <label>Street Address <span style={{ color: '#ef4444' }}>*</span></label>
                <input type="text" placeholder="e.g. 123 Mabini St." value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setIsEditModalOpen(false)} disabled={isSavingProfile}>Cancel</button>
                <button type="submit" className="submit-btn" disabled={isSavingProfile} style={{ opacity: isSavingProfile ? 0.6 : 1 }}>
                  {isSavingProfile ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const ServiceCard = ({ service, isSelected, onSelect }) => {
  const sId = service.service_id || service.id;
  const sName = service.service_name || service.name || 'Unnamed Service';
  const sDesc = service.description || service.desc || '';
  const sPrice = service.price_rate || service.price || 0;
  const sUnit = service.unit || 'kg';
  const sIcon = service.icon || '🧺';
  
  const isAvailable = 
    service.availability === 1 || service.availability === '1' || service.availability === true || 
    service.available === true || service.available === 1 || service.available === '1';

  const displayUnit = sUnit.toLowerCase().startsWith('per') ? sUnit : `per ${sUnit}`;

  return (
    <div 
      onClick={() => isAvailable && onSelect(sId)}
      style={{ 
        border: isSelected ? '2px solid #3b82f6' : '1px solid #d1d5db', 
        borderRadius: '12px', padding: '16px',
        backgroundColor: isSelected ? '#eff6ff' : (isAvailable ? '#fff' : '#f9fafb'), 
        transition: 'all 0.2s', cursor: isAvailable ? 'pointer' : 'not-allowed', 
        marginBottom: '12px', opacity: isAvailable ? 1 : 0.6,
        display: 'flex', flexDirection: 'column', gap: '12px',
        width: '100%', boxSizing: 'border-box'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <input 
          type="radio" name="service" checked={isSelected} disabled={!isAvailable} onChange={() => onSelect(sId)} 
          style={{ width: '20px', height: '20px', accentColor: '#3b82f6', marginTop: '2px', flexShrink: 0 }} 
        />
        <div style={{ flex: 1 }}>
          <strong style={{ fontSize: '15px', display: 'block', marginBottom: '4px', color: '#111827' }}>
            {sIcon} {sName}
          </strong>
          <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', lineHeight: '1.4' }}>{sDesc}</p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px dashed #e5e7eb', paddingTop: '10px' }}>
        <span style={{ 
          fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px',
          backgroundColor: isAvailable ? '#ecfdf5' : '#fef2f2', color: isAvailable ? '#10b981' : '#ef4444',
          border: `1px solid ${isAvailable ? '#d1fae5' : '#fecaca'}`
        }}>
          {isAvailable ? 'Available' : 'Unavailable'}
        </span>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: '800', fontSize: '18px', color: '#10b981', lineHeight: '1' }}>₱{sPrice}</div>
          <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px', fontWeight: '500' }}>{displayUnit}</div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;