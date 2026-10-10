import { useCallback, useEffect, useState } from "react";
import { api, rupees, fmtDate } from "../api.js";
import CustomerForm from "./CustomerForm.jsx";

const today = () => new Date().toISOString().slice(0, 10);

export default function CustomerDetail({ id, onChanged, onDeleted }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [txn, setTxn] = useState({ type: "given", amount: "", note: "", date: today() });
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setData(await api.customer(id));
      setError("");
    } catch (e) {
      setError(e.message);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = async () => {
    await load();
    onChanged();
  };

  const addTxn = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.addTxn(id, txn);
      setTxn({ ...txn, amount: "", note: "" });
      await refresh();
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  };

  const removeTxn = async (tid) => {
    if (!confirm("Ye entry delete karein?")) return;
    await api.deleteTxn(tid);
    refresh();
  };

  const removeCustomer = async () => {
    if (!confirm(`${data.name} aur uski saari entries delete karein?`)) return;
    await api.deleteCustomer(id);
    onDeleted();
  };

  const remind = () => {
    const msg = `Namaste ${data.name}, aapka ${rupees(data.balance)} baaki hai. Kripya jald payment kar dein. Dhanyavaad!`;
    const phone = (data.phone || "").replace(/\D/g, "");
    const num = phone.length === 10 ? "91" + phone : phone;
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  if (error && !data) return <div className="alert">{error}</div>;
  if (!data) return <p className="muted pad">Load ho raha hai…</p>;

  return (
    <div className="pad">
      <div className="detail-head">
        <div>
          <h2>{data.name}</h2>
          <div className="muted small">
            {data.phone || "Phone nahi"} {data.address && `· ${data.address}`}
          </div>
        </div>
        <div className="actions">
          {data.balance > 0 && data.phone && (
            <button className="btn" onClick={remind}>
              WhatsApp Yaad Dilayein
            </button>
          )}
          <button className="btn" onClick={() => setEditing(true)}>
            Edit
          </button>
          <button className="btn danger" onClick={removeCustomer}>
            Delete
          </button>
        </div>
      </div>

      <div className="balance-card">
        <span className="muted small">
          {data.balance > 0 ? "Is customer se lena hai" : data.balance < 0 ? "Advance (aapko dena hai)" : "Hisaab barabar"}
        </span>
        <strong className={data.balance > 0 ? "red" : data.balance < 0 ? "green" : ""}>
          {rupees(Math.abs(data.balance))}
        </strong>
        <span className="muted small">
          Udhar {rupees(data.given)} · Wapas {rupees(data.received)}
        </span>
      </div>

      {error && <div className="alert">{error}</div>}

      <form className="txn-form" onSubmit={addTxn}>
        <div className="toggle">
          <button
            type="button"
            className={txn.type === "given" ? "on red-bg" : ""}
            onClick={() => setTxn({ ...txn, type: "given" })}
          >
            Udhar Diya
          </button>
          <button
            type="button"
            className={txn.type === "received" ? "on green-bg" : ""}
            onClick={() => setTxn({ ...txn, type: "received" })}
          >
            Payment Mili
          </button>
        </div>
        <input
          type="number"
          min="0.01"
          step="0.01"
          placeholder="Amount ₹"
          value={txn.amount}
          onChange={(e) => setTxn({ ...txn, amount: e.target.value })}
          required
        />
        <input
          placeholder="Note (optional)"
          value={txn.note}
          onChange={(e) => setTxn({ ...txn, note: e.target.value })}
        />
        <input
          type="date"
          value={txn.date}
          onChange={(e) => setTxn({ ...txn, date: e.target.value })}
        />
        <button className="btn primary" disabled={busy}>
          Add
        </button>
      </form>

      <h3>Entries</h3>
      {data.transactions.length === 0 && <p className="muted">Abhi koi entry nahi hai.</p>}
      <table className="table">
        <tbody>
          {data.transactions.map((t) => (
            <tr key={t._id}>
              <td>{fmtDate(t.date)}</td>
              <td className="muted">{t.note || "—"}</td>
              <td className={t.type === "given" ? "red right" : "green right"}>
                {t.type === "given" ? "+" : "−"} {rupees(t.amount)}
              </td>
              <td className="right">
                <button className="link" onClick={() => removeTxn(t._id)}>
                  ✕
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editing && (
        <CustomerForm
          customer={data}
          onClose={() => setEditing(false)}
          onSaved={() => {
            setEditing(false);
            refresh();
          }}
        />
      )}
    </div>
  );
}
