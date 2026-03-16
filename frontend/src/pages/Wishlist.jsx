import { useEffect, useState, useMemo } from "react"
import { db } from "../firebase"
import { collection, getDocs, query, where, documentId } from "firebase/firestore"
import ProductCard from "../components/ProductCard"
import { Search, Filter, Sparkles, Database, Heart, ArrowRight } from "lucide-react"
import { useTranslation } from 'react-i18next'
import { useAuth } from "../context/AuthContext"
import { Link } from "react-router-dom"

function Wishlist() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { t } = useTranslation()

  useEffect(() => {
    window.scrollTo(0, 0)
    const fetchWishlistProducts = async () => {
      if (!user?.wishlist || user.wishlist.length === 0) {
        setProducts([])
        setLoading(false)
        return
      }

      try {
        // Firestore 'in' query supports up to 10 IDs
        // For larger wishlists, we'd need to chunk the requests
        const wishlistChunks = []
        for (let i = 0; i < user.wishlist.length; i += 10) {
          wishlistChunks.push(user.wishlist.slice(i, i + 10))
        }

        const allProducts = []
        for (const chunk of wishlistChunks) {
          const q = query(collection(db, "products"), where(documentId(), "in", chunk))
          const querySnapshot = await getDocs(q)
          const chunkData = querySnapshot.docs.map(doc => ({
            _id: doc.id,
            ...doc.data()
          }))
          allProducts.push(...chunkData)
        }
        
        setProducts(allProducts)
      } catch (err) {
        console.error("Failed to fetch wishlist products:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchWishlistProducts()
  }, [user?.wishlist])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  )

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen pb-24 px-4 md:px-8">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-20">
          <div className="max-w-xl animate-in fade-in slide-in-from-left-8 duration-700">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 dark:bg-red-900/20 text-red-500 border border-red-100 dark:border-red-800 mb-6">
              <Heart size={16} fill="currentColor" />
              <span className="text-[10px] font-black uppercase tracking-widest">My Favorites</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-none text-slate-900 dark:text-white">Your <span className="text-primary italic">Wishlist.</span></h1>
            <p className="text-muted dark:text-slate-400 text-lg">Items you've saved for future projects and electrical upgrades.</p>
          </div>
          <Link to="/catalog" className="btn-primary px-10 h-16 shadow-glow inline-flex items-center gap-3">
            Continue Shopping
            <ArrowRight size={20} />
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-40 rounded-[4rem] bg-slate-50 dark:bg-white/5 border-2 border-dashed border-slate-200 dark:border-white/10 animate-in zoom-in-95 duration-700">
            <div className="w-24 h-24 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-10 text-red-500 shadow-sm">
              <Heart size={48} />
            </div>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Your Wishlist is Empty.</h3>
            <p className="text-slate-500 dark:text-slate-400 font-bold mb-10 max-w-sm mx-auto">Browse our high-quality electrical components and save your favorites here.</p>
            <Link to="/catalog" className="btn-primary px-12 h-16 shadow-glow">
              Explore Catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Wishlist
