import type { Message } from 'ai';
import { Fragment } from 'react';
import { classNames } from '~/utils/classNames';
import { AssistantMessage } from './AssistantMessage';
import { UserMessage } from './UserMessage';
import { useLocation } from 'react-router-dom';
import { db, chatId } from '~/lib/persistence/useChatHistory';
import { forkChat } from '~/lib/persistence/db';
import { toast } from 'react-toastify';
import { forwardRef } from 'react';
import type { ForwardedRef } from 'react';
import type { ProviderInfo } from '~/types/model';

interface MessagesProps {
  id?: string;
  className?: string;
  isStreaming?: boolean;
  messages?: Message[];
  append?: (message: Message) => void;
  chatMode?: 'discuss' | 'build';
  setChatMode?: (mode: 'discuss' | 'build') => void;
  model?: string;
  provider?: ProviderInfo;
  addToolResult: ({ toolCallId, result }: { toolCallId: string; result: any }) => void;
}

export const Messages = forwardRef<HTMLDivElement, MessagesProps>(
  (props: MessagesProps, ref: ForwardedRef<HTMLDivElement> | undefined) => {
    const { id, isStreaming = false, messages = [] } = props;
    const location = useLocation();

    const handleRewind = (messageId: string) => {
      const searchParams = new URLSearchParams(location.search);
      searchParams.set('rewindTo', messageId);
      window.location.search = searchParams.toString();
    };

    const handleFork = async (messageId: string) => {
      try {
        if (!db || !chatId.get()) {
          toast.error('Chat persistence is not available');
          return;
        }

        const urlId = await forkChat(db, chatId.get()!, messageId);
        window.location.href = `/chat/${urlId}`;
      } catch (error) {
        toast.error('Failed to fork chat: ' + (error as Error).message);
      }
    };

    return (
      <div id={id} className={classNames('flex flex-col', props.className)} style={{ padding: '24px 20px', gap: '24px', display: 'flex', flexDirection: 'column' }} ref={ref}>
        {messages.length > 0
          ? messages.map((message, index) => {
            const { role, content, id: messageId, annotations, parts } = message;
            const isUserMessage = role === 'user';
            const isHidden = annotations?.includes('hidden');

            if (isHidden) {
              return <Fragment key={index} />;
            }

            return (
              <div
                key={index}
                style={{
                  display: 'flex',
                  width: '100%',
                  justifyContent: isUserMessage ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    width: '100%',
                    maxWidth: isUserMessage ? '85%' : '100%',
                  }}
                >
                  {isUserMessage ? (
                    <UserMessage content={content} parts={parts} />
                  ) : (
                    <AssistantMessage
                      content={content}
                      annotations={message.annotations}
                      messageId={messageId}
                      onRewind={handleRewind}
                      onFork={handleFork}
                      append={props.append}
                      chatMode={props.chatMode}
                      setChatMode={props.setChatMode}
                      model={props.model}
                      provider={props.provider}
                      parts={parts}
                      addToolResult={props.addToolResult}
                    />
                  )}
                </div>
              </div>
            );
          })
          : null}
        {isStreaming && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '4px 0',
            }}
          >
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--cx-accent-vivid), var(--cx-accent-primary))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: '14px',
                boxShadow: '0 0 12px color-mix(in srgb, var(--cx-accent-vivid), transparent 60%)',
              }}
            >
              🩺
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    width: '5px',
                    height: '5px',
                    borderRadius: '50%',
                    background: 'var(--cx-accent-vivid)',
                    animation: `pulse-dot 1.4s ease-in-out ${i * 0.16}s infinite`,
                    opacity: 0.7,
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  },
);
