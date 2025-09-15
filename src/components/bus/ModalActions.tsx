import React from "react";

interface ModalActionsProps {
  onClose: () => void;
  onConfirm: () => void;
  isProcessing: boolean;
  areAllPassengersValid: boolean;
  isSeatSelected?: boolean;
}

const ModalActions: React.FC<ModalActionsProps> = ({
  onClose,
  onConfirm,
  isProcessing,
  areAllPassengersValid,
  isSeatSelected,
}) => {
  return (
    <div className="flex justify-between mt-3">
      <button
        onClick={onClose}
        className="py-1 px-3 rounded-lg font-medium text-xs transition-colors bg-gray-300 text-gray-800 hover:bg-gray-400"
      >
        Close
      </button>
      <button
        onClick={onConfirm}
        disabled={isProcessing || !areAllPassengersValid || isSeatSelected}
        className={`py-1 px-3 rounded-lg font-medium text-xs transition-colors ${
          isProcessing || !areAllPassengersValid || isSeatSelected
            ? "bg-gray-400 text-gray-700 cursor-not-allowed"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
      >
        {isProcessing ? "Processing..." : "Confirm Payment"}
      </button>
    </div>
  );
};

export default ModalActions;
