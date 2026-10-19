import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { ConfigService } from '../../shared/config/config.service';
import { decodeProposal, Proposal } from '../../shared/proposal/proposal';

const brl = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
});

/**
 * Página da proposta assinada: exibe o resumo e o fingerprint do config
 * usado, permitindo verificar se o `config.json` foi alterado no navegador.
 */
@Component({
  imports: [NgIcon, RouterLink],
  selector: 'app-proposta',
  templateUrl: './proposta.html',
})
export class Proposta {
  protected readonly year = new Date().getFullYear();

  private readonly route = inject(ActivatedRoute);
  private readonly config = inject(ConfigService);

  /** E-mail de destino das propostas (vindo do config). */
  protected readonly email = computed(() => this.config.sales().email);
  protected readonly disclaimer = computed(
    () =>
      `Estimativa não vinculante · impostos não incluídos · válida por ${this.config.sales().validityDays} dias.`,
  );

  protected readonly proposal = signal<Proposal | null>(null);
  protected readonly link = signal('');
  protected readonly copied = signal(false);

  constructor() {
    const payload = this.route.snapshot.queryParamMap.get('d') ?? '';
    this.proposal.set(decodeProposal(payload));
    this.link.set(window.location.href);
  }

  /** Íntegra quando o hash embutido bate com o fingerprint publicado. */
  protected readonly intact = computed(() => {
    const proposal = this.proposal();
    const fingerprint = this.config.configFingerprint();
    return Boolean(proposal && fingerprint && proposal.configHash === fingerprint);
  });

  protected readonly billingLabel = computed(() =>
    this.proposal()?.billing === 'yearly' ? 'no primeiro ano' : 'por mês',
  );

  protected readonly shortHash = computed(() => {
    const hash = this.proposal()?.configHash;
    return hash ? `${hash.slice(0, 12)}…` : '';
  });

  protected readonly format = (value: number) => brl.format(value);

  protected async copyLink(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.link());
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    } catch {
      // Clipboard indisponível: nada a fazer.
    }
  }

  protected mailto(): string {
    const proposal = this.proposal();
    const prefix = `mailto:${this.email()}`;
    if (!proposal) {
      return `${prefix}?subject=${encodeURIComponent('Proposta Arx')}`;
    }

    const lines = proposal.lines.map(
      (line) =>
        `${line.name} — ${line.users} usuário(s): ${this.format(line.total)}/mês (setup ${this.format(line.setup)})`,
    );
    const body = [
      'Olá, segue a proposta assinada:',
      '',
      ...lines,
      `Plataforma (Infra · Sec · Conf · Sup): ${this.format(proposal.platform)}/mês`,
      proposal.discount > 0 ? `Desconto por volume: −${this.format(proposal.discount)}` : '',
      '',
      `Total estimado: ${this.format(proposal.grandTotal)} ${proposal.billing === 'yearly' ? 'por ano' : 'por mês'}.`,
      '',
      `Link assinado: ${this.link()}`,
      '',
      this.disclaimer(),
    ]
      .filter((line) => line !== '')
      .join('\n');

    return `${prefix}?subject=${encodeURIComponent('Proposta Arx')}&body=${encodeURIComponent(body)}`;
  }
}
