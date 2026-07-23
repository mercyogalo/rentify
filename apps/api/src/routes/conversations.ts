import { Router, Response } from 'express';
import { Conversation } from '../models/Conversation';
import { Message } from '../models/Message';
import { Listing } from '../models/Listing';
import { User } from '../models/User';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

function serializeConversation(conv: InstanceType<typeof Conversation>) {
  const user = conv.populated('userId')
    ? (conv.userId as unknown as InstanceType<typeof User>)
    : null;
  const agent = conv.populated('agentId')
    ? (conv.agentId as unknown as InstanceType<typeof User>)
    : null;
  const listing = conv.populated('listingId')
    ? (conv.listingId as unknown as InstanceType<typeof Listing>)
    : null;

  return {
    id: conv._id.toString(),
    userId: conv.userId.toString(),
    agentId: conv.agentId.toString(),
    listingId: conv.listingId?.toString(),
    lastMessage: conv.lastMessage,
    lastMessageAt: conv.lastMessageAt?.toISOString(),
    user: user
      ? { id: user._id.toString(), name: user.name, avatar: user.avatar }
      : undefined,
    agent: agent
      ? {
          id: agent._id.toString(),
          name: agent.name,
          avatar: agent.avatar,
          agencyName: agent.agencyName,
        }
      : undefined,
    listing: listing
      ? {
          id: listing._id.toString(),
          title: listing.title,
          images: listing.images,
          price: listing.price,
          status: listing.status,
        }
      : undefined,
  };
}

router.get('/', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.auth!.userId;
    const query =
      req.auth!.role === 'agent'
        ? { agentId: userId }
        : { userId };

    const conversations = await Conversation.find(query)
      .populate('userId', 'name avatar')
      .populate('agentId', 'name avatar agencyName')
      .populate('listingId', 'title images price status')
      .sort({ lastMessageAt: -1 });

    res.json({ conversations: conversations.map(serializeConversation) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

router.post('/', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { agentId, listingId } = req.body;
    const userId = req.auth!.userId;

    if (req.auth!.role !== 'user') {
      res.status(403).json({ error: 'Only users can initiate conversations' });
      return;
    }

    let conversation = await Conversation.findOne({
      userId,
      agentId,
      listingId: listingId || { $exists: false },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        userId,
        agentId,
        listingId,
      });
    }

    const populated = await Conversation.findById(conversation._id)
      .populate('userId', 'name avatar')
      .populate('agentId', 'name avatar agencyName')
      .populate('listingId', 'title images price status');

    res.status(201).json({ conversation: serializeConversation(populated!) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

router.get(
  '/:id/messages',
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const conversation = await Conversation.findById(req.params.id);
      if (!conversation) {
        res.status(404).json({ error: 'Conversation not found' });
        return;
      }

      const userId = req.auth!.userId;
      const isParticipant =
        conversation.userId.toString() === userId ||
        conversation.agentId.toString() === userId;

      if (!isParticipant) {
        res.status(403).json({ error: 'Forbidden' });
        return;
      }

      const messages = await Message.find({
        conversationId: req.params.id,
      }).sort({ createdAt: 1 });

      res.json({
        messages: messages.map((m) => ({
          id: m._id.toString(),
          conversationId: m.conversationId.toString(),
          senderId: m.senderId.toString(),
          text: m.text,
          createdAt: m.createdAt.toISOString(),
          read: m.read,
        })),
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  }
);

router.post(
  '/:id/messages',
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { text } = req.body;
      const conversation = await Conversation.findById(req.params.id);
      if (!conversation) {
        res.status(404).json({ error: 'Conversation not found' });
        return;
      }

      const userId = req.auth!.userId;
      const isParticipant =
        conversation.userId.toString() === userId ||
        conversation.agentId.toString() === userId;

      if (!isParticipant) {
        res.status(403).json({ error: 'Forbidden' });
        return;
      }

      const message = await Message.create({
        conversationId: req.params.id,
        senderId: userId,
        text,
      });

      conversation.lastMessage = text;
      conversation.lastMessageAt = new Date();
      await conversation.save();

      res.status(201).json({
        message: {
          id: message._id.toString(),
          conversationId: message.conversationId.toString(),
          senderId: message.senderId.toString(),
          text: message.text,
          createdAt: message.createdAt.toISOString(),
          read: message.read,
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to send message' });
    }
  }
);

export default router;
