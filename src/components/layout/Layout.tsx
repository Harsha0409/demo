import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useLoginModal } from '../../context/loginModalContext';
import { useAuth } from '../../hooks/useAuth';
import Header from './Header';
import SidebarWrapper from './SidebarWrapper';
import ChatArea from './ChatArea';
import { Chat } from '../../types/chat';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  createNewSession,
  handleSendMessage,
  handleNewChat,
  loadConversation,
} from '../../utils/chatHelpers';
import { Toaster } from 'react-hot-toast';

interface LayoutProps {
  chats: Chat[];
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
}

const Layout: React.FC<LayoutProps> = ({ chats, setChats }) => {
  const { theme, toggleTheme } = useTheme();
  const { onOpen } = useLoginModal();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<string>('1');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [showLogout, setShowLogout] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [buttonLoading, setButtonLoading] = useState<string | null>(null);
  const [loadingStates, setLoadingStates] = useState<Set<string>>(new Set());
  const [processedSessions, setProcessedSessions] = useState<Set<string>>(new Set());
  const [initialLoad, setInitialLoad] = useState(false);

  const { sessionId: urlSessionId } = useParams<{ sessionId?: string }>();
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const createNewSessionHelper = useCallback(
    () => createNewSession(setChats, setSelectedChatId, navigate),
    [setChats, navigate]
  );

  const handleSendMessageHelper = useCallback(
    async (content: string) => {
      setButtonLoading(content);
      try {
        await handleSendMessage(
          content,
          selectedChatId,
          setChats,
          location.pathname,
          createNewSessionHelper
        );
      } finally {
        setButtonLoading(null);
      }
    },
    [selectedChatId, setChats, location.pathname, createNewSessionHelper]
  );

  const handleNewChatHelper = useCallback(
    () => {
      setProcessedSessions(new Set());
      handleNewChat(
        chats,
        selectedChatId,
        setChats,
        setSelectedChatId,
        navigate
      );
    },
    [chats, selectedChatId, setChats, navigate]
  );

  const loadConversationHelper = useCallback(
    async (conversationId: string) => {
      if (loadingStates.has(conversationId)) {
        return;
      }
      setIsChatLoading(true);
      setLoadingStates(prev => new Set(prev).add(conversationId));
      try {
        if (isAuthenticated) {
          await loadConversation(
            conversationId,
            setChats,
            setSelectedChatId,
            navigate,
            location.pathname
          );
        }
      } finally {
        setLoadingStates(prev => {
          const newSet = new Set(prev);
          newSet.delete(conversationId);
          return newSet;
        });
        setIsChatLoading(false);
      }
    },
    [setChats, navigate, location.pathname, isAuthenticated]
  );

  useEffect(() => {
    if (sessionId) {
      setSelectedChatId(sessionId);
    }
  }, [sessionId]);

  useEffect(() => {
    const paymentStatusStr =
      localStorage.getItem('paymentStatus') ?? sessionStorage.getItem('paymentStatus');
    if (!paymentStatusStr) {
      return;
    }

    try {
      const paymentStatus = JSON.parse(paymentStatusStr);
      if (paymentStatus.sessionId === selectedChatId && paymentStatus.summary) {
        setTimeout(() => {
          const messageContent = paymentStatus.ticketData
            ? {
                summary: paymentStatus.summary,
                ticketData: paymentStatus.ticketData,
                passengerData: paymentStatus.passengerData,
                billItems: paymentStatus.billItems || []
              }
            : { summary: paymentStatus.summary };

          setChats(prevChats => {
            const existingChat = prevChats.find(c => c.id === selectedChatId);
            const message = {
              id: `payment-confirmation-${Date.now()}`,
              role: 'assistant' as const,
              content: messageContent,
              timestamp: new Date()
            };

            if (existingChat) {
              return prevChats.map(chat =>
                chat.id === selectedChatId
                  ? {
                      ...chat,
                      messages: [...chat.messages, message],
                      lastUpdated: new Date()
                    }
                  : chat
              );
            }

            const newChat = {
              id: selectedChatId,
              title: 'New Conversation',
              messages: [message],
              lastUpdated: new Date()
            };
            return [newChat, ...prevChats];
          });

          // Clean up payment status from all storages
          localStorage.removeItem('paymentStatus');
          sessionStorage.removeItem('paymentStatus');
          document.cookie = 'paymentStatus=; Max-Age=0; path=/';
        }, 500);
      }
    } catch (error) {
      localStorage.removeItem('paymentStatus');
      sessionStorage.removeItem('paymentStatus');
      document.cookie = 'paymentStatus=; Max-Age=0; path=/';
    }
  }, [selectedChatId, setChats, urlSessionId]);

  useEffect(() => {
    if (authLoading) return;
    if (!initialLoad) {
      setInitialLoad(true);
    }
    if (urlSessionId) {
      if (processedSessions.has(urlSessionId)) {
        return;
      }
      setProcessedSessions(prev => new Set(prev).add(urlSessionId));
      setSelectedChatId(urlSessionId);
      localStorage.setItem('sessionId', urlSessionId);
      const chatExists = chats.some(chat => chat.id === urlSessionId);
      if (!chatExists && isAuthenticated) {
        loadConversationHelper(urlSessionId);
      }
    } else if (isAuthenticated && initialLoad) {
      const storedSessionId = localStorage.getItem('sessionId');
      if (storedSessionId && location.pathname === '/') {
        navigate(`/c/${storedSessionId}`, { replace: true });
      } else if (location.pathname === '/' && !storedSessionId) {
        createNewSessionHelper();
      }
    }
  }, [
    urlSessionId,
    isAuthenticated,
    authLoading,
    chats,
    navigate,
    location.pathname,
    createNewSessionHelper,
    loadConversationHelper,
    initialLoad
  ]);

  useEffect(() => {
    if (urlSessionId && !processedSessions.has(urlSessionId)) {
      setProcessedSessions(new Set());
    }
  }, [urlSessionId]);

  useEffect(() => {
    const handleAuthSuccess = () => {
      setProcessedSessions(new Set());
      setInitialLoad(false);
    };
    window.addEventListener('auth:success', handleAuthSuccess);
    return () => {
      window.removeEventListener('auth:success', handleAuthSuccess);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedChatId, chats]);

  // Define selectedChat before the next useEffect
  const selectedChat = chats.find(chat => chat.id === selectedChatId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedChat?.messages]);

  const handleChatSelect = useCallback((chatId: string) => {
    setIsChatLoading(true);
    setSelectedChatId(chatId);
    navigate(`/c/${chatId}`, { replace: true });
    const chatExists = chats.some(chat => chat.id === chatId);
    if (!chatExists && isAuthenticated) {
      loadConversationHelper(chatId);
    } else {
      setIsChatLoading(false);
    }
  }, [navigate, chats, isAuthenticated, loadConversationHelper]);

  if (authLoading) {
    return null;
  }

  return (
    <div className="h-[100dvh] flex flex-col bg-[var(--color-app-bg)] text-[var(--color-text)] overflow-hidden">
      <Toaster position="top-center" />
      <Header
        theme={theme}
        toggleTheme={toggleTheme}
        isAuthenticated={isAuthenticated}
        showLogout={showLogout}
        setShowLogout={setShowLogout}
        onOpen={onOpen}
        navigate={navigate}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      <div className="flex-1 flex flex-col" style={{ marginTop: '8vh' }}>
        <div className="flex-1 flex overflow-hidden">
          <SidebarWrapper
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            chats={chats}
            selectedChatId={selectedChatId}
            onChatSelect={handleChatSelect}
            onNewChat={handleNewChatHelper}
            onLoadConversation={loadConversationHelper}
          />
          <ChatArea
            selectedChat={selectedChat}
            isChatLoading={isChatLoading}
            messagesEndRef={messagesEndRef}
            handleSendMessageHelper={handleSendMessageHelper}
            setChats={setChats}
            selectedChatId={selectedChatId}
            buttonLoading={buttonLoading}
            theme={theme}
          />
        </div>
      </div>
    </div>
  );
};

export default Layout; 