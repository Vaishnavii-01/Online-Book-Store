const WebSocket = require('ws');

class BookCommunityWS {
  constructor(server) {
    console.log('📚 Starting Book Community Chat Server...');
    
    this.wss = new WebSocket.Server({ 
      server: server,
      path: '/chat'
    });
    
    this.clients = new Map(); 
    this.messages = []; 
    
    this.setupConnection();
    console.log('✅ Book Community Chat Server ready on /chat');
  }

  setupConnection() {
    this.wss.on('connection', (ws, req) => {
      console.log('🔌 New user connecting to community chat...');
      
      // Generate a unique user ID for this connection
      const userId = 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
      
      console.log(`✅ User ${userId} connected`);
      
      // Store the connection
      this.clients.set(userId, ws);
      
      // Send connection confirmation with user ID
      this.sendToUser(userId, {
        type: 'WELCOME',
        userId: userId,
        message: 'Connected to book community chat!',
        messageCount: this.messages.length
      });

      // Send message history (last 50 messages)
      if (this.messages.length > 0) {
        this.sendToUser(userId, {
          type: 'MESSAGE_HISTORY',
          messages: this.messages.slice(-50)
        });
      }

      // Handle messages from client
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleMessage(userId, message);
        } catch (error) {
          console.error('❌ Error parsing message:', error);
          this.sendToUser(userId, {
            type: 'ERROR',
            message: 'Invalid message format'
          });
        }
      });

      // Handle connection close
      ws.on('close', () => {
        console.log(`❌ User ${userId} disconnected`);
        this.clients.delete(userId);
        
        // Notify others that user left
        this.broadcast({
          type: 'USER_LEFT',
          userId: userId,
          timestamp: new Date().toISOString()
        }, userId);
      });

      // Handle errors
      ws.on('error', (error) => {
        console.error(`❌ WebSocket error for ${userId}:`, error);
      });

    });

    this.wss.on('error', (error) => {
      console.error('💥 WebSocket server error:', error);
    });
  }

  handleMessage(userId, message) {
    console.log(`📨 Message from ${userId}: ${message.type}`);
    
    switch (message.type) {
      case 'JOIN_CHAT':
        this.handleUserJoin(userId, message.data);
        break;
        
      case 'SEND_MESSAGE':
        this.handleChatMessage(userId, message.data);
        break;
        
      default:
        console.log('⚠️ Unknown message type:', message.type);
    }
  }

  handleUserJoin(userId, userData) {
    // Notify all users that someone joined
    this.broadcast({
      type: 'USER_JOINED',
      userId: userId,
      userName: userData.userName,
      timestamp: new Date().toISOString()
    });
  }

  handleChatMessage(userId, messageData) {
    const chatMessage = {
      id: 'msg-' + Date.now() + '-' + userId,
      type: 'chat',
      userId: userId,
      userName: messageData.userName,
      text: messageData.text,
      timestamp: new Date().toISOString(),
      userColor: this.generateUserColor(userId)
    };

    // Add to message history (keep only last 100)
    this.messages.push(chatMessage);
    if (this.messages.length > 100) {
      this.messages = this.messages.slice(-100);
    }

    console.log(`💬 ${messageData.userName}: ${messageData.text}`);

    // Broadcast to ALL connected users
    this.broadcast({
      type: 'NEW_MESSAGE',
      message: chatMessage
    });
  }

  generateUserColor(userId) {
    const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];
    const index = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  }

  sendToUser(userId, message) {
    const client = this.clients.get(userId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  }

  broadcast(message, excludeUserId = null) {
    let sentCount = 0;
    this.clients.forEach((client, userId) => {
      if (client.readyState === WebSocket.OPEN && userId !== excludeUserId) {
        client.send(JSON.stringify(message));
        sentCount++;
      }
    });
    console.log(`📢 Broadcasted to ${sentCount} users`);
  }
}

module.exports = BookCommunityWS;