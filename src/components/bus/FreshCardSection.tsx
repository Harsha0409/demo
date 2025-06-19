import React from 'react';

interface FreshCardSectionProps {
  freshCard: any;
  appliedFreshCard: boolean;
  setAppliedFreshCard: (val: boolean) => void;
  isPurchasingFreshCard: boolean;
  setIsPurchasingFreshCard: (val: boolean) => void;
  freshCardPurchaseAmount: number;
  theme: string;
  getCurrentFreshCardBalance: (freshCard: any, isPurchasingFreshCard: boolean, appliedFreshCard: boolean, freshCardPurchaseAmount: number) => number;
  isFreshCardAvailable: (freshCard: any) => boolean;
}

const FreshCardSection: React.FC<FreshCardSectionProps> = ({
  freshCard,
  appliedFreshCard,
  setAppliedFreshCard,
  isPurchasingFreshCard,
  setIsPurchasingFreshCard,
  freshCardPurchaseAmount,
  getCurrentFreshCardBalance,
  isFreshCardAvailable
}) => {
  return (
    <div className="flex flex-col justify-between bg-gray-50 dark:bg-gray-700 rounded-lg px-2 py-2 flex-1 min-h-[3rem]">
      <div className="flex justify-between w-full">
        <div className="text-gray-700 dark:text-gray-300 text-[10px] font-bold">
          FRESH CARD
        </div>
        {isFreshCardAvailable(freshCard) || isPurchasingFreshCard ? (
          <button 
            onClick={() => setAppliedFreshCard(!appliedFreshCard)}
            className={`ml-auto text-[10px] px-2 py-1 rounded transition-colors font-medium ${
              appliedFreshCard 
                ? 'bg-red-400 hover:bg-red-500 text-white'
                : 'bg-yellow-400 hover:bg-yellow-500 text-gray-900'
            }`}
          >
            {appliedFreshCard ? 'Remove' : 'Apply'}
          </button>
        ) : (
          <button 
            onClick={() => setIsPurchasingFreshCard(true)}
            className="ml-auto text-[10px] px-2 py-1 rounded transition-colors font-medium bg-green-500 hover:bg-green-600 text-white"
          >
            Add
          </button>
        )}
      </div>
      <p className="text-[10px] text-gray-700 dark:text-gray-300 mt-1 w-full text-left">
        {isPurchasingFreshCard && appliedFreshCard
          ? `Available Balance: ₹${getCurrentFreshCardBalance(freshCard, isPurchasingFreshCard, appliedFreshCard, freshCardPurchaseAmount)}`
          : isFreshCardAvailable(freshCard) && appliedFreshCard
            ? `Available Balance: ₹${getCurrentFreshCardBalance(freshCard, isPurchasingFreshCard, appliedFreshCard, freshCardPurchaseAmount)}`
            : 'Save ₹500 On Fresh Bus Rides'
        }
      </p>
    </div>
  );
};

export default FreshCardSection; 