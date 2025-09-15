"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Seat, Bus, SeatData } from "../../types/chat";
// import SeatIcon from "./SeatIcon";
import { getSeatGender } from "../../utils/busUtils";
import { toast } from "react-toastify";
import HybridSeatLayout from "./HybridSeatLayout";
import Seater from "../common/svg/seater";

interface SeatLayoutProps {
  bus: Bus;
  selectedSeats: Seat[];
  onSeatSelect?: (seats: Seat[]) => void;
  onClose: () => void;
}

const SeatLayout: React.FC<SeatLayoutProps> = ({
  bus,
  selectedSeats,
  onSeatSelect,
  onClose,
}) => {
  const [isLaptop, setIsLaptop] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [currentSelectedSeats, setCurrentSelectedSeats] = useState<Seat[]>(
    selectedSeats || []
  );

  // Check screen size for responsive behavior
  useEffect(() => {
    const checkScreenSize = () => {
      setIsLaptop(window.innerWidth >= 1024);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Keep local selection in sync when prop changes
  useEffect(() => {
    setCurrentSelectedSeats(selectedSeats || []);
  }, [selectedSeats]);

  // Animation effect
  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  // Handle click outside to close
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Handle close with animation
  const handleClose = () => {
    if (isClosing) return; // Prevent multiple close calls
    setIsClosing(true);
    setIsVisible(false);
    // Wait for animation to complete before calling onClose
    setTimeout(() => onClose(), 300);
  };

  // Colors for seat layout (matching bus card colors)
  const Colors = {
    neutralGreyDisable: "#9ca3af",
    primaryBlue: "#095FF0",
    pink: "#FF61C0",
    neutralGreyBg: "#f3f4f6",
    green300: "#10b981",
    yellow300: "#FDE047", // Tailwind yellow-300
    pinkLight: "#FFB7E2",
    // Tailwind pink-300
  };

  // Generate vertical seat layout maintaining original interface with real backend data
  const generateVerticalSeatLayout = () => {
    // Create a map of seat data by seat name for quick lookup
    const seatDataMap: { [key: string]: SeatData } = {};
    if (bus.seatData && bus.seatData.seats.length > 0) {
      bus.seatData.seats.forEach((seat) => {
        seatDataMap[seat.seatName] = seat;
      });
    }
    // console.log(seatDataMap, "seat data asdf");
    // Maintain original layout structure but populate with real data
    const originalLayout = [
      // Row 1: Seats 1, 2, 3, 4
      [
        seatDataMap["4"] || {
          id: 4,
          number: "4",
          available: true,
        },
        seatDataMap["3"] || { id: 3, number: "3", available: true },
        null, // aisle
        seatDataMap["2"] || { id: 2, number: "2", available: true },
        seatDataMap["1"] || { id: 1, number: "1", available: true },
      ],
      // Row 2: Seats 5, 6, 7, 8
      [
        seatDataMap["5"] || { id: 5, number: "5", available: true },
        seatDataMap["6"] || { id: 6, number: "6", available: true },
        null, // aisle
        seatDataMap["7"] || { id: 7, number: "7", available: true },
        seatDataMap["8"] || { id: 8, number: "8", available: true },
      ],
      // Row 3: Seats 9, 10, 11, 12
      [
        seatDataMap["12"] || { id: 12, number: "12", available: true },
        seatDataMap["11"] || { id: 11, number: "11", available: true },
        null, // aisle
        seatDataMap["10"] || { id: 10, number: "10", available: true },
        seatDataMap["9"] || { id: 9, number: "9", available: true },
      ],
      // Row 4: Seats 13, 14, 15, 16
      [
        seatDataMap["13"] || { id: 13, number: "13", available: true },
        seatDataMap["14"] || { id: 14, number: "14", available: true },
        null, // aisle
        seatDataMap["15"] || { id: 15, number: "15", available: true },
        seatDataMap["16"] || { id: 16, number: "16", available: true },
      ],
      // Row 5: Seats 17, 18, 19, 20
      [
        seatDataMap["20"] || { id: 20, number: "20", available: true },
        seatDataMap["19"] || { id: 19, number: "19", available: true },
        null, // aisle
        seatDataMap["18"] || { id: 18, number: "18", available: true },
        seatDataMap["17"] || { id: 17, number: "17", available: true },
      ],
      // Row 6: Seats 21, 22, 23, 24
      [
        seatDataMap["21"] || { id: 21, number: "21", available: true },
        seatDataMap["22"] || { id: 22, number: "22", available: true },
        null, // aisle
        seatDataMap["23"] || { id: 23, number: "23", available: true },
        seatDataMap["24"] || { id: 24, number: "24", available: true },
      ],
      // Row 7: Seats 25, 26, 27, 28
      [
        seatDataMap["28"] || { id: 28, number: "28", available: true },
        seatDataMap["27"] || { id: 27, number: "27", available: true },
        null, // aisle
        seatDataMap["26"] || { id: 26, number: "26", available: true },
        seatDataMap["25"] || { id: 25, number: "25", available: true },
      ],
      // Row 8: Seats 29, 30, 31, 32
      [
        seatDataMap["29"] || { id: 29, number: "29", available: true },
        seatDataMap["30"] || { id: 30, number: "30", available: true },
        null, // aisle
        seatDataMap["31"] || { id: 31, number: "31", available: true },
        seatDataMap["32"] || { id: 32, number: "32", available: true },
      ],
      // Row 9: Seats 33, 34, 35, 36
      [
        seatDataMap["36"] || { id: 36, number: "36", available: true },
        seatDataMap["35"] || { id: 35, number: "35", available: true },
        null, // aisle
        seatDataMap["34"] || { id: 34, number: "34", available: true },
        seatDataMap["33"] || { id: 33, number: "33", available: true },
      ],
      // Extra legroom space
      null,
      // Row 10: Seats 37, 38, 39, 40
      [
        seatDataMap["37"] || { id: 37, number: "37", available: true },
        seatDataMap["38"] || { id: 38, number: "38", available: true },
        null, // aisle
        seatDataMap["39"] || { id: 39, number: "39", available: true },
        seatDataMap["40"] || { id: 40, number: "40", available: true },
      ],
      // Row 11 (Non-recliner section): Seats 41, 42, 43, 44, 45
      [
        seatDataMap["45"] || { id: 45, number: "45", available: true },
        seatDataMap["44"] || { id: 44, number: "44", available: true },
        seatDataMap["43"] || { id: 43, number: "43", available: true },
        seatDataMap["42"] || { id: 42, number: "42", available: true },
        seatDataMap["41"] || { id: 41, number: "41", available: true },
      ],
    ];

    return originalLayout;
  };

  // If vehicle is hybrid, render the hybrid layout and early return
  if ((bus.vehicleType || "").toLowerCase().includes("sleeper")) {
    return (
      <HybridSeatLayout
        bus={bus}
        selectedSeats={currentSelectedSeats}
        onSeatSelect={(seats: Seat[]) => {
          setCurrentSelectedSeats(seats);
          onSeatSelect && onSeatSelect(seats);
        }}
        onClose={onClose}
      />
    );
  }

  const seatRows = generateVerticalSeatLayout();

  const getSeatProps = (seat: SeatData | any) => {
    if (!seat) return {};

    const isSelected = currentSelectedSeats.some(
      (selectedSeat) =>
        selectedSeat.seat_number === (seat.seatName || seat.number) ||
        selectedSeat.seat_id === seat.id
    );
    const isFemaleReserved = !!seat.isReservedForFemales;

    // 1. Occupied seats
    if (seat.isOccupied) {
      if (isFemaleReserved) {
        return { bgColor: "#F9A8D4", strokeColor: "#ec4899" }; // Pink background
      }
      return { bgColor: "#d1d5db", strokeColor: "#6b7280" }; // Grey background
    }

    // 2. Selected seats
    if (isSelected) {
      const selectedSeat = currentSelectedSeats.find(
        (s) =>
          s.seat_number.toString() ===
            (seat.seatName || seat.number).toString() || s.seat_id === seat.id
      );
      const seatGender = getSeatGender(bus, selectedSeat!);
      if (seatGender === "female") {
        return { bgColor: Colors.pinkLight, strokeColor: "#1e3a8a" };
      }
      return {
        bgColor: isFemaleReserved ? Colors.pink : Colors.primaryBlue,
        strokeColor: isFemaleReserved ? Colors.pink : "#1e3a8a",
      };
    }

    // 3. Available, non-selected seats
    if (isFemaleReserved) {
      return { bgColor: "#ffffff", strokeColor: "#ec4899" }; // Pink border
    }

    if (seat.isReservedForMales || seat.availabilityStatus === "M") {
      return { bgColor: "#ffffff", strokeColor: "#000" };
    }

    return {
      bgColor: "#ffffff",
      strokeColor: "#9ca3af",
    };
  };

  const handleSeatClick = (seat: SeatData | any) => {
    if (!seat) return;
    // Only allow selecting available seats
    if (seat.isOccupied) return;
    const isAlreadySelected = selectedSeats.some(
      (currSeat) => currSeat.seat_id === seat.id
    );
    // console.log(isAlreadySelected, "is already selected");
    if (isAlreadySelected) {
      const filteredSeats = selectedSeats.filter(
        (currSeat) => currSeat.seat_id !== seat.id
      );

      // console.log(filteredSeats, "filtered seatsasf");
      setCurrentSelectedSeats(filteredSeats);
      if (onSeatSelect) onSeatSelect(filteredSeats);
      return;
    } else if (selectedSeats.length >= 6) {
      toast.error("you can only select 6 seats");
      return;
    } else if (!isAlreadySelected) {
      const seatNumber = seat.seatName || seat.number;

      // Map clicked seat to Seat interface (minimal fields filled)
      const mappedSeat: Seat = {
        seat_id: seat.id,
        seat_number: seatNumber,
        price: typeof seat.totalFare === "number" ? seat.totalFare : 0,
        type: undefined,
        fare_details: seat.fare || { "Base Fare": 0, GST: 0, Discount: 0 },
        is_reserved_female: Boolean(seat.isReservedForFemales),
        is_reserved_male: Boolean(seat.isReservedForMales),
        availability_status_code: seat.availabilityStatus || "A",
      };

      // Single-selection behavior: replace existing selection with this seat
      const next = [...selectedSeats, mappedSeat];
      setCurrentSelectedSeats(next);
      if (onSeatSelect) onSeatSelect(next);
    }
  };

  return (
    <div
      onClick={handleOverlayClick}
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-transparent transition-opacity duration-300 ease-in-out ${
        isLaptop ? "pr-20" : "p-0"
      } ${isVisible ? "opacity-100" : "opacity-0"}`}
    >
      <div
        className={`bg-white rounded-xl shadow-2xl border-2 border-gray-200 backdrop-blur-sm max-h-[90vh] overflow-y-auto transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1) ${
          isLaptop ? "ml-auto mr-0" : "ml-0 mr-0"
        } ${
          isVisible
            ? "translate-x-0 scale-100 opacity-100"
            : isLaptop
            ? "translate-x-[100px] scale-95 opacity-0"
            : "translate-y-[50px] scale-95 opacity-0"
        }`}
        style={{ width: "fit-content" }}
      >
        <div
          className={`transition-all duration-400 cubic-bezier(0.4, 0, 0.2, 1) delay-100 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
          }`}
        >
          {/* Vertical seat grid */}
          <div className="bg-gray-50 p-6 rounded-2xl relative border border-gray-200">
            {/* Steering wheel and close button container */}
            <div className="absolute top-2 right-6 flex items-center gap-2">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-qKHaKjHQpLOsaxyBRMWHv8cr1h3MIZ.png"
                alt="steering"
                className="w-6 h-6"
              />
              <button
                onClick={handleClose}
                className="text-gray-500 text-xl font-bold w-6 h-6 flex items-center justify-center rounded-full border-none bg-transparent cursor-pointer transition-all duration-200 ease-in-out hover:bg-gray-100 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="flex flex-col mt-5">
              {seatRows.map((row, rowIndex) => {
                if (row === null) {
                  // Extra legroom space
                  return (
                    <div
                      key={`legroom-${rowIndex}`}
                      className="flex justify-center items-center relative border-t-2 border-b-2 border-dashed border-emerald-500 my-2.5"
                    >
                      <div className="text-emerald-500 text-xs font-medium bg-white px-2 py-1 rounded">
                        Extra Legroom Space
                      </div>
                    </div>
                  );
                }

                // Check if this is the non-recliner row (seats 41-45)
                const isNonReclinerRow = row.some(
                  (seat) =>
                    seat &&
                    parseInt((seat as any).seatName || (seat as any).number) >=
                      41 &&
                    parseInt((seat as any).seatName || (seat as any).number) <=
                      45
                );

                return (
                  <div
                    key={rowIndex}
                    className={`flex justify-center items-center ${
                      isNonReclinerRow ? "gap-2" : "gap-1.5"
                    }`}
                  >
                    {row.map((seat, seatIndex) => (
                      <div
                        key={seatIndex}
                        className="flex justify-center relative"
                      >
                        {seat ? (
                          <button
                            type="button"
                            onClick={() => handleSeatClick(seat)}
                            className="relative flex justify-center items-center focus:outline-none"
                            aria-label={`Seat ${
                              (seat as any).seatName || (seat as any).number
                            }`}
                          >
                            <Seater {...getSeatProps(seat)} size={24} />
                            <div className="absolute text-[8px] font-bold text-gray-700 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                              {(seat as any).seatName || (seat as any).number}
                            </div>
                          </button>
                        ) : (
                          <div className="w-8 h-8 flex items-center justify-center">
                            {/* Just empty space - no aisle indicator */}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>

            {/* Non-recliner section indicator */}
            <div className="flex justify-center mt-2 items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg border border-blue-500">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-blue-500 text-xs font-semibold">
                Non-Recliner Seats (41-45)
              </span>
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatLayout;
