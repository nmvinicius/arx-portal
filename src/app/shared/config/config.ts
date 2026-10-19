/**
 * Tipos e valores padrão da configuração estática do portal.
 *
 * O `public/config.json` é a fonte de verdade em produção e sobrescreve os
 * valores padrão carregados pelo `ConfigService`. Os padrões abaixo servem de
 * fallback (quando o JSON não carrega) e de base para os testes.
 */

export interface FeatureFlags {
  /** Habilita a opção de cobrança anual no simulador. */
  yearlyBilling: boolean;
  /** Habilita a seção de parcelamento do setup (dividir e como pagar). */
  setupInstallments: boolean;
}

export interface DiscountTier {
  /** Número mínimo de usuários para ativar o desconto. */
  minUsers: number;
  /** Taxa de desconto (0.1 = 10%). */
  rate: number;
}

export interface ProductPricing {
  id: string;
  name: string;
  tag: string;
  desc: string;
  icon: string;
  /** Valor fixo mensal (infra + operação). */
  base: number;
  /** Valor mensal por usuário. */
  perUser: number;
  /** Setup/implantación cobrado uma única vez. */
  setup: number;
  /** Marca o produto como beta (badge + destaque no simulador). */
  beta: boolean;
}

export interface PricingConfig {
  currency: string;
  platformFee: number;
  discountTiers: DiscountTier[];
  products: ProductPricing[];
}

export interface SalesAgent {
  /** Código curto usado no link compartilhável (ex.: "AX92K"). */
  code: string;
  /** Nome do parceiro exibido na tela de vendas. */
  name: string;
  /** Participação somada ao preço (0.1 = 10%). */
  commission: number;
}

export interface SalesConfig {
  /** Habilita a tela de vendas por código de parceiro. */
  enabled: boolean;
  agents: SalesAgent[];
}

export interface AppConfig {
  features: FeatureFlags;
  pricing: PricingConfig;
  sales: SalesConfig;
}

export const DEFAULT_CONFIG: AppConfig = {
  features: {
    yearlyBilling: true,
    setupInstallments: true,
  },
  pricing: {
    currency: 'BRL',
    platformFee: 900,
    discountTiers: [
      { minUsers: 250, rate: 0.2 },
      { minUsers: 100, rate: 0.15 },
      { minUsers: 50, rate: 0.1 },
      { minUsers: 25, rate: 0.05 },
    ],
    products: [
      { id: 'odoo', name: 'Odoo', tag: 'ERP', desc: 'Vendas, estoque, CRM e financeiro integrados.', icon: 'lucideBoxes', base: 900, perUser: 150, setup: 6000, beta: false },
      { id: 'documenso', name: 'Documenso', tag: 'Assinatura digital', desc: 'Contratos assinados em minutos, com validade jurídica.', icon: 'lucideFileCheck', base: 200, perUser: 30, setup: 1500, beta: false },
      { id: 'stalwart', name: 'Stalwart Mail', tag: 'E-mail', desc: 'E-mail profissional, seguro e sob o seu controle.', icon: 'lucideHardDrive', base: 120, perUser: 15, setup: 800, beta: false },
      { id: 'n8n', name: 'n8n', tag: 'Automação', desc: 'Automatize o repetitivo e conecte a operação.', icon: 'lucideWorkflow', base: 300, perUser: 60, setup: 2500, beta: false },
      { id: 'nextcloud', name: 'Nextcloud', tag: 'Colaboração', desc: 'Arquivos, agenda e contatos sincronizados.', icon: 'lucideCloud', base: 200, perUser: 25, setup: 1500, beta: false },
      { id: 'paperless', name: 'Paperless-ngx', tag: 'Documentos', desc: 'Digitalize e encontre documentos em segundos.', icon: 'lucideScanText', base: 120, perUser: 15, setup: 800, beta: false },
      { id: 'zammad', name: 'Zammad', tag: 'Suporte', desc: 'Central de suporte organizada e multicanal.', icon: 'lucideHeadset', base: 250, perUser: 40, setup: 2000, beta: false },
      { id: 'metabase', name: 'Metabase', tag: 'BI', desc: 'Decisões baseadas em dados, com dashboards.', icon: 'lucideBarChart3', base: 200, perUser: 30, setup: 1500, beta: false },
      { id: 'outline', name: 'Outline', tag: 'Wiki', desc: 'Documente processos e mantenha o time alinhado.', icon: 'lucideBookOpen', base: 120, perUser: 12, setup: 800, beta: false },
      { id: 'calcom', name: 'Cal.com', tag: 'Agendamento', desc: 'Reuniões agendadas sem troca de e-mails.', icon: 'lucideCalendarClock', base: 120, perUser: 20, setup: 800, beta: true },
      { id: 'penpot', name: 'Penpot', tag: 'Design', desc: 'Crie e prototipe interfaces em equipe.', icon: 'lucideMousePointerClick', base: 250, perUser: 30, setup: 1500, beta: true },
    ],
  },
  sales: {
    enabled: false,
    agents: [],
  },
};
