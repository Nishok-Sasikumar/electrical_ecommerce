import { Link } from "react-router-dom"
import { ShoppingBag, ArrowLeft, Trash2, Plus, Minus, CreditCard, ShoppingCart as CartIcon, ArrowRight } from "lucide-react"
import { useCart } from "../context/CartContext"
import { useTranslation } from 'react-i18next'

function Cart() {
  const { cartItems, removeFromCart, updateQuantity, cartTotal } = useCart()
  const { t } = useTranslation()

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen pb-24 px-4 md:px-8 transition-colors duration-500">
      <div className="container mx-auto max-w-6xl pt-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="animate-in fade-in slide-in-from-left-8 duration-700">
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter mb-4 leading-none">{t('cart.title')} <span className="text-primary italic">{t('cart.title_italic')}</span></h1>
            <p className="text-muted dark:text-slate-400">{t('cart.title_desc', { defaultValue: 'Review your items before we finalize the logistics.' })}</p>
          </div>
          <Link to="/catalog" className="inline-flex items-center gap-2 text-primary hover:underline font-black uppercase tracking-widest text-[10px]">
            <ArrowLeft size={16} />
            {t('catalog.badge')}
          </Link>
        </div>

        {cartItems.length === 0 ? (
          <div className="bg-slate-50 dark:bg-white/5 rounded-[3rem] p-24 text-center border border-slate-100/50 dark:border-white/10 animate-in zoom-in-95 duration-700">
            <div className="w-24 h-24 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-8 text-slate-200 dark:text-slate-700 shadow-soft">
              <CartIcon size={40} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">{t('cart.empty')}</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-12 max-w-xs mx-auto font-medium">
              {t('cart.empty_desc')}
            </p>
            <Link to="/catalog" className="btn-primary inline-flex px-12 h-16 shadow-glow">
              {t('cart.btn_explore')}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            {/* Cart Items v3 */}
            <div className="lg:col-span-8 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
              {cartItems.map((item) => (
                <div key={item._id} className="flex flex-col sm:flex-row items-center gap-10 pb-8 border-b border-slate-100 dark:border-white/5 group">
                  <div className="w-32 h-32 bg-slate-50 dark:bg-white/5 rounded-[2rem] overflow-hidden flex-shrink-0 p-6 border border-slate-100/50 dark:border-white/5 group-hover:bg-white dark:group-hover:bg-white/10 transition-colors">
                    <img src={item.image} alt={item.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  
                  <div className="flex-grow text-center sm:text-left min-w-0">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest mb-3 block">
                      {item.category}
                    </span>
                    <h3 className="font-black text-slate-900 dark:text-white text-2xl mb-3 tracking-tighter leading-[1.4] truncate" title={item.name}>{item.name}</h3>
                    <p className="text-slate-900 dark:text-slate-300 font-black text-lg tracking-tight">₹{item.price}</p>
                  </div>

                  <div className="flex items-center gap-6 bg-slate-50 dark:bg-white/5 p-2 rounded-full border border-slate-100 dark:border-white/5">
                    <button 
                      onClick={() => updateQuantity(item._id, -1)}
                      className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-800 rounded-full transition-all text-slate-400 hover:text-primary hover:shadow-soft"
                    >
                      <Minus size={18} />
                    </button>
                    <span className="font-black text-lg w-6 text-center text-slate-900 dark:text-white">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item._id, 1)}
                      className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-800 rounded-full transition-all text-slate-400 hover:text-primary hover:shadow-soft"
                    >
                      <Plus size={18} />
                    </button>
                  </div>

                  <div className="text-right flex flex-col items-center sm:items-end gap-3">
                    <p className="font-black text-slate-900 dark:text-white text-2xl tracking-tighter leading-none">₹{(item.price * item.quantity).toFixed(2)}</p>
                    <button 
                      onClick={() => removeFromCart(item._id)}
                      className="text-slate-300 dark:text-slate-700 hover:text-red-500 dark:hover:text-red-400 transition-colors p-2"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Order Summary v3 */}
            <div className="lg:col-span-4 animate-in fade-in slide-in-from-right-8 duration-700">
              <div className="bg-slate-50 dark:bg-white/5 rounded-[3.5rem] p-10 border border-slate-100/50 dark:border-white/5 sticky top-32 shadow-soft">
                <h3 className="text-2xl font-black mb-10 tracking-tighter leading-none text-slate-900 dark:text-white">{t('cart.summary')}</h3>
                <div className="space-y-6 mb-12">
                  <div className="flex justify-between font-bold text-slate-500">
                    <span className="text-sm uppercase tracking-wider">{t('cart.subtotal')}</span>
                    <span className="text-slate-900 dark:text-white font-black tracking-tight">₹{cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-500">
                    <span className="text-sm uppercase tracking-wider">{t('cart.delivery')}</span>
                    <span className="text-emerald-500 font-black tracking-widest text-[10px]">{t('cart.free')}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-500">
                    <span className="text-sm uppercase tracking-wider">{t('cart.tax')}</span>
                    <span className="text-slate-900 dark:text-white font-black tracking-tight">₹{(cartTotal * 0.18).toFixed(2)}</span>
                  </div>
                  <div className="h-px bg-slate-200/50 dark:bg-white/10 my-8"></div>
                  <div className="flex justify-between font-black text-4xl tracking-tighter leading-none text-slate-900 dark:text-white">
                    <span>{t('cart.total')}</span>
                    <span className="text-primary">₹{(cartTotal * 1.18).toFixed(2)}</span>
                  </div>
                </div>
                
                <Link to="/checkout" className="btn-primary w-full h-20 text-xl shadow-glow group">
                  {t('cart.btn_checkout')}
                  <ArrowRight size={22} className="transition-transform group-hover:translate-x-2" />
                </Link>
                
                <p className="mt-8 text-center text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.2em]">
                  {t('cart.secure')}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Cart
