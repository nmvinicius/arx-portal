import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { RevealDirective } from '../../shared/animations/reveal.directive';
import { ConfigService } from '../../shared/config/config.service';
import { ProductPricing, SimulatorPreset } from '../../shared/config/config';
import { encodeProposal, Proposal } from '../../shared/proposal/proposal';
import { computeSetupSchedule } from './setup-math';
import { SetupPlanner } from './setup-planner';

type BillingCycle = 'monthly' | 'yearly';

const brl = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
});

/**
 * Simulador de valores: o usuário escolhe as ferramentas e informa
 * quantas pessoas vão usar cada uma. O preço estimado é calculado na hora.
 */
@Component({
  imports: [NgIcon, RevealDirective, RouterLink, SetupPlanner],
  selector: 'app-simulacao',
  templateUrl: './simulacao.html',
})
export class Simulacao {
  protected readonly year = new Date().getFullYear();

  private readonly config = inject(ConfigService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  /** Feature flags e catálogo de produtos, carregados do config.json. */
  protected readonly features = this.config.features;
  protected readonly products = this.config.products;
  protected readonly presets = this.config.presets;
  protected readonly configStatus = this.config.configStatus;
  protected readonly integrityError = signal(false);

  protected readonly billing = signal<BillingCycle>('monthly');

  /** Parceiro de vendas resolvido pelo código da rota (`/v/:code`). */
  protected readonly agent = computed(() =>
    this.config.agentFor(this.route.snapshot.paramMap.get('code')),
  );

  protected readonly commissionRate = computed(() => this.agent()?.commission ?? 0);

  /**
   * Fator aplicado aos preços exibidos: quando há parceiro, os valores já
   * incluem a participação dele (1.1 = +10%), sem expor a comissão.
   */
  protected readonly priceFactor = computed(() => 1 + this.commissionRate());

  /** id do produto -> quantidade de usuários (ausente/0 = não selecionado). */
  private readonly selections = signal<Record<string, number>>({});

  /** Perfil cuja pré-seleção bate com a seleção atual (para destacar). */
  protected readonly activePresetId = computed(() => {
    const current = this.selections();
    return this.presets().find((preset) => this.sameSelection(preset.selection, current))?.id ?? null;
  });

  protected readonly selectedItems = computed(() => {
    const selections = this.selections();
    const factor = this.priceFactor();
    return this.products()
      .filter((product) => (selections[product.id] ?? 0) > 0)
      .map((product) => {
        const users = selections[product.id];
        return {
          product,
          users,
          total: Math.round(product.base * factor) + Math.round(product.perUser * factor) * users,
          setup: Math.round(product.setup * factor),
        };
      });
  });

  protected readonly totalUsers = computed(() =>
    this.selectedItems().reduce((sum, item) => sum + item.users, 0),
  );

  protected readonly subtotal = computed(() =>
    this.selectedItems().reduce((sum, item) => sum + item.total, 0),
  );

  /** Taxa da plataforma, cobrada apenas quando há ao menos um produto. */
  protected readonly platformMonthly = computed(() =>
    this.selectedItems().length
      ? Math.round(this.config.platformFee() * this.priceFactor())
      : 0,
  );

  /** Setup (implantação), cobrado uma única vez. */
  protected readonly setupTotal = computed(() =>
    this.selectedItems().reduce((sum, item) => sum + item.setup, 0),
  );

  /** Desconto por volume, conforme o total de usuários. */
  protected readonly discountRate = computed(() => {
    const users = this.totalUsers();
    const tiers = [...this.config.discountTiers()].sort((a, b) => b.minUsers - a.minUsers);
    return tiers.find((tier) => users >= tier.minUsers)?.rate ?? 0;
  });

  protected readonly discountPercent = computed(() => Math.round(this.discountRate() * 100));

  protected readonly discount = computed(() =>
    Math.round((this.subtotal() + this.platformMonthly()) * this.discountRate()),
  );

  protected readonly monthlyTotal = computed(
    () => this.subtotal() + this.platformMonthly() - this.discount(),
  );

  protected readonly yearlyTotal = computed(() => this.monthlyTotal() * 10);

  protected readonly grandTotal = computed(() =>
    this.billing() === 'yearly' ? this.yearlyTotal() : this.monthlyTotal(),
  );

  /** Estado do parcelamento do setup (duas vias com o gráfico). */
  protected readonly setupMonths = signal(6);
  protected readonly setupTilt = signal(0);

  protected readonly setupSchedule = computed(() =>
    computeSetupSchedule(this.setupTotal(), this.setupMonths(), this.setupTilt()),
  );

  /**
   * Assina a proposta atual: verifica a integridade do config e navega para
   * `/proposta` com o payload codificado (âncora do fingerprint).
   */
  protected async signProposal(): Promise<void> {
    const items = this.selectedItems();
    if (!items.length) {
      return;
    }

    const intact = await this.config.verifyIntegrity();
    if (!intact) {
      this.integrityError.set(true);
      return;
    }

    const agent = this.agent();
    const proposal: Proposal = {
      v: 1,
      partner: agent?.code,
      partnerName: agent?.name,
      billing: this.billing(),
      lines: items.map((item) => ({
        id: item.product.id,
        name: item.product.name,
        users: item.users,
        total: item.total,
        setup: item.setup,
      })),
      subtotal: this.subtotal(),
      platform: this.platformMonthly(),
      discount: this.discount(),
      monthlyTotal: this.monthlyTotal(),
      grandTotal: this.grandTotal(),
      setupTotal: this.setupTotal(),
      configHash: this.config.configFingerprint() ?? '',
      createdAt: new Date().toISOString(),
    };

    await this.router.navigate(['/proposta'], { queryParams: { d: encodeProposal(proposal) } });
  }

  protected readonly format = (value: number) => brl.format(value);

  protected baseFor(product: ProductPricing): number {
    return Math.round(product.base * this.priceFactor());
  }

  protected perUserFor(product: ProductPricing): number {
    return Math.round(product.perUser * this.priceFactor());
  }

  protected setupFor(product: ProductPricing): number {
    return Math.round(product.setup * this.priceFactor());
  }

  protected usersFor(id: string): number {
    return this.selections()[id] ?? 0;
  }

  protected isSelected(id: string): boolean {
    return this.usersFor(id) > 0;
  }

  protected cardClasses(id: string): string {
    const base = 'flex flex-col rounded-lg border p-5 transition-colors';
    return this.isSelected(id)
      ? `${base} border-signal-500/60 bg-white dark:border-signal-500/60 dark:bg-zinc-900/60`
      : `${base} border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/60`;
  }

  protected billingClasses(cycle: BillingCycle): string {
    const base =
      'rounded px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal-500 focus-visible:ring-offset-2';
    return this.billing() === cycle
      ? `${base} bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900`
      : `${base} text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100`;
  }

  protected add(id: string): void {
    this.setUsers(id, 5);
  }

  protected remove(id: string): void {
    this.selections.update((current) => {
      const { [id]: _removed, ...rest } = current;
      return rest;
    });
  }

  protected adjust(id: string, delta: number): void {
    const next = this.usersFor(id) + delta;
    if (next < 1) {
      this.remove(id);
      return;
    }
    this.setUsers(id, next);
  }

  protected onUsersInput(id: string, event: Event): void {
    const value = (event.target as HTMLInputElement).valueAsNumber;
    if (Number.isNaN(value)) {
      return;
    }
    this.setUsers(id, value);
  }

  protected onUsersBlur(id: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (Number.isNaN(input.valueAsNumber)) {
      input.value = String(this.usersFor(id));
    }
  }

  protected setBilling(cycle: BillingCycle): void {
    this.billing.set(cycle);
  }

  /** Aplica a pré-seleção de um perfil. */
  protected applyPreset(preset: SimulatorPreset): void {
    this.selections.set({ ...preset.selection });
  }

  protected presetClasses(presetId: string): string {
    const base =
      'flex flex-col items-start gap-2 rounded-lg border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal-500 focus-visible:ring-offset-2';
    return this.activePresetId() === presetId
      ? `${base} border-signal-500/60 bg-white dark:border-signal-500/60 dark:bg-zinc-900/60`
      : `${base} border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-zinc-700`;
  }

  private sameSelection(a: Record<string, number>, b: Record<string, number>): boolean {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const key of keys) {
      if ((a[key] ?? 0) !== (b[key] ?? 0)) {
        return false;
      }
    }
    return true;
  }

  private setUsers(id: string, value: number): void {
    const users = Math.max(1, Math.min(1000, Math.round(value)));
    this.selections.update((current) => ({ ...current, [id]: users }));
  }
}
