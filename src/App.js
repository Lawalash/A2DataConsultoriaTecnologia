// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';

import Header from './components/Header/Header';
import WhatsAppFloat from './components/WhatsAppFloat/WhatsAppFloat';

import Home from './pages/Home/Home';
import SolutionPage from './pages/Solutions/SolutionPage';
import CasePage from './pages/Cases/CasePage';
import AdminPanel from './pages/Admin/AdminPanel';

import './styles/global.css';

// Layout with Header + WhatsApp float for public pages
const PublicLayout = () => (
  <>
    <Header />
    <main>
      <Outlet />
    </main>
    <WhatsAppFloat />
  </>
);

// Admin layout (no header/footer/float)
const AdminLayout = () => (
  <Outlet />
);

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          {/* Public routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/solucoes/:slug" element={<SolutionPage />} />
            <Route path="/cases/:slug" element={<CasePage />} />
          </Route>

          {/* Admin route (own layout) */}
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminPanel />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
