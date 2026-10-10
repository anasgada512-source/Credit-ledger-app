const mongoose = require("mongoose");

// given    = dukaan se udhar diya gaya (customer ka baaki badhta hai)
// received = customer ne payment di (customer ka baaki ghat'ta hai)
const transactionSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },
    type: { type: String, enum: ["given", "received"], required: true },
    amount: { type: Number, required: true, min: 0.01 },
    note: { type: String, trim: true, default: "" },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
