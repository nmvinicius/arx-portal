import { decodeProposal, encodeProposal, Proposal } from './proposal';

const sample: Proposal = {
  v: 1,
  partner: 'AX92K',
  partnerName: 'Maria',
  billing: 'monthly',
  lines: [{ id: 'odoo', name: 'Odoo', users: 5, total: 1900, setup: 6900 }],
  subtotal: 1900,
  platform: 1035,
  discount: 0,
  monthlyTotal: 2935,
  grandTotal: 2935,
  setupTotal: 6900,
  configHash: 'abc123def456',
  createdAt: '2026-10-19T12:00:00.000Z',
};

describe('proposal payload', () => {
  it('codifica em base64url e decodifica sem perder dados', () => {
    const payload = encodeProposal(sample);
    expect(payload).not.toContain('+');
    expect(payload).not.toContain('/');
    expect(payload).not.toContain('=');
    expect(decodeProposal(payload)).toEqual(sample);
  });

  it('retorna null para payload inválido', () => {
    expect(decodeProposal('não-é-base64')).toBeNull();
    expect(decodeProposal('')).toBeNull();
  });
});
