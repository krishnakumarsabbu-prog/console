import { useParams } from 'react-router-dom';
import { classNames } from '~/utils/classNames';
import { type ChatHistoryItem } from '~/lib/persistence';
import WithTooltip from '~/components/ui/Tooltip';
import { useEditChatDescription } from '~/lib/hooks';
import { forwardRef, type ForwardedRef, useCallback } from 'react';
import { Checkbox } from '~/components/ui/Checkbox';
import { Icon } from '~/components/ui/Icon';

interface HistoryItemProps {
  item: ChatHistoryItem;
  onDelete?: (event: React.UIEvent) => void;
  onDuplicate?: (id: string) => void;
  exportChat: (id?: string) => void;
  selectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelection?: (id: string) => void;
}

export function HistoryItem({
  item,
  onDelete,
  onDuplicate,
  exportChat,
  selectionMode = false,
  isSelected = false,
  onToggleSelection,
}: HistoryItemProps) {
  const { id: urlId } = useParams();
  const isActiveChat = urlId === item.urlId;

  const { editing, handleChange, handleBlur, handleSubmit, handleKeyDown, currentDescription, toggleEditMode } =
    useEditChatDescription({
      initialDescription: item.description,
      customChatId: item.id,
      syncWithGlobalStore: isActiveChat,
    });

  const handleItemClick = useCallback(
    (e: React.MouseEvent) => {
      if (selectionMode) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Item clicked in selection mode:', item.id);
        onToggleSelection?.(item.id);
      }
    },
    [selectionMode, item.id, onToggleSelection],
  );

  const handleCheckboxChange = useCallback(() => {
    console.log('Checkbox changed for item:', item.id);
    onToggleSelection?.(item.id);
  }, [item.id, onToggleSelection]);

  const handleDeleteClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      event.preventDefault();
      event.stopPropagation();
      console.log('Delete button clicked for item:', item.id);

      if (onDelete) {
        onDelete(event as unknown as React.UIEvent);
      }
    },
    [onDelete, item.id],
  );

  return (
    <div
      className={classNames(
        'group rounded-lg text-sm text-[var(--vscode-text-muted)] hover:text-[var(--vscode-text)] hover:bg-[var(--vscode-hover)] overflow-hidden flex justify-between items-center px-3 py-2 transition-colors',
        { 'text-[var(--vscode-text)] bg-[var(--vscode-selected)] border border-[var(--vscode-border)]': isActiveChat },
        { 'cursor-pointer': selectionMode },
      )}
      onClick={selectionMode ? handleItemClick : undefined}
    >
      {selectionMode && (
        <div className="flex items-center mr-2" onClick={(e) => e.stopPropagation()}>
          <Checkbox
            id={`select-${item.id}`}
            checked={isSelected}
            onCheckedChange={handleCheckboxChange}
            className="h-4 w-4"
          />
        </div>
      )}

      {editing ? (
        <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-2">
          <input
            type="text"
            className="flex-1 bg-transparent text-white rounded-md px-3 py-1.5 text-sm ring-1 ring-white/10 focus:outline-none focus:ring-white/20"
            autoFocus
            value={currentDescription}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
          />
          <button
            type="submit"
            className="text-slate-500 hover:text-white transition-colors"
            onMouseDown={handleSubmit}
          >
            <Icon name="check" size={16} />
          </button>
        </form>
      ) : (
        <a
          href={`/chat/${item.urlId}`}
          className="flex w-full relative truncate block"
          onClick={selectionMode ? handleItemClick : undefined}
        >
          <WithTooltip tooltip={currentDescription}>
            <span className="truncate pr-24">{currentDescription}</span>
          </WithTooltip>
          <div
            className={classNames(
              'absolute right-0 top-0 bottom-0 flex items-center bg-transparent px-2 transition-colors',
            )}
          >
            <div className="flex items-center gap-2.5 text-slate-500 opacity-100 group-hover:opacity-100 transition-opacity">
              <ChatActionButton
                toolTipContent="Export"
                icon="download-simple"
                onClick={(event) => {
                  event.preventDefault();
                  exportChat(item.id);
                }}
              />
              {onDuplicate && (
                <ChatActionButton
                  toolTipContent="Duplicate"
                  icon="copy"
                  onClick={(event) => {
                    event.preventDefault();
                    onDuplicate?.(item.id);
                  }}
                />
              )}
              <ChatActionButton
                toolTipContent="Rename"
                icon="pencil-fill"
                onClick={(event) => {
                  event.preventDefault();
                  toggleEditMode();
                }}
              />
              <ChatActionButton
                toolTipContent="Delete"
                icon="trash"
                className="hover:text-red-500"
                onClick={handleDeleteClick}
              />
            </div>
          </div>
        </a>
      )}
    </div>
  );
}

const ChatActionButton = forwardRef(
  (
    {
      toolTipContent,
      icon,
      className,
      onClick,
    }: {
      toolTipContent: string;
      icon: string;
      className?: string;
      onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
      btnTitle?: string;
    },
    ref: ForwardedRef<HTMLButtonElement>,
  ) => {
    return (
      <WithTooltip tooltip={toolTipContent} position="bottom" sideOffset={4}>
        <button
          ref={ref}
          type="button"
          className={classNames(
            'text-slate-500 hover:text-white transition-colors flex items-center justify-center',
            className
          )}
          onClick={onClick}
        >
          <Icon name={icon} size={14} />
        </button>
      </WithTooltip>
    );
  },
);
