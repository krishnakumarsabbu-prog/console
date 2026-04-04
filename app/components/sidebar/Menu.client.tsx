import { motion, type Variants } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { Dialog, DialogButton, DialogDescription, DialogRoot, DialogTitle } from '~/components/ui/Dialog';
import { ThemeSwitch } from '~/components/ui/ThemeSwitch';
import { ControlPanel } from '~/components/@settings/core/ControlPanel';
import { SettingsButton } from '~/components/ui/SettingsButton';
import { Button } from '~/components/ui/Button';
import { db, deleteById, getAll, chatId, type ChatHistoryItem, useChatHistory } from '~/lib/persistence';
import { cubicEasingFn } from '~/utils/easings';
import { HistoryItem } from './HistoryItem';
import { binDates } from './date-binning';
import { useSearchFilter } from '~/lib/hooks/useSearchFilter';
import { classNames } from '~/utils/classNames';
import { useNanoStore } from '~/lib/hooks/useNanoStore';
import { profileStore } from '~/lib/stores/profile';
import { Icon } from '~/components/ui/Icon';

const menuVariants = {
  closed: {
    opacity: 0,
    visibility: 'hidden',
    left: '-340px',
    transition: {
      duration: 0.25,
      ease: cubicEasingFn,
    },
  },
  open: {
    opacity: 1,
    visibility: 'initial',
    left: 0,
    transition: {
      duration: 0.25,
      ease: cubicEasingFn,
    },
  },
} satisfies Variants;

type DialogContent =
  | { type: 'delete'; item: ChatHistoryItem }
  | { type: 'bulkDelete'; items: ChatHistoryItem[] }
  | null;

function CurrentDateTime() {
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const timeStr = dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = dateTime.toLocaleDateString([], { month: 'short', day: 'numeric' });

  return (
    <div
      className="flex items-center justify-between px-4 py-2.5"
      style={{ borderBottom: '1px solid var(--cx-border)' }}
    >
      <span className="text-[11px] font-medium tracking-wide" style={{ color: 'var(--cx-text-muted)' }}>
        {dateStr}
      </span>
      <span
        className="text-[11px] font-mono font-medium tabular-nums"
        style={{ color: 'var(--cx-accent-vivid)', opacity: 0.7 }}
      >
        {timeStr}
      </span>
    </div>
  );
}

export const Menu = () => {
  const { duplicateCurrentChat, exportChat } = useChatHistory();
  const menuRef = useRef<HTMLDivElement>(null);
  const [list, setList] = useState<ChatHistoryItem[]>([]);
  const [open, setOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState<DialogContent>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const profile = useNanoStore(profileStore);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const { filteredItems: filteredList, handleSearchChange } = useSearchFilter({
    items: list,
    searchFields: ['description'],
  });

  const loadEntries = useCallback(() => {
    if (db) {
      getAll(db)
        .then((list) => list.filter((item) => item.urlId && item.description))
        .then(setList)
        .catch((error) => toast.error(error.message));
    }
  }, []);

  const deleteChat = useCallback(
    async (id: string): Promise<void> => {
      if (!db) {
        throw new Error('Database not available');
      }

      try {
        const snapshotKey = `snapshot:${id}`;
        localStorage.removeItem(snapshotKey);
      } catch (snapshotError) {
        console.error(`Error deleting snapshot for chat ${id}:`, snapshotError);
      }

      await deleteById(db, id);
    },
    [db],
  );

  const deleteItem = useCallback(
    (event: React.UIEvent, item: ChatHistoryItem) => {
      event.preventDefault();
      event.stopPropagation();

      deleteChat(item.id)
        .then(() => {
          toast.success('Chat deleted', { position: 'bottom-right', autoClose: 2500 });
          loadEntries();

          if (chatId.get() === item.id) {
            window.location.pathname = '/';
          }
        })
        .catch((error) => {
          console.error('Failed to delete chat:', error);
          toast.error('Failed to delete conversation', { position: 'bottom-right', autoClose: 3000 });
          loadEntries();
        });
    },
    [loadEntries, deleteChat],
  );

  const deleteSelectedItems = useCallback(
    async (itemsToDeleteIds: string[]) => {
      if (!db || itemsToDeleteIds.length === 0) {
        return;
      }

      let deletedCount = 0;
      const errors: string[] = [];
      const currentChatId = chatId.get();
      let shouldNavigate = false;

      for (const id of itemsToDeleteIds) {
        try {
          await deleteChat(id);
          deletedCount++;

          if (id === currentChatId) {
            shouldNavigate = true;
          }
        } catch (error) {
          console.error(`Error deleting chat ${id}:`, error);
          errors.push(id);
        }
      }

      if (errors.length === 0) {
        toast.success(`${deletedCount} chat${deletedCount === 1 ? '' : 's'} deleted`);
      } else {
        toast.warning(`Deleted ${deletedCount} of ${itemsToDeleteIds.length} chats. ${errors.length} failed.`, {
          autoClose: 5000,
        });
      }

      await loadEntries();
      setSelectedItems([]);
      setSelectionMode(false);

      if (shouldNavigate) {
        window.location.pathname = '/';
      }
    },
    [deleteChat, loadEntries, db],
  );

  const closeDialog = () => setDialogContent(null);

  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);

    if (selectionMode) {
      setSelectedItems([]);
    }
  };

  const toggleItemSelection = useCallback((id: string) => {
    setSelectedItems((prev) => {
      return prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id];
    });
  }, []);

  const handleBulkDeleteClick = useCallback(() => {
    if (selectedItems.length === 0) {
      toast.info('Select at least one chat to delete');
      return;
    }

    const selectedChats = list.filter((item) => selectedItems.includes(item.id));

    if (selectedChats.length === 0) {
      toast.error('Could not find selected chats');
      return;
    }

    setDialogContent({ type: 'bulkDelete', items: selectedChats });
  }, [selectedItems, list]);

  const selectAll = useCallback(() => {
    const allFilteredIds = filteredList.map((item) => item.id);
    setSelectedItems((prev) => {
      const allFilteredAreSelected = allFilteredIds.length > 0 && allFilteredIds.every((id) => prev.includes(id));

      if (allFilteredAreSelected) {
        return prev.filter((id) => !allFilteredIds.includes(id));
      } else {
        return [...new Set([...prev, ...allFilteredIds])];
      }
    });
  }, [filteredList]);

  useEffect(() => {
    if (open) {
      loadEntries();
    }
  }, [open, loadEntries]);

  useEffect(() => {
    const enterThreshold = 40;
    const exitThreshold = 40;

    function onMouseMove(event: MouseEvent) {
      if (isSettingsOpen) {
        return;
      }

      if (event.pageX < enterThreshold) {
        setOpen(true);
      }

      if (menuRef.current && event.clientX > menuRef.current.getBoundingClientRect().right + exitThreshold) {
        setOpen(false);
      }
    }

    window.addEventListener('mousemove', onMouseMove);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, [isSettingsOpen]);

  const handleDuplicate = async (id: string) => {
    await duplicateCurrentChat(id);
    loadEntries();
  };

  const handleSettingsClick = () => {
    setIsSettingsOpen(true);
    setOpen(false);
  };

  const handleSettingsClose = () => {
    setIsSettingsOpen(false);
  };

  const setDialogContentWithLogging = useCallback((content: DialogContent) => {
    setDialogContent(content);
  }, []);

  return (
    <>
      <motion.div
        ref={menuRef}
        initial="closed"
        animate={open ? 'open' : 'closed'}
        variants={menuVariants}
        style={{ width: '300px' }}
        className={classNames(
          'flex flex-col fixed top-0 h-full cx-sidebar',
          isSettingsOpen ? 'z-40' : 'z-sidebar',
        )}
      >
        <div
          className="cx-sidebar-header h-14 flex items-center justify-between px-4"
        >
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-[7px] flex items-center justify-center text-xs"
              style={{
                background: 'var(--cx-accent-glow)',
                border: '1px solid var(--cx-border-medium)',
              }}
            >
              ⚡
            </div>
            <span
              className="text-sm font-semibold tracking-tight"
              style={{ color: 'var(--cx-text-primary)' }}
            >
              History
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-medium"
              style={{ color: 'var(--cx-text-muted)' }}
            >
              {profile?.username || 'Guest'}
            </span>
            <div
              className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0"
              style={{
                background: 'var(--cx-hover)',
                border: '1px solid var(--cx-border)',
              }}
            >
              {profile?.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile?.username || 'User'}
                  className="w-full h-full object-cover"
                  loading="eager"
                  decoding="sync"
                />
              ) : (
                <Icon name="user" size={14} style={{ color: 'var(--cx-text-muted)' }} />
              )}
            </div>
          </div>
        </div>

        <CurrentDateTime />

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-3 space-y-2">
            <div className="flex gap-2">
              <a
                href="/"
                className="flex-1 flex gap-2 items-center justify-center rounded-[10px] px-3 py-2 text-[13px] font-medium transition-all duration-200"
                style={{
                  background: 'var(--cx-accent-glow)',
                  border: '1px solid var(--cx-border-medium)',
                  color: 'var(--cx-accent-vivid)',
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--cx-accent-glow-strong)';
                  e.currentTarget.style.borderColor = 'var(--cx-border-strong)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--cx-accent-glow)';
                  e.currentTarget.style.borderColor = 'var(--cx-border-medium)';
                }}
              >
                <Icon name="plus-circle" size={14} />
                <span>New chat</span>
              </a>
              <button
                onClick={toggleSelectionMode}
                className="flex items-center justify-center rounded-[10px] px-2.5 py-2 transition-all duration-200"
                style={{
                  background: selectionMode ? 'var(--cx-accent-glow)' : 'var(--cx-hover)',
                  border: `1px solid ${selectionMode ? 'var(--cx-border-medium)' : 'var(--cx-border)'}`,
                  color: selectionMode ? 'var(--cx-accent-vivid)' : 'var(--cx-text-muted)',
                }}
                aria-label={selectionMode ? 'Exit selection mode' : 'Enter selection mode'}
              >
                <Icon name={selectionMode ? 'x' : 'check-square'} size={14} />
              </button>
            </div>

            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <Icon name="search" size={13} style={{ color: 'var(--cx-text-muted)' }} />
              </div>
              <input
                className="cx-search-input w-full pl-9 pr-3 py-2 rounded-[9px] text-[13px]"
                type="search"
                placeholder="Search sessions..."
                onChange={handleSearchChange}
                aria-label="Search chats"
                style={{ background: 'transparent' }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between px-4 pb-2">
            <span className="text-[11px] font-medium tracking-[0.05em] uppercase" style={{ color: 'var(--cx-text-muted)' }}>
              Sessions
            </span>
            {selectionMode && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={selectAll}
                  className="text-[11px] font-medium px-2 py-0.5 rounded-md transition-colors"
                  style={{ color: 'var(--cx-text-secondary)', background: 'var(--cx-hover)' }}
                >
                  {selectedItems.length === filteredList.length ? 'Deselect all' : 'Select all'}
                </button>
                <button
                  onClick={handleBulkDeleteClick}
                  disabled={selectedItems.length === 0}
                  className="text-[11px] font-medium px-2 py-0.5 rounded-md transition-colors disabled:opacity-40"
                  style={{ color: 'var(--bolt-elements-icon-error)', background: 'var(--bolt-elements-item-backgroundDanger)' }}
                >
                  Delete
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-2 pb-2 modern-scrollbar">
            {filteredList.length === 0 && (
              <div
                className="flex flex-col items-center justify-center py-12 px-4 text-center"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center mb-3"
                  style={{ background: 'var(--cx-hover)' }}
                >
                  <Icon name="chat" size={18} style={{ color: 'var(--cx-text-muted)' }} />
                </div>
                <p className="text-[12px] font-medium" style={{ color: 'var(--cx-text-muted)' }}>
                  {list.length === 0 ? 'No sessions yet' : 'No matches found'}
                </p>
                <p className="text-[11px] mt-1" style={{ color: 'var(--cx-text-muted)' }}>
                  {list.length === 0 ? 'Start a new conversation' : 'Try a different search'}
                </p>
              </div>
            )}

            <DialogRoot open={dialogContent !== null}>
              {binDates(filteredList).map(({ category, items }) => (
                <div key={category} className="mt-3 first:mt-1">
                  <div
                    className="text-[10px] font-semibold tracking-[0.08em] uppercase px-2 py-1 mb-1 sticky top-0"
                    style={{
                      color: 'var(--cx-text-muted)',
                      background: 'var(--cx-bg)',
                    }}
                  >
                    {category}
                  </div>
                  <div className="space-y-0.5">
                    {items.map((item) => (
                      <HistoryItem
                        key={item.id}
                        item={item}
                        exportChat={exportChat}
                        onDelete={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          setDialogContentWithLogging({ type: 'delete', item });
                        }}
                        onDuplicate={() => handleDuplicate(item.id)}
                        selectionMode={selectionMode}
                        isSelected={selectedItems.includes(item.id)}
                        onToggleSelection={toggleItemSelection}
                      />
                    ))}
                  </div>
                </div>
              ))}

              <Dialog onBackdrop={closeDialog} onClose={closeDialog}>
                {dialogContent?.type === 'delete' && (
                  <>
                    <div
                      className="p-5"
                      style={{ background: 'var(--cx-surface)' }}
                    >
                      <DialogTitle style={{ color: 'var(--cx-text-primary)', fontSize: '15px', fontWeight: 600 }}>
                        Delete session?
                      </DialogTitle>
                      <DialogDescription
                        className="mt-2"
                        style={{ color: 'var(--cx-text-secondary)', fontSize: '13px', lineHeight: 1.6 }}
                      >
                        <p>
                          This will permanently delete{' '}
                          <span style={{ color: 'var(--cx-text-primary)', fontWeight: 500 }}>
                            "{dialogContent.item.description}"
                          </span>
                          .
                        </p>
                      </DialogDescription>
                    </div>
                    <div
                      className="flex justify-end gap-2 px-5 py-4"
                      style={{
                        borderTop: '1px solid var(--cx-border)',
                        background: 'var(--cx-surface-raised)',
                      }}
                    >
                      <DialogButton type="secondary" onClick={closeDialog}>
                        Cancel
                      </DialogButton>
                      <DialogButton
                        type="danger"
                        onClick={(event) => {
                          deleteItem(event, dialogContent.item);
                          closeDialog();
                        }}
                      >
                        Delete
                      </DialogButton>
                    </div>
                  </>
                )}
                {dialogContent?.type === 'bulkDelete' && (
                  <>
                    <div
                      className="p-5"
                      style={{ background: 'var(--cx-surface)' }}
                    >
                      <DialogTitle style={{ color: 'var(--cx-text-primary)', fontSize: '15px', fontWeight: 600 }}>
                        Delete {dialogContent.items.length} sessions?
                      </DialogTitle>
                      <DialogDescription
                        className="mt-2"
                        style={{ color: 'var(--cx-text-secondary)', fontSize: '13px', lineHeight: 1.6 }}
                      >
                        <p>
                          This action cannot be undone. All selected sessions will be permanently removed.
                        </p>
                        <div
                          className="mt-3 max-h-32 overflow-auto rounded-[8px] p-2.5"
                          style={{ background: 'var(--cx-hover)', border: '1px solid var(--cx-border)' }}
                        >
                          <ul className="space-y-1">
                            {dialogContent.items.map((item) => (
                              <li key={item.id} className="text-[12px] flex items-center gap-2" style={{ color: 'var(--cx-text-secondary)' }}>
                                <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: 'var(--cx-text-muted)' }} />
                                {item.description}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </DialogDescription>
                    </div>
                    <div
                      className="flex justify-end gap-2 px-5 py-4"
                      style={{
                        borderTop: '1px solid var(--cx-border)',
                        background: 'var(--cx-surface-raised)',
                      }}
                    >
                      <DialogButton type="secondary" onClick={closeDialog}>
                        Cancel
                      </DialogButton>
                      <DialogButton
                        type="danger"
                        onClick={() => {
                          const itemsToDeleteNow = [...selectedItems];
                          deleteSelectedItems(itemsToDeleteNow);
                          closeDialog();
                        }}
                      >
                        Delete all
                      </DialogButton>
                    </div>
                  </>
                )}
              </Dialog>
            </DialogRoot>
          </div>

          <div
            className="flex items-center justify-between px-3 py-3"
            style={{ borderTop: '1px solid var(--cx-border)' }}
          >
            <SettingsButton onClick={handleSettingsClick} />
            <ThemeSwitch />
          </div>
        </div>
      </motion.div>

      <ControlPanel open={isSettingsOpen} onClose={handleSettingsClose} />
    </>
  );
};
