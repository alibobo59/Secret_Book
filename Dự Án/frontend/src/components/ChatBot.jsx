// frontend/src/components/ChatBot.jsx
import React, { useEffect, useRef, useState } from "react";
import { aiService } from "../services/aiService";
import orderService from "../services/orderService";
import { chatApi } from "../services/chatApi";
import { HelpCircle, ChevronDown, ChevronUp, Tag, Clock } from "lucide-react";

/* ================= Helpers ================= */
const money = (n) => (n ?? 0).toLocaleString("vi-VN") + "₫";

/** Tự phát hiện API base URL để ghép ảnh tương đối */
const getApiBase = () => {
  const env = import.meta?.env?.VITE_API_BASE_URL;
  const meta = document.querySelector('meta[name="api-base"]')?.content;
  const globalVar = window.__API_BASE__;
  const fromAi =
    aiService?.client?.defaults?.baseURL ||
    aiService?.baseURL ||
    aiService?.defaults?.baseURL;
  const fromChat =
    chatApi?.client?.defaults?.baseURL ||
    chatApi?.baseURL ||
    chatApi?.defaults?.baseURL;

  return env || meta || globalVar || fromAi || fromChat || window.location.origin;
};

const fixImg = (u) => {
  if (!u) return "";
  let s = String(u).trim().replace(/\\/g, "/");
  if (/^https?:\/\//i.test(s)) return s;
  if (/^\/\//.test(s)) return window.location.protocol + s;
  const base = getApiBase().replace(/\/+$/, "");
  s = s.replace(/^\/+/, "");
  return `${base}/${s}`;
};
const pickImage = (b) => {
  const cand =
    b?.image_url ||
    b?.cover_url ||
    b?.image ||
    b?.thumbnail ||
    b?.imageUrl ||
    b?.cover ||
    b?.thumb ||
    (Array.isArray(b?.images) ? b.images[0]?.url : "") ||
    "";
  const url = fixImg(String(cand).trim());
  return url || "/favicon.png";
};

/** Rút mảng từ payload bất kỳ: data/orders/items/list/results */
const pickAnyArray = (obj, depth = 0) => {
  if (!obj || depth > 4) return null;
  if (Array.isArray(obj)) return obj;
  if (typeof obj !== "object") return null;
  const keys = ["data", "orders", "items", "list", "results"];
  for (const k of keys) {
    if (obj[k] != null) {
      const a = pickAnyArray(obj[k], depth + 1);
      if (a) return a;
    }
  }
  for (const k of Object.keys(obj)) {
    if (!keys.includes(k)) {
      const a = pickAnyArray(obj[k], depth + 1);
      if (a) return a;
    }
  }
  return null;
};

/** Chuẩn hoá đơn để hiển thị */
const normalizeOrder = (o = {}) => {
  const code =
    o.code ||
    o.order_code ||
    o.order_number ||
    o.reference ||
    o.reference_code ||
    o.number ||
    (typeof o.id !== "undefined" ? `ORD-${o.id}` : "");

  const statusRaw = String(
    o.status || o.order_status || o.state || o.orderState || "pending"
  ).toLowerCase();
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
  const statusLabel = statusMap[statusRaw] || o.status || "–";

  const payRaw = String(
    o.payment_status ||
      o.paymentStatus ||
      o.pay_status ||
      o.payment_state ||
      (o.paid ? "paid" : "pending")
  ).toLowerCase();
  const payMap = { pending: "Chưa thanh toán", paid: "Đã thanh toán", refunded: "Hoàn tiền" };
  const paymentLabel = payMap[payRaw] || o.payment_status || "–";

  const coalesce = (...v) => v.find((x) => x !== undefined && x !== null);
  let total =
    coalesce(o.total_amount, o.total, o.grand_total, o.final_total, o.amount, o.price_total) ?? 0;
  if (typeof total === "string") {
    const d = total.replace(/[^\d]/g, "");
    total = d ? parseInt(d, 10) : 0;
  }

  const itemCount =
    o.items_count ||
    o.itemsCount ||
    o.quantity ||
    (Array.isArray(o.items) ? o.items.length : o.total_items) ||
    0;

  return {
    id: o.id,
    code,
    statusLabel,
    paymentLabel,
    total,
    itemCount,
    createdAt: o.created_at || o.createdAt || null,
  };
};

/* ================= Small UI ================= */
const BookCard = ({ book, onClick }) => {
  const img =
    fixImg(
      book?.image_url ||
      book?.cover_url ||
      book?.image ||
      book?.thumbnail ||
      book?.imageUrl ||
      book?.images?.[0]?.url
    ) || "/favicon.png";

  return (
    <button
      onClick={onClick}
      className="w-full text-left flex gap-3 p-2 rounded-xl hover:bg-amber-50 dark:hover:bg-gray-700"
    >
      <img src={img} alt={book?.title} className="w-12 h-16 object-cover rounded-lg" />
      <div className="flex-1">
        <div className="font-semibold line-clamp-1">{book?.title}</div>
        <div className="text-xs opacity-70 line-clamp-1">
          {book?.author_name || book?.author?.name || "Không rõ tác giả"}
        </div>
        {book?.price != null && (
          <div className="text-sm text-amber-700 mt-1">{money(book?.price)}</div>
        )}
      </div>
    </button>
  );
};

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
      <div className="text-xs">Trạng thái: <span className="font-medium">{o.statusLabel}</span></div>
      <div className="text-xs">Thanh toán: <span className="font-medium">{o.paymentLabel}</span></div>
      <div className="text-xs">
        Tổng: <span className="font-semibold">{(o.total ?? 0).toLocaleString("vi-VN")}₫</span>
      </div>
    </div>
  );
};

/* ================= FAQ Accordion (gọn, không lặp Q/A) ================= */
const FAQAccordion = ({ items = [] }) => {
  const [openId, setOpenId] = React.useState(null);

  const fmtDate = (d) => {
    if (!d) return null;
    const t = new Date(d);
    if (Number.isNaN(t.getTime())) return null;
    return t.toLocaleDateString("vi-VN");
  };

  return (
    <div className="space-y-3">
      {items.map((f, idx) => {
        const id = f.id ?? idx;
        const isOpen = openId === id;

        return (
          <div
            key={id}
            className="rounded-xl border border-amber-200/60 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 shadow-sm"
          >
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : id)}
              className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-amber-50/60 dark:hover:bg-gray-700/40 rounded-t-xl"
            >
              <div className="mt-0.5">
                <HelpCircle className="h-5 w-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
                  {f.title || f.q || f.question || "Câu hỏi"}
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                  {(f.tag || f.category) && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
                      <Tag className="h-3 w-3" />
                      {f.tag || f.category}
                    </span>
                  )}
                  {fmtDate(f.updated_at) && (
                    <span className="inline-flex items-center gap-1 text-gray-500 dark:text-gray-400">
                      <Clock className="h-3.5 w-3.5" />
                      Cập nhật: {fmtDate(f.updated_at)}
                    </span>
                  )}
                </div>
              </div>

              <div className="ml-2 mt-0.5 text-gray-500 dark:text-gray-400">
                {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </button>

            {isOpen && (
              <div className="px-4 pb-4">
                <div className="rounded-lg border border-amber-100 dark:border-gray-700 bg-amber-50/40 dark:bg-gray-900/30 p-3">
                  <div className="text-sm leading-relaxed text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                    {f.answer || f.a || "Nội dung đang cập nhật."}
                  </div>
                  {f.note ? (
                    <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">{f.note}</div>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

/* ================= Main ================= */
export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [game, setGame] = useState(null);
  const endRef = useRef(null);

  const push = (m) => setMessages((prev) => [...prev, m]);
  const say  = (t) => push({ role: "assistant", type: "text", content: t });
  const you  = (t) => push({ role: "user", type: "text", content: t });

  useEffect(() => {
    resetConversation();
  }, []);
  useEffect(() => {
    if (endRef.current) endRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

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

  /* -------- INTENT -------- */
  const intentOf = (t) => {
    const s = (t || "").toLowerCase();
    if (/\bord[-_ ]?[a-z0-9]+\b/.test(s)) return "track";
    if (/đơn gần|lịch sử|đơn hàng.*(gần|tháng)/.test(s)) return "orders.last";
    if (/bestseller|bán chạy|trending|hot|doanh thu/.test(s)) return "trending";
    if (/mua|đặt|đặt sách/.test(s)) return "buy";
    if (/faq|câu hỏi thường gặp|chính sách|freeship|thanh toán|đổi trả/.test(s)) return "faq";
    if (/khuyến mãi|voucher|mã giảm/.test(s)) return "promo";
    if (/mini game|trò chơi/.test(s)) return "minigame";
    if (/nhắc đọc|remind/.test(s)) return "remind";
    return "ai";
  };

  /* -------- Orders -------- */
  const fetchOrdersPage = async (page = 1) => {
    const r = await orderService.getUserOrders({ page });
    const items = pickAnyArray(r?.data ?? r) || [];
    const meta = r?.data?.meta || r?.meta || {};
    const lastPage = Number(meta.last_page || 1) || 1;
    return { items, lastPage };
  };

  const findOrderByCodeAcrossPages = async (rawCode, maxPages = 10) => {
    const needle = rawCode.replace(/[\s_]/g, "-").toUpperCase();

    let items = [], lastPage = 1;
    try {
      const first = await fetchOrdersPage(1);
      items = first.items;
      lastPage = first.lastPage;
    } catch {
      return null;
    }

    const tryFind = (list) =>
      list.find((o) => {
        const c = (
          o.code ||
          o.order_code ||
          o.order_number ||
          o.reference ||
          o.reference_code ||
          o.number ||
          ""
        ).toString().toUpperCase();
        return c === needle;
      });

    let hit = tryFind(items);
    if (hit) return hit;

    const limit = Math.min(maxPages, lastPage);
    for (let p = 2; p <= limit; p++) {
      try {
        const next = await fetchOrdersPage(p);
        items = next.items;
      } catch {
        break;
      }
      hit = tryFind(items);
      if (hit) return hit;
      if (!items.length) break;
    }
    return null;
  };

  const handleRecentOrders = async () => {
    say("Mình đang xem 3 đơn gần nhất của bạn…");
    try {
      const r = await orderService.getUserOrders({ page: 1 });
      const items = pickAnyArray(r?.data ?? r) || [];
      if (!items.length) return say("Bạn chưa có đơn nào.");
      const sorted = [...items].sort(
        (a, b) =>
          new Date(b.created_at || b.createdAt || 0) -
          new Date(a.created_at || a.createdAt || 0)
      );
      push({ role: "assistant", type: "orders", orders: sorted.slice(0, 3) });
    } catch {
      say("Bạn cần đăng nhập để xem đơn.");
    }
  };

  const handleTrack = async (text) => {
    const m = text.match(/\bord[-_ ]?[a-z0-9]+\b/i);
    if (!m) return say('Bạn nhập mã theo dạng "ORD-XXXX" giúp mình nhé.');
    const code = m[0].replace(/[\s_]/g, "-").toUpperCase();

    // Nếu backend có /orders/search thì có thể dùng trực tiếp:
    // try { const r = await orderService.searchByCode(code);
    //       const order = r?.data ?? r;
    //       if (order) return push({ role: "assistant", type: "orders", orders: [order] });
    // } catch {}

    const hit = await findOrderByCodeAcrossPages(code, 10);
    if (hit) return push({ role: "assistant", type: "orders", orders: [hit] });
    return say("Không tìm thấy đơn với mã này trong lịch sử gần đây.");
  };

  /* -------- Books -------- */
  // “Mua sách” → hiển thị SÁCH MỚI NHẤT (hoặc featured nếu thiếu)
  const handleBuy = async () => {
    say("Đang lấy sách mới nhất…");
    let list = [];
    try {
      const r = await aiService.searchBooks(""); // GET /books
      list = (r?.data?.data || r?.data || []);
      list = [...list].sort(
        (a, b) =>
          new Date(b.created_at || b.createdAt || 0) -
          new Date(a.created_at || a.createdAt || 0)
      );
    } catch {}
    if (!list.length) {
      const f = await aiService.featured().catch(() => null);
      list = (f?.data?.data || f?.data || []).map((x) => x.book || x);
    }
    if (!list.length) return say("Chưa có dữ liệu sách mới.");
    // chuẩn hoá ảnh ngay tại đây để BookCard không phải fix lại
    list = list.map((b) => ({
      ...b,
      image_url: fixImg(
        b.image_url || b.cover_url || b.image || b.thumbnail || b.imageUrl || b?.images?.[0]?.url
      ),
    }));
    push({ role: "assistant", type: "books", title: "Sách mới nhất", books: list.slice(0, 10) });
  };

  const handleTrending = async (text) => {
    const m = (text || "").match(/(\d+)\s*(quyển|sách)/i);
    const limit = m ? parseInt(m[1], 10) : 3;
    try {
      const { data } = await chatApi.trending(limit);
      let items = (data?.data || []).map((r) => {
        const b = r.book || r;
        const img =
          b.image_url || b.cover_url || b.image || b.thumbnail || b.imageUrl || b?.images?.[0]?.url;
        return {
          id: b.id,
          title: b.title,
          author_name: b.author?.name,
          image_url: fixImg(img),
          price: b.price,
          sold: r.sold,
          revenue: r.revenue,
        };
      });
      if (!items.length) return say("Chưa có dữ liệu trending.");
      push({
        role: "assistant",
        type: "books",
        title: `Top ${Math.min(limit, items.length)} sách doanh thu cao`,
        books: items.slice(0, limit),
      });
    } catch {
      const rp = await aiService.featured().catch(() => null);
      let list = (rp?.data?.data || rp?.data || []).map((x) => x.book || x);
      if (!list.length) return say("Chưa có danh sách bán chạy.");
      list = list.map((b) => ({
        ...b,
        image_url: fixImg(
          b.image_url || b.cover_url || b.image || b.thumbnail || b.imageUrl || b?.images?.[0]?.url
        ),
      }));
      push({ role: "assistant", type: "books", title: "Bán chạy / Đang hot", books: list.slice(0, limit) });
    }
  };

  /* -------- FAQ / Promo / Game / Reminder -------- */
  const handleFAQ = async () => {
    const faqsR = await aiService.faqs().catch(() => null);
    const faqs = faqsR?.data?.faqs || faqsR?.data || [];
    if (!faqs.length) return say("FAQ chưa có dữ liệu.");
    push({ role: "assistant", type: "faq", items: faqs });
  };

  const handlePromo = async () => {
    say("Để mình xem khuyến mãi hôm nay…");
    const r = await aiService.activeCoupons().catch(() => null);
    const items = r?.data?.data || r?.data || [];
    if (!items.length) return say("Hiện chưa có mã công khai.");
    const lines = items.slice(0, 5).map((c) => `• ${c.code}: ${c.description || ""}`).join("\n");
    say("Mã đang hoạt động:\n" + lines);
  };

  const startMiniGame = () => {
    const pool = [
      { quote: "“Không ai tắm hai lần trên cùng một dòng sông.”", answer: "triết học" },
      { quote: "“Ta chỉ có một cuộc đời để sống, hãy sống sao cho đáng.”", answer: "tuổi trẻ đáng giá bao nhiêu" },
      { quote: "“Hãy yêu như chưa từng bị tổn thương.”", answer: "self-help" },
    ];
    const q = pool[Math.floor(Math.random() * pool.length)];
    setGame({ step: 1, quote: q.quote, answer: q.answer.toLowerCase() });
    say(`Mini game 🎮: Đoán tên (hoặc thể loại) từ trích dẫn:\n${q.quote}\n→ Trả lời của bạn là?`);
  };

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

  const handleRemindFlow = async (text) => {
    const m = text.match(/(\d+)\s*(phút|giờ|hours|minutes)/i);
    const minutes = m ? (m[2].toLowerCase().startsWith("giờ") ? parseInt(m[1], 10) * 60 : parseInt(m[1], 10)) : 30;
    say(`Đã đặt nhắc đọc ${minutes} phút nữa. Mình sẽ nhắc trong khung chat nhé.`);
    setTimeout(() => push({ role: "assistant", type: "text", content: `⏰ Đến giờ đọc sách ${minutes} phút rồi nè!` }), minutes * 60 * 1000);
  };

  const handleAI = async (text) => {
    setLoading(true);
    try {
      const history = messages.slice(-8).map((m) => ({ role: m.role, content: m.content }));
      const r = await aiService.chat(text, history).catch(() => null);
      push({ role: "assistant", type: "text", content: r?.data?.reply || "Mình chưa rõ. Bạn nói cụ thể hơn nhé." });
    } finally {
      setLoading(false);
      push({ role: "assistant", type: "quick" });
    }
  };

  /* -------- SEND -------- */
  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    you(text);

    const intent = intentOf(text);
    try {
      if (intent === "orders.last") return handleRecentOrders();
      if (intent === "track") return handleTrack(text);
      if (intent === "trending") return handleTrending(text);
      if (intent === "buy") return handleBuy();
      if (intent === "faq") return handleFAQ();
      if (intent === "promo") return handlePromo();
      if (intent === "minigame") return startMiniGame();
      if (intent === "remind") return handleRemindFlow(text);
      return handleAI(text);
    } catch (e) {
      console.debug("[ChatBot] error:", e);
      say("Có lỗi nhỏ. Bạn thử lại giúp mình nhé.");
    }
  };

  /* -------- Render -------- */
  const renderMessage = (m, i) => {
    if (m.type === "quick") {
      return (
        <div key={i} className="flex flex-wrap gap-2">
          {[
            "Mua sách",
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
                if (label === "Mua sách") handleBuy();
                else if (label === "Đơn gần đây") handleRecentOrders();
                else if (label === "FAQ") handleFAQ();
                else if (label === "Khuyến mãi") handlePromo();
                else if (label === "Trending") handleTrending(label);
                else if (label === "Mini game") startMiniGame();
                else if (label === "Nhắc đọc 30 phút") handleRemindFlow("nhắc tôi đọc 30 phút");
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
          {(m.books || []).map((b, idx) => (
            <BookCard key={idx} book={b} onClick={() => (window.location.href = `/books/${b.id}`)} />
          ))}
        </div>
      );
    }
    if (m.type === "orders") {
      return (
        <div key={i} className="space-y-2">
          {(m.orders || []).map((o, idx) => <OrderCard key={idx} order={o} />)}
        </div>
      );
    }
    if (m.type === "faq") {
      return (
        <div key={i} className="space-y-2">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-amber-600" />
            <div className="font-semibold">FAQ</div>
          </div>
          <FAQAccordion items={m.items || []} />
        </div>
      );
    }
    return (
      <div
        key={i}
        className={
          "max-w-[85%] rounded-2xl px-3 py-2 whitespace-pre-wrap " +
          (m.role === "user" ? "ml-auto bg-amber-600 text-white" : "mr-auto bg-amber-100 dark:bg-gray-700")
        }
      >
        {m.content}
      </div>
    );
  };

  /* -------- UI -------- */
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
            <button className="text-sm opacity-70 hover:opacity-100" onClick={resetConversation}>
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
              placeholder='Gõ tin nhắn… (vd: "ORD-ABC123")'
              className="flex-1 resize-none rounded-xl border border-amber-200 dark:border-gray-700 px-3 py-2 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <button onClick={send} className="rounded-xl bg-amber-600 text-white px-4 py-2">
              Gửi
            </button>
          </div>
        </div>
      )}
    </>
  );
}
