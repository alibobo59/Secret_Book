import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, X, Plus, Minus, Trash2 } from "lucide-react";
import { useCart } from "../../contexts/CartContext";

import { useNavigate, Link } from "react-router-dom";
import ConfirmRemoveModal from "./ConfirmRemoveModal";

const CartDropdown = ({ className = "" }) => {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    getCartTotal,
    getItemCount,
  } = useCart();

  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    productId: null,
    productTitle: "",
  });

  const handleConfirm = (productId, productTitle) => {
    setConfirmModal({
      isOpen: true,
      productId: productId,
      productTitle: productTitle,
    });
  };
};

export default CartDropdown;
