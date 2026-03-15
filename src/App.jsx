import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Navbar, Button } from 'react-bootstrap';
import { Languages, ShieldCheck, Home } from 'lucide-react';
import logo from './assets/logo.png';
import PublicForm from './pages/PublicForm';
import AdminDashboard from './pages/AdminDashboard';
import './index.css';

function AppLayout() {
  const [lang, setLang] = useState('en');
  const location = useLocation();
  const isAdmin = location.pathname.includes('/admin');

  const toggleLanguage = () => {
    setLang(prev => (prev === 'en' ? 'te' : 'en'));
  };

  return (
    <div className="app-main-wrapper">
      <Navbar className="temple-navbar d-flex justify-content-between px-2 px-md-4 no-print border-bottom" sticky="top">
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="brand-container pe-auto" style={{cursor: 'pointer'}}>
            <img src={logo} alt="Temple Logo" className="temple-logo" />
            <div className="brand-text d-none d-sm-flex">
              <h1 className="temple-header">
                {lang === 'en' ? 'Sri Satyanarayan Swami Temple' : 'శ్రీ సత్యనారాయణ స్వామి దేవస్థానం'}
              </h1>
              <p className="temple-subheader">
                {lang === 'en' ? 'Pooja Booking Application' : 'పూజా బుకింగ్'}
              </p>
            </div>
          </div>
        </Link>
        <div className="d-flex gap-2 gap-sm-3 align-items-center">
          {!isAdmin ? (
            <>
              <Button
                variant="outline-dark"
                size="sm"
                onClick={toggleLanguage}
                className="d-flex align-items-center gap-1 gap-sm-2 fw-semibold"
                style={{ borderRadius: '8px', padding: '6px 12px' }}
              >
                <Languages size={18} />
                <span className="d-none d-sm-inline">{lang === 'en' ? 'తెలుగు (Telugu)' : 'English'}</span>
              </Button>
            </>
          ) : (
             <Link to="/">
                <Button variant="outline-primary" size="sm" className="d-flex align-items-center gap-2 fw-semibold border-2 bg-white" style={{color: 'var(--primary-color)', borderColor: 'var(--primary-hover)'}}>
                  <Home size={18} />
                  <span className="d-none d-sm-inline">Temple Booking</span>
                </Button>
              </Link>
          )}
        </div>
      </Navbar>
      
      <Routes>
        <Route path="/" element={<PublicForm lang={lang} toggleLanguage={toggleLanguage} />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;

