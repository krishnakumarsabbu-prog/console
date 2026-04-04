import { atom } from 'nanostores';
import { logStore } from './logs';

export type Theme = 'obsidian' | 'aurora' | 'forge' | 'ivory';

export const kTheme = 'cortex_theme';

export function themeIsDark() {
  const t = themeStore.get();
  return t === 'obsidian' || t === 'aurora' || t === 'forge';
}

export const DEFAULT_THEME: Theme = 'obsidian';

export const themeStore = atom<Theme>(initStore());

function initStore(): Theme {
  if (!import.meta.env.SSR) {
    const persisted = (localStorage.getItem(kTheme) || localStorage.getItem('bolt_theme')) as Theme | undefined;

    if (persisted && ['obsidian', 'aurora', 'forge', 'ivory'].includes(persisted)) {
      return persisted;
    }

    const attr = document.querySelector('html')?.getAttribute('data-theme') as Theme | null;

    if (attr && ['obsidian', 'aurora', 'forge', 'ivory'].includes(attr)) {
      return attr;
    }

    return DEFAULT_THEME;
  }

  return DEFAULT_THEME;
}

export function toggleTheme() {
  const current = themeStore.get();
  const cycle: Theme[] = ['obsidian', 'aurora', 'forge', 'ivory'];
  const next = cycle[(cycle.indexOf(current) + 1) % cycle.length];

  themeStore.set(next);
  localStorage.setItem(kTheme, next);
  document.querySelector('html')?.setAttribute('data-theme', next);

  try {
    const raw = localStorage.getItem('cortex_user_profile') || localStorage.getItem('bolt_user_profile');

    if (raw) {
      const profile = JSON.parse(raw);
      profile.theme = next;
      localStorage.setItem('cortex_user_profile', JSON.stringify(profile));
    }
  } catch {
    // noop
  }

  logStore.logSystem(`Theme changed to ${next}`);
}

export function setTheme(theme: Theme) {
  themeStore.set(theme);
  localStorage.setItem(kTheme, theme);
  document.querySelector('html')?.setAttribute('data-theme', theme);
  logStore.logSystem(`Theme set to ${theme}`);
}
