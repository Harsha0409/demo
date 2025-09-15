import React from 'react';

interface SeatSelectionProps {
  selectedTravel: any;
  selectedSeatsForCancellation: Set<string>;
  toggleSeatSelection: (seatNumber: string) => void;
  theme: string;
}

const getSeatBackgroundColor = (gender: string) => {
  if (gender.toLowerCase() === 'female') {
    return 'bg-pink-200 text-pink-900';
  }
  return 'bg-yellow-200 text-yellow-900';
};

const SeatSelection: React.FC<SeatSelectionProps> = ({
  selectedTravel,
  selectedSeatsForCancellation,
  toggleSeatSelection,
  theme,
}) => {
  if (!selectedTravel) return null;
  return (
    <div className={`rounded-lg border shadow-sm ${
      theme === 'dark' 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-blue-200'
    }`}>
      <div className="flex flex-wrap p-2 gap-2">
        {selectedTravel.policy.cancelSeatResponseDto.map((seat: any) => {
          if (!seat.active) return null;
          return (
            <div
              key={seat.seatNumber}
              onClick={() => toggleSeatSelection(seat.seatNumber)}
              className={`p-2 rounded-lg cursor-pointer transition-colors flex items-center gap-2 w-fit ${
                selectedSeatsForCancellation.has(seat.seatNumber)
                  ? "bg-red-500 text-white"
                  : getSeatBackgroundColor(seat.gender)
              }`}
            >
              <div className="font-bold text-sm">{seat.seatNumber}</div>
              <div className="text-xs truncate">{seat.name}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SeatSelection; 