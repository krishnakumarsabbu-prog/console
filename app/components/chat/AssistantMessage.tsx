import { memo, Fragment } from 'react';
import { Markdown } from './Markdown';
import type { JSONValue } from 'ai';
import Popover from '~/components/ui/Popover';
import { workbenchStore } from '~/lib/stores/workbench';
import { WORK_DIR } from '~/utils/constants';
import WithTooltip from '~/components/ui/Tooltip';
import { Icon } from '~/components/ui/Icon';
import type { Message } from 'ai';
import type { ProviderInfo } from '~/types/model';
import type {
  TextUIPart,
  ReasoningUIPart,
  ToolInvocationUIPart,
  SourceUIPart,
  FileUIPart,
  StepStartUIPart,
} from '@ai-sdk/ui-utils';

interface AssistantMessageProps {
  content: string;
  annotations?: JSONValue[];
  messageId?: string;
  onRewind?: (messageId: string) => void;
  onFork?: (messageId: string) => void;
  append?: (message: Message) => void;
  chatMode?: 'discuss' | 'build';
  setChatMode?: (mode: 'discuss' | 'build') => void;
  model?: string;
  provider?: ProviderInfo;
  parts:
  | (TextUIPart | ReasoningUIPart | ToolInvocationUIPart | SourceUIPart | FileUIPart | StepStartUIPart)[]
  | undefined;
  addToolResult: ({ toolCallId, result }: { toolCallId: string; result: any }) => void;
}

function openArtifactInWorkbench(filePath: string) {
  filePath = normalizedFilePath(filePath);

  if (workbenchStore.currentView.get() !== 'code') {
    workbenchStore.currentView.set('code');
  }

  workbenchStore.setSelectedFile(`${WORK_DIR}/${filePath}`);
}

function normalizedFilePath(path: string) {
  let normalizedPath = path;

  if (normalizedPath.startsWith(WORK_DIR)) {
    normalizedPath = path.replace(WORK_DIR, '');
  }

  if (normalizedPath.startsWith('/')) {
    normalizedPath = normalizedPath.slice(1);
  }

  return normalizedPath;
}

export const AssistantMessage = memo(
  ({
    content,
    annotations,
    messageId,
    onRewind,
    onFork,
    append,
    chatMode,
    setChatMode,
    model,
    provider,
    parts,
    addToolResult,
  }: AssistantMessageProps) => {
    const filteredAnnotations = (annotations?.filter(
      (annotation: JSONValue) =>
        annotation && typeof annotation === 'object' && Object.keys(annotation).includes('type'),
    ) || []) as { type: string; value: any } & { [key: string]: any }[];

    let chatSummary: string | undefined = undefined;

    if (filteredAnnotations.find((annotation) => annotation.type === 'chatSummary')) {
      chatSummary = filteredAnnotations.find((annotation) => annotation.type === 'chatSummary')?.summary;
    }

    let codeContext: string[] | undefined = undefined;

    if (filteredAnnotations.find((annotation) => annotation.type === 'codeContext')) {
      codeContext = filteredAnnotations.find((annotation) => annotation.type === 'codeContext')?.files;
    }

    const usage: {
      completionTokens: number;
      promptTokens: number;
      totalTokens: number;
    } = filteredAnnotations.find((annotation) => annotation.type === 'usage')?.value;

    return (
      <div style={{ width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span
                style={{
                  color: 'var(--cx-accent-vivid)',
                  fontSize: '11px',
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                DevCure AI
              </span>

              {(codeContext || chatSummary) && (
                <Popover side="right" align="start" trigger={
                  <button
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--cx-text-muted)',
                      cursor: 'pointer',
                      padding: '2px',
                      display: 'flex',
                      alignItems: 'center',
                      borderRadius: '4px',
                      transition: 'color 0.15s ease',
                    }}
                  >
                    <Icon name="info" />
                  </button>
                }>
                  {chatSummary && (
                    <div style={{ maxWidth: '320px' }}>
                      <div
                        style={{
                          border: '1px solid var(--cx-border)',
                          borderRadius: '8px',
                          padding: '12px',
                          marginBottom: '8px',
                        }}
                      >
                        <h2
                          style={{
                            color: 'var(--cx-text-primary)',
                            fontSize: '12px',
                            fontWeight: 600,
                            marginBottom: '8px',
                          }}
                        >
                          Summary
                        </h2>
                        <div style={{ zoom: 0.7, maxHeight: '240px', overflowY: 'auto' }}>
                          <Markdown>{chatSummary}</Markdown>
                        </div>
                      </div>
                      {codeContext && (
                        <div
                          style={{
                            border: '1px solid var(--cx-border)',
                            borderRadius: '8px',
                            padding: '12px',
                          }}
                        >
                          <h2
                            style={{
                              color: 'var(--cx-text-primary)',
                              fontSize: '12px',
                              fontWeight: 600,
                              marginBottom: '8px',
                            }}
                          >
                            Context
                          </h2>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', zoom: 0.85 }}>
                            {codeContext.map((x) => {
                              const normalized = normalizedFilePath(x);
                              return (
                                <Fragment key={normalized}>
                                  <code
                                    style={{
                                      background: 'color-mix(in srgb, var(--cx-accent-vivid), transparent 90%)',
                                      color: 'var(--cx-accent-vivid)',
                                      padding: '2px 6px',
                                      borderRadius: '4px',
                                      fontSize: '11px',
                                      cursor: 'pointer',
                                      fontFamily: 'ui-monospace, "SF Mono", monospace',
                                    }}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      openArtifactInWorkbench(normalized);
                                    }}
                                  >
                                    {normalized}
                                  </code>
                                </Fragment>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </Popover>
              )}

              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {usage && (
                  <span
                    style={{
                      color: 'var(--cx-text-muted)',
                      fontSize: '10px',
                      letterSpacing: '0.01em',
                    }}
                  >
                    {usage.totalTokens.toLocaleString()} tokens
                  </span>
                )}
                {(onRewind || onFork) && messageId && (
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {onRewind && (
                      <WithTooltip tooltip="Revert to this message">
                        <button
                          onClick={() => onRewind(messageId)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--cx-text-muted)',
                            cursor: 'pointer',
                            padding: '4px',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: '14px',
                            transition: 'color 0.15s ease, background 0.15s ease',
                          }}
                        >
                          <Icon name="arrow-counter-clockwise" />
                        </button>
                      </WithTooltip>
                    )}
                    {onFork && (
                      <WithTooltip tooltip="Fork chat from this message">
                        <button
                          onClick={() => onFork(messageId)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--cx-text-muted)',
                            cursor: 'pointer',
                            padding: '4px',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: '14px',
                            transition: 'color 0.15s ease, background 0.15s ease',
                          }}
                        >
                          <Icon name="git-branch" />
                        </button>
                      </WithTooltip>
                    )}
                  </div>
                )}
              </div>
        </div>

        <div
          className="devcure-ai-message"
          style={{ color: 'var(--cx-text-primary)' }}
        >
          <Markdown append={append} chatMode={chatMode} setChatMode={setChatMode} model={model} provider={provider} html>
            {content}
          </Markdown>
        </div>
      </div>
    );
  },
);
