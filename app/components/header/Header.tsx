import { useNanoStore } from '~/lib/hooks/useNanoStore';
import { chatStore } from '~/lib/stores/chat';
import { classNames } from '~/utils/classNames';
import { HeaderActionButtons } from './HeaderActionButtons.client';
import { ChatDescription } from '~/lib/persistence/ChatDescription.client';
import { ClientOnly } from 'src/utils/ClientOnly';

export function Header() {
  const chat = useNanoStore(chatStore);

  return (
    <header
      className={classNames(
        'cx-header',
        'flex items-center justify-between px-5 h-[var(--header-height)]',
        'relative z-50',
      )}
    >
      <div className="flex items-center gap-3 z-logo">
        <a href="/" className="cx-logo-mark flex items-center gap-3 no-underline group">
          <div
            className="relative flex items-center justify-center w-8 h-8 rounded-[10px] overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.15), rgba(99, 102, 241, 0.15))',
              border: '1px solid rgba(56, 189, 248, 0.2)',
            }}
          >
            <span className="text-base leading-none">⚡</span>
          </div>
          <div className="flex flex-col gap-0">
            <span
              className="text-[15px] font-semibold tracking-tight leading-none"
              style={{
                background: 'linear-gradient(135deg, #f8fafc 0%, #94a3b8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Cortex
            </span>
            <span
              className="text-[9px] font-medium tracking-[0.12em] uppercase leading-none mt-0.5"
              style={{ color: '#38bdf8', opacity: 0.8 }}
            >
              Console
            </span>
          </div>
        </a>
      </div>

      {chat.started && (
        <>
          <div className="flex-1 px-6 min-w-0">
            <div className="flex items-center justify-center">
              <div
                className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm truncate max-w-sm"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  color: '#94a3b8',
                }}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: '#38bdf8', boxShadow: '0 0 6px #38bdf8' }}
                />
                <span className="truncate text-xs font-medium tracking-tight">
                  <ClientOnly>{() => <ChatDescription />}</ClientOnly>
                </span>
              </div>
            </div>
          </div>
          <ClientOnly>
            {() => (
              <div className="flex items-center gap-2">
                <HeaderActionButtons />
              </div>
            )}
          </ClientOnly>
        </>
      )}

      {!chat.started && (
        <div className="flex items-center gap-2 ml-auto">
          <div
            className="cx-badge cx-badge-sky"
            style={{ fontSize: '10px', letterSpacing: '0.08em' }}
          >
            AI Workspace
          </div>
        </div>
      )}
    </header>
  );
}
