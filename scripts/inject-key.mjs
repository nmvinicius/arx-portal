/**
 * Injeta a chave AES no `key.ts` a partir do secret `CONFIG_KEY`.
 *
 * Em CI (GITHUB_ACTIONS=true) a chave é obrigatória: sem ela o build falha,
 * para nunca publicar o config cifrado com o placeholder.
 * Localmente, sem a variável, o placeholder de `key.ts` é mantido.
 */
import { writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const keyFile = join(root, 'src', 'app', 'shared', 'config', 'key.ts');

const key = process.env.CONFIG_KEY?.trim();

if (key) {
  if (!/^[0-9a-fA-F]{64}$/.test(key)) {
    throw new Error('[inject-key] CONFIG_KEY inválida: esperados 64 caracteres hex.');
  }

  const content = `/**
 * Chave de ofuscação do config.json (AES-256-GCM, 32 bytes em hex).
 *
 * Gerada a partir do secret \`CONFIG_KEY\` durante o build — não edite
 * manualmente e não versione a chave real.
 */
export const CONFIG_KEY = '${key}';
`;

  await writeFile(keyFile, content);
  console.log('[inject-key] Chave CONFIG_KEY injetada no key.ts');
} else if (process.env.CI || process.env.GITHUB_ACTIONS === 'true') {
  throw new Error('[inject-key] Secret CONFIG_KEY ausente no build de CI.');
} else {
  console.warn('[inject-key] CONFIG_KEY não definida — mantendo chave placeholder (build local).');
}
