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
      <div className="overflow-hidden w-full">
        <>
          <div className=" flex gap-2 items-center text-sm text-[var(--vscode-text-muted)] mb-2">
            {(codeContext || chatSummary) && (
              <Popover side="right" align="start" trigger={<Icon name="info" />}>
                {chatSummary && (
                  <div className="max-w-chat">
                    <div className="summary max-h-96 flex flex-col">
                      <h2 className="border border-[var(--vscode-border)] rounded-md p-4">Summary</h2>
                      <div style={{ zoom: 0.7 }} className="overflow-y-auto m4">
                        <Markdown>{chatSummary}</Markdown>
                      </div>
                    </div>
                    {codeContext && (
                      <div className="code-context flex flex-col p-4 border border-[var(--vscode-border)] rounded-md">
                        <h2>Context</h2>
                        <div className="flex gap-4 mt-4 bolt" style={{ zoom: 0.6 }}>
                          {codeContext.map((x) => {
                            const normalized = normalizedFilePath(x);
                            return (
                              <Fragment key={normalized}>
                                <code
                                  className="bg-bolt-elements-artifacts-inlineCode-background text-bolt-elements-artifacts-inlineCode-text px-1.5 py-1 rounded-md text-bolt-elements-item-contentAccent hover:underline cursor-pointer"
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
                <div className="context"></div>
              </Popover>
            )}
            <div className="flex w-full items-center justify-between">
              {usage && (
                <div>
                  Tokens: {usage.totalTokens} (prompt: {usage.promptTokens}, completion: {usage.completionTokens})
                </div>
              )}
              {(onRewind || onFork) && messageId && (
                <div className="flex gap-2 flex-col lg:flex-row ml-auto">
                  {onRewind && (
                    <WithTooltip tooltip="Revert to this message">
                      <button
                        onClick={() => onRewind(messageId)}
                        className="text-xl text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary transition-colors"
                      >
                        <Icon name="arrow-counter-clockwise" />
                      </button>
                    </WithTooltip>
                  )}
                  {onFork && (
                    <WithTooltip tooltip="Fork chat from this message">
                      <button
                        onClick={() => onFork(messageId)}
                        className="text-xl text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary transition-colors"
                      >
                        <Icon name="git-branch" />
                      </button>
                    </WithTooltip>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
        <div className="flex items-start gap-3 w-full group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#00FFD1] to-[#8B5CF6] flex items-center justify-center text-black text-sm shrink-0 mt-1 shadow-[0_0_15px_rgba(0,255,200,0.3)]">
            🩺
          </div>

          <div className="flex-1 min-w-0 flex flex-col items-start w-full">
            <div className="text-xs text-[#00FFD1] mb-1 font-semibold tracking-wide drop-shadow-[0_0_5px_rgba(0,255,200,0.5)]">
              DevCure AI
            </div>
            <div className="devcure-ai-message text-bolt-elements-textPrimary relative z-10">
              <Markdown append={append} chatMode={chatMode} setChatMode={setChatMode} model={model} provider={provider} html>
                {content}
              </Markdown>
            </div>
          </div>
        </div>
      </div>
    );
  },
);
