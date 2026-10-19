import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import {
  lucideArrowRight,
  lucideBadgeCheck,
  lucideBadgePercent,
  lucideBarChart3,
  lucideBookOpen,
  lucideBoxes,
  lucideCalculator,
  lucideCalendarClock,
  lucideCloud,
  lucideFileCheck,
  lucideHardDrive,
  lucideHeadset,
  lucideMinus,
  lucideMousePointerClick,
  lucidePlus,
  lucideReceipt,
  lucideScale,
  lucideScanText,
  lucideShieldCheck,
  lucideSparkles,
  lucideStore,
  lucideUsers,
  lucideWorkflow,
  lucideX,
} from '@ng-icons/lucide';
import { Simulacao } from './simulacao';
import { ConfigService } from '../../shared/config/config.service';
import { DEFAULT_CONFIG } from '../../shared/config/config';

describe('Simulacao', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Simulacao],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: (key: string) => (key === 'code' ? 'AX92K' : null) } } },
        },
        provideIcons({
          lucideArrowRight,
          lucideBadgeCheck,
          lucideBadgePercent,
          lucideBarChart3,
          lucideBookOpen,
          lucideBoxes,
          lucideCalculator,
          lucideCalendarClock,
          lucideCloud,
          lucideFileCheck,
          lucideHardDrive,
          lucideHeadset,
          lucideMinus,
          lucideMousePointerClick,
          lucidePlus,
          lucideReceipt,
          lucideScale,
          lucideScanText,
          lucideShieldCheck,
          lucideSparkles,
          lucideStore,
          lucideUsers,
          lucideWorkflow,
          lucideX,
        }),
      ],
    }).compileComponents();
  });

  it('should render the simulator heading', async () => {
    const fixture = TestBed.createComponent(Simulacao);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Monte o preço');
  });

  it('should compute the monthly total for a selected product', () => {
    const fixture = TestBed.createComponent(Simulacao);
    const component = fixture.componentInstance;

    component['add']('odoo');
    fixture.detectChanges();

    const items = component['selectedItems']();
    expect(items.length).toBe(1);
    expect(items[0].users).toBe(5);
    // Odoo: base 900 + 150×5 usuários + plataforma 900 (sem desconto para 5 usuários).
    expect(component['monthlyTotal']()).toBe(900 + 150 * 5 + 900);
    expect(component['setupTotal']()).toBe(6000);
  });

  it('soma a participação do parceiro aos preços exibidos', () => {
    const config = TestBed.inject(ConfigService);
    config.config.set({
      ...DEFAULT_CONFIG,
      sales: { enabled: true, email: '', validityDays: 15, agents: [{ code: 'AX92K', name: 'Maria', commission: 0.1 }] },
    });

    const fixture = TestBed.createComponent(Simulacao);
    const component = fixture.componentInstance;

    component['add']('odoo');
    fixture.detectChanges();

    // Odoo: base 900 + 150×5 + plataforma 900 = 2550, com +10% = 2805.
    expect(component['baseFor'](component['products']()[0])).toBe(990);
    expect(component['perUserFor'](component['products']()[0])).toBe(165);
    expect(component['grandTotal']()).toBe(2805);
  });

  it('aplica uma pré-seleção de perfil e marca como ativa', () => {
    const fixture = TestBed.createComponent(Simulacao);
    const component = fixture.componentInstance;

    const preset = component['presets']()[0];
    component['applyPreset'](preset);
    fixture.detectChanges();

    expect(component['activePresetId']()).toBe(preset.id);
    expect(component['usersFor']('documenso')).toBe(preset.selection['documenso']);
  });
});
