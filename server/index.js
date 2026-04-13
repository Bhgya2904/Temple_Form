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

// Environment Configs
const ANDROID_SMS_GATEWAY_URL = process.env.ANDROID_SMS_GATEWAY_URL;
const ANDROID_SMS_API_KEY = process.env.ANDROID_SMS_API_KEY;
const AZURE_WEBHOOK_URL = process.env.AZURE_WEBHOOK_URL;

// Route to Send Receipt & Sync to Azure
app.post('/api/send-receipt', async (req, res) => {
  const { name, mobile, pooja, amount, receiptNumber, date, gothram, nakshatram, raasi } = req.body;

  if (!mobile) {
    return res.status(400).send({ success: false, message: "No mobile number provided" });
  }

  // Format the Indian mobile number
  const formattedMobile = mobile.startsWith('+') ? mobile : `+91${mobile}`;

  try {
    const messageBody = `Sri Satyanarayana Swamy Temple\n\nReceipt No: ${receiptNumber}\nName: ${name}\nPooja: ${pooja}\nAmount: ₹${amount}\nDate: ${date}\n\nYour pooja booking is confirmed.\n\nThank you 🙏`;

    // 1. Push Data to Azure (Google Sheets / Excel)
    if (AZURE_WEBHOOK_URL) {
      try {
        await axios.post(AZURE_WEBHOOK_URL, {
          receiptNumber,
          date,
          name,
          mobile: formattedMobile,
          gothram: gothram || "N/A",
          nakshatram: nakshatram || "N/A",
          raasi: raasi || "N/A",
          pooja,
          amount,
          status: "PAID"
        });
        console.log("Data successfully synced to Azure/Sheets");
      } catch (azureErr) {
        console.error("Azure Sync Failed:", azureErr.message);
      }
    }

    // 2. Trigger Android SMS Gateway
    if (ANDROID_SMS_GATEWAY_URL) {
      await axios.post(ANDROID_SMS_GATEWAY_URL, {
        to: formattedMobile,
        message: messageBody,
        key: ANDROID_SMS_API_KEY 
      });
      console.log(`Android SMS triggered for ${formattedMobile}`);
    } else {
      console.log(`Simulated SMS for ${formattedMobile}:\n${messageBody}`);
    }

    res.json({ success: true, message: "Receipt processed and data synced to Azure" });

  } catch (error) {
    console.error("Operation Failed:", error.message);
    res.status(500).json({ success: false, error: "Operation failed" });
  }
});

// Simple test route
app.get('/', (req, res) => {
  res.send('Temple Backend APIs are running!');
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
