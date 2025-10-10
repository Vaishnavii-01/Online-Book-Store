// server.js
require("dotenv").config();
const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 5000;

// Allowed origins list
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL || "https://online-book-store-1-wth4.onrender.com",
  "https://online-book-store-frontend.vercel.app"
];

// CORS options for the cors package
const corsOptions = {
  origin: function (origin, callback) {
    // origin === undefined for non-browser requests (curl, server-to-server).
    if (!origin) {
      // allow non-browser requests
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.log(`[CORS DEBUG] blocked origin: ${origin}`);
      return callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 204
};

// Apply CORS middleware BEFORE your routes
app.use(cors(corsOptions));

// Optional: explicit OPTIONS handling for all routes (robust preflight handling)
app.options("*", cors(corsOptions));

// Keep your cache-control header, applied after cors so it appears on responses
app.use((req, res, next) => {
  const origin = req.headers.origin || "none";
  console.log(`[CORS DEBUG] incoming origin: ${origin}  url: ${req.originalUrl}`);
  res.setHeader("Cache-Control", "no-store");
  next();
});

// Body parser
app.use(express.json());

// MongoDB connection
async function main() {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log("✅ MongoDB connected successfully!");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
  }
}
main();

// WebSocket initialization (optional)
try {
  const BookCommunityWS = require("./src/ws/bookSwap");
  new BookCommunityWS(server);
  console.log("✅ WebSocket server initialized successfully");
} catch (error) {
  console.error("❌ WebSocket initialization failed:", error.message);
  console.log("💡 Running without WebSocket functionality");
}

// Routes (unchanged)
const bookRoutes = require("./src/books/book.route");
const orderRoutes = require("./src/orders/order.route");
const userRoutes = require("./src/users/user.route");
const adminRoutes = require("./src/stats/admin.stats");

app.use("/api/books", bookRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/auth", userRoutes);
app.use("/api/admin", adminRoutes);

// Debug route for CORS
app.get("/api/debug-cors", (req, res) => {
  const origin = req.headers.origin || "none";
  // echo back headers and allowed origins for troubleshooting
  res.setHeader("X-Debug-Origin", origin);
  res.json({
    ok: true,
    originReceived: origin,
    allowedOrigins,
  });
});

// Health check
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

// Error handler for CORS rejections coming from corsOptions
// (the cors middleware throws an Error('Not allowed by CORS') for blocked origins)
app.use((err, req, res, next) => {
  if (err && err.message === "Not allowed by CORS") {
    // Give a clear CORS error response for debugging from the client
    res.status(403).json({
      ok: false,
      error: "CORS blocked this origin",
      origin: req.headers.origin || null,
      allowedOrigins
    });
  } else {
    next(err);
  }
});

server.listen(port, "0.0.0.0", () => {
  console.log(`🌐 Server running on port ${port}`);
});