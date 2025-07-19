import { WebSocketServer } from 'ws';
import crypto from 'crypto';

export class ChatService {
  constructor(server) {
    this.wss = new WebSocketServer({ server });
    this.connections = new Map();
    this.chatRooms = new Map();
    
    this.setupWebSocket();
  }

  setupWebSocket() {
    this.wss.on('connection', (ws, req) => {
      const userId = this.getUserIdFromRequest(req);
      
      ws.on('message', async (data) => {
        const message = JSON.parse(data);
        await this.handleMessage(userId, message);
      });

      ws.on('close', () => {
        this.connections.delete(userId);
      });

      this.connections.set(userId, ws);
    });
  }

  async handleMessage(senderId, message) {
    switch (message.type) {
      case 'send_message':
        await this.sendMessage(senderId, message);
        break;
      case 'typing':
        await this.broadcastTyping(senderId, message.roomId);
        break;
      case 'read_receipt':
        await this.markAsRead(message.messageId, senderId);
        break;
    }
  }

  async sendMessage(senderId, message) {
    // Encrypt message for E2E encryption
    const encryptedContent = this.encryptMessage(message.content);
    
    const chatMessage = {
      id: crypto.randomUUID(),
      roomId: message.roomId,
      senderId,
      content: encryptedContent,
      timestamp: new Date(),
      type: message.messageType || 'text'
    };

    // Store message in database
    await this.storeMessage(chatMessage);

    // Send to recipient(s)
    const recipients = await this.getRoomParticipants(message.roomId);
    recipients.forEach(recipientId => {
      const ws = this.connections.get(recipientId);
      if (ws) {
        ws.send(JSON.stringify({
          type: 'new_message',
          message: chatMessage
        }));
      }
    });
  }

  encryptMessage(content) {
    // Implement E2E encryption
    const algorithm = 'aes-256-gcm';
    const key = crypto.scryptSync(process.env.ENCRYPTION_KEY, 'salt', 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    
    let encrypted = cipher.update(content, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: cipher.getAuthTag().toString('hex')
    };
  }
}