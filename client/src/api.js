const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
const TOKEN_KEY = "credit-ledger-token";

export const auth = {
  getToken: () => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  setToken: (t) => {
    try {
      localStorage.setItem(TOKEN_KEY, t);
    } catch {}
  },
  clear: () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {}
  },
};

async function request(path, options = {}) {
  const token = auth.getToken();
  const res = await fetch(`${API_BASE}/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && token && !path.startsWith("/auth/login")) {
    // Token expire ya galat: login screen par bhej do
    auth.clear();
    window.dispatchEvent(new Event("auth-expired"));
  }
  if (!res.ok) throw new Error(data.error || "Kuch galat ho gaya");
  return data;
}

export const api = {
  login: (body) => request("/auth/login", { method: "POST", body }),
  register: (body) => request("/auth/register", { method: "POST", body }),
  me: () => request("/auth/me"),
  summary: () => request("/summary"),
  customers: (q = "") => request(`/customers${q ? `?q=${encodeURIComponent(q)}` : ""}`),
  customer: (id) => request(`/customers/${id}`),
  addCustomer: (body) => request("/customers", { method: "POST", body }),
  updateCustomer: (id, body) => request(`/customers/${id}`, { method: "PUT", body }),
  deleteCustomer: (id) => request(`/customers/${id}`, { method: "DELETE" }),
  addTxn: (id, body) => request(`/customers/${id}/transactions`, { method: "POST", body }),
  deleteTxn: (id) => request(`/transactions/${id}`, { method: "DELETE" }),
};

export const rupees = (n) =>
  "₹" + Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });

export const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
