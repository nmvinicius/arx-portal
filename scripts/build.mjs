/**
 * Build do portal: `ng build` + máscara/fingerprint do config.json.
 *
 * O Angular copia `public/` para o build sem pós-processamento, então este
 * wrapper executa o `ng build` e, em seguida, mascara o config. Assim
 * `pnpm build` já gera o config mascarado sem passo manual.
 */
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
// `pnpm build -- --flag` repassa um `--` literal em algumas versões; filtra.
const args = process.argv.slice(2).filter((arg) => arg !== '--');

// Injeta a chave AES vinda do secret CONFIG_KEY (se definida) antes do build.
await import('./inject-key.mjs');

const result = spawnSync('pnpm', ['exec', 'ng', 'build', ...args], {
  cwd: root,
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

await import('./mask-config.mjs');
