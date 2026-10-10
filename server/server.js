require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const api = require("./routes/api");

const app = express();
const allowed = (process.env.CORS_ORIGIN || "").split(",").map((o) => o.trim()).filter(Boolean);
app.use(cors(allowed.length ? { origin: allowed } : undefined));
app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true }));
app.use("/api", api);

// Error handler (async errors ke liye)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Server error" });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/udhar-khata";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server chal raha hai: http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection fail:", err.message);
    process.exit(1);
  });
