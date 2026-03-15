import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Form, InputGroup, Button } from 'react-bootstrap';
import { Search, Download, TrendingUp, Calendar, Filter } from 'lucide-react';
import { getBookings } from '../services/db';
import { poojas } from '../utils/constants';

function AdminDashboard() {
  const [allBookings, setAllBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [totalCollections, setTotalCollections] = useState(0);

  // Filters
  const [searchMobile, setSearchMobile] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [selectedPooja, setSelectedPooja] = useState('');

  useEffect(() => {
    // Load data from mock DB
    const data = getBookings();
    // Sort by timestamp desc
    data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    setAllBookings(data);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [allBookings, searchMobile, selectedMonth, selectedPooja]);

  const applyFilters = () => {
    let filtered = [...allBookings];

    if (searchMobile) {
      filtered = filtered.filter(b => b.mobile && b.mobile.includes(searchMobile));
    }

    if (selectedMonth) {
      filtered = filtered.filter(b => {
        // b.timestamp is ISO string
        if (!b.timestamp) return false;
        return b.timestamp.startsWith(selectedMonth);
      });
    }

    if (selectedPooja) {
      filtered = filtered.filter(b => b.pooja === selectedPooja);
    }

    setFilteredBookings(filtered);

    // Calculate sum
    const total = filtered.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    setTotalCollections(total);
  };

  const exportToCSV = () => {
    if (filteredBookings.length === 0) {
      alert("No data to export");
      return;
    }

    const headers = ["TXN ID", "Date", "Devotee Name", "Mobile", "Gothram", "Nakshatram", "Raasi", "Pooja", "Amount", "Status"];
    const rows = filteredBookings.map(b => [
      b.transactionId,
      new Date(b.timestamp).toLocaleString(),
      b.name,
      b.mobile || '',
      b.gothram || '',
      b.nakshatram || '',
      b.raasi || '',
      b.poojaName || b.pooja,
      b.amount,
      b.payment_status
    ]);

    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.map(cell => `"${cell}"`).join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Temple_Report_${selectedMonth || 'All'}.csv`);
    document.body.appendChild(link); // Required for FF
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="temple-header mb-1">Admin Dashboard</h2>
          <p className="text-muted mb-0">Manage bookings & generating reports</p>
        </div>
        <Button variant="outline-success" className="d-flex gap-2 align-items-center" onClick={exportToCSV}>
          <Download size={18} />
          Export CSV
        </Button>
      </div>

      <Row className="mb-4">
        <Col md={4}>
          <Card className="border-0 shadow-sm" style={{ backgroundColor: 'var(--primary-light)' }}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1 text-uppercase fw-bold" style={{ fontSize: '0.8rem' }}>Total Collections (Filtered)</p>
                  <h3 className="mb-0 text-success fw-bold">₹{totalCollections.toLocaleString()}</h3>
                </div>
                <div className="bg-white p-3 rounded-circle shadow-sm">
                  <TrendingUp color="#198754" size={24} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1 text-uppercase fw-bold" style={{ fontSize: '0.8rem' }}>Total Bookings</p>
                  <h3 className="mb-0 fw-bold">{filteredBookings.length}</h3>
                </div>
                <div className="bg-light p-3 rounded-circle shadow-sm">
                  <Calendar color="#666" size={24} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text className="bg-white border-end-0">
                  <Search size={18} className="text-muted" />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search by Mobile No..."
                  className="border-start-0 ps-0"
                  value={searchMobile}
                  onChange={(e) => setSearchMobile(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text className="bg-white border-end-0">
                  <Calendar size={18} className="text-muted" />
                </InputGroup.Text>
                <Form.Control
                  type="month"
                  className="border-start-0 ps-0"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text className="bg-white border-end-0">
                  <Filter size={18} className="text-muted" />
                </InputGroup.Text>
                <Form.Select 
                  className="border-start-0 ps-0"
                  value={selectedPooja}
                  onChange={(e) => setSelectedPooja(e.target.value)}
                >
                  <option value="">All Poojas</option>
                  {poojas.map(p => (
                    <option key={p.id} value={p.id}>{p.en}</option>
                  ))}
                </Form.Select>
              </InputGroup>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-bottom-0 py-3">
          <h5 className="mb-0 fw-bold">Recent Bookings</h5>
        </Card.Header>
        <div className="table-responsive">
          <Table hover className="mb-0 align-middle">
            <thead className="bg-light">
              <tr>
                <th className="border-0">TXN ID</th>
                <th className="border-0">Date</th>
                <th className="border-0">Devotee</th>
                <th className="border-0">Mobile</th>
                <th className="border-0">Pooja</th>
                <th className="border-0 text-end">Amount</th>
                <th className="border-0 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.length > 0 ? filteredBookings.map((b, idx) => (
                <tr key={idx}>
                  <td>
                    <span className="fw-mono" style={{fontFamily: 'monospace', fontSize: '0.9rem'}}>{b.transactionId}</span>
                  </td>
                  <td>
                    <div className="d-flex flex-column">
                      <span>{new Date(b.timestamp).toLocaleDateString()}</span>
                      <span className="text-muted" style={{fontSize: '0.8rem'}}>{new Date(b.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </td>
                  <td className="fw-semibold">{b.name}</td>
                  <td>{b.mobile || '-'}</td>
                  <td>
                    <span className="badge bg-light text-dark border">{b.poojaName || b.pooja}</span>
                  </td>
                  <td className="text-end fw-bold">₹{b.amount}</td>
                  <td className="text-center">
                    <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1">
                      {b.payment_status}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">
                    No bookings found for selected criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </Card>
    </Container>
  );
}

export default AdminDashboard;
