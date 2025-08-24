// components/ChatBot.jsx
import React, { useEffect, useRef, useState } from "react";
import { aiService } from "../services/aiService";
import orderService from "../services/orderService";
import { useNavigate } from "react-router-dom";

/** Helpers */
const money = (n) => (n ?? 0).toLocaleString("vi-VN") + "₫";

/** Rút mảng ở mọi cấu trúc payload (data/orders/items/…) */
const pickAnyArray = (obj, depth = 0) => {
  if (!obj || depth > 4) return null;
  if (Array.isArray(obj)) return obj;
  if (typeof obj !== "object") return null;
  const priority = ["data", "orders", "items", "list", "results"];
  for (const k of priority) {
    if (obj[k] != null) {
      const hit = pickAnyArray(obj[k], depth + 1);
      if (hit) return hit;
    }
  }
  for (const k of Object.keys(obj)) {
    if (!priority.includes(k)) {
      const hit = pickAnyArray(obj[k], depth + 1);
      if (hit) return hit;
    }
  }
  return null;
};

/** Gọi 1 trang đơn (truyền đúng { params }) + bóc last_page linh hoạt */
const fetchOrdersPage = async (page = 1) => {
  const r = await orderService.getUserOrders({ page });
  const items = pickAnyArray(r) || [];

  const meta = r?.meta || r?.data?.meta || {};
  const lastPage =
    meta.last_page ??
    r?.last_page ??
    r?.data?.last_page ??
    meta?.pagination?.last_page ??
    1;

  return { items, paging: { last_page: Number(lastPage) || 1 } };
};

/** Duyệt nhiều trang để tìm mã ORD-XXXX */
const findOrderByCodeAcrossPages = async (rawCode, maxPages = 10) => {
  const needle = rawCode.replace(/[\s_]/g, "-").toUpperCase();

  // trang 1 để biết last_page
  let items = [], paging = {};
  try {
    ({ items, paging } = await fetchOrdersPage(1));
  } catch {
    return null;
  }

  const tryFind = (list) =>
    list.find((o) => {
      const c = (
        o.code || o.order_code || o.order_number || o.reference || o.reference_code || o.number || ""
      ).toString().toUpperCase();
      return c === needle;
    });

  let hit = tryFind(items);
  if (hit) return hit;

  const limit = Math.min(maxPages, Math.max(1, paging?.last_page || 1));
  for (let p = 2; p <= limit; p++) {
    try {
      ({ items } = await fetchOrdersPage(p));
    } catch {
      break;
    }
    hit = tryFind(items);
    if (hit) return hit;
    if (!items.length) break;
  }
  return null;
};


/** Chuẩn hoá object đơn hàng về 1 format chung để render */
const normalizeOrder = (o = {}) => {
  // Mã đơn (ví dụ ORD-ABC123)
  const code =
    o.code ||
    o.order_code ||
    o.order_number ||
    o.reference ||
    o.reference_code ||
    o.number ||
    (typeof o.id !== "undefined" ? `ORD-${o.id}` : "");

  // Trạng thái đơn
  const statusRaw =
    o.status || o.order_status || o.state || o.orderState || "pending";
  const statusMap = {
    pending: "Chờ xử lý",
    processing: "Đang xử lý",
    shipped: "Đã giao cho DVVC",
    delivering: "Đang giao",
    completed: "Hoàn tất",
    canceled: "Đã hủy",
    cancelled: "Đã hủy",
    refunded: "Đã hoàn tiền",
  };
  const statusLabel = statusMap[String(statusRaw).toLowerCase()] || statusRaw;

  // Trạng thái thanh toán
  const payRaw =
    o.payment_status ||
    o.paymentStatus ||
    o.pay_status ||
    o.payment_state ||
    (o.paid ? "paid" : "pending");
  const payMap = {
    pending: "Chưa thanh toán",
    paid: "Đã thanh toán",
    refunded: "Hoàn tiền",
  };
  const paymentLabel = payMap[String(payRaw).toLowerCase()] || payRaw;

  // Tổng tiền (lấy số đầu tiên tìm thấy)
  const coalesce = (...vals) => vals.find((v) => v !== undefined && v !== null);
  let total =
    coalesce(
      o.total_amount,
      o.total,
      o.grand_total,
      o.final_total,
      o.amount,
      o.price_total
    ) ?? 0;
  // Nếu backend trả string "200000" hoặc "200.000 đ" → rút số
  if (typeof total === "string") {
    const digits = total.replace(/[^\d]/g, "");
    total = digits ? parseInt(digits, 10) : 0;
  }

  // Số sản phẩm
  const itemCount =
    o.items_count ||
    o.itemsCount ||
    o.quantity ||
    (Array.isArray(o.items) ? o.items.length : o.total_items) ||
    0;

  const createdAt = o.created_at || o.createdAt || o.created_date || null;

  return {
    id: o.id,
    code,
    status: statusRaw,
    statusLabel,
    paymentStatus: payRaw,
    paymentLabel,
    total,
    itemCount,
    createdAt,
    _raw: o, // giữ lại để debug khi cần
  };
};

/** —— Cards —— */
const BookCard = ({ book, onClick }) => (
  <button
    onClick={onClick}
    className="w-full text-left flex gap-3 p-2 rounded-xl hover:bg-amber-50 dark:hover:bg-gray-700"
  >
    <img
      src={book?.cover_url || book?.image || "/favicon.png"}
      alt={book?.title}
      className="w-12 h-16 object-cover rounded-lg"
    />
    <div className="flex-1">
      <div className="font-semibold line-clamp-1">{book?.title}</div>
      <div className="text-xs opacity-70 line-clamp-1">
        {book?.author?.name || book?.author_name}
      </div>
      <div className="text-sm text-amber-700 mt-1">{money(book?.price)}</div>
    </div>
  </button>
);

const OrderCard = ({ order }) => {
  const o = normalizeOrder(order);
  return (
    <div className="p-3 rounded-xl bg-amber-50 dark:bg-gray-700">
      <div className="text-sm font-semibold">Đơn {o.code || `#${o.id}`}</div>
      {o.createdAt && (
        <div className="text-xs opacity-70">
          Đặt ngày: {new Date(o.createdAt).toLocaleDateString("vi-VN")}
        </div>
      )}
      <div className="text-xs opacity-70">Sản phẩm: {o.itemCount}</div>
      <div className="text-xs">
        Trạng thái: <span className="font-medium">{o.statusLabel}</span>
      </div>
      <div className="text-xs">
        Thanh toán: <span className="font-medium">{o.paymentLabel}</span>
      </div>
      <div className="text-xs">
        Tổng:{" "}
        <span className="font-semibold">
          {(o.total ?? 0).toLocaleString("vi-VN")}₫
        </span>
      </div>
      {/* ĐÃ BỎ PHẦN LINK "Xem chi tiết" */}
    </div>
  );
};

/** —— Main —— */
export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [faqs, setFaqs] = useState([]);
  const [game, setGame] = useState(null);
  const endRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    resetConversation();
    aiService
      .faqs()
      .then((r) => setFaqs(r?.data?.faqs || []))
      .catch(() => {});
  }, []);
  useEffect(() => {
    if (endRef.current) endRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const push = (m) => setMessages((prev) => [...prev, m]);
  const say = (t) => push({ role: "assistant", type: "text", content: t });
  const you = (t) => push({ role: "user", type: "text", content: t });

  const resetConversation = () => {
    setMessages([
      {
        role: "assistant",
        type: "text",
        content:
          "Chào bạn! Mình là trợ lý Secret Book 📚. Chọn nhanh bên dưới hoặc nhắn điều bạn muốn:",
      },
      { role: "assistant", type: "quick" },
    ]);
  };

  /** —— INTENT DETECTOR —— */
  const intentOf = (t) => {
    const s = t.toLowerCase();
      if (/\bord[-_ ]?[a-z0-9]+\b/i.test(s)) return "track";

  if (/mua|đặt|đặt sách|mình muốn mua|cho.*đặt/.test(s)) return "buy";
    if (
      /gợi ý|tư vấn|thể loại|self-help|tiểu thuyết|trinh thám|thiếu nhi|kinh doanh|khoa học/.test(
        s
      )
    )
      return "suggest.category";
    if (/tác giả|của .* (không|ko|\?)?/.test(s)) return "suggest.author";
    if (/đơn gần|mua gì|lịch sử|đơn hàng.*(gần|tháng)/.test(s))
      return "orders.last";
    if (
      /freeship|miễn phí vận chuyển|thanh toán|đổi trả|bảo hành|giao hàng/.test(
        s
      )
    )
      return "faq";
    if (/liên hệ|để lại số|email|đăng ký nhận thông tin/.test(s))
      return "contact";
    if (/góp ý|đánh giá|hài lòng|tệ quá|hay quá/.test(s)) return "feedback";
    if (/combo|mua kèm|khách hay mua kèm|bundle/.test(s)) return "combo";
    if (/mini game|đoán sách|trích dẫn|chơi game/.test(s)) return "minigame";
    if (/khuyến mãi|voucher|mã giảm|promo|giảm giá/.test(s)) return "promo";
    if (/buồn|vui|cô đơn|động lực|nhẹ nhàng|cần.*động lực/.test(s))
      return "mood";
    if (/theo dõi.*đơn|đơn.*đâu rồi|mã đơn|order\s?#?\d+/.test(s))
      return "track";
    if (/bestseller|bán chạy|trending|hot/.test(s)) return "trending";
    if (/nhắc.*đọc|lịch đọc|thói quen đọc|remind/.test(s)) return "remind";
    return "ai";
  };

  /** —— SEND —— */
const send = async () => {
  const text = input.trim();
  if (!text || loading) return;
  setInput("");
  you(text);

  // Nếu user gõ thẳng mã ORD-xxxx → tra luôn
  if (/\bord[-_ ]?[a-z0-9]+\b/i.test(text)) {
    return handleTrack(text);
  }

  const intent = intentOf(text);

    try {
      switch (intent) {
        case "buy":
          return handleBuy(text);
        case "suggest.category":
          return handleSuggestByCategory(text);
        case "suggest.author":
          return handleSuggestByAuthor(text);
        case "orders.last":
          return handleRecentOrders();
        case "faq":
          return handleFAQ(text);
        case "contact":
          return handleContactFlow();
        case "feedback":
          return handleFeedbackFlow();
        case "combo":
          return handleCombo(text);
        case "minigame":
          return startMiniGame();
        case "promo":
          return handlePromo();
        case "mood":
          return handleMood(text);
        case "track":
          return handleTrack(text);
        case "trending":
          return handleTrending();
        case "remind":
          return handleRemindFlow(text);
        default:
          return handleAI(text);
      }
    } catch {
      say("Có lỗi nhỏ. Bạn thử lại giúp mình nhé.");
    }
  };

  /** —— HANDLERS —— */

  // Mua sách
  const handleBuy = async (text) => {
    const title = text.replace(/mua|đặt|quyển|cho.*đặt/gi, "").trim();
    say("Mình đang tìm sách bạn muốn mua…");
    const r = await aiService.searchBooks(title || "");
    const list = (r?.data?.data || r?.data || []).slice(0, 3);
    if (!list.length)
      return say(
        "Chưa thấy sách trùng khớp. Bạn thử ghi rõ tên sách hoặc tác giả nhé."
      );
    push({
      role: "assistant",
      type: "books",
      title: "Có thể bạn muốn:",
      books: list,
    });
    say("Chạm vào sách để xem chi tiết và đặt mua.");
  };

  // Gợi ý theo thể loại
  const handleSuggestByCategory = async (text) => {
    const map = {
      "tiểu thuyết": "tieu-thuyet",
      "self-help": "self-help",
      "trinh thám": "trinh-tham",
      "thiếu nhi": "thieu-nhi",
      "kinh doanh": "kinh-doanh",
      "khoa học": "khoa-hoc",
    };
    const found = Object.keys(map).find((k) => text.toLowerCase().includes(k));
    if (found) {
      say(`Đây là vài tựa **${found}** đáng đọc:`);
      const r = await aiService.byCategory(map[found]);
      const list = (r?.data?.data || r?.data || []).slice(0, 5);
      if (!list.length)
        return say(
          "Chưa có dữ liệu thể loại này. Bạn thử xem mục Gợi Ý trên menu nhé."
        );
      push({
        role: "assistant",
        type: "books",
        title: `${found.toUpperCase()}`,
        books: list,
      });
    } else {
      const rp = await aiService.featured();
      const list = (rp?.data?.data || rp?.data || [])
        .map((x) => x.book || x)
        .slice(0, 5);
      push({
        role: "assistant",
        type: "books",
        title: "Gợi ý hôm nay",
        books: list,
      });
    }
  };

  // Gợi ý theo tác giả
  const handleSuggestByAuthor = async (text) => {
    const author = text.replace(/(của|tác giả|author)/gi, "").trim();
    say(`Tìm sách của tác giả: ${author}…`);
    const r = await aiService.byAuthor(author);
    const list = (r?.data?.data || r?.data || []).slice(0, 5);
    if (!list.length)
      return say("Chưa thấy sách của tác giả đó. Bạn thử tên khác nhé.");
    push({
      role: "assistant",
      type: "books",
      title: `Sách của ${author}`,
      books: list,
    });
  };

  // === FIX: 3 đơn gần nhất (ăn mọi dạng payload) ===
  const handleRecentOrders = async () => {
    say("Mình đang xem 3 đơn gần nhất của bạn…");
    try {
      const r = await orderService.getUserOrders({ page: 1 });
      const items = pickAnyArray(r) || [];
      if (!items.length) {
        console.debug("[ChatBot] orders raw:", r);
        return say(
          "Có vẻ bạn chưa có đơn nào. Vào Trang cá nhân › Đơn hàng để tạo đơn đầu tiên nhé!"
        );
      }
      // sort mới → cũ
      const sorted = [...items].sort((a, b) => {
        const ta = new Date(a.created_at || a.createdAt || 0).getTime();
        const tb = new Date(b.created_at || b.createdAt || 0).getTime();
        return tb - ta;
      });
      push({ role: "assistant", type: "orders", orders: sorted.slice(0, 3) });
    } catch (e) {
      say(
        "Bạn cần đăng nhập để xem đơn. Vào Trang cá nhân › Đơn hàng giúp mình nhé."
      );
      console.debug("[ChatBot] orders error:", e?.response?.data || e?.message);
    }
  };

  // FAQ động
  const handleFAQ = async (text) => {
    if (!faqs.length)
      await aiService.faqs().then((r) => setFaqs(r?.data?.faqs || []));
    const hit = faqs.find(
      (f) =>
        new RegExp(f.q, "i").test(text) ||
        new RegExp((f.a || "").split(" ")[0] || "", "i").test(text)
    );
    if (hit) say(hit.a);
    else push({ role: "assistant", type: "faq", faqs });
  };

  // Thu thập liên hệ
  const handleContactFlow = async () =>
    push({ role: "assistant", type: "form.contact" });

  // CSAT / góp ý
  const handleFeedbackFlow = () =>
    push({ role: "assistant", type: "form.feedback" });

  // Combo / mua kèm
  const handleCombo = async (text) => {
    say("Đề xuất mua kèm/combos…");
    const q = text.replace(/combo|mua kèm|bundle/gi, "").trim();
    const r = await aiService.searchBooks(q);
    const base = (r?.data?.data || r?.data || [])[0];
    if (!base)
      return say("Bạn nêu tên sách để mình gợi ý combo chuẩn xác nhé.");
    const sameAuthor = await aiService.byAuthor(base?.author_name || "");
    const list = (sameAuthor?.data?.data || sameAuthor?.data || [])
      .filter((b) => b.id !== base.id)
      .slice(0, 4);
    if (!list.length)
      return say("Tạm chưa có combo phù hợp. Bạn thử sách khác nhé.");
    push({
      role: "assistant",
      type: "books",
      title: `Thường mua kèm với “${base.title}”`,
      books: list,
    });
  };

  // Mini game đoán sách
  const startMiniGame = () => {
    const pool = [
      {
        quote: "“Không ai tắm hai lần trên cùng một dòng sông.”",
        answer: "Triết học Hi Lạp",
      },
      {
        quote: "“Ta chỉ có một cuộc đời để sống, hãy sống sao cho đáng.”",
        answer: "Tuổi trẻ đáng giá bao nhiêu",
      },
      { quote: "“Hãy yêu như chưa từng bị tổn thương.”", answer: "Self-help" },
    ];
    const q = pool[Math.floor(Math.random() * pool.length)];
    setGame({ step: 1, quote: q.quote, answer: q.answer.toLowerCase() });
    say(
      `Mini game 🎮: Đoán tên (hoặc thể loại) từ trích dẫn:\n${q.quote}\n→ Trả lời của bạn là?`
    );
  };

  // Khuyến mãi / mã giảm giá
  const handlePromo = async () => {
    say("Để mình xem khuyến mãi hôm nay…");
    const r = await aiService.activeCoupons().catch(() => null);
    const items = r?.data?.data || r?.data || [];
    if (!items.length)
      return say(
        "Hiện chưa có mã công khai. Bạn theo dõi banner/khuyến mãi giúp mình nhé."
      );
    const lines = items
      .slice(0, 5)
      .map((c) => `• ${c.code}: ${c.description || ""}`)
      .join("\n");
    say("Mã đang hoạt động:\n" + lines);
  };

  // Gợi ý theo mood
  const handleMood = async (text) => {
    const mapping = [
      {
        mood: /buồn|cô đơn/,
        cat: "self-help",
        note: "mang lại năng lượng tích cực",
      },
      {
        mood: /động lực|hết động lực/,
        cat: "self-help",
        note: "giúp tái tạo động lực",
      },
      {
        mood: /nhẹ nhàng|thư giãn/,
        cat: "tiểu thuyết",
        note: "nhẹ nhàng dễ đọc",
      },
    ];
    const m = mapping.find((x) => x.mood.test(text.toLowerCase()));
    if (!m)
      return say(
        "Bạn mô tả cảm xúc/mong muốn đọc kiểu gì? Mình gợi ý sát hơn nha."
      );
    say(`Mình gợi ý một số sách ${m.cat} ${m.note}:`);
    const r = await aiService.byCategory(m.cat);
    const list = (r?.data?.data || r?.data || []).slice(0, 5);
    if (!list.length)
      return say(
        "Chưa có dữ liệu phù hợp. Bạn thử tìm theo thể loại trên menu nhé."
      );
    push({
      role: "assistant",
      type: "books",
      title: `${m.cat.toUpperCase()}`,
      books: list,
    });
  };
  /** Tìm đơn theo mã (ORD-XXXX) qua nhiều trang */


  /** Theo dõi đơn */
const handleTrack = async (text) => {
  const codeMatch = text.match(/\bord[-_ ]?[a-z0-9]+\b/i);

  // 1) Ưu tiên theo MÃ ORD-XXXX
  if (codeMatch) {
    const needle = codeMatch[0].replace(/[\s_]/g, "-").toUpperCase();

    // Nếu bạn có API tìm theo code thật sự thì mở cái này và chỉnh endpoint đúng:
    // try {
    //   const r = await orderService.searchByCode(needle); // chỉ dùng khi có
    //   const order = r?.data || r;
    //   if (order) return push({ role: "assistant", type: "orders", orders: [order] });
    // } catch {}

    // Fallback: duyệt nhiều trang đơn của user
    const hit = await findOrderByCodeAcrossPages(needle, 10);
    if (hit) {
      return push({ role: "assistant", type: "orders", orders: [hit] });
    }
    return say("Không tìm thấy đơn với mã này trong lịch sử gần đây.");
  }

  // 2) Nếu KHÔNG có mã ORD-…, nhưng người dùng gõ TOÀN SỐ → thử theo ID
  const pureId = text.trim().match(/^\d{1,10}$/);
  if (pureId) {
    try {
      const r = await orderService.getOrderById(pureId[0]);
      if (r) return push({ role: "assistant", type: "orders", orders: [r] });
    } catch (e) {
      console.debug("Get order error:", e?.response?.data || e?.message);
      return say("Không tìm thấy đơn theo ID bạn cung cấp.");
    }
  }

  // 3) Không khớp định dạng
  return say('Bạn nhập mã đơn dạng "ORD-XXXXXX" hoặc số ID giúp mình nhé.');
};

  // Top trending / bestseller
  const handleTrending = async () => {
    const rp = await aiService.featured();
    const list = (rp?.data?.data || rp?.data || [])
      .map((x) => x.book || x)
      .slice(0, 5);
    if (!list.length) return say("Chưa có danh sách bán chạy.");
    push({
      role: "assistant",
      type: "books",
      title: "Bán chạy / Đang hot",
      books: list,
    });
  };

  // Nhắc lịch đọc (local)
  const handleRemindFlow = async (text) => {
    const m = text.match(/(\d+)\s*(phút|giờ|hours|minutes)/i);
    const minutes = m
      ? m[2].toLowerCase().startsWith("giờ")
        ? parseInt(m[1], 10) * 60
        : parseInt(m[1], 10)
      : 30;
    say(
      `Đã đặt nhắc đọc ${minutes} phút nữa. Mình sẽ nhắc trong khung chat nhé.`
    );
    setTimeout(
      () =>
        push({
          role: "assistant",
          type: "text",
          content: `⏰ Đến giờ đọc sách ${minutes} phút rồi nè!`,
        }),
      minutes * 60 * 1000
    );
  };

  // Fallback AI
  const handleAI = async (text) => {
    setLoading(true);
    try {
      const history = messages
        .filter((m) => m.type === "text" || m.type === "ai")
        .slice(-8)
        .map((m) => ({ role: m.role, content: m.content }));
      const r = await aiService.chat(text, history);
      push({
        role: "assistant",
        type: "text",
        content: r?.data?.reply || "Mình chưa rõ. Bạn nói cụ thể hơn nhé.",
      });
    } catch {
      say("Máy chủ AI đang bận. Bạn chọn tác vụ nhanh bên dưới giúp mình nhé.");
    } finally {
      setLoading(false);
      push({ role: "assistant", type: "quick" });
    }
  };

  /** —— UI —— */
  const renderMessage = (m, i) => {
    if (m.type === "quick") {
      return (
        <div key={i} className="flex flex-wrap gap-2">
          {[
            "Mua sách",
            "Gợi ý theo thể loại",
            "Gợi ý theo tác giả",
            "Đơn gần đây",
            "FAQ",
            "Khuyến mãi",
            "Trending",
            "Mini game",
            "Nhắc đọc 30 phút",
          ].map((label) => (
            <button
              key={label}
              onClick={() => {
                you(label);
                setTimeout(() => {
                  if (label === "Mua sách") handleBuy(label);
                  else if (label === "Gợi ý theo thể loại")
                    handleSuggestByCategory(label);
                  else if (label === "Gợi ý theo tác giả")
                    handleSuggestByAuthor(label);
                  else if (label === "Đơn gần đây") handleRecentOrders();
                  else if (label === "FAQ") handleFAQ(label);
                  else if (label === "Khuyến mãi") handlePromo();
                  else if (label === "Trending") handleTrending();
                  else if (label === "Mini game") startMiniGame();
                  else if (label === "Nhắc đọc 30 phút")
                    handleRemindFlow("nhắc tôi đọc 30 phút");
                }, 0);
              }}
              className={
                "px-3 py-2 rounded-full text-sm " +
                (label === "Mua sách" || label === "Đơn gần đây"
                  ? "bg-amber-600 text-white"
                  : "bg-amber-100 text-amber-800")
              }
            >
              {label}
            </button>
          ))}
        </div>
      );
    }
    if (m.type === "books") {
      return (
        <div key={i} className="space-y-2">
          {m.title && <div className="font-semibold">{m.title}</div>}
          {m.books.map((b, idx) => (
            <BookCard
              key={idx}
              book={b}
              onClick={() => (window.location.href = `/books/${b.id}`)}
            />
          ))}
        </div>
      );
    }
    if (m.type === "orders") {
      return (
        <div key={i} className="space-y-2">
          {(m.orders || []).map((o, idx) => (
            <OrderCard key={idx} order={o} />
          ))}
        </div>
      );
    }
    if (m.type === "faq") {
      return (
        <div key={i} className="space-y-2">
          <div className="font-semibold">FAQ</div>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            {(m.faqs || []).map((f, idx) => (
              <li key={idx}>
                <button
                  className="underline"
                  onClick={() => {
                    you(f.q);
                    say(f.a);
                  }}
                >
                  {f.q}
                </button>
              </li>
            ))}
          </ul>
        </div>
      );
    }
    if (m.type === "form.contact")
      return (
        <ContactForm
          key={i}
          onSubmit={async (v) => {
            await aiService.contact(v);
            say("Cảm ơn bạn! CSKH sẽ liên hệ sớm.");
          }}
        />
      );
    if (m.type === "form.feedback")
      return (
        <FeedbackForm
          key={i}
          onSubmit={async (v) => {
            await aiService.feedback(v.rating, v.notes);
            say("Cảm ơn góp ý của bạn 💛");
          }}
        />
      );

    return (
      <div
        key={i}
        className={
          "max-w-[85%] rounded-2xl px-3 py-2 whitespace-pre-wrap " +
          (m.role === "user"
            ? "ml-auto bg-amber-600 text-white"
            : "mr-auto bg-amber-100 dark:bg-gray-700")
        }
      >
        {m.content}
      </div>
    );
  };

  // Mini-game progression
  useEffect(() => {
    if (!game?.step) return;
    const last = messages[messages.length - 1];
    if (!last || last.role !== "user") return;
    const ans = (last.content || "").toLowerCase();
    if (game.step === 1) {
      if (ans.includes(game.answer)) {
        say("Chính xác! 🎉 Tặng bạn mã giảm 5%: MINI5 (nếu còn hiệu lực).");
        setGame(null);
      } else {
        say("Chưa đúng rồi. Bạn đoán lại nhé (gõ “bỏ qua” để thoát).");
        setGame({ ...game, step: 2 });
      }
    } else if (game.step === 2) {
      if (ans.includes("bỏ qua")) {
        say("Oke mình dừng mini game nhé.");
        setGame(null);
      } else if (ans.includes(game.answer)) {
        say("Chuẩn rồi! 🎉");
        setGame(null);
      } else {
        say(`Đáp án gợi ý: ${game.answer.toUpperCase()}. Thử lại không?`);
        setGame(null);
      }
    }
    // eslint-disable-next-line
  }, [messages]);

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-40 rounded-full shadow-lg px-4 py-3 bg-amber-600 text-white hover:bg-amber-700"
      >
        {open ? "✖" : "💬 Chat"}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-40 w-96 max-w-[92vw] h-[560px] bg-white dark:bg-gray-800 border border-amber-200 dark:border-gray-700 rounded-2xl shadow-2xl flex flex-col">
          <div className="p-3 border-b border-amber-100 dark:border-gray-700 flex items-center justify-between">
            <div className="font-semibold">Trợ lý Secret Book</div>
            <button
              className="text-sm opacity-70 hover:opacity-100"
              onClick={resetConversation}
            >
              Làm mới
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((m, i) => renderMessage(m, i))}
            {loading && (
              <div className="mr-auto bg-amber-100 dark:bg-gray-700 rounded-2xl px-3 py-2 max-w-[85%]">
                Đang soạn trả lời…
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="p-3 border-t border-amber-100 dark:border-gray-700 flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={1}
              placeholder="Gõ tin nhắn…"
              className="flex-1 resize-none rounded-xl border border-amber-200 dark:border-gray-700 px-3 py-2 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <button
              onClick={send}
              className="rounded-xl bg-amber-600 text-white px-4 py-2"
            >
              Gửi
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/** —— Sub-forms —— */
function ContactForm({ onSubmit }) {
  const [v, setV] = useState({ name: "", email: "", phone: "", message: "" });
  return (
    <form
      className="space-y-2"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(v);
      }}
    >
      <div className="font-semibold">Liên hệ CSKH</div>
      <input
        className="w-full px-3 py-2 rounded-lg border"
        placeholder="Tên của bạn"
        value={v.name}
        onChange={(e) => setV({ ...v, name: e.target.value })}
        required
      />
      <input
        className="w-full px-3 py-2 rounded-lg border"
        placeholder="Email (tuỳ chọn)"
        value={v.email}
        onChange={(e) => setV({ ...v, email: e.target.value })}
      />
      <input
        className="w-full px-3 py-2 rounded-lg border"
        placeholder="SĐT (tuỳ chọn)"
        value={v.phone}
        onChange={(e) => setV({ ...v, phone: e.target.value })}
      />
      <textarea
        className="w-full px-3 py-2 rounded-lg border"
        placeholder="Bạn cần hỗ trợ gì?"
        value={v.message}
        onChange={(e) => setV({ ...v, message: e.target.value })}
        required
      />
      <button className="px-3 py-2 rounded-xl bg-amber-600 text-white">
        Gửi liên hệ
      </button>
    </form>
  );
}

function FeedbackForm({ onSubmit }) {
  const [rating, setRating] = useState(5);
  const [notes, setNotes] = useState("");
  return (
    <form
      className="space-y-2"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ rating, notes });
      }}
    >
      <div className="font-semibold">Đánh giá trải nghiệm</div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            className={`px-2 py-1 rounded ${
              rating >= n
                ? "bg-amber-600 text-white"
                : "bg-amber-100 text-amber-800"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <textarea
        className="w-full px-3 py-2 rounded-lg border"
        placeholder="Góp ý (tuỳ chọn)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <button className="px-3 py-2 rounded-xl bg-amber-600 text-white">
        Gửi đánh giá
      </button>
    </form>
  );
}
