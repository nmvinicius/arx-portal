import { computeSetupLimits, computeSetupSchedule } from './setup-math';

describe('computeSetupSchedule', () => {
  it('paga o principal à vista em 1 mês, sem juros', () => {
    const schedule = computeSetupSchedule(1000, 1, 0);
    expect(schedule.payments).toHaveLength(1);
    expect(schedule.first).toBeCloseTo(1000);
    expect(schedule.interest).toBeCloseTo(0);
  });

  it('aplica juros ao parcelar em mais meses', () => {
    const schedule = computeSetupSchedule(6000, 12, 0);
    expect(schedule.total).toBeGreaterThan(6000);
    expect(schedule.interest).toBeGreaterThan(0);
  });

  it('ordena as parcelas conforme a inclinação', () => {
    const crescente = computeSetupSchedule(6000, 12, 0.75);
    const decrescente = computeSetupSchedule(6000, 12, -0.75);
    expect(crescente.first).toBeLessThan(crescente.last);
    expect(decrescente.first).toBeGreaterThan(decrescente.last);
  });

  it('mantém parcelas iguais com inclinação zero', () => {
    const schedule = computeSetupSchedule(6000, 6, 0);
    schedule.payments.forEach((payment) => expect(payment).toBeCloseTo(schedule.first));
  });

  it('limita a inclinação para evitar parcela zerada', () => {
    const schedule = computeSetupSchedule(6000, 12, 1);
    expect(schedule.first).toBeGreaterThan(0);
  });
});

describe('computeSetupLimits', () => {
  it('deriva a faixa de meses do valor mínimo e máximo da parcela', () => {
    // 6000 → mín. 2 meses (parcela máx. 5000) e máx. 36 (parcela mín. 150).
    expect(computeSetupLimits(6000)).toEqual({ minMonths: 2, maxMonths: 36 });

    // 800 → 1 a 5 meses.
    expect(computeSetupLimits(800)).toEqual({ minMonths: 1, maxMonths: 5 });
  });
});
