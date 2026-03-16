import { useNavigate } from "react-router-dom"
import { Sparkles, ArrowRight, Zap, ShieldCheck, Clock, Phone, MapPin, CheckCircle, Package, Globe, Wrench, Lightbulb, Send, RefreshCw, AlertCircle } from "lucide-react"
import { useTranslation } from 'react-i18next'
import { useAuth } from "../context/AuthContext"
import { useState, useEffect } from "react"
import { db } from "../firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"

function Home() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user } = useAuth()
  const [enquiryForm, setEnquiryForm] = useState({
    name: "",
    phone: "",
    message: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null) // 'success', 'error'

  useEffect(() => {
    if (user) {
      setEnquiryForm(prev => ({
        ...prev,
        name: user.displayName || user.name || "",
        phone: user.phone || ""
      }))
    }
  }, [user])

  const handleEnquiryChange = (e) => {
    setEnquiryForm({ ...enquiryForm, [e.target.name]: e.target.value })
  }

  const handleEnquirySubmit = async (e) => {
    e.preventDefault()
    if (!user) {
      navigate('/login')
      return
    }

    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      const enquiryData = {
        ...enquiryForm,
        userId: user.uid || user._id,
        userEmail: user.email,
        createdAt: serverTimestamp(),
        status: 'pending'
      }

      await addDoc(collection(db, "enquiries"), enquiryData)
      
      // Simulate Email Sending (In a real app, this would be a Cloud Function)
      console.log("Enquiry sent to admin email: admin@electrical-con1.com", enquiryData)
      
      setSubmitStatus('success')
      setEnquiryForm(prev => ({ ...prev, message: "" }))
      setTimeout(() => setSubmitStatus(null), 5000)
    } catch (err) {
      console.error("Failed to submit enquiry:", err)
      if (err.code === 'permission-denied') {
        setSubmitStatus('permission-denied')
      } else {
        setSubmitStatus('error')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const featuredCategories = [
    { name: t('home.departments_gear', { defaultValue: 'Industrial Gear' }), icon: Package, count: "450+ Items", color: "bg-blue-500" },
    { name: t('home.departments_lighting', { defaultValue: 'Smart Lighting' }), icon: Lightbulb, count: "200+ Items", color: "bg-amber-500" },
    { name: t('home.departments_safety', { defaultValue: 'Safety Systems' }), icon: ShieldCheck, count: "120+ Items", color: "bg-emerald-500" },
    { name: t('home.departments_cables', { defaultValue: 'High-Volt Cables' }), icon: Zap, count: "300+ Items", color: "bg-indigo-500" }
  ]

  const handleExplore = () => {
    if (user && !user.isAdmin) {
      navigate('/catalog')
    } else {
      navigate('/login')
    }
  }

  return (
    <div className="flex flex-col bg-white dark:bg-slate-950">
      {/* Hero Section v5 */}
      <section className="relative min-h-[80vh] flex items-center pb-20 overflow-hidden px-4 md:px-8">
        <div className="container mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative z-10 animate-in fade-in slide-in-from-left-8 duration-1000">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-primary border border-emerald-100 dark:border-emerald-800 mb-8">
              <Sparkles size={16} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">{t('hero.badge')}</span>
            </div>
            
            <h1 className="title-display min-h-[1.2em] text-slate-900 dark:text-white mb-8">
              {t('hero.title_part1')} <br />
              <span className="text-primary italic">{t('hero.title_part2')}</span>
            </h1>
            
            <p className="text-xl font-medium text-slate-600 dark:text-slate-300 mb-12 max-w-lg leading-relaxed">
              {t('hero.desc')}
            </p>
            
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={handleExplore}
                className="btn-primary group h-20 px-10 text-lg shadow-glow"
              >
                {t('hero.btn_explore')}
                <ArrowRight size={20} className="transition-transform group-hover:translate-x-2" />
              </button>
              <button 
                onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}
                className="btn-outline h-20 px-10 text-lg dark:border-white/20 dark:text-white dark:hover:bg-white/5"
              >
                {t('hero.btn_support')}
              </button>
            </div>

            <div className="mt-12 flex items-center gap-8 pt-12 border-t border-slate-100 dark:border-white/5">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(n => (
                  <img key={n} className="w-12 h-12 rounded-full border-4 border-white dark:border-slate-900" src={`https://i.pravatar.cc/100?u=${n+20}`} alt="client" />
                ))}
                <div className="w-12 h-12 rounded-full border-4 border-white dark:border-slate-900 bg-slate-900 dark:bg-primary text-white flex items-center justify-center text-[10px] font-black">
                  5k+
                </div>
              </div>
              <div>
                <p className="text-sm font-black text-slate-900 dark:text-white leading-none mb-1">{t('hero.happy_clients')}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('hero.clients_desc')}</p>
              </div>
            </div>
          </div>
          
          <div className="relative animate-in fade-in slide-in-from-right-8 duration-1000 hidden lg:block">
            <div className="relative rounded-[4rem] overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80" 
                alt="Electrical Engineering" 
                className="w-full h-full object-cover aspect-[4/5] hover:scale-105 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/40 via-transparent to-transparent"></div>
              
              <div className="absolute top-10 right-10 glass-modern dark:bg-slate-900/50 p-6 rounded-3xl animate-float border border-white/20">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary text-white rounded-2xl shadow-glow">
                    <Zap size={24} fill="white" />
                  </div>
                  <div>
                    <p className="text-slate-900 dark:text-white font-black tracking-tight">24/7 Energy</p>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Failsafe Parts</p>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-10 left-10 right-10 glass-modern dark:bg-slate-900/50 p-8 rounded-[2.5rem] border border-white/20 backdrop-blur-2xl">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Live Statistics</span>
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse delay-75"></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">98%</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Order Accuracy</p>
                  </div>
                  <div>
                    <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">2.5h</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avg. Response</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories v5 */}
      <section className="py-32 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
            <div className="max-w-xl">
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6 leading-none text-slate-900 dark:text-white">{t('home.departments')} <br /><span className="text-primary italic">{t('home.departments_italic')}</span></h2>
              <p className="text-xl font-medium text-slate-500 dark:text-slate-400">{t('home.departments_desc')}</p>
            </div>
            <button onClick={() => navigate('/catalog')} className="text-primary font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:translate-x-2 transition-transform">
              {t('home.view_all')} <ArrowRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredCategories.map((cat, i) => {
              const Icon = cat.icon
              return (
                <div key={i} className="group bg-slate-50 dark:bg-white/5 rounded-[3rem] p-12 hover:bg-white dark:hover:bg-slate-900 hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-primary/5 transition-all duration-500 border border-transparent hover:border-slate-100 dark:hover:border-white/10 flex flex-col h-full min-h-[420px]">
                  <div className={`w-16 h-16 ${cat.color} rounded-2xl flex items-center justify-center text-white mb-8 shadow-xl transition-transform group-hover:-rotate-12 group-hover:scale-110 shrink-0`}>
                    <Icon size={28} />
                  </div>
                  <h3 className="text-2xl font-black mb-4 tracking-tight line-clamp-2 min-h-[5rem] flex items-start leading-tight text-slate-900 dark:text-white">{cat.name}</h3>
                  <p className="text-slate-400 dark:text-slate-500 text-sm font-bold uppercase tracking-widest mb-10">{cat.count}</p>
                  <div className="mt-auto w-12 h-12 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-600 group-hover:text-primary group-hover:shadow-soft transition-all shrink-0">
                    <ArrowRight size={22} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Trust & Quality v5 */}
      <section className="py-32 bg-slate-900 dark:bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary rounded-full blur-[150px] -mr-96 -mt-96"></div>
          <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-blue-500 rounded-full blur-[150px] -ml-96 -mb-96"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div className="order-2 lg:order-1 grid grid-cols-2 gap-6">
              {[
                { icon: ShieldCheck, title: "BIS Certified", desc: "100% compliant parts." },
                { icon: Globe, title: "Global Sourcing", desc: "Top brands worldwide." },
                { icon: Clock, title: "Express Logistics", desc: "Same day dispatch." },
                { icon: CheckCircle, title: "Expert Vetting", desc: "Tested by engineers." }
              ].map((item, i) => {
                const Icon = item.icon
                return (
                  <div key={i} className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-sm hover:bg-white/10 transition-colors">
                    <div className="p-3 bg-primary/20 text-primary rounded-xl w-fit mb-6">
                      <Icon size={24} />
                    </div>
                    <h4 className="text-xl font-black mb-2 tracking-tight text-white">{item.title}</h4>
                    <p className="text-slate-400 text-sm font-medium">{item.desc}</p>
                  </div>
                )
              })}
            </div>

            <div className="order-1 lg:order-2">
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 leading-none text-white">{t('home.quality_title')} <br /><span className="text-primary italic">{t('home.quality_italic')}</span></h2>
              <p className="text-slate-300 text-xl font-medium leading-relaxed mb-12">
                {t('home.quality_desc')}
              </p>
              <button onClick={() => navigate('/catalog')} className="btn-primary h-16 px-10 shadow-glow">
                {t('home.verify')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Call to Action v5 */}
      <section className="py-32 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 text-slate-900 dark:text-white leading-none">
              {t('home.discover_title')} <br />
              <span className="text-primary italic">{t('home.discover_italic')}</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-2xl font-medium max-w-2xl mx-auto leading-relaxed">
              {t('home.discover_desc')}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button 
              onClick={() => navigate('/catalog')}
              className="btn-primary h-20 px-12 text-xl shadow-glow group"
            >
              {t('catalog.title')} {t('catalog.title_italic')}
              <ArrowRight size={24} className="transition-transform group-hover:translate-x-2" />
            </button>
            <div className="flex -space-x-4">
              {[1, 2, 3, 4, 5].map(n => (
                <div key={n} className="w-14 h-14 rounded-full border-4 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden shadow-sm">
                  <img src={`https://i.pravatar.cc/150?u=${n+50}`} alt="user" />
                </div>
              ))}
              <div className="w-14 h-14 rounded-full border-4 border-white dark:border-slate-900 bg-primary text-white flex items-center justify-center font-black text-xs shadow-glow">
                +2k
              </div>
            </div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-4">{t('home.trusted_by')}</p>
          </div>
        </div>
      </section>

      {/* Contact & Inquiry Section v5 */}
      <section className="py-32 px-4 md:px-8" id="contact">
        <div className="container mx-auto">
          <div className="bg-slate-900 rounded-[4rem] p-12 md:p-24 text-white grid lg:grid-cols-2 gap-20 items-center overflow-hidden relative">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] -mr-32 -mt-32"></div>
            
            <div className="relative z-10">
              <h2 className="text-5xl md:text-7xl font-black mb-8 leading-none tracking-tighter">{t('contact.title')} <br /><span className="text-primary italic">{t('contact.title_italic')}</span></h2>
              <p className="text-slate-400 mb-12 text-xl font-medium leading-relaxed max-w-lg">
                {t('contact.desc')}
              </p>
              
              <div className="grid gap-8">
                <div className="flex items-center gap-6 group">
                  <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center group-hover:bg-primary transition-all">
                    <Phone size={24} className="text-primary group-hover:text-white" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{t('contact.helpline')}</h4>
                    <p className="text-xl font-black text-white">+91 98765 43210</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 group">
                  <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center group-hover:bg-primary transition-all">
                    <MapPin size={24} className="text-primary group-hover:text-white" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{t('contact.location')}</h4>
                    <p className="text-xl font-black text-white">Rasipuram Main Road, TN</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10">
              <div className="bg-white rounded-[3rem] p-10 md:p-12 text-slate-900 shadow-2xl relative overflow-hidden">
                {/* Status Overlays */}
                {submitStatus === 'success' && (
                  <div className="absolute inset-0 bg-emerald-500/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-12 text-center text-white animate-in fade-in duration-500">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-6 animate-bounce">
                      <CheckCircle size={48} />
                    </div>
                    <h3 className="text-3xl font-black mb-2 tracking-tighter">Enquiry Sent!</h3>
                    <p className="text-white/80 font-medium">Our technical team will reach out to you within 2.5 hours.</p>
                  </div>
                )}
                
                {submitStatus === 'permission-denied' && (
                  <div className="absolute inset-0 bg-amber-500/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-12 text-center text-white animate-in fade-in duration-500">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-6">
                      <ShieldCheck size={48} />
                    </div>
                    <h3 className="text-3xl font-black mb-2 tracking-tighter text-white">Permission Required</h3>
                    <p className="text-white/80 font-medium">The 'enquiries' collection is missing write permissions. Please ask the admin to update Firestore rules.</p>
                    <button onClick={() => setSubmitStatus(null)} className="mt-8 px-8 py-3 bg-white text-amber-500 rounded-full font-black text-xs uppercase tracking-widest">Close</button>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="absolute inset-0 bg-red-500/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-12 text-center text-white animate-in fade-in duration-500">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-6">
                      <AlertCircle size={48} />
                    </div>
                    <h3 className="text-3xl font-black mb-2 tracking-tighter text-white">Error Occurred</h3>
                    <p className="text-white/80 font-medium">Please check your connection and try again.</p>
                    <button onClick={() => setSubmitStatus(null)} className="mt-8 px-8 py-3 bg-white text-red-500 rounded-full font-black text-xs uppercase tracking-widest">Try Again</button>
                  </div>
                )}

                <h3 className="text-3xl font-black mb-8 tracking-tighter">{t('contact.enquiry_title')}</h3>
                <form className="space-y-6" onSubmit={handleEnquirySubmit}>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('contact.label_name')}</label>
                      <input 
                        required
                        type="text" 
                        name="name"
                        value={enquiryForm.name}
                        onChange={handleEnquiryChange}
                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold" 
                        placeholder={t('contact.placeholder_name')} 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('contact.label_phone')}</label>
                      <input 
                        required
                        type="tel" 
                        name="phone"
                        value={enquiryForm.phone}
                        onChange={handleEnquiryChange}
                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold" 
                        placeholder="+91 00000 00000" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('contact.label_message')}</label>
                    <textarea 
                      required
                      name="message"
                      value={enquiryForm.message}
                      onChange={handleEnquiryChange}
                      rows="4" 
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-primary/10 outline-none transition-all resize-none font-bold" 
                      placeholder={t('contact.placeholder_message')}
                    ></textarea>
                  </div>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="btn-primary w-full h-16 text-lg disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <RefreshCw className="animate-spin" size={24} />
                    ) : (
                      <>
                        <Send size={20} />
                        {t('contact.btn_send')}
                      </>
                    )}
                  </button>
                  {!user && (
                    <p className="text-[10px] text-slate-400 text-center font-black uppercase tracking-widest mt-4">
                      Please login to submit an enquiry
                    </p>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
