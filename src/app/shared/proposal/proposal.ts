/**
 * Payload de proposta assinada.
 *
 * O payload é codificado em base64url e viaja na URL (`/proposta?d=...`).
 * O campo `configHash` ancora a proposta ao config canônico: se o JSON tiver
 * sido alterado no navegador, o hash não bate com o fingerprint publicado e a
 * integridade não é confirmada.
 */

export type ProposalBilling = 'monthly' | 'yearly';

export interface ProposalLine {
  id: string;
  name: string;
  users: number;
  /** Assinatura mensal do item, já com a participação do parceiro. */
  total: number;
  /** Setup do item, já com a participação do parceiro. */
  setup: number;
}

export interface Proposal {
  /** Versão do formato do payload. */
  v: 1;
  /** Código do parceiro (quando o link de vendas foi usado). */
  partner?: string;
  partnerName?: string;
  billing: ProposalBilling;
  lines: ProposalLine[];
  subtotal: number;
  platform: number;
  discount: number;
  monthlyTotal: number;
  grandTotal: number;
  setupTotal: number;
  /** Fingerprint (sha256) do config.json usado para gerar os valores. */
  configHash: string;
  createdAt: string;
}

/** Codifica o payload em base64url para uso na URL (`?d=`). */
export function encodeProposal(proposal: Proposal): string {
  const bytes = new TextEncoder().encode(JSON.stringify(proposal));
  let binary = '';
  bytes.forEach((byte) => (binary += String.fromCharCode(byte)));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Decodifica e valida um payload; retorna `null` se for inválido. */
export function decodeProposal(payload: string): Proposal | null {
  try {
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const proposal = JSON.parse(new TextDecoder().decode(bytes)) as Proposal;
    if (proposal.v !== 1 || !Array.isArray(proposal.lines)) {
      return null;
    }
    return proposal;
  } catch {
    return null;
  }
}
