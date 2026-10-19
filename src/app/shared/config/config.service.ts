import { computed, Service, signal } from '@angular/core';
import { AppConfig, DEFAULT_CONFIG, SalesAgent } from './config';
import { decryptConfig } from './cipher';
import { canonicalConfig, sha256Hex } from './hash';

/**
 * Carrega e expõe a configuração estática do portal.
 *
 * Em produção o `config.json` é servido cifrado com AES-256-GCM (`arx2:...`) e
 * vem acompanhado de `config.meta.json`, que contém o fingerprint (sha256) do
 * arquivo canônico. O fingerprint permite detectar se o JSON foi alterado no
 * navegador antes de assinar uma proposta.
 */
export type ConfigStatus = 'loading' | 'verified' | 'tampered' | 'unknown';

@Service()
export class ConfigService {
  /** Configuração efetiva (padrões até o JSON ser carregado). */
  readonly config = signal<AppConfig>(DEFAULT_CONFIG);

  /** Fingerprint (sha256) do config canônico publicado. */
  readonly configFingerprint = signal<string | null>(null);

  /** Integridade do config em memória em relação ao fingerprint. */
  readonly configStatus = signal<ConfigStatus>('loading');

  readonly features = computed(() => this.config().features);
  readonly pricing = computed(() => this.config().pricing);
  readonly products = computed(() => this.pricing().products);
  readonly platformFee = computed(() => this.pricing().platformFee);
  readonly discountTiers = computed(() => this.pricing().discountTiers);
  readonly sales = computed(() => this.config().sales);

  /**
   * Busca o `config.json` (mascarado em produção) e o fingerprint publicado.
   * A URL relativa é resolvida contra o `<base href>`, então funciona em
   * subdiretórios (ex.: GitHub Pages com `--base-href`).
   */
  async load(): Promise<void> {
    try {
      const [configText, metaText] = await Promise.all([
        this.fetchText('config.json'),
        this.fetchText('config.meta.json'),
      ]);

      if (configText === null) {
        throw new Error('config.json não encontrado');
      }

      const next = await this.unmask(configText);
      this.config.set(next);

      const localHash = await sha256Hex(canonicalConfig(next));
      const meta = metaText ? (JSON.parse(metaText) as { hash?: string }) : null;
      const publishedHash = meta?.hash ?? null;

      this.configFingerprint.set(publishedHash ?? localHash);
      this.configStatus.set(
        publishedHash ? (localHash === publishedHash ? 'verified' : 'tampered') : 'unknown',
      );
    } catch (error) {
      // Mantém os padrões; o portal segue funcional sem o JSON.
      console.warn('[config] Falha ao carregar config.json — usando valores padrão.', error);
      this.configStatus.set('unknown');
    }
  }

  /**
   * Verifica se o config em memória ainda corresponde ao fingerprint
   * publicado (detecta edição do JSON no navegador antes de assinar).
   */
  async verifyIntegrity(): Promise<boolean> {
    const fingerprint = this.configFingerprint();
    if (!fingerprint) {
      return true;
    }
    const current = await sha256Hex(canonicalConfig(this.config()));
    return current === fingerprint;
  }

  private async fetchText(url: string): Promise<string | null> {
    try {
      const response = await fetch(url, { cache: 'no-store' });
      return response.ok ? await response.text() : null;
    } catch {
      return null;
    }
  }

  private async unmask(text: string): Promise<AppConfig> {
    const trimmed = text.trim();
    if (trimmed.startsWith('arx2:')) {
      return JSON.parse(await decryptConfig(trimmed)) as AppConfig;
    }
    return JSON.parse(trimmed) as AppConfig;
  }

  /**
   * Resolve um agente de vendas pelo código do link (`/v/:code`).
   * Retorna `undefined` quando as vendas estão desativadas ou o código não existe.
   */
  agentFor(code: string | null | undefined): SalesAgent | undefined {
    if (!code || !this.sales().enabled) {
      return undefined;
    }
    const normalized = code.trim().toUpperCase();
    return this.sales().agents.find((agent) => agent.code.trim().toUpperCase() === normalized);
  }
}
