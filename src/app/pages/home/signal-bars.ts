import { afterNextRender, Component, ElementRef, OnDestroy, viewChildren } from '@angular/core';
import { animate, stagger } from 'animejs';

interface AnimationLike {
  pause(): void;
}

/**
 * Equalizador decorativo ("sinal") com loop contínuo.
 * Desativado quando `prefers-reduced-motion: reduce`.
 */
@Component({
  selector: 'app-signal-bars',
  template: `
    <div class="flex h-6 items-end gap-1" aria-hidden="true">
      @for (bar of bars; track bar) {
        <span #bar class="block h-6 w-1 origin-bottom rounded-full bg-signal-500 dark:bg-signal-400"></span>
      }
    </div>
  `,
})
export class SignalBars implements OnDestroy {
  protected readonly bars = Array.from({ length: 9 }, (_, i) => i);

  private readonly barRefs = viewChildren<ElementRef<HTMLElement>>('bar');
  private animation?: AnimationLike;

  constructor() {
    afterNextRender(() => this.start());
  }

  private start(): void {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const elements = this.barRefs().map((ref) => ref.nativeElement);
    if (!elements.length) {
      return;
    }

    this.animation = animate(elements, {
      scaleY: [0.15, 1, 0.3],
      duration: 850,
      ease: 'inOutSine',
      delay: stagger(110, { from: 'center' }),
      loop: true,
    });
  }

  ngOnDestroy(): void {
    this.animation?.pause();
  }
}
