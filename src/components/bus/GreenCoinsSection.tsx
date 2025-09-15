import React from 'react';
import { trackGTMEvent } from '../../utils/gtm';
import { GreenCoins } from '../../types/chat';

interface GreenCoinsSectionProps {
  greenCoins: GreenCoins | null;
  appliedGreenCoins: number;
  setAppliedGreenCoins: (val: number) => void;
  onRedeem: () => void;
  theme: string;
  busId: number;
}

const GreenCoinsSection: React.FC<GreenCoinsSectionProps> = ({
  greenCoins,
  appliedGreenCoins,
  setAppliedGreenCoins,
  onRedeem,
  busId,
}) => {
  return (
    <div className="flex flex-col justify-between bg-gray-50 dark:bg-gray-700 rounded-lg px-2 py-2 flex-1 min-h-[3rem]">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center">
          <p className="text-[10px] font-medium text-gray-700 dark:text-gray-300">
            Green Coins: <span className="text-xs font-bold text-green-600 ml-1">
              {greenCoins?.available || 0}
            </span>
          </p>
        </div>
        {appliedGreenCoins > 0 ? (
          <div className="flex items-center space-x-1">
            <button
              onClick={() => {
                setAppliedGreenCoins(0);
                trackGTMEvent('bus_card_green_coins_removed', { busId: busId });
              }}
              className="text-[10px] px-2 py-0.5 rounded-full transition-colors bg-red-400 hover:bg-red-500 text-white font-bold"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-1">
            <button 
              onClick={onRedeem}
              disabled={!greenCoins || greenCoins.available <= 0}
              className={`text-[10px] px-2 py-0.5 rounded-full transition-colors font-bold ${
                greenCoins && greenCoins.available > 0
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Apply
            </button>
          </div>
        )}
      </div>
      <div className="text-[10px] mt-1 font-bold text-gray-700 dark:text-gray-300">
         'Earn & Save on rides'
      </div>
    </div>
  );
};

export default GreenCoinsSection; 