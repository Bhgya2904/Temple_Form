import express from 'express';
import cors from 'cors';
import Razorpay from 'razorpay';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'dummy',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy',
});

// Razorpay Order Creation Endpoint
app.post('/api/create-order', async (req, res) => {
  const { amount, receipt } = req.body;
  if (!amount) {
    return res.status(400).json({ success: false, message: 'Amount is required' });
  }

  try {
    // Amount is expected in INR; Razorpay expects amount in paise
    const order = await razorpay.orders.create({
      amount: Math.round(Number(amount) * 100),
      currency: 'INR',
      receipt: receipt || `receipt_${Date.now()}`,
      payment_capture: 1,
    });

    res.json(order);
  } catch (error) {
    console.error('Razorpay order creation failed:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to create order' });
  }
});

// Android SMS Gateway Environment Configs
const ANDROID_SMS_GATEWAY_URL = process.env.ANDROID_SMS_GATEWAY_URL;
const ANDROID_SMS_API_KEY = process.env.ANDROID_SMS_API_KEY;

// Route to Send Receipt via Android SMS Gateway
app.post('/api/send-receipt', async (req, res) => {
  const { name, mobile, pooja, amount, receiptNumber, date } = req.body;

  if (!mobile) {
    return res.status(400).send({ success: false, message: "No mobile number provided" });
  }

  // Format the Indian mobile number
  const formattedMobile = mobile.startsWith('+') ? mobile : `+91${mobile}`;

  try {
    const messageBody = `Sri Satyanarayana Swamy Temple\n\nReceipt No: ${receiptNumber}\nName: ${name}\nPooja: ${pooja}\nAmount: ₹${amount}\nDate: ${date}\n\nYour pooja booking is confirmed.\n\nThank you 🙏`;

    if (ANDROID_SMS_GATEWAY_URL) {
      // Connects to a generic Android SMS Gateway App API (like 'SMS Gateway API' or local phone server)
      const response = await axios({
        method: "POST",
        url: ANDROID_SMS_GATEWAY_URL,
        data: {
          to: formattedMobile,
          message: messageBody,
          // Depending on the specific Android SMS app, they usually accept an API key in the body or headers
          key: ANDROID_SMS_API_KEY 
        },
        headers: {
          // Pass the API key in the headers as well, just in case the specific app requires it there
          "Authorization": ANDROID_SMS_API_KEY ? `Bearer ${ANDROID_SMS_API_KEY}` : '',
          "Content-Type": "application/json",
        },
      });
      console.log(`Android SMS successfully triggered for ${formattedMobile}. Note: Real delivery depends on mobile carrier.`);
      res.json({ success: true, message: "Triggered Android SMS Gateway" });
    } else {
      console.log(`Android SMS Gateway Simulated Printout:\nTo: ${formattedMobile}\nMessage:\n${messageBody}`);
      res.json({ success: true, message: "Simulated success (Missing ANDROID_SMS_GATEWAY_URL)" });
    }

  } catch (error) {
    console.error("Android SMS Gateway Trigger Failed:", error.message);
    res.status(500).json({ success: false, error: "Failed to trigger Android SMS" });
  }
});

// Simple test route
app.get('/', (req, res) => {
  res.send('Temple Backend APIs are running!');
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
