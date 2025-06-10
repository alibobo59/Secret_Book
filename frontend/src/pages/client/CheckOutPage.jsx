import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Truck, User, Mail, Phone, MapPin } from "lucide-react";

const CheckoutPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    address: "",
    notes: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    alert("Gửi thông tin thành công (demo giai đoạn 1)");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/cart")}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            Quay lại giỏ hàng
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Thanh Toán
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-6">
            <Truck className="h-6 w-6 text-amber-600 dark:text-amber-500" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Thông Tin Giao Hàng
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <User className="inline h-4 w-4 mr-1" />
                Họ và Tên
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Nhập họ và tên"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Mail className="inline h-4 w-4 mr-1" />
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Nhập email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Phone className="inline h-4 w-4 mr-1" />
                Số Điện Thoại
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Nhập số điện thoại"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <MapPin className="inline h-4 w-4 mr-1" />
                Thành Phố
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Nhập thành phố"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Địa Chỉ
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Nhập địa chỉ đầy đủ"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ghi Chú (Tùy chọn)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Ghi chú đơn hàng..."
              />
            </div>
          </div>

          <button
            type="submit"
            className="mt-6 w-full bg-amber-600 hover:bg-amber-700 text-white py-3 px-4 rounded-lg"
          >
            Gửi Thông Tin (Demo Giai đoạn 1)
          </button>
        </form>
      </div>
    </div>
  );
};
 const [cart, setCart] = useState([
    { id: 1, name: "Sản phẩm A", price: 100000, qty: 1 },
    { id: 2, name: "Sản phẩm B", price: 200000, qty: 2 },
  ]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleQtyChange = (id, delta) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item
      )
    );
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Thông tin:", form);
    console.log("Giỏ hàng:", cart);
    alert("Đã nhập thông tin + giỏ hàng!");
  };

  return (
    <div className="checkout-page">
      <h2>Thông tin giao hàng</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Họ tên" value={form.name} onChange={handleChange} />
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} />
        <input name="phone" placeholder="Số điện thoại" value={form.phone} onChange={handleChange} />
        <input name="city" placeholder="Tỉnh/Thành phố" value={form.city} onChange={handleChange} />
        <input name="address" placeholder="Địa chỉ" value={form.address} onChange={handleChange} />
        <textarea name="note" placeholder="Ghi chú" value={form.note} onChange={handleChange} />

        <h3>Giỏ hàng</h3>
        {cart.map((item) => (
          <div key={item.id}>
            <span>{item.name}</span> - {item.price.toLocaleString()}đ
            <button type="button" onClick={() => handleQtyChange(item.id, -1)}>-</button>
            {item.qty}
            <button type="button" onClick={() => handleQtyChange(item.id, 1)}>+</button>
          </div>
        ))}
        <p><b>Tổng cộng:</b> {total.toLocaleString()}đ</p>

        <button type="submit">Xác nhận đơn hàng</button>
      </form>
    </div>
  );
}
export default CheckoutPage;