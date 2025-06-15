
import React, { useEffect, useMemo, useRef, useState } from "react";
import { api, fetchCsrfToken } from "../../services/api.js";
import { useAuth } from "../../contexts/AuthContext";

// UI utils
const cx = (...xs) => xs.filter(Boolean).join(" ");

function Section({ title, children, footer }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-base font-semibold text-slate-800">{title}</h2>
      <div className="grid gap-4">{children}</div>
      {footer && <div className="mt-4 flex justify-end">{footer}</div>}
    </section>
  );
}

function TextInput({ error, className, ...rest }) {
  return (
    <div>
      <input
        {...rest}
        className={cx(
          "w-full rounded-xl border bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100",
          error ? "border-red-300" : "border-slate-200",
          className
        )}
      />
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

function Button({ variant = "primary", busy, className, children, ...rest }) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed";
  const styles =
    variant === "primary"
      ? "bg-orange-500 text-white hover:bg-orange-600"
      : variant === "danger"
      ? "bg-red-500 text-white hover:bg-red-600"
      : "hover:bg-slate-100";
  return (
    <button {...rest} className={cx(base, styles, className)}>
      {busy ? (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      ) : null}
      {children}
    </button>
  );
}

function Avatar({ src, name, size = 96 }) {
  const initials = useMemo(() => {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    const a = parts[0]?.[0] ?? "";
    const b = parts[parts.length - 1]?.[0] ?? "";
    return (a + b).toUpperCase();
  }, [name]);
  return (
    <div
      className="relative inline-flex items-center justify-center rounded-full bg-gradient-to-br from-amber-200 to-orange-300 text-orange-900 shadow ring-2 ring-white"
      style={{ width: size, height: size }}
      aria-label="avatar"
    >
      {src ? (
        // eslint-disable-next-line jsx-a11y/img-redundant-alt
        <img src={src} alt="avatar image" className="w-full h-full rounded-full object-cover" />
      ) : (
        <span className="font-semibold" style={{ fontSize: size * 0.35 }}>
          {initials}
        </span>
      )}
    </div>
  );
}

function SidebarItem({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={cx(
        "w-full rounded-xl px-4 py-2 text-sm text-left transition",
        active ? "bg-orange-50 text-orange-700 border border-orange-200" : "hover:bg-slate-100"
      )}
    >
      {label}
    </button>
  );
}

// Toast
const useToasts = () => {
  const [items, setItems] = useState([]);
  const push = (type, message) => {
    const id = Date.now() + Math.random();
    setItems((s) => [...s, { id, type, message }]);
    setTimeout(() => setItems((s) => s.filter((x) => x.id !== id)), 3800);
  };
  return {
    items,
    success: (m) => push("success", m),
    error: (m) => push("error", m),
  };
};
const Toasts = ({ items }) => (
  <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-80 flex-col gap-2">
    {items.map((t) => (
      <div
        key={t.id}
        className={cx(
          "pointer-events-auto rounded-xl px-4 py-3 shadow-lg border",
          t.type === "success" ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-red-50 text-red-800 border-red-200"
        )}
      >
        {t.message}
      </div>
    ))}
  </div>
);

// Main component
export default function ProfilePage() {
  const { user } = useAuth(); // lấy từ đăng ký/đăng nhập
  const [tab, setTab] = useState("info"); // info | avatar | password
  const { items, success, error } = useToasts();

  const [serverUser, setServerUser] = useState(null);
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/me');
        setServerUser(res?.data?.user || null);
      } catch (e) {
        console.warn('Không lấy được /me:', e?.response?.status);
      }
    })();
  }, []);

  // ===== Avatar upload =====
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const fileRef = useRef(null);

  const onPickFile = () => fileRef.current?.click();
  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type || !f.type.startsWith('image/')) {
      error("Vui lòng chọn file ảnh (PNG/JPG/WebP).");
      return;
    }
    if (f.size > 3 * 1024 * 1024) {
      error("Ảnh quá lớn, giới hạn 3MB.");
      return;
    }
    const url = URL.createObjectURL(f);
    setAvatarPreview(url);
  };

  const uploadAvatar = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) return error("Chưa chọn ảnh.");
    setAvatarBusy(true);
    try {
      await fetchCsrfToken();
      const fd = new FormData();
      fd.append("avatar", file);
      const res = await api.post("/me/avatar", fd);
      success("Cập nhật ảnh đại diện thành công.");
      // Cập nhật localStorage nếu backend trả avatarUrl
      const url = res?.data?.avatarUrl;
      if (url) {
        try {
          const u = JSON.parse(localStorage.getItem("user") || "{}");
          u.avatarUrl = url; u.avatar_url = url;
          localStorage.setItem("user", JSON.stringify(u));
        } catch {}
      }
      setTimeout(() => window.location.reload(), 800);
    } catch (e) {
      console.error(e);
      error(e?.response?.data?.message || "Tải ảnh thất bại.");
    } finally {
      setAvatarBusy(false);
    }
  };

  // ===== Change password =====
  const [pwdBusy, setPwdBusy] = useState(false);
  const [pwd, setPwd] = useState({ old: "", n1: "", n2: "" });
  const [errs, setErrs] = useState({});

  const validatePwd = () => {
    const e = {};
    if (!pwd.old) e.old = "Nhập mật khẩu hiện tại";
    if (pwd.n1.length < 6) e.n1 = "Mật khẩu mới tối thiểu 6 ký tự";
    if (pwd.n1 !== pwd.n2) e.n2 = "Xác nhận mật khẩu không khớp";
    setErrs(e);
    return Object.keys(e).length === 0;
    };
  const submitPwd = async () => {
    if (!validatePwd()) return;
    setPwdBusy(true);
    try {
      await fetchCsrfToken();
      await api.put("/me/password", { oldPassword: pwd.old, newPassword: pwd.n1 });
      success("Đổi mật khẩu thành công.");
      setPwd({ old: "", n1: "", n2: "" });
    } catch (e) {
      console.error(e);
      error(e?.response?.data?.message || "Đổi mật khẩu thất bại.");
    } finally {
      setPwdBusy(false);
    }
  };

  // ===== Render =====
  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6 md:p-8">
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-4">
        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <Avatar src={(serverUser?.avatar_url || user?.avatarUrl)} name={(serverUser?.name || user?.fullName || user?.name)} size={56} />
              <div>
                <div className="text-sm font-semibold text-slate-800">{(serverUser?.name || user?.fullName || user?.name) || "Người dùng"}</div>
                <div className="text-xs text-slate-500">{(serverUser?.email || user?.email)}</div>
              </div>
            </div>
            <div className="grid gap-2">
              <SidebarItem active={tab === "info"} onClick={() => setTab("info")} label="Thông tin tài khoản" />
              <SidebarItem active={tab === "avatar"} onClick={() => setTab("avatar")} label="Ảnh đại diện" />
              <SidebarItem active={tab === "password"} onClick={() => setTab("password")} label="Đổi mật khẩu" />
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="lg:col-span-3 grid gap-6">
          {tab === "info" && (
            <Section title="Thông tin tài khoản">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <div className="text-xs text-slate-500">Họ và tên</div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">{(serverUser?.name || user?.fullName || user?.name) || "—"}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Email</div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">{(serverUser?.email || (serverUser?.email || user?.email) || "—")}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Số điện thoại</div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">{(serverUser?.phone || (serverUser?.phone || user?.phone) || "—")}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Ngày tham gia</div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">{(serverUser?.created_at ? new Date(serverUser.created_at).toLocaleDateString() : (user?.joinedAt ? new Date(user.joinedAt).toLocaleDateString() : "—"))}</div>
                </div>
              </div>
            </Section>
          )}

          {tab === "avatar" && (
            <Section
              title="Đổi ảnh đại diện"
              footer={
                <div className="flex items-center gap-3">
                  <Button variant="ghost" onClick={() => { setAvatarPreview(null); if (fileRef.current) fileRef.current.value = "" }}>
                    Huỷ
                  </Button>
                  <Button onClick={uploadAvatar} busy={avatarBusy}>Lưu ảnh</Button>
                </div>
              }
            >
              <div className="flex items-center gap-6">
                <Avatar src={avatarPreview || (serverUser?.avatar_url || user?.avatarUrl)} name={(serverUser?.name || user?.fullName || user?.name)} size={96} />
                <div className="grid gap-2 text-sm">
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
                  <Button variant="ghost" onClick={onPickFile}>Chọn ảnh…</Button>
                  <p className="text-xs text-slate-500">Hỗ trợ PNG/JPG/WebP • Tối đa 3MB</p>
                </div>
              </div>
            </Section>
          )}

          {tab === "password" && (
            <Section
              title="Đổi mật khẩu"
              footer={<Button onClick={submitPwd} busy={pwdBusy}>Cập nhật mật khẩu</Button>}
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-slate-700">Mật khẩu hiện tại</label>
                  <TextInput type="password" value={pwd.old} onChange={(e) => setPwd({ ...pwd, old: e.target.value })} placeholder="••••••••" error={errs.old} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Mật khẩu mới</label>
                  <TextInput type="password" value={pwd.n1} onChange={(e) => setPwd({ ...pwd, n1: e.target.value })} placeholder="Tối thiểu 6 ký tự" error={errs.n1} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Xác nhận mật khẩu mới</label>
                  <TextInput type="password" value={pwd.n2} onChange={(e) => setPwd({ ...pwd, n2: e.target.value })} placeholder="Nhập lại mật khẩu mới" error={errs.n2} />
                </div>
              </div>
            </Section>
          )}
        </main>
      </div>

      {/* Toasts */}
      <Toasts items={items} />
    </div>
  );
}
