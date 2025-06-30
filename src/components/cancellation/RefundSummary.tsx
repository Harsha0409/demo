import React from 'react';
import { trackGTMEvent } from '../../utils/gtm';

interface RefundSummaryProps {
  selectedRefundMethod: 'cash' | 'coins';
  setSelectedRefundMethod: (m: 'cash' | 'coins') => void;
  dynamicRefundCalculation: any;
  getSelectedRefundAmount: () => string;
  selectedSeatsForCancellation: Set<string>;
  isProcessing: boolean;
  theme: string;
}

const RefundSummary: React.FC<RefundSummaryProps> = ({
  selectedRefundMethod,
  setSelectedRefundMethod,
  dynamicRefundCalculation,
  getSelectedRefundAmount,
  selectedSeatsForCancellation,
  theme,
}) => {
  return (
    <div className={`rounded-lg border shadow-sm overflow-hidden ${
      theme === 'dark' 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h4 className={`text-base font-bold ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>
            Method of Refund
          </h4>
          <div className={`text-lg font-bold ${
            selectedSeatsForCancellation.size > 0
              ? theme === 'dark' ? 'text-green-400' : 'text-green-600'
              : theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
          }`}>
            You Get: {getSelectedRefundAmount()}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Original Payment Source */}
          <div 
            className={`rounded-lg border-2 p-4 cursor-pointer transition-all ${
              selectedRefundMethod === 'cash'
                ? theme === 'dark'
                  ? 'border-blue-500 bg-blue-900/20'
                  : 'border-blue-500 bg-blue-50'
                : theme === 'dark'
                  ? 'border-gray-600 bg-gray-700'
                  : 'border-gray-300 bg-gray-50'
            }`}
            onClick={() => {
              setSelectedRefundMethod('cash');
              trackGTMEvent('cancel_card_refund_method_selected', { method: 'cash' });
            }}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedRefundMethod === 'cash'
                    ? 'border-blue-500 bg-blue-500'
                    : theme === 'dark'
                      ? 'border-gray-500'
                      : 'border-gray-300'
                }`}>
                  {selectedRefundMethod === 'cash' && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'
                  }`}>
                    🏛️
                  </div>
                  <h5 className={`font-semibold text-sm ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Original Payment Source
                  </h5>
                </div>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  The refund will be credited to your source account
                </p>
                <div className={`text-sm font-bold mt-2 ${
                  selectedSeatsForCancellation.size > 0 ? 'text-green-500' : 
                  theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  ₹{(dynamicRefundCalculation?.cashRefund.amount || 0).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
          {/* Green Coins */}
          <div 
            className={`rounded-lg border-2 p-4 cursor-pointer transition-all relative ${
              selectedRefundMethod === 'coins'
                ? theme === 'dark'
                  ? 'border-blue-500 bg-blue-900/20'
                  : 'border-blue-500 bg-blue-50'
                : theme === 'dark'
                  ? 'border-gray-600 bg-gray-700'
                  : 'border-gray-300 bg-gray-50'
            }`}
            onClick={() => {
              setSelectedRefundMethod('coins');
              trackGTMEvent('cancel_card_refund_method_selected', { method: 'coins' });
            }}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedRefundMethod === 'coins'
                    ? 'border-blue-500 bg-blue-500'
                    : theme === 'dark'
                      ? 'border-gray-500'
                      : 'border-gray-300'
                }`}>
                  {selectedRefundMethod === 'coins' && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center">
                    💰
                  </div>
                  <h5 className={`font-semibold text-sm ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Green Coins
                  </h5>
                  <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                    Instant
                  </div>
                </div>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  The refund will be credited to your Green Coin Wallet
                </p>
                <div className={`text-sm font-bold mt-2 ${
                  selectedSeatsForCancellation.size > 0 ? 'text-green-500' : 
                  theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  {dynamicRefundCalculation?.coinsRefund.coins || 0} Coins
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefundSummary; 