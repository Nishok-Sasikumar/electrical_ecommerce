import { useEffect, useState, useMemo } from "react"
import { Link } from "react-router-dom"
import { db } from "../firebase"
import { collection, getDocs } from "firebase/firestore"
import ProductCard from "../components/ProductCard"
import { Search, Filter, Sparkles, Database, Zap } from "lucide-react"
import { useTranslation } from 'react-i18next'

function Catalog() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [showOnly3D, setShowOnly3D] = useState(false)
  const { t } = useTranslation()

  useEffect(() => {
    window.scrollTo(0, 0)
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"))
        const productsData = querySnapshot.docs.map(doc => ({
          _id: doc.id,
          ...doc.data()
        }))
        setProducts(productsData)
      } catch (err) {
        console.error("Failed to fetch products from Firestore:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const categories = useMemo(() => {
    const cats = products.map(p => p.category)
    return ["All", ...new Set(cats)]
  }, [products])

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.description?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === "All" || product.category === selectedCategory
      const matches3D = !showOnly3D || product.arModel
      return matchesSearch && matchesCategory && matches3D
    })
  }, [products, searchQuery, selectedCategory, showOnly3D])

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen pb-24 px-4 md:px-8">
      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-20">
          <div className="max-w-xl animate-in fade-in slide-in-from-left-8 duration-700">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-primary border border-emerald-100 dark:border-emerald-800 mb-6">
              <Sparkles size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">{t('catalog.badge')}</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-none text-slate-900 dark:text-white">{t('catalog.title')} <span className="text-primary italic">{t('catalog.title_italic')}</span></h1>
            <p className="text-muted dark:text-slate-400">{t('home.discover_desc')}</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:max-w-3xl animate-in fade-in slide-in-from-right-8 duration-700">
            <div className="relative flex-grow group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-primary transition-colors" size={20} />
              <input 
                type="text" 
                placeholder={t('catalog.search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-16 pr-8 py-6 bg-slate-50 dark:bg-white/5 rounded-2xl border-none focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-slate-700 dark:text-white leading-relaxed placeholder:text-slate-400 dark:placeholder:text-slate-600"
              />
            </div>
            
            <div className="relative min-w-[180px]">
              <Filter className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-16 pr-12 py-6 bg-slate-50 dark:bg-white/5 rounded-2xl border-none focus:ring-4 focus:ring-primary/10 outline-none transition-all appearance-none cursor-pointer font-black text-primary uppercase tracking-wider text-[11px] leading-tight"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{cat}</option>
                ))}
              </select>
            </div>

            <button 
              onClick={() => setShowOnly3D(!showOnly3D)}
              className={`flex items-center gap-3 px-8 py-6 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all border-none outline-none ${showOnly3D ? 'bg-emerald-500 text-white shadow-glow' : 'bg-slate-50 dark:bg-white/5 text-slate-400'}`}
              title="Filter 3D Ready Products"
            >
              <Zap size={16} className={showOnly3D ? 'fill-white' : ''} />
              {showOnly3D ? 'All View' : '3D Only'}
            </button>

            <Link 
              to="/seed-firestore"
              className="flex items-center justify-center w-16 h-auto bg-slate-50 dark:bg-white/5 text-slate-400 rounded-2xl hover:text-primary transition-all border-none outline-none"
              title="Admin: Sync 3D Models"
            >
              <Database size={20} />
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
              <div key={n} className="aspect-[3/4] bg-slate-100 dark:bg-white/5 rounded-[2.5rem] animate-pulse"></div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-40 rounded-[3rem] bg-slate-50 dark:bg-white/5 border-2 border-dashed border-slate-200 dark:border-white/10">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 text-primary">
              <Database size={40} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Catalogue Database Empty.</h3>
            <p className="text-slate-500 mb-10 font-medium dark:text-slate-400">No electrical components found in the cloud storage.</p>
            <Link to="/seed-firestore" className="btn-primary inline-flex px-12 shadow-glow">
              Restore Catalogue Data
            </Link>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {filteredProducts.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-40 rounded-[3rem] bg-slate-50 dark:bg-white/5 border-2 border-dashed border-slate-200 dark:border-white/10">
            <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 text-slate-300 dark:text-slate-700">
              <Search size={40} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{t('catalog.no_results')}</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-10 font-medium">{t('catalog.no_results_desc')}</p>
            <button 
              onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
              className="btn-primary inline-flex px-12 shadow-glow"
            >
              {t('catalog.reset')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Catalog
