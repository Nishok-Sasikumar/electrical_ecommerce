const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")
const Razorpay = require("razorpay")
const crypto = require("crypto")
const nodemailer = require("nodemailer")
dotenv.config()

const app = express()

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
  origin: ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174", "http://localhost:5175", "http://127.0.0.1:5175"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}))
app.use(express.json())

// Request Logger (Debug 404)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
  next()
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

const PORT = 5000

app.listen(PORT, ()=>{
console.log(`Server running on port ${PORT}`)
})