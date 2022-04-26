import { Injectable } from '@angular/core';
import { BehaviorSubject, distinctUntilChanged, tap } from 'rxjs';

type ColorScheme = 'dark' | 'light';

interface ColorSchemeConfig {
  colorScheme: ColorScheme;
  hue: number;
}

const COLOR_SHEME = 'color-scheme';

const primaryHue = window
  .getComputedStyle(document.body)
  .getPropertyValue('--primary-hue');
const defaultHue = primaryHue === undefined ? 120 : +primaryHue;

const getBrowserPreferences = (): ColorScheme => {
  if (!window.matchMedia) {
    return 'light';
  }
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  } else {
    return 'light';
  }
};

@Injectable({
  providedIn: 'root',
})
export class ColorSchemeService {
  private browserColorScheme$ = new BehaviorSubject<ColorScheme>(
    getBrowserPreferences()
  );
  colorScheme$ = new BehaviorSubject<ColorScheme>('light');
  hue$ = new BehaviorSubject<number>(defaultHue);

  constructor() {
    this.initUserPreferences();
    this.syncWithUserPreferences();
    this.browserColorScheme$
      .pipe(
        tap((c) => {
          console.log('c: ', c);
        }),
        distinctUntilChanged()
      )
      .subscribe((newColorScheme) => {
        console.log('new browser color scheme', newColorScheme);
        this.colorScheme$.next(newColorScheme);
        this.setFavicon(newColorScheme);
      });
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
        console.log('new change');
        const colorScheme = e.matches ? 'dark' : 'light';
        console.log('colorScheme: ', colorScheme);
        this.browserColorScheme$.next(colorScheme);
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
      this.colorScheme$.next(colorSchemeConfig.colorScheme);

      if (isNaN(+colorSchemeConfig.hue)) {
        throw new Error();
      }
      this.hue$.next(colorSchemeConfig.hue);
    } catch (err) {
      localStorage.removeItem(COLOR_SHEME);
      this.colorScheme$.next(this.browserColorScheme$.value);
      return;
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
