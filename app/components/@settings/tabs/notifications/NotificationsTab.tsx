import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { logStore } from '~/lib/stores/logs';
import { useNanoStore } from '~/lib/hooks/useNanoStore';
import { formatDistanceToNow } from 'date-fns';
import { classNames } from '~/utils/classNames';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Icon } from '~/components/ui/Icon';

interface NotificationDetails {
  type?: string;
  message?: string;
  currentVersion?: string;
  latestVersion?: string;
  branch?: string;
  updateUrl?: string;
}

type FilterType = 'all' | 'system' | 'error' | 'warning' | 'update' | 'info' | 'provider' | 'network';

const NotificationsTab = () => {
  const [filter, setFilter] = useState<FilterType>('all');
  const logs = useNanoStore(logStore.logs);

  useEffect(() => {
    const startTime = performance.now();

    return () => {
      const duration = performance.now() - startTime;
      logStore.logPerformanceMetric('NotificationsTab', 'mount-duration', duration);
    };
  }, []);

  const handleClearNotifications = () => {
    const count = Object.keys(logs).length;
    logStore.logInfo('Cleared notifications', {
      type: 'notification_clear',
      message: `Cleared ${count} notifications`,
      clearedCount: count,
      component: 'notifications',
    });
    logStore.clearLogs();
  };

  const handleUpdateAction = (updateUrl: string) => {
    logStore.logInfo('Update link clicked', {
      type: 'update_click',
      message: 'User clicked update link',
      updateUrl,
      component: 'notifications',
    });
    window.open(updateUrl, '_blank');
  };

  const handleFilterChange = (newFilter: FilterType) => {
    logStore.logInfo('Notification filter changed', {
      type: 'filter_change',
      message: `Filter changed to ${newFilter}`,
      previousFilter: filter,
      newFilter,
      component: 'notifications',
    });
    setFilter(newFilter);
  };

  const filteredLogs = Object.values(logs)
    .filter((log) => {
      if (filter === 'all') {
        return true;
      }

      if (filter === 'update') {
        return log.details?.type === 'update';
      }

      if (filter === 'system') {
        return log.category === 'system';
      }

      if (filter === 'provider') {
        return log.category === 'provider';
      }

      if (filter === 'network') {
        return log.category === 'network';
      }

      return log.level === filter;
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const getNotificationStyle = (level: string, type?: string) => {
    if (type === 'update') {
      return {
        icon: 'arrow-up-circle',
        color: 'text-bolt-elements-item-contentAccent',
        bg: 'hover:bg-bolt-elements-item-backgroundAccent/10',
      };
    }

    switch (level) {
      case 'error':
        return {
          icon: 'alert-circle',
          color: 'text-bolt-elements-item-contentDanger',
          bg: 'hover:bg-bolt-elements-item-backgroundDanger/10',
        };
      case 'warning':
        return {
          icon: 'alert-triangle',
          color: 'text-bolt-elements-item-contentWarning',
          bg: 'hover:bg-bolt-elements-item-backgroundWarning/10',
        };
      case 'info':
        return {
          icon: 'info',
          color: 'text-bolt-elements-item-contentInfo',
          bg: 'hover:bg-bolt-elements-item-backgroundInfo/10',
        };
      default:
        return {
          icon: 'bell',
          color: 'text-bolt-elements-textSecondary',
          bg: 'hover:bg-bolt-elements-item-backgroundActive',
        };
    }
  };

  const renderNotificationDetails = (details: NotificationDetails) => {
    if (details.type === 'update') {
      return (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-bolt-elements-textSecondary">{details.message}</p>
          <div className="flex flex-col gap-1 text-xs text-bolt-elements-textTertiary">
            <p>Current Version: {details.currentVersion}</p>
            <p>Latest Version: {details.latestVersion}</p>
            <p>Branch: {details.branch}</p>
          </div>
          <button
            onClick={() => details.updateUrl && handleUpdateAction(details.updateUrl)}
            className={classNames(
              'mt-2 inline-flex items-center gap-2',
              'rounded-lg px-3 py-1.5',
              'text-sm font-medium',
              'bg-bolt-elements-background-depth-3',
              'border border-bolt-elements-borderColor',
              'text-bolt-elements-textPrimary',
              'hover:bg-bolt-elements-item-backgroundActive',
              'transition-all duration-200',
            )}
          >
            <Icon name="git-branch" className="text-lg" />
            View Changes
          </button>
        </div>
      );
    }

    return details.message ? <p className="text-sm text-bolt-elements-textSecondary">{details.message}</p> : null;
  };

  const filterOptions: { id: FilterType; label: string; icon: string; colorClass: string }[] = [
    { id: 'all', label: 'All Notifications', icon: 'bell', colorClass: 'text-bolt-elements-item-contentAccent' },
    { id: 'system', label: 'System', icon: 'settings', colorClass: 'text-bolt-elements-textTertiary' },
    { id: 'update', label: 'Updates', icon: 'arrow-up-circle', colorClass: 'text-bolt-elements-item-contentAccent' },
    { id: 'error', label: 'Errors', icon: 'alert-circle', colorClass: 'text-bolt-elements-item-contentDanger' },
    { id: 'warning', label: 'Warnings', icon: 'alert-triangle', colorClass: 'text-bolt-elements-item-contentWarning' },
    { id: 'info', label: 'Information', icon: 'info', colorClass: 'text-bolt-elements-item-contentInfo' },
    { id: 'provider', label: 'Providers', icon: 'bot', colorClass: 'text-bolt-elements-item-contentSuccess' },
    { id: 'network', label: 'Network', icon: 'wifi', colorClass: 'text-bolt-elements-item-contentAccent' },
  ];

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex items-center justify-between">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              className={classNames(
                'flex items-center gap-2',
                'rounded-lg px-3 py-1.5',
                'text-sm text-bolt-elements-textPrimary',
                'bg-bolt-elements-background-depth-2',
                'border border-bolt-elements-borderColor',
                'hover:bg-bolt-elements-background-depth-3',
                'transition-all duration-200',
              )}
            >
              <Icon
                name={(filterOptions.find((opt) => opt.id === filter)?.icon as any) || 'filter'}
                className={classNames('text-lg', filterOptions.find((opt) => opt.id === filter)?.colorClass)}
              />
              {filterOptions.find((opt) => opt.id === filter)?.label || 'Filter Notifications'}
              <Icon name="chevron-down" className="text-lg text-bolt-elements-textTertiary" />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="min-w-[200px] bg-bolt-elements-background-depth-2 rounded-lg shadow-lg py-1 z-[250] animate-in fade-in-0 zoom-in-95 border border-bolt-elements-borderColor"
              sideOffset={5}
              align="start"
              side="bottom"
            >
              {filterOptions.map((option) => (
                <DropdownMenu.Item
                  key={option.id}
                  className="group flex items-center px-4 py-2.5 text-sm text-bolt-elements-textPrimary hover:bg-bolt-elements-item-backgroundActive cursor-pointer transition-colors"
                  onClick={() => handleFilterChange(option.id)}
                >
                  <div className="mr-3 flex h-5 w-5 items-center justify-center">
                    <Icon
                      name={option.icon as any}
                      className={classNames('text-lg group-hover:text-bolt-elements-item-contentAccent transition-colors', option.colorClass)}
                    />
                  </div>
                  <span className="group-hover:text-bolt-elements-item-contentAccent transition-colors">{option.label}</span>
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        <button
          onClick={handleClearNotifications}
          className={classNames(
            'group flex items-center gap-2',
            'rounded-lg px-3 py-1.5',
            'text-sm text-bolt-elements-textPrimary',
            'bg-bolt-elements-background-depth-2',
            'border border-bolt-elements-borderColor',
            'hover:bg-bolt-elements-background-depth-3',
            'transition-all duration-200',
          )}
        >
          <Icon name="trash" className="text-lg text-bolt-elements-textTertiary group-hover:text-bolt-elements-item-contentAccent transition-colors" />
          Clear All
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {filteredLogs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={classNames(
              'flex flex-col items-center justify-center gap-4',
              'rounded-lg p-8 text-center',
              'bg-bolt-elements-background-depth-2',
              'border border-bolt-elements-borderColor',
            )}
          >
            <Icon name="bell-off" className="text-4xl text-bolt-elements-textTertiary" />
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-medium text-bolt-elements-textPrimary">No Notifications</h3>
              <p className="text-sm text-bolt-elements-textSecondary">You're all caught up!</p>
            </div>
          </motion.div>
        ) : (
          filteredLogs.map((log) => {
            const style = getNotificationStyle(log.level, log.details?.type);
            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={classNames(
                  'flex flex-col gap-2',
                  'rounded-lg p-4',
                  'bg-bolt-elements-background-depth-2',
                  'border border-bolt-elements-borderColor',
                  style.bg,
                  'transition-all duration-200',
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <Icon name={style.icon as any} className={classNames('text-lg', style.color)} />
                    <div className="flex flex-col gap-1">
                      <h3 className="text-sm font-medium text-bolt-elements-textPrimary">{log.message}</h3>
                      {log.details && renderNotificationDetails(log.details as NotificationDetails)}
                      <p className="text-xs text-bolt-elements-textTertiary">
                        Category: {log.category}
                        {log.subCategory ? ` > ${log.subCategory}` : ''}
                      </p>
                    </div>
                  </div>
                  <time className="shrink-0 text-xs text-bolt-elements-textTertiary">
                    {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                  </time>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default NotificationsTab;
