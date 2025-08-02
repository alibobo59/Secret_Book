import React, { createContext, useContext, useState } from "react";
import { api } from "../services/api";

const CouponContext = createContext();

export const useCoupon = () => {
  const context = useContext(CouponContext);
  if (!context) {
    throw new Error("useCoupon must be used within a CouponProvider");
  }
  return context;
};

export const CouponProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Validate coupon code
  const validateCoupon = async (code, orderAmount) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post("/coupons/validate", {
        code,
        order_amount: orderAmount,
      });
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Có lỗi xảy ra khi kiểm tra mã khuyến mại";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Admin functions
  const getAllCoupons = async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/coupons", { params });
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Có lỗi xảy ra khi tải danh sách mã khuyến mại";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getCouponById = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/coupons/${id}`);
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Có lỗi xảy ra khi tải thông tin mã khuyến mại";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const createCoupon = async (couponData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post("/coupons", couponData);
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Có lỗi xảy ra khi tạo mã khuyến mại";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateCoupon = async (id, couponData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.put(`/coupons/${id}`, couponData);
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Có lỗi xảy ra khi cập nhật mã khuyến mại";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteCoupon = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.delete(`/coupons/${id}`);
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Có lỗi xảy ra khi xóa mã khuyến mại";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const generateCouponCode = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post("/coupons/generate-code");
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Có lỗi xảy ra khi tạo mã khuyến mại";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getCouponStats = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/coupons/${id}/stats`);
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Có lỗi xảy ra khi tải thống kê mã khuyến mại";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    loading,
    error,
    validateCoupon,
    getAllCoupons,
    getCouponById,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    generateCouponCode,
    getCouponStats,
  };

  return (
    <CouponContext.Provider value={value}>{children}</CouponContext.Provider>
  );
};

export default CouponContext;
