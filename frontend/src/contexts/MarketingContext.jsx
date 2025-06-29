import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const MarketingContext = createContext();

export const useMarketing = () => {
  return useContext(MarketingContext);
};

export const MarketingProvider = ({ children }) => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);

  // Initialize with mock data
  useEffect(() => {
    if (user?.isAdmin) {
      loadMarketingData();
    }
  }, [user]);

  const loadMarketingData = () => {
    setLoading(true);
    
    // Mock campaigns
    const mockCampaigns = [
      {
        id: 1,
        name: 'Summer Reading Sale',
        type: 'discount',
        status: 'active',
        startDate: '2024-06-01',
        endDate: '2024-08-31',
        description: '25% off all fiction books',
        targetAudience: 'All customers',
        budget: 5000,
        spent: 2340,
        impressions: 45678,
        clicks: 1234,
        conversions: 89,
      },
      {
        id: 2,
        name: 'New Release Promotion',
        type: 'featured',
        status: 'scheduled',
        startDate: '2024-07-15',
        endDate: '2024-07-31',
        description: 'Promote latest bestsellers',
        targetAudience: 'Returning customers',
        budget: 3000,
        spent: 0,
        impressions: 0,
        clicks: 0,
        conversions: 0,
      },
    ];

    // Mock discounts
    const mockDiscounts = [
      {
        id: 1,
        code: 'SUMMER25',
        type: 'percentage',
        value: 25,
        description: '25% off fiction books',
        minOrderAmount: 50,
        maxDiscount: 100,
        usageLimit: 1000,
        usageCount: 234,
        startDate: '2024-06-01',
        endDate: '2024-08-31',
        status: 'active',
        applicableCategories: ['Fiction'],
      },
      {
        id: 2,
        code: 'NEWUSER10',
        type: 'percentage',
        value: 10,
        description: '10% off for new users',
        minOrderAmount: 25,
        maxDiscount: 50,
        usageLimit: 500,
        usageCount: 67,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        status: 'active',
        applicableCategories: [],
      },
      {
        id: 3,
        code: 'FREESHIP',
        type: 'free_shipping',
        value: 0,
        description: 'Free shipping on orders over $75',
        minOrderAmount: 75,
        maxDiscount: 15,
        usageLimit: 2000,
        usageCount: 456,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        status: 'active',
        applicableCategories: [],
      },
    ];

    // Mock banners
    const mockBanners = [
      {
        id: 1,
        title: 'Summer Reading Sale',
        subtitle: 'Up to 25% off fiction books',
        imageUrl: 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg',
        linkUrl: '/books?category=fiction',
        position: 'hero',
        status: 'active',
        startDate: '2024-06-01',
        endDate: '2024-08-31',
        priority: 1,
      },
      {
        id: 2,
        title: 'New Arrivals',
        subtitle: 'Discover the latest bestsellers',
        imageUrl: 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg',
        linkUrl: '/books?filter=new',
        position: 'sidebar',
        status: 'active',
        startDate: '2024-07-01',
        endDate: '2024-07-31',
        priority: 2,
      },
    ];

    setTimeout(() => {
      setCampaigns(mockCampaigns);
      setDiscounts(mockDiscounts);
      setBanners(mockBanners);
      setLoading(false);
    }, 500);
  };

  // Campaign management
  const createCampaign = async (campaignData) => {
    const newCampaign = {
      id: Date.now(),
      ...campaignData,
      status: 'draft',
      spent: 0,
      impressions: 0,
      clicks: 0,
      conversions: 0,
    };
    setCampaigns(prev => [...prev, newCampaign]);
    return newCampaign;
  };

  const updateCampaign = async (id, updates) => {
    setCampaigns(prev => prev.map(campaign => 
      campaign.id === id ? { ...campaign, ...updates } : campaign
    ));
  };

  const deleteCampaign = async (id) => {
    setCampaigns(prev => prev.filter(campaign => campaign.id !== id));
  };

  // Discount management
  const createDiscount = async (discountData) => {
    const newDiscount = {
      id: Date.now(),
      ...discountData,
      usageCount: 0,
      status: 'active',
    };
    setDiscounts(prev => [...prev, newDiscount]);
    return newDiscount;
  };

  const updateDiscount = async (id, updates) => {
    setDiscounts(prev => prev.map(discount => 
      discount.id === id ? { ...discount, ...updates } : discount
    ));
  };

  const deleteDiscount = async (id) => {
    setDiscounts(prev => prev.filter(discount => discount.id !== id));
  };

  const validateDiscountCode = (code) => {
    const discount = discounts.find(d => 
      d.code.toLowerCase() === code.toLowerCase() && 
      d.status === 'active' &&
      new Date() >= new Date(d.startDate) &&
      new Date() <= new Date(d.endDate) &&
      d.usageCount < d.usageLimit
    );
    
    return discount || null;
  };

  // Banner management
  const createBanner = async (bannerData) => {
    const newBanner = {
      id: Date.now(),
      ...bannerData,
      status: 'active',
    };
    setBanners(prev => [...prev, newBanner]);
    return newBanner;
  };

  const updateBanner = async (id, updates) => {
    setBanners(prev => prev.map(banner => 
      banner.id === id ? { ...banner, ...updates } : banner
    ));
  };

  const deleteBanner = async (id) => {
    setBanners(prev => prev.filter(banner => banner.id !== id));
  };

  const getActiveBanners = (position = null) => {
    return banners.filter(banner => {
      const isActive = banner.status === 'active';
      const isInDateRange = new Date() >= new Date(banner.startDate) && 
                           new Date() <= new Date(banner.endDate);
      const matchesPosition = position ? banner.position === position : true;
      
      return isActive && isInDateRange && matchesPosition;
    }).sort((a, b) => a.priority - b.priority);
  };

  // Email marketing
  const sendPromotionalEmail = async (emailData) => {
    // Mock email sending
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: Date.now(),
          sent: true,
          recipients: emailData.recipients?.length || 0,
          deliveryRate: 98.5,
          openRate: 24.3,
          clickRate: 3.7,
        });
      }, 1000);
    });
  };

  const value = {
    campaigns,
    discounts,
    banners,
    loading,
    // Campaign methods
    createCampaign,
    updateCampaign,
    deleteCampaign,
    // Discount methods
    createDiscount,
    updateDiscount,
    deleteDiscount,
    validateDiscountCode,
    // Banner methods
    createBanner,
    updateBanner,
    deleteBanner,
    getActiveBanners,
    // Email marketing
    sendPromotionalEmail,
    // Data refresh
    refreshData: loadMarketingData,
  };

  return (
    <MarketingContext.Provider value={value}>
      {children}
    </MarketingContext.Provider>
  );
};