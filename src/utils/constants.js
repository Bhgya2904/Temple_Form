export const dictionaries = {
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
    submit: "Pay & Generate Receipt",
    edit: "Edit Details",
    print: "Print Receipt",
    selectPooja: "-- Select Pooja --",
    receiptTitle: "Seva Receipt",
    total: "Total Amount:",
    paymentMethod: "Payment Method",
    upi: "UPI",
    cash: "Cash"
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
    submit: "చెల్లించి రసీదు పొందండి",
    edit: "సవరించండి",
    print: "రసీదు ముద్రించండి",
    selectPooja: "-- పూజ ఎంచుకోండి --",
    receiptTitle: "సేవా రసీదు",
    total: "మొత్తం:",
    paymentMethod: "చెల్లింపు విధానం",
    upi: "UPI",
    cash: "నగదు"
  }
};

export const poojas = [
  { id: 'archana', price: 10, en: 'Archana', te: 'అర్చన' },
  { id: 'nitya_archana', price: 300, en: 'Nitya Archana', te: 'నిత్య అర్చన' },
  { id: 'vratham', price: 400, en: 'Vratham', te: 'వ్రతం' },
  { id: 'donation', price: 0, en: 'Donation', te: 'విరాళం', isDynamic: true }
];
