import { useState, useEffect } from "react"
import { db } from "../firebase"
import { collection, query, where, getDocs, orderBy, updateDoc, doc } from "firebase/firestore"
import { useAuth } from "../context/AuthContext"
import { Package, Truck, Clock, ArrowLeft, Zap, CheckCircle } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"

function MyOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)
  const { user } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()

  useEffect(() => {
    if (!user) {
      navigate("/login")
      return
    }

    const fetchOrders = async () => {
      try {
        setError(null)
        console.log("Fetching orders for user:", user.uid)
        
        // Fetch without orderBy to avoid index requirements initially
        const q = query(
          collection(db, "orders"), 
          where("userId", "==", user.uid)
        )
        
        const querySnapshot = await getDocs(q)
        console.log("User orders found:", querySnapshot.size)
        
        const ordersData = querySnapshot.docs.map(doc => {
          const data = doc.data()
          return {
            _id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now())
          }
        })

        // Sort manually by date
        ordersData.sort((a, b) => b.createdAt - a.createdAt)
        
        setOrders(ordersData)
      } catch (err) {
        console.error("Failed to fetch orders:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [user, navigate])

  const handleMarkAsDone = async (orderId) => {
    if (updatingId) return // Prevent multiple clicks
    
    setUpdatingId(orderId)
    try {
      const orderRef = doc(db, "orders", orderId)
      await updateDoc(orderRef, {
        isDelivered: true,
        status: 'Delivered'
      })
      // Update local state
      setOrders(prev => prev.map(order => 
        order._id === orderId ? { ...order, isDelivered: true, status: 'Delivered' } : order
      ))
    } catch (err) {
      console.error("Failed to update order status:", err)
      if (err.code === 'permission-denied') {
        alert("Permission Denied: You don't have permission to update this order. Please ensure your Firestore Security Rules allow 'update'.")
      } else {
        alert("Failed to update order: " + err.message)
      }
    } finally {
      setUpdatingId(null)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  )

  return (
    <div className="bg-white min-h-screen pb-24 px-4 md:px-8">
      <div className="container mx-auto max-w-4xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="animate-in fade-in slide-in-from-left-8 duration-700">
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter mb-4 leading-none">{t('orders.title')} <span className="text-primary italic">{t('orders.title_italic')}</span></h1>
            <p className="text-muted">{t('orders.subtitle')}</p>
          </div>
          <Link to="/catalog" className="inline-flex items-center gap-2 text-primary hover:underline font-black uppercase tracking-widest text-[10px]">
            <ArrowLeft size={16} />
            {t('nav.catalog')}
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 p-6 rounded-[2rem] mb-8 flex items-center gap-4 animate-in slide-in-from-top-4 duration-300">
            <div className="p-3 bg-white rounded-full shadow-sm">
              <Package size={20} className="text-red-500" />
            </div>
            <div>
              <p className="font-black text-sm uppercase tracking-widest">Connection Error</p>
              <p className="text-xs font-bold opacity-80">{error}</p>
            </div>
          </div>
        )}

        {orders.length === 0 ? (
          <div className="bg-slate-50 rounded-[3rem] p-24 text-center border border-slate-100/50">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-8 text-slate-200 shadow-soft">
              <Package size={40} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">{t('orders.empty_title')}</h2>
            <p className="text-slate-500 mb-12 max-w-xs mx-auto font-medium">
              {t('orders.empty_desc')}
            </p>
            <Link to="/catalog" className="btn-primary inline-flex px-12 h-16 shadow-glow">
              {t('orders.btn_start')}
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map((order) => (
              <div key={order._id} className="bg-white border border-slate-100 rounded-[2.5rem] p-8 md:p-10 shadow-soft hover:shadow-xl transition-all duration-500">
                <div className="flex flex-col md:flex-row justify-between gap-8 mb-10 pb-10 border-b border-slate-50">
                  <div className="flex flex-wrap gap-8">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t('orders.label_id')}</p>
                      <p className="font-black text-slate-900 font-mono text-sm uppercase tracking-tighter truncate max-w-[100px]" title={order._id}>#{order._id.slice(-8)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t('orders.label_date')}</p>
                      <p className="font-black text-slate-900 text-sm">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t('orders.label_total')}</p>
                      <p className="font-black text-primary text-sm">₹{order.totalPrice.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${order.isDelivered ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                      {order.isDelivered ? <Package size={14} /> : <Truck size={14} />}
                      {order.isDelivered ? t('orders.status_delivered') : t('orders.status_transit')}
                    </div>
                    
                    {!order.isDelivered && (
                      <button 
                        onClick={() => handleMarkAsDone(order._id)}
                        disabled={updatingId === order._id}
                        className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${updatingId === order._id ? 'bg-slate-100 text-slate-400' : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'}`}
                      >
                        {updatingId === order._id ? (
                          <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <CheckCircle2 size={14} />
                        )}
                        {updatingId === order._id ? 'Updating...' : t('orders.btn_received')}
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  {order.orderItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-slate-50 rounded-2xl p-2 border border-slate-100 flex-shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-black text-slate-900 text-sm leading-tight">{item.name}</h4>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{t('cart.quantity')}: {item.quantity}</p>
                      </div>
                      <p className="font-black text-slate-900 text-sm">₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyOrders
