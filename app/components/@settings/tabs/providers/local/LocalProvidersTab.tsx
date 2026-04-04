import React, { useEffect, useState } from 'react';
import { Switch } from '~/components/ui/Switch';
import { useSettings } from '~/lib/hooks/useSettings';
import { LOCAL_PROVIDERS } from '~/lib/stores/settings';
import type { IProviderConfig } from '~/types/model';
import { useToast } from '~/components/ui/use-toast';
import { Icon } from '~/components/ui/Icon';

export default function LocalProvidersTab() {
  const { providers, updateProviderSettings } = useSettings();
  const [filteredProviders, setFilteredProviders] = useState<IProviderConfig[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const newFilteredProviders = Object.entries(providers || {})
      .filter(([key]) => LOCAL_PROVIDERS.includes(key))
      .map(
        ([key, value]) =>
          ({
            ...value,
            name: key,
          }) as IProviderConfig,
      );

    setFilteredProviders(newFilteredProviders);
  }, [providers]);

  const handleToggleProvider = (provider: IProviderConfig, enabled: boolean) => {
    updateProviderSettings(provider.name, {
      ...provider.settings,
      enabled,
    });
    toast(enabled ? `${provider.name} enabled` : `${provider.name} disabled`);
  };

  const handleUpdateBaseUrl = (provider: IProviderConfig, newBaseUrl: string) => {
    updateProviderSettings(provider.name, {
      ...provider.settings,
      baseUrl: newBaseUrl,
    });
  };

  const handleUpdateModels = (provider: IProviderConfig, newModels: string) => {
    updateProviderSettings(provider.name, {
      ...provider.settings,
      models: newModels,
    });
  };

  return (
    <div className="rounded-lg bg-bolt-elements-background text-bolt-elements-textPrimary p-4">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 border-b border-bolt-elements-borderColor pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-bolt-elements-item-backgroundAccent/10 text-bolt-elements-item-contentAccent">
              <Icon name="zap" className="text-xl" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-bolt-elements-textPrimary">Local Providers</h2>
              <p className="text-sm text-bolt-elements-textSecondary">Configure your local Tachyon provider</p>
            </div>
          </div>
        </div>

        {filteredProviders.map((provider) => (
          <div
            key={provider.name}
            className="bg-bolt-elements-background-depth-2 rounded-xl p-5 border border-bolt-elements-borderColor"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Icon name="zap" className="text-2xl text-bolt-elements-item-contentAccent" />
                <h3 className="text-md font-semibold text-bolt-elements-textPrimary">{provider.name}</h3>
              </div>
              <Switch
                checked={provider.settings.enabled}
                onCheckedChange={(checked) => handleToggleProvider(provider, checked)}
              />
            </div>

            {provider.settings.enabled && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-bolt-elements-textSecondary">Base URL</label>
                  <input
                    type="text"
                    value={provider.settings.baseUrl || ''}
                    onChange={(e) => handleUpdateBaseUrl(provider, e.target.value)}
                    placeholder="Enter Base URL (e.g. http://localhost:8000)"
                    className="w-full px-3 py-2 rounded-lg text-sm bg-bolt-elements-background-depth-3 border border-bolt-elements-borderColor focus:outline-none focus:ring-2 focus:ring-bolt-elements-item-backgroundAccent/30"
                  />
                  <p className="text-xs text-bolt-elements-textTertiary">
                    Default: Integrates with internal python_bridge.py if empty.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-bolt-elements-textSecondary">
                    Models (Comma Separated)
                  </label>
                  <input
                    type="text"
                    value={provider.settings.models || ''}
                    onChange={(e) => handleUpdateModels(provider, e.target.value)}
                    placeholder="e.g. llama3, mistral, gpt2"
                    className="w-full px-3 py-2 rounded-lg text-sm bg-bolt-elements-background-depth-3 border border-bolt-elements-borderColor focus:outline-none focus:ring-2 focus:ring-bolt-elements-item-backgroundAccent/30"
                  />
                  <p className="text-xs text-bolt-elements-textTertiary">
                    List the models your Tachyon server supports. These will appear in the model selector.
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}

        {filteredProviders.length === 0 && (
          <div className="text-center text-bolt-elements-textSecondary py-4">
            No local providers configured. Check that Tachyon is registered in the settings.
          </div>
        )}
      </div>
    </div>
  );
}
