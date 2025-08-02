// Debug script to check authentication status
// Run this in the browser console

const debugAuth = () => {
  console.log('=== Authentication Debug ===');
  
  // Check localStorage data
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  console.log('Token in localStorage:', token);
  console.log('User string in localStorage:', userStr);
  
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      console.log('Parsed user object:', user);
      console.log('User role:', user.role);
      console.log('User ID:', user.id);
      console.log('User name:', user.name);
      console.log('User email:', user.email);
    } catch (e) {
      console.error('Error parsing user data:', e);
    }
  } else {
    console.log('No user data found in localStorage');
  }
  
  // Test if we need to set the token manually
  if (!token) {
    console.log('No token found. Setting the provided token...');
    const providedToken = '13|n29PLmps1lgUczlPAOwgDU7OzLKy8vgfJYsAV9a7f96dbfe1';
    localStorage.setItem('token', providedToken);
    console.log('Token set to:', providedToken);
    
    // Also set a mock admin user if no user exists
    if (!userStr) {
      const mockUser = {
        id: 1,
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin'
      };
      localStorage.setItem('user', JSON.stringify(mockUser));
      console.log('Mock admin user set:', mockUser);
    }
  }
  
  console.log('=== End Authentication Debug ===');
};

// Auto-run the debug
debugAuth();

// Make it available globally
window.debugAuth = debugAuth;

console.log('Auth debug script loaded. You can run debugAuth() manually if needed.');