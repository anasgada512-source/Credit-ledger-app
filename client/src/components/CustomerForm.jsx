import { useState } from "react";
import { api } from "../api.js";

// customer prop diya ho to edit mode, warna naya customer
export default function CustomerForm({ customer, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: customer?.name || "",
    phone: customer?.phone || "",
    address: customer?.address || "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const saved = customer
        ? await api.updateCustomer(customer._id, form)
        : await api.addCustomer(form);
      onSaved(saved);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="modal-bg" onClick={onClose}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <h2>{customer ? "Customer Edit Karein" : "Naya Customer"}</h2>
        {error && <div className="alert">{error}</div>}
        <label>
          Naam *
          <input value={form.name} onChange={set("name")} autoFocus required />
        </label>
        <label>
          Phone
          <input value={form.phone} onChange={set("phone")} inputMode="tel" />
        </label>
        <label>
          Address
          <input value={form.address} onChange={set("address")} />
        </label>
        <div className="actions">
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <button className="btn primary" disabled={busy}>
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
