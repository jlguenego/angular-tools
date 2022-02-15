import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

type ColorScheme = 'dark' | 'light';

interface ColorSchemeConfig {
  colorScheme: ColorScheme;
  hue: number;
}

const COLOR_SHEME = 'color-scheme';

const primaryHue = window
  .getComputedStyle(document.body)
  .getPropertyValue('--primary-hue');
const defaultHue = +primaryHue || 120;

@Injectable({
  providedIn: 'root',
})
export class ColorSchemeService {
  colorScheme$ = new BehaviorSubject<ColorScheme>('light');
  hue$ = new BehaviorSubject<number>(defaultHue);

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
      const config: ColorSchemeConfig = {
        hue: this.hue$.value,
        colorScheme: newColorScheme,
      };
      localStorage.setItem(COLOR_SHEME, JSON.stringify(config));
    });

    this.hue$.subscribe((newHue) => {
      document.documentElement.style.setProperty('--primary-hue', newHue + '');
      const config: ColorSchemeConfig = {
        hue: newHue,
        colorScheme: this.colorScheme$.value,
      };
      localStorage.setItem(COLOR_SHEME, JSON.stringify(config));
    });
  }

  toggleColorScheme() {
    if (this.colorScheme$.value === 'light') {
      this.colorScheme$.next('dark');
      return;
    }
    this.colorScheme$.next('light');
  }

  updateHue(newHue: number) {
    this.hue$.next(newHue);
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
    try {
      const str = localStorage.getItem(COLOR_SHEME);
      if (!str) {
        throw new Error();
      }
      const colorSchemeConfig = JSON.parse(str) as ColorSchemeConfig;
      if (!['dark', 'light'].includes(colorSchemeConfig.colorScheme)) {
        throw new Error();
      }
      if (isNaN(+colorSchemeConfig.hue)) {
        throw new Error();
      }
      this.colorScheme$.next(colorSchemeConfig.colorScheme);
      this.hue$.next(colorSchemeConfig.hue);
    } catch (err) {
      localStorage.removeItem(COLOR_SHEME);
      const browserPref = this.getBrowserPreferences();
      this.colorScheme$.next(browserPref);
      return;
    }
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
