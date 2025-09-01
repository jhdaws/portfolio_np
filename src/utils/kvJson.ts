// JSON persistence uses Redis via REDIS_URL (Vercel KV-compatible)
import { createClient, type RedisClientType } from "redis";

let client: RedisClientType | null = null;
let connecting: Promise<void> | null = null;

async function getClient(): Promise<RedisClientType> {
  if (client) return client;
  const url = process.env.REDIS_URL;
  if (!url) throw new Error("REDIS_URL is not set");
  client = createClient({ url });
  client.on("error", (err) => {
    console.error("Redis Client Error", err);
  });
  connecting = client.connect().then(() => {});
  await connecting;
  return client;
}

/**
 * Read JSON from KV/Redis by key.
 */
export async function readJson<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const c = await getClient();
    const str = await c.get(key);
    if (!str) return defaultValue;
    try {
      return JSON.parse(str) as T;
    } catch {
      return defaultValue;
    }
  } catch (e) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`KV readJson fallback for ${key}:`, e);
    }
    return defaultValue;
  }
}

/**
 * Write JSON to KV/Redis at the given key.
 */
export async function writeJson<T>(key: string, data: T): Promise<void> {
  const c = await getClient();
  await c.set(key, JSON.stringify(data));
}
