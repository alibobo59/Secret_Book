import React from 'react';

/**
 * Fallback AddressSelector – tạm thời chỉ hiển thị 2 field City/Address.
 * Nếu trang Checkout đã có input city/address riêng thì component này
 * có thể return null (để không ảnh hưởng bố cục).
 */
export default function AddressSelector({ value = {}, onChange = () => {} }) {
  return null;
}
