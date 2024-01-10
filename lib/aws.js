import { S3Client } from "@aws-sdk/client-s3";

// When no region or credentials are provided, the SDK will use the
// region and credentials from the local AWS config.
const client = new S3Client({ 
  region: "ap-southeast-1",
  credentials: {
    accessKeyId: "AKIAQ3EGTDJHQ5PONRGP",
    secretAccessKey: "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"
  }
});

export default client
