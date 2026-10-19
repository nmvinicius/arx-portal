import { AppConfig } from './config';

/** Converte um ArrayBuffer em hexadecimal. */
function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

/** SHA-256 (hex) do texto, codificado em UTF-8. */
export async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return toHex(digest);
}

/** Forma canônica do config: JSON compacto, na ordem original das chaves. */
export function canonicalConfig(config: AppConfig): string {
  return JSON.stringify(config);
}
