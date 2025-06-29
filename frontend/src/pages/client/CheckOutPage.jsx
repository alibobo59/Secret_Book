import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";
import { useOrder } from "../../contexts/OrderContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { motion } from "framer-motion";
import {
  CreditCard,
  MapPin,
  User,
  Phone,
  Mail,
  Package,
  Truck,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import { useToast } from "../../contexts/ToastContext";

const CheckoutPage = () => {
  const { cartItems, getCartTotal } = useCart();
  const { user } = useAuth();
  const { createOrder, loading } = useOrder();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    notes: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Phone validation (basic)
    const phoneRegex = /^0\d{9}$/;
    if (formData.phone && !phoneRegex.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (cartItems.length === 0) {
      alert("Your cart is empty");
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        items: cartItems.map((item) => ({
          bookId: item.id,
          price: item.price,
          quantity: item.quantity,
        })),
        shippingAddress: {
          name: formData.name,
          address: formData.address,
          city: formData.city,
        },
        contactInfo: {
          email: formData.email,
          phone: formData.phone,
        },
        subtotal: getCartTotal(),
        shipping: 0,
        total: getCartTotal(),
        notes: formData.notes,
      };

      const order = await createOrder(orderData);

      // ✅ Toast for immediate operation feedback
      toast.showOrderCreated(order.id);
      
      navigate(`/order-confirmation/${order.id}`);
    } catch (error) {
      // ✅ Toast for operation error
      toast.showError("Order Failed", "Failed to place order. Please try again.");
    }
  };
};

export default CheckoutPage;
