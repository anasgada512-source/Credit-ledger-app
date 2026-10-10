const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { signToken, requireAuth } = require("../middleware/auth");

const router = express.Router();

const emailOk = (e) => /^\S+@\S+\.\S+$/.test(e || "");
const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email });

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: "Naam zaroori hai" });
  if (!emailOk(email)) return res.status(400).json({ error: "Sahi email daalein" });
  if (!password || password.length < 6)
    return res.status(400).json({ error: "Password kam se kam 6 akshar ka hona chahiye" });

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) return res.status(409).json({ error: "Is email se account pehle se hai" });

  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hash });
  res.status(201).json({ token: signToken(user._id), user: publicUser(user) });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!emailOk(email) || !password)
    return res.status(400).json({ error: "Email aur password daalein" });

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  const ok = user && (await bcrypt.compare(password, user.password));
  // Same message dono cases mein, taaki email guess na ho sake
  if (!ok) return res.status(401).json({ error: "Email ya password galat hai" });

  res.json({ token: signToken(user._id), user: publicUser(user) });
});

router.get("/me", requireAuth, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(401).json({ error: "Account nahi mila" });
  res.json({ user: publicUser(user) });
});

module.exports = router;
