import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: parseInt(process.env.PORT || '4000', 10),
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  },
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    region: process.env.AWS_REGION || 'eu-north-1',
    bucket: process.env.AWS_S3_BUCKET || process.env.AWS_BUCKET_NAME || '',
    publicUrlBase: process.env.AWS_S3_PUBLIC_URL_BASE || '',
  },
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  mobileScheme: process.env.MOBILE_SCHEME || 'rentify',
};
