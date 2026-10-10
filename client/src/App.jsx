import { useCallback, useEffect, useState } from "react";
import { api, rupees, fmtDate } from "./api.js";
import CustomerForm from "./components/CustomerForm.jsx";
import CustomerDetail from "./components/CustomerDetail.jsx";

export default function App() {
  const [summary, setSummary] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const [s, c] = await Promise.all([api.summary(), api.customers(query)]);
      setSummary(s);
      setCustomers(c);
      setError("");
    } catch (e) {
      setError(e.message);
    }
  }, [query]);

  useEffect(() => {
    const t = setTimeout(load, 200);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <div className="app">
      <header className="topbar">
        <h1>📒 Udhar Khata</h1>
        <button className="btn primary" onClick={() => setShowForm(true)}>
          + Naya Customer
        </button>
      </header>

      {error && <div className="alert">{error}</div>}

      <section className="stats">
        <Stat label="Total Baaki" value={rupees(summary?.totalPending)} tone="red" />
        <Stat label="Total Udhar Diya" value={rupees(summary?.totalGiven)} />
        <Stat label="Total Wapas Mila" value={rupees(summary?.totalReceived)} tone="green" />
        <Stat
          label="Customers"
          value={`${summary?.customers ?? 0} (${summary?.pendingCustomers ?? 0} baaki)`}
        />
      </section>

      <main className="layout">
        <aside className="panel list">
          <input
            className="search"
            placeholder="Naam ya phone se dhundhein…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {customers.length === 0 && <p className="muted pad">Koi customer nahi mila.</p>}
          <ul>
            {customers.map((c) => (
              <li
                key={c._id}
                className={c._id === selectedId ? "row active" : "row"}
                onClick={() => setSelectedId(c._id)}
              >
                <div>
                  <strong>{c.name}</strong>
                  <div className="muted small">
                    {c.phone || "—"}
                    {c.lastTxn && ` · ${fmtDate(c.lastTxn)}`}
                  </div>
                </div>
                <span className={c.balance > 0 ? "amt red" : c.balance < 0 ? "amt green" : "amt"}>
                  {rupees(Math.abs(c.balance))}
                  <small>{c.balance > 0 ? " baaki" : c.balance < 0 ? " advance" : ""}</small>
                </span>
              </li>
            ))}
          </ul>
        </aside>

        <section className="panel detail">
          {selectedId ? (
            <CustomerDetail
              key={selectedId}
              id={selectedId}
              onChanged={load}
              onDeleted={() => {
                setSelectedId(null);
                load();
              }}
            />
          ) : (
            <p className="muted pad">Left side se koi customer chunein ya naya banayein.</p>
          )}
        </section>
      </main>

      {showForm && (
        <CustomerForm
          onClose={() => setShowForm(false)}
          onSaved={(c) => {
            setShowForm(false);
            setSelectedId(c._id);
            load();
          }}
        />
      )}
    </div>
  );
}

function Stat({ label, value, tone }) {
  return (
    <div className="stat">
      <span className="muted small">{label}</span>
      <strong className={tone || ""}>{value}</strong>
    </div>
  );
}
