import { Router, Response } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { uploadToS3, isS3Configured } from '../services/s3';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

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

      if (!isS3Configured()) {
        res.status(503).json({ error: 'S3 upload is not configured' });
        return;
      }

      const ext = req.file.originalname.split('.').pop() || 'jpg';
      const key = `listings/${req.auth!.userId}/${uuidv4()}.${ext}`;
      const url = await uploadToS3(key, req.file.buffer, req.file.mimetype);

      res.json({ url, key });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Upload failed' });
    }
  }
);

export default router;
