const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 3001 });

const users = new Map();
const messages = [];

wss.on('connection', (ws) => {
  console.log('New client connected');

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      
      switch (message.type) {
        case 'user_join':
          users.set(ws, message.user);
          broadcastUsersList();
          // Send message history to new user
          ws.send(JSON.stringify({
            type: 'message_history',
            messages: messages.slice(-50) // Last 50 messages
          }));
          break;
          
        case 'message':
          const newMessage = {
            ...message.message,
            id: Date.now().toString(),
            timestamp: new Date().toLocaleTimeString('uk-UA', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })
          };
          
          messages.push(newMessage);
          broadcast({
            type: 'message',
            message: newMessage
          });
          break;
          
        case 'user_typing':
          broadcast({
            type: 'user_typing',
            userId: message.userId,
            userName: message.userName
          }, ws);
          break;
          
        case 'user_stop_typing':
          broadcast({
            type: 'user_stop_typing',
            userId: message.userId
          }, ws);
          break;
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });

  ws.on('close', () => {
    const user = users.get(ws);
    if (user) {
      users.delete(ws);
      broadcastUsersList();
      broadcast({
        type: 'user_leave',
        userId: user.id
      });
    }
    console.log('Client disconnected');
  });
});

function broadcast(message, excludeWs = null) {
  const data = JSON.stringify(message);
  wss.clients.forEach((client) => {
    if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

function broadcastUsersList() {
  const usersList = Array.from(users.values());
  broadcast({
    type: 'users_list',
    users: usersList
  });
}

console.log('WebSocket server running on port 3001');