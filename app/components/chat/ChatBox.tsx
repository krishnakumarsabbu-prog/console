import React from 'react';
import { ClientOnly } from '../../../src/utils/ClientOnly';
import { classNames } from '~/utils/classNames';
import { PROVIDER_LIST } from '~/utils/constants';
import { ModelSelector } from '~/components/chat/ModelSelector';
import { APIKeyManager } from './APIKeyManager';
import { LOCAL_PROVIDERS } from '~/lib/stores/settings';
import FilePreview from './FilePreview';
import { ScreenshotStateManager } from './ScreenshotStateManager';
import { SendButton } from './SendButton.client';
import { Icon } from '~/components/ui/Icon';
import { toast } from 'react-toastify';
import { SpeechRecognitionButton } from '~/components/chat/SpeechRecognition';
import { ExpoQrModal } from '~/components/workbench/ExpoQrModal';
import styles from './BaseChat.module.scss';
import type { ProviderInfo } from '~/types/model';
import type { DesignScheme } from '~/types/design-scheme';
import type { ElementInfo } from '~/components/workbench/Inspector';
import { ColorSchemeDialog } from '../ui/ColorSchemeDialog';

interface ChatBoxProps {
  isModelSettingsCollapsed: boolean;
  setIsModelSettingsCollapsed: (collapsed: boolean) => void;
  provider: any;
  providerList: any[];
  modelList: any[];
  apiKeys: Record<string, string>;
  isModelLoading: string | undefined;
  onApiKeysChange: (providerName: string, apiKey: string) => void;
  uploadedFiles: File[];
  imageDataList: string[];
  textareaRef: React.RefObject<HTMLTextAreaElement> | undefined;
  input: string;
  handlePaste: (e: React.ClipboardEvent) => void;
  TEXTAREA_MIN_HEIGHT: number;
  TEXTAREA_MAX_HEIGHT: number;
  isStreaming: boolean;
  handleSendMessage: (event: React.UIEvent, messageInput?: string) => void;
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  chatStarted: boolean;
  exportChat?: () => void;
  qrModalOpen: boolean;
  setQrModalOpen: (open: boolean) => void;
  handleFileUpload: () => void;
  setProvider?: ((provider: ProviderInfo) => void) | undefined;
  model?: string | undefined;
  setModel?: ((model: string) => void) | undefined;
  setUploadedFiles?: ((files: File[]) => void) | undefined;
  setImageDataList?: ((dataList: string[]) => void) | undefined;
  handleInputChange?: ((event: React.ChangeEvent<HTMLTextAreaElement>) => void) | undefined;
  handleStop?: (() => void) | undefined;
  enhancingPrompt?: boolean | undefined;
  enhancePrompt?: (() => void) | undefined;
  onWebSearchResult?: (result: string) => void;
  chatMode?: 'discuss' | 'build';
  setChatMode?: (mode: 'discuss' | 'build') => void;
  designScheme?: DesignScheme;
  setDesignScheme?: (scheme: DesignScheme) => void;
  selectedElement?: ElementInfo | null;
  setSelectedElement?: ((element: ElementInfo | null) => void) | undefined;
}

export const ChatBox: React.FC<ChatBoxProps> = (props) => {
  const hasContent = props.input.length > 0 || props.isStreaming || props.uploadedFiles.length > 0;

  return (
    <div className={classNames('relative w-full max-w-chat mx-auto z-prompt cx-composer')} style={{ padding: '0 0 8px' }}>
      <div className="hidden">
        <svg className={classNames(styles.PromptEffectContainer)}>
          <defs>
            <linearGradient id="line-gradient" x1="20%" y1="0%" x2="-14%" y2="10%" gradientUnits="userSpaceOnUse" gradientTransform="rotate(-45)">
              <stop offset="0%" stopColor="var(--cx-accent-vivid)" stopOpacity="0%" />
              <stop offset="40%" stopColor="var(--cx-accent-vivid)" stopOpacity="80%" />
              <stop offset="50%" stopColor="var(--cx-accent-primary)" stopOpacity="80%" />
              <stop offset="100%" stopColor="var(--cx-accent-primary)" stopOpacity="0%" />
            </linearGradient>
            <linearGradient id="shine-gradient">
              <stop offset="0%" stopColor="white" stopOpacity="0%" />
              <stop offset="40%" stopColor="#ffffff" stopOpacity="80%" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="80%" />
              <stop offset="100%" stopColor="white" stopOpacity="0%" />
            </linearGradient>
          </defs>
          <rect className={classNames(styles.PromptEffectLine)} pathLength="100" strokeLinecap="round" />
          <rect className={classNames(styles.PromptShine)} x="48" y="24" width="70" height="1" />
        </svg>
      </div>

      {/* ─── FLOATING COMPOSER SHELL ─── */}
      <div
        className="cx-composer-shell"
        style={{
          background: 'var(--cx-surface)',
          borderRadius: '20px',
          boxShadow: [
            '0 0 0 1px color-mix(in srgb, var(--cx-text-primary), transparent 92%)',
            '0 8px 32px -8px rgba(0,0,0,0.22)',
            '0 2px 8px rgba(0,0,0,0.10)',
            'inset 0 1px 0 color-mix(in srgb, white, transparent 86%)',
          ].join(', '),
          backdropFilter: 'blur(20px) saturate(1.5)',
          WebkitBackdropFilter: 'blur(20px) saturate(1.5)',
          transition: 'box-shadow 0.25s ease',
          overflow: 'hidden',
        }}
      >
        {/* ─── SELECTED ELEMENT BADGE ─── */}
        {props.selectedElement && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 16px',
              background: 'color-mix(in srgb, var(--cx-accent-vivid), transparent 92%)',
              borderBottom: '1px solid color-mix(in srgb, var(--cx-accent-vivid), transparent 80%)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--cx-text-secondary)' }}>
              <code style={{ background: 'var(--cx-accent-vivid)', color: 'white', borderRadius: '4px', padding: '1px 6px', fontSize: '11px', fontFamily: 'ui-monospace, "SF Mono", monospace' }}>
                {props.selectedElement.tagName}
              </code>
              <span>selected for inspection</span>
            </div>
            <button
              onClick={() => props.setSelectedElement?.(null)}
              style={{ background: 'none', border: 'none', color: 'var(--cx-accent-vivid)', cursor: 'pointer', fontSize: '12px', fontWeight: 500, padding: '2px 6px', borderRadius: '6px' }}
            >
              Clear
            </button>
          </div>
        )}

        {/* ─── MODEL SELECTOR ─── */}
        <ClientOnly>
          {() => (
            <div className={props.isModelSettingsCollapsed ? 'hidden' : ''}>
              <div style={{ padding: '12px 16px 10px', borderBottom: '1px solid color-mix(in srgb, var(--cx-text-primary), transparent 94%)' }}>
                <ModelSelector
                  key={props.provider?.name + ':' + props.modelList.length}
                  model={props.model}
                  setModel={props.setModel}
                  modelList={props.modelList}
                  provider={props.provider}
                  setProvider={props.setProvider}
                  providerList={props.providerList || (PROVIDER_LIST as ProviderInfo[])}
                  apiKeys={props.apiKeys}
                  modelLoading={props.isModelLoading}
                />
                {(props.providerList || []).length > 0 &&
                  props.provider &&
                  !LOCAL_PROVIDERS.includes(props.provider.name) && (
                    <div style={{ marginTop: '8px' }}>
                      <APIKeyManager
                        provider={props.provider}
                        apiKey={props.apiKeys[props.provider.name] || ''}
                        setApiKey={(key) => props.onApiKeysChange(props.provider.name, key)}
                      />
                    </div>
                  )}
              </div>
            </div>
          )}
        </ClientOnly>

        {/* ─── FILE PREVIEWS ─── */}
        {(props.uploadedFiles.length > 0 || props.imageDataList.length > 0) && (
          <div style={{ padding: '10px 16px 0' }}>
            <FilePreview
              files={props.uploadedFiles}
              imageDataList={props.imageDataList}
              onRemove={(index) => {
                props.setUploadedFiles?.(props.uploadedFiles.filter((_, i) => i !== index));
                props.setImageDataList?.(props.imageDataList.filter((_, i) => i !== index));
              }}
            />
          </div>
        )}

        <ClientOnly>
          {() => (
            <ScreenshotStateManager
              setUploadedFiles={props.setUploadedFiles}
              setImageDataList={props.setImageDataList}
              uploadedFiles={props.uploadedFiles}
              imageDataList={props.imageDataList}
            />
          )}
        </ClientOnly>

        {/* ─── TEXT INPUT ─── */}
        <div style={{ position: 'relative', padding: '16px 56px 8px 20px' }}>
          <textarea
            ref={props.textareaRef}
            className="w-full outline-none resize-none bg-transparent"
            style={{
              minHeight: props.TEXTAREA_MIN_HEIGHT,
              maxHeight: props.TEXTAREA_MAX_HEIGHT,
              fontSize: '14.5px',
              lineHeight: '1.65',
              letterSpacing: '-0.003em',
              color: 'var(--cx-text-primary)',
              caretColor: 'var(--cx-accent-vivid)',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
              fontWeight: 400,
            }}
            onDragEnter={(e) => {
              e.preventDefault();
              const shell = e.currentTarget.closest('.cx-composer-shell') as HTMLElement;
              if (shell) shell.style.boxShadow = '0 0 0 2px var(--cx-accent-vivid), 0 8px 32px -8px rgba(0,0,0,0.22)';
            }}
            onDragOver={(e) => e.preventDefault()}
            onDragLeave={(e) => {
              e.preventDefault();
              const shell = e.currentTarget.closest('.cx-composer-shell') as HTMLElement;
              if (shell) shell.style.boxShadow = '';
            }}
            onDrop={(e) => {
              e.preventDefault();
              const shell = e.currentTarget.closest('.cx-composer-shell') as HTMLElement;
              if (shell) shell.style.boxShadow = '';
              Array.from(e.dataTransfer.files).forEach((file) => {
                if (file.type.startsWith('image/')) {
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    props.setUploadedFiles?.([...props.uploadedFiles, file]);
                    props.setImageDataList?.([...props.imageDataList, ev.target?.result as string]);
                  };
                  reader.readAsDataURL(file);
                }
              });
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                if (event.shiftKey) return;
                event.preventDefault();
                if (props.isStreaming) { props.handleStop?.(); return; }
                if (event.nativeEvent.isComposing) return;
                props.handleSendMessage?.(event);
              }
            }}
            value={props.input}
            onChange={(event) => props.handleInputChange?.(event)}
            onPaste={props.handlePaste}
            placeholder={
              props.chatMode === 'build'
                ? 'Describe your code issue, paste errors, or share your feature idea...'
                : 'What would you like to discuss?'
            }
            translate="no"
          />

          {/* Send Button */}
          <div style={{ position: 'absolute', right: '12px', bottom: '10px' }}>
            <ClientOnly>
              {() => (
                <SendButton
                  show={hasContent}
                  isStreaming={props.isStreaming}
                  disabled={!props.providerList || props.providerList.length === 0}
                  onClick={(event) => {
                    if (props.isStreaming) { props.handleStop?.(); return; }
                    if (props.input.length > 0 || props.uploadedFiles.length > 0) {
                      props.handleSendMessage?.(event);
                    }
                  }}
                />
              )}
            </ClientOnly>
          </div>
        </div>

        {/* ─── BOTTOM TOOLBAR ─── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 10px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1px' }}>
            <ComposerIconBtn title="Color scheme">
              <ColorSchemeDialog designScheme={props.designScheme} setDesignScheme={props.setDesignScheme} />
            </ComposerIconBtn>

            <ComposerIconBtn title="Attach image" onClick={() => props.handleFileUpload()}>
              <Icon name="paperclip" />
            </ComposerIconBtn>

            <ComposerIconBtn
              title="Enhance prompt"
              disabled={props.input.length === 0 || props.enhancingPrompt}
              active={props.enhancingPrompt}
              onClick={() => { props.enhancePrompt?.(); toast.success('Prompt enhanced!'); }}
            >
              {props.enhancingPrompt
                ? <Icon name="spinner" className="animate-spin" />
                : <Icon name="sparkle" />}
            </ComposerIconBtn>

            <SpeechRecognitionButton
              isListening={props.isListening}
              onStart={props.startListening}
              onStop={props.stopListening}
              disabled={props.isStreaming}
            />

            {props.chatStarted && (
              <ComposerIconBtn
                title="Discuss mode"
                active={props.chatMode === 'discuss'}
                onClick={() => props.setChatMode?.(props.chatMode === 'discuss' ? 'build' : 'discuss')}
                withLabel={props.chatMode === 'discuss' ? 'Discuss' : undefined}
              >
                <Icon name="chat" />
              </ComposerIconBtn>
            )}

            <ComposerIconBtn
              title="Model settings"
              active={props.isModelSettingsCollapsed}
              disabled={!props.providerList || props.providerList.length === 0}
              onClick={() => props.setIsModelSettingsCollapsed(!props.isModelSettingsCollapsed)}
              withLabel={props.isModelSettingsCollapsed ? props.model : undefined}
            >
              <Icon name={props.isModelSettingsCollapsed ? 'caret-right' : 'caret-down'} />
            </ComposerIconBtn>
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            {props.input.length > 3 && (
              <span style={{ fontSize: '11px', color: 'var(--cx-text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <kbd style={{ fontFamily: '-apple-system, system-ui, sans-serif', fontSize: '11px', background: 'color-mix(in srgb, var(--cx-text-primary), transparent 92%)', color: 'var(--cx-text-secondary)', borderRadius: '4px', padding: '1px 5px' }}>⇧</kbd>
                <kbd style={{ fontFamily: '-apple-system, system-ui, sans-serif', fontSize: '11px', background: 'color-mix(in srgb, var(--cx-text-primary), transparent 92%)', color: 'var(--cx-text-secondary)', borderRadius: '4px', padding: '1px 5px' }}>↵</kbd>
                <span style={{ opacity: 0.55, marginLeft: '2px' }}>new line</span>
              </span>
            )}
            <ExpoQrModal open={props.qrModalOpen} onClose={() => props.setQrModalOpen(false)} />
          </div>
        </div>
      </div>
    </div>
  );
};

interface ComposerIconBtnProps {
  title: string;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
  withLabel?: string;
}

function ComposerIconBtn({ title, children, onClick, disabled, active, withLabel }: ComposerIconBtnProps) {
  return (
    <button
      title={title}
      disabled={disabled}
      onClick={onClick}
      className="cx-toolbar-btn"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        background: active ? 'color-mix(in srgb, var(--cx-accent-vivid), transparent 88%)' : 'transparent',
        border: 'none',
        borderRadius: '8px',
        padding: '5px 7px',
        cursor: disabled ? 'default' : 'pointer',
        color: active ? 'var(--cx-accent-vivid)' : 'var(--cx-text-muted)',
        fontSize: '16px',
        opacity: disabled ? 0.3 : 1,
        transition: 'background 0.15s ease, color 0.15s ease',
        outline: 'none',
      }}
    >
      {children}
      {withLabel && (
        <span style={{ fontSize: '11px', fontWeight: 500, fontFamily: 'ui-monospace, "SF Mono", monospace', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {withLabel}
        </span>
      )}
    </button>
  );
}
