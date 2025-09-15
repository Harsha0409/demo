import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface RefundPolicySectionProps {
  showRefundPolicies: boolean;
  setShowRefundPolicies: (b: boolean) => void;
  selectedTravel: any;
  dynamicRefundCalculation: any;
  getContextualRefundValue: (policy: any, refundItem: any) => string;
  totalRefundCalculation: any;
  getTotalRefundValue: (policy: any, refundItem: any) => string;
  selectedSeatsForCancellation: Set<string>;
  theme: string;
}

const RefundPolicySection: React.FC<RefundPolicySectionProps> = ({
  showRefundPolicies,
  setShowRefundPolicies,
  selectedTravel,
  // dynamicRefundCalculation,
  // getContextualRefundValue,
  totalRefundCalculation,
  getTotalRefundValue,
  selectedSeatsForCancellation,
  theme,
}) => {
  if (!selectedTravel) return null;
  return (
    <div
      className={`rounded-lg border shadow-sm overflow-hidden mt-4 ${
        theme === "dark"
          ? "bg-gray-800 border-gray-700"
          : "bg-white border-gray-200"
      }`}
    >
      <div
        className={`flex items-center justify-between cursor-pointer p-3 transition-colors ${
          theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-50"
        }`}
        onClick={() => setShowRefundPolicies(!showRefundPolicies)}
      >
        <h4
          className={`text-base font-bold ${
            theme === "dark" ? "text-white" : "text-gray-800"
          }`}
        >
          View Refund Policies
        </h4>
        {showRefundPolicies ? (
          <ChevronUp
            className={`w-5 h-5 ${
              theme === "dark" ? "text-gray-300" : "text-gray-600"
            }`}
          />
        ) : (
          <ChevronDown
            className={`w-5 h-5 ${
              theme === "dark" ? "text-gray-300" : "text-gray-600"
            }`}
          />
        )}
      </div>
      {showRefundPolicies && (
        <div
          className={`border-t px-3 pb-3 pt-2 space-y-4 ${
            theme === "dark"
              ? "border-gray-700 bg-gray-800"
              : "border-gray-200 bg-white"
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedTravel.policy.mobilePolicy.map((policy: any) => {
              const dynamicRefund = totalRefundCalculation;
              const currentRefundAmount = policy.isCoinsPolicy
                ? `${dynamicRefund?.coinsRefund.coins || 0} coins (${
                    dynamicRefund?.coinsRefund.percentage || 0
                  }%)`
                : `₹${(dynamicRefund?.cashRefund.amount || 0).toFixed(2)} (${
                    dynamicRefund?.cashRefund.percentage || 0
                  }%)`;
              return (
                <div
                  key={policy.id}
                  className={`rounded-lg border shadow-sm overflow-hidden ${
                    theme === "dark"
                      ? "bg-gray-700 border-gray-600"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2 min-w-0 flex-1">
                        <div className="min-w-0 flex-1">
                          <h5
                            className={`font-semibold text-sm truncate ${
                              theme === "dark"
                                ? "text-gray-100"
                                : "text-gray-800"
                            }`}
                          >
                            {policy.label}
                          </h5>
                          <div
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                              policy.isCoinsPolicy
                                ? `${
                                    theme === "dark"
                                      ? "bg-yellow-900 text-yellow-200 border border-yellow-700"
                                      : "bg-yellow-100 text-yellow-800 border border-yellow-300"
                                  }`
                                : `${
                                    theme === "dark"
                                      ? "bg-blue-900 text-blue-200 border border-blue-700"
                                      : "bg-blue-100 text-blue-800 border border-blue-300"
                                  }`
                            }`}
                          >
                            {policy.isCoinsPolicy
                              ? "Coins Policy"
                              : "Cash Policy"}
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-2">
                        <div
                          className={`text-xs ${
                            theme === "dark" ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          Current Refund
                        </div>
                        <div
                          className={`font-bold text-sm ${
                            selectedSeatsForCancellation.size > 0
                              ? "text-green-500"
                              : theme === "dark"
                              ? "text-gray-500"
                              : "text-gray-400"
                          }`}
                        >
                          {currentRefundAmount}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {policy.refund.map((r: any, idx: number) => (
                        <div
                          key={idx}
                          className={`rounded-lg p-2 border-l-4 ${
                            r.isCurrentSlab
                              ? theme === "dark"
                                ? "bg-green-900/30 border-green-500"
                                : "bg-green-50 border-green-400"
                              : theme === "dark"
                              ? "bg-gray-600/50 border-gray-500"
                              : "bg-white border-gray-300"
                          }`}
                        >
                          <div className="flex flex-col">
                            <div className="flex justify-between items-center">
                              <p
                                className={`text-sm ${
                                  theme === "dark"
                                    ? "text-gray-300"
                                    : "text-gray-700"
                                }`}
                              >
                                {r.window && typeof r.window === "string"
                                  ? r.window.trim() || "N/A"
                                  : "N/A"}
                              </p>
                              <div
                                className={`text-right font-semibold text-sm ${
                                  theme === "dark"
                                    ? "text-gray-200"
                                    : "text-gray-900"
                                }`}
                              >
                                {getTotalRefundValue(policy, r)}
                              </div>
                            </div>
                            {r.isCurrentSlab && (
                              <div
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mt-1 self-start ${
                                  theme === "dark"
                                    ? "bg-green-900 text-green-200 border border-green-700"
                                    : "bg-green-100 text-green-800 border border-green-300"
                                }`}
                              >
                                Current Refund Policy
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default RefundPolicySection;
