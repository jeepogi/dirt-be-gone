import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import SignUp from './SignUp';
import AdminDashboard from './AdminDashboard';
import CustomerDashboard from './CustomerDashboard';

function App() {
  // --- SHARED DATABASE STATE ---
  // Default Services
  const [services, setServices] = useState([
    { id: 's1', name: 'Wash Only', price: 100, unit: 'per 8 kg', icon: '🫧', desc: 'Washing clothes. Drying and folding not included.' },
    { id: 's2', name: 'Dry Only', price: 100, unit: 'per 8 kg', icon: '🌀', desc: 'Machine drying for washed clothes.' },
    { id: 's3', name: 'Wash, Dry & Fold', price: 180, unit: 'per 8 kg', icon: '👕', desc: 'Complete laundry service with folding.' },
    { id: 's4', name: 'Ironing Service', price: 15, unit: 'per piece', icon: '♨️', desc: 'Ironing clothes to remove wrinkles.' },
  ]);

  // Default Orders (Simulating customer requests)
  const [orders, setOrders] = useState([
    { id: '#L-001', customerName: 'Alex Trie', serviceId: 's3', weight: 5, price: 90, addons: ['express'], status: 'Pending', date: new Date().toLocaleDateString() },
    { id: '#L-002', customerName: 'Jerome Bell', serviceId: 's1', weight: 10, price: 125, addons: [], status: 'Ongoing', date: new Date().toLocaleDateString() },
    { id: '#L-003', customerName: 'Annette Black', serviceId: 's2', weight: 3, price: 37.5, addons: ['pickup'], status: 'Done', date: new Date().toLocaleDateString() },
  ]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        
        {/* Admin & Staff Route */}
        <Route 
          path="/admin-dashboard" 
          element={<AdminDashboard services={services} setServices={setServices} orders={orders} setOrders={setOrders} />} 
        />
        
        {/* Customer Route */}
        <Route 
          path="/customer-dashboard" 
          element={<CustomerDashboard services={services} orders={orders} setOrders={setOrders} />} 
        />
      </Routes>
    </Router>
  );
}

export default App;