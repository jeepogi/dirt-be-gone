import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import './Login.css';
import Logo from './laundry-logo.png'; 

// --- AVATAR DATA ---
const avatarOptions = [
  { id: 1, url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4' },
  { id: 2, url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack&backgroundColor=c0aede' },
  { id: 3, url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica&backgroundColor=ffdfbf' },
  { id: 4, url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&backgroundColor=ffd5dc' },
  { id: 5, url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Leo&backgroundColor=ffdfbf' },
  { id: 6, url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria&backgroundColor=d1d4f9' },
];

const AdminDashboard = ({ services, setServices, orders, setOrders }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();
  const location = useLocation();
  
  const initialName = location.state?.name || 'Admin';
  const initialEmail = location.state?.email || 'admin@example.com';
  const initialRole = location.state?.role || 'Admin';

  // --- PROFILE STATE ---
  const [profileData, setProfileData] = useState({
    name: initialName,
    email: initialEmail,
    role: initialRole,
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

  // --- FEEDBACK DATABASE (Mock) ---
  const [feedbacks] = useState([
    { id: 1, user: 'Alex Trie', type: 'General', rating: 5, text: 'Great service! Very fast.', date: '2023-10-25' },
    { id: 2, user: 'Annette Black', type: 'Bug', rating: 3, text: 'The app froze once during checkout.', date: '2023-10-26' },
  ]);

  // --- ADMIN DASHBOARD STATS ---
  const totalRevenue = orders.reduce((sum, order) => sum + order.price, 0);
  const totalRequests = orders.length;
  const pendingCount = orders.filter(o => o.status === 'Pending').length;
  const ongoingCount = orders.filter(o => o.status === 'Ongoing').length;
  const doneCount = orders.filter(o => o.status === 'Done').length;
  const cancelledCount = orders.filter(o => o.status === 'Cancelled').length;
  
  const serviceCounts = orders.reduce((acc, order) => {
    acc[order.serviceId] = (acc[order.serviceId] || 0) + 1;
    return acc;
  }, {});
  const mostChosenServiceId = Object.keys(serviceCounts).length > 0 
    ? Object.keys(serviceCounts).reduce((a, b) => serviceCounts[a] > serviceCounts[b] ? a : b) 
    : null;
  const mostChosenServiceName = mostChosenServiceId 
    ? services.find(s => s.id === mostChosenServiceId)?.name 
    : 'N/A';

  const handleStatusChange = (id, newStatus) => {
    setOrders(orders.map(order => order.id === id ? { ...order, status: newStatus } : order));
  };

  const handleAddService = () => alert('Add New Service Modal would open here.');
  const handleEditService = (id) => alert(`Edit Service ${id} modal would open here.`);
  const handleDeleteService = (id) => {
    if(window.confirm("Are you sure you want to delete this service?")) {
       setServices(services.filter(s => s.id !== id));
    }
  };

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
          <div className="nav-actions">
            {/* Logout button removed from here */}
          </div>
        </div>

        <div className="dashboard-content">
          {activeTab === 'dashboard' && (
            <div className="tab-content fade-in">
              <h1 className="page-title">Admin Overview</h1>
              <div className="stats-grid">
                <div className="stat-card no-hover"><p>Total Revenue</p><div className="stat-bottom"><h2>₱{totalRevenue}</h2><span className="stat-icon">💰</span></div></div>
                <div className="stat-card no-hover"><p>Total Requests</p><div className="stat-bottom"><h2>{totalRequests}</h2><span className="stat-icon">📋</span></div></div>
                <div className="stat-card no-hover"><p>Most Chosen Service</p><div className="stat-bottom"><h2 style={{fontSize: '18px'}}>{mostChosenServiceName}</h2><span className="stat-icon">🏆</span></div></div>
              </div>

              <h3 className="section-title">Order Status Summary</h3>
              <div className="status-summary-grid">
                <div className="status-box pending no-hover"><h4>{pendingCount}</h4><p>Pending</p></div>
                <div className="status-box ongoing no-hover"><h4>{ongoingCount}</h4><p>Ongoing</p></div>
                <div className="status-box done no-hover"><h4>{doneCount}</h4><p>Done</p></div>
                <div className="status-box canceled no-hover"><h4>{cancelledCount}</h4><p>Cancelled</p></div>
              </div>

              <h3 className="section-title" style={{ marginTop: '30px' }}>Customer Requests</h3>
              <div className="orders-list">
                {orders.map((order) => (
                  <div key={order.id} className="order-row no-hover" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                      <div className="order-info">
                        <h4>{order.customerName} ({order.id})</h4>
                        <p>{order.weight} kg • {services.find(s => s.id === order.serviceId)?.name}</p>
                        <p style={{ fontSize: '11px', color: '#6b7280' }}>Date: {order.date} • Total: ₱{order.price}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <select className={`status-select ${order.status.toLowerCase()}`} value={order.status} onChange={(e) => handleStatusChange(order.id, e.target.value)}>
                          <option value="Pending">Pending</option>
                          <option value="Ongoing">Ongoing</option>
                          <option value="Done">Done</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'services' && (
            <div className="tab-content fade-in">
              <div className="admin-services-header">
                <div>
                  <h1 className="page-title" style={{ marginBottom: '4px' }}>Manage Services</h1>
                  <p style={{ color: '#6b7280', fontSize: '14px' }}>Add, edit, or remove laundry services and pricing.</p>
                </div>
                <button className="btn-blue" onClick={handleAddService}>+ Add New Service</button>
              </div>

              <div className="admin-services-grid">
                {services.map((service) => (
                  <div key={service.id} className="admin-service-card">
                    <div className="service-icon">{service.icon}</div>
                    <h4>{service.name}</h4>
                    <p className="service-desc">{service.desc}</p>
                    <div className="service-price-row">
                      <span className="service-price">₱{service.price}</span>
                      <span className="service-unit">{service.unit}</span>
                    </div>
                    <div className="admin-action-row">
                      <button className="admin-edit-btn" onClick={() => handleEditService(service.id)}>Edit</button>
                      <button className="admin-delete-btn" onClick={() => handleDeleteService(service.id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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
              
              <h1 className="page-title" style={{ marginTop: '30px' }}>User Feedback</h1>
              <div className="orders-list">
                {feedbacks.map(fb => (
                  <div key={fb.id} className="order-row no-hover">
                    <div>
                      <h4>{fb.user} <span style={{fontSize: '12px', color: '#6b7280'}}>({fb.type})</span></h4>
                      <p>{fb.text}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{color: '#f59e0b', fontWeight: 'bold'}}>{'⭐'.repeat(fb.rating)}</p>
                      <span style={{fontSize: '11px', color: '#9ca3af'}}>{fb.date}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Moved Logout Button to the very bottom */}
              <div className="logout-container">
                <button onClick={() => navigate('/login')} className="logout-btn-full">Logout</button>
              </div>

            </div>
          )}
        </div>
      </div>

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

export default AdminDashboard;