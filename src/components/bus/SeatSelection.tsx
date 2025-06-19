import React from 'react';

interface SeatSelectionProps {
  selectedSeats: any[];
  onViewSeatLayout: () => void;
  getSeatBackgroundColor?: (seat: any) => string;
}

const SeatSelection: React.FC<SeatSelectionProps> = ({
  selectedSeats,
  onViewSeatLayout,
  getSeatBackgroundColor = () => 'bg-green-500',
}) => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between flex-grow">
        <p className="text-xs"><strong>Recommended Seats:</strong></p>
      </div>
      <div className="inline-grid grid-cols-3 gap-1 text-xs">
        {selectedSeats.map((seat, index) => (
          <div key={index} className={`text-center rounded-md p-1 text-gray-900 ${getSeatBackgroundColor(seat)}`}>
            {seat.seat_number ? `${seat.seat_number}(${seat.type === 'window' ? 'W' : 'A'})` : ''}
          </div>
        ))}
      </div>
      <div className="mt-3">
        <button
          onClick={onViewSeatLayout}
          className="text-[10px] bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded transition-colors w-full"
        >
          View Seat Position
        </button>
      </div>
    </div>
  );
};

export default SeatSelection; 