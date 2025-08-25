import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";

const region = process.env.AWS_REGION!;
const videosBucket = process.env.S3_BUCKET_VIDEOS!;

export const s3Client = new S3Client({ region });

export async function createPresignedUpload(mime: string, ext: string, userId: string) {
  const key = `raw/${userId}/${crypto.randomUUID()}.${ext.replace(/\./g, '')}`;
  const cmd = new PutObjectCommand({
    Bucket: videosBucket,
    Key: key,
    ContentType: mime,
  });
  const url = await getSignedUrl(s3Client, cmd, { expiresIn: 900 });
  return { url, key, bucket: videosBucket, region };
}
