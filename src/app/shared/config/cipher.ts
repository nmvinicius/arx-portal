import { CONFIG_KEY } from './key';

function base64ToBytes(base64: string): Uint8Array<ArrayBuffer> {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function hexToBytes(hex: string): Uint8Array<ArrayBuffer> {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

/**
 * Decifra o conteúdo `arx2:iv.tag.data` produzido pelo build.
 * Formato: base64(iv de 12 bytes) + base64(auth tag de 16 bytes) + base64(dados).
 */
export async function decryptConfig(payload: string): Promise<string> {
  const [ivBase64, tagBase64, dataBase64] = payload.slice(5).split('.');
  const key = await crypto.subtle.importKey(
    'raw',
    hexToBytes(CONFIG_KEY),
    { name: 'AES-GCM' },
    false,
    ['decrypt'],
  );

  const iv = base64ToBytes(ivBase64);
  const data = base64ToBytes(dataBase64);
  const tag = base64ToBytes(tagBase64);

  // WebCrypto espera o ciphertext com o auth tag concatenado ao final.
  const combined = new Uint8Array(data.length + tag.length);
  combined.set(data, 0);
  combined.set(tag, data.length);

  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, combined);
  return new TextDecoder().decode(plain);
}
