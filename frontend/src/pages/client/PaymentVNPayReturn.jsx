import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { api } from "../../services/api";

const PaymentVNPayReturn = () => {
  const [status, setStatus] = useState("processing"); // processing, success, failed, error
  const [paymentData, setPaymentData] = useState(null);
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
      navigate(`/orders/${orderNumber}`);
    } else {
      navigate("/orders");
    }
  };

  const handleRetry = () => {
    navigate("/cart");
  };

  if (status === "processing") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang xử lý kết quả thanh toán...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {status === "success" && (
            <>
              <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                Thanh toán thành công!
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Đơn hàng của bạn đã được thanh toán thành công
              </p>
              {paymentData && (
                <div className="mt-4 bg-green-50 border border-green-200 rounded-md p-4">
                  <div className="text-sm text-green-800">
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
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                Thanh toán thất bại
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Giao dịch của bạn không thể hoàn tất
              </p>
              {paymentData && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="text-sm text-red-800">
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
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                Có lỗi xảy ra
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Không thể xác minh kết quả thanh toán
              </p>
            </>
          )}

          <div className="mt-8 space-y-3">
            {status === "success" && (
              <button
                onClick={handleContinue}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                Xem đơn hàng
              </button>
            )}

            {(status === "failed" || status === "error") && (
              <>
                <button
                  onClick={handleRetry}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  Thử lại
                </button>
                <button
                  onClick={handleContinue}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  Xem đơn hàng
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentVNPayReturn;
