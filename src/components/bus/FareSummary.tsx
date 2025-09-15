import React from "react";

interface FareSummaryProps {
  baseFare: number;
  gst: number;
  discount: number;
  freshCardPurchase: number;
  greenCoinsDiscount: number;
  freshCardDiscount: number;
  total: number;
}

const FareSummary: React.FC<FareSummaryProps> = ({
  baseFare,
  gst,
  discount,
  freshCardPurchase,
  greenCoinsDiscount,
  freshCardDiscount,
  total,
}) => {
  return (
    <div className="space-y-1 w-full text-left">
      <div className="flex justify-between text-xs">
        <span>Base Fare:</span>
        <span>₹{baseFare.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-xs">
        <span>GST:</span>
        <span>₹{gst.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-xs">
        <span>Discount:</span>
        <span>-₹{Math.abs(discount).toFixed(2)}</span>
      </div>
      {freshCardPurchase > 0 && (
        <div className="flex justify-between text-xs">
          <span>Fresh Card Purchase:</span>
          <span>+₹{freshCardPurchase.toFixed(2)}</span>
        </div>
      )}
      {greenCoinsDiscount > 0 && (
        <div className="flex justify-between text-xs">
          <span>Green Coins:</span>
          <span>-₹{greenCoinsDiscount.toFixed(2)}</span>
        </div>
      )}
      {freshCardDiscount > 0 && (
        <div className="flex justify-between text-xs">
          <span>Fresh Card:</span>
          <span>-₹{freshCardDiscount.toFixed(2)}</span>
        </div>
      )}
      <div className="border-t border-gray-300 my-1"></div>
      <div className="flex justify-between text-xs font-semibold">
        <strong>Total Fare:</strong>
        <span>₹{total.toFixed(2)}</span>
      </div>
      <div className="border-t border-gray-300 my-1"></div>
    </div>
  );
};

export default FareSummary;
