import BackgroundRays from '../../app/components/ui/BackgroundRays';
import { Header } from '../../app/components/header/Header';
import { BaseChat } from '../../app/components/chat/BaseChat';
import { Chat } from '../../app/components/chat/Chat.client';
import { ClientOnly } from '../utils/ClientOnly';

export default function Index() {
  return (
    <div className="flex flex-col h-full w-full bg-bolt-elements-background-depth-1">
      <BackgroundRays />
      <Header />
      <ClientOnly fallback={<BaseChat />}>{() => <Chat />}</ClientOnly>
    </div>
  );
}
