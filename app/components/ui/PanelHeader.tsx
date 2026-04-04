import { memo } from 'react';
import { classNames } from '~/utils/classNames';

interface PanelHeaderProps {
  className?: string;
  children: React.ReactNode;
}

export const PanelHeader = memo(({ className, children }: PanelHeaderProps) => {
  return (
    <div
      className={classNames(
        'flex items-center gap-2 bg-[var(--vscode-sidebar-bg)] text-[var(--vscode-text)] border-b border-[var(--vscode-border)] px-4 py-1 min-h-[34px] text-sm',
        className,
      )}
    >
      {children}
    </div>
  );
});
