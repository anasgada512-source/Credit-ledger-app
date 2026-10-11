require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./app");

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/credit-ledger";

mongoose
  .connect(MONGO_URI, { serverSelectionTimeoutMS: 8000 })
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server chal raha hai: http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("\n❌ MongoDB se connect nahi ho paya:", err.message);
    console.error("\nKya karein:");
    console.error("  1. server/.env file banayi hai? (server/.env.example ko copy karke .env naam dein)");
    console.error("  2. .env mein MONGO_URI sahi hai? Atlas ka link (mongodb+srv://...) ya local MongoDB.");
    console.error("  3. Local MongoDB nahi hai to MongoDB Atlas ka free link use karein (README dekhein).");
    console.error("  4. Atlas mein Network Access > 0.0.0.0/0 allow kiya? Password mein <> hata diye?\n");
    process.exit(1);
  });
