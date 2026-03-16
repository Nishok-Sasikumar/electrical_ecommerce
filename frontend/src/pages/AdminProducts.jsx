import { useState, useEffect } from "react"
import { db } from "../firebase"
import { collection, query, getDocs, deleteDoc, doc, addDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { useAuth } from "../context/AuthContext"
import { Package, Plus, Search, Edit3, Trash2, X, Image as ImageIcon, IndianRupee, Tag, Layers, ArrowLeft, Save, AlertCircle } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"

function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    image: "",
    description: "",
    specs: "",
    arModel: "",
    stock: "",
    images: ""
  })

  useEffect(() => {
    if (!user || !user.isAdmin) {
      navigate("/")
      return
    }

    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"))
        const productsData = querySnapshot.docs.map(doc => ({
          _id: doc.id,
          ...doc.data()
        }))
        setProducts(productsData)
      } catch (err) {
        console.error("Failed to fetch products:", err)
        setError("Failed to load products.")
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [user, navigate])

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product)
      setFormData({
        name: product.name || "",
        price: product.price || "",
        category: product.category || "",
        image: product.image || "",
        description: product.description || "",
        specs: Array.isArray(product.specs) ? product.specs.join("\n") : product.specs || "",
        arModel: product.arModel || "",
        stock: product.stock || "",
        images: Array.isArray(product.images) ? product.images.join(", ") : product.images || ""
      })
    } else {
      setEditingProduct(null)
      setFormData({
        name: "",
        price: "",
        category: "",
        image: "",
        description: "",
        specs: "",
        arModel: "",
        stock: "",
        images: ""
      })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingProduct(null)
    setError(null)
  }

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const productData = {
        ...(editingProduct || {}), // Preserve existing fields
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock) || 0,
        specs: formData.specs.split("\n").filter(line => line.trim() !== ""),
        images: formData.images.split(",").map(img => img.trim()).filter(img => img !== ""),
        updatedAt: serverTimestamp()
      }
      
      // Clean up internal fields if they exist
      delete productData._id;

      if (editingProduct) {
        await updateDoc(doc(db, "products", editingProduct._id), productData)
        setProducts(products.map(p => p._id === editingProduct._id ? { ...p, ...productData } : p))
      } else {
        const docRef = await addDoc(collection(db, "products"), {
          ...productData,
          createdAt: serverTimestamp()
        })
        setProducts([{ _id: docRef.id, ...productData }, ...products])
      }
      handleCloseModal()
    } catch (err) {
      console.error("Error saving product:", err)
      setError("Failed to save product. Please check your permissions.")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteDoc(doc(db, "products", productId))
        setProducts(products.filter(p => p._id !== productId))
      } catch (err) {
        console.error("Error deleting product:", err)
        alert("Failed to delete product.")
      }
    }
  }

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  )

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen pb-24 px-4 md:px-8">
      <div className="container mx-auto max-w-6xl pt-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="animate-in fade-in slide-in-from-left-8 duration-700">
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter mb-4 leading-none">
              Manage <span className="text-primary italic">Products.</span>
            </h1>
            <p className="text-muted">Add, update or remove items from your electrical catalog.</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => handleOpenModal()}
              className="btn-primary px-8 py-4 flex items-center gap-2 shadow-glow"
            >
              <Plus size={18} />
              New Product
            </button>
            <Link to="/admin" className="inline-flex items-center gap-2 text-primary hover:underline font-black uppercase tracking-widest text-[10px]">
              <ArrowLeft size={16} />
              Admin Dashboard
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-12 animate-in fade-in duration-1000">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={24} />
          <input 
            type="text" 
            placeholder="Search by name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-16 pr-8 py-6 rounded-[2.5rem] bg-slate-100 dark:bg-white/5 border-none focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-slate-700 dark:text-white shadow-soft placeholder:text-slate-400 dark:placeholder:text-slate-600"
          />
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <div key={product._id} className="glass-modern dark:bg-slate-900/50 border border-slate-100 dark:border-white/5 rounded-[3rem] p-8 shadow-soft hover:shadow-xl transition-all duration-500 group relative">
              <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <button 
                  onClick={() => handleOpenModal(product)}
                  className="p-3 bg-white dark:bg-slate-800 text-primary rounded-full shadow-lg hover:scale-110 transition-transform"
                >
                  <Edit3 size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(product._id)}
                  className="p-3 bg-white dark:bg-slate-800 text-red-500 rounded-full shadow-lg hover:scale-110 transition-transform"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              
              <div className="w-full aspect-square rounded-[2rem] bg-white dark:bg-slate-800 p-6 mb-8 flex items-center justify-center overflow-hidden relative z-0">
                <img src={product.image} alt={product.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700" />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <h3 className="font-black text-slate-900 dark:text-white leading-tight line-clamp-1">{product.name}</h3>
                  <span className="bg-primary/10 text-primary text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest flex-shrink-0">
                    {product.category}
                  </span>
                </div>
                <p className="text-2xl font-black text-primary italic">₹{product.price.toLocaleString()}</p>
                <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed">{product.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Product Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[3.5rem] p-10 md:p-12 shadow-2xl relative animate-in zoom-in-95 duration-500">
              <button 
                onClick={handleCloseModal}
                className="absolute top-8 right-8 p-3 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors text-slate-400"
              >
                <X size={24} />
              </button>

              <div className="mb-10">
                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-2">
                  {editingProduct ? 'Update' : 'Add New'} <span className="text-primary italic">Product.</span>
                </h2>
                <p className="text-sm text-slate-500 font-medium">Fill in the technical details for your catalog item.</p>
              </div>

              {error && (
                <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 rounded-2xl flex items-center gap-3">
                  <AlertCircle size={20} />
                  <p className="text-xs font-bold">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                      <Tag size={12} /> Name
                    </label>
                    <input 
                      required
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 rounded-2xl bg-slate-100 dark:bg-white/5 border-none focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-slate-700 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600"
                      placeholder="Product title"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                      <IndianRupee size={12} /> Price
                    </label>
                    <input 
                      required
                      type="number" 
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 rounded-2xl bg-slate-100 dark:bg-white/5 border-none focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-slate-700 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                      <Layers size={12} /> Category
                    </label>
                    <input 
                      required
                      type="text" 
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 rounded-2xl bg-slate-100 dark:bg-white/5 border-none focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-slate-700 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600"
                      placeholder="Lighting, Switches, etc."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                      <ImageIcon size={12} /> Main Image URL
                    </label>
                    <input 
                      required
                      type="text" 
                      name="image"
                      value={formData.image}
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 rounded-2xl bg-slate-100 dark:bg-white/5 border-none focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-slate-700 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                      <View size={12} /> 3D Model Path (GLB)
                    </label>
                    <input 
                      type="text" 
                      name="arModel"
                      value={formData.arModel}
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 rounded-2xl bg-slate-100 dark:bg-white/5 border-none focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-slate-700 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600"
                      placeholder="/models/product.glb"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                      <Package size={12} /> Stock Quantity
                    </label>
                    <input 
                      type="number" 
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 rounded-2xl bg-slate-100 dark:bg-white/5 border-none focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-slate-700 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Additional Images (Comma separated URLs)</label>
                  <textarea 
                    name="images"
                    value={formData.images}
                    onChange={handleInputChange}
                    rows="2"
                    className="w-full px-6 py-4 rounded-2xl bg-slate-100 dark:bg-white/5 border-none focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-slate-700 dark:text-white resize-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
                    placeholder="url1, url2, url3"
                  ></textarea>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Description</label>
                  <textarea 
                    required
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-6 py-4 rounded-2xl bg-slate-100 dark:bg-white/5 border-none focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-slate-700 dark:text-white resize-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
                    placeholder="Brief overview of the product..."
                  ></textarea>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Technical Specs (One per line)</label>
                  <textarea 
                    name="specs"
                    value={formData.specs}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full px-6 py-4 rounded-2xl bg-slate-100 dark:bg-white/5 border-none focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-slate-700 dark:text-white resize-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
                    placeholder="Voltage: 240V&#10;Material: Polycarbonate&#10;IP Rating: IP65"
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={saving}
                  className="btn-primary w-full h-20 text-xl shadow-glow disabled:opacity-50"
                >
                  <Save size={24} />
                  {saving ? 'Saving...' : (editingProduct ? 'Update Product' : 'Create Product')}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminProducts
