import type { ProviderInfo } from '~/types/model';
import { useEffect, useState, useRef } from 'react';
import type { KeyboardEvent } from 'react';
import type { ModelInfo } from '~/lib/modules/llm/types';
import { classNames } from '~/utils/classNames';
import { Icon } from '~/components/ui/Icon';

interface ModelSelectorProps {
  model?: string;
  setModel?: (model: string) => void;
  provider?: ProviderInfo;
  setProvider?: (provider: ProviderInfo) => void;
  modelList: ModelInfo[];
  providerList: ProviderInfo[];
  apiKeys: Record<string, string>;
  modelLoading?: string;
}

export const ModelSelector = ({
  model,
  setModel,
  provider,
  setProvider,
  modelList,
  providerList,
  modelLoading,
}: ModelSelectorProps) => {
  const [modelSearchQuery, setModelSearchQuery] = useState('');
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [focusedModelIndex, setFocusedModelIndex] = useState(-1);
  const modelSearchInputRef = useRef<HTMLInputElement>(null);
  const modelOptionsRef = useRef<(HTMLDivElement | null)[]>([]);
  const modelDropdownRef = useRef<HTMLDivElement>(null);
  const [providerSearchQuery, setProviderSearchQuery] = useState('');
  const [isProviderDropdownOpen, setIsProviderDropdownOpen] = useState(false);
  const [focusedProviderIndex, setFocusedProviderIndex] = useState(-1);
  const providerSearchInputRef = useRef<HTMLInputElement>(null);
  const providerOptionsRef = useRef<(HTMLDivElement | null)[]>([]);
  const providerDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(event.target as Node)) {
        setIsModelDropdownOpen(false);
        setModelSearchQuery('');
      }
      if (providerDropdownRef.current && !providerDropdownRef.current.contains(event.target as Node)) {
        setIsProviderDropdownOpen(false);
        setProviderSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredModels = [...modelList]
    .filter((e) => e.provider === provider?.name && e.name)
    .filter(
      (m) =>
        m.label.toLowerCase().includes(modelSearchQuery.toLowerCase()) ||
        m.name.toLowerCase().includes(modelSearchQuery.toLowerCase()),
    );

  const filteredProviders = providerList.filter((p) =>
    p.name.toLowerCase().includes(providerSearchQuery.toLowerCase()),
  );

  useEffect(() => { setFocusedModelIndex(-1); }, [modelSearchQuery, isModelDropdownOpen]);
  useEffect(() => { setFocusedProviderIndex(-1); }, [providerSearchQuery, isProviderDropdownOpen]);
  useEffect(() => { if (isModelDropdownOpen && modelSearchInputRef.current) modelSearchInputRef.current.focus(); }, [isModelDropdownOpen]);
  useEffect(() => { if (isProviderDropdownOpen && providerSearchInputRef.current) providerSearchInputRef.current.focus(); }, [isProviderDropdownOpen]);

  const handleModelKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!isModelDropdownOpen) return;
    switch (e.key) {
      case 'ArrowDown': e.preventDefault(); setFocusedModelIndex((p) => (p + 1 >= filteredModels.length ? 0 : p + 1)); break;
      case 'ArrowUp': e.preventDefault(); setFocusedModelIndex((p) => (p - 1 < 0 ? filteredModels.length - 1 : p - 1)); break;
      case 'Enter':
        e.preventDefault();
        if (focusedModelIndex >= 0 && focusedModelIndex < filteredModels.length) {
          setModel?.(filteredModels[focusedModelIndex].name);
          setIsModelDropdownOpen(false);
          setModelSearchQuery('');
        }
        break;
      case 'Escape': e.preventDefault(); setIsModelDropdownOpen(false); setModelSearchQuery(''); break;
    }
  };

  const handleProviderKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!isProviderDropdownOpen) return;
    switch (e.key) {
      case 'ArrowDown': e.preventDefault(); setFocusedProviderIndex((p) => (p + 1 >= filteredProviders.length ? 0 : p + 1)); break;
      case 'ArrowUp': e.preventDefault(); setFocusedProviderIndex((p) => (p - 1 < 0 ? filteredProviders.length - 1 : p - 1)); break;
      case 'Enter':
        e.preventDefault();
        if (focusedProviderIndex >= 0 && focusedProviderIndex < filteredProviders.length) {
          const sel = filteredProviders[focusedProviderIndex];
          if (setProvider) {
            setProvider(sel);
            const first = modelList.find((m) => m.provider === sel.name);
            if (first && setModel) setModel(first.name);
          }
          setIsProviderDropdownOpen(false);
          setProviderSearchQuery('');
        }
        break;
      case 'Escape': e.preventDefault(); setIsProviderDropdownOpen(false); setProviderSearchQuery(''); break;
    }
  };

  useEffect(() => {
    if (focusedModelIndex >= 0 && modelOptionsRef.current[focusedModelIndex]) {
      modelOptionsRef.current[focusedModelIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [focusedModelIndex]);

  useEffect(() => {
    if (focusedProviderIndex >= 0 && providerOptionsRef.current[focusedProviderIndex]) {
      providerOptionsRef.current[focusedProviderIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [focusedProviderIndex]);

  useEffect(() => {
    if (providerList.length === 0) return;
    if (provider && !providerList.some((p) => p.name === provider.name)) {
      const first = providerList[0];
      setProvider?.(first);
      const firstModel = modelList.find((m) => m.provider === first.name);
      if (firstModel) setModel?.(firstModel.name);
    }
  }, [providerList, provider, setProvider, modelList, setModel]);

  if (providerList.length === 0) {
    return (
      <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'color-mix(in srgb, var(--cx-text-primary), transparent 96%)', color: 'var(--cx-text-secondary)', fontSize: '13px', textAlign: 'center' }}>
        No providers enabled. Enable at least one provider in settings to use the chat.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: '8px', flexDirection: 'row' }}>
      {/* ─── PROVIDER SELECTOR ─── */}
      <div
        ref={providerDropdownRef}
        onKeyDown={handleProviderKeyDown}
        style={{ position: 'relative', flex: '0 0 auto', minWidth: '120px' }}
      >
        <button
          role="combobox"
          aria-expanded={isProviderDropdownOpen}
          aria-haspopup="listbox"
          tabIndex={0}
          onClick={() => setIsProviderDropdownOpen(!isProviderDropdownOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '6px',
            width: '100%',
            background: 'color-mix(in srgb, var(--cx-text-primary), transparent 94%)',
            border: 'none',
            borderRadius: '10px',
            padding: '7px 10px',
            cursor: 'pointer',
            color: 'var(--cx-text-primary)',
            fontSize: '13px',
            fontWeight: 500,
            letterSpacing: '-0.01em',
            fontFamily: '-apple-system, BlinkMacSystemFont, system-ui, sans-serif',
            transition: 'background 0.15s ease',
            outline: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{provider?.name || 'Provider'}</span>
          <Icon
            name="caret-down"
            className={classNames('transition-transform', isProviderDropdownOpen ? 'rotate-180' : '')}
            style={{ flexShrink: 0, opacity: 0.5, fontSize: '12px' }}
          />
        </button>

        {isProviderDropdownOpen && (
          <SelectorDropdown
            onClose={() => { setIsProviderDropdownOpen(false); setProviderSearchQuery(''); }}
          >
            <DropdownSearch
              ref={providerSearchInputRef}
              value={providerSearchQuery}
              onChange={setProviderSearchQuery}
              placeholder="Search providers..."
            />
            <DropdownList>
              {filteredProviders.length === 0
                ? <DropdownEmpty>No providers found</DropdownEmpty>
                : filteredProviders.map((p, index) => (
                  <div
                    key={p.name}
                    ref={(el) => (providerOptionsRef.current[index] = el)}
                    role="option"
                    aria-selected={provider?.name === p.name}
                    tabIndex={focusedProviderIndex === index ? 0 : -1}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (setProvider) {
                        setProvider(p);
                        const first = modelList.find((m) => m.provider === p.name);
                        if (first && setModel) setModel(first.name);
                      }
                      setIsProviderDropdownOpen(false);
                      setProviderSearchQuery('');
                    }}
                    style={{
                      padding: '7px 12px',
                      fontSize: '13px',
                      cursor: 'pointer',
                      color: 'var(--cx-text-primary)',
                      fontWeight: provider?.name === p.name ? 500 : 400,
                      background: (provider?.name === p.name || focusedProviderIndex === index)
                        ? 'color-mix(in srgb, var(--cx-accent-vivid), transparent 92%)'
                        : 'transparent',
                      borderRadius: '6px',
                      margin: '0 4px',
                      transition: 'background 0.1s ease',
                      letterSpacing: '-0.01em',
                    }}
                    onMouseEnter={(e) => {
                      if (provider?.name !== p.name && focusedProviderIndex !== index) {
                        (e.currentTarget as HTMLElement).style.background = 'color-mix(in srgb, var(--cx-text-primary), transparent 94%)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (provider?.name !== p.name && focusedProviderIndex !== index) {
                        (e.currentTarget as HTMLElement).style.background = 'transparent';
                      }
                    }}
                  >
                    {p.name}
                  </div>
                ))}
            </DropdownList>
          </SelectorDropdown>
        )}
      </div>

      {/* ─── MODEL SELECTOR ─── */}
      <div
        ref={modelDropdownRef}
        onKeyDown={handleModelKeyDown}
        style={{ position: 'relative', flex: 1, minWidth: 0 }}
      >
        <button
          role="combobox"
          aria-expanded={isModelDropdownOpen}
          aria-haspopup="listbox"
          tabIndex={0}
          onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '6px',
            width: '100%',
            background: 'color-mix(in srgb, var(--cx-text-primary), transparent 94%)',
            border: 'none',
            borderRadius: '10px',
            padding: '7px 10px',
            cursor: 'pointer',
            color: 'var(--cx-text-primary)',
            fontSize: '13px',
            fontWeight: 500,
            letterSpacing: '-0.01em',
            fontFamily: '-apple-system, BlinkMacSystemFont, system-ui, sans-serif',
            transition: 'background 0.15s ease',
            outline: 'none',
          }}
        >
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
            {modelList.find((m) => m.name === model)?.label || 'Select model'}
          </span>
          <Icon
            name="caret-down"
            className={classNames('transition-transform', isModelDropdownOpen ? 'rotate-180' : '')}
            style={{ flexShrink: 0, opacity: 0.5, fontSize: '12px' }}
          />
        </button>

        {isModelDropdownOpen && (
          <SelectorDropdown
            onClose={() => { setIsModelDropdownOpen(false); setModelSearchQuery(''); }}
          >
            <DropdownSearch
              ref={modelSearchInputRef}
              value={modelSearchQuery}
              onChange={setModelSearchQuery}
              placeholder="Search models..."
            />
            <DropdownList>
              {modelLoading === 'all' || modelLoading === provider?.name
                ? <DropdownEmpty>Loading models...</DropdownEmpty>
                : filteredModels.length === 0
                  ? <DropdownEmpty>No models found</DropdownEmpty>
                  : filteredModels.map((m, index) => (
                    <div
                      key={index}
                      ref={(el) => (modelOptionsRef.current[index] = el)}
                      role="option"
                      aria-selected={model === m.name}
                      tabIndex={focusedModelIndex === index ? 0 : -1}
                      onClick={(e) => {
                        e.stopPropagation();
                        setModel?.(m.name);
                        setIsModelDropdownOpen(false);
                        setModelSearchQuery('');
                      }}
                      style={{
                        padding: '7px 12px',
                        fontSize: '13px',
                        cursor: 'pointer',
                        color: 'var(--cx-text-primary)',
                        fontWeight: model === m.name ? 500 : 400,
                        background: (model === m.name || focusedModelIndex === index)
                          ? 'color-mix(in srgb, var(--cx-accent-vivid), transparent 92%)'
                          : 'transparent',
                        borderRadius: '6px',
                        margin: '0 4px',
                        transition: 'background 0.1s ease',
                        letterSpacing: '-0.01em',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                      onMouseEnter={(e) => {
                        if (model !== m.name && focusedModelIndex !== index) {
                          (e.currentTarget as HTMLElement).style.background = 'color-mix(in srgb, var(--cx-text-primary), transparent 94%)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (model !== m.name && focusedModelIndex !== index) {
                          (e.currentTarget as HTMLElement).style.background = 'transparent';
                        }
                      }}
                    >
                      {m.label}
                    </div>
                  ))}
            </DropdownList>
          </SelectorDropdown>
        )}
      </div>
    </div>
  );
};

function SelectorDropdown({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 'calc(100% + 6px)',
        left: 0,
        right: 0,
        zIndex: 50,
        background: 'var(--cx-surface)',
        borderRadius: '14px',
        boxShadow: [
          '0 0 0 1px color-mix(in srgb, var(--cx-text-primary), transparent 90%)',
          '0 12px 40px -8px rgba(0,0,0,0.28)',
          '0 4px 12px rgba(0,0,0,0.12)',
        ].join(', '),
        backdropFilter: 'blur(24px) saturate(1.5)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.5)',
        overflow: 'hidden',
        animation: 'selector-in 0.18s cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      {children}
    </div>
  );
}

import { forwardRef } from 'react';

const DropdownSearch = forwardRef<HTMLInputElement, { value: string; onChange: (v: string) => void; placeholder: string }>(
  ({ value, onChange, placeholder }, ref) => (
    <div style={{ padding: '10px 10px 6px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'color-mix(in srgb, var(--cx-text-primary), transparent 94%)',
          borderRadius: '8px',
          padding: '6px 10px',
        }}
      >
        <Icon name="search" style={{ color: 'var(--cx-text-muted)', fontSize: '12px', flexShrink: 0 }} />
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          onClick={(e) => e.stopPropagation()}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontSize: '12px',
            color: 'var(--cx-text-primary)',
            fontFamily: '-apple-system, BlinkMacSystemFont, system-ui, sans-serif',
          }}
        />
      </div>
    </div>
  ),
);

function DropdownList({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        maxHeight: '200px',
        overflowY: 'auto',
        padding: '4px 0 8px',
        scrollbarWidth: 'thin',
      }}
    >
      {children}
    </div>
  );
}

function DropdownEmpty({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: '10px 14px', fontSize: '12px', color: 'var(--cx-text-muted)', textAlign: 'center' }}>
      {children}
    </div>
  );
}
