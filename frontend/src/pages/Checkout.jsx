import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useCart } from "../context/CartContext"
import { useAuth } from "../context/AuthContext"
import { ArrowLeft, CheckCircle, Package, Truck, CreditCard, ShieldCheck, Zap, ArrowRight, User, Mail, Phone, MapPin, Edit3, AlertCircle } from "lucide-react"
import { useTranslation } from 'react-i18next'
import { db } from "../firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import axios from "axios"

function Checkout() {
  const { cartItems, cartTotal, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [isOrdered, setIsOrdered] = useState(false)
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
    if (!user) {
      navigate('/login')
      return
    }
    if (cartItems.length === 0 && !isOrdered) {
      navigate('/')
    }
  }, [cartItems, isOrdered, navigate, user])

  const isProfileComplete = user?.phone && user?.address && user?.city && user?.zip

  const handleSubmit = async () => {
    if (!user || !isProfileComplete) return
    
    setLoading(true)
    try {
      const totalAmount = cartTotal * 1.18; // Subtotal + 18% Tax
      // In production, use current origin (for Vercel rewrites), in dev use localhost:5000
      const backendUrl = window.location.hostname === 'localhost' ? "http://localhost:5000" : window.location.origin;
      
      // 0. Pre-check: Health Check (Ensure Backend is Reachable)
      try {
        await axios.get(`${backendUrl}/api/health`)
      } catch (healthErr) {
        throw new Error(`Backend server is not reachable at ${backendUrl}. Please ensure the server is running.`)
      }
      
      // 1. Create Razorpay Order on Backend
      const orderResponse = await axios.post(`${backendUrl}/api/payment/order`, {
        amount: Math.round(totalAmount),
        currency: "INR",
        receipt: `receipt_${Date.now()}`
      })

      const { id: order_id, amount, currency } = orderResponse.data

      // 2. Open Razorpay Checkout Modal
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Enter the Key ID generated from the Dashboard
        amount: amount,
        currency: currency,
        name: "Sairam Store",
        description: "Electrical Components Purchase",
        image: "/vite.svg",
        order_id: order_id,
        handler: async function (response) {
          // 3. Verify Payment Signature
          const verifyResponse = await axios.post(`${backendUrl}/api/payment/verify`, {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          })

          if (verifyResponse.data.success) {
            // 4. Payment Verified, Create Firestore Order
            const orderData = {
              userId: user.uid,
              userName: user.name,
              userEmail: user.email,
              phone: user.phone,
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              orderItems: cartItems.map(item => ({
                id: item._id,
                name: item.name,
                quantity: item.quantity,
                image: item.image,
                price: item.price
              })),
              shippingAddress: {
                address: user.address,
                city: user.city,
                zip: user.zip
              },
              totalPrice: totalAmount,
              status: 'In Transit',
              isDelivered: false,
              createdAt: serverTimestamp()
            }

            const docRef = await addDoc(collection(db, "orders"), orderData)
            
            // Notify Admin
            try {
              await axios.post(`${backendUrl}/api/admin/notify-order`, {
                ...orderData,
                orderId: docRef.id
              })
            } catch (notifyErr) {
              console.error("Admin notification failed:", notifyErr)
            }

            setIsOrdered(true)
            clearCart()
          } else {
            alert("Payment verification failed!")
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone
        },
        theme: {
          color: "#10b981" // emerald-500
        }
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.on('payment.failed', function (response){
        alert("Payment Failed: " + response.error.description);
      });
      rzp1.open();

    } catch (error) {
      console.error("Payment flow failed at some stage:", error)
      const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message || "Unknown error"
      alert(`Payment failed: ${errorMsg}`)
    } finally {
      setLoading(false)
    }
  }

  if (isOrdered) {
    return (
      <div className="bg-white dark:bg-slate-950 min-h-screen py-24 flex items-center justify-center px-6">
        <div className="text-center max-w-xl w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-900/20 text-primary rounded-full flex items-center justify-center mx-auto mb-10 shadow-glow">
            <CheckCircle size={48} />
          </div>
          <h2 className="text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tighter leading-none">{t('checkout.success_title')}</h2>
          <p className="text-muted mb-12">
            {t('checkout.success_desc')}
          </p>
          
          <div className="bg-slate-50 dark:bg-white/5 rounded-[3rem] p-10 mb-12 text-left border border-slate-100/50 dark:border-white/5">
            <h4 className="font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3 tracking-tight">
              <Truck size={20} className="text-primary" />
              {t('checkout.logistics_summary')}
            </h4>
            <div className="space-y-2 font-bold text-slate-500 text-lg">
              <p className="text-slate-900 dark:text-white">{user.name}</p>
              <p>{user.address}</p>
              <p>{user.city}, {user.zip}</p>
              <div className="pt-6 mt-6 border-t border-slate-200/50 dark:border-white/10">
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{t('checkout.priority_delivery')}</p>
              </div>
            </div>
          </div>
          
          <Link to="/" className="btn-primary inline-flex px-12 h-16 shadow-glow">
            {t('nav.home')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen pb-24 px-4 md:px-8 transition-colors duration-500">
      <div className="container mx-auto max-w-7xl pt-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="animate-in fade-in slide-in-from-left-8 duration-700">
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter mb-4 leading-none">{t('checkout.title')} <span className="text-primary italic">{t('checkout.title_italic')}</span></h1>
            <p className="text-muted dark:text-slate-400">{t('checkout.form_desc')}</p>
          </div>
          <Link to="/cart" className="inline-flex items-center gap-2 text-primary hover:underline font-black uppercase tracking-widest text-[10px]">
            <ArrowLeft size={16} />
            {t('nav.cart')}
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-start">
          {/* Shipping Summary v3 */}
          <div className="lg:col-span-7 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="bg-slate-50 dark:bg-white/5 rounded-[3rem] p-12 border border-slate-100/50 dark:border-white/10 shadow-soft">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                  <Truck size={24} className="text-primary" />
                  Shipping Information
                </h3>
                <Link to="/profile" className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px] hover:underline">
                  <Edit3 size={14} />
                  Edit Profile
                </Link>
              </div>

              {!isProfileComplete ? (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 p-8 rounded-[2rem] flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                  <div className="p-4 bg-white dark:bg-slate-900 rounded-full text-amber-500 shadow-sm">
                    <AlertCircle size={32} />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Incomplete Profile</h4>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mb-6">Please provide your shipping address and phone number in your profile to proceed with checkout.</p>
                    <Link to="/profile" className="btn-primary px-8 py-3 text-xs inline-flex shadow-none hover:shadow-glow">
                      Complete Profile
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Recipient</label>
                      <p className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{user.name}</p>
                      <p className="text-slate-500 dark:text-slate-400 font-bold">{user.email}</p>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Contact Number</label>
                      <p className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{user.phone}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Delivery Address</label>
                    <div className="space-y-1">
                      <p className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">{user.address}</p>
                      <p className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">{user.city}</p>
                      <p className="text-primary font-black tracking-widest">{user.zip}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-8 bg-slate-50 dark:bg-white/5 rounded-[2.5rem] border border-slate-100 dark:border-white/10 flex flex-col items-center text-center">
                <ShieldCheck className="text-primary mb-4" size={32} />
                <h4 className="font-black text-slate-900 dark:text-white text-sm mb-1 uppercase tracking-tight">Secure Data</h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">256-bit encrypted SSL connection</p>
              </div>
              <div className="p-8 bg-slate-50 dark:bg-white/5 rounded-[2.5rem] border border-slate-100 dark:border-white/10 flex flex-col items-center text-center">
                <Package className="text-primary mb-4" size={32} />
                <h4 className="font-black text-slate-900 dark:text-white text-sm mb-1 uppercase tracking-tight">Protection</h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">Industrial grade packaging standards</p>
              </div>
              <div className="p-8 bg-slate-50 dark:bg-white/5 rounded-[2.5rem] border border-slate-100 dark:border-white/10 flex flex-col items-center text-center">
                <Zap className="text-primary mb-4" size={32} />
                <h4 className="font-black text-slate-900 dark:text-white text-sm mb-1 uppercase tracking-tight">Speed</h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">Rapid dispatch within 24 hours</p>
              </div>
            </div>
          </div>

          {/* Order Review Sidebar v3 */}
          <div className="lg:col-span-5 animate-in fade-in slide-in-from-right-8 duration-700">
            <div className="bg-slate-50 dark:bg-white/5 rounded-[3.5rem] p-10 border border-slate-100/50 dark:border-white/10 sticky top-32 shadow-soft">
              <h3 className="text-2xl font-black mb-10 tracking-tighter leading-tight text-slate-900 dark:text-white">{t('checkout.logistics_summary')}</h3>
              
              <div className="space-y-6 mb-10 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                {cartItems.map((item) => (
                  <div key={item._id} className="flex gap-4 items-center">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white dark:bg-slate-800 flex-shrink-0 shadow-sm p-2">
                      <img 
                        src={item.image || "https://via.placeholder.com/150?text=No+Image"} 
                        alt={item.name} 
                        className="w-full h-full object-contain" 
                        onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=Error" }}
                      />
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="font-black text-sm text-slate-900 dark:text-white leading-tight truncate" title={item.name}>{item.name}</p>
                      <p className="text-xs font-bold text-slate-400">Qty: {item.quantity} × ₹{item.price.toLocaleString()}</p>
                    </div>
                    <p className="font-black text-slate-900 dark:text-white">₹{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-10 border-t border-slate-200 dark:border-white/10 mb-10">
                <div className="flex justify-between font-bold text-slate-500">
                  <p>{t('cart.subtotal')}</p>
                  <p className="text-slate-900 dark:text-white">₹{cartTotal.toLocaleString()}</p>
                </div>
                <div className="flex justify-between font-bold text-slate-500">
                  <p>{t('cart.delivery')}</p>
                  <p className="text-emerald-500 font-black text-[10px] uppercase tracking-widest">{t('cart.free')}</p>
                </div>
                <div className="flex justify-between font-bold text-slate-500">
                  <p>{t('cart.tax')}</p>
                  <p className="text-slate-900 dark:text-white">₹{(cartTotal * 0.18).toLocaleString()}</p>
                </div>
                <div className="flex justify-between text-3xl font-black text-slate-900 dark:text-white pt-4 tracking-tighter">
                  <p>{t('cart.total')}</p>
                  <p>₹{(cartTotal * 1.18).toLocaleString()}</p>
                </div>
              </div>

              <button 
                onClick={handleSubmit} 
                disabled={!isProfileComplete || loading}
                className="btn-primary w-full h-20 text-xl shadow-glow group disabled:opacity-50 disabled:shadow-none"
              >
                {loading ? 'Processing...' : t('checkout.btn_confirm')}
                {!loading && <ArrowRight className="transition-transform group-hover:translate-x-2" size={24} />}
              </button>
              
              <p className="text-center mt-6 text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest flex items-center justify-center gap-2">
                <CreditCard size={14} />
                {t('cart.secure')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout
