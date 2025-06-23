import React, { useState, useMemo, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { UpcomingTravelsResponse, UpcomingTravel } from '../../types/cancellation';
import toast from 'react-hot-toast';
import { addAIMessageToChat } from '../../utils/chatHelpers';
import { authService } from '../../services/api';
import { formatTime, calculateDuration, formatDateForMessage } from '../common/formatUtils';
import CancellationModal from './CancellationModal';

interface CancellationCardProps {
  data: UpcomingTravelsResponse;
  selectedChatId?: string;
  setChats?: React.Dispatch<React.SetStateAction<any[]>>;
}

const CancellationCard: React.FC<CancellationCardProps> = ({ data, selectedChatId, setChats }) => {
  const { theme } = useTheme();
  const [selectedTravel, setSelectedTravel] = useState<UpcomingTravel | null>(null);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalClosing, setIsModalClosing] = useState(false);
  const [showRefundPolicies, setShowRefundPolicies] = useState(false);
  const [selectedSeatsForCancellation, setSelectedSeatsForCancellation] = useState<Set<string>>(new Set());
  const [selectedRefundMethod, setSelectedRefundMethod] = useState<'cash' | 'coins'>('coins');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (showPolicyModal) {
      const timer = setTimeout(() => setIsModalVisible(true), 10);
      return () => clearTimeout(timer);
    }
  }, [showPolicyModal]);

  const handleModalClose = () => {
    if (isModalClosing) return;
    setIsModalClosing(true);
    setIsModalVisible(false);
    setTimeout(() => {
      setShowPolicyModal(false);
      setIsModalVisible(false);
      setIsModalClosing(false);
    }, 300);
  };

  const handleTravelSelect = (travel: UpcomingTravel) => {
    setSelectedTravel(travel);
    setShowPolicyModal(true);
    setShowRefundPolicies(false);
    setSelectedRefundMethod('coins');
    const activeSeats = travel.policy.cancelSeatResponseDto.filter(seat => seat.active).length;
    if (activeSeats === 1) {
      const singleSeat = travel.policy.cancelSeatResponseDto.find(seat => seat.active);
      if (singleSeat) {
        setSelectedSeatsForCancellation(new Set([singleSeat.seatNumber]));
      } else {
        setSelectedSeatsForCancellation(new Set());
      }
    } else {
      setSelectedSeatsForCancellation(new Set());
    }
  };

  const toggleSeatSelection = (seatNumber: string) => {
    const newSelected = new Set(selectedSeatsForCancellation);
    if (newSelected.has(seatNumber)) {
      newSelected.delete(seatNumber);
    } else {
      newSelected.add(seatNumber);
    }
    setSelectedSeatsForCancellation(newSelected);
  };

  const dynamicRefundCalculation = useMemo(() => {
    if (!selectedTravel) return null;
    const selectedCount = selectedSeatsForCancellation.size;
    if (selectedCount === 0) {
      return {
        cashRefund: { amount: 0, percentage: 0 },
        coinsRefund: { coins: 0, percentage: 0 }
      };
    }
    const selectedSeats = selectedTravel.policy.cancelSeatResponseDto.filter(
      seat => selectedSeatsForCancellation.has(seat.seatNumber)
    );
    let totalCashRefund = 0;
    let totalCoinsRefund = 0;
    selectedSeats.forEach(seat => {
      const cashPolicy = seat.seatPolicies.find(p => !p.isCoinsPolicy);
      const coinsPolicy = seat.seatPolicies.find(p => p.isCoinsPolicy);
      if (cashPolicy) {
        totalCashRefund += cashPolicy.amount || 0;
      }
      if (coinsPolicy) {
        totalCoinsRefund += coinsPolicy.coins || 0;
      }
    });
    return {
      cashRefund: { 
        amount: totalCashRefund, 
        percentage: selectedSeats.length > 0 ? selectedSeats[0].seatPolicies.find(p => !p.isCoinsPolicy)?.percentage || 0 : 0 
      },
      coinsRefund: { 
        coins: totalCoinsRefund, 
        percentage: selectedSeats.length > 0 ? selectedSeats[0].seatPolicies.find(p => p.isCoinsPolicy)?.percentage || 0 : 0 
      }
    };
  }, [selectedTravel, selectedSeatsForCancellation]);

  const getContextualRefundValue = (policy: any, refundItem: any) => {
    const selectedCount = selectedSeatsForCancellation.size;
    if (selectedCount === 0) {
      return policy.isCoinsPolicy ? "0 coins (0%)" : "₹0.00 (0%)";
    }
    const valueMatch = refundItem.value.match(/(\d+(?:\.\d+)?)/);
    const baseAmount = valueMatch ? parseFloat(valueMatch[1]) : 0;
    const percentageMatch = refundItem.value.match(/\((\d+)%\)/);
    const percentage = percentageMatch ? percentageMatch[1] : "0";
    const selectedSeats = selectedTravel?.policy.cancelSeatResponseDto.filter(
      seat => selectedSeatsForCancellation.has(seat.seatNumber)
    ) || [];
    if (selectedSeats.length === 0) {
      return policy.isCoinsPolicy ? "0 coins (0%)" : "₹0.00 (0%)";
    }
    const totalSeats = selectedTravel?.policy.cancelSeatResponseDto.length || 1;
    const proportionalMultiplier = selectedSeats.length / totalSeats;
    const proportionalAmount = baseAmount * proportionalMultiplier;
    if (policy.isCoinsPolicy) {
      return `${Math.round(proportionalAmount)} coins (${percentage}%)`;
    } else {
      return `₹${proportionalAmount.toFixed(2)} (${percentage}%)`;
    }
  };

  const getSelectedRefundAmount = () => {
    if (!dynamicRefundCalculation) return "₹0.00";
    if (selectedRefundMethod === 'cash') {
      return `₹${dynamicRefundCalculation.cashRefund.amount.toFixed(2)}`;
    } else {
      return `${dynamicRefundCalculation.coinsRefund.coins} Coins`;
    }
  };

  const handleConfirmPayment = async () => {
    if (selectedSeatsForCancellation.size === 0) {
      setShowPolicyModal(false);
      setTimeout(() => {
        toast.error('Please select at least one seat to cancel.');
      }, 100);
      return;
    }
    if (!selectedRefundMethod) {
      setShowPolicyModal(false);
      setTimeout(() => {
        toast.error('Please select a refund method.');
      }, 100);
      return;
    }
    if (!selectedTravel) {
      setShowPolicyModal(false);
      setTimeout(() => {
        toast.error('No travel selected.');
      }, 100);
      return;
    }
    const selectedSeats = selectedTravel.policy.cancelSeatResponseDto.filter(seat =>
      selectedSeatsForCancellation.has(seat.seatNumber)
    );
    const policyIds = selectedSeats.map(seat => {
      const policy = seat.seatPolicies.find(p =>
        selectedRefundMethod === 'cash' ? !p.isCoinsPolicy : p.isCoinsPolicy
      );
      return policy?.id;
    }).filter(Boolean);
    const uniquePolicyIds = Array.from(new Set(policyIds));
    if (uniquePolicyIds.length !== 1) {
      setShowPolicyModal(false);
      setTimeout(() => {
        toast.error('Selected seats have inconsistent cancellation policies. Please select seats with the same policy.');
      }, 100);
      return;
    }
    const policyId = uniquePolicyIds[0];
    try {
      setIsProcessing(true);
      const seats = Array.from(selectedSeatsForCancellation);
      const payload = {
        seats: seats,
        policyId: policyId
      };
      const sessionId = localStorage.getItem('sessionId');
      const userStr = localStorage.getItem('user');
      let user: { id?: string; name?: string; mobile?: string } = {};
      try {
        user = userStr && userStr !== "undefined" ? JSON.parse(userStr) : {};
      } catch {
        user = {};
      }
      const response = await authService.fetchWithRefresh(`/api/tickets/${selectedTravel.travel_details.id}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': user.id?.toString() || '',
          'X-Session-ID': sessionId || ''
        },
        body: JSON.stringify(payload)
      });
      const responseData = await response.json();
      if (!response.ok) {
        setShowPolicyModal(false);
        setTimeout(() => {
          const errorMessage = responseData.message?.toLowerCase() || '';
          if (errorMessage.includes('already cancelled') || 
              errorMessage.includes('mockresponse') || 
              (responseData.statusCode === 400 && errorMessage.includes('selected seat has already been cancelled'))) {
            toast.error('Your ticket has already been cancelled.');
          } else if (errorMessage.includes('session expired')) {
            toast.error('Your session has expired. Please login again.');
            window.dispatchEvent(new CustomEvent('login:required'));
          } else if (errorMessage.includes('invalid ticket')) {
            toast.error('Invalid ticket. Please try again.');
          } else {
            toast.error('Unable to cancel ticket. Please try again later.');
          }
        }, 100);
        return;
      }
      setShowPolicyModal(false);
      setTimeout(() => {
        toast.success('Ticket cancelled successfully');
      }, 100);
      let refundAmountText = '';
      if (selectedRefundMethod === 'coins') {
        const coinsAmount = dynamicRefundCalculation?.coinsRefund.coins || 0;
        refundAmountText = `${coinsAmount} Green Coins`;
      } else {
        const cashAmount = responseData.refund_amount || dynamicRefundCalculation?.cashRefund.amount || 0;
        refundAmountText = `₹${cashAmount.toFixed(2)}`;
      }
      const journeyDate = selectedTravel ? formatDateForMessage(selectedTravel.travel_details.date) : 'N/A';
      const sourceName = selectedTravel?.travel_details.source.name || 'N/A';
      const destinationName = selectedTravel?.travel_details.destination.name || 'N/A';
      const pnr = selectedTravel ? `FRE${selectedTravel.travel_details.id}` : 'N/A';
      const cancellationPolicyLink = "https://www.freshbus.com/privacy-policy";
      let refundSpecificText = '';
      if (selectedRefundMethod === 'coins') {
        refundSpecificText = `Your Green Coins have been instantly credited to your wallet. Thank you for your patience.`;
      } else {
        refundSpecificText = `The refund of ${refundAmountText} has been initiated. The refund will be credited in 7 days. Thank you for your patience.`;
      }
      const aiMessage = `Your Ticket Has Been Cancelled. Refund Initiated!\n\nDear Passenger,\n\nYou have opted to cancel your Freshbus ticket from ${sourceName} to ${destinationName} for journey date ${journeyDate} PNR: ${pnr}. This is to inform you that your booking is cancelled as per your request.\n\nThe Cancellation policy will be applied in this case [click here](${cancellationPolicyLink})\n\n${refundSpecificText}\n\nYou can now book a trip for your planned journey at another date & time.`;
      if (selectedChatId && setChats) {
        addAIMessageToChat(aiMessage, selectedChatId, setChats);
      } else {
        console.log("AI message created but not added to chat due to missing props:", aiMessage);
      }
    } catch (error) {
      console.error('Error cancelling ticket:', error);
      setShowPolicyModal(false);
      setTimeout(() => {
        toast.error((error as Error).message || 'An error occurred while cancelling the ticket');
      }, 100);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={`w-full max-w-7xl mx-auto  ${theme === 'dark' ? 'dark' : ''}`}>
      {data.data.upcoming_travels.length === 0 ? (
        <>
          <div className="p-4 border border-yellow-300 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-700/50">
            <p className="text-center text-yellow-800 dark:text-yellow-200">
              No upcoming travels found to cancel. Please check back later or book a new ticket.
            </p>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {data.data.upcoming_travels.map((travel) => {
            const departureTime = formatTime(travel.travel_details.source.time);
            const arrivalTime = formatTime(travel.travel_details.destination.time);
            const duration = calculateDuration(
              travel.travel_details.source.time,
              travel.travel_details.destination.time
            );
            const activeSeats = travel.policy.cancelSeatResponseDto.filter(seat => seat.active);
            const totalPaid = activeSeats.reduce((sum, seat) => sum + (seat.totalFare || 0), 0);
            return (
              <div
                key={travel.travel_details.id}
                className="rounded-lg  p-2 text-white cursor-pointer hover:shadow-lg transition-shadow duration-200 shadow-sm"
                style={{ background: 'linear-gradient(to bottom right, #0078d4, #005a9e)' }}
                onClick={() => handleTravelSelect(travel)}
              >
                <div className="flex justify-between items-stretch w-full mt-2 gap-4">
                  <div className="w-1/3 flex flex-col items-start justify-start">
                    <div className="text-left mb-2 w-full">
                      <p className="text-sm font-bold">{departureTime}</p>
                      <p className="text-sm font-bold truncate">{travel.travel_details.source.name}</p>
                      <p className="text-sm font-bold truncate">{travel.travel_details.source.point}</p>
                    </div>
                    <div className="text-xs w-full">
                      <div className="font-bold">Seats:</div>
                      <div className="flex flex-wrap gap-1">
                        {travel.policy.cancelSeatResponseDto.map((seat) => {
                          if (!seat.active) {
                            return null;
                          }
                          return (
                            <span
                              key={seat.seatNumber}
                              className={`rounded-md text-sm font-bold px-2 py-1 inline-flex items-center ${seat.gender.toLowerCase() === 'female' ? 'bg-pink-200 text-pink-900' : 'bg-yellow-200 text-yellow-900'}`}
                            >
                              <span>{seat.seatNumber}</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="w-1/3 flex flex-col items-center justify-center">
                    <div className="flex flex-col items-center mb-2 w-full">
                      <div className="flex items-center w-full">
                        <div className="flex-1 h-[1.5px] bg-[#fbe822]" />
                        <span className="mx-2 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-5 sm:w-5 text-[#fbe822]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                            <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l2 2" />
                          </svg>
                        </span>
                        <div className="flex-1 h-[1.5px] bg-[#fbe822]" />
                      </div>
                      <div className="flex justify-center mt-1">
                        <p className="text-base sm:text-sm font-semibold text-[#fbe822]">{duration}</p>
                      </div>
                    </div>
                    <div className="flex p-1 rounded-lg mt-2 bg-[#fbe822]">
                      <span className="text-xs text-[#0078d4] font-bold whitespace-nowrap">Ticket ID: FRE{travel.travel_details.id}</span>
                    </div>
                  </div>
                  <div className="w-1/3 flex flex-col">
                    <div className="text-right mb-2 w-full">
                      <p className="text-sm font-bold">{arrivalTime}</p>
                      <p className="text-sm font-bold truncate">{travel.travel_details.destination.name}</p>
                      <p className="text-sm font-bold truncate">{travel.travel_details.destination.point}</p>
                    </div>
                    <div className="text-sm text-right w-full">
                      <div className="font-bold">Total Paid:</div>
                      <div>
                        <span className="font-bold">₹{totalPaid.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <CancellationModal
        isOpen={showPolicyModal}
        isModalVisible={isModalVisible}
        isModalClosing={isModalClosing}
        onClose={handleModalClose}
        selectedTravel={selectedTravel}
        selectedSeatsForCancellation={selectedSeatsForCancellation}
        setSelectedSeatsForCancellation={setSelectedSeatsForCancellation}
        showRefundPolicies={showRefundPolicies}
        setShowRefundPolicies={setShowRefundPolicies}
        selectedRefundMethod={selectedRefundMethod}
        setSelectedRefundMethod={setSelectedRefundMethod}
        isProcessing={isProcessing}
        dynamicRefundCalculation={dynamicRefundCalculation}
        getContextualRefundValue={getContextualRefundValue}
        getSelectedRefundAmount={getSelectedRefundAmount}
        handleConfirmPayment={handleConfirmPayment}
        toggleSeatSelection={toggleSeatSelection}
        theme={theme}
      />
    </div>
  );
};

export default CancellationCard; 