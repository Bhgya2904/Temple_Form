// Utility to dynamically load Razorpay script
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    // If already loaded
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

export const initializeRazorpayPayment = async (amount, devoteeData, onSuccess, onError) => {
  const res = await loadRazorpayScript();

  if (!res) {
    alert("Razorpay SDK failed to load. Are you online?");
    if(onError) onError();
    return;
  }

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

  let order_id = null;
  try {
    const orderRes = await fetch(`${backendUrl}/api/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount })
    });
    
    if (!orderRes.ok) {
       throw new Error("Failed to create Razorpay Order");
    }
    
    const orderData = await orderRes.json();
    order_id = orderData.id;
  } catch(error) {
     console.error("Missing Backend for Razorpay:", error);
     alert("Error creating Payment Order. Backend might be down.");
     if (onError) onError();
     return;
  }

  const options = {
    key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Use the real key from .env
    amount: amount * 100,
    currency: "INR",
    name: "Sri Satyanarayan Swami Temple",
    description: `Pooja Booking: ${devoteeData.poojaName}`,
    image: "/src/assets/logo.png",
    order_id: order_id, // Passed from backend
    handler: function (response) {
      console.log("Payment Success:", response);
      // Validating signatures should happen on the backend, 
      // but for this flow we instantly pass to the success page
      onSuccess(response);
    },
    prefill: {
      name: devoteeData.name,
      contact: devoteeData.mobile,
    },
    theme: {
      color: "#f57c00", 
    },
  };

  const paymentObject = new window.Razorpay(options);
  
  paymentObject.on('payment.failed', function (response) {
      console.error("Payment Failed", response.error);
      alert("Payment failed! Reason: " + response.error.description);
      if(onError) onError();
  });

  paymentObject.open();
};
