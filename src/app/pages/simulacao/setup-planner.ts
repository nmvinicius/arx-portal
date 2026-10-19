import { Component, computed, effect, input, model, OnDestroy, signal } from '@angular/core';
import {
  computeSetupLimits,
  computeSetupSchedule,
  SETUP_MAX_INSTALLMENT,
  SETUP_MAX_MONTHS,
  SETUP_MAX_TILT,
  SETUP_MIN_INSTALLMENT,
} from './setup-math';

const brl = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
});

const WIDTH = 300;
const PLOT = { left: 14, right: 290, top: 48, bottom: 160 };
const PX_PER_MONTH = (PLOT.right - PLOT.left) / SETUP_MAX_MONTHS;
const TIP_WIDTH = 84;
const TIP_HEIGHT = 36;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

interface HoveredBar {
  month: number;
  value: number;
  tipX: number;
  tipY: number;
}

/**
 * Parcelamento do setup: gráfico arrastável para esticar (meses) e inclinar
 * (crescente/decrescente) as parcelas, com juros aplicados ao valor presente.
 */
@Component({
  selector: 'app-setup-planner',
  templateUrl: './setup-planner.html',
})
export class SetupPlanner implements OnDestroy {
  /** Valor do setup a parcelar. */
  readonly setup = input.required<number>();
  /** Número de meses (duas vias com o componente pai). */
  readonly months = model(6);
  /** Inclinação das parcelas, de -1 (decrescente) a 1 (crescente). */
  readonly tilt = model(0);

  protected readonly schedule = computed(() =>
    computeSetupSchedule(this.setup(), this.months(), this.tilt()),
  );

  /** Faixa de meses permitida para o setup atual. */
  protected readonly limits = computed(() => computeSetupLimits(this.setup()));

  protected readonly minInstallment = SETUP_MIN_INSTALLMENT;
  protected readonly maxInstallment = SETUP_MAX_INSTALLMENT;
  protected readonly tiltMin = -Math.round(SETUP_MAX_TILT * 100);
  protected readonly tiltMax = Math.round(SETUP_MAX_TILT * 100);

  protected readonly chart = computed(() => {
    const payments = this.schedule().payments;
    const n = payments.length;
    const max = Math.max(...payments, 1);
    const yMax = max * 1.15;
    const plotW = PLOT.right - PLOT.left;
    const plotH = PLOT.bottom - PLOT.top;
    const slot = plotW / n;
    const barWidth = Math.min(slot * 0.6, 20);

    const bars = payments.map((payment, k) => {
      const cx = PLOT.left + slot * k + slot / 2;
      const h = (payment / yMax) * plotH;
      return { x: cx - barWidth / 2, y: PLOT.bottom - h, width: barWidth, height: h, month: k + 1 };
    });

    const points = bars
      .map((bar) => `${(bar.x + bar.width / 2).toFixed(1)},${bar.y.toFixed(1)}`)
      .join(' ');

    return { bars, points, firstBar: bars[0], lastBar: bars[bars.length - 1] };
  });

  protected readonly tiltPercent = computed(() => Math.round(this.tilt() * 100));

  protected readonly tiltSymbol = computed(() => {
    const t = this.tilt();
    if (t > 0.05) return '/';
    if (t < -0.05) return '\\';
    return '—';
  });

  protected readonly format = (value: number) => brl.format(value);

  protected readonly hovered = signal<HoveredBar | null>(null);
  private lastHoveredMonth = -1;

  constructor() {
    // Mantém o número de meses dentro da faixa permitida quando o setup muda.
    effect(() => {
      const { minMonths, maxMonths } = this.limits();
      const current = this.months();
      if (current < minMonths || current > maxMonths) {
        this.months.set(clamp(current, minMonths, maxMonths));
      }
    });
  }

  private dragging = false;
  private start = { x: 0, y: 0, months: 6, tilt: 0 };

  protected onPointerDown(event: PointerEvent): void {
    this.clearHover();
    this.dragging = true;
    this.start = { x: event.clientX, y: event.clientY, months: this.months(), tilt: this.tilt() };
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
    event.preventDefault();
  }

  private readonly onPointerMove = (event: PointerEvent): void => {
    if (!this.dragging) {
      return;
    }
    const dx = event.clientX - this.start.x;
    const dy = this.start.y - event.clientY;

    const { minMonths, maxMonths } = this.limits();
    const months = clamp(this.start.months + Math.round(dx / PX_PER_MONTH), minMonths, maxMonths);
    const tilt = clamp(this.start.tilt + dy / ((PLOT.bottom - PLOT.top) / 2), -SETUP_MAX_TILT, SETUP_MAX_TILT);

    this.months.set(months);
    this.tilt.set(tilt);
  };

  private readonly onPointerUp = (): void => {
    this.dragging = false;
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
  };

  protected onChartPointerMove(event: PointerEvent): void {
    if (this.dragging) {
      return;
    }
    const svg = event.currentTarget as SVGSVGElement;
    const rect = svg.getBoundingClientRect();
    if (!rect.width) {
      return;
    }

    const bars = this.chart().bars;
    const n = bars.length;
    const x = ((event.clientX - rect.left) / rect.width) * WIDTH;
    const slot = (PLOT.right - PLOT.left) / n;
    const index = Math.floor((x - PLOT.left) / slot);

    if (index < 0 || index >= n) {
      this.clearHover();
      return;
    }
    if (index === this.lastHoveredMonth) {
      return;
    }
    this.lastHoveredMonth = index;

    const bar = bars[index];
    const value = this.schedule().payments[index];
    const barCenter = bar.x + bar.width / 2;
    const tipX = clamp(barCenter - TIP_WIDTH / 2, PLOT.left - 4, PLOT.right - TIP_WIDTH + 4);
    const tipY = Math.max(2, bar.y - TIP_HEIGHT - 6);

    this.hovered.set({ month: index + 1, value, tipX, tipY });
  }

  protected onChartPointerLeave(): void {
    this.clearHover();
  }

  private clearHover(): void {
    this.lastHoveredMonth = -1;
    this.hovered.set(null);
  }

  protected onMonthsInput(event: Event): void {
    const value = (event.target as HTMLInputElement).valueAsNumber;
    if (Number.isNaN(value)) {
      return;
    }
    const { minMonths, maxMonths } = this.limits();
    this.months.set(clamp(Math.round(value), minMonths, maxMonths));
  }

  protected onTiltInput(event: Event): void {
    const value = (event.target as HTMLInputElement).valueAsNumber;
    if (Number.isNaN(value)) {
      return;
    }
    this.tilt.set(clamp(value / 100, -SETUP_MAX_TILT, SETUP_MAX_TILT));
  }

  ngOnDestroy(): void {
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
  }
}
