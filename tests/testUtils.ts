import path from 'node:path';
import fs from 'node:fs/promises';
import { decode } from 'ico-endec';

export const ROOT_DIR = path.resolve(import.meta.dirname, '..');
export const FIXTURE_DIR = path.resolve(ROOT_DIR, 'tests', '__fixtures__');

export async function createTempDir () {
  const tempBase = path.join(ROOT_DIR, 'tmp', `test-${Date.now()}`);
  await fs.mkdir(tempBase, { recursive: true });
  return tempBase;
}

export async function getIcoImages (icoPath: string) {
  const icoBuffer = await fs.readFile(icoPath);
  return decode(icoBuffer);
}

export async function fileExists (path: string) {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}