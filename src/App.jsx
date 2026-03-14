import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Navbar } from 'react-bootstrap';
import { Printer, Edit3, CheckCircle, Languages } from 'lucide-react';
import './index.css';
import logo from './assets/logo.png'; // Make sure the logo is named correctly

const dictionaries = {
  en: {
    appTitle: "Sri Satyanarayan Swami Temple",
    appSubtitle: "Pooja Booking Application",
    name: "Devotee Name",
    mobile: "Mobile Number",
    gothram: "Gothram",
    nakshatram: "Nakshatram",
    raasi: "Raasi",
    date: "Date of Pooja",
    pooja: "Name of Pooja",
    amount: "Amount (₹)",
    submit: "Generate Receipt",
    edit: "Edit Details",
    print: "Print Receipt",
    selectPooja: "-- Select Pooja --",
    receiptTitle: "Seva Receipt",
    total: "Total Amount:"
  },
  te: {
    appTitle: "శ్రీ సత్యనారాయణ స్వామి దేవస్థానం",
    appSubtitle: "పూజా బుకింగ్",
    name: "భక్తుని పేరు",
    mobile: "మొబైల్ నంబర్",
    gothram: "గోత్రం",
    nakshatram: "నక్షత్రం",
    raasi: "రాశి",
    date: "పూజ తేదీ",
    pooja: "పూజ పేరు",
    amount: "మొత్తం (₹)",
    submit: "రసీదు సృష్టించండి",
    edit: "సవరించండి",
    print: "రసీదు ముద్రించండి",
    selectPooja: "-- పూజ ఎంచుకోండి --",
    receiptTitle: "సేవా రసీదు",
    total: "మొత్తం:"
  }
};

const poojas = [
  { id: 'archana', price: 10, en: 'Archana', te: 'అర్చన' },
  { id: 'nitya_archana', price: 300, en: 'Nitya Archana', te: 'నిత్య అర్చన' },
  { id: 'vratham', price: 400, en: 'Vratham', te: 'వ్రతం' }
];

function App() {
  const [lang, setLang] = useState('en');
  const [view, setView] = useState('form'); // 'form' or 'receipt'

  // Format today's date for default value in date picker
  const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    gothram: '',
    nakshatram: '',
    raasi: '',
    date: getTodayString(),
    pooja: '',
    amount: 0
  });

  const t = dictionaries[lang];

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Auto-update amount when pooja changes
    if (name === 'pooja') {
      const selectedPooja = poojas.find(p => p.id === value);
      setFormData({
        ...formData,
        [name]: value,
        amount: selectedPooja ? selectedPooja.price : 0
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.pooja || !formData.name) {
      alert("Please fill necessary details: Name & Pooja selection.");
      return;
    }
    setView('receipt');
  };

  const handlePrint = () => {
    window.print();
  };

  const getPoojaNameFromId = (id) => {
    if (!id) return '';
    const pooja = poojas.find(p => p.id === id);
    return pooja ? pooja[lang] : id;
  };

  const toggleLanguage = () => {
    setLang(prev => (prev === 'en' ? 'te' : 'en'));
  };

  return (
    <div className="app-main-wrapper">
      {/* Settings / Language Toggle Top Bar - Ignored in Print */}
      <Navbar className="temple-navbar d-flex justify-content-between px-4 no-print" sticky="top">
        <div className="brand-container">
          <img src={logo} alt="Temple Logo" className="temple-logo" />
          <div className="brand-text d-none d-sm-flex">
            <h1 className="temple-header">{t.appTitle}</h1>
            <p className="temple-subheader">{t.appSubtitle}</p>
          </div>
        </div>

        <Button
          variant="outline-dark"
          size="sm"
          onClick={toggleLanguage}
          className="d-flex align-items-center gap-2 fw-semibold"
          style={{ borderRadius: '8px', padding: '8px 16px' }}
        >
          <Languages size={18} />
          {lang === 'en' ? 'తెలుగు (Telugu)' : 'English'}
        </Button>
      </Navbar>

      <Container className="app-container main-content">
        {/* Mobile Header, shown only on small screens */}
        <div className="text-center d-sm-none mb-4 no-print">
          <img src={logo} alt="Temple Logo" className="temple-logo mb-3" style={{ height: '70px', width: '70px' }} />
          <h2 className="temple-header fs-4">{t.appTitle}</h2>
          <p className="temple-subheader">{t.appSubtitle}</p>
        </div>

        {view === 'form' ? (
          <div className="card-container">
            <Form onSubmit={handleSubmit}>
              <Row className="mb-4">
                <Col md={12}>
                  <Form.Group>
                    <Form.Label className="form-label">{t.name} <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter devotee name"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-4">
                <Col md={6} className="mb-3 mb-md-0">
                  <Form.Group>
                    <Form.Label className="form-label">{t.mobile}</Form.Label>
                    <Form.Control
                      type="tel"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleInputChange}
                      placeholder="10-digit mobile number"
                      pattern="[0-9]{10}"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="form-label">{t.date}</Form.Label>
                    <Form.Control
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-4">
                <Col md={4} className="mb-3 mb-md-0">
                  <Form.Group>
                    <Form.Label className="form-label">{t.gothram}</Form.Label>
                    <Form.Control
                      type="text"
                      name="gothram"
                      value={formData.gothram}
                      onChange={handleInputChange}
                      placeholder="e.g. Kashyapa"
                    />
                  </Form.Group>
                </Col>
                <Col md={4} className="mb-3 mb-md-0">
                  <Form.Group>
                    <Form.Label className="form-label">{t.nakshatram}</Form.Label>
                    <Form.Control
                      type="text"
                      name="nakshatram"
                      value={formData.nakshatram}
                      onChange={handleInputChange}
                      placeholder="e.g. Ashwini"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="form-label">{t.raasi}</Form.Label>
                    <Form.Control
                      type="text"
                      name="raasi"
                      value={formData.raasi}
                      onChange={handleInputChange}
                      placeholder="e.g. Mesha"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-5 align-items-end">
                <Col md={8} className="mb-3 mb-md-0">
                  <Form.Group>
                    <Form.Label className="form-label">{t.pooja} <span className="text-danger">*</span></Form.Label>
                    <Form.Select
                      name="pooja"
                      value={formData.pooja}
                      onChange={handleInputChange}
                      required
                      style={{ cursor: 'pointer' }}
                    >
                      <option value="">{t.selectPooja}</option>
                      {poojas.map(p => (
                        <option key={p.id} value={p.id}>
                          {p[lang]} (₹{p.price})
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="form-label opacity-75">{t.amount}</Form.Label>
                    <Form.Control
                      type="number"
                      name="amount"
                      value={formData.amount}
                      readOnly
                      style={{
                        backgroundColor: 'var(--primary-light)',
                        color: 'var(--primary-hover)',
                        fontWeight: '800',
                        fontSize: '1.2rem',
                        borderColor: 'transparent'
                      }}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <div className="d-grid mt-2">
                <Button type="submit" className="btn-primary-custom d-flex justify-content-center align-items-center gap-2" size="lg">
                  <CheckCircle size={22} />
                  {t.submit}
                </Button>
              </div>
            </Form>
          </div>
        ) : (
          <div className="receipt-wrapper">
            <div className="receipt-container">
              <div className="receipt-header-screen text-center">
                <img src={logo} alt="Logo" className="receipt-logo" />
                <h2 style={{ margin: '0 0 5px 0', color: 'var(--primary-hover)' }}>{t.appTitle}</h2>
                <h4 style={{ margin: '0', color: '#666', fontWeight: '500' }}>{t.receiptTitle}</h4>
              </div>

              <div className="receipt-body">
                <div className="receipt-item-screen">
                  <span className="label">{t.date}:</span>
                  <span className="value">
                    {new Date(formData.date).toLocaleDateString(lang === 'te' ? 'te-IN' : 'en-IN')}
                  </span>
                </div>
                <div className="receipt-item-screen">
                  <span className="label">{t.name}:</span>
                  <span className="value">{formData.name}</span>
                </div>
                {formData.mobile && (
                  <div className="receipt-item-screen">
                    <span className="label">{t.mobile}:</span>
                    <span className="value">{formData.mobile}</span>
                  </div>
                )}
                {formData.gothram && (
                  <div className="receipt-item-screen">
                    <span className="label">{t.gothram}:</span>
                    <span className="value">{formData.gothram}</span>
                  </div>
                )}
                {(formData.nakshatram || formData.raasi) && (
                  <div className="receipt-item-screen">
                    <span className="label">
                      {formData.nakshatram ? t.nakshatram : ''}
                      {formData.nakshatram && formData.raasi ? ` / ` : ''}
                      {formData.raasi ? t.raasi : ''}:
                    </span>
                    <span className="value">
                      {formData.nakshatram}
                      {formData.nakshatram && formData.raasi ? ` / ` : ''}
                      {formData.raasi}
                    </span>
                  </div>
                )}
                <div className="receipt-item-screen mt-2" style={{ borderTop: '2px dashed #eee', paddingTop: '15px' }}>
                  <span className="label">{t.pooja}:</span>
                  <span className="value" style={{ fontWeight: '800', color: 'var(--primary-color)', fontSize: '1.1rem' }}>
                    {getPoojaNameFromId(formData.pooja)}
                  </span>
                </div>

                <div className="receipt-total-screen">
                  <span>{t.total}</span>
                  <span>₹{formData.amount}</span>
                </div>

                {/* Only visible when printing, explicitly hidden on screen */}
                <div className="receipt-footer-print mt-3 text-center">
                  *** <br />
                  Date & Time: {new Date().toLocaleString(lang === 'te' ? 'te-IN' : 'en-IN')} <br />
                  Visit Again
                </div>
              </div>
            </div>

            <div className="print-buttons container mx-auto no-print">
              <Button
                variant="outline-secondary"
                onClick={() => setView('form')}
                className="d-flex align-items-center justify-content-center gap-2 flex-grow-1 fw-bold"
              >
                <Edit3 size={18} />
                {t.edit}
              </Button>
              <Button
                className="btn-primary-custom d-flex align-items-center justify-content-center gap-2 flex-grow-1"
                onClick={handlePrint}
              >
                <Printer size={18} />
                {t.print}
              </Button>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}

export default App;
