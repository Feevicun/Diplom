import { WebSocketServer, WebSocket } from 'ws';
import jwt from 'jsonwebtoken';
import pool from './db.js';
const JWT_SECRET = "super_secret_key_change_this";
// ---------- Core ----------
const clients = new Map();
class ChatWebSocketServer {
    constructor(server) {
        this.wss = new WebSocketServer({ server, path: '/ws' });
        this.initialize();
    }
    initialize() {
        this.wss.on('connection', (ws, request) => {
            console.log('Нове WebSocket з\'єднання');
            const url = new URL(request.url, `http://${request.headers.host}`);
            const token = url.searchParams.get('token');
            if (token) {
                void this.authenticateClient(ws, token);
            }
            else {
                this.sendError(ws, 'Токен аутентифікації не надано');
                ws.close();
                return;
            }
            ws.on('message', (data) => {
                try {
                    const message = JSON.parse(data.toString());
                    void this.handleMessage(ws, message);
                }
                catch (error) {
                    console.error('Помилка парсингу повідомлення:', error);
                    this.sendError(ws, 'Некоректний формат повідомлення');
                }
            });
            ws.on('close', () => {
                if (ws.userId)
                    void this.handleUserDisconnect(ws.userId);
            });
            ws.on('error', (error) => {
                console.error('WebSocket помилка:', error);
            });
        });
        console.log('WebSocket сервер запущено');
    }
    async authenticateClient(ws, token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            const userResult = await pool.query(`SELECT id, name, email, role, avatar_url 
         FROM users WHERE id = $1`, [decoded.userId]);
            if (userResult.rows.length === 0) {
                this.sendError(ws, 'Користувача не знайдено');
                ws.close();
                return;
            }
            const user = userResult.rows[0];
            ws.userId = user.id.toString();
            ws.userEmail = user.email;
            ws.userRole = user.role;
            ws.userName = user.name;
            ws.isAuthenticated = true;
            if (ws.userId) {
                clients.set(ws.userId, ws);
                await this.broadcastUserStatus(ws.userId, true);
            }
            else {
                this.sendError(ws, 'Неможливо зберегти користувача без ID');
                ws.close();
                return;
            }
            await pool.query(`UPDATE users SET is_online = true, last_seen = NOW() WHERE id = $1`, [user.id]);
            ws.send(JSON.stringify({
                type: 'auth',
                payload: { success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } }
            }));
            await this.sendChatList(ws);
            await this.broadcastUserStatus(ws.userId, true);
            console.log(`Користувач ${user.name} аутентифікований через WebSocket`);
        }
        catch (error) {
            console.error('Помилка аутентифікації:', error);
            this.sendError(ws, 'Недійсний токен аутентифікації');
            ws.close();
        }
    }
    async handleMessage(ws, message) {
        if (!ws.isAuthenticated || !ws.userId) {
            this.sendError(ws, 'Клієнт не аутентифікований');
            return;
        }
        switch (message.type) {
            case 'message':
                await this.handleChatMessage(ws, message.payload);
                break;
            case 'typing':
                await this.handleTyping(ws, message.payload);
                break;
            case 'read_receipt':
                await this.handleReadReceipt(ws, message.payload);
                break;
            case 'chat_list':
                await this.sendChatList(ws);
                break;
            default:
                this.sendError(ws, 'Невідомий тип повідомлення');
        }
    }
    async handleChatMessage(ws, messageData) {
        if (!ws.userId) {
            this.sendError(ws, 'Не вдалося ідентифікувати користувача');
            return;
        }
        try {
            const { chatId, content, type, replyTo, attachment } = messageData;
            const hasAccess = await this.checkChatAccess(ws.userId, chatId);
            if (!hasAccess) {
                this.sendError(ws, 'Немає доступу до цього чату');
                return;
            }
            const messageResult = await pool.query(`INSERT INTO chat_messages 
         (chat_id, sender_id, content, message_type, reply_to, attachment_data, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())
         RETURNING id, created_at`, [chatId, ws.userId, content, type, replyTo, attachment ? JSON.stringify(attachment) : null]);
            const dbMessage = messageResult.rows[0];
            const chatMessage = {
                id: dbMessage.id.toString(),
                sender: ws.userId,
                name: ws.userName || 'Unknown',
                content,
                timestamp: new Date(dbMessage.created_at).toLocaleTimeString('uk-UA', {
                    hour: '2-digit', minute: '2-digit'
                }),
                type: type || 'text',
                chatId,
                status: 'sent',
                replyTo,
                attachment
            };
            await pool.query(`UPDATE chats SET last_message = $1, last_message_at = NOW() WHERE id = $2`, [content, chatId]);
            await this.broadcastToChat(chatId, {
                type: 'message',
                payload: chatMessage
            }, ws.userId);
            await this.updateChatListForParticipants(chatId);
        }
        catch (error) {
            console.error('Помилка обробки повідомлення:', error);
            this.sendError(ws, 'Помилка відправки повідомлення');
        }
    }
    async handleTyping(ws, typingData) {
        if (!ws.userId)
            return;
        const { chatId, isTyping } = typingData;
        const hasAccess = await this.checkChatAccess(ws.userId, chatId);
        if (!hasAccess)
            return;
        await this.broadcastToChat(chatId, {
            type: 'typing',
            payload: {
                chatId,
                userId: ws.userId,
                userName: ws.userName,
                isTyping
            }
        }, ws.userId);
    }
    async handleReadReceipt(ws, receiptData) {
        if (!ws.userId)
            return;
        const { messageId, chatId } = receiptData;
        try {
            await pool.query(`INSERT INTO message_read_receipts (message_id, user_id, read_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (message_id, user_id)
         DO UPDATE SET read_at = NOW()`, [messageId, ws.userId]);
            await this.broadcastToChat(chatId, {
                type: 'read_receipt',
                payload: {
                    messageId,
                    userId: ws.userId,
                    userName: ws.userName,
                    chatId
                }
            }, ws.userId);
        }
        catch (error) {
            console.error('Помилка обробки підтвердження прочитання:', error);
        }
    }
    async sendChatList(ws) {
        if (!ws.userId)
            return;
        try {
            const chats = await this.getUserChats(ws.userId);
            ws.send(JSON.stringify({
                type: 'chat_list',
                payload: { chats }
            }));
        }
        catch (error) {
            console.error('Помилка отримання списку чатів:', error);
            this.sendError(ws, 'Помилка завантаження списку чатів');
        }
    }
    async getUserChats(userId) {
        const result = await pool.query(`SELECT 
        c.id,
        c.name,
        c.type,
        c.avatar_url,
        c.description,
        c.last_message,
        c.last_message_at,
        c.created_at,
        cm.unread_count,
        u.is_online,
        u.last_seen
       FROM chat_members cm
       JOIN chats c ON cm.chat_id = c.id
       LEFT JOIN users u ON c.type != 'group' AND c.id = (
         SELECT CASE 
           WHEN cm1.user_id = $1 THEN cm2.user_id 
           ELSE cm1.user_id 
         END
         FROM chat_members cm1
         JOIN chat_members cm2 ON cm1.chat_id = cm2.chat_id
         WHERE cm1.chat_id = c.id AND cm1.user_id != cm2.user_id
         LIMIT 1
       )
       WHERE cm.user_id = $1
       ORDER BY c.last_message_at DESC NULLS LAST, c.created_at DESC`, [userId]);
        return Promise.all(result.rows.map(async (row) => {
            let members = [];
            if (row.type === 'group') {
                const membersResult = await pool.query(`SELECT u.id, u.name, u.email, u.role as type, u.avatar_url, u.is_online
           FROM chat_members cm
           JOIN users u ON cm.user_id = u.id
           WHERE cm.chat_id = $1`, [row.id]);
                members = membersResult.rows.map((memberRow) => ({
                    id: memberRow.id.toString(),
                    name: memberRow.name,
                    avatar: memberRow.name.split(' ').map((n) => n[0]).join('').toUpperCase(),
                    avatarUrl: memberRow.avatar_url ?? undefined,
                    email: memberRow.email,
                    type: memberRow.role === 'teacher' ? 'supervisor' : 'student',
                    isOnline: memberRow.is_online
                }));
            }
            return {
                id: row.id.toString(),
                name: row.name,
                avatar: row.name.split(' ').map((n) => n[0]).join('').toUpperCase(),
                avatarUrl: row.avatar_url ?? undefined,
                type: row.type,
                isOnline: row.is_online || false,
                lastSeen: row.last_seen ? new Date(row.last_seen).toLocaleString('uk-UA') : undefined,
                unreadCount: row.unread_count || 0,
                lastMessage: row.last_message,
                members: row.type === 'group' ? members : undefined,
                createdAt: row.created_at ? new Date(row.created_at).toISOString() : undefined,
                description: row.description
            };
        }));
    }
    async checkChatAccess(userId, chatId) {
        try {
            const result = await pool.query('SELECT 1 FROM chat_members WHERE chat_id = $1 AND user_id = $2', [chatId, userId]);
            return result.rows.length > 0;
        }
        catch (error) {
            console.error('Помилка перевірки доступу до чату:', error);
            return false;
        }
    }
    async broadcastToChat(chatId, message, excludeUserId) {
        try {
            const membersResult = await pool.query('SELECT user_id FROM chat_members WHERE chat_id = $1', [chatId]);
            const memberIds = membersResult.rows.map((row) => row.user_id.toString());
            memberIds.forEach(userId => {
                if (userId === excludeUserId)
                    return;
                const client = clients.get(userId);
                if (client && client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(message));
                }
            });
        }
        catch (error) {
            console.error('Помилка трансляції повідомлення:', error);
        }
    }
    async updateChatListForParticipants(chatId) {
        try {
            const membersResult = await pool.query('SELECT user_id FROM chat_members WHERE chat_id = $1', [chatId]);
            const memberIds = membersResult.rows.map((row) => row.user_id.toString());
            for (const userId of memberIds) {
                const client = clients.get(userId);
                if (client && client.readyState === WebSocket.OPEN) {
                    await this.sendChatList(client);
                }
            }
        }
        catch (error) {
            console.error('Помилка оновлення списку чатів:', error);
        }
    }
    async broadcastUserStatus(userId, isOnline) {
        try {
            const chatsResult = await pool.query(`SELECT DISTINCT cm2.chat_id 
         FROM chat_members cm1
         JOIN chat_members cm2 ON cm1.chat_id = cm2.chat_id
         WHERE cm1.user_id = $1 AND cm2.user_id != $1`, [userId]);
            for (const row of chatsResult.rows) {
                await this.broadcastToChat(row.chat_id.toString(), {
                    type: 'user_status',
                    payload: {
                        userId,
                        isOnline,
                        lastSeen: isOnline ? undefined : new Date().toLocaleString('uk-UA')
                    }
                }, userId);
            }
        }
        catch (error) {
            console.error('Помилка трансляції статусу:', error);
        }
    }
    async handleUserDisconnect(userId) {
        try {
            clients.delete(userId);
            await pool.query(`UPDATE users SET is_online = false, last_seen = NOW() WHERE id = $1`, [userId]);
            await this.broadcastUserStatus(userId, false);
            console.log(`Користувач ${userId} відключився`);
        }
        catch (error) {
            console.error('Помилка обробки відключення:', error);
        }
    }
    sendError(ws, message) {
        ws.send(JSON.stringify({
            type: 'error',
            payload: { message }
        }));
    }
    async createChat(creatorId, participantIds, name, type = 'private') {
        try {
            if (type === 'private' && participantIds.length === 1) {
                const existingChat = await pool.query(`SELECT c.id FROM chats c
           JOIN chat_members cm1 ON c.id = cm1.chat_id
           JOIN chat_members cm2 ON c.id = cm2.chat_id
           WHERE c.type = 'private' 
           AND cm1.user_id = $1 AND cm2.user_id = $2`, [creatorId, participantIds[0]]);
                if (existingChat.rows.length > 0) {
                    return existingChat.rows[0].id.toString();
                }
            }
            const chatResult = await pool.query(`INSERT INTO chats (name, type, created_by, created_at)
         VALUES ($1, $2, $3, NOW())
         RETURNING id`, [name, type, creatorId]);
            const chatId = chatResult.rows[0].id.toString();
            const allParticipants = [creatorId, ...participantIds];
            for (const participantId of allParticipants) {
                await pool.query('INSERT INTO chat_members (chat_id, user_id, joined_at) VALUES ($1, $2, NOW())', [chatId, participantId]);
            }
            return chatId;
        }
        catch (error) {
            console.error('Помилка створення чату:', error);
            throw error;
        }
    }
}
export default ChatWebSocketServer;
