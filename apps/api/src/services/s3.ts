import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
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

export async function uploadToS3(
  key: string,
  body: Buffer,
  contentType: string
): Promise<string> {
  if (!isS3Configured()) {
    throw new Error('S3 is not configured');
  }

  await getClient().send(
    new PutObjectCommand({
      Bucket: env.aws.bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );

  if (env.aws.publicUrlBase) {
    return `${env.aws.publicUrlBase.replace(/\/$/, '')}/${key}`;
  }

  const region = env.aws.region;
  if (region === 'us-east-1') {
    return `https://${env.aws.bucket}.s3.amazonaws.com/${key}`;
  }
  return `https://${env.aws.bucket}.s3.${region}.amazonaws.com/${key}`;
}
