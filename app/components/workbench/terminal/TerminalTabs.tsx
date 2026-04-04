import { useNanoStore } from '~/lib/hooks/useNanoStore';
import React, { memo, useEffect, useRef, useState } from 'react';
import { Panel, type ImperativePanelHandle } from 'react-resizable-panels';
import { IconButton } from '~/components/ui/IconButton';
import { shortcutEventEmitter } from '~/lib/hooks';
import { themeStore } from '~/lib/stores/theme';
import { workbenchStore } from '~/lib/stores/workbench';
import { classNames } from '~/utils/classNames';
import { Terminal, type TerminalRef } from './Terminal';
import { createScopedLogger } from '~/utils/logger';
import { Icon } from '~/components/ui/Icon';

const logger = createScopedLogger('Terminal');

const MAX_TERMINALS = 3;
export const DEFAULT_TERMINAL_SIZE = 25;

export const TerminalTabs = memo(() => {
  const showTerminal = useNanoStore(workbenchStore.showTerminal);
  const theme = useNanoStore(themeStore);

  const terminalRefs = useRef<Array<TerminalRef | null>>([]);
  const terminalPanelRef = useRef<ImperativePanelHandle>(null);
  const terminalToggledByShortcut = useRef(false);

  const [activeTerminal, setActiveTerminal] = useState(0);
  const [terminalCount, setTerminalCount] = useState(1);

  const addTerminal = () => {
    if (terminalCount < MAX_TERMINALS) {
      setTerminalCount(terminalCount + 1);
      setActiveTerminal(terminalCount);
    }
  };

  useEffect(() => {
    const { current: terminal } = terminalPanelRef;

    if (!terminal) {
      return;
    }

    const isCollapsed = terminal.isCollapsed();

    if (!showTerminal && !isCollapsed) {
      terminal.collapse();
    } else if (showTerminal && isCollapsed) {
      terminal.resize(DEFAULT_TERMINAL_SIZE);
    }

    terminalToggledByShortcut.current = false;
  }, [showTerminal]);

  useEffect(() => {
    const unsubscribeFromEventEmitter = shortcutEventEmitter.on('toggleTerminal', () => {
      terminalToggledByShortcut.current = true;
    });

    const unsubscribeFromThemeStore = themeStore.subscribe(() => {
      for (const ref of Object.values(terminalRefs.current)) {
        ref?.reloadStyles();
      }
    });

    return () => {
      unsubscribeFromEventEmitter();
      unsubscribeFromThemeStore();
    };
  }, []);

  return (
    <Panel
      ref={terminalPanelRef}
      defaultSize={showTerminal ? DEFAULT_TERMINAL_SIZE : 0}
      minSize={10}
      collapsible
      onExpand={() => {
        if (!terminalToggledByShortcut.current) {
          workbenchStore.toggleTerminal(true);
        }
      }}
      onCollapse={() => {
        if (!terminalToggledByShortcut.current) {
          workbenchStore.toggleTerminal(false);
        }
      }}
    >
      <div className="h-full">
        <div className="bg-bolt-elements-background-depth-1 h-full flex flex-col">
          <div className="flex items-center bg-bolt-elements-background-depth-2 ring-1 ring-white/5 gap-1.5 min-h-[34px] p-2">
            {Array.from({ length: terminalCount + 1 }, (_, index) => {
              const isActive = activeTerminal === index;

              return (
                <React.Fragment key={index}>
                  {index == 0 ? (
                    <button
                      key={index}
                      className={classNames(
                        'flex items-center text-sm cursor-pointer gap-1.5 px-3 py-2 h-full whitespace-nowrap rounded-full transition-all',
                        {
                          'bg-bolt-elements-item-backgroundActive text-bolt-elements-item-contentActive': isActive,
                          'bg-transparent text-bolt-elements-item-contentDefault hover:bg-bolt-elements-item-backgroundActive hover:text-bolt-elements-item-contentActive': !isActive,
                        },
                      )}
                      onClick={() => setActiveTerminal(index)}
                    >
                      <Icon name="terminal" size={16} />
                      Cortex Terminal
                    </button>
                  ) : (
                    <React.Fragment>
                      <button
                        key={index}
                        className={classNames(
                          'flex items-center text-sm cursor-pointer gap-1.5 px-3 py-2 h-full whitespace-nowrap rounded-full transition-all',
                          {
                            'bg-white/10 text-white': isActive,
                            'bg-transparent text-slate-400 hover:bg-white/5 hover:text-white': !isActive,
                          },
                        )}
                        onClick={() => setActiveTerminal(index)}
                      >
                        <Icon name="terminal" size={16} />
                        Terminal {terminalCount > 1 && index}
                      </button>
                    </React.Fragment>
                  )}
                </React.Fragment>
              );
            })}
            {terminalCount < MAX_TERMINALS && <IconButton icon="plus" size="md" onClick={addTerminal} />}
            <IconButton
              className="ml-auto"
              icon="caret-down"
              title="Close"
              size="md"
              onClick={() => workbenchStore.toggleTerminal(false)}
            />
          </div>
          {Array.from({ length: terminalCount + 1 }, (_, index) => {
            const isActive = activeTerminal === index;

            logger.debug(`Starting bolt terminal [${index}]`);

            if (index == 0) {
              return (
                <Terminal
                  key={index}
                  id={`terminal_${index}`}
                  className={classNames('h-full overflow-hidden modern-scrollbar-invert', {
                    hidden: !isActive,
                  })}
                  ref={(ref) => {
                    terminalRefs.current.push(ref);
                  }}
                  onTerminalReady={(terminal) => workbenchStore.attachBoltTerminal(terminal)}
                  onTerminalResize={(cols, rows) => workbenchStore.onTerminalResize(cols, rows)}
                  theme={theme}
                />
              );
            } else {
              return (
                <Terminal
                  key={index}
                  id={`terminal_${index}`}
                  className={classNames('modern-scrollbar h-full overflow-hidden', {
                    hidden: !isActive,
                  })}
                  ref={(ref) => {
                    terminalRefs.current.push(ref);
                  }}
                  onTerminalReady={(terminal) => workbenchStore.attachTerminal(terminal)}
                  onTerminalResize={(cols, rows) => workbenchStore.onTerminalResize(cols, rows)}
                  theme={theme}
                />
              );
            }
          })}
        </div>
      </div>
    </Panel>
  );
});
