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

/**
 * POST /api/upload
 * Uploads an image to AWS S3 under listings/{userId}/{uuid}.{ext}
 * Response: { url: string, key: string }
 */
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
        res.status(503).json({
          error:
            'AWS S3 is not configured. Set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_BUCKET_NAME, and AWS_REGION in apps/api/.env',
        });
        return;
      }

      const ext = req.file.originalname.split('.').pop()?.toLowerCase() || 'jpg';
      const key = `listings/${req.auth!.userId}/${uuidv4()}.${ext}`;
      const contentType = req.file.mimetype || 'image/jpeg';

      const url = await uploadToS3(key, req.file.buffer, contentType);

      res.json({ url, key });
    } catch (err) {
      console.error('Upload error:', err);
      const message = err instanceof Error ? err.message : 'Upload failed';
      res.status(500).json({ error: message });
    }
  }
);

export default router;
