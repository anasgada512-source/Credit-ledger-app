const jwt = require("jsonwebtoken");

function getSecret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET environment variable set karna zaroori hai");
  }
  return "dev-only-secret-change-me";
}

const signToken = (userId) =>
  jwt.sign({ id: userId }, getSecret(), { expiresIn: "7d" });

// Har protected route se pehle chalta hai: token check karke req.user set karta hai
function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Pehle login karein" });
  try {
    const payload = jwt.verify(token, getSecret());
    req.user = { id: payload.id };
    next();
  } catch {
    res.status(401).json({ error: "Session expire ho gaya, dobara login karein" });
  }
}

module.exports = { signToken, requireAuth, getSecret };
