import React from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";

const OrderSuccessPage = () => {
  const { orderId } = useParams();

  // Cart is already cleared in OrderContext.createOrder()
  // No need to clear again here to avoid duplicate API calls

  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
        Thanh Toán Thành Công!
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Đơn hàng của bạn đã được thanh toán thành công và đang được xử lý.
      </p>
      <Link to={`/orders`} className="btn-primary">
        Xem Chi Tiết Đơn Hàng
      </Link>
    </div>
  );
};

export default OrderSuccessPage;
