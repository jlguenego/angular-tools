import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

type ColorScheme = 'dark' | 'light';

@Injectable({
  providedIn: 'root',
})
export class ColorSchemeService {
  colorScheme$ = new BehaviorSubject<ColorScheme>('light');

  constructor() {
    this.syncWithUserPreferences();
    this.colorScheme$.subscribe((newColorScheme) => {
      ['dark', 'light'].forEach((colorScheme) => {
        document.body.classList.remove(colorScheme);
      });
      document.body.classList.add(newColorScheme);
      localStorage.setItem('color-scheme', newColorScheme);
    });
  }

  toggleColorScheme() {
    if (this.colorScheme$.value === 'light') {
      this.colorScheme$.next('dark');
      return;
    }
    this.colorScheme$.next('light');
  }

  syncWithUserPreferences() {
    this.initUserPreferences();

    // also watch for user pref changes.
    if (!window.matchMedia) {
      return;
    }
    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', (e) => {
        const colorScheme = e.matches ? 'dark' : 'light';
        this.colorScheme$.next(colorScheme);
      });
  }

  initUserPreferences() {
    const str = localStorage.getItem('color-scheme') as ColorScheme;
    if (!['dark', 'light'].includes(str)) {
      localStorage.removeItem('color-scheme');
      if (
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
      ) {
        this.colorScheme$.next('dark');
      }
      return;
    }
    this.colorScheme$.next(str);
  }
}
