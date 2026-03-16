import {BrowserRouter,Routes,Route} from "react-router-dom"

import Home from "./pages/Home"
import Catalog from "./pages/Catalog"
import ProductPage from "./pages/ProductPage"
import Cart from "./pages/Cart"
import ARView from "./pages/ARView"
import Checkout from "./pages/Checkout"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import MyOrders from "./pages/MyOrders"
import Profile from "./pages/Profile"
import Wishlist from "./pages/Wishlist"
import Settings from "./pages/Settings"
import AdminDashboard from "./pages/AdminDashboard"
import AdminProducts from "./pages/AdminProducts"
import SeedFirestore from "./pages/SeedFirestore"

import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import { useAuth } from "./context/AuthContext"
import { Navigate } from "react-router-dom"

const UserRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) {
    return <Navigate to="/login" replace />
  }
  return children
}

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user || !user.isAdmin) {
    return <Navigate to="/" replace />
  }
  return children
}

function App(){

return(

<BrowserRouter>

<div className="flex flex-col min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-500">

<Navbar/>

<main className="pt-20">
<Routes>

<Route path="/" element={<Home/>} />
<Route path="/catalog" element={<Catalog/>} />

<Route path="/product/:id" element={<ProductPage/>} />

<Route path="/cart" element={<UserRoute><Cart/></UserRoute>} />

<Route path="/ar/:id" element={<ARView/>} />

<Route path="/checkout" element={<UserRoute><Checkout/></UserRoute>} />
<Route path="/login" element={<Login/>} />
<Route path="/signup" element={<Signup/>} />
<Route path="/wishlist" element={<UserRoute><Wishlist/></UserRoute>} />
<Route path="/my-orders" element={<UserRoute><MyOrders/></UserRoute>} />
<Route path="/profile" element={<Profile/>} />
<Route path="/settings" element={<Settings/>} />
<Route path="/admin" element={<AdminRoute><AdminDashboard/></AdminRoute>} />
<Route path="/admin/products" element={<AdminRoute><AdminProducts/></AdminRoute>} />
<Route path="/seed-firestore" element={<SeedFirestore/>} />

</Routes>
</main>

<Footer/>

</div>

</BrowserRouter>

)

}

export default App