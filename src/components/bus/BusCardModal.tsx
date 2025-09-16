import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import {
  BusWithCategory,
  getSeatBackgroundColor,
  GreenCoins,
  FreshCard,
  calculateCategoryFare,
  convertToIST,
  getCategoryStyle,
  getSeatGender,
  createPaymentPayload,
  FinalFareCalculation,
  getCategorySeats,
  Passenger,
} from "../../utils/busUtils";
import {
  isFreshCardAvailable,
  getCurrentFreshCardBalance,
  getFreshCardDiscountAmount,
} from "../../utils/freshCardUtils";
import SeatLayout from "./SeatLayout";
import { useTheme } from "../../context/ThemeContext";
import PassengerForm from "./PassengerForm";
import FareSummary from "./FareSummary";
import GreenCoinsSection from "./GreenCoinsSection";
import FreshCardSection from "./FreshCardSection";
import SeatSelection from "./SeatSelection";
import BoardingDropdown from "./BoardingDropdown";
import PassengerList from "./PassengerList";
import ModalActions from "./ModalActions";
import { toast } from "react-toastify";
import { authService } from "../../services/api";
import { trackGTMEvent } from "../../utils/gtm";

interface BusCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  bus: BusWithCategory;
  onBook: (busId: number) => void;
}

const BusCardModal: React.FC<BusCardModalProps> = ({
  isOpen,
  onClose,
  bus,
}) => {
  const { theme } = useTheme();

  // Modal-related state
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalClosing, setIsModalClosing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSeatLayoutOpen, setIsSeatLayoutOpen] = useState(false);

  // Backend data state
  const [greenCoins, setGreenCoins] = useState<GreenCoins | null>(null);
  const [freshCard, setFreshCard] = useState<FreshCard | null>(null);
  const [backendPassengers, setBackendPassengers] = useState<Passenger[]>([]);

  // Discount state
  const [appliedGreenCoins, setAppliedGreenCoins] = useState(0);
  const [appliedFreshCard, setAppliedFreshCard] = useState(false);
  const [isPurchasingFreshCard, setIsPurchasingFreshCard] =
    useState<boolean>(false);

  const freshCardPurchaseAmount = freshCard?.fare ?? 0;

  // Dropdown state
  const [boardingDropdownOpen, setBoardingDropdownOpen] = useState(false);
  const [droppingDropdownOpen, setDroppingDropdownOpen] = useState(false);

  // Booking details state
  const [selectedBoarding, setSelectedBoardingState] = useState<string | null>(
    () => {
      if (bus.recommended_boarding_points?.length) {
        const match = bus.allBoardingPoints.find(
          (bp) =>
            bp.boardingPoint.name === bus.recommended_boarding_points?.[0]?.name
        );
        if (match) return match.boardingPoint.name;
      }
      return bus.allBoardingPoints[0]?.boardingPoint.name || null;
    }
  );

  const [selectedDropping, setSelectedDroppingState] = useState<string | null>(
    () => {
      if (bus.recommended_dropping_points?.length) {
        const match = bus.allDroppingPoints.find(
          (dp) =>
            dp.droppingPoint.name === bus.recommended_dropping_points?.[0]?.name
        );
        if (match) return match.droppingPoint.name;
      }
      return bus.allDroppingPoints[0]?.droppingPoint.name || null;
    }
  );

  // Seat and passenger state
  const allSeats = getCategorySeats(bus, bus.category);
  const [selectedSeats, setSelectedSeats] = useState(allSeats);

  // Passenger management
  const getInitialPassenger = (index: number = 0) => {
    const seat = selectedSeats[index];
    if (!seat) return { name: "", age: undefined, gender: "Male" };

    const seatGender = getSeatGender(bus, seat);
    return {
      name: "",
      age: undefined,
      gender: seatGender === "female" ? "Female" : "Male",
    };
  };

  const [passengerDetails, setPassengerDetails] = useState<
    Array<{
      name: string;
      age: number | undefined;
      gender: string;
    }>
  >([getInitialPassenger(0)]);

  const [currentPassenger, setCurrentPassenger] = useState<{
    name: string;
    age: number | undefined;
    gender: string;
  }>(getInitialPassenger(0));

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [currentSeatIndex, setCurrentSeatIndex] = useState(0);

  // Load backend data when modal opens
  useEffect(() => {
    if (!isOpen) return;

    try {
      let busQueryResponse = null;

      // Check multiple sources for the bus query response
      if (bus && (bus as any).busQueryResponse) {
        busQueryResponse = (bus as any).busQueryResponse;
      } else if (
        typeof window !== "undefined" &&
        (window as any).busQueryResponse
      ) {
        busQueryResponse = (window as any).busQueryResponse;
      } else if (
        typeof window !== "undefined" &&
        (window as any).__BUS_QUERY_DATA__
      ) {
        busQueryResponse = (window as any).__BUS_QUERY_DATA__;
      } else {
        const storedData = localStorage.getItem("busQueryResponse");
        if (storedData) {
          try {
            busQueryResponse = JSON.parse(storedData);
          } catch (e) {
            // Error handling without console logs
          }
        }
      }

      if (busQueryResponse) {
        if (busQueryResponse.green_coins) {
          setGreenCoins(busQueryResponse.green_coins);
        }

        if (busQueryResponse.freshcard) {
          setFreshCard(busQueryResponse.freshcard);
        }

        if (
          busQueryResponse.passengers &&
          Array.isArray(busQueryResponse.passengers)
        ) {
          setBackendPassengers(busQueryResponse.passengers);
        }
      }

      // Also try to get recent passengers from localStorage
      try {
        const recentPassengersData = localStorage.getItem("recentPassengers");
        if (recentPassengersData) {
          const recentPassengers = JSON.parse(recentPassengersData);
          if (Array.isArray(recentPassengers)) {
            setBackendPassengers((prev) => {
              const allPassengers = [...prev];
              recentPassengers.forEach((recentPass) => {
                if (
                  !allPassengers.some(
                    (existingPass) =>
                      existingPass.name.toLowerCase() ===
                        recentPass.name.toLowerCase() &&
                      existingPass.age === recentPass.age
                  )
                ) {
                  allPassengers.push(recentPass);
                }
              });
              return allPassengers;
            });
          }
        }
      } catch (e) {
        // Error handling without console logs
      }
    } catch (e) {
      // Error handling without console logs
    }
  }, [isOpen, bus]);

  // Initialize passenger details and auto-apply discounts when modal opens
  useEffect(() => {
    if (isOpen && selectedSeats.length > 0) {
      const initialPassengers = selectedSeats.map((seat) => {
        const seatGender = getSeatGender(bus, seat);
        return {
          name: "",
          age: undefined,
          gender: seatGender === "female" ? "Female" : "Male",
        };
      });

      setPassengerDetails(initialPassengers);
      setCurrentPassenger(initialPassengers[0]);
      setCurrentSeatIndex(0);
      setEditingIndex(null);

      // Reset discounts when modal opens
      setAppliedGreenCoins(0);
      setAppliedFreshCard(false);
      setIsPurchasingFreshCard(false);

      // Auto-apply Green Coins if available
      if (greenCoins && greenCoins.available > 0) {
        const initialFare = calculateCategoryFare(selectedSeats).total;
        const maxUsable = Math.min(
          greenCoins.available,
          Math.ceil(initialFare)
        );
        if (maxUsable > 0) {
          setAppliedGreenCoins(maxUsable);
        }
      }

      // Auto-apply Fresh Card if available
      if (isFreshCardAvailable(freshCard)) {
        setAppliedFreshCard(true);
      }
    }
  }, [isOpen, selectedSeats, bus, greenCoins, freshCard]);

  // Animation effect for modal
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setIsModalVisible(true), 10);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Calculate final fare with discounts
  const calculateFinalFare = (): FinalFareCalculation & {
    freshCardPurchase?: number;
  } => {
    const originalFare = calculateCategoryFare(selectedSeats);
    let baseFare = originalFare.baseFare;
    let gst = originalFare.gst;
    let discount = originalFare.discount;

    let baseTotal = baseFare + gst + discount;
    let actualGreenCoinsDiscount = 0;
    let actualFreshCardDiscount = getFreshCardDiscountAmount(
      isPurchasingFreshCard,
      appliedFreshCard,
      freshCard
    );
    let freshCardPurchase = 0;
    let finalTotal = baseTotal;

    if (isPurchasingFreshCard) {
      freshCardPurchase = freshCardPurchaseAmount;
      finalTotal += freshCardPurchase;
      finalTotal -= actualFreshCardDiscount;

      if (appliedGreenCoins > 0) {
        actualGreenCoinsDiscount = Math.min(
          appliedGreenCoins,
          Math.ceil(finalTotal)
        );
        finalTotal -= actualGreenCoinsDiscount;
      }
    } else if (appliedFreshCard && isFreshCardAvailable(freshCard)) {
      finalTotal -= actualFreshCardDiscount;

      if (appliedGreenCoins > 0) {
        actualGreenCoinsDiscount = Math.min(
          appliedGreenCoins,
          Math.ceil(finalTotal)
        );
        finalTotal -= actualGreenCoinsDiscount;
      }
    } else if (appliedGreenCoins > 0) {
      actualGreenCoinsDiscount = Math.min(
        appliedGreenCoins,
        Math.ceil(baseTotal)
      );
      finalTotal -= actualGreenCoinsDiscount;
    }

    finalTotal = Math.max(0, finalTotal);

    return {
      baseFare,
      gst,
      discount,
      greenCoinsDiscount: actualGreenCoinsDiscount,
      freshCardDiscount: actualFreshCardDiscount,
      freshCardPurchase,
      total: finalTotal,
    };
  };

  // Event handlers
  const handleSelectBoarding = (value: string) => {
    setSelectedBoardingState(value);
    setBoardingDropdownOpen(false);
    // GTM event for boarding point selection
    trackGTMEvent("bus_card_boarding_selected", {
      busId: bus.tripID,
      boardingPoint: value,
    });
  };

  const handleSelectDropping = (value: string) => {
    setSelectedDroppingState(value);
    setDroppingDropdownOpen(false);
    // GTM event for dropping point selection
    trackGTMEvent("bus_card_dropping_selected", {
      busId: bus.tripID,
      droppingPoint: value,
    });
  };

  const handleViewSeatLayout = () => setIsSeatLayoutOpen(true);

  const handleModalClose = () => {
    if (isModalClosing) return;
    setIsModalClosing(true);
    setIsModalVisible(false);
    setTimeout(() => {
      onClose();
      setIsModalVisible(false);
      setIsModalClosing(false);
    }, 300);
  };

  const handleRedeemGreenCoins = () => {
    if (!greenCoins || greenCoins.available <= 0) {
      toast.error("No green coins available to redeem");
      return;
    }
    const currentFare = appliedFreshCard
      ? calculateCategoryFare(selectedSeats).total - 50
      : calculateCategoryFare(selectedSeats).total;
    const maxUsable = Math.min(greenCoins.available, Math.ceil(currentFare));
    if (maxUsable <= 0) {
      toast.error("No green coins can be applied to this fare");
      return;
    }
    setAppliedGreenCoins(maxUsable);
    toast.success(`₹${maxUsable} green coins will be applied!`);
    // GTM event
    trackGTMEvent("bus_card_green_coins_selected", {
      busId: bus.tripID,
      value: maxUsable,
    });
  };

  const handleFreshCardToggle = () => {
    if (isPurchasingFreshCard) {
      if (appliedFreshCard) {
        setAppliedFreshCard(false);
        toast.success("Fresh card discount removed");
        // GTM event
        trackGTMEvent("bus_card_fresh_card_removed", { busId: bus.tripID });
      } else {
        setAppliedFreshCard(true);
        toast.success("₹50 fresh card discount will be applied!");
        // GTM event
        trackGTMEvent("bus_card_fresh_card_selected", {
          busId: bus.tripID,
          value: 50,
        });
      }
    } else {
      if (!isFreshCardAvailable(freshCard)) {
        toast.error("Fresh card not available or no balance remaining");
        return;
      }
      if (appliedFreshCard) {
        setAppliedFreshCard(false);
        toast.success("Fresh card discount removed");
        // GTM event
        trackGTMEvent("bus_card_fresh_card_removed", { busId: bus.tripID });
      } else {
        setAppliedFreshCard(true);
        toast.success(`Fresh card discount will be applied!`);
        // GTM event
        trackGTMEvent("bus_card_fresh_card_selected", {
          busId: bus.tripID,
          value: 50,
        });
      }
    }
  };

  const handlePurchaseFreshCard = () => {
    if (isPurchasingFreshCard) {
      setIsPurchasingFreshCard(false);
      setAppliedFreshCard(false);
      toast.success("Fresh card purchase cancelled");
      // GTM event
      trackGTMEvent("bus_card_fresh_card_purchase_cancelled", {
        busId: bus.tripID,
      });
    } else {
      setIsPurchasingFreshCard(true);
      setAppliedFreshCard(true);
      toast.success(
        `Fresh card will be purchased for ₹${freshCardPurchaseAmount} with ₹50 discount applied!`
      );
      // GTM event
      trackGTMEvent("bus_card_fresh_card_purchase_initiated", {
        busId: bus.tripID,
        amount: freshCardPurchaseAmount,
      });
    }
  };

  const handleAddOrUpdatePassenger = () => {
    if (
      !currentPassenger.name ||
      currentPassenger.age === undefined ||
      !currentPassenger.gender
    ) {
      toast.error("Please fill in all passenger details.");
      return;
    }
    // GTM event for passenger details entry/update
    trackGTMEvent("passenger_details_provided", {
      busId: bus.tripID,
      method: "manual",
      passengerDetails: passengerDetails,
    });
    setPassengerDetails((prevDetails) => {
      const updatedDetails = [...prevDetails];
      if (editingIndex !== null) {
        updatedDetails[editingIndex] = currentPassenger;
        setEditingIndex(null);
      } else {
        updatedDetails[currentSeatIndex] = currentPassenger;
      }
      return updatedDetails;
    });
    const nextIndex =
      editingIndex !== null ? editingIndex + 1 : currentSeatIndex + 1;
    if (nextIndex < selectedSeats.length) {
      setCurrentSeatIndex(nextIndex);
      setCurrentPassenger(getInitialPassenger(nextIndex));
    } else {
      setCurrentPassenger({ name: "", age: undefined, gender: "Male" });
    }
  };

  const handleSelectPassenger = (backendPassenger: Passenger) => {
    const newPassengerData = {
      name: backendPassenger.name,
      age: backendPassenger.age,
      gender: backendPassenger.gender,
    };

    // Immediately update the passenger list for the current seat
    setPassengerDetails((prevDetails) => {
      const updatedDetails = [...prevDetails];
      updatedDetails[currentSeatIndex] = newPassengerData;
      return updatedDetails;
    });

    // Track the event
    trackGTMEvent("passenger_details_provided", {
      busId: bus.tripID,
      method: "selection",
      passenger: newPassengerData,
    });

    // Advance to the next passenger form
    const nextIndex = currentSeatIndex + 1;
    if (nextIndex < selectedSeats.length) {
      setCurrentSeatIndex(nextIndex);
      setCurrentPassenger(getInitialPassenger(nextIndex));
    } else {
      // All passengers are filled, clear the form
      setCurrentPassenger({ name: "", age: undefined, gender: "Male" });
    }
  };

  const handleConfirmPayment = async () => {
    // GTM event for confirm payment attempt (with all details)
    const paymentPayload = {
      busId: bus.tripID,
      passengerDetails,
      selectedBoarding,
      selectedDropping,
      appliedGreenCoins,
      appliedFreshCard,
      isPurchasingFreshCard,
      finalFare: calculateFinalFare(),
    };
    trackGTMEvent("block", {
      payload: paymentPayload,
    });

    const filledPassengers = passengerDetails.filter(
      (p) => p.name && p.age !== undefined && p.gender
    );

    if (filledPassengers.length < selectedSeats.length) {
      toast.error(
        `Please fill details for all ${selectedSeats.length} passengers.`
      );
      return;
    }

    if (!selectedBoarding || !selectedDropping) {
      toast.error("Please select both boarding and dropping points.");
      return;
    }

    try {
      setIsProcessing(true);

      let userMobile = "";
      let userId = "";
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          userMobile = userData.mobile || "";
          userId = userData.id || "";
        } catch (e) {
          // Error handling without console logs
        }
      }

      if (!userId || !userMobile) {
        toast.error("Please login to continue with booking.");
        window.dispatchEvent(new CustomEvent("login:required"));
        return;
      }

      const passengersToSave = filledPassengers.map((p) => ({
        id: Math.floor(Math.random() * 1000000) + 1,
        name: p.name,
        gender: p.gender,
        age: p.age || 0,
      }));

      let allPassengers = [...backendPassengers];
      passengersToSave.forEach((newPass) => {
        if (
          !allPassengers.some(
            (existingPass) =>
              existingPass.name.toLowerCase() === newPass.name.toLowerCase() &&
              existingPass.age === newPass.age
          )
        ) {
          allPassengers.push(newPass);
        }
      });

      localStorage.setItem("recentPassengers", JSON.stringify(allPassengers));

      const finalFare = calculateFinalFare();

      if (finalFare.total < 0) {
        toast.error("Invalid payment amount. Final fare cannot be negative.");
        return;
      }

      const payload = {
        ...createPaymentPayload(
          bus,
          selectedSeats,
          passengerDetails,
          selectedBoarding,
          selectedDropping,
          appliedGreenCoins,
          appliedFreshCard || isPurchasingFreshCard,
          freshCard,
          finalFare
        ),
        ...(isPurchasingFreshCard && {
          purchase_fresh_card: true,
          fresh_card_amount: freshCardPurchaseAmount,
          fresh_card_discount_applied: appliedFreshCard ? 50 : 0,
          fresh_card_remaining_balance: getCurrentFreshCardBalance(
            freshCard,
            isPurchasingFreshCard,
            appliedFreshCard,
            freshCardPurchaseAmount
          ),
        }),
      };

      const response = await authService.fetchWithRefresh(
        "/api/tickets/block",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-User-ID": userId,
            "X-Session-ID": localStorage.getItem("sessionId") || "",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        // GTM event for payment failure
        trackGTMEvent("bus_card_payment_status", {
          busId: bus.tripID,
          status: "failure",
          error: errorData.message,
        });
        throw new Error(errorData.message || "Failed to block ticket");
      }

      const data = await response.json();

      if (data.success && !data.payment_url && !data.api_order_id) {
        if (isPurchasingFreshCard) {
          toast.success("Ticket booked successfully and Fresh Card purchased!");
        } else {
          toast.success("Ticket booked successfully using green coins!");
        }
        handleModalClose();
        return;
      }

      if (data.api_order_id) {
        localStorage.setItem("current_order_id", data.api_order_id);
      }

      if (!data.payment_url) {
        throw new Error(
          "Payment URL not found in server response. Please try again."
        );
      }

      toast.success("Redirecting to payment portal...");
      window.location.href = data.payment_url;
    } catch (error: any) {
      // GTM event for payment failure
      trackGTMEvent("bus_card_payment_status", {
        busId: bus.tripID,
        status: "failure",
        error: error.message,
      });
      toast.error(error.message || "An error occurred during payment.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle click outside to close
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleModalClose();
    }
  };

  // Get styling and fare info
  const categoryStyle = getCategoryStyle(bus.category);
  const finalFare = calculateFinalFare();

  // Check if all passengers are complete and valid
  const getFilledPassengersCount = () =>
    passengerDetails.filter((p) => p.name && p.age !== undefined && p.gender)
      .length;

  const areAllPassengersValid =
    getFilledPassengersCount() === selectedSeats.length;

  // Get current seat info for passenger form
  const currentSeat = selectedSeats[currentSeatIndex];
  const seatNumber = currentSeat?.seat_number?.toString() || "N/A";
  const seatType = currentSeat?.type === "window" ? "W" : "A";

  // Render passenger suggestions from backend
  const renderPassengerSuggestions = () => {
    if (backendPassengers.length === 0) {
      return null;
    }

    const seatGender = getSeatGender(bus, selectedSeats[currentSeatIndex]);
    const requiredGender = seatGender || null;

    const addedNames = passengerDetails
      .filter((p, index) => p.name && index !== editingIndex)
      .map((p) => p.name.toLowerCase().trim());

    const filteredPassengers = backendPassengers.filter((p) => {
      if (addedNames.includes(p.name.toLowerCase().trim())) {
        return false;
      }

      if (requiredGender === "female" && p.gender !== "Female") {
        return false;
      }
      if (requiredGender === "male" && p.gender !== "Male") {
        return false;
      }

      return true;
    });

    if (filteredPassengers.length === 0) {
      return null;
    }

    return (
      <div className="mt-2">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Select from previous passengers:
        </p>
        <div
          className="flex flex-wrap gap-2 mt-1 overflow-y-auto custom-scrollbar p-2 border rounded-lg bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-600"
          style={{
            maxHeight: "50px",
            scrollbarWidth: "thin",
            scrollbarColor: "#cbd5e0 transparent",
          }}
        >
          {filteredPassengers.map((passenger, idx) => (
            <button
              key={idx}
              className="px-2 py-1 text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-100 dark:hover:bg-blue-800/40 border border-blue-200 dark:border-blue-700 transition-colors font-medium whitespace-nowrap flex-shrink-0"
              onClick={() => handleSelectPassenger(passenger)}
              title={`Click to select: ${passenger.name} - Age: ${passenger.age}, Gender: ${passenger.gender}`}
            >
              {passenger.name}
            </button>
          ))}
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-90"
      style={{
        margin: 0,
        padding: 0,
        opacity: isModalVisible ? 1 : 0,
        transition: "opacity 0.3s ease-in-out",
      }}
      onClick={handleOverlayClick}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-11/12 max-w-md"
        style={{
          transform: isModalVisible
            ? "scale(1) translateY(0)"
            : "scale(0.95) translateY(20px)",
          opacity: isModalVisible ? 1 : 0,
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header: Journey Details */}
        <div className="bg-[#0078d4] text-white rounded-t-lg p-3">
          <div className="text-center mb-2 flex items-center justify-center">
            <h4 className="font-semibold text-xs">Trip Review - </h4>
            <div
              className={`ml-2 px-1.5 py-0.5 rounded-lg text-[10px] font-bold ${categoryStyle.textColor}`}
              style={{ background: categoryStyle.background }}
            >
              {bus.category}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-left">
              <p className="text-xs font-semibold">
                {convertToIST(bus.startTime).date}
              </p>
              <p className="text-xs">{bus.from}</p>
            </div>

            <div className="flex flex-col items-center mx-4 w-32">
              <div className="flex items-center w-full">
                <div className="flex-1 h-[1.5px] bg-[#fbe822]" />
                <span className="mx-2 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-[#fbe822]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                    />
                    <path
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 8v4l2 2"
                    />
                  </svg>
                </span>
                <div className="flex-1 h-[1.5px] bg-[#fbe822]" />
              </div>
              <div className="flex justify-center mt-1">
                <p className="text-xs font-semibold text-[#fbe822]">
                  {bus.duration}
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-xs font-semibold">
                {convertToIST(bus.endTime).date}
              </p>
              <p className="text-xs">{bus.to}</p>
            </div>
          </div>

          <div className="flex items-center justify-between mt-2">
            <BoardingDropdown
              label="Select Boarding Point & Time"
              options={bus.allBoardingPoints}
              selected={selectedBoarding}
              onSelect={handleSelectBoarding}
              dropdownOpen={boardingDropdownOpen}
              setDropdownOpen={setBoardingDropdownOpen}
              theme={theme}
              type="boarding"
            />
            <BoardingDropdown
              label="Select Dropping Point & Time"
              options={bus.allDroppingPoints}
              selected={selectedDropping}
              onSelect={handleSelectDropping}
              dropdownOpen={droppingDropdownOpen}
              setDropdownOpen={setDroppingDropdownOpen}
              theme={theme}
              type="dropping"
            />
          </div>
        </div>

        {/* Seat Selection and Fare Summary */}
        <div className="p-3 text-black dark:text-white">
          <div className="flex justify-between">
            <SeatSelection
              selectedSeats={selectedSeats}
              onViewSeatLayout={handleViewSeatLayout}
              getSeatBackgroundColor={(seat) =>
                getSeatBackgroundColor(bus, seat)
              }
            />

            <div className="space-y-1 w-[40%] text-left ml-4">
              <FareSummary
                baseFare={finalFare.baseFare}
                gst={finalFare.gst}
                discount={finalFare.discount}
                freshCardPurchase={(finalFare as any).freshCardPurchase || 0}
                greenCoinsDiscount={finalFare.greenCoinsDiscount}
                freshCardDiscount={finalFare.freshCardDiscount}
                total={finalFare.total}
              />
            </div>
          </div>
        </div>

        {/* Green Coins and Fresh Card Section */}
        <div className="flex items-stretch justify-between mt-2 space-x-3 px-3">
          <GreenCoinsSection
            greenCoins={greenCoins}
            appliedGreenCoins={appliedGreenCoins}
            setAppliedGreenCoins={setAppliedGreenCoins}
            onRedeem={handleRedeemGreenCoins}
            theme={theme}
            busId={bus.tripID}
          />
          <FreshCardSection
            freshCard={freshCard}
            appliedFreshCard={appliedFreshCard}
            setAppliedFreshCard={handleFreshCardToggle}
            isPurchasingFreshCard={isPurchasingFreshCard}
            setIsPurchasingFreshCard={handlePurchaseFreshCard}
            freshCardPurchaseAmount={freshCardPurchaseAmount}
            theme={theme}
            getCurrentFreshCardBalance={() =>
              getCurrentFreshCardBalance(
                freshCard,
                isPurchasingFreshCard,
                appliedFreshCard,
                freshCardPurchaseAmount
              )
            }
            isFreshCardAvailable={() => isFreshCardAvailable(freshCard)}
          />
        </div>

        {/* Passenger Form/List */}
        <div className="flex flex-col mt-3 px-3">
          <PassengerList
            passengerDetails={passengerDetails}
            setEditingIndex={setEditingIndex}
            setCurrentPassenger={setCurrentPassenger}
            setCurrentSeatIndex={setCurrentSeatIndex}
            theme={theme}
            bus={bus}
            selectedSeats={selectedSeats}
          />

          {(!areAllPassengersValid || editingIndex !== null) && (
            <>
              <PassengerForm
                currentPassenger={currentPassenger}
                setCurrentPassenger={setCurrentPassenger}
                editingIndex={editingIndex}
                onAddOrUpdatePassenger={handleAddOrUpdatePassenger}
                theme={theme}
                seatNumber={seatNumber}
                seatType={seatType}
                bus={bus}
                selectedSeat={currentSeat}
              />
              {renderPassengerSuggestions()}
            </>
          )}

          {areAllPassengersValid && !editingIndex && (
            <div className="mt-3 text-center">
              <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                ✓ All passenger details completed
              </p>
            </div>
          )}
        </div>

        {/* Confirm/Cancel Buttons */}
        <div className="p-3">
          <ModalActions
            onClose={handleModalClose}
            onConfirm={handleConfirmPayment}
            isProcessing={isProcessing}
            areAllPassengersValid={areAllPassengersValid}
            isSeatSelected={selectedSeats.length === 0}
          />
        </div>

        {/* Seat Layout Modal (if open) */}
        {isSeatLayoutOpen &&
          ReactDOM.createPortal(
            <SeatLayout
              bus={bus}
              selectedSeats={selectedSeats}
              onSeatSelect={setSelectedSeats}
              onClose={() => setIsSeatLayoutOpen(false)}
            />,
            document.body
          )}
      </div>
    </div>,
    document.body
  );
};

export default BusCardModal;
