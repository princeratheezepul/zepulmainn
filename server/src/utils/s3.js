import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv";
dotenv.config();

// Read once at module load. See S3_PROCTORING_SETUP.md for how to obtain these.
const region = process.env.AWS_REGION;
const bucket = process.env.AWS_S3_BUCKET;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

// True only when every value needed to talk to S3 is present. Controllers check this
// so a deploy without AWS credentials degrades gracefully instead of throwing.
export const isS3Configured = () =>
  Boolean(region && bucket && accessKeyId && secretAccessKey);

// Lazily construct the client so importing this module never throws when creds are absent.
let _client = null;
const getClient = () => {
  if (!_client) {
    _client = new S3Client({
      region,
      credentials: { accessKeyId, secretAccessKey },
    });
  }
  return _client;
};

// Upload a raw Buffer (from multer memoryStorage) to a private object. Returns the key.
export const uploadBufferToS3 = async (buffer, key, contentType) => {
  if (!isS3Configured()) throw new Error("S3 is not configured");
  await getClient().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType || "image/jpeg",
    })
  );
  return key;
};

// Mint a short-lived presigned GET URL for a private object. Returns null (never throws)
// when S3 is unconfigured or the key is empty, so a single failure can't break a listing.
export const getSignedImageUrl = async (key, expiresIn = 43200) => {
  if (!isS3Configured() || !key) return null;
  return getSignedUrl(
    getClient(),
    new GetObjectCommand({ Bucket: bucket, Key: key }),
    { expiresIn }
  );
};

export default { isS3Configured, uploadBufferToS3, getSignedImageUrl };
