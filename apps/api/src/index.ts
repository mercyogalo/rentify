import express from 'express';
import cors from 'cors';
import http from 'http';
import { connectDB } from './config/db';
import { env } from './config/env';
import { initSocket } from './socket';
import authRoutes from './routes/auth';
import listingRoutes from './routes/listings';
import conversationRoutes from './routes/conversations';
import userRoutes from './routes/users';
import adminRoutes from './routes/admin';
import uploadRoutes from './routes/upload';

const app = express();
const server = http.createServer(app);

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', backend: 'firebase' });
});

app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

initSocket(server);

async function start() {
  try {
    await connectDB();
    server.listen(env.port, () => {
      console.log(`Rentify API (Firebase) running on http://localhost:${env.port}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
