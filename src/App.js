// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';

import Home from './pages/Home/Home';
import AgendarDemo from './pages/Home/sections/Demo/AgendarDemo'; // ajuste conforme seu arquivo real
import Header from './components/Header/Header';

import './styles/global.css';

const LayoutWithHeader = () => (
  <>
    <Header />
    <main>
      <Outlet />
    </main>
  </>
);

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          {/* rotas que usam header/layout */}
          <Route element={<LayoutWithHeader />}>
            <Route path="/" element={<Home />} />
            {/* outras páginas que precisam do header */}
          </Route>

          {/* rota que NÃO deve exibir o Header (AgendarDemo) */}
          <Route path="/demo/agendar-demo" element={<AgendarDemo />} />

          {/* rota catch-all / 404 etc (adicione se quiser) */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
