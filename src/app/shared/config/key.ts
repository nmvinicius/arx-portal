/**
 * Chave de ofuscação do config.json (AES-256-GCM, 32 bytes em hex).
 *
 * ⚠️ Valor placeholder para desenvolvimento local. Em CI, o
 * `scripts/inject-key.mjs` substitui este arquivo pela chave vinda do secret
 * `CONFIG_KEY` — ela não fica versionada no repositório.
 *
 * Em dev o `config.json` é servido em texto puro, então a chave não é usada;
 * o placeholder só serve para o `ng build` compilar sem o secret.
 */
export const CONFIG_KEY = '0000000000000000000000000000000000000000000000000000000000000000';
