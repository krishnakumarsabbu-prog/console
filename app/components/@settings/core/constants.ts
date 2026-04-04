import type { TabType } from './types';

export const TAB_ICONS: Record<TabType, string> = {
  profile: 'user-circle',
  settings: 'settings',
  notifications: 'bell',
  features: 'star',
  data: 'database',
  'cloud-providers': 'cloud',
  'local-providers': 'monitor',
  'service-status': 'activity',
  connection: 'wifi',
  debug: 'bug',
  'event-logs': 'list',
  update: 'refresh-cw',
  'task-manager': 'line-chart',
  'tab-management': 'layout-grid',
};

export const TAB_LABELS: Record<TabType, string> = {
  profile: 'Profile',
  settings: 'Settings',
  notifications: 'Notifications',
  features: 'Features',
  data: 'Data Management',
  'cloud-providers': 'Cloud Providers',
  'local-providers': 'Local Providers',
  'service-status': 'Service Status',
  connection: 'Connection',
  debug: 'Debug',
  'event-logs': 'Event Logs',
  update: 'Updates',
  'task-manager': 'Task Manager',
  'tab-management': 'Tab Management',
};

export const TAB_DESCRIPTIONS: Record<TabType, string> = {
  profile: 'Manage your profile and account settings',
  settings: 'Configure application preferences',
  notifications: 'View and manage your notifications',
  features: 'Explore new and upcoming features',
  data: 'Manage your data and storage',
  'cloud-providers': 'Configure cloud AI providers and API keys',
  'local-providers': 'Configure local AI providers and models',
  'service-status': 'Monitor cloud LLM service status',
  connection: 'Check connection status and settings',
  debug: 'Debug tools and system information',
  'event-logs': 'View system events and logs',
  update: 'Check for updates and release notes',
  'task-manager': 'Monitor system resources and processes',
  'tab-management': 'Configure visible tabs and their order',
};

export const DEFAULT_TAB_CONFIG = [
  // User Window Tabs (Always visible by default)
  { id: 'features', visible: true, window: 'user' as const, order: 0 },
  { id: 'data', visible: true, window: 'user' as const, order: 1 },
  { id: 'cloud-providers', visible: true, window: 'user' as const, order: 2 },
  { id: 'local-providers', visible: true, window: 'user' as const, order: 3 },
  { id: 'connection', visible: true, window: 'user' as const, order: 4 },
  { id: 'notifications', visible: true, window: 'user' as const, order: 5 },
  { id: 'event-logs', visible: true, window: 'user' as const, order: 6 },
  { id: 'profile', visible: false, window: 'user' as const, order: 6 },
  { id: 'settings', visible: false, window: 'user' as const, order: 7 },
  { id: 'task-manager', visible: false, window: 'user' as const, order: 8 },
  { id: 'service-status', visible: false, window: 'user' as const, order: 9 },
  { id: 'debug', visible: false, window: 'user' as const, order: 10 },
  { id: 'update', visible: false, window: 'user' as const, order: 11 },

  // Developer Window Tabs (All visible by default)
  { id: 'features', visible: true, window: 'developer' as const, order: 0 },
  { id: 'data', visible: true, window: 'developer' as const, order: 1 },
  { id: 'cloud-providers', visible: true, window: 'developer' as const, order: 2 },
  { id: 'local-providers', visible: true, window: 'developer' as const, order: 3 },
  { id: 'connection', visible: true, window: 'developer' as const, order: 4 },
  { id: 'notifications', visible: true, window: 'developer' as const, order: 5 },
  { id: 'event-logs', visible: true, window: 'developer' as const, order: 6 },
  { id: 'profile', visible: true, window: 'developer' as const, order: 6 },
  { id: 'settings', visible: true, window: 'developer' as const, order: 7 },
  { id: 'task-manager', visible: true, window: 'developer' as const, order: 8 },
  { id: 'service-status', visible: true, window: 'developer' as const, order: 9 },
  { id: 'debug', visible: true, window: 'developer' as const, order: 10 },
  { id: 'update', visible: true, window: 'developer' as const, order: 11 },
];
