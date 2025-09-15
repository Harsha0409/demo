import { useEffect, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import { Message } from '../../types/chat';
import { useTheme } from '../../context/ThemeContext';
import BusResults from '../bus/BusResults';
import { Sparkles } from 'lucide-react';
import CancellationCard from '../cancellation/CancellationCard';
import { trackGTMEvent } from '../../utils/gtm';

interface ChatMessageProps {
  message: Message;
  onBook: (busId: number) => void;
  selectedChatId?: string;
  setChats?: React.Dispatch<React.SetStateAction<any[]>>;
  isLatestAIMessage?: boolean;
  messagesEndRef?: React.RefObject<HTMLDivElement | null>;
}

export function ChatMessage({ message, onBook, selectedChatId, setChats, isLatestAIMessage, messagesEndRef }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const { theme } = useTheme();
  const isLoading = message.isLoading || false;
  const [minTimePassed, setMinTimePassed] = useState(false);
  const eventTrackedRef = useRef(false);

  // Always try to parse stringified JSON if possible
  let parsedContent: any = message.content;
  let isMalformedRecommendationString = false;

  if (typeof message.content === 'string') {
    try {
      parsedContent = JSON.parse(message.content);
    } catch {
      parsedContent = message.content;
      if (
        message.content.includes('recommendations: [object Object]') ||
        message.content.includes('[object Object]')
      ) {
        isMalformedRecommendationString = true;
      }
    }
  }

  useEffect(() => {
    // This effect ensures each message is tracked exactly once.
    if (eventTrackedRef.current) {
      return;
    }

    let gtmData: any = null;
    let eventName: string = '';

    if (isUser) {
      eventName = 'user_message';
      gtmData = {
        type: 'text',
        content: typeof message.content === 'string' ? message.content : '',
        chatId: selectedChatId,
        gtm: (message as any).gtm,
        method: (message as any).method,
        userId: (message as any).userId,
      };
    } else { // This is an AI Message
      eventName = 'ai_message';
      if (typeof parsedContent === 'object' && parsedContent !== null) {
        if (Array.isArray(parsedContent.recommendations)) {
          const recommendations = parsedContent.recommendations || [];
          const uniqueTripIds = new Set(recommendations.map((rec: any) => rec.tripID));
          const total_recommendation_cards = uniqueTripIds.size;
          const total_recommended_seats_by_category: { [key: string]: number } = {};
          let total_recommended_seats = 0;
          recommendations.forEach((rec: any) => {
            if (rec.recommended_seats) {
              for (const category in rec.recommended_seats) {
                const categorySeats = rec.recommended_seats[category];
                const count = (categorySeats.window?.length || 0) + (categorySeats.aisle?.length || 0);
                total_recommended_seats_by_category[category] = (total_recommended_seats_by_category[category] || 0) + count;
                total_recommended_seats += count;
              }
            }
          });
          gtmData = {
            type: 'bus_card',
            bus_recommendations: parsedContent,
            chatId: selectedChatId,
            analytics: {
              total_recommendation_cards,
              total_recommended_seats,
              total_recommended_seats_by_category,
            }
          };
        } else if (parsedContent.ticketData && parsedContent.ticketData.invoiceNumber) {
          eventName = 'book';
          gtmData = { ticketData: parsedContent.ticketData };
        } else if (parsedContent.success === true || parsedContent.data?.upcoming_travels) {
          gtmData = { type: 'cancel_card', data: parsedContent, chatId: selectedChatId };
        } else if (parsedContent.status === true && typeof parsedContent.message === 'string') {
          gtmData = { type: 'cancellation_success', data: parsedContent, chatId: selectedChatId };
        } else if (typeof parsedContent.summary === 'string' && !parsedContent.ticketData) {
          gtmData = { type: 'ticket_summary', data: parsedContent, chatId: selectedChatId };
        } else if (Object.keys(parsedContent).length > 0 && !isMalformedRecommendationString) {
          gtmData = { type: 'generic_json', data: parsedContent, chatId: selectedChatId };
        }
      } else if (typeof parsedContent === 'string' && parsedContent.trim() !== '' && !parsedContent.trim().startsWith('{')) {
        gtmData = { type: 'text', content: parsedContent, chatId: selectedChatId };
      }
    }

    if (eventName && gtmData) {
      trackGTMEvent(eventName, gtmData);
      eventTrackedRef.current = true;
    }
  }, [message.id, isUser, parsedContent, selectedChatId, isMalformedRecommendationString]);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isLoading && !isUser) {
      setMinTimePassed(false);
      timer = setTimeout(() => setMinTimePassed(true), 2000);
    } else {
      setMinTimePassed(false);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isLoading, isUser]);

  // --- CANCELLATION SUCCESS MESSAGE RENDERING ---
  if (
    !isUser &&
    typeof parsedContent === 'object' &&
    parsedContent !== null &&
    parsedContent.status === true &&
    typeof parsedContent.message === 'string'
  ) {
    // Typing animation for cancellation success message
    const [displayedText, setDisplayedText] = useState(isLatestAIMessage ? '' : parsedContent.message);
    useEffect(() => {
      if (!isLatestAIMessage) {
        setDisplayedText(parsedContent.message);
        return;
      }
      setDisplayedText('');
      let i = 0;
      let cancelled = false;
      function typeNext() {
        if (cancelled) return;
        setDisplayedText(parsedContent.message.slice(0, i + 1));
        if (messagesEndRef && messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
        if (i < parsedContent.message.length - 1) {
          i++;
          setTimeout(typeNext, 15);
        }
      }
      typeNext();
      return () => { cancelled = true; };
    }, [parsedContent.message, isLatestAIMessage, messagesEndRef]);
    return (
      <div className="flex justify-start items-start py-1 mb-4 gap-1">
        <div className="flex-1 ml-2 text-left">
          <div className="flex items-center gap-1 justify-between">
            <span className="font-medium text-gray-900 dark:text-gray-100">
              <span className="text-[#1765f3] dark:text-[#fbe822]">Ṧ</span>.AI
            </span>
          </div>
          <div className="prose dark:prose-invert max-w-none mt-1 text-xs sm:text-sm">
            <ReactMarkdown
              remarkPlugins={[remarkBreaks]}
              components={{
                a: (props) => (
                  <a {...props} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">
                    {props.children}
                  </a>
                ),
              }}
            >
              {displayedText}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    );
  }

  // --- CANCELLATION CARD RENDERING ---
  if (
    !isUser &&
    typeof parsedContent === 'object' &&
    parsedContent !== null &&
    (parsedContent.success === true || parsedContent.data?.upcoming_travels)
  ) {
    // Get the upcoming travels
    const upcomingTravels = parsedContent.success === true ? 
      parsedContent.data.upcoming_travels : 
      parsedContent;

    // Check if this is a "Where is my bus?" query
    const isWhereIsMyBusQuery = typeof message.content === 'string' && 
      message.content.toLowerCase().includes('where is my bus');

    let cancellationData;
    
    if (isWhereIsMyBusQuery) {
      // Helper function to convert month name to number
      function getMonthNumber(monthName: string): number {
        const months: { [key: string]: number } = {
          'January': 0, 'February': 1, 'March': 2, 'April': 3, 'May': 4, 'June': 5,
          'July': 6, 'August': 7, 'September': 8, 'October': 9, 'November': 10, 'December': 11
        };
        return months[monthName];
      }

      // Sort journeys by date and time to get the latest one
      const sortedJourneys = [...upcomingTravels].sort((a, b) => {
        // Parse the date and time strings
        const parseDateTime = (dateTimeStr: string) => {
          const [datePart, timePart] = dateTimeStr.split(' at ');
          const [month, day, year] = datePart.split(' ')[0].split(',')[0].split(' ');
          const [time, period] = timePart.split(' ');
          let [hours, minutes] = time.split(':').map(Number);
          
          // Convert to 24-hour format
          if (period === 'PM' && hours !== 12) hours += 12;
          if (period === 'AM' && hours === 12) hours = 0;
          
          return new Date(parseInt(year), getMonthNumber(month), parseInt(day), hours, minutes);
        };

        const dateA = parseDateTime(a.date);
        const dateB = parseDateTime(b.date);
        return dateB.getTime() - dateA.getTime();
      });

      // Take only the latest journey
      const latestJourney = sortedJourneys[0];
      cancellationData = {
        success: true,
        data: {
          upcoming_travels: [latestJourney],
          count: 1,
          fetch_timestamp: new Date().toISOString()
        }
      };
    } else {
      // For cancellation view, show all journeys
      cancellationData = parsedContent.success === true ? 
        parsedContent : 
        { 
          success: true, 
          data: { 
            upcoming_travels: upcomingTravels,
            count: upcomingTravels.length,
            fetch_timestamp: new Date().toISOString()
          } 
        };
    }

    return (
      <div className="flex justify-start items-start py-1 mb-4 gap-1">
        <div className="flex-1 ml-2 text-left">
          <div className="flex items-center gap-1 justify-between">
            <span className="font-medium text-gray-900 dark:text-gray-100">
              <span className="text-[#1765f3] dark:text-[#fbe822]">Ṧ</span>.AI
            </span>
          </div>
          <div className="mt-2 w-full">
            <CancellationCard 
              data={cancellationData} 
              selectedChatId={selectedChatId}
              setChats={setChats}
            />
          </div>
        </div>
      </div>
    );
  }

  // --- IMMEDIATE BUS CARD RENDERING ---
  if (
    !isUser &&
    typeof parsedContent === 'object' &&
    parsedContent !== null &&
    Array.isArray(parsedContent.recommendations)
  ) {
    return (
      <div className="flex justify-start items-start py-1 mb-4 gap-1">
        <div className="flex-1 ml-2 text-left">
          <div className="flex items-center gap-1 justify-between">
            <span className="font-medium text-gray-900 dark:text-gray-100"> 
              <span className="text-[#1765f3] dark:text-[#fbe822]">Ṧ</span>.AI
            </span>
          </div>
          <div className="mt-2 w-full">
            <BusResults searchQuery={parsedContent} onBook={onBook} />
          </div>
        </div>
      </div>
    );
  }

  // --- TICKET SUMMARY RENDERING (without ticket details) ---
  if (
    !isUser &&
    typeof parsedContent === 'object' &&
    parsedContent !== null &&
    typeof parsedContent.summary === 'string' &&
    !parsedContent.ticketData
  ) {
    // Typing animation for booking summary (no ticket details)
    const [displayedText, setDisplayedText] = useState(isLatestAIMessage ? '' : parsedContent.summary);
    useEffect(() => {
      if (!isLatestAIMessage) {
        setDisplayedText(parsedContent.summary);
        return;
      }
      setDisplayedText('');
      let i = 0;
      let cancelled = false;
      function typeNext() {
        if (cancelled) return;
        setDisplayedText(parsedContent.summary.slice(0, i + 1));
        if (messagesEndRef && messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
        if (i < parsedContent.summary.length - 1) {
          i++;
          setTimeout(typeNext, 15);
        }
      }
      typeNext();
      return () => { cancelled = true; };
    }, [parsedContent.summary, isLatestAIMessage, messagesEndRef]);
    return (
      <div className="flex justify-start items-start py-1 mb-4 gap-1">
        <div className="flex-1 ml-2 text-left">
          <div className="flex items-center gap-1 justify-between">
            <span className="font-medium text-gray-900 dark:text-gray-100">
              <span className="text-[#1765f3] dark:text-[#fbe822]">Ṧ</span>.AI
            </span>
          </div>
          <div className="prose dark:prose-invert max-w-none mt-1 text-xs sm:text-sm">
            <ReactMarkdown
              remarkPlugins={[remarkBreaks]}
              components={{
                a: (props) => (
                  <a {...props} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">
                    {props.children}
                  </a>
                ),
              }}
            >
              {displayedText}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    );
  }

  // --- TICKET DETAILS RENDERING ---
  if (
    !isUser &&
    typeof parsedContent === 'object' &&
    parsedContent !== null &&
    parsedContent.ticketData &&
    parsedContent.ticketData.invoiceNumber
  ) {
    // Build a safe summary string if missing
    const summaryText = typeof parsedContent.summary === 'string' && parsedContent.summary.trim() !== ''
      ? parsedContent.summary
      : `Ticket booked successfully. Invoice ${parsedContent.ticketData.invoiceNumber}`;

    // Typing animation for booking summary
    const [displayedText, setDisplayedText] = useState(isLatestAIMessage ? '' : summaryText);
    useEffect(() => {
      if (!isLatestAIMessage) {
        setDisplayedText(summaryText);
        return;
      }
      setDisplayedText('');
      let i = 0;
      let cancelled = false;
      function typeNext() {
        if (cancelled) return;
        setDisplayedText(summaryText.slice(0, i + 1));
        if (messagesEndRef && messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
        if (i < summaryText.length - 1) {
          i++;
          setTimeout(typeNext, 15);
        }
      }
      typeNext();
      return () => { cancelled = true; };
    }, [summaryText, isLatestAIMessage, messagesEndRef]);
    return (
      <div className="flex justify-start items-start py-1 mb-4 gap-1">
        <div className="flex-1 ml-2 text-left">
          <div className="flex items-center gap-1 justify-between">
            <span className="font-medium text-gray-900 dark:text-gray-100">
              <span className="text-[#1765f3] dark:text-[#fbe822]">Ṧ</span>.AI
            </span>
          </div>
          <div className="prose dark:prose-invert max-w-none mt-1 text-xs sm:text-sm">
            <ReactMarkdown
              remarkPlugins={[remarkBreaks]}
              components={{
                a: (props) => (
                  <a {...props} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">
                    {props.children}
                  </a>
                ),
              }}
            >
              {displayedText}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    );
  }

  const showLoader = (isLoading && !isUser) || (!minTimePassed && !isUser);

  // User message: always render as markdown/text
  if (isUser) {
    return (
      <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} items-start py-1 mb-4 gap-1`}>
        <div className={`flex-1 ${!isUser ? 'ml-2' : 'mr-2'} ${isUser ? 'text-right' : 'text-left'}`}>
          <div className="prose dark:prose-invert max-w-none mt-1 text-xs sm:text-sm">
            <ReactMarkdown
              remarkPlugins={[remarkBreaks]}
              components={{
                a: (props) => (
                  <a {...props} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">
                    {props.children}
                  </a>
                ),
              }}
            >
              {typeof message.content === 'string' ? message.content : JSON.stringify(message.content)}
            </ReactMarkdown>
          </div>
        </div>
        <div className="flex-shrink-0">
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-7 h-7">
              <circle
                cx="256"
                cy="256"
                r="256"
                fill={theme === 'dark' ? '#FBE822' : '#1765F3'}
              />
              <circle
                cx="256"
                cy="192"
                r="80"
                fill={theme === 'dark' ? '#1765F3' : '#FBE822'}
              />
              <path
                d="M256 288 C 160 288, 80 352, 80 432 L 432 432 C 432 352, 352 288, 256 288 Z"
                fill={theme === 'dark' ? '#1765F3' : '#FBE822'}
              />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  // Defensive: If assistant message is a string and does NOT look like JSON, but is not empty, render as markdown/text
  if (
    !isUser &&
    typeof parsedContent === 'string' &&
    parsedContent.trim() !== '' &&
    !parsedContent.trim().startsWith('{')
  ) {
    // Typing animation state
    const [displayedText, setDisplayedText] = useState(isLatestAIMessage ? '' : parsedContent);
    useEffect(() => {
      if (!isLatestAIMessage) {
        setDisplayedText(parsedContent);
        return;
      }
      setDisplayedText(''); // Reset when message changes
      let i = 0;
      let cancelled = false;
      function typeNext() {
        if (cancelled) return;
        setDisplayedText(parsedContent.slice(0, i + 1));
        if (messagesEndRef && messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
        if (i < parsedContent.length - 1) {
          i++;
          setTimeout(typeNext, 15); // Typing speed (ms per char)
        }
      }
      typeNext();
      return () => { cancelled = true; };
    }, [parsedContent, isLatestAIMessage, messagesEndRef]);

    return (
      <div className="flex justify-start items-start py-1 mb-4 gap-1">
        <div className="flex-1 ml-2 text-left">
          <div className="flex items-center gap-1 justify-between">
            <span className="font-medium text-gray-900 dark:text-gray-100">
              <span className="text-[#1765f3] dark:text-[#fbe822]">Ṧ</span>.AI
            </span>
          </div>
          <div className="prose dark:prose-invert max-w-none mt-1 text-xs sm:text-sm">
            <ReactMarkdown
              remarkPlugins={[remarkBreaks]}
              components={{
                a: (props) => (
                  <a {...props} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">
                    {props.children}
                  </a>
                ),
              }}
            >
              {displayedText}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    );
  }

  // Loader for assistant
  if (isLoading && !isUser) {
    return (
      <div className="flex justify-start items-start">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full flex items-center justify-center">
            {showLoader ? (
              <div className="flex items-center justify-center w-8 h-8" role="status" aria-label="Loading">
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
                  size={24}
                  fill="#fbe822"
                />
              </div>
            ) : null}
          </div>
        </div>
        {!showLoader && (
          <div className="flex-1 ml-2">
            <span className="font-medium text-gray-900 dark:text-gray-100">
              <span className="text-[#1765f3] dark:text-[#fbe822]">Ṧ</span>.AI
            </span>
          </div>
        )}
      </div>
    );
  }

  // Fallback for any other JSON object - render it as a code block
  if (
    !isUser &&
    typeof parsedContent === 'object' &&
    parsedContent !== null &&
    !parsedContent.recommendations &&
    !parsedContent.data?.upcoming_travels &&
    !parsedContent.status &&
    !parsedContent.summary &&
    !parsedContent.ticketData &&
    Object.keys(parsedContent).length > 0 &&
    !isMalformedRecommendationString
  ) {
    return (
      <div className="flex justify-start items-start py-1 mb-4 gap-1">
        <div className="flex-1 ml-2 text-left">
          <div className="flex items-center gap-1 justify-between">
            <span className="font-medium text-gray-900 dark:text-gray-100">
              <span className="text-[#1765f3] dark:text-[#fbe822]">Ṧ</span>.AI
            </span>
          </div>
          <pre className="mt-2 p-2 rounded-md bg-gray-100 dark:bg-gray-800 text-xs overflow-x-auto">
            <code>{JSON.stringify(parsedContent, null, 2)}</code>
          </pre>
        </div>
      </div>
    );
  }

    return null;
}