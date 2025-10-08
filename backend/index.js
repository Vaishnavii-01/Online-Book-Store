const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 5000;

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL || "https://online-book-store-1-wth4.onrender.com",
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (!origin) {
    res.setHeader("Access-Control-Allow-Credentials", "true");
    return next();
  }

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    res.setHeader("Vary", "Origin");
  }

  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

app.use(express.json());

async function main() {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log("✅ MongoDB connected successfully!");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
  }
}
main();

try {
  const BookCommunityWS = require("./src/ws/bookSwap");
  new BookCommunityWS(server);
  console.log("✅ WebSocket server initialized successfully");
} catch (error) {
  console.error("❌ WebSocket initialization failed:", error.message);
  console.log("💡 Running without WebSocket functionality");
}

const bookRoutes = require("./src/books/book.route");
const orderRoutes = require("./src/orders/order.route");
const userRoutes = require("./src/users/user.route");
const adminRoutes = require("./src/stats/admin.stats");

app.use("/api/books", bookRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/auth", userRoutes);
app.use("/api/admin", adminRoutes);

app.get("/api/debug-cors", (req, res) => {
  const origin = req.headers.origin || "none";
  res.setHeader("X-Debug-Origin", origin);
  res.json({
    ok: true,
    originReceived: origin,
    allowedOrigins,
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "Book Store API",
    version: "1.0.0",
    mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

app.get("/", (req, res) => {
  res.json({
    message: "Book Store Server is running successfully!",
    api: "/api/books, /api/orders, /api/auth, /api/admin",
  });
});

server.listen(port, "0.0.0.0", () => {
  console.log(`🌐 Server running on port ${port}`);
});