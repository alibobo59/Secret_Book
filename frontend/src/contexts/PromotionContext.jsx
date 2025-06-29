import React, { createContext, useContext, useState, useEffect } from 'react';

const PromotionContext = createContext();

export const usePromotion = () => {
  const context = useContext(PromotionContext);
  if (!context) {
    throw new Error('usePromotion must be used within a PromotionProvider');
  }
  return context;
};

export const PromotionProvider = ({ children }) => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPromotions();
  }, []);

  const loadPromotions = () => {
    const storedPromotions = localStorage.getItem('promotions');
    if (storedPromotions) {
      setPromotions(JSON.parse(storedPromotions));
    } else {
      const demoPromotions = [
        {
          id: 1,
          code: 'WELCOME10',
          type: 'percentage',
          value: 10,
          description: 'Welcome discount for new customers',
          isActive: true,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          usageLimit: 100,
          usedCount: 15,
        },
        {
          id: 2,
          code: 'FREESHIP',
          type: 'free_shipping',
          value: 0,
          description: 'Free shipping on orders over $50',
          isActive: true,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
          minimumOrder: 50,
          usageLimit: null,
          usedCount: 45,
        },
        {
          id: 3,
          code: 'SAVE20',
          type: 'fixed',
          value: 20,
          description: '$20 off on orders over $100',
          isActive: true,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          minimumOrder: 100,
          usageLimit: 50,
          usedCount: 8,
        },
      ];
      setPromotions(demoPromotions);
      localStorage.setItem('promotions', JSON.stringify(demoPromotions));
    }
  };

  const getActivePromotions = () => {
    const now = new Date();
    return promotions.filter(promo => 
      promo.isActive && 
      new Date(promo.startDate) <= now && 
      new Date(promo.endDate) >= now &&
      (!promo.usageLimit || promo.usedCount < promo.usageLimit)
    );
  };

  const validatePromoCode = (code, orderTotal = 0) => {
    const promotion = promotions.find(promo => 
      promo.code.toLowerCase() === code.toLowerCase()
    );

    if (!promotion) {
      return { valid: false, error: 'Invalid promo code' };
    }

    if (!promotion.isActive) {
      return { valid: false, error: 'Promo code is not active' };
    }

    const now = new Date();
    if (new Date(promotion.startDate) > now) {
      return { valid: false, error: 'Promo code is not yet active' };
    }

    if (new Date(promotion.endDate) < now) {
      return { valid: false, error: 'Promo code has expired' };
    }

    if (promotion.usageLimit && promotion.usedCount >= promotion.usageLimit) {
      return { valid: false, error: 'Promo code usage limit reached' };
    }

    if (promotion.minimumOrder && orderTotal < promotion.minimumOrder) {
      return { 
        valid: false, 
        error: `Minimum order of $${promotion.minimumOrder} required` 
      };
    }

    return { valid: true, promotion };
  };

  const calculateDiscount = (promotion, orderTotal, shippingCost = 0) => {
    switch (promotion.type) {
      case 'percentage':
        return (orderTotal * promotion.value) / 100;
      case 'fixed':
        return Math.min(promotion.value, orderTotal);
      case 'free_shipping':
        return shippingCost;
      case 'buy_x_get_y':
        // Simplified calculation - would need more complex logic in real app
        return promotion.value || 0;
      default:
        return 0;
    }
  };

  const value = {
    promotions,
    loading,
    getActivePromotions,
    validatePromoCode,
    calculateDiscount,
    refreshPromotions: loadPromotions,
  };

  return (
    <PromotionContext.Provider value={value}>
      {children}
    </PromotionContext.Provider>
  );
};