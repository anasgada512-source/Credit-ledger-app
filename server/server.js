require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./app");

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/credit-ledger";

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
