import { PutObjectCommand, S3Client, S3ServiceException } from '@aws-sdk/client-s3';
import { env } from '../config/env';

let client: S3Client | null = null;

function getClient(): S3Client {
  if (!client) {
    client = new S3Client({
      region: env.aws.region,
      credentials: {
        accessKeyId: env.aws.accessKeyId,
        secretAccessKey: env.aws.secretAccessKey,
      },
    });
  }
  return client;
}

export function isS3Configured(): boolean {
  return Boolean(env.aws.accessKeyId && env.aws.secretAccessKey && env.aws.bucket);
}

/** Public URL for an object key in the configured bucket. */
export function getPublicObjectUrl(key: string): string {
  if (env.aws.publicUrlBase) {
    return `${env.aws.publicUrlBase.replace(/\/$/, '')}/${key}`;
  }

  const { bucket, region } = env.aws;
  if (region === 'us-east-1') {
    return `https://${bucket}.s3.amazonaws.com/${key}`;
  }
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

export async function uploadToS3(
  key: string,
  body: Buffer,
  contentType: string
): Promise<string> {
  if (!isS3Configured()) {
    throw new Error('S3 is not configured');
  }

  if (!body?.length) {
    throw new Error('Empty image file');
  }

  try {
    await getClient().send(
      new PutObjectCommand({
        Bucket: env.aws.bucket,
        Key: key,
        Body: body,
        ContentType: contentType || 'image/jpeg',
      })
    );
  } catch (err) {
    if (err instanceof S3ServiceException) {
      throw new Error(`S3 upload failed (${err.name}): ${err.message}`);
    }
    throw err;
  }

  return getPublicObjectUrl(key);
}
