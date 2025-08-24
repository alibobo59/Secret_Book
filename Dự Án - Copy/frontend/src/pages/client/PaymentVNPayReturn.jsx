import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, AlertTriangle, CreditCard, Package } from "lucide-react";
import { api } from "../../services/api";

const PaymentVNPayReturn = () => {
  const [status, setStatus] = useState("processing"); // processing, success, failed, error
  const [paymentData, setPaymentData] = useState(null);
  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('vnpay');
  const [orderNumber, setOrderNumber] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const processPaymentResult = async () => {
      try {
        // Extract VNPay parameters from URL
        const urlParams = new URLSearchParams(location.search);
        const vnpayParams = {};

        // Get all vnp_ parameters
        for (const [key, value] of urlParams.entries()) {
          if (key.startsWith("vnp_")) {
            vnpayParams[key] = value;
          }
        }

        if (Object.keys(vnpayParams).length === 0) {
          setStatus("error");
          return;
        }

        // Verify payment with backend
        const response = await api.post("/payment/vnpay/verify", vnpayParams);

        if (response.data.success) {
          // Payment verification successful, now process the result
          const vnp_ResponseCode = vnpayParams.vnp_ResponseCode;
          const vnp_TxnRef = vnpayParams.vnp_TxnRef;
          const vnp_TransactionNo = vnpayParams.vnp_TransactionNo;

          setOrderNumber(vnp_TxnRef);
          setTransactionId(vnp_TransactionNo || "");

          // Always call the return endpoint to update database
          try {
            const returnResponse = await api.post("/payment/vnpay/return", vnpayParams);
            
            if (vnp_ResponseCode === "00") {
              setStatus("success");
              setPaymentData({
                orderNumber: vnp_TxnRef,
                transactionId: vnp_TransactionNo,
                amount: vnpayParams.vnp_Amount
                  ? parseInt(vnpayParams.vnp_Amount) / 100
                  : 0,
                payDate: vnpayParams.vnp_PayDate,
              });
            } else {
              setStatus("failed");
              setPaymentData({
                orderNumber: vnp_TxnRef,
                orderId: returnResponse.data.order_id,
                responseCode: vnp_ResponseCode,
                message: getVNPayErrorMessage(vnp_ResponseCode),
              });
            }
          } catch (error) {
            console.error("Payment return API error:", error);
            // Fallback to display basic info even if return API fails
            if (vnp_ResponseCode === "00") {
              setStatus("success");
              setPaymentData({
                orderNumber: vnp_TxnRef,
                transactionId: vnp_TransactionNo,
                amount: vnpayParams.vnp_Amount
                  ? parseInt(vnpayParams.vnp_Amount) / 100
                  : 0,
                payDate: vnpayParams.vnp_PayDate,
              });
            } else {
              setStatus("failed");
              setPaymentData({
                orderNumber: vnp_TxnRef,
                responseCode: vnp_ResponseCode,
                message: getVNPayErrorMessage(vnp_ResponseCode),
              });
            }
          }
        } else {
          setStatus("error");
        }
      } catch (error) {
        console.error("Payment verification error:", error);
        setStatus("error");
      }
    };

    processPaymentResult();
  }, [location.search]);

  const getVNPayErrorMessage = (code) => {
    const errorMessages = {
      "01": "Giao dịch chưa hoàn tất",
      "02": "Giao dịch bị lỗi",
      "04": "Giao dịch đảo (Khách hàng đã bị trừ tiền tại Ngân hàng nhưng GD chưa thành công ở VNPAY)",
      "05": "VNPAY đang xử lý giao dịch này (GD hoàn tiền)",
      "06": "VNPAY đã gửi yêu cầu hoàn tiền sang Ngân hàng (GD hoàn tiền)",
      "07": "Giao dịch bị nghi ngờ gian lận",
      "09": "GD Hoàn trả bị từ chối",
      10: "Đã giao hàng",
      11: "Giao dịch không thành công do: Tài khoản của khách hàng không đủ số dư",
      12: "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa",
      13: "Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP)",
      24: "Giao dịch không thành công do: Khách hàng hủy giao dịch",
      51: "Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư",
      65: "Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày",
      75: "Ngân hàng thanh toán đang bảo trì",
      79: "Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định",
      99: "Các lỗi khác",
    };
    return errorMessages[code] || "Lỗi không xác định";
  };

  const handleContinue = () => {
    if (status === "success") {
      navigate(`/orders`);
    } else {
      navigate("/orders");
    }
  };

  const handleRetry = () => {
    navigate("/cart");
  };

  const handleRetryPayment = async () => {
    if (!paymentData?.orderNumber) {
      alert("Không tìm thấy thông tin đơn hàng");
      return;
    }

    try {
      // Extract order ID from order number or use a different approach
      // For now, we'll need to get the order ID from the order number
      const response = await api.post(`/payment/vnpay/retry/${paymentData.orderId || paymentData.orderNumber}`);
      
      if (response.data.success) {
        // Redirect to VNPay payment URL
        window.location.href = response.data.payment_url;
      } else {
        alert(response.data.message || "Không thể tạo thanh toán mới");
      }
    } catch (error) {
      console.error("Retry payment error:", error);
      alert("Có lỗi xảy ra khi tạo thanh toán mới");
    }
  };

  const handleChangePaymentMethod = async () => {
    if (!paymentData?.orderId && !paymentData?.orderNumber) {
      alert('Không tìm thấy thông tin đơn hàng');
      return;
    }

    try {
      const response = await api.post(`/payment/change-method/${paymentData.orderId || paymentData.orderNumber}`, {
        payment_method: selectedPaymentMethod
      });
      
      if (response.data.success) {
        if (selectedPaymentMethod === 'vnpay') {
          // Redirect to VNPay payment URL
          window.location.href = response.data.payment_url;
        } else {
          // For COD, show success message and redirect
          alert(response.data.message);
          navigate('/orders');
        }
      } else {
        alert(response.data.message || 'Không thể thay đổi phương thức thanh toán');
      }
    } catch (error) {
      console.error('Change payment method error:', error);
      alert('Có lỗi xảy ra khi thay đổi phương thức thanh toán');
    }
    setShowPaymentMethodModal(false);
  };

  if (status === "processing") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Đang xử lý kết quả thanh toán...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <div className="max-w-md mx-auto space-y-8">
        <div className="text-center">
          {status === "success" && (
            <>
              <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
                Thanh toán thành công!
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Đơn hàng của bạn đã được thanh toán thành công
              </p>
              {paymentData && (
                <div className="mt-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4">
                  <div className="text-sm text-green-800 dark:text-green-200">
                    <p>
                      <strong>Mã đơn hàng:</strong> {paymentData.orderNumber}
                    </p>
                    <p>
                      <strong>Mã giao dịch:</strong> {paymentData.transactionId}
                    </p>
                    <p>
                      <strong>Số tiền:</strong>{" "}
                      {paymentData.amount?.toLocaleString("vi-VN")} VNĐ
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          {status === "failed" && (
            <>
              <XCircle className="mx-auto h-16 w-16 text-red-500" />
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
                Thanh toán thất bại
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Giao dịch của bạn không thể hoàn tất
              </p>
              {paymentData && (
                <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
                  <div className="text-sm text-red-800 dark:text-red-200">
                    <p>
                      <strong>Mã đơn hàng:</strong> {paymentData.orderNumber}
                    </p>
                    <p>
                      <strong>Lý do:</strong> {paymentData.message}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          {status === "error" && (
            <>
              <AlertTriangle className="mx-auto h-16 w-16 text-yellow-500" />
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
                Có lỗi xảy ra
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Không thể xác minh kết quả thanh toán
              </p>
            </>
          )}

          <div className="mt-8 space-y-3">
            {status === "success" && (
              <button
                onClick={handleContinue}
                className="btn-primary">
                Xem đơn hàng
              </button>
            )}

            {status === "failed" && (
              <>
                <button
                  onClick={() => setShowPaymentMethodModal(true)}
                  className="btn-primary mb-3">
                  Chọn phương thức thanh toán
                </button>
                <button
                  onClick={handleContinue}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900">
                  Xem đơn hàng
                </button>
              </>
            )}

            {status === "error" && (
              <button
                onClick={handleContinue}
                className="btn-primary">
                Xem đơn hàng
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Payment Method Selection Modal */}
      {showPaymentMethodModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Chọn phương thức thanh toán
            </h3>
            
            <div className="space-y-3 mb-6">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="vnpay"
                  checked={selectedPaymentMethod === 'vnpay'}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  className="text-blue-600"
                />
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  <span className="text-gray-900 dark:text-white">VNPay (Thanh toán online)</span>
                </div>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={selectedPaymentMethod === 'cod'}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  className="text-green-600"
                />
                <div className="flex items-center space-x-2">
                  <Package className="h-5 w-5 text-green-600" />
                  <span className="text-gray-900 dark:text-white">COD (Thanh toán khi nhận hàng)</span>
                </div>
              </label>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowPaymentMethodModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-offset-gray-900 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleChangePaymentMethod}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900 transition-colors"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentVNPayReturn;
