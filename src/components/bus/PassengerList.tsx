import React from 'react';
import { getSeatBackgroundColor } from '../../utils/busUtils';

interface PassengerListProps {
  passengerDetails: any[];
  setEditingIndex: (index: number) => void;
  setCurrentPassenger: (p: any) => void;
  setCurrentSeatIndex: (index: number) => void;
  theme: string;
  bus?: any;
  selectedSeats?: any[];
}

const PassengerList: React.FC<PassengerListProps> = ({
  passengerDetails,
  setEditingIndex,
  setCurrentPassenger,
  setCurrentSeatIndex,
  bus,
  selectedSeats = []
}) => {
  return (
    <div className="flex flex-wrap gap-1 mb-1 overflow-y-auto custom-scrollbar" style={{ maxHeight: '70px', width: '100%', padding: '4px', borderRadius: '8px' }}>
      {passengerDetails.map((passenger, index) =>
        passenger.name && passenger.age ? (
          <div
            key={index}
            className="flex h-6 px-2 items-center justify-between rounded-lg text-xs text-gray-800 dark:text-white border border-gray-300 dark:border-gray-700"
            style={{ background: 'transparent', cursor: 'pointer' }}
            onClick={() => {
              setEditingIndex(index);
              setCurrentPassenger({ ...passenger });
              setCurrentSeatIndex(index);
            }}
          >
            <span className="flex items-center">
              <div className={`mr-1 text-black text-[10px] font-medium px-1 rounded ${
                selectedSeats[index] && bus ? getSeatBackgroundColor(bus, selectedSeats[index]) : 'bg-green-500'
              }`}>
                {selectedSeats[index]?.seat_number || 'N/A'}
                <span className="ml-1">
                  ({selectedSeats[index]?.type === 'window' ? 'W' : 'A'})
                </span>
              </div>
              {passenger.name}
            </span>
            <button
              onClick={e => {
                e.stopPropagation();
                setEditingIndex(index);
                setCurrentPassenger({ ...passenger });
                setCurrentSeatIndex(index);
              }}
              className="ml-1 text-blue-400 hover:text-blue-600"
            >
              ✎
            </button>
          </div>
        ) : null
      )}
    </div>
  );
};

export default PassengerList;