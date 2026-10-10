const express = require("express");
const mongoose = require("mongoose");
const Customer = require("../models/Customer");
const Transaction = require("../models/Transaction");

const router = express.Router();

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Balance = sum(given) - sum(received). Positive => customer ko dena hai.
async function balancesMap(ownerId) {
  const rows = await Transaction.aggregate([
    { $match: { owner: new mongoose.Types.ObjectId(ownerId) } },
    {
      $group: {
        _id: "$customer",
        given: { $sum: { $cond: [{ $eq: ["$type", "given"] }, "$amount", 0] } },
        received: { $sum: { $cond: [{ $eq: ["$type", "received"] }, "$amount", 0] } },
        lastTxn: { $max: "$date" },
      },
    },
  ]);
  const map = new Map();
  rows.forEach((r) =>
    map.set(String(r._id), {
      given: r.given,
      received: r.received,
      balance: r.given - r.received,
      lastTxn: r.lastTxn,
    })
  );
  return map;
}

// ---------- Summary ----------
router.get("/summary", async (req, res) => {
  const map = await balancesMap(req.user.id);
  let totalGiven = 0;
  let totalReceived = 0;
  let pendingCustomers = 0;
  map.forEach((v) => {
    totalGiven += v.given;
    totalReceived += v.received;
    if (v.balance > 0) pendingCustomers += 1;
  });
  const customers = await Customer.countDocuments({ owner: req.user.id });
  res.json({
    customers,
    pendingCustomers,
    totalGiven,
    totalReceived,
    totalPending: totalGiven - totalReceived,
  });
});

// ---------- Customers ----------
router.get("/customers", async (req, res) => {
  const q = (req.query.q || "").toString().trim();
  const filter = { owner: req.user.id };
  if (q) {
    const rx = new RegExp(escapeRegex(q), "i");
    filter.$or = [{ name: rx }, { phone: rx }];
  }
  const customers = await Customer.find(filter).sort({ name: 1 }).lean();
  const map = await balancesMap(req.user.id);
  res.json(
    customers.map((c) => ({
      ...c,
      ...(map.get(String(c._id)) || { given: 0, received: 0, balance: 0, lastTxn: null }),
    }))
  );
});

router.post("/customers", async (req, res) => {
  const { name, phone, address } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: "Naam zaroori hai" });
  const customer = await Customer.create({ owner: req.user.id, name, phone, address });
  res.status(201).json(customer);
});

router.get("/customers/:id", async (req, res) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ error: "Galat id" });
  const customer = await Customer.findOne({ _id: req.params.id, owner: req.user.id }).lean();
  if (!customer) return res.status(404).json({ error: "Customer nahi mila" });
  const transactions = await Transaction.find({ customer: customer._id, owner: req.user.id })
    .sort({ date: -1, createdAt: -1 })
    .lean();
  let given = 0;
  let received = 0;
  transactions.forEach((t) => {
    if (t.type === "given") given += t.amount;
    else received += t.amount;
  });
  res.json({ ...customer, given, received, balance: given - received, transactions });
});

router.put("/customers/:id", async (req, res) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ error: "Galat id" });
  const { name, phone, address } = req.body;
  if (name !== undefined && !name.trim()) return res.status(400).json({ error: "Naam zaroori hai" });
  const customer = await Customer.findOneAndUpdate(
    { _id: req.params.id, owner: req.user.id },
    { name, phone, address },
    { new: true, runValidators: true }
  );
  if (!customer) return res.status(404).json({ error: "Customer nahi mila" });
  res.json(customer);
});

router.delete("/customers/:id", async (req, res) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ error: "Galat id" });
  const customer = await Customer.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
  if (!customer) return res.status(404).json({ error: "Customer nahi mila" });
  await Transaction.deleteMany({ customer: customer._id, owner: req.user.id });
  res.json({ ok: true });
});

// ---------- Transactions ----------
router.post("/customers/:id/transactions", async (req, res) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ error: "Galat id" });
  const customer = await Customer.findOne({ _id: req.params.id, owner: req.user.id });
  if (!customer) return res.status(404).json({ error: "Customer nahi mila" });

  const { type, amount, note, date } = req.body;
  const amt = Number(amount);
  if (!["given", "received"].includes(type)) return res.status(400).json({ error: "Type galat hai" });
  if (!Number.isFinite(amt) || amt <= 0) return res.status(400).json({ error: "Amount sahi daalein" });

  const txn = await Transaction.create({
    owner: req.user.id,
    customer: customer._id,
    type,
    amount: amt,
    note,
    date: date ? new Date(date) : new Date(),
  });
  res.status(201).json(txn);
});

router.delete("/transactions/:id", async (req, res) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ error: "Galat id" });
  const txn = await Transaction.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
  if (!txn) return res.status(404).json({ error: "Entry nahi mili" });
  res.json({ ok: true });
});

module.exports = router;
