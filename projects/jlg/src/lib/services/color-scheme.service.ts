import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

type ColorScheme = 'dark' | 'light';

@Injectable({
  providedIn: 'root',
})
export class ColorSchemeService {
  colorScheme$ = new BehaviorSubject<ColorScheme>('light');

  constructor() {
    const browserPref = this.getBrowserPreferences();
    this.setFavicon(browserPref);

    this.initUserPreferences();
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

  private syncWithUserPreferences() {
    // also watch for user pref changes.
    if (!window.matchMedia) {
      return;
    }
    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', (e) => {
        const colorScheme = e.matches ? 'dark' : 'light';
        this.colorScheme$.next(colorScheme);
        this.setFavicon(colorScheme);
      });
  }

  private initUserPreferences() {
    const str = localStorage.getItem('color-scheme') as ColorScheme;
    if (!['dark', 'light'].includes(str)) {
      localStorage.removeItem('color-scheme');
      const browserPref = this.getBrowserPreferences();
      this.colorScheme$.next(browserPref);
      return;
    }
    this.colorScheme$.next(str);
  }

  private getBrowserPreferences(): ColorScheme {
    if (!window.matchMedia) {
      return 'light';
    }
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    } else {
      return 'light';
    }
  }

  setFavicon(newColorScheme: ColorScheme) {
    console.log('setFavicon newColorScheme: ', newColorScheme);
    let link: HTMLLinkElement | null =
      document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/svg';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    link.href = `assets/favicon-${newColorScheme}.svg`;
  }
}
