import React, { useState, useEffect, useRef } from 'react';
import { useBookSwapWS } from '../../context/BookSwapWSContext';

const BookSwapPage = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [userName, setUserName] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [userId, setUserId] = useState('');
  const { isConnected, connectionStatus, sendMessage, addMessageHandler } = useBookSwapWS();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const handleWebSocketMessage = (message) => {
      console.log('🔄 Processing:', message.type);
      
      switch (message.type) {
        case 'WELCOME':
          setUserId(message.userId);
          console.log('🎉 Connected with ID:', message.userId);
          break;
          
        case 'MESSAGE_HISTORY':
          setMessages(message.messages || []);
          break;
          
        case 'NEW_MESSAGE':
          setMessages(prev => [...prev, message.message]);
          break;
          
        case 'USER_JOINED':
          const joinMessage = {
            id: 'system-' + Date.now(),
            type: 'system',
            text: `👋 ${message.userName} joined the chat!`,
            timestamp: message.timestamp
          };
          setMessages(prev => [...prev, joinMessage]);
          break;
          
        case 'USER_LEFT':
          const leaveMessage = {
            id: 'system-' + Date.now(),
            type: 'system', 
            text: '👋 A user left the chat',
            timestamp: message.timestamp
          };
          setMessages(prev => [...prev, leaveMessage]);
          break;
      }
    };

    const cleanup = addMessageHandler(handleWebSocketMessage);
    return cleanup;
  }, [addMessageHandler]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleJoin = (e) => {
    e.preventDefault();
    if (userName.trim()) {
      setIsJoined(true);

      if (isConnected) {
        sendMessage({
          type: 'JOIN_CHAT',
          data: {
            userName: userName
          }
        });
      }
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !userName) return;

    const success = sendMessage({
      type: 'SEND_MESSAGE',
      data: {
        userName: userName,
        text: newMessage
      }
    });

    if (success) {
      setNewMessage('');
    } else {
      alert('Failed to send message. Please check connection.');
    }
  };

  const addSampleMessages = () => {
    const sampleMessages = [
      {
        id: '1',
        type: 'chat',
        userName: 'BookLover42',
        text: 'Just finished reading "The Midnight Library" - highly recommend!',
        timestamp: new Date().toISOString(),
        userColor: '#3B82F6'
      },
      {
        id: '2',
        type: 'chat', 
        userName: 'PageTurner',
        text: 'Looking for classic literature recommendations. Any Jane Austen fans here?',
        timestamp: new Date().toISOString(),
        userColor: '#EF4444'
      }
    ];
    setMessages(sampleMessages);
  };

  const clearChat = () => {
    setMessages([]);
  };

  if (!isJoined) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
            📚 Book Lovers Community
          </h1>
          <p className="text-gray-600 text-center mb-6">
            {connectionStatus === 'connected' ? 'Live chat ready!' : 'Connecting to chat...'}
          </p>
          
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choose Your Display Name
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your display name"
                required
                maxLength={20}
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 font-medium"
            >
              Join Community Chat
            </button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Real-time Features:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>✅ Live messaging across all browsers</li>
              <li>✅ See when users join/leave</li>
              <li>✅ Message history for new users</li>
              <li>✅ Different colors for each user</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">📚 Book Lovers Community</h1>
          <p className="text-gray-600">
            Welcome, {userName}! {isConnected ? 'Live chat connected' : 'Connecting...'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 ${
            isConnected ? 'text-green-600' : 'text-yellow-600'
          }`}>
            <div className={`w-3 h-3 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-yellow-500'
            }`}></div>
            <span className="text-sm">
              {isConnected ? 'Live' : connectionStatus}
            </span>
          </div>
          <button 
            onClick={addSampleMessages}
            className="bg-gray-600 text-white px-4 py-2 rounded text-sm hover:bg-gray-700"
          >
            Add Samples
          </button>
          <button 
            onClick={clearChat}
            className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Connection Status */}
      {!isConnected && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          <p>⏳ Connecting to live chat... Messages will sync when connected.</p>
        </div>
      )}

      {/* Chat Container */}
      <div className="bg-white rounded-lg shadow-lg border">
        {/* Messages Area */}
        <div className="h-96 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <div className="text-4xl mb-2">💬</div>
              <p>No messages yet. Start the conversation!</p>
              <p className="text-sm mt-2">Open in another browser to test real-time chat</p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={`flex ${
                message.type === 'system' ? 'justify-center' : 'justify-start'
              }`}>
                <div className={`max-w-xs lg:max-w-md ${
                  message.type === 'system' 
                    ? 'bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm' 
                    : 'bg-blue-50 rounded-lg p-3'
                }`}>
                  {message.type === 'system' ? (
                    <span className="text-xs">{message.text}</span>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 mb-1">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: message.userColor }}
                        ></div>
                        <span 
                          className="font-semibold"
                          style={{ color: message.userColor }}
                        >
                          {message.userName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-gray-800">{message.text}</p>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="border-t p-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Share your thoughts, book recommendations, or swap requests..."
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              maxLength={500}
              disabled={!isConnected}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || !isConnected}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </form>
          <p className="text-xs text-gray-500 mt-2">
            {isConnected ? '💬 Live chat enabled - messages will appear in all browsers' : '⏳ Connecting to live chat...'}
          </p>
        </div>
      </div>

      {/* Testing Instructions */}
      <div className="mt-6 grid md:grid-cols-3 gap-4">
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-2">💬 Discussion Ideas</h3>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• What are you currently reading?</li>
            <li>• Book recommendations</li>
            <li>• Author discussions</li>
            <li>• Reading challenges</li>
          </ul>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="font-semibold text-purple-800 mb-2">🔄 Swap Requests</h3>
          <ul className="text-sm text-purple-700 space-y-1">
            <li>• Books you want to trade</li>
            <li>• Books you're looking for</li>
            <li>• Meetup locations</li>
            <li>• Condition preferences</li>
          </ul>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg">
          <h3 className="font-semibold text-orange-800 mb-2">🎯 Community Rules</h3>
          <ul className="text-sm text-orange-700 space-y-1">
            <li>• Be kind and respectful</li>
            <li>• Keep it book-related</li>
            <li>• No spam or self-promotion</li>
            <li>• Arrange swaps safely</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BookSwapPage;