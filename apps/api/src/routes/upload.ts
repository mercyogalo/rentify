import { Router, Response } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { getStorage } from '../config/firebase';
import { env } from '../config/env';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.post(
  '/',
  authenticate,
  upload.single('image'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No image provided' });
        return;
      }

      const bucket = getStorage().bucket(env.firebase.storageBucket || undefined);
      if (!env.firebase.storageBucket) {
        const placeholder = `https://picsum.photos/seed/${Date.now()}/800/600`;
        res.json({ url: placeholder });
        return;
      }

      const filename = `listings/${req.auth!.userId}/${uuidv4()}-${req.file.originalname}`;
      const file = bucket.file(filename);
      await file.save(req.file.buffer, {
        metadata: { contentType: req.file.mimetype },
      });
      await file.makePublic();
      const url = `https://storage.googleapis.com/${bucket.name}/${filename}`;
      res.json({ url });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Upload failed' });
    }
  }
);

export default router;
