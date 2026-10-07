import { S3Client, ListObjectsV2Command, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

const client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME;

async function emptyBucket() {
  console.log(`Starting cleanup for bucket: ${BUCKET_NAME}...`);
  let totalDeleted = 0;

  try {
    while (true) {
      const listCommand = new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        MaxKeys: 1000,
      });

      const listResponse = await client.send(listCommand);
      
      if (!listResponse.Contents || listResponse.Contents.length === 0) {
        break;
      }

      const objectsToDelete = listResponse.Contents.map((obj) => ({ Key: obj.Key }));
      const deleteCommand = new DeleteObjectsCommand({
        Bucket: BUCKET_NAME,
        Delete: {
          Objects: objectsToDelete,
        },
      });

      await client.send(deleteCommand);
      totalDeleted += objectsToDelete.length;
      console.log(`Deleted ${objectsToDelete.length} objects (Total: ${totalDeleted})...`);
    }

    console.log(`Successfully deleted ${totalDeleted} objects. Bucket is now empty.`);
  } catch (error) {
    console.error("Error cleaning up bucket:", error);
  }
}

emptyBucket();
