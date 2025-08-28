// src/App.jsx
import React, { useEffect, useState } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import api from "./api";
import LoginModal from "./components/LoginModal.jsx";
import AdminDashboard from "./components/AdminDashboard.jsx";
import { motion, AnimatePresence } from "framer-motion";
import { useSwipeable } from "react-swipeable";
import { Typewriter } from "react-simple-typewriter";

const ProductCard = ({ product, onOpen }) => (
  <div className="bg-white rounded-2xl shadow hover:-translate-y-1 transition p-4">
    <div className="aspect-[4/3] bg-gray-100 rounded-xl mb-3 overflow-hidden flex items-center justify-center">
      <img
        className="w-full h-full object-cover"
        src={`/api/products/${product._id}/image/0`}
        alt={product.title}
        onError={(e) => {
          e.target.style.display = "none";
        }}
      />
    </div>
    <h3 className="text-lg font-bold">{product.title}</h3>
    <p className="text-gray-600 line-clamp-2">{product.description}</p>
    <div className="flex items-center justify-between mt-3">
      <span className="text-xl font-bold text-green-600">
        Rs. {product.price}
      </span>
      <button
        className="px-3 py-2 bg-green-500 text-white rounded-lg"
        onClick={() => onOpen(product)}
      >
        View
      </button>
    </div>
  </div>
);

const Home = () => {
  const [products, setProducts] = useState([]);
  const [active, setActive] = useState(null);
  const [cart, setCart] = useState(() =>
    JSON.parse(localStorage.getItem("cart") || "[]")
  );
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const nextImage = () => {
    setDirection(1);
    setImageIndex((i) => Math.min(active.imagesCount - 1, i + 1));
  };

  const prevImage = () => {
    setDirection(-1);
    setImageIndex((i) => Math.max(0, i - 1));
  };
  useEffect(() => {
    (async () => {
      const { data } = await api.get("/products");
      setProducts(data);
    })();
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const handlers = useSwipeable({
    onSwipedLeft: () => nextImage(),
    onSwipedRight: () => prevImage(),
  });

  const addToCart = (p) => {
    setCart((prev) => {
      const idx = prev.findIndex((i) => i.productId === p._id);
      if (idx > -1) {
        const copy = [...prev];
        copy[idx].quantity += 1;
        return copy;
      }
      return [
        ...prev,
        { productId: p._id, title: p.title, price: p.price, quantity: 1 },
      ];
    });
    setActive(null);
    setCartOpen(true);
  };

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  const [showLogin, setShowLogin] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const checkout = async () => {
    const customer = JSON.parse(localStorage.getItem("customer") || "{}");
    const { data } = await api.post("/orders", { customer, items: cart });
    alert("Order placed! ID: " + data._id);
    setCart([]);
    setCartOpen(false);
  };

  const openProduct = async (productId) => {
    const res = await api.get(`/products/${productId}`); // 👈 get full product details
    const data = res.data;
    setActive(data);
    setImageIndex(0);
  };
  return (
    <div>
      {/* Header */}
      <header className="sticky top-0 bg-white border-b-4 border-green-400 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold">
            PeelnCraft
          </Link>
          <nav className="hidden md:flex gap-6 items-center">
            <a href="#products" className="hover:text-green-600">
              Products
            </a>
            <a href="#contact" className="hover:text-green-600">
              Contact
            </a>
            {!user ? (
              <button
                onClick={() => setShowLogin(true)}
                className="hover:text-green-600"
              >
                Login
              </button>
            ) : (
              <div className="relative">
                {/* Profile Icon */}
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                >
                  👤
                </button>

                {/* Dropdown */}
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border rounded-xl shadow-lg p-3 z-20">
                    <div className="px-2 py-1 font-bold border-b mb-2">
                      {user.name || "User"}
                    </div>
                    {user.isAdmin && (
                      <Link
                        to="/admin"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block px-2 py-1 hover:bg-gray-100 rounded"
                      >
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        localStorage.removeItem("token");
                        localStorage.removeItem("user");
                        location.reload();
                      }}
                      className="block w-full text-left px-2 py-1 hover:bg-gray-100 rounded"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Cart button */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2 hover:text-green-600"
            >
              🛒
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                  {cart.reduce((sum, i) => sum + i.quantity, 0)}
                </span>
              )}
            </button>
          </nav>
          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2 focus:outline-none"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            ☰
          </button>
        </div>
        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden bg-white border-t shadow-lg px-4 py-3 space-y-3"
            >
              <a href="#products" className="block hover:text-green-600">
                Products
              </a>
              <a href="#contact" className="block hover:text-green-600">
                Contact
              </a>
              {!user ? (
                <button
                  onClick={() => {
                    setShowLogin(true);
                    setMobileOpen(false);
                  }}
                  className="block w-full text-left hover:text-green-600"
                >
                  Login
                </button>
              ) : (
                <button
                  onClick={() => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    location.reload();
                  }}
                  className="block w-full text-left hover:text-green-600"
                >
                  Logout
                </button>
              )}
              <button
                onClick={() => {
                  setCartOpen(true);
                  setMobileOpen(false);
                }}
                className="block hover:text-green-600"
              >
                🛒 Cart ({cart.reduce((sum, i) => sum + i.quantity, 0)})
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      {/* Hero */}
      <section className="bg-gradient-to-br from-green-400 via-green-500 to-emerald-600 text-white py-16 text-center px-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight sm:leading-snug md:leading-normal">
          <Typewriter
            words={[
              "Welcome to PeelnCraft",
              "Custom Cards",
              "Creative Materials",
            ]}
            loop={0} // 0 = infinite loop
            cursor
            cursorStyle="|"
            typeSpeed={70}
            deleteSpeed={50}
            delaySpeed={1500}
          />
        </h1>
        <p className="text-base sm:text-lg md:text-xl lg:text-2xl opacity-90 max-w-2xl mx-auto leading-relaxed">
          Custom cards, crafting supplies & creative materials
        </p>
      </section>
      {/* Products */}
      <section id="products" className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold">Our Products</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => (
              <ProductCard
                key={p._id}
                product={p}
                onOpen={() => openProduct(p._id)}
              />
            ))}
          </div>
        </div>
      </section>
      {/* Product Modal */}
      {active && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-2xl font-bold">{active.title}</h3>
              <button onClick={() => setActive(null)}>✕</button>
            </div>
            {/* Image Slider */}
            <div className="w-full mb-3">
              <div
                {...handlers}
                className="w-full h-64 relative overflow-hidden rounded-lg"
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={imageIndex}
                    src={`/api/products/${active._id}/image/${imageIndex}`}
                    alt={active.title}
                    className="absolute w-full h-full object-cover"
                    initial={{ x: direction === 1 ? 300 : -300, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: direction === 1 ? -300 : 300, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  />
                </AnimatePresence>
              </div>

              {/* Controls below image */}
              {active.imagesCount > 1 && (
                <div className="flex items-center justify-between mt-3">
                  {/* Prev button */}
                  <button
                    onClick={prevImage}
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50"
                    disabled={imageIndex === 0}
                  >
                    ‹ Prev
                  </button>

                  {/* Dots in middle */}
                  <div className="flex gap-2">
                    {Array.from({ length: active.imagesCount }).map(
                      (_, idx) => (
                        <button
                          key={idx}
                          className={`w-3 h-3 rounded-full ${
                            idx === imageIndex ? "bg-green-600" : "bg-gray-300"
                          }`}
                          onClick={() => setImageIndex(idx)}
                        />
                      )
                    )}
                  </div>

                  {/* Next button */}
                  <button
                    onClick={nextImage}
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50"
                    disabled={imageIndex === active.imagesCount - 1}
                  >
                    Next ›
                  </button>
                </div>
              )}
            </div>

            <p className="text-gray-700 mb-2">{active.description}</p>
            <div className="text-2xl font-bold text-green-600 mb-4">
              Rs. {active.price}
            </div>
            <button
              className="w-full bg-green-500 text-white rounded-xl py-3"
              onClick={() => addToCart(active)}
            >
              Add to Cart
            </button>
          </div>
        </div>
      )}
      {/* Cart Sidebar */}
      <div
        className={`fixed inset-0 z-20 transition ${
          cartOpen ? "visible" : "invisible"
        }`}
      >
        {/* Background overlay */}
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
            cartOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setCartOpen(false)}
        ></div>

        {/* Sliding panel */}
        <div
          className={`absolute right-0 top-0 h-full w-80 bg-white shadow-2xl p-6 flex flex-col transform transition-transform duration-300 ${
            cartOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold">Shopping Cart</h3>
            <button onClick={() => setCartOpen(false)}>✕</button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3">
            {cart.length === 0 ? (
              <p className="text-gray-500 text-center">Your cart is empty</p>
            ) : (
              cart.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-gray-50 p-3 rounded-xl"
                >
                  <div>
                    <div className="font-bold">{item.title}</div>
                    <div className="text-sm text-gray-600">
                      Rs. {item.price} × {item.quantity}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="px-2 bg-gray-200 rounded"
                      onClick={() => {
                        const c = [...cart];
                        c[idx].quantity = Math.max(1, c[idx].quantity - 1);
                        setCart(c);
                      }}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      className="px-2 bg-gray-200 rounded"
                      onClick={() => {
                        const c = [...cart];
                        c[idx].quantity++;
                        setCart(c);
                      }}
                    >
                      +
                    </button>
                    <button
                      className="px-2 bg-red-500 text-white rounded"
                      onClick={() => {
                        setCart(cart.filter((_, i) => i !== idx));
                      }}
                    >
                      🗑
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xl font-bold">Total:</span>
              <span className="text-xl font-bold text-green-600">
                Rs. {total}
              </span>
            </div>
            <button
              disabled={cart.length === 0}
              onClick={() => {
                setCheckoutOpen(true);
              }}
              className="w-full bg-green-600 text-white py-3 rounded-xl disabled:opacity-50"
            >
              Place Order
            </button>
          </div>
        </div>
      </div>
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
      {/* Checkout Modal */}
      {checkoutOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-30">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-2xl font-bold mb-4">Delivery Information</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = new FormData(e.target);
                const customer = Object.fromEntries(form.entries());
                localStorage.setItem("customer", JSON.stringify(customer));

                api
                  .post("/orders", { customer, items: cart })
                  .then(({ data }) => {
                    alert("Order placed! ID: " + data._id);
                    setCart([]);
                    setCheckoutOpen(false);
                    setCartOpen(false);
                  });
              }}
              className="space-y-3"
            >
              <input
                name="name"
                placeholder="Full Name"
                className="w-full border rounded-lg p-2"
                required
              />
              <input
                name="whatsapp"
                placeholder="WhatsApp Number"
                className="w-full border rounded-lg p-2"
                required
              />
              <input
                name="city"
                placeholder="City"
                className="w-full border rounded-lg p-2"
                required
              />
              <input
                name="street"
                placeholder="Address"
                className="w-full border rounded-lg p-2"
                required
              />
              <input
                name="pincode"
                placeholder="Pincode"
                className="w-full border rounded-lg p-2"
                required
              />
              <input
                name="landmark"
                placeholder="Nearby Landmark"
                className="w-full border rounded-lg p-2"
              />
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setCheckoutOpen(false)}
                  className="px-4 py-2 bg-gray-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg"
                >
                  Confirm Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      ;{/* Footer / Contact Section */}
      <footer id="contact" className="bg-gray-100 py-12 mt-12">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-6 text-center">Get in Touch</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow text-center transition transform hover:-translate-y-1 hover:shadow-xl">
              <div className="font-bold mb-2">Email</div>
              <div>peelncraft@gmail.com</div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow text-center transition transform hover:-translate-y-1 hover:shadow-xl">
              <div className="font-bold mb-2">WhatsApp</div>
              <div>+92 3355392166</div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow text-center transition transform hover:-translate-y-1 hover:shadow-xl">
              <div className="font-bold mb-2">Instagram</div>
              <a
                href="https://instagram.com/peelncraft.pk"
                className="text-green-600"
              >
                @peelncraft.pk
              </a>
            </div>
          </div>
          <p className="text-center text-gray-500 mt-8">
            © {new Date().getFullYear()} PeelnCraft. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

// const Contact = () => (
//   <div className="max-w-4xl mx-auto px-4 py-12">
//     <h2 className="text-3xl font-bold mb-6">Get in Touch</h2>
//     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//       <div className="bg-white p-6 rounded-2xl shadow">
//         <div className="font-bold mb-2">Email</div>
//         <div>peelncraft@gmail.com</div>
//       </div>
//       <div className="bg-white p-6 rounded-2xl shadow">
//         <div className="font-bold mb-2">WhatsApp</div>
//         <div>+92 3355392166</div>
//       </div>
//       <div className="bg-white p-6 rounded-2xl shadow">
//         <div className="font-bold mb-2">Instagram</div>
//         <a
//           href="https://instagram.com/peelncraft.pk"
//           className="text-green-600"
//         >
//           @peelncraft.pk
//         </a>
//       </div>
//     </div>
//   </div>
// );

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/admin" element={<AdminDashboard />} />
    </Routes>
  );
}
