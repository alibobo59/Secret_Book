import React, { createContext, useContext, useReducer, useCallback } from 'react';
import refundService from '../services/refundService';
import { useToast } from './ToastContext';

const RefundContext = createContext();

const initialState = {
  refunds: [],
  currentRefund: null,
  refundStats: null,
  loading: false,
  error: null,
  pagination: {
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0
  },
  filters: {
    status: '',
    refund_type: '',
    refund_method: '',
    date_from: '',
    date_to: '',
    search: ''
  }
};

const refundReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'SET_REFUNDS':
      return {
        ...state,
        refunds: Array.isArray(action.payload.data?.data) ? action.payload.data.data : [],
        pagination: {
          current_page: action.payload.data?.current_page || 1,
          last_page: action.payload.data?.last_page || 1,
          per_page: action.payload.data?.per_page || 10,
          total: action.payload.data?.total || 0
        },
        loading: false,
        error: null
      };
    
    case 'SET_CURRENT_REFUND':
      return { ...state, currentRefund: action.payload, loading: false, error: null };
    
    case 'SET_REFUND_STATS':
      return { ...state, refundStats: action.payload, loading: false, error: null };
    
    case 'UPDATE_REFUND':
      return {
        ...state,
        refunds: state.refunds.map(refund =>
          refund.id === action.payload.id ? action.payload : refund
        ),
        currentRefund: state.currentRefund?.id === action.payload.id ? action.payload : state.currentRefund
      };
    
    case 'ADD_REFUND':
      return {
        ...state,
        refunds: [action.payload, ...state.refunds],
        pagination: {
          ...state.pagination,
          total: state.pagination.total + 1
        }
      };
    
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    
    case 'RESET_FILTERS':
      return { ...state, filters: initialState.filters };
    
    case 'RESET_STATE':
      return initialState;
    
    default:
      return state;
  }
};

export const RefundProvider = ({ children }) => {
  const [state, dispatch] = useReducer(refundReducer, initialState);
  const { showSuccess, showError, showWarning, showInfo } = useToast();

  const setLoading = useCallback((loading) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const setError = useCallback((error) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const fetchRefunds = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      const queryParams = { ...state.filters, ...params };
      
      // Remove empty filters
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] === '') {
          delete queryParams[key];
        }
      });
      
      const response = await refundService.getRefunds(queryParams);
      dispatch({ type: 'SET_REFUNDS', payload: response });
    } catch (error) {
      setError(error.response?.data?.message || 'Có lỗi xảy ra khi tải danh sách hoàn tiền');
      showError('Lỗi', error.response?.data?.message || 'Có lỗi xảy ra khi tải danh sách hoàn tiền');
    } finally {
      setLoading(false);
    }
  }, [state.filters, showError]);

  const fetchRefundById = useCallback(async (refundId) => {
    try {
      setLoading(true);
      const response = await refundService.getRefundById(refundId);
      dispatch({ type: 'SET_CURRENT_REFUND', payload: response.data });
    } catch (error) {
      setError(error.response?.data?.message || 'Có lỗi xảy ra khi tải thông tin hoàn tiền');
      showError('Lỗi', error.response?.data?.message || 'Có lỗi xảy ra khi tải thông tin hoàn tiền');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  const createFullRefund = useCallback(async (orderData) => {
    try {
      setLoading(true);
      const response = await refundService.createFullRefund(orderData);
      dispatch({ type: 'ADD_REFUND', payload: response.data });
      showSuccess('Thành công', 'Tạo yêu cầu hoàn tiền toàn phần thành công');
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Có lỗi xảy ra khi tạo yêu cầu hoàn tiền');
      showError('Lỗi', error.response?.data?.message || 'Có lỗi xảy ra khi tạo yêu cầu hoàn tiền');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [showSuccess, showError]);

  const createPartialRefund = useCallback(async (refundData) => {
    try {
      setLoading(true);
      const response = await refundService.createPartialRefund(refundData);
      dispatch({ type: 'ADD_REFUND', payload: response.data });
      showSuccess('Thành công', 'Tạo yêu cầu hoàn tiền một phần thành công');
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Có lỗi xảy ra khi tạo yêu cầu hoàn tiền');
      showError('Lỗi', error.response?.data?.message || 'Có lỗi xảy ra khi tạo yêu cầu hoàn tiền');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [showSuccess, showError]);

  const updateRefundStatus = useCallback(async (refundId, statusData) => {
    try {
      setLoading(true);
      const response = await refundService.updateRefundStatus(refundId, statusData);
      dispatch({ type: 'UPDATE_REFUND', payload: response.data });
      showSuccess('Thành công', 'Cập nhật trạng thái hoàn tiền thành công');
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật trạng thái');
      showError('Lỗi', error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật trạng thái');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [showSuccess, showError]);

  const checkVNPayStatus = useCallback(async (refundId) => {
    try {
      setLoading(true);
      const response = await refundService.checkVNPayStatus(refundId);
      dispatch({ type: 'UPDATE_REFUND', payload: response.data });
      showSuccess('Thành công', 'Kiểm tra trạng thái VNPay thành công');
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Có lỗi xảy ra khi kiểm tra trạng thái VNPay');
      showError('Lỗi', error.response?.data?.message || 'Có lỗi xảy ra khi kiểm tra trạng thái VNPay');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [showSuccess, showError]);

  const fetchRefundStats = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      const response = await refundService.getRefundStats(params);
      dispatch({ type: 'SET_REFUND_STATS', payload: response.data });
    } catch (error) {
      setError(error.response?.data?.message || 'Có lỗi xảy ra khi tải thống kê hoàn tiền');
      showError('Lỗi', error.response?.data?.message || 'Có lỗi xảy ra khi tải thống kê hoàn tiền');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  const requestRefund = useCallback(async (refundData) => {
    try {
      setLoading(true);
      const response = await refundService.requestRefund(refundData);
      showSuccess('Thành công', 'Gửi yêu cầu hoàn tiền thành công');
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Có lỗi xảy ra khi gửi yêu cầu hoàn tiền');
      showError('Lỗi', error.response?.data?.message || 'Có lỗi xảy ra khi gửi yêu cầu hoàn tiền');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [showSuccess, showError]);

  const getCustomerRefunds = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      const response = await refundService.getCustomerRefunds(params);
      dispatch({ type: 'SET_REFUNDS', payload: response });
    } catch (error) {
      setError(error.response?.data?.message || 'Có lỗi xảy ra khi tải danh sách hoàn tiền');
      showError('Lỗi', error.response?.data?.message || 'Có lỗi xảy ra khi tải danh sách hoàn tiền');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  const setFilters = useCallback((filters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  const resetFilters = useCallback(() => {
    dispatch({ type: 'RESET_FILTERS' });
  }, []);

  const resetState = useCallback(() => {
    dispatch({ type: 'RESET_STATE' });
  }, []);

  const value = {
    ...state,
    // Actions
    fetchRefunds,
    fetchRefundById,
    createFullRefund,
    createPartialRefund,
    updateRefundStatus,
    checkVNPayStatus,
    fetchRefundStats,
    requestRefund,
    getCustomerRefunds,
    setFilters,
    resetFilters,
    resetState,
    setLoading,
    setError
  };

  return (
    <RefundContext.Provider value={value}>
      {children}
    </RefundContext.Provider>
  );
};

export const useRefund = () => {
  const context = useContext(RefundContext);
  if (!context) {
    throw new Error('useRefund must be used within a RefundProvider');
  }
  return context;
};

export default RefundContext;