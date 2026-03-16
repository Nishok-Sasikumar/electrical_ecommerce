const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")
const Razorpay = require("razorpay")
const crypto = require("crypto")
const nodemailer = require("nodemailer")
const { initializeApp } = require("firebase/app")
const { getFirestore, collection, addDoc, getDocs, query, where, deleteDoc, doc } = require("firebase/firestore")
dotenv.config()

const app = express()

// Firebase Config
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyBHEifiVQdUG9Pddwd2A421qFdcK8x4w-4",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "sairam-69513.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "sairam-69513",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "sairam-69513.firebasestorage.app",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "138312958922",
  appId: process.env.FIREBASE_APP_ID || "1:138312958922:web:ef764aef8d097211034533"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error("FATAL ERROR: Razorpay keys are not defined in .env file.")
}

// Nodemailer Config
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

app.use(cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174", "http://localhost:5175", "http://127.0.0.1:5175", "https://con1-ten.vercel.app"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}))
app.use(express.json())

// Request Logger (Debug 404)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
  next()
})

// Root route
app.get("/", (req, res) => {
  res.json({ message: "Backend server is running. Use /api/* for API endpoints." })
})

// Health Check (Debug 404)
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is reachable!" })
})

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

// Razorpay: Create Order
app.post("/api/payment/order", async (req, res) => {
  try {
    const { amount, currency, receipt } = req.body
    
    if (!amount || !currency) {
      return res.status(400).json({ error: "Amount and currency are required" })
    }

    const options = {
      amount: Math.round(amount * 100), // Ensure it's an integer in paise
      currency,
      receipt,
    }

    console.log("Creating Razorpay order with options:", options)
    const order = await razorpay.orders.create(options)
    console.log("Razorpay order created:", order.id)
    res.json(order)
  } catch (err) {
    console.error("Razorpay Order Creation Error Details:", err)
    res.status(500).json({ 
      error: "Order creation failed", 
      details: err.message,
      code: err.code 
    })
  }
})

// Razorpay: Verify Signature
app.post("/api/payment/verify", (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body
  const body = razorpay_order_id + "|" + razorpay_payment_id
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex")

  if (expectedSignature === razorpay_signature) {
    res.json({ success: true, message: "Payment verified" })
  } else {
    res.status(400).json({ success: false, message: "Invalid signature" })
  }
})

// Admin Notification
app.post("/api/admin/notify-order", async (req, res) => {
  try {
    const orderData = req.body
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Notifying yourself
      subject: `New Order Received: #${orderData.orderId}`,
      html: `
        <h2>New Order from ${orderData.userName}</h2>
        <p>Email: ${orderData.userEmail}</p>
        <p>Phone: ${orderData.phone}</p>
        <p>Total Amount: ₹${orderData.totalPrice}</p>
        <p>Payment ID: ${orderData.paymentId}</p>
        <hr />
        <h4>Shipping Address:</h4>
        <p>${orderData.shippingAddress.address}, ${orderData.shippingAddress.city} - ${orderData.shippingAddress.zip}</p>
      `,
    }

    await transporter.sendMail(mailOptions)
    res.json({ success: true, message: "Admin notified" })
  } catch (err) {
    console.error("Admin notification error:", err)
    res.status(500).json({ error: "Notification failed" })
  }
})

// OTP: Send (Uses Firestore for Stateless/Serverless Storage)
app.post("/api/otp/send", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: "Email is required" });
  
  // Generate a random 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  
  try {
    // 1. Store OTP in Firestore with expiration (10 minutes)
    const expiration = Date.now() + 600000;
    await addDoc(collection(db, "otps"), {
      email,
      code,
      expires: expiration,
      createdAt: Date.now()
    });

    // 2. Send the email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your SAI RAM Signup OTP",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #10b981; text-align: center;">SAI RAM Verification</h2>
          <p>Hello,</p>
          <p>Your one-time password for signing up at SAI RAM Store is:</p>
          <div style="background-color: #f8fafc; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #0f172a; border-radius: 8px; margin: 20px 0;">
            ${code}
          </div>
          <p style="color: #64748b; font-size: 14px;">This code will expire in 10 minutes. If you didn't request this, please ignore this email.</p>
        </div>
      `,
    }

    await transporter.sendMail(mailOptions);
    console.log(`OTP sent and stored in Firestore for: ${email}`);
    res.json({ success: true, message: "OTP sent successfully to your email." });
  } catch (err) {
    console.error("Failed to process OTP request:", err);
    res.status(500).json({ success: false, message: "Failed to send OTP. Check server configuration." });
  }
});

// OTP: Verify (Checks Firestore)
app.post("/api/otp/verify", async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ success: false, message: "Email and OTP are required" });

  try {
    // 1. Query Firestore for the most recent OTP for this email
    const otpQuery = query(
      collection(db, "otps"), 
      where("email", "==", email), 
      where("code", "==", otp)
    );
    
    const querySnapshot = await getDocs(otpQuery);
    
    if (querySnapshot.empty) {
      return res.status(400).json({ success: false, message: "Invalid OTP or email. Please try again." });
    }

    // 2. Get the latest record (there should ideally be only one or we pick the first)
    const otpDoc = querySnapshot.docs[0];
    const data = otpDoc.data();

    // 3. Check expiration
    if (Date.now() > data.expires) {
      await deleteDoc(doc(db, "otps", otpDoc.id));
      return res.status(400).json({ success: false, message: "OTP has expired. Please request a new one." });
    }

    // 4. Clean up (delete the verified OTP)
    await deleteDoc(doc(db, "otps", otpDoc.id));
    
    res.json({ success: true, message: "OTP verified successfully" });
  } catch (err) {
    console.error("Failed to verify OTP from Firestore:", err);
    res.status(500).json({ success: false, message: "Internal verification error" });
  }
});

// Catch-all for Debugging 404
app.use((req, res) => {
  console.log(`404 Not Found: ${req.method} ${req.url}`)
  res.status(404).json({ 
    error: "Route not found", 
    method: req.method, 
    url: req.url,
    hint: "Ensure you are using the correct backend URL in frontend." 
  })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, ()=>{
console.log(`Server running on port ${PORT}`)
})