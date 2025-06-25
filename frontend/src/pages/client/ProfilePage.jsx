import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useOrder } from "../contexts/OrderContext";
import { useLanguage } from "../contexts/LanguageContext";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit3,
  Save,
  X,
  Package,
  Heart,
  Settings,
  Shield,
  Bell,
  CreditCard,
  Star,
  Eye,
  Trash2,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";

const ProfilePage = () => {
  const { username } = useParams();
  const { user } = useAuth();
  const { getUserOrders } = useOrder();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "+1 (555) 123-4567",
    address: "123 Main St, City, State 12345",
    bio: "Book lover and avid reader. Always looking for the next great story.",
    joinDate: "2023-01-15",
  });

  // Get user's orders
  const userOrders = user ? getUserOrders(user.id) : [];

  // Mock data for wishlist
  const [wishlist, setWishlist] = useState([
    {
      id: 4,
      title: "Pride and Prejudice",
      author: "Jane Austen",
      price: 10.99,
      image: "https://images.pexels.com/photos/6373305/pexels-photo-6373305.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      rating: 4.6,
    },
    {
      id: 5,
      title: "The Alchemist",
      author: "Paulo Coelho",
      price: 11.99,
      image: "https://images.pexels.com/photos/3646105/pexels-photo-3646105.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      rating: 4.5,
    },
  ]);

  const handleSave = () => {
    // In a real app, this would update the user profile via API
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedUser({
      name: user?.name || "",
      email: user?.email || "",
      phone: "+1 (555) 123-4567",
      address: "123 Main St, City, State 12345",
      bio: "Book lover and avid reader. Always looking for the next great story.",
      joinDate: "2023-01-15",
    });
    setIsEditing(false);
  };

  const removeFromWishlist = (bookId) => {
    setWishlist(wishlist.filter(book => book.id !== bookId));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "confirmed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "processing":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "shipped":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "confirmed":
      case "processing":
        return <Package className="h-4 w-4" />;
      case "shipped":
        return <Truck className="h-4 w-4" />;
      case "delivered":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const tabs = [
    { id: "profile", label: t("user.profile"), icon: User },
    { id: "orders", label: t("user.orders"), icon: Package },
    { id: "wishlist", label: t("user.wishlist"), icon: Heart },
    { id: "settings", label: t("user.settings"), icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 flex items-center justify-center text-white text-3xl font-bold">
              {user?.name?.charAt(0) || "U"}
            </div>
            <div className="flex-grow text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                {user?.name || "User Name"}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {editedUser.bio}
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Joined {new Date(editedUser.joinDate).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <Package className="h-4 w-4" />
                  {userOrders.length} Orders
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  {wishlist.length} Wishlist Items
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? "border-amber-500 text-amber-600 dark:text-amber-500"
                        : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                    Personal Information
                  </h2>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-4 py-2 text-amber-600 dark:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-md transition-colors"
                    >
                      <Edit3 className="h-4 w-4" />
                      Edit
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors"
                      >
                        <Save className="h-4 w-4" />
                        Save
                      </button>
                      <button
                        onClick={handleCancel}
                        className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedUser.name}
                        onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                        <User className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-800 dark:text-gray-200">{editedUser.name}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editedUser.email}
                        onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                        <Mail className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-800 dark:text-gray-200">{editedUser.email}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editedUser.phone}
                        onChange={(e) => setEditedUser({ ...editedUser, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                        <Phone className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-800 dark:text-gray-200">{editedUser.phone}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Address
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedUser.address}
                        onChange={(e) => setEditedUser({ ...editedUser, address: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                        <MapPin className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-800 dark:text-gray-200">{editedUser.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bio
                  </label>
                  {isEditing ? (
                    <textarea
                      value={editedUser.bio}
                      onChange={(e) => setEditedUser({ ...editedUser, bio: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                      <span className="text-gray-800 dark:text-gray-200">{editedUser.bio}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Orders Tab */}
            {activeTab === "orders" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                  Order History
                </h2>
                
                {userOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No orders yet</p>
                    <Link
                      to="/books"
                      className="inline-block mt-4 px-6 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors">
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userOrders.map((order) => (
                      <div
                        key={order.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-6"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-semibold text-gray-800 dark:text-white">
                              Order {order.id}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {getStatusIcon(order.status)}
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                            <p className="text-lg font-semibold text-gray-800 dark:text-white mt-1">
                              ${order.total.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          {order.items?.map((item) => (
                            <div key={item.bookId} className="flex items-center gap-4">
                              <img
                                src={item.coverImage}
                                alt={item.title}
                                className="w-12 h-16 object-cover rounded"
                              />
                              <div className="flex-grow">
                                <h4 className="font-medium text-gray-800 dark:text-white">
                                  {item.title}
                                </h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  by {typeof item.author === 'object' ? item.author?.name || 'Unknown Author' : item.author}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-gray-800 dark:text-white">
                                  ${(item.price * item.quantity).toFixed(2)}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  Qty: {item.quantity}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex justify-end mt-4">
                          <Link
                            to={`/order-confirmation/${order.id}`}
                            className="flex items-center gap-2 text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400"
                          >
                            <Eye className="h-4 w-4" />
                            View Details
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Wishlist Tab */}
            {activeTab === "wishlist" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                  My Wishlist
                </h2>
                
                {wishlist.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">Your wishlist is empty</p>
                    <Link
                      to="/books"
                      className="inline-block mt-4 px-6 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors"
                    >
                      Browse Books
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlist.map((book) => (
                      <div
                        key={book.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="relative">
                          <img
                            src={book.image}
                            alt={book.title}
                            className="w-full h-48 object-cover rounded-md mb-4"
                          />
                          <button
                            onClick={() => removeFromWishlist(book.id)}
                            className="absolute top-2 right-2 p-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <h3 className="font-semibold text-gray-800 dark:text-white mb-1">
                          {book.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                          by {book.author}
                        </p>
                        
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex text-amber-500">
                            {[...Array(5)].map((_, index) => (
                              <Star
                                key={index}
                                className={`h-4 w-4 ${
                                  index < Math.floor(book.rating) ? "fill-current" : ""
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {book.rating}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-gray-800 dark:text-white">
                            ${book.price.toFixed(2)}
                          </span>
                          <Link
                            to={`/books/${book.id}`}
                            className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors text-sm"
                          >
                            View Book
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                  Account Settings
                </h2>
                
                <div className="space-y-6">
                  {/* Security Settings */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Shield className="h-6 w-6 text-amber-600 dark:text-amber-500" />
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                        Security
                      </h3>
                    </div>
                    <div className="space-y-4">
                      <button className="w-full text-left p-4 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium text-gray-800 dark:text-white">
                              Change Password
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Update your password to keep your account secure
                            </p>
                          </div>
                          <Edit3 className="h-5 w-5 text-gray-400" />
                        </div>
                      </button>
                      
                      <button className="w-full text-left p-4 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium text-gray-800 dark:text-white">
                              Two-Factor Authentication
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Add an extra layer of security to your account
                            </p>
                          </div>
                          <span className="text-sm text-red-600 dark:text-red-400">Disabled</span>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Notification Settings */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Bell className="h-6 w-6 text-amber-600 dark:text-amber-500" />
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                        Notifications
                      </h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-gray-800 dark:text-white">
                            Email Notifications
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Receive updates about your orders and new books
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 dark:peer-focus:ring-amber-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-amber-600"></div>
                        </label>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-gray-800 dark:text-white">
                            Marketing Emails
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Receive promotional offers and book recommendations
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 dark:peer-focus:ring-amber-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-amber-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Payment Methods */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <CreditCard className="h-6 w-6 text-amber-600 dark:text-amber-500" />
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                        Payment Methods
                      </h3>
                    </div>
                    <div className="space-y-4">
                      <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-md">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-6 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
                              VISA
                            </div>
                            <div>
                              <p className="font-medium text-gray-800 dark:text-white">
                                •••• •••• •••• 4242
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Expires 12/25
                              </p>
                            </div>
                          </div>
                          <button className="text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400">
                            <Edit3 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      <button className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md text-gray-500 dark:text-gray-400 hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-500 transition-colors">
                        + Add New Payment Method
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;