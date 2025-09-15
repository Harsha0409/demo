import React from 'react';

interface FareBreakdownProps {
  baseFare: number;
  gst: number;
  discount: number;
  freshCardPurchase?: number;
  greenCoinsDiscount: number;
  freshCardDiscount: number;
  total: number;
}

const FareBreakdown: React.FC<FareBreakdownProps> = ({
  baseFare,
  gst,
  discount,
  freshCardPurchase = 0,
  greenCoinsDiscount,
  freshCardDiscount,
  total,
}) => (
  <div className="space-y-1 w-full text-left">
    <div className="flex justify-between text-xs">
      <strong>Base Fare:</strong>
      <span>₹{baseFare.toFixed(2)}</span>
    </div>
    <div className="flex justify-between text-xs">
      <strong>GST:</strong>
      <span>₹{gst.toFixed(2)}</span>
    </div>
    <div className="flex justify-between text-xs">
      <strong>Discount:</strong>
      <span>₹{discount.toFixed(2)}</span>
    </div>
    {freshCardPurchase > 0 && (
      <div className="flex justify-between text-xs">
        <strong>FreshCard Purchase:</strong>
        <span>₹{freshCardPurchase.toFixed(2)}</span>
      </div>
    )}
    {greenCoinsDiscount > 0 && (
      <div className="flex justify-between text-xs">
        <strong>Green Coins:</strong>
        <span>-₹{greenCoinsDiscount.toFixed(2)}</span>
      </div>
    )}
    {freshCardDiscount > 0 && (
      <div className="flex justify-between text-xs">
        <strong>FreshCard:</strong>
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

export default FareBreakdown; 