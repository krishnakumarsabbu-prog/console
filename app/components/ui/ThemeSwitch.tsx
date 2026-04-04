import { useNanoStore } from '~/lib/hooks/useNanoStore';
import { memo, useEffect, useRef, useState } from 'react';
import { themeStore, setTheme, type Theme } from '~/lib/stores/theme';

interface ThemeSwitchProps {
  className?: string;
}

const THEMES: { id: Theme; label: string; accent: string; bg: string; ring: string }[] = [
  { id: 'obsidian', label: 'Obsidian', accent: '#22d3ee', bg: '#06090f', ring: 'rgba(34,211,238,0.5)' },
  { id: 'aurora', label: 'Aurora', accent: '#fbbf24', bg: '#060d08', ring: 'rgba(251,191,36,0.5)' },
  { id: 'forge', label: 'Forge', accent: '#fb923c', bg: '#0e0b09', ring: 'rgba(251,146,60,0.5)' },
  { id: 'ivory', label: 'Ivory', accent: '#b45309', bg: '#faf8f4', ring: 'rgba(180,83,9,0.5)' },
];

export const ThemeSwitch = memo(({ className }: ThemeSwitchProps) => {
  const theme = useNanoStore(themeStore);
  const [domLoaded, setDomLoaded] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDomLoaded(true);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!domLoaded) return null;

  const current = THEMES.find((t) => t.id === theme) ?? THEMES[0];

  return (
    <div ref={ref} className={`relative ${className ?? ''}`}>
      <button
        onClick={() => setOpen((v) => !v)}
        title="Switch theme"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '5px 10px',
          borderRadius: '8px',
          border: `1px solid ${current.ring}`,
          background: 'var(--cx-surface)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          color: 'var(--cx-text-secondary)',
          fontSize: '11px',
          fontWeight: 500,
          letterSpacing: '0.04em',
        }}
      >
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: current.accent,
            boxShadow: `0 0 6px ${current.accent}`,
            flexShrink: 0,
          }}
        />
        <span style={{ color: 'var(--cx-text-primary)' }}>{current.label}</span>
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 8px)',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--cx-surface)',
            border: '1px solid var(--cx-border)',
            borderRadius: '12px',
            padding: '6px',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            width: 160,
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            zIndex: 999,
            animation: 'cx-fade-up 0.15s ease-out',
          }}
        >
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setTheme(t.id);
                setOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 10px',
                borderRadius: '8px',
                border: 'none',
                background: theme === t.id ? `${t.accent}14` : 'transparent',
                cursor: 'pointer',
                width: '100%',
                textAlign: 'left',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (theme !== t.id) {
                  (e.currentTarget as HTMLButtonElement).style.background = 'var(--cx-hover)';
                }
              }}
              onMouseLeave={(e) => {
                if (theme !== t.id) {
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                }
              }}
            >
              <span
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '6px',
                  background: t.bg,
                  border: `2px solid ${t.accent}`,
                  boxShadow: theme === t.id ? `0 0 8px ${t.accent}` : 'none',
                  flexShrink: 0,
                  transition: 'box-shadow 0.2s',
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--cx-text-primary)', lineHeight: 1.2 }}>
                  {t.label}
                </div>
              </div>
              {theme === t.id && (
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.accent, boxShadow: `0 0 4px ${t.accent}` }} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});
