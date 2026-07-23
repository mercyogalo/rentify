import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifyToken } from '../utils/jwt';
import { Message } from '../models/Message';
import { Conversation } from '../models/Conversation';

export function initSocket(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token as string;
    if (!token) return next(new Error('Unauthorized'));
    try {
      const payload = verifyToken(token);
      (socket as Socket & { userId: string }).userId = payload.userId;
      next();
    } catch {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = (socket as Socket & { userId?: string }).userId;
    if (!userId) return;
    socket.on('join_conversation', (conversationId: string) => {
      socket.join(`conversation:${conversationId}`);
    });

    socket.on('leave_conversation', (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
    });

    socket.on('typing', ({ conversationId }: { conversationId: string }) => {
      socket.to(`conversation:${conversationId}`).emit('typing', {
        conversationId,
        userId,
      });
    });

    socket.on(
      'send_message',
      async ({
        conversationId,
        text,
      }: {
        conversationId: string;
        text: string;
      }) => {
        try {
          const message = await Message.create({
            conversationId,
            senderId: userId,
            text,
          });

          await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: text,
            lastMessageAt: new Date(),
          });

          const payload = {
            id: message._id.toString(),
            conversationId,
            senderId: userId,
            text,
            createdAt: message.createdAt.toISOString(),
            read: false,
          };

          io.to(`conversation:${conversationId}`).emit('new_message', payload);
        } catch (err) {
          console.error('Socket message error:', err);
        }
      }
    );
  });

  return io;
}
