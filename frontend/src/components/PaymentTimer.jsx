import React, { useState, useEffect } from "react";

const PaymentTimer = ({ expiryTime }) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const expiry = new Date(expiryTime);
      const diff = expiry - now;

      if (diff > 0) {
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${minutes}:${seconds.toString().padStart(2, "0")}`);
      } else {
        setTimeLeft("Expired");
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [expiryTime]);

  return (
    <div className="text-center p-4 bg-yellow-100 rounded-lg">
      <p className="text-sm text-gray-600">
        Thời gian còn lại để thanh toán:{" "}
        <span className="font-bold text-red-600">{timeLeft}</span>
      </p>
    </div>
  );
};

export default PaymentTimer;
