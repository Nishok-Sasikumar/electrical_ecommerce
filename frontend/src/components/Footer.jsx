import { MapPin, User, Phone, Mail, Zap, Twitter, Facebook, Instagram, ArrowUpRight } from "lucide-react"
import { Link } from "react-router-dom"
import { useTranslation } from 'react-i18next'

function Footer() {
  const currentYear = new Date().getFullYear()
  const { t } = useTranslation()

  return (
    <footer className="bg-slate-900 text-white pt-32 pb-12 relative overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-20"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 mb-24">
          {/* Brand v3 */}
          <div className="lg:col-span-5 space-y-10">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="bg-primary p-2 rounded-full shadow-glow group-hover:rotate-12 transition-transform duration-500">
                <Zap size={20} className="text-white fill-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-2xl tracking-tighter leading-none text-white">SAI RAM</span>
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">TRADERS</span>
              </div>
            </Link>
            
            <p className="text-slate-400 text-xl leading-relaxed max-w-md font-medium">
              {t('hero.desc')}
            </p>
            
            <div className="flex gap-4">
              {[Twitter, Facebook, Instagram].map((Icon, i) => (
                <a key={i} href="#" className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300 border border-white/5">
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>

          {/* Catalog Links v3 */}
          <div className="lg:col-span-3 space-y-10">
            <h4 className="text-sm font-black uppercase tracking-wider text-slate-500">{t('nav.catalog')}</h4>
            <ul className="space-y-6 font-bold text-lg">
              {['Lighting', 'Switches', 'Industrial', 'Appliances', 'Wires'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-slate-300 hover:text-primary transition-colors flex items-center justify-between group">
                    {t(`footer.cat_${link.toLowerCase()}`, { defaultValue: link })}
                    <ArrowUpRight size={16} className="opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Office v3 */}
          <div className="lg:col-span-4 space-y-10">
            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500">{t('contact.location')}</h4>
            <div className="space-y-8">
              <div className="flex items-start gap-5">
                <div className="p-3 bg-white/5 rounded-2xl text-primary">
                  <MapPin size={24} />
                </div>
                <div>
                  <p className="font-black text-white text-lg tracking-tight leading-snug">
                    Rasipuram Main Road, <br />
                    Athanur, Namakkal - 636301
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-5">
                <div className="p-3 bg-white/5 rounded-2xl text-primary">
                  <User size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{t('contact.proprietor', { defaultValue: 'Proprietor' })}</p>
                  <p className="font-black text-white text-lg">Ganesh Shankar</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Legal v3 */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-slate-500 font-bold text-sm">
            © {currentYear} SAI RAM TRADERS. {t('footer.tagline', { defaultValue: 'High-Performance Electricals.' })}
          </p>
          <div className="flex gap-10 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Returns</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
