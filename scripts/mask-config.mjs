/**
 * Mascara o `config.json` publicado e gera o fingerprint de integridade.
 *
 * - Reescreve `config.json` no diretório de build cifrado com AES-256-GCM
 *   (`arx2:iv.tag.data`), usando a chave de `src/app/shared/config/key.ts`.
 * - Grava `config.meta.json` com o sha256 da forma canônica do config.
 * - Remove `config.schema.json` do build (só serve ao editor local).
 */
import { createCipheriv, createHash, randomBytes } from 'node:crypto';
import { readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(root, 'public', 'config.json');
const keyFile = join(root, 'src', 'app', 'shared', 'config', 'key.ts');
const browserDir = join(root, 'dist', 'arx-portal', 'browser');

const [raw, keySource] = await Promise.all([
  readFile(source, 'utf8'),
  readFile(keyFile, 'utf8'),
]);

const keyMatch = keySource.match(/CONFIG_KEY\s*=\s*'([0-9a-fA-F]+)'/);
if (!keyMatch) {
  throw new Error('[mask-config] Chave CONFIG_KEY não encontrada em key.ts');
}
const key = Buffer.from(keyMatch[1], 'hex');

const config = JSON.parse(raw);
const canonical = JSON.stringify(config);
const hash = createHash('sha256').update(canonical, 'utf8').digest('hex');

const iv = randomBytes(12);
const cipher = createCipheriv('aes-256-gcm', key, iv);
const encrypted = Buffer.concat([cipher.update(raw, 'utf8'), cipher.final()]);
const tag = cipher.getAuthTag();
const masked = `arx2:${iv.toString('base64')}.${tag.toString('base64')}.${encrypted.toString('base64')}`;

await writeFile(join(browserDir, 'config.json'), masked);
await writeFile(
  join(browserDir, 'config.meta.json'),
  JSON.stringify({ hash, builtAt: new Date().toISOString() }, null, 2),
);
await rm(join(browserDir, 'config.schema.json'), { force: true });

console.log(`[mask-config] fingerprint ${hash}`);
