import type { Message } from 'ai';
import { Fragment } from 'react';
import { classNames } from '~/utils/classNames';
import { AssistantMessage } from './AssistantMessage';
import { UserMessage } from './UserMessage';
import { Icon } from '~/components/ui/Icon';
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
      <div id={id} className={classNames('flex flex-col gap-[18px] p-[20px]', props.className)} ref={ref}>
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
                className="flex w-full rounded-lg"
              >
                <div className="grid grid-col-1 w-full">
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
          <div className="flex justify-center w-full my-4">
            <Icon name="spinner" className="animate-spin text-bolt-elements-item-contentAccent text-4xl spin" size={40} />
          </div>
        )}
      </div>
    );
  },
);
