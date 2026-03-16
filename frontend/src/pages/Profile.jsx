import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { useTranslation } from "react-i18next"
import { User, Mail, Shield, LogOut, ArrowLeft, Package, Settings, Database, CheckCircle, AlertCircle, LayoutDashboard, Phone, MapPin, Edit3, Save, X, Hash } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { db } from "../firebase"
import { doc, updateDoc } from "firebase/firestore"

function Profile() {
  const { user, logout } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()
  
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    zip: ""
  })
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState("")

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        address: user.address || "",
        city: user.city || "",
        zip: user.zip || ""
      })
    }
  }, [user])

  if (!user) {
    navigate("/login")
    return null
  }

  const handleLogout = async () => {
    await logout()
    navigate("/")
  }

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const userRef = doc(db, "users", user.uid)
      await updateDoc(userRef, {
        ...formData,
        updatedAt: new Date()
      })
      setSuccess("Profile updated successfully!")
      setIsEditing(false)
      setTimeout(() => setSuccess(""), 3000)
    } catch (error) {
      console.error("Failed to update profile:", error)
      alert("Failed to update profile. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen pb-24 px-4 md:px-8">
      <div className="container mx-auto max-w-4xl pt-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="animate-in fade-in slide-in-from-left-8 duration-700">
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter mb-4 leading-none">Account <span className="text-primary italic">Profile.</span></h1>
            <p className="text-muted">Manage your personal information and security settings.</p>
          </div>
          <Link to="/" className="inline-flex items-center gap-2 text-primary hover:underline font-black uppercase tracking-widest text-[10px]">
            <ArrowLeft size={16} />
            {t('nav.home')}
          </Link>
        </div>

        {success && (
          <div className="mb-8 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 p-4 rounded-2xl flex items-center gap-3 animate-in zoom-in-95 duration-300">
            <CheckCircle size={20} />
            <p className="text-sm font-bold">{success}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Sidebar */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-slate-50 dark:bg-white/5 rounded-[3rem] p-10 text-center border border-slate-100/50 dark:border-white/5">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary border-4 border-white dark:border-slate-900 shadow-glow">
                <span className="text-4xl font-black">{user.name.charAt(0).toUpperCase()}</span>
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1">{user.name}</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{user.isAdmin ? 'Administrator' : 'Valued Client'}</p>
              
              <div className={`mb-8 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-2 ${user.emailVerified ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                {user.emailVerified ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                {user.emailVerified ? 'Verified Account' : 'Pending Verification'}
              </div>

              <button 
                onClick={handleLogout}
                className="w-full py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] text-red-500 hover:bg-red-50 hover:border-red-100 transition-all flex items-center justify-center gap-2"
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>

            <div className="bg-slate-900 rounded-[3rem] p-8 text-white">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-6">Quick Links</h4>
              <nav className="space-y-4">
                {user.isAdmin ? (
                  <>
                    <Link to="/admin" className="flex items-center gap-4 text-sm font-bold hover:text-primary transition-colors group">
                      <div className="p-2 bg-white/5 rounded-xl group-hover:bg-primary/20 transition-all">
                        <LayoutDashboard size={18} />
                      </div>
                      Admin Dashboard
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/my-orders" className="flex items-center gap-4 text-sm font-bold hover:text-primary transition-colors group">
                      <div className="p-2 bg-white/5 rounded-xl group-hover:bg-primary/20 transition-all">
                        <Package size={18} />
                      </div>
                      My Orders
                    </Link>
                  </>
                )}
                
                <Link to="/settings" className="flex items-center gap-4 text-sm font-bold hover:text-primary transition-colors group">
                  <div className="p-2 bg-white/5 rounded-xl group-hover:bg-primary/20 transition-all">
                    <Settings size={18} />
                  </div>
                  Settings
                </Link>
              </nav>
            </div>
          </div>

          {/* Details */}
          <div className="md:col-span-2 space-y-8">
            <div className="bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-white/5 rounded-[3rem] p-10 md:p-12 shadow-soft">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                  <Shield size={24} className="text-primary" />
                  Personal Information
                </h3>
                {!isEditing ? (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px] hover:underline"
                  >
                    <Edit3 size={14} />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="flex items-center gap-2 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:text-slate-600"
                    >
                      <X size={14} />
                      Cancel
                    </button>
                    <button 
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-2 text-emerald-500 font-black uppercase tracking-widest text-[10px] hover:underline disabled:opacity-50"
                    >
                      <Save size={14} />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </div>
              
              <div className="space-y-8">
                {/* Name & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Full Name</label>
                    <div className="flex items-center gap-4 p-5 bg-slate-50 dark:bg-white/5 rounded-2xl border border-transparent">
                      <User size={18} className="text-slate-300" />
                      {isEditing ? (
                        <input 
                          type="text" 
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="bg-transparent w-full font-bold text-slate-700 dark:text-white outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
                        />
                      ) : (
                        <span className="font-bold text-slate-700 dark:text-white truncate">{user.name}</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 block">Email Address</label>
                    <div className="flex items-center gap-4 p-5 bg-slate-50 dark:bg-white/5 rounded-2xl border border-transparent opacity-60">
                      <Mail size={18} className="text-slate-300 dark:text-slate-700" />
                      <span className="font-bold text-slate-700 dark:text-white truncate">{user.email}</span>
                    </div>
                  </div>
                </div>

                {/* Phone & Address */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 block">Phone Number</label>
                    <div className="flex items-center gap-4 p-5 bg-slate-50 dark:bg-white/5 rounded-2xl border border-transparent">
                      <Phone size={18} className="text-slate-300 dark:text-slate-700" />
                      {isEditing ? (
                        <input 
                          type="text" 
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="Enter phone number"
                          className="bg-transparent w-full font-bold text-slate-700 dark:text-white outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
                        />
                      ) : (
                        <span className="font-bold text-slate-700 dark:text-white truncate">{user.phone || 'Not provided'}</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 block">Address</label>
                    <div className="flex items-center gap-4 p-5 bg-slate-50 dark:bg-white/5 rounded-2xl border border-transparent">
                      <MapPin size={18} className="text-slate-300 dark:text-slate-700" />
                      {isEditing ? (
                        <input 
                          type="text" 
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          placeholder="Street, House No"
                          className="bg-transparent w-full font-bold text-slate-700 dark:text-white outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
                        />
                      ) : (
                        <span className="font-bold text-slate-700 dark:text-white truncate">{user.address || 'Not provided'}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* City & Zip */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 block">City</label>
                    <div className="flex items-center gap-4 p-5 bg-slate-50 dark:bg-white/5 rounded-2xl border border-transparent">
                      <MapPin size={18} className="text-slate-300 dark:text-slate-700" />
                      {isEditing ? (
                        <input 
                          type="text" 
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          placeholder="Enter city"
                          className="bg-transparent w-full font-bold text-slate-700 dark:text-white outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
                        />
                      ) : (
                        <span className="font-bold text-slate-700 dark:text-white truncate">{user.city || 'Not provided'}</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 block">Zip Code</label>
                    <div className="flex items-center gap-4 p-5 bg-slate-50 dark:bg-white/5 rounded-2xl border border-transparent">
                      <Hash size={18} className="text-slate-300 dark:text-slate-700" />
                      {isEditing ? (
                        <input 
                          type="text" 
                          name="zip"
                          value={formData.zip}
                          onChange={handleInputChange}
                          placeholder="Enter zip code"
                          className="bg-transparent w-full font-bold text-slate-700 dark:text-white outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
                        />
                      ) : (
                        <span className="font-bold text-slate-700 dark:text-white truncate">{user.zip || 'Not provided'}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-8 bg-slate-50 dark:bg-white/5 rounded-[2.5rem] border border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`p-3 rounded-2xl ${user.emailVerified ? 'bg-emerald-50 text-emerald-500' : 'bg-amber-50 text-amber-500'}`}>
                      <Shield size={20} />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 dark:text-white leading-none mb-1">Account Security</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {user.emailVerified ? 'Fully Protected' : 'Action Required'}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    {user.emailVerified 
                      ? "Your account is fully verified. You have complete access to all features and secure checkout."
                      : "Please verify your email address to unlock all features including order tracking and secure checkout."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
