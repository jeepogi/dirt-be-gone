import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import AdminDashboard from './pages/AdminDashboard';
import CustomerDashboard from './pages/CustomerDashboard';

function App() {
  
  const [services, setServices] = useState([
    { id: 's1', name: 'Wash Only', price: 100, unit: 'per 8 kg', icon: '🫧', desc: 'Washing clothes. Drying and folding not included.' },
    { id: 's2', name: 'Dry Only', price: 100, unit: 'per 8 kg', icon: '🌀', desc: 'Machine drying for washed clothes.' },
    { id: 's3', name: 'Wash, Dry & Fold', price: 180, unit: 'per 8 kg', icon: '👕', desc: 'Complete laundry service with folding.' },
    { id: 's4', name: 'Ironing Service', price: 15, unit: 'per piece', icon: '♨️', desc: 'Ironing clothes to remove wrinkles.' },
  ]);

  const [orders, setOrders] = useState([
    { id: '#L-001', customerName: 'Alex Trie', serviceId: 's3', weight: 5, price: 90, addons: ['express'], status: 'Pending', date: new Date().toLocaleDateString() },
    { id: '#L-002', customerName: 'Jerome Bell', serviceId: 's1', weight: 10, price: 125, addons: [], status: 'Ongoing', date: new Date().toLocaleDateString() },
    { id: '#L-003', customerName: 'Annette Black', serviceId: 's2', weight: 3, price: 37.5, addons: ['pickup'], status: 'Done', date: new Date().toLocaleDateString() },
  ]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/SignIn" replace />} />
        <Route path="/SignIn" element={<SignIn />} />
        <Route path="/SignUp" element={<SignUp />} />
        
        {/* Admin & Staff Route */}
        <Route 
          path="/staff-dashboard" 
          element={<AdminDashboard services={services} setServices={setServices} orders={orders} setOrders={setOrders} />} 
        />
        
        {/* Customer Route */}
        <Route 
          path="/customer-dashboard" 
          element={<CustomerDashboard services={services} setServices={setServices} orders={orders} setOrders={setOrders} />} 
        />
      </Routes>
    </Router>
  );
}

export default App;