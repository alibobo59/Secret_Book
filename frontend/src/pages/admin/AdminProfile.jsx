import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { PageHeader, FormField, StatCard } from '../../components/admin';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  Key,
  Camera,
  Save,
  Eye,
  EyeOff,
  Smartphone,
  Clock,
  MapPin,
  Edit,
  Check,
  X,
} from 'lucide-react';
import { motion } from 'framer-motion';

const AdminProfile = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: user?.name || 'Admin User',
    email: user?.email || 'admin@bookstore.com',
    phone: '+1 (555) 123-4567',
    bio: 'System Administrator for Secret Bookstore',
    location: 'New York, NY',
    avatar: user?.avatar || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
    joinDate: '2022-01-15',
    lastLogin: new Date().toISOString(),
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    emailNotifications: true,
    loginAlerts: true,
    sessionTimeout: 120, // minutes
  });

  const [loginHistory] = useState([
    {
      id: 1,
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      ipAddress: '192.168.1.100',
      device: 'Chrome on Windows',
      location: 'New York, NY',
      status: 'success',
    },
    {
      id: 2,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      ipAddress: '192.168.1.100',
      device: 'Safari on iPhone',
      location: 'New York, NY',
      status: 'success',
    },
    {
      id: 3,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      ipAddress: '10.0.0.45',
      device: 'Firefox on Mac',
      location: 'Brooklyn, NY',
      status: 'success',
    },
  ]);

  const tabs = [
    { id: 'profile', label: 'Profile Information', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'activity', label: 'Login Activity', icon: Clock },
  ];

  const handleSaveProfile = async () => {
    try {
      // In a real app, this would make an API call
      await updateUser(profileData);
      setIsEditing(false);
      // Show success message
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    
    try {
      // In a real app, this would make an API call
      console.log('Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      // Show success message
    } catch (error) {
      console.error('Failed to change password:', error);
    }
  };

  const handleToggle2FA = async () => {
    try {
      setSecuritySettings(prev => ({
        ...prev,
        twoFactorEnabled: !prev.twoFactorEnabled,
      }));
      // In a real app, this would set up 2FA
    } catch (error) {
      console.error('Failed to toggle 2FA:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Admin Profile" hideAddButton />

      {/* Profile Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          icon={<Calendar className="h-6 w-6" />}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
          title="Member Since"
          value={new Date(profileData.joinDate).getFullYear()}
        />
        <StatCard
          icon={<Clock className="h-6 w-6" />}
          iconBgColor="bg-green-100"
          iconColor="text-green-600"
          title="Last Login"
          value="30 min ago"
        />
        <StatCard
          icon={<Shield className="h-6 w-6" />}
          iconBgColor="bg-purple-100"
          iconColor="text-purple-600"
          title="Security Score"
          value="85%"
        />
        <StatCard
          icon={<Eye className="h-6 w-6" />}
          iconBgColor="bg-amber-100"
          iconColor="text-amber-600"
          title="Login Sessions"
          value={loginHistory.length}
        />
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
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
                      ? 'border-amber-500 text-amber-600 dark:text-amber-500'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Profile Information Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <img
                    src={profileData.avatar}
                    alt={profileData.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                  <button className="absolute bottom-0 right-0 p-2 bg-amber-600 text-white rounded-full hover:bg-amber-700 transition-colors">
                    <Camera className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                      {profileData.name}
                    </h2>
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full text-sm font-medium">
                      Administrator
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-1">{profileData.email}</p>
                  <p className="text-gray-500 dark:text-gray-500 text-sm">{profileData.bio}</p>
                </div>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>

              {/* Profile Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="Full Name"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  disabled={!isEditing}
                  required
                />
                <FormField
                  label="Email Address"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  disabled={!isEditing}
                  required
                />
                <FormField
                  label="Phone Number"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  disabled={!isEditing}
                />
                <FormField
                  label="Location"
                  value={profileData.location}
                  onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                  disabled={!isEditing}
                />
                <div className="md:col-span-2">
                  <FormField
                    label="Bio"
                    type="textarea"
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    disabled={!isEditing}
                    inputProps={{ rows: 3 }}
                  />
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    <Save className="h-4 w-4" />
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-8">
              {/* Change Password */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                  Change Password
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <FormField
                      label="Current Password"
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <div className="relative">
                    <FormField
                      label="New Password"
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <div className="relative">
                    <FormField
                      label="Confirm Password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleChangePassword}
                  className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Key className="h-4 w-4" />
                  Change Password
                </button>
              </div>

              {/* Two-Factor Authentication */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                  Two-Factor Authentication
                </h3>
                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                      <div>
                        <h4 className="font-medium text-gray-800 dark:text-white">
                          Authenticator App
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {securitySettings.twoFactorEnabled 
                            ? 'Two-factor authentication is enabled'
                            : 'Add an extra layer of security to your account'
                          }
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleToggle2FA}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                        securitySettings.twoFactorEnabled
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {securitySettings.twoFactorEnabled ? (
                        <>
                          <X className="h-4 w-4" />
                          Disable 2FA
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4" />
                          Enable 2FA
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Security Preferences */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                  Security Preferences
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-white">Email Notifications</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Receive email alerts for security events
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={securitySettings.emailNotifications}
                        onChange={(e) => setSecuritySettings(prev => ({
                          ...prev,
                          emailNotifications: e.target.checked,
                        }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 dark:peer-focus:ring-amber-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-amber-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-white">Login Alerts</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Get notified of new login attempts
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={securitySettings.loginAlerts}
                        onChange={(e) => setSecuritySettings(prev => ({
                          ...prev,
                          loginAlerts: e.target.checked,
                        }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 dark:peer-focus:ring-amber-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-amber-600"></div>
                    </label>
                  </div>

                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-800 dark:text-white">Session Timeout</h4>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {securitySettings.sessionTimeout} minutes
                      </span>
                    </div>
                    <input
                      type="range"
                      min="30"
                      max="480"
                      step="30"
                      value={securitySettings.sessionTimeout}
                      onChange={(e) => setSecuritySettings(prev => ({
                        ...prev,
                        sessionTimeout: parseInt(e.target.value),
                      }))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>30 min</span>
                      <span>8 hours</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Login Activity Tab */}
          {activeTab === 'activity' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Recent Login Activity
                </h3>
                <button className="text-amber-600 hover:text-amber-700 text-sm">
                  View All Sessions
                </button>
              </div>

              <div className="space-y-4">
                {loginHistory.map((session) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(session.status)}`} />
                      <div>
                        <div className="font-medium text-gray-800 dark:text-white">
                          {session.device}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {session.ipAddress} • {session.location}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-800 dark:text-white">
                        {new Date(session.timestamp).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(session.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Security Tips */}
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6">
                <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-2">
                  Security Tips
                </h4>
                <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                  <li>• Always log out from shared computers</li>
                  <li>• Use a strong, unique password for your admin account</li>
                  <li>• Enable two-factor authentication for extra security</li>
                  <li>• Regularly review your login activity</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;