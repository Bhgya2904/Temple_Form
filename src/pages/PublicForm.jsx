import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Spinner } from 'react-bootstrap';
import { Printer, Edit3, CheckCircle, Languages, IndianRupee } from 'lucide-react';
import { QRCodeSVG as QRCode } from 'qrcode.react';
import logo from '../assets/logo.png';
import { dictionaries, poojas } from '../utils/constants';
import { saveBooking } from '../services/db';

function PublicForm({ lang, toggleLanguage }) {
  const [view, setView] = useState('form'); // 'form' or 'receipt'
  const [isProcessing, setIsProcessing] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

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

  const [translatedData, setTranslatedData] = useState({
    name: '', gothram: '', nakshatram: '', raasi: ''
  });
  const [isTranslating, setIsTranslating] = useState(false);

  const t = dictionaries[lang];

  const transliterate = async (text) => {
    if (!text) return text;
    try {
      const response = await fetch(`https://inputtools.google.com/request?text=${encodeURIComponent(text)}&itc=te-t-i0-und&num=1&cp=0&cs=1&ie=utf-8`);
      const data = await response.json();
      if (data[0] === 'SUCCESS' && data[1] && data[1][0] && data[1][0][1] && data[1][0][1][0]) {
        return data[1][0][1][0];
      }
    } catch (err) {
      console.error('Translation failed', err);
    }
    return text;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.pooja || !formData.name) {
      alert("Please fill necessary details: Name & Pooja selection.");
      return;
    }

    setIsTranslating(true);
    const tName = await transliterate(formData.name);
    const tGothram = await transliterate(formData.gothram);
    const tNakshatram = await transliterate(formData.nakshatram);
    const tRaasi = await transliterate(formData.raasi);

    const translated = { name: tName, gothram: tGothram, nakshatram: tNakshatram, raasi: tRaasi };
    setTranslatedData(translated);
    setIsTranslating(false);

    // Switch to fake payment UPI QR View
    setView('payment');
  };

  const handleFakePaymentConfirm = async () => {
    setIsProcessing(true);
    setTimeout(async () => {
      setIsProcessing(false);
      
      const englishPoojaName = getPoojaNameFromId(formData.pooja, 'en');

      // Save to database
      const bookingRecord = await saveBooking({
        ...formData,
        translatedName: translatedData.name || formData.name, 
        poojaName: englishPoojaName,
        poojaNameTe: getPoojaNameFromId(formData.pooja, 'te'),
        payment_status: 'PAID'
      });

      // Try sending WhatsApp receipt in the background
      if (formData.mobile) {
         try {
           const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://temple-form.onrender.com';
           await fetch(`${backendUrl}/api/send-receipt`, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({
               mobile: formData.mobile,
               name: formData.name,
               gothram: formData.gothram,
               nakshatram: formData.nakshatram,
               raasi: formData.raasi,
               pooja: englishPoojaName,
               amount: formData.amount,
               receiptNumber: bookingRecord.transactionId,
               date: new Date(formData.date).toLocaleDateString()
             })
           });
         } catch(err) {
           console.error("WhatsApp trigger failed. Backend might be offline.", err);
         }
      }
      
      setReceiptData(bookingRecord);
      setView('receipt');
    }, 1500);
  };

  const handlePrint = () => {
    window.print();
  };

  const getPoojaNameFromId = (id, specificLang = lang) => {
    if (!id) return '';
    const pooja = poojas.find(p => p.id === id);
    return pooja ? pooja[specificLang] : id;
  };

  return (
    <Container className="app-container main-content">
      {/* Mobile Header */}
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
                    disabled={isProcessing}
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
                    disabled={isProcessing}
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
                    disabled={isProcessing}
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
                    disabled={isProcessing}
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
                    disabled={isProcessing}
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
                    disabled={isProcessing}
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
                    disabled={isProcessing}
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
              <Button type="submit" disabled={isTranslating || isProcessing} className="btn-primary-custom d-flex justify-content-center align-items-center gap-2" size="lg">
                {isProcessing ? (
                  <>
                    <Spinner animation="border" size="sm" /> 
                    {lang === 'te' ? 'ప్రాసెస్ చేయబడుతోంది...' : 'Processing Payment...'}
                  </>
                ) : (
                  <>
                    <IndianRupee size={22} />
                    {isTranslating ? (lang === 'te' ? 'అనువదిస్తోంది...' : 'Translating...') : t.submit}
                  </>
                )}
              </Button>
            </div>
          </Form>
        </div>
      ) : view === 'payment' ? (
        <div className="card-container text-center py-5">
          <h3 className="mb-4 fw-bold" style={{ color: 'var(--primary-color)' }}>
            {lang === 'te' ? 'చెల్లించడానికి స్కాన్ చేయండి' : 'Scan to Pay'}
          </h3>
          <p className="text-muted mb-4">
            {lang === 'te' 
              ? `దయచేసి పూజ కొరకు ₹${formData.amount} చెల్లించండి` 
              : `Please pay ₹${formData.amount} for ${getPoojaNameFromId(formData.pooja, lang)}`}
          </p>
          
          <div className="bg-white p-4 d-inline-block rounded-4 border shadow-sm mb-4">
            <QRCode 
              value={`upi://pay?pa=temple@upi&pn=SriSatyanarayanSwamiTemple&am=${formData.amount}&cu=INR`} 
              size={220} 
              level="H" 
            />
          </div>
          
          <div className="mb-4">
            <p className="mb-1 text-muted small text-uppercase fw-bold">UPI ID</p>
            <p className="fs-5" style={{fontFamily: 'monospace'}}>temple@upi</p>
          </div>
          
          <div className="d-grid mt-2 mx-auto" style={{ maxWidth: '300px' }}>
            <Button 
              onClick={handleFakePaymentConfirm} 
              disabled={isProcessing} 
              className="btn-primary-custom d-flex justify-content-center align-items-center gap-2" 
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Spinner animation="border" size="sm" /> 
                  {lang === 'te' ? 'ధృవీకరిస్తోంది...' : 'Verifying Payment...'}
                </>
              ) : (
                <>
                  <CheckCircle size={22} />
                  {lang === 'te' ? 'నేను చెల్లించాను' : 'I HAVE PAID'}
                </>
              )}
            </Button>
            <Button variant="link" className="mt-3 text-muted text-decoration-none" onClick={() => setView('form')} disabled={isProcessing}>
               {lang === 'te' ? 'వెనుకకు' : 'Cancel & Go Back'}
            </Button>
          </div>
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
                <span className="label">TXN ID:</span>
                <span className="value" style={{fontFamily: 'monospace', fontSize: '0.9rem'}}>{receiptData?.transactionId}</span>
              </div>
              <div className="receipt-item-screen">
                <span className="label">Status:</span>
                <span className="value text-success" style={{fontWeight: '800'}}>PAID</span>
              </div>
              <div className="receipt-item-screen mt-2" style={{ borderTop: '1px dashed #eee', paddingTop: '10px' }}>
                <span className="label">{t.date}:</span>
                <span className="value">
                  {new Date(formData.date).toLocaleDateString(lang === 'te' ? 'te-IN' : 'en-IN')}
                </span>
              </div>
              <div className="receipt-item-screen">
                <span className="label">{t.name}:</span>
                <span className="value">{lang === 'te' ? translatedData.name : formData.name}</span>
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
                  <span className="value">{lang === 'te' ? translatedData.gothram : formData.gothram}</span>
                </div>
              )}
              {formData.nakshatram && (
                <div className="receipt-item-screen">
                  <span className="label">{t.nakshatram}:</span>
                  <span className="value">{lang === 'te' ? translatedData.nakshatram : formData.nakshatram}</span>
                </div>
              )}
              {formData.raasi && (
                <div className="receipt-item-screen">
                  <span className="label">{t.raasi}:</span>
                  <span className="value">{lang === 'te' ? translatedData.raasi : formData.raasi}</span>
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
              
              {/* QR Code Section - Visible on screen, hidden in print */}
              <div className="text-center mt-4 no-print">
                <QRCode 
                  value={`TXN:${receiptData?.transactionId}|Pooja:${formData.pooja}|Amt:${formData.amount}`} 
                  size={100} 
                  level="L"
                  style={{border: '4px solid white', borderRadius: '4px', background: 'white', display: 'inline-block'}}
                />
                <p className="text-muted small mt-2 no-print">Scan to verify booking</p>
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
              onClick={() => {
                  setView('form');
                  // Do not reset form data completely so they don't have to re-enter everything
                  // except maybe we can leave it to just allow booking a different pooja easily
              }}
              className="d-flex align-items-center justify-content-center gap-2 flex-grow-1 fw-bold"
            >
              <Edit3 size={18} />
              New Booking
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
  );
}

export default PublicForm;
