import express from 'express';
import cors from 'cors';
import Razorpay from 'razorpay';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Route to Create Razorpay Order
app.post('/api/create-order', async (req, res) => {
  try {
    const { amount } = req.body;
    
    // Amount must be in subunits (Paise for INR, so multiply by 100)
    const options = {
      amount: parseInt(amount) * 100, 
      currency: "INR",
      receipt: `receipt_order_${Math.floor(Math.random() * 10000)}`,
    };

    const order = await razorpay.orders.create(options);
    
    if (!order) {
      return res.status(500).send("Error creating Razorpay Order");
    }

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error generating Razorpay Order");
  }
});

// Simple test route
app.get('/', (req, res) => {
  res.send('Temple Backend APIs are running!');
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
  console.log("Ensure you have created a .env file with RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET");
});
