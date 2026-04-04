import { motion } from 'framer-motion';
import * as Tooltip from '@radix-ui/react-tooltip';
import { classNames } from '~/utils/classNames';
import type { TabVisibilityConfig } from '~/components/@settings/core/types';
import { TAB_LABELS, TAB_ICONS } from '~/components/@settings/core/constants';
import { Icon } from '~/components/ui/Icon';

interface TabTileProps {
  tab: TabVisibilityConfig;
  onClick?: () => void;
  isActive?: boolean;
  hasUpdate?: boolean;
  statusMessage?: string;
  description?: string;
  isLoading?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const TabTile: React.FC<TabTileProps> = ({
  tab,
  onClick,
  isActive,
  hasUpdate,
  statusMessage,
  description,
  isLoading,
  className,
  children,
}: TabTileProps) => {
  return (
    <Tooltip.Provider delayDuration={200}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <motion.div
            onClick={onClick}
            className={classNames(
              'relative flex flex-col items-center p-6 rounded-xl',
              'w-full h-full min-h-[160px]',
              'bg-bolt-elements-background-depth-3',
              'border border-bolt-elements-borderColor',
              'group',
              'hover:bg-bolt-elements-background-depth-2',
              'hover:border-bolt-elements-borderColorActive',
              isActive ? 'border-bolt-elements-item-contentAccent bg-bolt-elements-item-backgroundAccent/5' : '',
              isLoading ? 'cursor-wait opacity-70' : '',
              className || '',
            )}
          >
            {/* Main Content */}
            <div className="flex flex-col items-center justify-center flex-1 w-full">
              {/* Icon */}
              <motion.div
                className={classNames(
                  'relative',
                  'w-14 h-14',
                  'flex items-center justify-center',
                  'rounded-xl',
                  'bg-bolt-elements-background-depth-4',
                  'ring-1 ring-bolt-elements-borderColor',
                  'group-hover:bg-bolt-elements-background-depth-3',
                  'group-hover:ring-bolt-elements-borderColorActive',
                  isActive ? 'bg-bolt-elements-item-backgroundAccent/10 ring-bolt-elements-item-contentAccent/30' : '',
                )}
              >
                <Icon
                  name={TAB_ICONS[tab.id]}
                  size={32}
                  className={classNames(
                    'text-bolt-elements-item-contentDefault',
                    'group-hover:text-bolt-elements-item-contentActive',
                    isActive ? 'text-bolt-elements-item-contentAccent' : '',
                  )}
                />
              </motion.div>

              {/* Label and Description */}
              <div className="flex flex-col items-center mt-5 w-full">
                <h3
                  className={classNames(
                    'text-[15px] font-medium leading-snug mb-2',
                    'text-bolt-elements-textPrimary',
                    isActive ? 'text-bolt-elements-item-contentAccent' : '',
                  )}
                >
                  {TAB_LABELS[tab.id]}
                </h3>
                {description && (
                  <p
                    className={classNames(
                      'text-[13px] leading-relaxed',
                      'text-bolt-elements-textSecondary',
                      'max-w-[85%]',
                      'text-center',
                      isActive ? 'text-bolt-elements-item-contentAccent/80' : '',
                    )}
                  >
                    {description}
                  </p>
                )}
              </div>
            </div>

            {/* Update Indicator with Tooltip */}
            {hasUpdate && (
              <>
                <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-bolt-elements-item-contentAccent animate-pulse" />
                <Tooltip.Portal>
                  <Tooltip.Content
                    className={classNames(
                      'px-3 py-1.5 rounded-lg',
                      'bg-bolt-elements-background-depth-4 text-bolt-elements-textPrimary',
                      'text-sm font-medium',
                      'select-none',
                      'z-[100]',
                    )}
                    side="top"
                    sideOffset={5}
                  >
                    {statusMessage}
                    <Tooltip.Arrow className="fill-bolt-elements-background-depth-4" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </>
            )}

            {/* Children (e.g. Beta Label) */}
            {children}
          </motion.div>
        </Tooltip.Trigger>
      </Tooltip.Root>
    </Tooltip.Provider >
  );
};
