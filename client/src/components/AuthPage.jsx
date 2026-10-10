import { useState } from "react";
import { api, auth } from "../api.js";

export default function AuthPage({ onLoggedIn }) {
  const [mode, setMode] = useState("login"); // "login" ya "register"
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const isRegister = mode === "register";

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const data = isRegister
        ? await api.register(form)
        : await api.login({ email: form.email, password: form.password });
      auth.setToken(data.token);
      onLoggedIn(data.user);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <form className="auth-card" onSubmit={submit}>
        <h1>📒 Credit Ledger App</h1>
        <p className="muted">
          {isRegister ? "Naya account banayein" : "Apne account mein login karein"}
        </p>

        {error && <div className="alert">{error}</div>}

        {isRegister && (
          <label>
            Aapka naam
            <input value={form.name} onChange={set("name")} required autoFocus />
          </label>
        )}
        <label>
          Email
          <input type="email" value={form.email} onChange={set("email")} required />
        </label>
        <label>
          Password
          <input
            type="password"
            value={form.password}
            onChange={set("password")}
            minLength={isRegister ? 6 : undefined}
            required
          />
        </label>

        <button className="btn primary" disabled={busy}>
          {busy ? "Ruko…" : isRegister ? "Account Banayein" : "Login"}
        </button>

        <p className="muted small center">
          {isRegister ? "Pehle se account hai?" : "Naya user hain?"}{" "}
          <button
            type="button"
            className="link-btn"
            onClick={() => {
              setMode(isRegister ? "login" : "register");
              setError("");
            }}
          >
            {isRegister ? "Login karein" : "Account banayein"}
          </button>
        </p>
      </form>
    </div>
  );
}
