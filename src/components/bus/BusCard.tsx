import React, { useState } from 'react';
import { BusWithCategory, getCategoryStyle, getCategorySeats, calculateCategoryFare, getSeatBackgroundColor } from '../../utils/busUtils';
import { convertToIST } from '../../utils/dateHelpers';
import CategoryBadge from '../common/CategoryBadge';
import BusCardModal from './BusCardModal';
import { trackGTMEvent } from '../../utils/gtm';

interface BusCardProps {
  bus: BusWithCategory;
  onBook: (busId: number) => void;
  chatId?: string;
  content?: string;
  analytics?: any;
  recommendations?: any[];
}

const BusCard: React.FC<BusCardProps> = ({ bus, onBook, chatId, content, analytics, recommendations }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const allSeats = getCategorySeats(bus, bus.category);
  const categoryStyle = getCategoryStyle(bus.category);
  const originalFare = calculateCategoryFare(allSeats);

  const handleCardClick = () => {
    // Determine displayed boarding point
    let displayedBoarding = null;
    if (bus.recommended_boarding_points?.length) {
      const match = bus.allBoardingPoints.find(bp =>
        bp.boarding_point.name === bus.recommended_boarding_points?.[0]?.name
      );
      if (match) displayedBoarding = match.boarding_point;
    }
    if (!displayedBoarding) {
      displayedBoarding = bus.allBoardingPoints[0]?.boarding_point || null;
    }

    // Determine displayed dropping point
    let displayedDropping = null;
    if (bus.recommended_dropping_points?.length) {
      const match = bus.allDroppingPoints.find(dp =>
        dp.dropping_point.name === bus.recommended_dropping_points?.[0]?.name
      );
      if (match) displayedDropping = match.dropping_point;
    }
    if (!displayedDropping) {
      displayedDropping = bus.allDroppingPoints[0]?.dropping_point || null;
    }

    const eventPayload = {
      type: 'bus_card',
      chatId,
      content,
      analytics,
      bus_recommendations: recommendations,
      tripId: bus.tripID,
      seat_category: bus.category,
      displayed_boarding_point: displayedBoarding ? { name: displayedBoarding.name, landmark: displayedBoarding.landmark } : null,
      displayed_dropping_point: displayedDropping ? { name: displayedDropping.name, landmark: displayedDropping.landmark } : null,
    };

    const recommendedSeats = allSeats.map(seat => `${seat.seat_number}${seat.type === 'window' ? 'W' : 'A'}`);

    trackGTMEvent('look', {
      tripId: bus.tripID,
      boarding: eventPayload.displayed_boarding_point,
      dropping: eventPayload.displayed_dropping_point,
      seats: recommendedSeats
    });

    setIsModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Bus Card */}
      <div
        className="rounded-lg shadow-md px-2 py-2 cursor-pointer transition-colors"
        style={{
          backgroundColor: 'var(--color-primary)',
          color: 'var(--color-text-off-white)',
        }}
        onClick={handleCardClick}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-secondary)')}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--color-primary)')}
      >
        <div className="flex items-stretch w-full mt-2">
          {/* LEFT: Start Details + Recommended Seats */}
          <div className="w-1/3 flex flex-col items-start justify-start">
            <div className="text-left mb-2">
              <p className="text-sm font-bold">{convertToIST(bus.startTime).time}</p>
              <p className="text-sm font-bold">{bus.from}</p>
              {bus.recommended_boarding_points && (
                <div className="text-xs">
                  {bus.recommended_boarding_points.map((point, idx) => (
                    <span key={idx}>
                      {point.name}
                      {idx < (bus.recommended_boarding_points?.length ?? 0) - 1 ? ', ' : ''}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="text-xs">
              <div className='font-bold'><p>Recommended Seats:</p></div>
              <div className="mt-1 grid grid-cols-3 gap-1">
                {allSeats?.map((seat, index) => (
                  <div
                    key={index}
                    className={`text-[10px] sm:text-xs rounded-md px-1 py-0.5 text-gray-900 flex items-center justify-center ${getSeatBackgroundColor(bus, seat)}`}
                  >
                    {`${seat.seat_number}(${seat.type === 'window' ? 'W' : 'A'})`}
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* CENTER: Clock/Duration + Category Tag */}
          <div className="w-1/3 flex flex-col items-center justify-center">
            <div className="flex flex-col items-center mb-2 w-full">
              <div className="flex items-center w-full">
                <div className="flex-1 h-[1.5px] bg-[#fbe822]" />
                <span className="mx-2 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#fbe822]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                    <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l2 2" />
                  </svg>
                </span>
                <div className="flex-1 h-[1.5px] bg-[#fbe822]" />
              </div>
              <div className="flex justify-center mt-1">
                <p className="text-sm font-semibold text-[#fbe822]">{bus.duration}</p>
              </div>
            </div>
            <CategoryBadge category={bus.category} background={categoryStyle.background} textColor={categoryStyle.textColor} className="mt-3" />
          </div>
          {/* RIGHT: End Details + Fare Details */}
          <div className="w-1/3 flex flex-col items-end justify-start">
            <div className="text-right mb-2">
              <p className="text-sm font-bold">{convertToIST(bus.endTime).time}</p>
              <p className="text-sm font-bold">{bus.to}</p>
              {bus.recommended_dropping_points && (
                <div className="text-xs">
                  {bus.recommended_dropping_points.map((point, idx) => (
                    <span key={idx}>
                      {point.name} {idx < (bus.recommended_dropping_points?.length ?? 0) - 1 ? ', ' : ''}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="text-sm">
              <div className='font-bold'>Total Fare:</div>
              <div>
                <span className='font-bold'>₹{originalFare.baseFare.toFixed(0)}{' '}</span>
                <span className='text-xs'> + GST</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Modal for Trip Review */}
      <BusCardModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} bus={bus} onBook={onBook} />
    </div>
  );
};

export default BusCard; 