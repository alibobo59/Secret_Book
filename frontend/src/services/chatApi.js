// đảm bảo file này tồn tại và được export
import axios from "axios";

const API_BASE = import.meta?.env?.VITE_API_BASE_URL || "http://localhost:5173";

export const chatApi = {
  trending(limit = 3) {
    return axios.get(`${API_BASE.replace(/\/+$/, "")}/api/chat/trending`, {
      params: { limit },
      // không cần auth; nếu backend yêu cầu thì thêm header ở đây
    });
  },
};
export default chatApi;
