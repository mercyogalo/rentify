import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { getAuth } from '../config/firebase';
import { db, now } from '../services/firestore';
import type { FirestoreMessage } from '../types/firestore';

export function initSocket(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token as string;
    if (!token) return next(new Error('Unauthorized'));
    getAuth()
      .verifyIdToken(token)
      .then((payload) => {
        (socket as Socket & { userId: string }).userId = payload.uid;
        next();
      })
      .catch(() => next(new Error('Unauthorized')));
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
      socket.to(`conversation:${conversationId}`).emit('typing', { conversationId, userId });
    });

    socket.on('send_message', async ({ conversationId, text }: { conversationId: string; text: string }) => {
      try {
        const timestamp = now();
        const msg: FirestoreMessage = {
          conversationId,
          senderId: userId,
          text,
          read: false,
          createdAt: timestamp,
        };
        const ref = await db().collection('messages').add(msg);
        await db().collection('conversations').doc(conversationId).update({
          lastMessage: text,
          lastMessageAt: timestamp,
          updatedAt: timestamp,
        });

        io.to(`conversation:${conversationId}`).emit('new_message', {
          id: ref.id,
          conversationId,
          senderId: userId,
          text,
          createdAt: timestamp.toDate().toISOString(),
          read: false,
        });
      } catch (err) {
        console.error('Socket message error:', err);
      }
    });
  });

  return io;
}
