import { afterNextRender, Directive, ElementRef, inject, input, OnDestroy } from '@angular/core';
import { animate, stagger } from 'animejs';

interface AnimationLike {
  pause(): void;
}

/**
 * Revela elementos com fade + slide ao entrarem na viewport.
 * Respeita `prefers-reduced-motion` (desativa a animação).
 *
 * Uso:
 *  - Elemento único:      <div appReveal>...</div>
 *  - Filhos com stagger:  <div appReveal appRevealStagger="article">...</div>
 */
@Directive({
  selector: '[appReveal]',
})
export class RevealDirective implements OnDestroy {
  /** Deslocamento vertical inicial, em px. */
  readonly appRevealY = input(28);
  /** Atraso base, em ms (ignorado quando há stagger). */
  readonly appRevealDelay = input(0);
  /** Seletor dos filhos a animar com stagger. Se vazio, anima o próprio elemento. */
  readonly appRevealStagger = input<string | null>(null);
  /** Atraso entre cada filho, em ms. */
  readonly appRevealStaggerDelay = input(80);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  private targets: Element[] = [];
  private animation?: AnimationLike;
  private observer?: IntersectionObserver;
  private played = false;

  constructor() {
    afterNextRender(() => this.init());
  }

  private init(): void {
    const root = this.host.nativeElement;
    const selector = this.appRevealStagger();

    if (selector) {
      this.targets = Array.from(root.querySelectorAll<HTMLElement>(selector));
      if (!this.targets.length) {
        this.targets = [root];
      }
    } else {
      this.targets = [root];
    }

    if (this.reducedMotion()) {
      return;
    }

    this.targets.forEach((el) => {
      const node = el as HTMLElement;
      node.style.opacity = '0';
      node.style.transform = `translateY(${this.appRevealY()}px)`;
    });

    if (typeof IntersectionObserver === 'undefined') {
      this.play();
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          this.play();
          this.observer?.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
    );

    this.observer.observe(root);
  }

  private play(): void {
    if (this.played) {
      return;
    }
    this.played = true;

    const staggerChildren = this.targets.length > 1;
    this.animation = animate(this.targets, {
      translateY: [this.appRevealY(), 0],
      opacity: [0, 1],
      duration: 720,
      ease: 'outExpo',
      delay: staggerChildren ? stagger(this.appRevealStaggerDelay()) : this.appRevealDelay(),
    });
  }

  private reducedMotion(): boolean {
    return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.animation?.pause();
    this.targets.forEach((el) => {
      const node = el as HTMLElement;
      node.style.opacity = '';
      node.style.transform = '';
    });
  }
}
