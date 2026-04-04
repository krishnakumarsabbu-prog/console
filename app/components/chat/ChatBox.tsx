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
import { IconButton } from '~/components/ui/IconButton';
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
  return (
    <div
      className={classNames(
        'relative p-3 rounded-2xl relative w-full max-w-chat mx-auto z-prompt transition-all duration-300',
        'devcure-chatbox',
      )}
    >
      <div className="hidden">
        <svg className={classNames(styles.PromptEffectContainer)}>
          <defs>
            <linearGradient
              id="line-gradient"
              x1="20%"
              y1="0%"
              x2="-14%"
              y2="10%"
              gradientUnits="userSpaceOnUse"
              gradientTransform="rotate(-45)"
            >
              <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0%"></stop>
              <stop offset="40%" stopColor="#2dd4bf" stopOpacity="80%"></stop>
              <stop offset="50%" stopColor="#3b82f6" stopOpacity="80%"></stop>
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0%"></stop>
            </linearGradient>
            <linearGradient id="shine-gradient">
              <stop offset="0%" stopColor="white" stopOpacity="0%"></stop>
              <stop offset="40%" stopColor="#ffffff" stopOpacity="80%"></stop>
              <stop offset="50%" stopColor="#ffffff" stopOpacity="80%"></stop>
              <stop offset="100%" stopColor="white" stopOpacity="0%"></stop>
            </linearGradient>
          </defs>
          <rect className={classNames(styles.PromptEffectLine)} pathLength="100" strokeLinecap="round"></rect>
          <rect className={classNames(styles.PromptShine)} x="48" y="24" width="70" height="1"></rect>
        </svg>
      </div>
      <div>
        <ClientOnly>
          {() => (
            <div className={props.isModelSettingsCollapsed ? 'hidden' : ''}>
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
                  <APIKeyManager
                    provider={props.provider}
                    apiKey={props.apiKeys[props.provider.name] || ''}
                    setApiKey={(key) => {
                      props.onApiKeysChange(props.provider.name, key);
                    }}
                  />
                )}
            </div>
          )}
        </ClientOnly>
      </div>
      <FilePreview
        files={props.uploadedFiles}
        imageDataList={props.imageDataList}
        onRemove={(index) => {
          props.setUploadedFiles?.(props.uploadedFiles.filter((_, i) => i !== index));
          props.setImageDataList?.(props.imageDataList.filter((_, i) => i !== index));
        }}
      />
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
      {
        props.selectedElement && (
          <div className="flex mx-1.5 gap-2 items-center justify-between rounded-lg rounded-b-none ring-1 ring-b-0 ring-white/10 text-white flex py-1 px-2.5 font-medium text-xs bg-[rgba(255,255,255,0.05)]">
            <div className="flex gap-2 items-center lowercase">
              <code className="bg-teal-500 rounded-[4px] px-1.5 py-1 mr-0.5 text-white">
                {props?.selectedElement?.tagName}
              </code>
              selected for inspection
            </div>
            <button
              className="bg-transparent text-teal-400 pointer-auto"
              onClick={() => props.setSelectedElement?.(null)}
            >
              Clear
            </button>
          </div>
        )
      }
      <div
        className={classNames('relative rounded-xl transition-all duration-200 devcure-input-wrapper')}
      >
        <textarea
          ref={props.textareaRef}
          className={classNames(
            'w-full pl-4 pt-4 pr-16 outline-none resize-none text-gray-200 placeholder-gray-500 bg-transparent text-sm',
            'transition-all duration-200',
          )}
          onDragEnter={(e) => {
            e.preventDefault();
            e.currentTarget.style.border = '2px solid #2dd4bf';
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.currentTarget.style.border = '2px solid #2dd4bf';
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.currentTarget.style.border = '1px solid rgba(255,255,255,0.1)';
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.currentTarget.style.border = '1px solid rgba(255,255,255,0.1)';

            const files = Array.from(e.dataTransfer.files);
            files.forEach((file) => {
              if (file.type.startsWith('image/')) {
                const reader = new FileReader();

                reader.onload = (e) => {
                  const base64Image = e.target?.result as string;
                  props.setUploadedFiles?.([...props.uploadedFiles, file]);
                  props.setImageDataList?.([...props.imageDataList, base64Image]);
                };
                reader.readAsDataURL(file);
              }
            });
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              if (event.shiftKey) {
                return;
              }

              event.preventDefault();

              if (props.isStreaming) {
                props.handleStop?.();
                return;
              }

              // ignore if using input method engine
              if (event.nativeEvent.isComposing) {
                return;
              }

              props.handleSendMessage?.(event);
            }
          }}
          value={props.input}
          onChange={(event) => {
            props.handleInputChange?.(event);
          }}
          onPaste={props.handlePaste}
          style={{
            minHeight: props.TEXTAREA_MIN_HEIGHT,
            maxHeight: props.TEXTAREA_MAX_HEIGHT,
          }}
          placeholder={props.chatMode === 'build' ? 'Describe your code issue, paste errors, or share your feature idea...' : 'What would you like to discuss?'}
          translate="no"
        />
        <ClientOnly>
          {() => (
            <SendButton
              show={props.input.length > 0 || props.isStreaming || props.uploadedFiles.length > 0}
              isStreaming={props.isStreaming}
              disabled={!props.providerList || props.providerList.length === 0}
              onClick={(event) => {
                if (props.isStreaming) {
                  props.handleStop?.();
                  return;
                }

                if (props.input.length > 0 || props.uploadedFiles.length > 0) {
                  props.handleSendMessage?.(event);
                }
              }}
            />
          )}
        </ClientOnly>
        <div className="flex justify-between items-center text-sm p-4 pt-2">
          <div className="flex gap-1 items-center">
            <ColorSchemeDialog designScheme={props.designScheme} setDesignScheme={props.setDesignScheme} />

            <IconButton title="Upload file" className="transition-all text-gray-400 hover:text-teal-400" onClick={() => props.handleFileUpload()}>
              <Icon name="paperclip" />
            </IconButton>

            <IconButton
              title="Enhance prompt"
              disabled={props.input.length === 0 || props.enhancingPrompt}
              className={classNames('transition-all text-gray-400 hover:text-teal-400', props.enhancingPrompt ? 'opacity-100' : '')}
              onClick={() => {
                props.enhancePrompt?.();
                toast.success('Prompt enhanced!');
              }}
            >
              {props.enhancingPrompt ? (
                <Icon name="spinner" className="text-teal-400 animate-spin" />
              ) : (
                <Icon name="sparkle" />
              )}
            </IconButton>

            <SpeechRecognitionButton
              isListening={props.isListening}
              onStart={props.startListening}
              onStop={props.stopListening}
              disabled={props.isStreaming}
            />
            {props.chatStarted && (
              <IconButton
                title="Discuss"
                className={classNames(
                  'transition-all flex items-center gap-1 px-1.5',
                  props.chatMode === 'discuss'
                    ? 'devcure-btn-active'
                    : 'text-gray-400 hover:text-teal-400',
                )}
                onClick={() => {
                  props.setChatMode?.(props.chatMode === 'discuss' ? 'build' : 'discuss');
                }}
              >
                <Icon name="chat" />
                {props.chatMode === 'discuss' ? <span>Discuss</span> : <span />}
              </IconButton>
            )}
            <IconButton
              title="Model Settings"
              className={classNames('transition-all flex items-center gap-1', {
                'devcure-btn-active':
                  props.isModelSettingsCollapsed,
                'text-gray-400 hover:text-teal-400':
                  !props.isModelSettingsCollapsed,
              })}
              onClick={() => props.setIsModelSettingsCollapsed(!props.isModelSettingsCollapsed)}
              disabled={!props.providerList || props.providerList.length === 0}
            >
              <Icon name={props.isModelSettingsCollapsed ? 'caret-right' : 'caret-down'} />
              {props.isModelSettingsCollapsed ? <span className="text-xs">{props.model}</span> : <span />}
            </IconButton>
          </div>
          {props.input.length > 3 ? (
            <div className="text-xs text-gray-500">
              Use <kbd className="kdb px-1.5 py-0.5 rounded bg-[rgba(255,255,255,0.08)] text-gray-400">Shift</kbd> +{' '}
              <kbd className="kdb px-1.5 py-0.5 rounded bg-[rgba(255,255,255,0.08)] text-gray-400">Return</kbd> a new line
            </div>
          ) : null}
          <ExpoQrModal open={props.qrModalOpen} onClose={() => props.setQrModalOpen(false)} />
        </div>
      </div>
    </div >
  );
};
