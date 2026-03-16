import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useTranslation } from "react-i18next"
import { Mail, Lock, ArrowRight, Zap, AlertCircle } from "lucide-react"

function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login, loginWithGoogle, user } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()

  useEffect(() => {
    if (user && user.emailVerified) {
      navigate("/")
    }
  }, [user, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    const result = await login(email, password)
    if (!result.success) {
      setError(result.message)
    }
    setIsLoading(false)
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
            <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter">{t('auth.login_title')}</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">{t('auth.login_subtitle')}</p>
            {user && (
              <div className="mt-4 flex items-center justify-center gap-2">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${user.isAdmin ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'bg-primary/10 text-primary'}`}>
                  Logged in as {user.isAdmin ? 'Admin' : 'User'}
                </span>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-2xl flex items-center gap-3 mb-8 animate-shake">
              <AlertCircle size={20} />
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
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

            <button 
              type="submit" 
              disabled={isLoading}
              className="btn-primary w-full h-16 text-lg shadow-glow group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  {t('auth.btn_login')}
                  <ArrowRight className="transition-transform group-hover:translate-x-2" size={24} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-4 text-slate-300 dark:text-slate-700">
            <div className="h-px bg-slate-100 dark:bg-white/5 flex-grow"></div>
            <span className="text-[10px] font-black uppercase tracking-widest">OR</span>
            <div className="h-px bg-slate-100 dark:bg-white/5 flex-grow"></div>
          </div>

          <button 
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="mt-6 w-full h-16 rounded-2xl border border-slate-200 dark:border-white/10 flex items-center justify-center gap-3 font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-all disabled:opacity-50"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/action/google.svg" alt="Google" className="w-5 h-5" />
            {t('auth.btn_google')}
          </button>

          <div className="mt-10 pt-10 border-t border-slate-100 dark:border-white/5 text-center">
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              {t('auth.no_account')} <br />
              <Link to="/signup" className="text-primary font-black hover:underline inline-flex items-center gap-1 mt-2">
                {t('auth.link_signup')} <ArrowRight size={16} />
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
