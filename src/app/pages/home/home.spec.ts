import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import {
  lucideActivity,
  lucideBadgeCheck,
  lucideBarChart3,
  lucideBookOpen,
  lucideBoxes,
  lucideCalendarClock,
  lucideCloud,
  lucideDatabase,
  lucideFileCheck,
  lucideFingerprint,
  lucideGauge,
  lucideHardDrive,
  lucideHeadset,
  lucideKeyRound,
  lucideMessagesSquare,
  lucideMousePointerClick,
  lucideNetwork,
  lucidePlus,
  lucideScanText,
  lucideScrollText,
  lucideServer,
  lucideSettings2,
  lucideShieldCheck,
  lucideSlidersHorizontal,
  lucideWorkflow,
  lucideZap,
} from '@ng-icons/lucide';
import { Home } from './home';

describe('Home', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        provideRouter([]),
        provideIcons({
          lucideActivity,
          lucideBadgeCheck,
          lucideBarChart3,
          lucideBookOpen,
          lucideBoxes,
          lucideCalendarClock,
          lucideCloud,
          lucideDatabase,
          lucideFileCheck,
          lucideFingerprint,
          lucideGauge,
          lucideHardDrive,
          lucideHeadset,
          lucideKeyRound,
          lucideMessagesSquare,
          lucideMousePointerClick,
          lucideNetwork,
          lucidePlus,
          lucideScanText,
          lucideScrollText,
          lucideServer,
          lucideSettings2,
          lucideShieldCheck,
          lucideSlidersHorizontal,
          lucideWorkflow,
          lucideZap,
        }),
      ],
    }).compileComponents();
  });

  it('should render the brand tagline', async () => {
    const fixture = TestBed.createComponent(Home);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('open source');
  });
});
