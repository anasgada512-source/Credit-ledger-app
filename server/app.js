const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const { requireAuth, getSecret } = require("./middleware/auth");
const authRoutes = require("./routes/auth");
const api = require("./routes/api");

getSecret(); // production mein JWT_SECRET na ho to start hote hi error

const app = express();
const allowed = (process.env.CORS_ORIGIN || "").split(",").map((o) => o.trim()).filter(Boolean);
app.use(cors(allowed.length ? { origin: allowed } : undefined));
app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true }));

// Login/register par rate limit: 20 koshish per 15 minute (password guess rokne ke liye)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Bahut zyada koshish, kuch der baad try karein" },
});
app.use("/api/auth", authLimiter, authRoutes);

// Baaki saare /api routes login ke bina nahi khulte
app.use("/api", requireAuth, api);

// Error handler (async errors ke liye)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Server error" });
});

module.exports = app;
