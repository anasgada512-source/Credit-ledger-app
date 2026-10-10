const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    // Ye customer kis dukaandaar (user) ka hai
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true, default: "" },
    address: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Customer", customerSchema);
