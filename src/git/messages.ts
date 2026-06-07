import fs from 'node:fs/promises';
import path from 'node:path';
import type { Message, Identity } from '../types.js';
import { randomId } from '../util/id.js';
import { getFilenameSafeTimestamp } from '../util/time.js';

export async function ensureMessagesDir(cwd: string): Promise<string> {
  const messagesDir = path.join(cwd, 'messages');
  await fs.mkdir(messagesDir, { recursive: true });
  return messagesDir;
}

const cacheByCwd = new Map<string, Map<string, Message>>();

export async function readMessages(cwd: string): Promise<Message[]> {
  const messagesDir = await ensureMessagesDir(cwd);
  let files: string[];
  try {
    files = await fs.readdir(messagesDir);
  } catch {
    return [];
  }

  const messageFiles = files.filter((f) => f.endsWith('.json')).sort();
  const messages: Message[] = [];

  let cache = cacheByCwd.get(cwd);
  if (!cache) {
    cache = new Map<string, Message>();
    cacheByCwd.set(cwd, cache);
  }

  const currentFiles = new Set(messageFiles);
  for (const cachedFile of cache.keys()) {
    if (!currentFiles.has(cachedFile)) {
      cache.delete(cachedFile);
    }
  }

  for (const file of messageFiles) {
    if (cache.has(file)) {
      messages.push(cache.get(file)!);
      continue;
    }

    try {
      const content = await fs.readFile(path.join(messagesDir, file), 'utf-8');
      const msg: Message = JSON.parse(content);
      cache.set(file, msg);
      messages.push(msg);
    } catch {
      // skip invalid/corrupted files
    }
  }

  return messages;
}

export async function writeMessage(cwd: string, identity: Identity, body: string): Promise<string> {
  const messagesDir = await ensureMessagesDir(cwd);
  const date = new Date();
  const ts = date.toISOString();
  const id = randomId();
  const safeTs = getFilenameSafeTimestamp(date);
  const filename = `${safeTs}__${id}.json`;

  const msg: Message = {
    v: 1,
    id,
    author: identity.email,
    name: identity.name,
    ts,
    body,
  };

  await fs.writeFile(path.join(messagesDir, filename), JSON.stringify(msg, null, 2), 'utf-8');
  return id;
}
