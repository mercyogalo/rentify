import { Router, Response } from 'express';
import { db, getUserById, now } from '../services/firestore';
import { serializeConversation, serializeMessage } from '../utils/serializers';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import type { FirestoreConversation, FirestoreListing, FirestoreMessage } from '../types/firestore';

const router = Router();

async function enrichConversation(id: string, data: FirestoreConversation) {
  const [user, agent, listingSnap] = await Promise.all([
    getUserById(data.userId),
    getUserById(data.agentId),
    data.listingId ? db().collection('listings').doc(data.listingId).get() : Promise.resolve(null),
  ]);
  let listing;
  if (listingSnap?.exists) {
    const l = listingSnap.data() as FirestoreListing;
    listing = { id: listingSnap.id, title: l.title, images: l.images, price: l.price, status: l.status };
  }
  return serializeConversation(id, data, {
    user: user ? { id: user.id, name: user.name, avatar: user.avatar } : undefined,
    agent: agent ? { id: agent.id, name: agent.name, avatar: agent.avatar, agencyName: agent.agencyName } : undefined,
    listing,
  });
}

router.get('/', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const field = req.auth!.role === 'agent' ? 'agentId' : 'userId';
    const snap = await db()
      .collection('conversations')
      .where(field, '==', req.auth!.userId)
      .orderBy('lastMessageAt', 'desc')
      .get();
    const conversations = await Promise.all(
      snap.docs.map((d) => enrichConversation(d.id, d.data() as FirestoreConversation))
    );
    res.json({ conversations });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

router.post('/', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { agentId, listingId } = req.body;
    if (req.auth!.role !== 'user') {
      res.status(403).json({ error: 'Only users can initiate conversations' });
      return;
    }

    const existingSnap = await db()
      .collection('conversations')
      .where('userId', '==', req.auth!.userId)
      .where('agentId', '==', agentId)
      .get();

    const existing = existingSnap.docs.find((d) => {
      const data = d.data() as FirestoreConversation;
      return listingId ? data.listingId === listingId : !data.listingId;
    });

    if (existing) {
      res.status(201).json({
        conversation: await enrichConversation(existing.id, existing.data() as FirestoreConversation),
      });
      return;
    }

    const timestamp = now();
    const data: FirestoreConversation = {
      userId: req.auth!.userId,
      agentId,
      listingId,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    const ref = await db().collection('conversations').add(data);
    const created = await ref.get();

    res.status(201).json({
      conversation: await enrichConversation(created.id, created.data() as FirestoreConversation),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

router.get('/:id/messages', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const convDoc = await db().collection('conversations').doc(req.params.id).get();
    if (!convDoc.exists) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }
    const conv = convDoc.data() as FirestoreConversation;
    const uid = req.auth!.userId;
    if (conv.userId !== uid && conv.agentId !== uid) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const snap = await db()
      .collection('messages')
      .where('conversationId', '==', req.params.id)
      .orderBy('createdAt', 'asc')
      .get();

    res.json({
      messages: snap.docs.map((d) => serializeMessage(d.id, d.data() as FirestoreMessage)),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

router.post('/:id/messages', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { text } = req.body;
    const convRef = db().collection('conversations').doc(req.params.id);
    const convDoc = await convRef.get();
    if (!convDoc.exists) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }
    const conv = convDoc.data() as FirestoreConversation;
    const uid = req.auth!.userId;
    if (conv.userId !== uid && conv.agentId !== uid) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const timestamp = now();
    const msg: FirestoreMessage = {
      conversationId: req.params.id,
      senderId: uid,
      text,
      read: false,
      createdAt: timestamp,
    };
    const ref = await db().collection('messages').add(msg);
    await convRef.update({ lastMessage: text, lastMessageAt: timestamp, updatedAt: timestamp });

    res.status(201).json({ message: serializeMessage(ref.id, msg) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

export default router;
