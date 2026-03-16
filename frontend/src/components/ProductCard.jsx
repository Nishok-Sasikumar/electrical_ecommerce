import { Link, useNavigate } from "react-router-dom"
import { Eye, ShoppingCart, Star, Zap, ArrowRight, Plus, Heart, Share2, Check, View } from "lucide-react"
import { useCart } from "../context/CartContext"
import { useAuth } from "../context/AuthContext"
import { useState } from "react"

function ProductCard({ product }) {
  const { addToCart } = useCart()
  const { user, toggleWishlist } = useAuth()
  const navigate = useNavigate()
  const [shareSuccess, setShareSuccess] = useState(false)

  const isFavorited = user?.wishlist?.includes(product._id)

  const handleToggleFavorite = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) {
      navigate("/login")
      return
    }
    await toggleWishlist(product._id)
  }

  const handleShare = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    const shareData = {
      title: product.name,
      text: product.description,
      url: `${window.location.origin}/product/${product._id}`
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(`${window.location.origin}/product/${product._id}`)
        setShareSuccess(true)
        setTimeout(() => setShareSuccess(false), 2000)
      }
    } catch (err) {
      console.error("Error sharing:", err)
    }
  }

  return (
    <div className="card-v3 group dark:bg-slate-900/50 dark:border-white/5">
      {/* Image Showcase */}
      <div className="relative aspect-square overflow-hidden bg-slate-50 dark:bg-slate-800 flex items-center justify-center p-8">
        <img 
          src={product.image || "https://via.placeholder.com/400?text=No+Image"} 
          alt={product.name}
          className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110 relative z-0"
          onError={(e) => { e.target.src = "https://via.placeholder.com/400?text=Error" }}
        />
        
        {/* Quick Actions Overlay */}
        <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-all duration-500 backdrop-blur-[2px] flex items-center justify-center gap-3 z-20">
          <Link 
            to={`/product/${product._id}`}
            className="w-12 h-12 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300 shadow-xl"
            title="View Details"
          >
            <Eye size={20} />
          </Link>
          {product.arModel && (
            <Link 
              to={`/ar/${product._id}`}
              className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center hover:scale-110 transition-all duration-300 shadow-glow"
              title="3D View"
            >
              <View size={20} />
            </Link>
          )}
          <button 
            onClick={() => addToCart(product)}
            className="w-12 h-12 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300 shadow-xl"
            title="Add to Cart"
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Top Badges */}
        <div className="absolute top-6 left-6 flex flex-col gap-2 z-10">
          <span className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-primary text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-[0.15em] shadow-sm border border-slate-100 dark:border-white/10">
            {product.category}
          </span>
          {product.arModel ? (
            <span className="bg-emerald-500 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-[0.15em] shadow-glow flex items-center gap-1.5 animate-pulse">
              <Zap size={10} className="fill-white" />
              3D Live
            </span>
          ) : (
            <div className="flex flex-col gap-1">
              <span className="bg-slate-500/50 backdrop-blur-md text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-[0.15em]">
                3D Pending
              </span>
              {user?.isAdmin && (
                <Link 
                  to="/admin/products" 
                  className="bg-primary/20 hover:bg-primary/40 text-primary text-[7px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest text-center transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  Fix Model
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Favorite & Share Quick Buttons */}
        <div className="absolute top-6 right-6 flex flex-col gap-2 z-10">
          <button 
            onClick={handleToggleFavorite}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm ${isFavorited ? 'bg-red-500 text-white' : 'bg-white dark:bg-slate-800 text-slate-400 hover:text-red-500'}`}
            title={isFavorited ? "Remove from Wishlist" : "Add to Wishlist"}
          >
            <Heart size={16} fill={isFavorited ? "currentColor" : "none"} />
          </button>
          <button 
            onClick={handleShare}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm ${shareSuccess ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-slate-800 text-slate-400 hover:text-primary'}`}
            title="Share Product"
          >
            {shareSuccess ? <Check size={16} /> : <Share2 size={16} />}
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-10">
        <div className="flex items-center gap-1.5 mb-5">
          <Star size={12} className="fill-amber-400 text-amber-400" />
          <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none pb-0.5">Premium Choice</span>
        </div>
        
        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4 line-clamp-2 group-hover:text-primary transition-colors tracking-tight min-h-[4rem] flex items-start leading-[1.4]">
          {product.name}
        </h3>
        
        <div className="flex items-center justify-between mt-8 pt-8 border-t border-slate-100 dark:border-white/10">
          <div>
            <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none mb-2">Price</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter italic">₹{product.price}</p>
          </div>
          
          <div className="flex items-center gap-3">
            {product.arModel && (
              <Link 
                to={`/ar/${product._id}`}
                className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center hover:bg-emerald-600 transition-all duration-300 shadow-glow group/ar"
                title="View in 3D Space"
              >
                <Zap size={18} className="fill-white group-hover/ar:animate-bounce" />
              </Link>
            )}
            <button 
              onClick={() => addToCart(product)}
              className="w-12 h-12 bg-slate-900 dark:bg-primary text-white rounded-2xl flex items-center justify-center hover:bg-primary dark:hover:bg-primary/80 transition-all duration-300 shadow-lg"
              title="Add to Cart"
            >
              <ShoppingCart size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductCard
