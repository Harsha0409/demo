import React from 'react';

interface ModalActionsProps {
  onClose: () => void;
  handleConfirmPayment: () => void;
  selectedSeatsForCancellation: Set<string>;
  isProcessing: boolean;
  theme: string;
}

const ModalActions: React.FC<ModalActionsProps> = ({
  onClose,
  handleConfirmPayment,
  selectedSeatsForCancellation,
  isProcessing,
  theme,
}) => {
  return (
    <div 
      className={`flex-shrink-0 flex justify-end gap-2 border-t p-2 ${
        theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
      }`}
      style={{
        opacity: 1,
        transform: "translateY(0)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1) 0.15s"
      }}
    >
      <button 
        onClick={onClose}
        className={`inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 text-sm ${theme === 'dark' 
          ? 'border border-gray-600 bg-gray-800 text-gray-200 hover:bg-gray-700 hover:text-white' 
          : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
        }`}
      >
        Cancel
      </button>
      <button 
        className={`inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 text-sm ${
          selectedSeatsForCancellation.size > 0
            ? 'bg-red-600 hover:bg-red-700 text-white'
            : 'bg-gray-400 cursor-not-allowed text-gray-600'
        }`}
        disabled={selectedSeatsForCancellation.size === 0 || isProcessing}
        onClick={handleConfirmPayment}
      >
        {isProcessing ? 'Processing...' : 'Proceed with Cancellation'}
      </button>
    </div>
  );
};

export default ModalActions; 