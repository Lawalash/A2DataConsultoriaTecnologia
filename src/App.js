// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';

import Home from './pages/Home/Home';
import AgendarDemo from './pages/Home/sections/Demo/AgendarDemo'; // ajuste conforme seu arquivo real
import Header from './components/Header/Header';
import Sidebar from './components/Sidebar/Sidebar';
import BackToTop from './components/BackToTop/BackToTop';
import WhatsAppFloat from './components/WhatsAppFloat/WhatsAppFloat';

import './styles/global.css';

const LayoutWithHeader = ({ toggleSidebar, isSidebarOpen, closeSidebar }) => (
  <>
    <Header toggleSidebar={toggleSidebar} />
    <Sidebar isOpen={isSidebarOpen} closeSidebar={closeSidebar} />
    <main>
      <Outlet />
    </main>
    {/* opcional: <BackToTop /> <WhatsAppFloat /> */}
  </>
);

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const toggleSidebar = () => setIsSidebarOpen(open => !open);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <Router>
      <div className="app">
        <Routes>
          {/* rotas que usam header/layout */}
          <Route element={<LayoutWithHeader toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} closeSidebar={closeSidebar} />}>
            <Route path="/" element={<Home />} />
            {/* outras páginas que precisam do header */}
          </Route>

          {/* rota que NÃO deve exibir o Header (AgendarDemo) */}
          <Route path="/demo/agendar-demo" element={<AgendarDemo />} />

          {/* rota catch-all / 404 etc */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
