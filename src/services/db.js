import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'temple_bookings';
const AZURE_WEBHOOK_URL = import.meta.env.VITE_AZURE_WEBHOOK_URL;

export const saveBooking = async (bookingData) => {
  const existing = getBookings();
  const txId = uuidv4().substring(0, 8).toUpperCase();
  const newBooking = {
    ...bookingData,
    id: uuidv4(),
    transactionId: `TXN-${txId}`,
    payment_status: 'PAID',
    timestamp: new Date().toISOString()
  };
  
  existing.push(newBooking);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));

  // If Azure Webhook is configured, send the record there automatically
  if (AZURE_WEBHOOK_URL) {
    try {
      await fetch(AZURE_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBooking)
      });
      console.log("Successfully synced booking to Azure!");
    } catch (err) {
      console.error("Failed to sync to Azure:", err);
    }
  }

  return newBooking;
};

export const getBookings = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};
