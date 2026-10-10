const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}/api${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Kuch galat ho gaya");
  return data;
}

export const api = {
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
