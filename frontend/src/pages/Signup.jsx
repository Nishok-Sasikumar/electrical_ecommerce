import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useTranslation } from "react-i18next"
import { Mail, Lock, ArrowRight, Zap, AlertCircle, User, CheckCircle, ShieldCheck, KeyRound, RefreshCw } from "lucide-react"
import axios from "axios"

function Signup() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("user")
  const [otp, setOtp] = useState("")
  const [step, setStep] = useState(1) // 1: Details, 2: OTP
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { register, loginWithGoogle, user } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()

  useEffect(() => {
    if (user && user.emailVerified) {
      navigate("/")
    }
  }, [user, navigate])

  const handleGetOtp = async (e) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await axios.post("http://127.0.0.1:5000/api/otp/send", { email })
      if (response.data.success) {
        setStep(2)
        setSuccess("OTP sent to your email. Please check your inbox.")
      } else {
        setError(response.data.message || "Failed to send OTP")
      }
    } catch (err) {
      console.error("Signup OTP Send Error:", err)
      setError(err.response?.data?.message || "Error connecting to server. Please ensure the backend is running.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyAndSignup = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsLoading(true)

    try {
      // 1. Verify OTP with backend
      const response = await axios.post("http://127.0.0.1:5000/api/otp/verify", { email, otp })
      
      if (response.data.success) {
        // 2. Proceed with actual registration in Firebase
        const result = await register(name, email, password, role)
        if (!result.success) {
          setError(result.message)
        } else {
          setSuccess("Account created successfully! Please log in.")
          // Optional: redirect to login after a few seconds
          setTimeout(() => navigate("/login"), 3000)
        }
      } else {
        setError(response.data.message || "Invalid OTP")
      }
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || "Failed to verify OTP")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError("")
    setIsLoading(true)
    const result = await loginWithGoogle()
    if (!result.success) {
      setError(result.message)
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center py-24 px-6 transition-colors duration-500">
      <div className="max-w-md w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 md:p-12 shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-white/5">
          <div className="text-center mb-10">
            <Link to="/" className="inline-flex items-center gap-2 mb-8 group">
              <div className="bg-primary p-2 rounded-full shadow-glow group-hover:rotate-12 transition-transform">
                <Zap size={20} className="text-white fill-white" />
              </div>
              <span className="font-black text-xl tracking-tighter text-slate-900 dark:text-white">SAI RAM</span>
            </Link>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter">{t('auth.signup_title')}</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">{t('auth.signup_subtitle')}</p>
          </div>

          {success && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 p-4 rounded-2xl flex items-center gap-3 mb-8">
              <CheckCircle2 size={20} />
              <p className="text-sm font-bold">{success}</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-2xl flex items-center gap-3 mb-8 animate-shake">
              <AlertCircle size={20} />
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleGetOtp} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">{t('auth.label_name')}</label>
                <div className="relative">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-700" size={18} />
                  <input 
                    required
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-14 pr-6 py-5 rounded-2xl bg-slate-50 dark:bg-white/5 border-none focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-slate-700 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600"
                    placeholder={t('contact.placeholder_name')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">{t('auth.label_email')}</label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-700" size={18} />
                  <input 
                    required
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-14 pr-6 py-5 rounded-2xl bg-slate-50 dark:bg-white/5 border-none focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-slate-700 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">{t('auth.label_password')}</label>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-700" size={18} />
                  <input 
                    required
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-14 pr-6 py-5 rounded-2xl bg-slate-50 dark:bg-white/5 border-none focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-slate-700 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Account Type</label>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    type="button"
                    onClick={() => setRole("user")}
                    className={`flex items-center justify-center gap-2 py-4 rounded-2xl font-bold transition-all ${role === 'user' ? 'bg-primary text-white shadow-glow' : 'bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400'}`}
                  >
                    <User size={18} /> User
                  </button>
                  <button 
                    type="button"
                    onClick={() => setRole("admin")}
                    className={`flex items-center justify-center gap-2 py-4 rounded-2xl font-bold transition-all ${role === 'admin' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl' : 'bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400'}`}
                  >
                    <ShieldCheck size={18} /> Admin
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="btn-primary w-full h-16 text-lg shadow-glow group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    Send OTP
                    <ArrowRight className="transition-transform group-hover:translate-x-2" size={24} />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyAndSignup} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Enter 6-Digit OTP</label>
                <div className="relative">
                  <KeyRound className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-700" size={18} />
                  <input 
                    required
                    type="text" 
                    maxLength="6"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full pl-14 pr-6 py-5 rounded-2xl bg-slate-50 dark:bg-white/5 border-none focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-slate-700 dark:text-white text-center text-2xl tracking-[0.5em] placeholder:text-slate-300 dark:placeholder:text-slate-700"
                    placeholder="000000"
                  />
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium text-center mt-2">
                  Didn't receive code? <button type="button" onClick={handleGetOtp} className="text-primary font-black hover:underline">Resend OTP</button>
                </p>
              </div>

              <div className="flex gap-4">
                <button 
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-grow py-4 bg-slate-50 dark:bg-white/5 rounded-2xl font-bold text-slate-500 dark:text-slate-400"
                >
                  Back
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="btn-primary flex-[2] h-16 text-lg shadow-glow group disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      Verify & Sign Up
                      <ArrowRight className="transition-transform group-hover:translate-x-2" size={24} />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 flex items-center gap-4 text-slate-300 dark:text-slate-700">
            <div className="h-px bg-slate-100 dark:bg-white/5 flex-grow"></div>
            <span className="text-[10px] font-black uppercase tracking-widest">OR</span>
            <div className="h-px bg-slate-100 dark:bg-white/5 flex-grow"></div>
          </div>

          <button 
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="mt-6 w-full h-16 rounded-2xl border border-slate-200 flex items-center justify-center gap-3 font-bold text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/action/google.svg" alt="Google" className="w-5 h-5" />
            {t('auth.btn_google')}
          </button>

          <div className="mt-10 pt-10 border-t border-slate-100 text-center">
            <p className="text-slate-500 font-medium">
              {t('auth.have_account')} <br />
              <Link to="/login" className="text-primary font-black hover:underline inline-flex items-center gap-1 mt-2">
                {t('auth.link_login')} <ArrowRight size={16} />
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Signup

