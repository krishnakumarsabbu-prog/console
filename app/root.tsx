import { useNanoStore } from '~/lib/hooks/useNanoStore';
import { themeStore } from './lib/stores/theme';
import { stripIndents } from './utils/stripIndent';
import { useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import ClientOnly from '../src/utils/ClientOnly';

import './styles/tailwind.css';
import 'react-toastify/dist/ReactToastify.css';
import './styles/index.scss';
import '@xterm/xterm/css/xterm.css';

export const links = [];

const inlineThemeCode = stripIndents`
  setTutorialKitTheme();

  function setTutorialKitTheme() {
    const validThemes = ['obsidian', 'aurora', 'forge', 'ivory'];
    let theme = localStorage.getItem('cortex_theme') || localStorage.getItem('bolt_theme');

    if (!theme || !validThemes.includes(theme)) {
      theme = 'obsidian';
    }

    document.querySelector('html')?.setAttribute('data-theme', theme);
  }
`;

export const Head = () => null;

export function Layout({ children }: { children: React.ReactNode }) {
  const theme = useNanoStore(themeStore);

  useEffect(() => {
    document.querySelector('html')?.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <>
      <ClientOnly>{() => <DndProvider backend={HTML5Backend}>{children}</DndProvider>}</ClientOnly>
    </>
  );
}

import { logStore } from './lib/stores/logs';

export default function App() {
  const theme = useNanoStore(themeStore);

  useEffect(() => {
    logStore.logSystem('Application initialized', {
      theme,
      platform: navigator.platform,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    });
  }, []);

  return (
    <Layout>
      {null}
    </Layout>
  );
}
