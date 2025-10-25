import { Account, Client, Databases } from "appwrite";

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const deviceCollectionId = process.env.NEXT_PUBLIC_APPWRITE_DEVICE_COLLECTION_ID;

if (!endpoint) {
  throw new Error("Missing NEXT_PUBLIC_APPWRITE_ENDPOINT environment variable.");
}

if (!projectId) {
  throw new Error("Missing NEXT_PUBLIC_APPWRITE_PROJECT_ID environment variable.");
}

if (!databaseId) {
  throw new Error("Missing NEXT_PUBLIC_APPWRITE_DATABASE_ID environment variable.");
}

if (!deviceCollectionId) {
  throw new Error("Missing NEXT_PUBLIC_APPWRITE_DEVICE_COLLECTION_ID environment variable.");
}

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId);

export const account = new Account(client);
export const databases = new Databases(client);

export const config = {
  databaseId,
  deviceCollectionId,
} as const;
