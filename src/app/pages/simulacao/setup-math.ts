/** Taxa de juros mensal do parcelamento do setup (1,5% a.m.). */
export const SETUP_MONTHLY_RATE = 0.015;

/** Limites rígidos de parcelamento. */
export const SETUP_MIN_MONTHS = 1;
export const SETUP_MAX_MONTHS = 36;

/** Valor mínimo e máximo de cada parcela (em reais). */
export const SETUP_MIN_INSTALLMENT = 150;
export const SETUP_MAX_INSTALLMENT = 5000;

/** Inclinação máxima (evita parcela zerada). */
export const SETUP_MAX_TILT = 0.75;

export interface SetupLimits {
  minMonths: number;
  maxMonths: number;
}

/**
 * Faixa de meses permitida para o valor informado, derivada do valor
 * mínimo/máximo de cada parcela e dos limites rígidos de parcelamento.
 */
export function computeSetupLimits(principal: number): SetupLimits {
  const minMonths = Math.max(SETUP_MIN_MONTHS, Math.ceil(principal / SETUP_MAX_INSTALLMENT));
  const maxMonths = Math.min(SETUP_MAX_MONTHS, Math.floor(principal / SETUP_MIN_INSTALLMENT));

  if (minMonths > maxMonths) {
    return { minMonths: SETUP_MIN_MONTHS, maxMonths: SETUP_MAX_MONTHS };
  }
  return { minMonths, maxMonths };
}

export interface SetupSchedule {
  /** Valor de cada parcela, mês a mês. */
  payments: number[];
  first: number;
  last: number;
  /** Total pago (principal + juros). */
  total: number;
  interest: number;
}

/**
 * Calcula o parcelamento do setup como uma progressão aritmética de parcelas
 * cujo valor presente (descontado pela taxa de juros mensal) é igual ao principal.
 *
 * `tilt` redistribui as parcelas em torno da média:
 *  - 0  -> parcelas fixas;
 *  - +1 -> crescente (começa menor, termina maior);
 *  - -1 -> decrescente (começa maior, termina menor).
 */
export function computeSetupSchedule(principal: number, months: number, tilt: number): SetupSchedule {
  const { minMonths, maxMonths } = computeSetupLimits(principal);
  const n = Math.max(minMonths, Math.min(maxMonths, Math.round(months)));
  const t = Math.max(-SETUP_MAX_TILT, Math.min(SETUP_MAX_TILT, tilt));

  const weights = Array.from({ length: n }, (_, k) => {
    const pos = n === 1 ? 0.5 : k / (n - 1);
    return 1 + t * (pos * 2 - 1);
  });

  const presentValue = weights.reduce(
    (sum, weight, k) => sum + weight / Math.pow(1 + SETUP_MONTHLY_RATE, k),
    0,
  );
  const base = principal / presentValue;

  const payments = weights.map((weight) => base * weight);
  const total = payments.reduce((sum, payment) => sum + payment, 0);

  return {
    payments,
    first: payments[0],
    last: payments[payments.length - 1],
    total,
    interest: total - principal,
  };
}
