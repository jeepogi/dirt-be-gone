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
  { id: 7, url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zoe&backgroundColor=ffdfbf' },
  { id: 8, url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Malik&backgroundColor=ffd5dc' },
  { id: 9, url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chloe&backgroundColor=ffdfbf' },
  { id: 10, url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver&backgroundColor=c0aede' },
  { id: 11, url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Arthur&backgroundColor=b6e3f4' },
  { id: 12, url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mia&backgroundColor=d1d4f9' },
];

// --- DEFAULT SERVICES DATA ---
const initialServices = [
  { id: 's1', name: 'Wash Only', icon: '🫧', price: 100, unit: 'per 8 kg', desc: 'Washing clothes using detergent and water. Drying and folding are not included.' },
  { id: 's2', name: 'Dry Only', icon: '🌀', price: 100, unit: 'per 8 kg', desc: 'Machine drying for washed clothes.' },
  { id: 's3', name: 'Wash, Dry & Fold', icon: '👕', price: 180, unit: 'per 8 kg', desc: 'Complete laundry service that includes washing, drying, and neatly folding clothes.' },
  { id: 's4', name: 'Ironing Service', icon: '♨️', price: 15, unit: 'per piece', desc: 'Ironing clothes to remove wrinkles and keep them neat.' },
  { id: 's5', name: 'Bedsheet Washing', icon: '🛏️', price: 100, unit: 'per piece', desc: 'Washing bedsheets and pillowcases.' },
  { id: 's6', name: 'Blanket Washing', icon: '🧣', price: 150, unit: 'per piece', desc: 'Washing blankets to remove dirt and odors.' },
  { id: 's7', name: 'Comforter Washing', icon: '☁️', price: 180, unit: 'per piece', desc: 'Cleaning bulky comforters and bedding.' },
  { id: 's8', name: 'Curtain Washing', icon: '🪟', price: 100, unit: 'per piece', desc: 'Washing curtains to remove dust and dirt.' },
  { id: 's9', name: 'Dry Cleaning', icon: '🧥', price: 100, unit: 'starting per piece', desc: 'Specialized cleaning for garments that require special care.' },
  { id: 's10', name: 'Express Laundry', icon: '⚡', price: 50, unit: 'additional per load', desc: 'Priority laundry service for customers who need their clothes sooner.' },
];

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();
  const location = useLocation();

  const initialName = location.state?.name || 'User';
  const initialEmail = location.state?.email || 'user@example.com';
  const initialRole = location.state?.role || 'Customer';

  // --- PROFILE STATE ---
  const [profileData, setProfileData] = useState({
    name: initialName,
    email: initialEmail,
    role: initialRole,
    phone: '639171234567', 
    photo: avatarOptions[1].url 
  });

  const [formData, setFormData] = useState({ ...profileData });
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [tempAvatar, setTempAvatar] = useState(profileData.photo);

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handlePhoneChange = (value) => setFormData({ ...formData, phone: value });
  const openAvatarModal = () => { setTempAvatar(formData.photo); setIsAvatarModalOpen(true); };
  const saveAvatar = () => { setFormData({ ...formData, photo: tempAvatar }); setProfileData({ ...profileData, photo: tempAvatar }); setIsAvatarModalOpen(false); };
  const handleProfileSubmit = (e) => { e.preventDefault(); setProfileData(formData); alert('Profile updated successfully!'); };

  // --- ORDERS STATE ---
  const [orders, setOrders] = useState([
    { id: '#L-001', customer: 'Alex Trie', type: 'Wash & Dry', weight: '5kg', status: 'Pending' },
    { id: '#L-002', customer: 'Jerome Bell', type: 'Dry Clean', weight: '2kg', status: 'Ongoing' },
    { id: '#L-003', customer: 'Annette Black', type: 'Express', weight: '3kg', status: 'Done' },
  ]);
  const handleLogout = () => navigate('/login');
  const handleStatusChange = (id, newStatus) => setOrders(orders.map(order => order.id === id ? { ...order, status: newStatus } : order));

  const totalRequests = orders.length;
  const pendingCount = orders.filter(o => o.status === 'Pending').length;
  const ongoingCount = orders.filter(o => o.status === 'Ongoing').length;
  const doneCount = orders.filter(o => o.status === 'Done').length;
  const cancelledCount = orders.filter(o => o.status === 'Cancelled').length;

  // --- SERVICES MANAGEMENT STATE (ADMIN/STAFF) ---
  const [services, setServices] = useState(initialServices);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  
  // Form state for adding/editing service
  const [serviceForm, setServiceForm] = useState({
    name: '', icon: '🧺', price: '', unit: 'per piece', desc: ''
  });

  const openAddService = () => {
    setEditingService(null);
    setServiceForm({ name: '', icon: '🧺', price: '', unit: 'per piece', desc: '' });
    setIsServiceModalOpen(true);
  };

  const openEditService = (service) => {
    setEditingService(service);
    setServiceForm({ ...service });
    setIsServiceModalOpen(true);
  };

  const handleDeleteService = (id) => {
    if(window.confirm("Are you sure you want to delete this service?")) {
      setServices(services.filter(s => s.id !== id));
    }
  };

  const handleSaveService = (e) => {
    e.preventDefault();
    if (editingService) {
      // Update existing
      setServices(services.map(s => s.id === editingService.id ? { ...serviceForm, id: s.id } : s));
    } else {
      // Add new
      const newService = { ...serviceForm, id: 's' + Date.now() };
      setServices([...services, newService]);
    }
    setIsServiceModalOpen(false);
  };

  // Check permissions
  const isAdminOrStaff = profileData.role === 'Admin' || profileData.role === 'Staff';

  return (
    <div className="dashboard-container">
      <div className="dashboard-glass">
        
        {/* --- TOP NAVIGATION BAR --- */}
        <div className="dashboard-nav">
          <div className="nav-brand">
            <img src={Logo} alt="Laundry Logo" style={{ height: '35px', objectFit: 'contain' }} />
            <span style={{ fontSize: '20px', fontWeight: '700', color: '#111827' }}>Dirt Be Gone</span>
          </div>
          
          <div className="nav-links">
            <span onClick={() => setActiveTab('dashboard')} className={activeTab === 'dashboard' ? 'active' : ''}>Dashboard</span>
            
            {/* Only show Services if Admin or Staff */}
            {isAdminOrStaff && (
              <span onClick={() => setActiveTab('services')} className={activeTab === 'services' ? 'active' : ''}>Services</span>
            )}
            
            <span onClick={() => setActiveTab('profile')} className={activeTab === 'profile' ? 'active' : ''}>Profile</span>
          </div>

          <div className="nav-actions">
            <div className="nav-avatar" onClick={() => setActiveTab('profile')} style={{ cursor: 'pointer', overflow: 'hidden' }}>
              <img src={profileData.photo} alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>
        </div>

        {/* --- MAIN CONTENT AREA --- */}
        <div className="dashboard-content">
          
          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <div className="tab-content fade-in">
              <h1 className="page-title">Dashboard Overview</h1>
              
              <div className="stats-grid">
                <div className="stat-card no-hover">
                  <p>Total Revenue</p>
                  <div className="stat-bottom"><h2>₱2,450</h2><span className="stat-icon">💰</span></div>
                </div>
                <div className="stat-card no-hover">
                  <p>Most Chosen Service</p>
                  <div className="stat-bottom"><h2 style={{ fontSize: '24px' }}>Wash & Dry</h2><span className="stat-icon">👕</span></div>
                </div>
                <div className="stat-card no-hover">
                  <p>Total Requests Today</p>
                  <div className="stat-bottom"><h2>{totalRequests}</h2><span className="stat-icon">📋</span></div>
                </div>
              </div>

              <h3 className="section-title">Order Status Summary</h3>
              <div className="status-summary-grid">
                <div className="status-box pending no-hover"><h4>{pendingCount}</h4><p>Pending</p></div>
                <div className="status-box ongoing no-hover"><h4>{ongoingCount}</h4><p>Ongoing</p></div>
                <div className="status-box done no-hover"><h4>{doneCount}</h4><p>Done</p></div>
                <div className="status-box canceled no-hover"><h4>{cancelledCount}</h4><p>Cancelled</p></div>
              </div>

              <h3 className="section-title" style={{ marginTop: '30px' }}>Recent Laundry Requests</h3>
              <div className="orders-list">
                {orders.map((order) => (
                  <div key={order.id} className="order-row no-hover">
                    <div className="order-info">
                      <h4>{order.customer}</h4>
                      <p>{order.id} • {order.type} • {order.weight}</p>
                    </div>
                    <div className="order-action">
                      <select className={`status-select ${order.status.toLowerCase()}`} value={order.status} onChange={(e) => handleStatusChange(order.id, e.target.value)}>
                        <option value="Pending">Pending</option>
                        <option value="Ongoing">Ongoing</option>
                        <option value="Done">Done</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SERVICES TAB (ADMIN/STAFF ONLY) */}
          {activeTab === 'services' && isAdminOrStaff && (
            <div className="tab-content fade-in">
              <div className="services-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h1 className="page-title" style={{ marginBottom: '5px' }}>Manage Services</h1>
                  <p className="subtitle">Add, edit, or remove laundry services and pricing.</p>
                </div>
                <button className="btn-blue" onClick={openAddService} style={{ padding: '10px 20px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>+</span> Add New Service
                </button>
              </div>

              {/* Service Management Grid */}
              <div className="services-grid" style={{ marginTop: '20px' }}>
                {services.map((service) => (
                  <div key={service.id} className="service-card glass-panel no-hover">
                    <div className="service-icon">{service.icon}</div>
                    <h4>{service.name}</h4>
                    <p className="service-desc">{service.desc}</p>
                    <div className="service-price-row">
                      <span className="service-price">₱{service.price}</span>
                      <span className="service-unit">{service.unit}</span>
                    </div>
                    
                    {/* Admin Action Buttons */}
                    <div className="admin-action-row">
                      <button className="admin-edit-btn" onClick={() => openEditService(service)}>Edit</button>
                      <button className="admin-delete-btn" onClick={() => handleDeleteService(service.id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="tab-content fade-in profile-section">
              <div className="profile-header-row">
                <h1 className="page-title" style={{ margin: 0 }}>Edit User Profile</h1>
              </div>

              <div className="profile-card glass-panel no-hover" style={{ padding: '15px' }}>
                <div className="photo-upload-area">
                  <div className="avatar-container">
                    <div className="profile-avatar-large">
                      <img src={formData.photo} alt="User Avatar" />
                    </div>
                    <div className="edit-pen-btn" onClick={openAvatarModal}>✎</div>
                  </div>
                  <div className="photo-actions">
                    <h3>{formData.name}</h3>
                    <span className={`role-badge role-${formData.role.toLowerCase()}`}>{formData.role}</span>
                    <p style={{ marginTop: '4px' }}>Click the pen icon to choose an avatar.</p>
                  </div>
                </div>
              </div>

              <form className="profile-card glass-panel no-hover" onSubmit={handleProfileSubmit} style={{ padding: '15px' }}>
                <h3 className="card-title">Personal information</h3>
                
                <div className="form-group">
                  <label>Full Name</label>
                  <div className="input-with-icon">
                    <span className="icon">👤</span>
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
                  </div>
                </div>

                <div className="form-group">
                  <label>Email address</label>
                  <div className="input-with-icon">
                    <span className="icon">✉️</span>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
                  </div>
                </div>

                <div className="form-group">
                  <label>Mobile number</label>
                  <PhoneInput
                    country={'ph'} value={formData.phone} onChange={handlePhoneChange} format={null} 
                    inputStyle={{ width: '100%', height: '38px', borderRadius: '8px', border: '1px solid #9ca3af', fontFamily: 'Poppins, sans-serif', fontSize: '13px', paddingLeft: '48px', paddingRight: '10px' }}
                    buttonStyle={{ borderRadius: '8px 0 0 8px', border: '1px solid #9ca3af', borderRight: 'none', backgroundColor: '#f3f4f6', padding: '0 6px' }}
                    containerStyle={{ width: '100%' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <button type="submit" className="btn-blue" style={{ padding: '10px 20px', fontSize: '13px' }}>Submit Changes</button>
                </div>
              </form>

              <div className="logout-container">
                <button onClick={handleLogout} className="logout-btn-full">Logout</button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* --- AVATAR SELECTION MODAL --- */}
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

      {/* --- ADD/EDIT SERVICE MODAL --- */}
      {isServiceModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ textAlign: 'left', maxWidth: '400px' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
              {editingService ? 'Edit Service' : 'Add New Service'}
            </h2>
            <form onSubmit={handleSaveService}>
              <div className="form-group">
                <label>Service Name</label>
                <input type="text" value={serviceForm.name} onChange={(e) => setServiceForm({...serviceForm, name: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
              </div>
              <div className="form-group" style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label>Price (₱)</label>
                  <input type="number" value={serviceForm.price} onChange={(e) => setServiceForm({...serviceForm, price: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label>Unit</label>
                  <input type="text" value={serviceForm.unit} onChange={(e) => setServiceForm({...serviceForm, unit: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }} placeholder="e.g. per piece" />
                </div>
              </div>
              <div className="form-group">
                <label>Icon (Emoji)</label>
                <input type="text" value={serviceForm.icon} onChange={(e) => setServiceForm({...serviceForm, icon: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={serviceForm.desc} onChange={(e) => setServiceForm({...serviceForm, desc: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', minHeight: '80px', fontFamily: 'Poppins' }} />
              </div>
              
              <div className="modal-actions" style={{ marginTop: '20px' }}>
                <button type="button" className="cancel-btn" onClick={() => setIsServiceModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-blue">Save Service</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;