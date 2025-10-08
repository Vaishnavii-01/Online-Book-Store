const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
require('dotenv').config()

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', process.env.FRONTEND_URL],
    credentials: true
}))
app.use(express.json());

// WebSocket Server
console.log('🚀 Starting Book Community WebSocket server...');
try {
    const BookCommunityWS = require('./src/ws/bookSwap');
    const bookCommunityWS = new BookCommunityWS(server);
    console.log('✅ Book Community WebSocket server initialized successfully');
} catch (error) {
    console.error('❌ WebSocket server failed:', error.message);
    console.log('💡 Running without WebSocket functionality');
}

// Your existing routes
const bookRoutes = require('./src/books/book.route');
const orderRoutes = require("./src/orders/order.route");
const userRoutes = require("./src/users/user.route");
const adminRoutes = require("./src/stats/admin.stats");

app.use("/api/books", bookRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/auth", userRoutes);
app.use("/api/admin", adminRoutes);

// WebSocket test endpoint
app.get("/api/websocket-status", (req, res) => {
    res.json({ 
        status: "Book Community Server running",
        websocket: "Active on /chat",
        port: port,
        timestamp: new Date().toISOString()
    });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
    res.json({ 
        status: "healthy",
        service: "Book Store API",
        websocket: "Community Chat",
        version: "1.0.0"
    });
});

// Root endpoint
app.get("/", (req, res) => {
    res.json({ 
        message: "Book Store Server with Community Chat",
        endpoints: {
            api: "/api/books, /api/orders, etc.",
            websocket: "ws://localhost:5000/chat",
            status: "/api/websocket-status"
        }
    });
});

async function main() {
    await mongoose.connect(process.env.DB_URL);
    console.log("✅ MongoDB connected successfully!");
}

main().catch(err => console.log(err));

server.listen(port, () => {
    console.log("🎯 =========================================");
    console.log("🎯 Book Store Server Started Successfully!");
    console.log("🎯 =========================================");
    console.log(`🌐 HTTP Server: http://localhost:${port}`);
    console.log(`🔌 WebSocket Server: ws://localhost:${port}/chat`);
    console.log(`📊 MongoDB: Connected`);
    console.log("🎯 =========================================");
    console.log(`📚 Available Routes:`);
    console.log(`   • API: http://localhost:${port}/api/books`);
    console.log(`   • WebSocket: ws://localhost:${port}/chat`);
    console.log(`   • Status: http://localhost:${port}/api/websocket-status`);
    console.log("🎯 =========================================");
});
