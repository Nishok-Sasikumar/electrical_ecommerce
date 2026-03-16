const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")
const Razorpay = require("razorpay")
const crypto = require("crypto")
const nodemailer = require("nodemailer")
dotenv.config()

const app = express()

// Nodemailer Config
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

app.use(cors({
  origin: "*", // Adjust this to your production frontend URL for better security
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}))
app.use(express.json())

// Health Check
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
      amount: Math.round(amount * 100),
      currency,
      receipt,
    }

    const order = await razorpay.orders.create(options)
    res.json(order)
  } catch (err) {
    console.error("Razorpay Order Creation Error:", err)
    res.status(500).json({ 
      error: "Order creation failed", 
      details: err.message
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
      to: process.env.EMAIL_USER,
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

module.exports = app
