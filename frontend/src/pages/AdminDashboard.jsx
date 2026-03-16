import { useState, useEffect } from "react"
import { db } from "../firebase"
import { collection, query, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore"
import { useAuth } from "../context/AuthContext"
import { Package, Clock, ArrowLeft, Database, User as UserIcon, Calendar, Hash, IndianRupee, AlertCircle, Trash2, CheckCircle, Truck, Tag, MessageSquare, Mail, Phone as PhoneIcon } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"

function AdminDashboard() {
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [enquiries, setEnquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedOrder, setExpandedOrder] = useState(null)
  const [expandedEnquiry, setExpandedEnquiry] = useState(null)
  const [activeTab, setActiveTab] = useState("pending") // "pending", "delivered", "enquiries"
  const { user } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const pendingOrders = orders.filter(o => !o.isDelivered)
  const deliveredOrders = orders.filter(o => o.isDelivered)
  const missingModels = products.filter(p => !p.arModel)
  const pendingEnquiries = enquiries.filter(e => e.status === 'pending')

  useEffect(() => {
    if (!user || !user.isAdmin) {
      navigate("/")
      return
    }

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch Orders
        const ordersQuery = query(collection(db, "orders"))
        const ordersSnap = await getDocs(ordersQuery)
        const ordersData = ordersSnap.docs.map(doc => {
          const data = doc.data()
          return {
            _id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now())
          }
        })
        ordersData.sort((a, b) => b.createdAt - a.createdAt)
        setOrders(ordersData)

        // Fetch Products for Health Check
        const productsQuery = query(collection(db, "products"))
        const productsSnap = await getDocs(productsQuery)
        setProducts(productsSnap.docs.map(doc => ({ _id: doc.id, ...doc.data() })))

        // Fetch Enquiries
        const enquiriesQuery = query(collection(db, "enquiries"))
        const enquiriesSnap = await getDocs(enquiriesQuery)
        const enquiriesData = enquiriesSnap.docs.map(doc => {
          const data = doc.data()
          return {
            _id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now())
          }
        })
        enquiriesData.sort((a, b) => b.createdAt - a.createdAt)
        setEnquiries(enquiriesData)

      } catch (err) {
        console.error("Failed to fetch admin data:", err)
        setError(err.message || "An unknown error occurred while fetching data.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, navigate])

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm("Are you sure you want to delete this order? This action cannot be undone.")) {
      try {
        await deleteDoc(doc(db, "orders", orderId))
        setOrders(orders.filter(order => order._id !== orderId))
        if (expandedOrder === orderId) setExpandedOrder(null)
      } catch (err) {
        console.error("Error deleting order:", err)
        alert("Failed to delete order: " + err.message)
      }
    }
  }

  const handleDeleteEnquiry = async (enquiryId) => {
    if (window.confirm("Delete this enquiry?")) {
      try {
        await deleteDoc(doc(db, "enquiries", enquiryId))
        setEnquiries(enquiries.filter(e => e._id !== enquiryId))
      } catch (err) {
        console.error("Error deleting enquiry:", err)
      }
    }
  }

  const handleToggleEnquiryStatus = async (enquiry) => {
    const newStatus = enquiry.status === 'pending' ? 'resolved' : 'pending'
    try {
      await updateDoc(doc(db, "enquiries", enquiry._id), { status: newStatus })
      setEnquiries(enquiries.map(e => e._id === enquiry._id ? { ...e, status: newStatus } : e))
    } catch (err) {
      console.error("Error updating enquiry status:", err)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  )

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen pb-24 px-4 md:px-8 transition-colors duration-500">
      <div className="container mx-auto max-w-7xl pt-12">
        {/* Header v3 */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="animate-in fade-in slide-in-from-left-8 duration-700">
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter mb-4 leading-none">
              Admin <span className="text-primary italic">Dashboard.</span>
            </h1>
            <p className="text-muted dark:text-slate-400">Logistics control center and order fulfillment management.</p>
          </div>
          
          <div className="flex flex-wrap gap-4 animate-in fade-in slide-in-from-right-8 duration-700">
            <Link to="/admin/products" className="btn-primary px-6 py-3 text-xs flex items-center gap-2 shadow-glow">
              <Tag size={16} />
              Manage Products
            </Link>
            <Link to="/seed-firestore" className="btn-outline px-6 py-3 text-xs flex items-center gap-2 dark:border-white/20 dark:text-white dark:hover:bg-white/5">
              <Database size={16} />
              Restore Catalogue
            </Link>
            <Link to="/profile" className="inline-flex items-center gap-2 text-primary hover:underline font-black uppercase tracking-widest text-[10px]">
              <ArrowLeft size={16} />
              Back to Profile
            </Link>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="glass-modern dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-soft">
            <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mb-4">Pending Orders</p>
            <p className="text-4xl font-black text-amber-500 italic">{pendingOrders.length}</p>
          </div>
          <div className="glass-modern dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-soft relative overflow-hidden group">
            <div className={`absolute inset-0 bg-red-500/5 transition-opacity duration-500 ${missingModels.length > 0 ? 'opacity-100' : 'opacity-0'}`}></div>
            <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              3D Model Health
              {missingModels.length > 0 && <AlertCircle size={10} className="text-red-500 animate-pulse" />}
            </p>
            <p className={`text-4xl font-black italic ${missingModels.length > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
              {missingModels.length > 0 ? `${missingModels.length} Pending` : '100% Ready'}
            </p>
            {missingModels.length > 0 && (
              <Link to="/admin/products" className="text-[8px] font-black uppercase tracking-widest text-primary mt-2 block hover:underline">
                Fix visibility now →
              </Link>
            )}
          </div>
          <div className="glass-modern dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-soft">
            <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mb-4">Revenue Generated</p>
            <p className="text-4xl font-black text-primary italic">
              ₹{orders.reduce((acc, curr) => acc + (curr.totalPrice || 0), 0).toLocaleString()}
            </p>
          </div>
          <div className="glass-modern dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-soft">
            <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mb-4">Active System</p>
            <p className="text-4xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              Online <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
            </p>
          </div>
        </div>

        {/* Segregation Tabs */}
        <div className="flex flex-wrap gap-4 mb-12 bg-slate-100 dark:bg-white/5 p-2 rounded-3xl w-fit border border-slate-200 dark:border-white/10 shadow-soft">
          <button 
            onClick={() => setActiveTab("pending")}
            className={`px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === "pending" ? 'bg-white dark:bg-slate-800 text-amber-500 shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
          >
            <Truck size={14} /> Pending ({pendingOrders.length})
          </button>
          <button 
            onClick={() => setActiveTab("delivered")}
            className={`px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === "delivered" ? 'bg-white dark:bg-slate-800 text-emerald-500 shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
          >
            <CheckCircle size={14} /> Delivered ({deliveredOrders.length})
          </button>
          <button 
            onClick={() => setActiveTab("enquiries")}
            className={`px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 relative ${activeTab === "enquiries" ? 'bg-white dark:bg-slate-800 text-primary shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
          >
            <MessageSquare size={14} /> Enquiries ({enquiries.length})
            {pendingEnquiries.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] flex items-center justify-center rounded-full animate-pulse">
                {pendingEnquiries.length}
              </span>
            )}
          </button>
        </div>

        {/* Dynamic Content Title */}
        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-8 tracking-tight flex items-center gap-3">
          {activeTab === 'enquiries' ? <MessageSquare size={24} className="text-primary" /> : <Package size={24} className="text-primary" />}
          {activeTab === "pending" ? 'Pending Orders' : activeTab === "delivered" ? 'Delivered Orders' : 'User Enquiries'}
        </h3>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 p-6 rounded-[2.5rem] mb-8 flex items-center gap-4 animate-in slide-in-from-top-4">
            <AlertCircle size={24} />
            <div>
              <p className="font-bold">Error loading data</p>
              <p className="text-xs opacity-80">{error}</p>
            </div>
          </div>
        )}

        {/* Content Area */}
        {activeTab === 'enquiries' ? (
          /* Enquiries List */
          enquiries.length === 0 ? (
            <div className="bg-slate-50 dark:bg-white/5 rounded-[3rem] p-24 text-center border border-slate-100/50 dark:border-white/10 animate-in zoom-in-95">
              <p className="text-slate-500 dark:text-slate-400 font-medium">No enquiries received yet.</p>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              {enquiries.map((enquiry) => (
                <div key={enquiry._id} className="glass-modern dark:bg-slate-900/50 border border-slate-100 dark:border-white/5 rounded-[2.5rem] p-8 md:p-10 shadow-soft hover:shadow-xl transition-all duration-500 relative overflow-hidden group">
                  <div className={`absolute top-0 left-0 w-2 h-full ${enquiry.status === 'resolved' ? 'bg-emerald-500' : 'bg-primary'}`}></div>
                  
                  <div className="flex flex-col lg:flex-row justify-between gap-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 flex-grow">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                          <UserIcon size={12} /> From
                        </p>
                        <p className="font-black text-slate-900 dark:text-white text-sm truncate" title={enquiry.name}>{enquiry.name}</p>
                        <div className={`mt-2 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest inline-flex items-center gap-1.5 ${enquiry.status === 'resolved' ? 'bg-emerald-50 text-emerald-600' : 'bg-primary/10 text-primary'}`}>
                          {enquiry.status === 'resolved' ? <CheckCircle size={10} /> : <Clock size={10} />}
                          {enquiry.status === 'resolved' ? 'Resolved' : 'New Enquiry'}
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                          <Mail size={12} /> Contact Info
                        </p>
                        <p className="font-black text-slate-900 dark:text-white text-sm truncate" title={enquiry.userEmail}>{enquiry.userEmail}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">{enquiry.phone}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                          <Calendar size={12} /> Received
                        </p>
                        <p className="font-black text-slate-900 dark:text-white text-sm">{new Date(enquiry.createdAt).toLocaleDateString()}</p>
                        <p className="text-[10px] text-slate-500 font-medium">{new Date(enquiry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                          <MessageSquare size={12} /> Message Preview
                        </p>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400 line-clamp-2 italic">"{enquiry.message}"</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => setExpandedEnquiry(expandedEnquiry === enquiry._id ? null : enquiry._id)}
                        className="px-6 py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-primary dark:hover:bg-primary dark:hover:text-white transition-all shadow-lg"
                      >
                        {expandedEnquiry === enquiry._id ? 'Close' : 'Read Full'}
                      </button>
                      <button 
                        onClick={() => handleToggleEnquiryStatus(enquiry)}
                        className={`p-4 rounded-xl transition-all ${enquiry.status === 'resolved' ? 'text-slate-400 bg-slate-100 dark:bg-white/5' : 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 hover:scale-110'}`}
                        title={enquiry.status === 'resolved' ? "Mark as Pending" : "Mark as Resolved"}
                      >
                        <CheckCircle size={20} />
                      </button>
                      <button 
                        onClick={() => handleDeleteEnquiry(enquiry._id)}
                        className="p-4 text-slate-300 dark:text-slate-700 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>

                  {expandedEnquiry === enquiry._id && (
                    <div className="mt-10 pt-10 border-t border-slate-100 dark:border-white/5 animate-in slide-in-from-top-4 duration-500">
                      <div className="bg-slate-50 dark:bg-white/5 p-10 rounded-[3rem] border border-slate-100 dark:border-white/5">
                        <div className="flex items-start gap-6 mb-8">
                          <div className="p-4 bg-primary/10 text-primary rounded-2xl">
                            <MessageSquare size={32} />
                          </div>
                          <div>
                            <h4 className="text-xl font-black text-slate-900 dark:text-white mb-2">Full Message Details</h4>
                            <p className="text-sm text-slate-500 font-medium italic">Sent by {enquiry.name} via Submit Enquiry</p>
                          </div>
                        </div>
                        <div className="prose dark:prose-invert max-w-none">
                          <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed font-medium bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-sm border border-slate-100/50 dark:border-white/5">
                            {enquiry.message}
                          </p>
                        </div>
                        <div className="mt-8 flex flex-wrap gap-4">
                          <a href={`mailto:${enquiry.userEmail}`} className="btn-primary h-14 px-8 text-[10px]">
                            <Mail size={16} /> Reply via Email
                          </a>
                          <a href={`tel:${enquiry.phone}`} className="btn-outline h-14 px-8 text-[10px] dark:border-white/20 dark:text-white">
                            <PhoneIcon size={16} /> Call {enquiry.phone}
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        ) : (
          /* Orders List (Existing Logic) */
          (activeTab === "pending" ? pendingOrders : deliveredOrders).length === 0 ? (
            <div className="bg-slate-50 dark:bg-white/5 rounded-[3rem] p-24 text-center border border-slate-100/50 dark:border-white/10 animate-in zoom-in-95">
              <p className="text-slate-500 dark:text-slate-400 font-medium">No {activeTab} orders found in the system.</p>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              {(activeTab === "pending" ? pendingOrders : deliveredOrders).map((order) => (
                <div key={order._id} className="glass-modern dark:bg-slate-900/50 border border-slate-100 dark:border-white/5 rounded-[2.5rem] p-8 md:p-10 shadow-soft hover:shadow-xl transition-all duration-500 relative overflow-hidden group">
                  {/* Status Indicator Bar */}
                  <div className={`absolute top-0 left-0 w-2 h-full ${order.isDelivered ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                  
                  <div className="flex flex-col lg:flex-row justify-between gap-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 flex-grow">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                          <Hash size={12} /> Order ID
                        </p>
                        <p className="font-black text-slate-900 dark:text-white font-mono text-sm uppercase truncate">#{order._id.slice(-8)}</p>
                        <div className={`mt-2 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest inline-flex items-center gap-1.5 ${order.isDelivered ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                          {order.isDelivered ? <CheckCircle size={10} /> : <Clock size={10} />}
                          {order.isDelivered ? 'Delivered' : 'Pending'}
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                          <UserIcon size={12} /> Customer
                        </p>
                        <p className="font-black text-slate-900 dark:text-white text-sm truncate max-w-[120px]" title={order.userName || 'Anonymous'}>{order.userName || 'Anonymous'}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium lowercase truncate max-w-[120px]" title={order.userEmail}>{order.userEmail}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                          <Calendar size={12} /> Placed On
                        </p>
                        <p className="font-black text-slate-900 dark:text-white text-sm">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                          <IndianRupee size={12} /> Total Value
                        </p>
                        <p className="font-black text-primary text-sm italic">₹{(order.totalPrice || 0).toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                        className="px-6 py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-primary dark:hover:bg-primary dark:hover:text-white transition-all shadow-lg shadow-slate-900/10"
                      >
                        {expandedOrder === order._id ? 'Hide Details' : 'View Logistics'}
                      </button>
                      <button 
                        onClick={() => handleDeleteOrder(order._id)}
                        className="p-4 text-slate-300 dark:text-slate-700 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details v3 */}
                  {expandedOrder === order._id && (
                    <div className="mt-10 pt-10 border-t border-slate-100 dark:border-white/5 animate-in slide-in-from-top-4 duration-500">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-10">
                        <div className="bg-slate-50 dark:bg-white/5 p-8 rounded-[2rem] border border-slate-100 dark:border-white/5">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Logistics Items</h4>
                          <div className="space-y-4">
                            {order.orderItems?.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100/50 dark:border-white/5">
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 bg-slate-50 dark:bg-white/5 rounded-lg overflow-hidden p-1 flex-shrink-0">
                                  <img 
                                    src={item.image || "https://via.placeholder.com/150?text=No+Image"} 
                                    alt={item.name} 
                                    className="w-full h-full object-contain" 
                                    onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=Error" }}
                                  />
                                </div>
                                  <span className="font-bold text-slate-700 dark:text-slate-300 text-sm truncate max-w-[150px]">{item.name}</span>
                                </div>
                                <span className="font-black text-slate-400 text-xs">x{item.quantity}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="bg-slate-50 dark:bg-white/5 p-8 rounded-[2rem] border border-slate-100 dark:border-white/5">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Delivery Coordinates</h4>
                          <div className="space-y-2 text-slate-700 dark:text-slate-300 font-bold">
                            <p className="text-lg text-slate-900 dark:text-white">{order.shippingAddress?.address}</p>
                            <p>{order.shippingAddress?.city}</p>
                            <p className="text-primary tracking-widest">{order.shippingAddress?.zip}</p>
                            <p className="mt-4 pt-4 border-t border-slate-200/50 dark:border-white/10 flex items-center gap-2 text-sm">
                              <Clock size={16} className="text-slate-400" />
                              Registered Phone: {order.phone}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default AdminDashboard
