import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { readMessages, writeMessage, ensureMessagesDir } from '../src/git/messages.js';

test('Message caching optimization', async (t) => {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'git-messenger-test-'));

  // Create identity
  const identity = { name: 'Test', email: 'test@example.com' };

  // Write a message
  const id1 = await writeMessage(tmpDir, identity, 'Hello 1');

  // Spy on fs.readFile
  const originalReadFile = fs.readFile;
  let readFileCallCount = 0;

  // @ts-ignore
  fs.readFile = async (...args) => {
    readFileCallCount++;
    // @ts-ignore
    return originalReadFile(...args);
  };

  try {
    // First read, should call fs.readFile once
    const msgs1 = await readMessages(tmpDir);
    assert.strictEqual(msgs1.length, 1);
    assert.strictEqual(msgs1[0].id, id1);
    assert.strictEqual(readFileCallCount, 1);

    // Second read, should NOT call fs.readFile because it's cached
    const msgs2 = await readMessages(tmpDir);
    assert.strictEqual(msgs2.length, 1);
    assert.strictEqual(readFileCallCount, 1, 'readFile should not be called again');

    // Write a second message
    const id2 = await writeMessage(tmpDir, identity, 'Hello 2');

    // Third read, should call fs.readFile only for the new message
    const msgs3 = await readMessages(tmpDir);
    assert.strictEqual(msgs3.length, 2);
    assert.strictEqual(readFileCallCount, 2, 'readFile should be called only for the new file');

    // Test cache eviction by manually deleting a message
    const messagesDir = await ensureMessagesDir(tmpDir);
    const files = await fs.readdir(messagesDir);
    const fileToDelete = files.find((f) => f.includes(id1));
    if (fileToDelete) {
      await fs.unlink(path.join(messagesDir, fileToDelete));
    }

    const msgs4 = await readMessages(tmpDir);
    assert.strictEqual(msgs4.length, 1, 'Should only have 1 message left');
    assert.strictEqual(msgs4[0].id, id2);
    assert.strictEqual(readFileCallCount, 2, 'No new files, readFile count should not increase');
  } finally {
    // Restore fs.readFile
    fs.readFile = originalReadFile;
    await fs.rm(tmpDir, { recursive: true, force: true });
  }
});
