// Test script to debug analytics API call
// Run this in the browser console on the analytics page

const testAnalyticsAPI = async () => {
  console.log('=== Testing Analytics API ===');
  
  // Check if token exists
  const token = localStorage.getItem('token');
  console.log('Token exists:', !!token);
  console.log('Token value:', token);
  
  // Check user data
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  console.log('User data:', user);
  console.log('User role:', user.role);
  
  // Test direct API call
  try {
    console.log('Making direct API call...');
    const response = await fetch('/api/analytics/dashboard?period=30d', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('Response data:', data);
      console.log('Sales data:', data.sales);
      console.log('Users data:', data.users);
    } else {
      const errorText = await response.text();
      console.error('Error response:', errorText);
    }
  } catch (error) {
    console.error('Fetch error:', error);
  }
};

// Auto-run the test
testAnalyticsAPI();

// Also make it available globally
window.testAnalyticsAPI = testAnalyticsAPI;

console.log('Test script loaded. You can run testAnalyticsAPI() manually if needed.');