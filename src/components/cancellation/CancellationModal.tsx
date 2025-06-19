import React from 'react';
import ReactDOM from 'react-dom';
import RefundPolicySection from './RefundPolicySection';
import RefundSummary from './RefundSummary';
import SeatSelection from './SeatSelection';
import ModalActions from './ModalActions';

interface CancellationModalProps {
  isOpen: boolean;
  isModalVisible: boolean;
  isModalClosing: boolean;
  onClose: () => void;
  selectedTravel: any;
  selectedSeatsForCancellation: Set<string>;
  setSelectedSeatsForCancellation: (s: Set<string>) => void;
  showRefundPolicies: boolean;
  setShowRefundPolicies: (b: boolean) => void;
  selectedRefundMethod: 'cash' | 'coins';
  setSelectedRefundMethod: (m: 'cash' | 'coins') => void;
  isProcessing: boolean;
  dynamicRefundCalculation: any;
  getContextualRefundValue: (policy: any, refundItem: any) => string;
  getSelectedRefundAmount: () => string;
  handleConfirmPayment: () => void;
  toggleSeatSelection: (seatNumber: string) => void;
  theme: string;
}


const CancellationModal: React.FC<CancellationModalProps> = ({
  isOpen,
  isModalVisible,
  onClose,
  selectedTravel,
  selectedSeatsForCancellation,
  showRefundPolicies,
  setShowRefundPolicies,
  selectedRefundMethod,
  setSelectedRefundMethod,
  isProcessing,
  dynamicRefundCalculation,
  getContextualRefundValue,
  getSelectedRefundAmount,
  handleConfirmPayment,
  toggleSeatSelection,
  theme,
}) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-90 backdrop-blur-sm" 
      style={{ 
        margin: 0, 
        padding: 0,
        opacity: isModalVisible ? 1 : 0,
        transition: "opacity 0.3s ease-in-out"
      }}
      onClick={onClose}
    >
      {/* Modal Content */}
      <div 
        className={`relative rounded-lg shadow-lg border w-[800px] max-w-[90vw] max-h-[90vh] flex flex-col ${
          theme === 'dark' 
            ? 'bg-gray-900 text-white border-gray-700' 
            : 'bg-white text-gray-900 border-gray-200'
        }`}
        style={{
          transform: isModalVisible ? "scale(1) translateY(0)" : "scale(0.95) translateY(20px)",
          opacity: isModalVisible ? 1 : 0,
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {selectedTravel && (
          <>
            {/* Fixed Header */}
            <div 
              className={`flex-shrink-0 px-2 py-2 border-b ${
                theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
              }`}
              style={{
                opacity: isModalVisible ? 1 : 0,
                transform: isModalVisible ? "translateY(0)" : "translateY(-10px)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1) 0.05s"
              }}
            >
              <h3 className={`text-lg font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>
                Cancellation Details
              </h3>
            </div>

            {/* Content - Always scrollable with fixed height */}
            <div 
              className="flex-1 overflow-y-auto custom-scrollbar px-2 py-2 space-y-3 min-h-0"
              style={{
                opacity: isModalVisible ? 1 : 0,
                transform: isModalVisible ? "translateY(0)" : "translateY(10px)",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.1s"
              }}
            >
              <h4 className={`text-base font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>
                Select Seats for Cancellation
              </h4>
              <SeatSelection
                selectedTravel={selectedTravel}
                selectedSeatsForCancellation={selectedSeatsForCancellation}
                toggleSeatSelection={toggleSeatSelection}
                theme={theme}
              />

              {/* Refund Policies - Show when expanded */}
              <RefundPolicySection
                showRefundPolicies={showRefundPolicies}
                setShowRefundPolicies={setShowRefundPolicies}
                selectedTravel={selectedTravel}
                dynamicRefundCalculation={dynamicRefundCalculation}
                getContextualRefundValue={getContextualRefundValue}
                selectedSeatsForCancellation={selectedSeatsForCancellation}
                theme={theme}
              />

              {/* Method of Refund Section */}
              <RefundSummary
                selectedRefundMethod={selectedRefundMethod}
                setSelectedRefundMethod={setSelectedRefundMethod}
                dynamicRefundCalculation={dynamicRefundCalculation}
                getSelectedRefundAmount={getSelectedRefundAmount}
                selectedSeatsForCancellation={selectedSeatsForCancellation}
                isProcessing={isProcessing}
                theme={theme}
              />
            </div>
            {/* Fixed Footer */}
            <ModalActions
              onClose={onClose}
              handleConfirmPayment={handleConfirmPayment}
              selectedSeatsForCancellation={selectedSeatsForCancellation}
              isProcessing={isProcessing}
              theme={theme}
            />
          </>
        )}
      </div>
    </div>,
    document.body
  );
};

export default CancellationModal; 