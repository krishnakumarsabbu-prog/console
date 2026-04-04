import { useNanoStore } from '~/lib/hooks/useNanoStore';
import { chatStore } from '~/lib/stores/chat';
import { classNames } from '~/utils/classNames';
import { HeaderActionButtons } from './HeaderActionButtons.client';
import { ChatDescription } from '~/lib/persistence/ChatDescription.client';
import { Icon } from '~/components/ui/Icon';
import { ClientOnly } from 'src/utils/ClientOnly';

export function Header() {
  const chat = useNanoStore(chatStore);

  return (
    <header
      className="flex items-center justify-between p-5 h-[var(--header-height)] border-b border-[rgba(255,255,255,0.06)]"
    >
      <div className="flex items-center gap-2 z-logo cursor-pointer">
        <Icon name="panel-left" className="text-xl text-bolt-elements-textPrimary" />
        <a href="/" className="flex items-center gap-2 no-underline">
          <div className="text-2xl">🩺</div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent leading-tight m-0">
              DevCure
            </h1>
            <p className="text-[10px] text-gray-400 m-0 leading-tight">
              Heal, Fix &amp; Optimize Your Code
            </p>
          </div>
        </a>
      </div>

      {chat.started && (
        <>
          <span className="flex-1 px-4 truncate text-center text-bolt-elements-textPrimary">
            <ClientOnly>{() => <ChatDescription />}</ClientOnly>
          </span>
          <ClientOnly>
            {() => (
              <div className="mr-1">
                <HeaderActionButtons />
              </div>
            )}
          </ClientOnly>
        </>
      )}
    </header>
  );
}
