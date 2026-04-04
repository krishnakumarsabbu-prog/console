import { useNanoStore } from '~/lib/hooks/useNanoStore';
import useViewport from '~/lib/hooks';
import { chatStore } from '~/lib/stores/chat';
import { workbenchStore } from '~/lib/stores/workbench';
import { classNames } from '~/utils/classNames';
import { themeStore, toggleTheme } from '~/lib/stores/theme';
import { Icon } from '~/components/ui/Icon';

interface HeaderActionButtonsProps { }

export function HeaderActionButtons({ }: HeaderActionButtonsProps) {
  const showWorkbench = useNanoStore(workbenchStore.showWorkbench);
  const { showChat } = useNanoStore(chatStore);
  const isSmallViewport = useViewport(1024);
  const canHideChat = showWorkbench || !showChat;

  return (
    <div className="flex">
      {/* Theme Switcher */}
      <Button onClick={toggleTheme} className="mr-2">
        <Icon
          name={
            themeStore.get() === 'light' ? 'sun' :
              themeStore.get() === 'dark' ? 'moon' : 'monitor'
          }
          size={18}
          className="transition-colors text-slate-400 hover:text-white"
        />
      </Button>

      <div className="flex ring-1 ring-white/10 rounded-md overflow-hidden">
        <Button
          active={showChat}
          disabled={!canHideChat || isSmallViewport} // expand button is disabled on mobile as it's not needed
          onClick={() => {
            if (canHideChat) {
              chatStore.setKey('showChat', !showChat);
            }
          }}
        >
          <Icon name="chat" size={16} />
        </Button>
        <div className="w-[1px] bg-white/10" />
        <Button
          active={showWorkbench}
          onClick={() => {
            if (showWorkbench && !showChat) {
              chatStore.setKey('showChat', true);
            }

            workbenchStore.showWorkbench.set(!showWorkbench);
          }}
        >
          <Icon name="code-2" size={16} />
        </Button>
      </div>
    </div>
  );
}

interface ButtonProps {
  active?: boolean;
  disabled?: boolean;
  children?: any;
  onClick?: VoidFunction;
  className?: string;
}

function Button({ active = false, disabled = false, children, onClick, className }: ButtonProps) {
  return (
    <button
      className={classNames(
        'flex items-center p-1.5',
        {
          'bg-bolt-elements-item-backgroundDefault hover:bg-bolt-elements-item-backgroundActive text-bolt-elements-textTertiary hover:text-bolt-elements-textPrimary':
            !active,
          'bg-bolt-elements-item-backgroundAccent text-bolt-elements-item-contentAccent': active && !disabled,
          'bg-bolt-elements-item-backgroundDefault text-alpha-gray-20 dark:text-alpha-white-20 cursor-not-allowed':
            disabled,
        },
        className,
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
