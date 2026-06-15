require("dotenv").config();
const mongoose = require("mongoose");
const { buildApp } = require("./app");

const PORT = process.env.PORT || 5000;

if (!process.env.MONGO_URL) {
  console.error("Missing MONGO_URL in backend/.env");
  process.exit(1);
}

const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB connected");
    buildApp().listen(PORT, () =>
      console.log(`API on http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error("MongoDB error:", err.message);
    process.exit(1);
  }
};

start();

