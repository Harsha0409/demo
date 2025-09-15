import React from 'react';
import { ChatMessage } from '../layout/ChatMessage';
import ChatInput from '../layout/ChatInput';
import { Sparkles } from 'lucide-react';
import { Logo } from '../common/Logo';
import { Chat } from '../../types/chat';

interface ChatAreaProps {
  selectedChat: Chat | undefined;
  isChatLoading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  handleSendMessageHelper: (content: string) => Promise<void>;
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
  selectedChatId: string;
  buttonLoading: string | null;
  theme: string;
}

const ChatArea: React.FC<ChatAreaProps> = ({
  selectedChat,
  isChatLoading,
  messagesEndRef,
  handleSendMessageHelper,
  setChats,
  selectedChatId,      
}) => {
  // Find the index of the latest AI message
  const aiMessages = selectedChat?.messages.filter(m => m.role === 'assistant') || [];
  const latestAIMessageId = aiMessages.length > 0 ? aiMessages[aiMessages.length - 1].id : null;

  return (
    <div className="flex-1 flex flex-col items-center justify-center">
      {(selectedChat?.messages.length === 0 || !selectedChat) ? (
        <div className="flex flex-col items-center justify-center w-[90%] gap-1">
          <Logo className="h-16 w-auto" />
          <div className="flex items-center justify-center font-semibold text-base sm:text-lg">
            <span className="text-[#1765f3] dark:text-[#fbe822]">Ṧ</span>.AI
            <span className="text-gray-700 dark:text-gray-300">- Your assistant for Freshbus bookings</span>
          </div>
          <div className="w-[100%] mx-auto max-w-md">
            <ChatInput onSend={handleSendMessageHelper} />
          </div>
          <style>{`
            .animated-gradient {
              background: linear-gradient(90deg, #2A284A, #403C6F, #514F85);
              background-size: 200% 100%;
              background-position: left center;
              transition: background-position 0.8s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .animated-gradient:hover {
              background-position: right center;
            }
          `}</style>
          <div className="flex flex-col items-center justify-center w-full mt-1 ">
            <button
              onClick={() => handleSendMessageHelper("Book a ticket from Hyderabad to Vijayawada for  tomorrow")}
              className={`animated-gradient text-white px-4 py-1.5 text-sm rounded-full font-medium flex items-center gap-1.5`}
            >
              <div className="flex items-center gap-1.5">
                <div className="relative w-4 h-4">
                  <style>
                    {`
                      @keyframes sparkle-pulse {
                        0%, 100% { filter: brightness(0.8); transform: scale(0.9); }
                        50% { filter: brightness(1.5); transform: scale(1.2); }
                      }
                      .sparkle-pulse {
                        animation: sparkle-pulse 1.2s ease-in-out infinite;
                      }
                    `}
                  </style>
                  <Sparkles
                    className="text-[#fbe822] sparkle-pulse"
                    size={16}
                    fill="#fbe822"
                  />
                </div>
                <span>Book a ticket from Hyderabad to Vijayawada for tomorrow</span>
              </div>
            </button>
            <div className="flex flex-wrap justify-center gap-2 w-[100%] max-w-md mt-2">
              <button
                onClick={() => handleSendMessageHelper("Where is my Bus?")}
                className={`animated-gradient text-white px-4 py-1.5 text-sm rounded-full font-medium flex items-center gap-1.5`}  
              >
                <div className="flex items-center gap-1.5">
                  <div className="relative w-4 h-4">
                    <Sparkles
                      className="text-[#fbe822] sparkle-pulse"
                      size={16}
                      fill="#fbe822"
                    />
                  </div>
                  <span>Where is my Bus?</span>
                </div>
              </button>
              <button
                onClick={() => handleSendMessageHelper("Green coins balance")}
                className={`animated-gradient text-white px-4 py-1.5 text-sm rounded-full font-medium flex items-center gap-1.5`}  
              >
                <div className="flex items-center gap-1.5">
                  <div className="relative w-4 h-4">
                    <Sparkles
                      className="text-[#fbe822] sparkle-pulse"
                      size={16}
                      fill="#fbe822"
                    />
                  </div>
                  <span>Green coins balance</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-full w-full pb-20">
          {/* Chat messages area */}
          <div className="fixed left-0 right-0" style={{ top: '3rem', bottom: '4.5rem', zIndex: 10 }}>
            <div className="w-[98%] sm:w-[75%] mx-auto px-2 sm:px-4 lg:px-6 h-full overflow-y-auto hide-scrollbar">
              {isChatLoading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1765f3] dark:border-[#fbe822]"></div>
                    <p className="text-[var(--color-text)] text-sm">Loading conversation...</p>
                  </div>
                </div>
              ) : (
                <div className="py-1.5 space-y-1">
                  {selectedChat?.messages.map((message) => (
                    <ChatMessage
                      key={message.id}
                      message={message}
                      onBook={() => { }}
                      selectedChatId={selectedChatId}
                      setChats={setChats}
                      isLatestAIMessage={message.role === 'assistant' && message.id === latestAIMessageId}
                      messagesEndRef={messagesEndRef}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          </div>
          <div
            className="bg-[var(--color-app-bg)] fixed left-0 bottom-0 w-full flex items-center justify-center"
            style={{
              height: '4.5rem',
            }}
          >
            <div className="w-[98%] sm:w-[75%] mx-auto px-2 sm:px-4 lg:px-6 flex items-center h-full">
              <ChatInput onSend={handleSendMessageHelper} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatArea; 