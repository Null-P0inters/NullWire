import { Client, Databases, ID, Query } from "node-appwrite";

const endpoint = process.env.APPWRITE_ENDPOINT ?? process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.APPWRITE_PROJECT_ID ?? process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;
const databaseId = process.env.APPWRITE_DATABASE_ID ?? process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const deviceCollectionId =
  process.env.APPWRITE_DEVICE_COLLECTION_ID ?? process.env.NEXT_PUBLIC_APPWRITE_DEVICE_COLLECTION_ID;

if (!endpoint) {
  throw new Error("Missing APPWRITE_ENDPOINT or NEXT_PUBLIC_APPWRITE_ENDPOINT environment variable.");
}

if (!projectId) {
  throw new Error("Missing APPWRITE_PROJECT_ID or NEXT_PUBLIC_APPWRITE_PROJECT_ID environment variable.");
}

if (!apiKey) {
  throw new Error("Missing APPWRITE_API_KEY environment variable.");
}

if (!databaseId) {
  throw new Error("Missing APPWRITE_DATABASE_ID or NEXT_PUBLIC_APPWRITE_DATABASE_ID environment variable.");
}

if (!deviceCollectionId) {
  throw new Error("Missing APPWRITE_DEVICE_COLLECTION_ID or NEXT_PUBLIC_APPWRITE_DEVICE_COLLECTION_ID environment variable.");
}

const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);

export const serverDatabases = new Databases(client);
export const serverConfig = {
  databaseId,
  deviceCollectionId,
} as const;

export { ID, Query };
