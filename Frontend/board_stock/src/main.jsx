import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.jsx';
import Dashboard from './admin/dashboard.jsx';
import ManageUser from './admin/manageUser.jsx';
import ManageBoard from './admin/manageBoard.jsx';
import UserDashboard from './user/userDashboard.jsx';
import History from './user/history.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/manageUser" element={<ManageUser />} />
        <Route path="/admin/manageBoard" element={<ManageBoard />} />
        <Route path="/user/userDashboard" element={<UserDashboard />} />
        <Route path="/user/history" element={<History />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
