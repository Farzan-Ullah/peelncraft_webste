import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const token = localStorage.getItem("token");
  const [tab, setTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!user || !user.isAdmin) navigate("/");
  }, []);

  const loadProducts = async () => {
    const { data } = await api.get("/products");
    setProducts(data);
  };
  const loadOrders = async () => {
    const { data } = await api.get("/orders");
    setOrders(data);
  };

  useEffect(() => {
    loadProducts();
    loadOrders();
  }, []);

  const createProduct = async (e) => {
    e.preventDefault();
    const form = e.target;
    const fd = new FormData(form);
    try {
      await api.post("/products", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      form.reset();
      loadProducts();
      alert("Created");
    } catch (e) {
      alert(e.response?.data?.message || "Error");
    }
  };

  const del = async (id) => {
    if (!confirm("Delete?")) return;
    await api.delete("/products/" + id);
    loadProducts();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <button
          className="bg-red-500 text-white px-4 py-2 rounded"
          onClick={() => {
            localStorage.clear();
            location.href = "/";
          }}
        >
          Logout
        </button>
      </div>

      <div className="mb-4 flex gap-4">
        <button
          onClick={() => setTab("products")}
          className={tab === "products" ? "font-bold text-green-600" : ""}
        >
          Products
        </button>
        <button
          onClick={() => setTab("orders")}
          className={tab === "orders" ? "font-bold text-green-600" : ""}
        >
          Orders
        </button>
      </div>

      {tab === "products" && (
        <div className="grid md:grid-cols-2 gap-6">
          <form
            onSubmit={createProduct}
            className="bg-white p-6 rounded-2xl shadow space-y-3"
          >
            <h2 className="text-xl font-bold mb-2">Add Product</h2>
            <input
              name="title"
              className="w-full p-3 border rounded"
              placeholder="Title"
              required
            />
            <textarea
              name="description"
              className="w-full p-3 border rounded"
              placeholder="Description"
              required
            ></textarea>
            <input
              name="price"
              type="number"
              className="w-full p-3 border rounded"
              placeholder="Price (Rs.)"
              min="0"
              required
            />
            <input
              name="images"
              type="file"
              accept="image/*"
              multiple
              className="w-full p-3 border rounded"
              required
            />
            <button className="w-full bg-green-600 text-white py-3 rounded-xl">
              Create
            </button>
          </form>
          <div className="space-y-3">
            <h2 className="text-xl font-bold">Manage Products</h2>
            {products.map((p) => (
              <div
                key={p._id}
                className="bg-white p-4 rounded-xl shadow flex items-center gap-4"
              >
                <img
                  className="w-16 h-16 object-cover rounded"
                  src={`/api/products/${p._id}/image/0`}
                />
                <div className="flex-1">
                  <div className="font-bold">{p.title}</div>
                  <div className="text-sm text-gray-600">Rs. {p.price}</div>
                </div>
                <button
                  onClick={() => del(p._id)}
                  className="px-3 py-2 bg-red-500 text-white rounded"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "orders" && (
        <div className="space-y-3">
          <h2 className="text-xl font-bold">Orders</h2>
          {orders.length === 0 ? (
            <div className="text-gray-500">No orders</div>
          ) : (
            orders.map((o) => (
              <div key={o._id} className="bg-white p-4 rounded-xl shadow">
                <div className="flex justify-between">
                  <div className="font-bold">Order #{o._id.slice(-6)}</div>
                  <div className="text-sm">
                    {new Date(o.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="text-sm mt-2">Name: {o.customer?.name}</div>
                <div className="text-sm mt-2">
                  WhatsApp: {o.customer?.whatsapp}
                </div>
                <div className="text-sm mt-2">
                  Address: {o.customer?.street}
                </div>

                <div className="mt-2">
                  {o.items.map((i, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>
                        {i.title} × {i.quantity}
                      </span>
                      <span>Rs. {i.price * i.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="font-bold mt-2">Total: Rs. {o.total}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
