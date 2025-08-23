// frontend/src/services/cartService.js
import { api } from "./api";

/**
 * Giỏ hàng (server) – chuẩn hoá gọi API:
 *  - GET    /api/cart
 *  - POST   /api/cart/items               { book_id, quantity, variation_id? }
 *  - PUT    /api/cart/items/:cartItemId   { quantity }
 *  - DELETE /api/cart/items/:cartItemId
 *  - POST   /api/cart/merge               { items: [{ book_id, quantity, variation_id? }] }
 *  - POST   /api/cart/clear    hoặc DELETE /api/cart (tùy backend)
 *
 * Lưu ý: cartItemId là ID của DÒNG trong giỏ (item.id), không phải book_id/SKU.
 */

// ───────────────────────────────────────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────────────────────────────────────

/** Chuẩn hoá lỗi để dễ debug */
function unwrapError(err) {
  const status = err?.response?.status;
  const data = err?.response?.data;
  const message = data?.message || data?.error || err?.message || "Unknown error";
  return { status, data, message };
}

/** Map item server => thêm clientKey (ưu tiên sku/variant_sku, fallback = server_<id>) */
function withClientKey(item) {
  return {
    ...item,
    clientKey: item.sku || item.variant_sku || `server_${item.id}`,
  };
}

/** Map toàn bộ cart server */
function normalizeCart(serverCart) {
  return {
    ...serverCart,
    items: Array.isArray(serverCart?.items)
      ? serverCart.items.map(withClientKey)
      : [],
  };
}

// ───────────────────────────────────────────────────────────────────────────────
// API
// ───────────────────────────────────────────────────────────────────────────────

async function getCart() {
  try {
    const { data } = await api.get("/cart");
    return normalizeCart(data);
  } catch (e) {
    const err = unwrapError(e);
    console.error("getCart error:", err);
    throw e;
  }
}

/**
 * Thêm sản phẩm vào giỏ.
 * @param {string|number} book_id
 * @param {number} quantity
 * @param {string|number} [variation_id]
 */
async function addItem(book_id, quantity = 1, variation_id) {
  try {
    const payload = { book_id, quantity };
    if (variation_id) payload.variation_id = variation_id;

    const { data } = await api.post("/cart/items", payload);
    // Trả về cart đã normalize để FE set lại state nếu muốn
    return normalizeCart(data.cart || data);
  } catch (e) {
    const err = unwrapError(e);
    console.error("addItem error:", err);
    throw e;
  }
}

/**
 * Cập nhật số lượng 1 dòng giỏ hàng.
 * @param {string|number} cartItemId  (item.id từ server)
 * @param {number} quantity
 */
async function updateItem(cartItemId, quantity) {
  try {
    const { data } = await api.put(`/cart/items/${cartItemId}`, { quantity });
    return normalizeCart(data.cart || data);
  } catch (e) {
    const err = unwrapError(e);
    console.error("updateItem error:", err, { cartItemId, quantity });
    throw e;
  }
}

/**
 * Xoá 1 dòng giỏ hàng.
 * @param {string|number} cartItemId
 */
async function removeItem(cartItemId) {
  try {
    const { data } = await api.delete(`/cart/items/${cartItemId}`);
    return normalizeCart(data.cart || data);
  } catch (e) {
    const err = unwrapError(e);
    console.error("removeItem error:", err, { cartItemId });
    throw e;
  }
}

/**
 * Xoá nhiều dòng giỏ hàng (nếu backend có bulk endpoint thì dùng; nếu không, fallback xoá tuần tự).
 * @param {Array<string|number>} cartItemIds
 */
async function removeItems(cartItemIds = []) {
  if (!Array.isArray(cartItemIds) || cartItemIds.length === 0) return getCart();

  // Thử endpoint bulk phổ biến
  const tryBulk = async (path) => {
    try {
      const { data } = await api.post(path, { ids: cartItemIds });
      return normalizeCart(data.cart || data);
    } catch (e) {
      throw e;
    }
  };

  try {
    // Ưu tiên 1: /api/cart/items/bulk-delete
    return await tryBulk("/cart/items/bulk-delete");
  } catch (_) {
    try {
      // Ưu tiên 2: /api/cart/items/batch-delete
      return await tryBulk("/cart/items/batch-delete");
    } catch (e2) {
      // Fallback: xoá lần lượt
      for (const id of cartItemIds) {
        await removeItem(id);
      }
      return await getCart();
    }
  }
}

/**
 * Gộp giỏ hàng guest vào server sau khi login.
 * @param {Array} guestItems  – từ localStorage (có thể chứa sku, variation_id,…)
 *  Yêu cầu tối thiểu mỗi phần tử: { book_id OR id, quantity, variation_id? }
 */
async function mergeCart(guestItems = []) {
  try {
    const items = guestItems.map((it) => ({
      book_id: it.book_id || it.id, // fallback nếu local lưu id=book_id
      quantity: it.quantity || 1,
      variation_id: it.variation_id || null,
    }));

    const { data } = await api.post("/cart/merge", { items });
    return normalizeCart(data.cart || data);
  } catch (e) {
    const err = unwrapError(e);
    console.error("mergeCart error:", err);
    throw e;
  }
}

/** Xoá toàn bộ giỏ hàng */
async function clearCart() {
  try {
    // Một số backend dùng POST /cart/clear
    try {
      const { data } = await api.post("/cart/clear");
      return normalizeCart(data.cart || data);
    } catch (_) {
      // Fallback: DELETE /cart
      const { data } = await api.delete("/cart");
      return normalizeCart(data.cart || data);
    }
  } catch (e) {
    const err = unwrapError(e);
    console.error("clearCart error:", err);
    throw e;
  }
}

const cartService = {
  getCart,
  addItem,
  updateItem,
  removeItem,
  removeItems,
  mergeCart,
  clearCart,
};

export default cartService;
