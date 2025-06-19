import React from 'react';
import { Sidebar } from '../layout/Sidebar';
import { Chat } from '../../types/chat';

interface SidebarWrapperProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  chats: Chat[];
  selectedChatId: string;
  onChatSelect: (chatId: string) => void;
  onNewChat: () => void;
  onLoadConversation: (conversationId: string) => void;
}

const SidebarWrapper: React.FC<SidebarWrapperProps> = ({
  isSidebarOpen,
  setIsSidebarOpen,
  chats,
  selectedChatId,
  onChatSelect,
  onNewChat,
  onLoadConversation,
}) => {
  return (
    <Sidebar
      isOpen={isSidebarOpen}
      onClose={() => setIsSidebarOpen(false)}
      chats={chats}
      selectedChatId={selectedChatId}
      onChatSelect={onChatSelect}
      onNewChat={onNewChat}
      onLoadConversation={onLoadConversation}
    />
  );
};

export default SidebarWrapper; 