import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import './Login.css';
import Logo from './laundry-logo.png'; 

const avatarOptions = [
  { id: 1, url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4' },
  { id: 2, url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack&backgroundColor=c0aede' },
  { id: 3, url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica&backgroundColor=ffdfbf' },
  { id: 4, url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&backgroundColor=ffd5dc' },
  { id: 5, url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Leo&backgroundColor=ffdfbf' },
  { id: 6, url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria&backgroundColor=d1d4f9' },
];

const CustomerDashboard = ({ services, orders, setOrders }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();
  const location = useLocation();
  
  const initialName = location.state?.name || 'Customer';
  const initialEmail = location.state?.email || 'customer@example.com';

  // --- PROFILE STATE ---
  const [profileData, setProfileData] = useState({
    name: initialName,
    email: initialEmail,
    role: 'Customer',
    phone: '639171234567',
    photo: avatarOptions[1].url
  });

  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [tempAvatar, setTempAvatar] = useState(profileData.photo);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ ...profileData });

  const openAvatarModal = () => { setTempAvatar(profileData.photo); setIsAvatarModalOpen(true); };
  const saveAvatar = () => { setProfileData({ ...profileData, photo: tempAvatar }); setIsAvatarModalOpen(false); };
  
  const openEditModal = () => { setEditForm({ ...profileData }); setIsEditModalOpen(true); };
  const saveProfileInfo = (e) => {
    e.preventDefault();
    setProfileData(editForm);
    setIsEditModalOpen(false);
    alert('Personal Information Updated!');
  };

  // --- ORDER CREATION STATE ---
  const [newWeight, setNewWeight] = useState(8);
  const [selectedServiceId, setSelectedServiceId] = useState(services[0]?.id || '');
  const [addExpress, setAddExpress] = useState(false);
  const [addPickup, setAddPickup] = useState(false);

  // --- FEEDBACK STATE ---
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackRating, setFeedbackRating] = useState('5');
  const [feedbackType, setFeedbackType] = useState('General');

  // Calculate breakdowns
  const basePrice = newWeight * 30;
  const expressFee = addExpress ? 50 : 0;
  const pickupFee = addPickup ? 30 : 0;
  const totalPrice = basePrice + expressFee + pickupFee;
  
  const selectedServiceObj = services.find(s => s.id === selectedServiceId);

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    if (newWeight <= 0) return alert("Please enter a valid weight.");

    const addons = [];
    if (addExpress) addons.push('express');
    if (addPickup) addons.push('pickup');

    const newOrder = {
      id: `#L-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      customerName: profileData.name, 
      serviceId: selectedServiceId,
      weight: Number(newWeight),
      price: totalPrice,
      addons: addons,
      status: 'Pending',
      date: new Date().toLocaleDateString()
    };

    setOrders([newOrder, ...orders]); 
    alert('Order Placed Successfully!');
    
    // Reset form
    setNewWeight(8);
    setAddExpress(false);
    setAddPickup(false);
    setActiveTab('dashboard');
  };

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    alert(`Feedback sent! Thank you.`);
    setFeedbackText('');
  };

  const myOrders = orders.filter(o => o.customerName === profileData.name);

  return (
    <div className="dashboard-container">
      <div className="dashboard-glass">
        <div className="dashboard-nav">
          <div className="nav-brand">
            <img src={Logo} alt="Laundry Logo" style={{ height: '35px', objectFit: 'contain' }} />
            <span style={{ fontSize: '20px', fontWeight: '700', color: '#111827' }}>Dirt Be Gone</span>
          </div>
          <div className="nav-links">
            <span onClick={() => setActiveTab('dashboard')} className={activeTab === 'dashboard' ? 'active' : ''}>Dashboard</span>
            <span onClick={() => setActiveTab('services')} className={activeTab === 'services' ? 'active' : ''}>Services</span>
            <span onClick={() => setActiveTab('profile')} className={activeTab === 'profile' ? 'active' : ''}>Profile</span>
          </div>
          <div className="nav-actions"></div>
        </div>

        <div className="dashboard-content">
          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <div className="tab-content fade-in">
              <h1 className="page-title">My Laundry Orders</h1>
              <div className="orders-list">
                {myOrders.length === 0 ? <p style={{ color: '#6b7280' }}>No orders yet. Go to Services to place one!</p> : null}
                {myOrders.map((order) => (
                  <div key={order.id} className="order-row no-hover" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                      <div className="order-info">
                        <h4>{order.id} <span style={{ fontSize: '12px', color: '#9ca3af' }}>• {order.date}</span></h4>
                        <p>{order.weight} kg • ₱30/kg</p>
                        <p style={{ fontSize: '12px', color: '#6b7280' }}>Service: {services.find(s => s.id === order.serviceId)?.name}</p>
                        <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
                          Add-ons: {order.addons.length > 0 ? order.addons.map(a => a === 'express' ? 'Express' : 'Pickup').join(', ') : 'None'}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span className={`status-select ${order.status.toLowerCase()}`} style={{ display: 'inline-block', marginBottom: '5px' }}>{order.status}</span>
                        <h3 style={{ margin: 0, color: '#10b981', fontSize: '20px' }}>₱{order.price}</h3>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* IMPROVED SERVICES TAB */}
          {activeTab === 'services' && (
            <div className="tab-content fade-in">
              <div className="services-header" style={{ marginBottom: '25px' }}>
                <h1 className="page-title" style={{ marginBottom: '5px' }}>Place an Order</h1>
                <p style={{ color: '#6b7280', fontSize: '14px' }}>Our standard rate is ₱30 per kilogram.</p>
              </div>

              <div className="calculator-layout">
                {/* LEFT: Order Form */}
                <form onSubmit={handlePlaceOrder} className="calculator-card glass-panel no-hover">
                  
                  <div className="form-group">
                    <label style={{ fontSize: '14px' }}>Select Laundry Service</label>
                    <select 
                      value={selectedServiceId} 
                      onChange={(e) => setSelectedServiceId(e.target.value)} 
                      className="calc-select"
                    >
                      {services.map(s => <option key={s.id} value={s.id}>{s.name} ({s.unit})</option>)}
                    </select>
                  </div>

                  <div className="form-group">
                    <label style={{ fontSize: '14px' }}>Enter Laundry Weight (kg)</label>
                    {/* Fixed input collision by using a specific class that hides spinners */}
                    <div className="weight-input-wrapper">
                      <input 
                        type="number" 
                        min="1" 
                        step="0.1"
                        value={newWeight} 
                        onChange={(e) => setNewWeight(e.target.value)} 
                        className="weight-input-field"
                        required
                      />
                      <span className="weight-input-suffix">kg</span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>Price is ₱30 per kg</p>
                  </div>

                  <div className="form-group">
                    <label style={{ fontSize: '14px', marginBottom: '10px', display: 'block' }}>Optional Add-ons</label>
                    
                    <label className="addon-checkbox">
                      <input type="checkbox" checked={addExpress} onChange={(e) => setAddExpress(e.target.checked)} />
                      <span>⚡ Express Laundry</span>
                      <span className="addon-price">+₱50</span>
                    </label>

                    <label className="addon-checkbox">
                      <input type="checkbox" checked={addPickup} onChange={(e) => setAddPickup(e.target.checked)} />
                      <span>🚚 Pickup & Delivery</span>
                      <span className="addon-price">+₱30</span>
                    </label>
                  </div>

                  <button type="submit" className="btn-blue" style={{ width: '100%', padding: '14px', fontSize: '15px', marginTop: '10px' }}>
                    Confirm Order
                  </button>
                </form>

                {/* RIGHT: IMPROVED Live Summary Receipt */}
                <div className="order-summary-card glass-panel no-hover">
                  <div className="summary-header">
                    <h4>Order Summary</h4>
                    <span className="summary-icon">🧾</span>
                  </div>
                  
                  <div className="summary-body">
                    <div className="summary-row">
                      <span className="summary-label">Service</span>
                      <strong className="summary-value">{selectedServiceObj?.name || 'N/A'}</strong>
                    </div>

                    <div className="summary-row">
                      <span className="summary-label">Base Weight</span>
                      <strong className="summary-value">{newWeight || 0} kg</strong>
                    </div>

                    <div className="summary-row">
                      <span className="summary-label">Base Price (₱30/kg)</span>
                      <strong className="summary-value">₱{basePrice.toFixed(2)}</strong>
                    </div>

                    {addExpress && (
                      <div className="summary-row">
                        <span className="summary-label">⚡ Express Laundry</span>
                        <strong className="summary-value">₱{expressFee.toFixed(2)}</strong>
                      </div>
                    )}

                    {addPickup && (
                      <div className="summary-row">
                        <span className="summary-label">🚚 Pickup & Delivery</span>
                        <strong className="summary-value">₱{pickupFee.toFixed(2)}</strong>
                      </div>
                    )}
                  </div>

                  <div className="summary-footer">
                    <span>Total Amount</span>
                    <h2>₱{totalPrice.toFixed(2)}</h2>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="tab-content fade-in profile-section">
              
              <div className="profile-card glass-panel no-hover" style={{ padding: '25px' }}>
                <div className="photo-upload-area" style={{ alignItems: 'center' }}>
                  <div className="avatar-container">
                    <div className="profile-avatar-large">
                      <img src={profileData.photo} alt="User Avatar" />
                    </div>
                    <div className="edit-pen-btn" onClick={openAvatarModal}>✎</div>
                  </div>
                  
                  <div className="photo-actions">
                    <h3 style={{ fontSize: '22px', marginBottom: '0px' }}>{profileData.name}</h3>
                    <span className={`role-badge role-${profileData.role.toLowerCase()}`}>{profileData.role}</span>
                    <p style={{ marginTop: '8px' }}>Click the pen icon beside your avatar to change your profile picture.</p>
                  </div>
                </div>
              </div>

              <div className="profile-card glass-panel no-hover" style={{ padding: '25px', marginTop: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 className="card-title" style={{ margin: 0 }}>Personal Information</h3>
                  <button className="btn-blue" onClick={openEditModal} style={{ padding: '6px 16px', fontSize: '12px' }}>Edit Details</button>
                </div>
                
                <div className="info-display-grid">
                  <div>
                    <p className="info-label">Full Name</p>
                    <p className="info-value">{profileData.name}</p>
                  </div>
                  <div>
                    <p className="info-label">Email Address</p>
                    <p className="info-value">{profileData.email}</p>
                  </div>
                  <div>
                    <p className="info-label">Contact Number</p>
                    <p className="info-value">+{profileData.phone}</p>
                  </div>
                </div>
              </div>

              <h1 className="page-title" style={{ marginTop: '30px' }}>Send Feedback</h1>
              <div className="profile-card glass-panel no-hover" style={{ padding: '25px' }}>
                <form onSubmit={handleFeedbackSubmit}>
                  <div className="form-group">
                    <label>Feedback Type</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      {['General', 'Bug', 'Feature', 'Rating'].map(type => (
                        <button type="button" key={type} onClick={() => setFeedbackType(type)} style={{ padding: '6px 15px', borderRadius: '20px', border: '1px solid #d1d5db', background: feedbackType === type ? '#3b82f6' : '#fff', color: feedbackType === type ? '#fff' : '#4b5563', fontSize: '13px', cursor: 'pointer' }}>{type}</button>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Your Feedback</label>
                    <textarea value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', minHeight: '100px' }} />
                  </div>
                  <div className="form-group">
                    <label>Rating</label>
                    <select value={feedbackRating} onChange={(e) => setFeedbackRating(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}>
                      <option value="5">⭐⭐⭐⭐⭐</option>
                      <option value="4">⭐⭐⭐⭐</option>
                      <option value="3">⭐⭐⭐</option>
                      <option value="2">⭐⭐</option>
                      <option value="1">⭐</option>
                    </select>
                  </div>
                  <button type="submit" className="btn-blue" style={{ padding: '10px 20px' }}>Submit Feedback</button>
                </form>
              </div>

              <div className="logout-container">
                <button onClick={() => navigate('/login')} className="logout-btn-full">Logout</button>
              </div>

            </div>
          )}
        </div>
      </div>

      {/* AVATAR MODAL */}
      {isAvatarModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Choose your avatar</h2>
            <div className="avatar-grid">
              {avatarOptions.map((avatar) => (
                <img 
                  key={avatar.id} src={avatar.url} alt="Avatar option" 
                  className={`avatar-option ${tempAvatar === avatar.url ? 'selected' : ''}`}
                  onClick={() => setTempAvatar(avatar.url)}
                />
              ))}
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setIsAvatarModalOpen(false)}>Cancel</button>
              <button className="submit-btn" onClick={saveAvatar}>Save Avatar</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PROFILE MODAL */}
      {isEditModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ textAlign: 'left' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Edit Personal Information</h2>
            <form onSubmit={saveProfileInfo}>
              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label>Full Name</label>
                <input type="text" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', fontFamily: 'Poppins' }} />
              </div>
              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label>Email Address</label>
                <input type="email" value={editForm.email} onChange={(e) => setEditForm({...editForm, email: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', fontFamily: 'Poppins' }} />
              </div>
              <div className="form-group" style={{ marginBottom: '25px' }}>
                <label>Contact Number</label>
                <PhoneInput
                  country={'ph'} value={editForm.phone} onChange={(val) => setEditForm({...editForm, phone: val})} format={null} 
                  inputStyle={{ width: '100%', height: '40px', borderRadius: '8px', border: '1px solid #d1d5db', fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}
                  buttonStyle={{ borderRadius: '8px 0 0 8px', border: '1px solid #d1d5db', borderRight: 'none', backgroundColor: '#f3f4f6' }}
                  containerStyle={{ width: '100%' }}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                <button type="submit" className="submit-btn">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default CustomerDashboard;