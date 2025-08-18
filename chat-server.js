const WebSocket = require('ws');
const http = require('http');

// Create HTTP server
const server = http.createServer();
const wss = new WebSocket.Server({ server });

// Store chat rooms and messages
const chatRooms = new Map();
const connectedDevices = new Map();

console.log('🚀 Starting Chat Server...');

wss.on('connection', (ws, req) => {
  const deviceId = `device-${Date.now()}`;
  console.log(`📱 New device connected: ${deviceId}`);
  
  connectedDevices.set(deviceId, ws);

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      handleMessage(deviceId, data);
    } catch (error) {
      console.log('Error parsing message:', error);
    }
  });

  ws.on('close', () => {
    console.log(`📱 Device disconnected: ${deviceId}`);
    connectedDevices.delete(deviceId);
  });

  ws.on('error', (error) => {
    console.log(`❌ WebSocket error for ${deviceId}:`, error);
  });
});

function handleMessage(deviceId, data) {
  switch (data.type) {
    case 'device_info':
      console.log(`📱 Device ${data.deviceId} identified as ${data.deviceName}`);
      break;
      
    case 'send_message':
      handleSendMessage(deviceId, data.roomId, data.message);
      break;
      
    case 'delete_message':
      handleDeleteMessage(deviceId, data.roomId, data.messageId);
      break;
      
    case 'clear_chat':
      handleClearChat(deviceId, data.roomId);
      break;
      
    default:
      console.log('Unknown message type:', data.type);
  }
}

function handleSendMessage(deviceId, roomId, message) {
  console.log(`💬 Message in ${roomId}: ${message.text}`);
  
  // Initialize room if it doesn't exist
  if (!chatRooms.has(roomId)) {
    chatRooms.set(roomId, []);
  }
  
  // Add message to room
  chatRooms.get(roomId).push(message);
  
  // Broadcast message to all connected devices
  broadcastToAll({
    type: 'message',
    roomId,
    message
  });
}

function handleDeleteMessage(deviceId, roomId, messageId) {
  console.log(`🗑️ Deleting message ${messageId} from ${roomId}`);
  
  const room = chatRooms.get(roomId);
  if (room) {
    const index = room.findIndex(msg => msg.id === messageId);
    if (index !== -1) {
      room.splice(index, 1);
      
      // Broadcast deletion to all devices
      broadcastToAll({
        type: 'message_deleted',
        roomId,
        messageId
      });
    }
  }
}

function handleClearChat(deviceId, roomId) {
  console.log(`🧹 Clearing chat in ${roomId}`);
  
  chatRooms.set(roomId, []);
  
  // Broadcast clear to all devices
  broadcastToAll({
    type: 'chat_cleared',
    roomId
  });
}

function broadcastToAll(data) {
  const message = JSON.stringify(data);
  connectedDevices.forEach((ws, deviceId) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  });
}

// Start server
const PORT = 3001;
server.listen(PORT, () => {
  console.log(`✅ Chat server running on port ${PORT}`);
  console.log(`🌐 WebSocket URL: ws://localhost:${PORT}`);
  console.log(`📱 Connect your phones to this server for real-time chat!`);
});

// Handle server shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down chat server...');
  wss.close();
  server.close(() => {
    console.log('✅ Chat server stopped');
    process.exit(0);
  });
});

