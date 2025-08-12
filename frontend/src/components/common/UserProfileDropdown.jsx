import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import {
  User,
  Settings,
  Package,
  Shield,
  LogOut,
  X,
} from 'lucide-react';

const UserProfileDropdown = ({ className = "" }) => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  if (!user) {
    return null;
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={toggleDropdown}
        className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
        aria-label="User profile menu"
      >
        <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white font-medium uppercase">
          {user.name.charAt(0)}
        </div>
      </button>

      {/* ... existing code ... */}
    </div>
  );
};

export default UserProfileDropdown;