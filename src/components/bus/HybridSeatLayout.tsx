"use client";

import type React from "react";
import { useEffect, useState } from "react";
// import SeatIcon from "./SeatIcon";
import Seater from "../common/svg/seater";
import { Bus, Seat, SeatData } from "../../types/chat";
import { getSeatGender } from "../../utils/busUtils";
import { toast } from "react-toastify";
import SleeperIcon from "../common/svg/sleeper";

interface HybridSeatLayoutProps {
  bus: Bus;
  selectedSeats: Seat[];
  onSeatSelect?: (seats: Seat[]) => void;
  onClose: () => void;
}

type Deck = 0 | 1; // 0: lower (seater), 1: upper (sleeper)

const Colors = {
  availableBg: "#ffffff",
  availableStroke: "#9ca3af",
  maleBg: "#ffffff",
  maleStroke: "#000",
  femaleBg: "#ffffff",
  femaleStroke: "#ec4899",
  occupiedBg: "#d1d5db",
  occupiedStroke: "#6b7280",
  selectedStroke: "#1e3a8a",
  selectedMaleBg: "#FDE047",
  selectedFemaleBg: "#F9A8D4",
  neutralGreyDisable: "#9ca3af",
  primaryBlue: "#095FF0",
  pink: "#FF61C0",
  neutralGreyBg: "#f3f4f6",
  green300: "#10b981",
  yellow300: "#FDE047", // Tailwind yellow-300
  pinkLight: "#FFB7E2",
};

function seatVisualProps(bus: Bus, seat: SeatData, isSelected: boolean) {
  const isFemaleReserved = !!seat.isReservedForFemales;

  // 1. Occupied seats
  if (seat.isOccupied) {
    if (isFemaleReserved) {
      // Occupied by a female
      return { bgColor: Colors.pinkLight, strokeColor: Colors.pinkLight }; // Pink background
    }
    // Occupied by a male or gender not specified
    return { bgColor: Colors.occupiedBg, strokeColor: Colors.occupiedStroke }; // Grey background
  }

  // 2. Selected seats
  if (isSelected) {
    const gender = getSeatGender(bus, {
      seat_id: seat.id,
      seat_number: seat.seatName,
      price: seat.totalFare || 0,
      type: undefined,
      fare_details: seat.fare || { "Base Fare": 0, GST: 0, Discount: 0 },
      is_reserved_female: isFemaleReserved,
      is_reserved_male: !!seat.isReservedForMales,
      availability_status_code: seat.availabilityStatus || "A",
    } as Seat);

    if (gender === "female") {
      return {
        bgColor: Colors.pink,
        strokeColor: Colors.pink,
      };
    }
    return {
      bgColor: Colors.primaryBlue,
      strokeColor: "#1e3a8a",
    };
  }

  // 3. Available, non-selected seats
  if (isFemaleReserved) {
    return { bgColor: Colors.femaleBg, strokeColor: Colors.femaleStroke };
  }

  if (seat.isReservedForMales) {
    return { bgColor: Colors.maleBg, strokeColor: Colors.maleStroke };
  }

  return {
    bgColor: Colors.availableBg,
    strokeColor: Colors.availableStroke,
  };
}

const HybridSeatLayout: React.FC<HybridSeatLayoutProps> = ({
  bus,
  selectedSeats,
  onSeatSelect,
  onClose,
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  // Generate mock seat data if seatData is not available
  const generateMockSeatData = (deck: number) => {
    const seats: SeatData[] = [];

    if (deck === 0) {
      // Lower deck layout (mixed sleeper + seater configuration)
      const layout = [
        // Row 1: 1L (sleeper), 1, 2 (seaters)
        [1, 1, 2],
        // Row 2: 2L (sleeper), 3, 4 (seaters)
        [2, 3, 4],
        // Row 3: 3L (sleeper), 5, 6 (seaters)
        [3, 5, 6],
        // Row 4: 4L (sleeper), 7, 8 (seaters)
        [4, 7, 8],
        // Row 5: 5L (sleeper), 9, 10 (seaters)
        [5, 9, 10],
        // Row 6: 11, 12 (seaters only)
        [null, 11, 12],
        // Row 7: 13, 14 (seaters only)
        [null, 13, 14],
        // Row 8: 15, 16 (seaters only)
        [null, 15, 16],
        // Row 9: 17, 18 (seaters only)
        [null, 17, 18],
        // Row 10: 19, 20 (seaters only)
        [null, 19, 20],
        // Row 11: 21, 22, 23 (seaters only) - these should be after extra leg room
        [null, 21, 22, 23],
      ];

      layout.forEach((row, rowIndex) => {
        if (row === null) {
          // Extra leg room space - handled separately
          return;
        }
        row.forEach((seatNum, colIndex) => {
          if (seatNum !== null) {
            const isLeftSide = colIndex === 0; // Left side of aisle
            const isSleeperSeat = isLeftSide && seatNum <= 5; // 1L-5L are sleeper seats
            const isLSeat = isSleeperSeat; // L seats are sleeper seats

            seats.push({
              id: isLSeat ? seatNum + deck * 1000 + 100 : seatNum + deck * 1000, // L-seats get +100 to avoid ID conflicts
              x: rowIndex + 1,
              y: colIndex + 1,
              z: deck,
              width: 1,
              length: isSleeperSeat ? 2 : 1, // Sleeper seats are longer
              hasExtraLegRoom: false,
              isRecliner: isSleeperSeat, // Sleeper seats are recliners
              seatType: isSleeperSeat ? "sleeper" : "seater",
              totalFare: isSleeperSeat ? 2700 : isLeftSide ? 2899 : 899,
              seatName: isLSeat ? `${seatNum}L` : seatNum.toString(),
              isOccupied: Math.random() < 0.2,
              availabilityStatus: Math.random() < 0.2 ? "O" : "A",
              isReservedForFemales: false,
              isReservedForMales: false,
              fare: {
                "Base Fare": isSleeperSeat ? 3000 : isLeftSide ? 2800 : 800,
                GST: 360,
                Discount: isSleeperSeat ? -300 : 0,
              },
              hasStaticFare: true,
              isDummy: false,
            });
          }
        });
      });
    } else {
      // Upper deck layout (1+2 configuration for sleepers)
      const layout = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
        [10, 11, 12],
        [13, 14, 15],
      ];

      layout.forEach((row, rowIndex) => {
        row.forEach((seatNum, colIndex) => {
          seats.push({
            id: seatNum + deck * 1000,
            x: rowIndex + 1,
            y: colIndex + 1,
            z: deck,
            width: 1,
            length: 1,
            hasExtraLegRoom: false,
            isRecliner: true,
            seatType: "sleeper",
            totalFare: 2899,
            seatName: `${seatNum}U`,
            isOccupied: Math.random() < 0.2,
            availabilityStatus: Math.random() < 0.2 ? "O" : "A",
            isReservedForFemales: false,
            isReservedForMales: false,
            fare: { "Base Fare": 2800, GST: 99, Discount: 0 },
            hasStaticFare: true,
            isDummy: false,
          });
        });
      });
    }

    return seats;
  };
  // console.log(Array.isArray(bus.seatData), "bus data asdf");
  const lowerSeats =
    Array.isArray(bus.seatData?.seats) && bus.seatData.seats.length > 0
      ? bus.seatData.seats.filter((s) => s.z === 0)
      : generateMockSeatData(0);
  // console.log(lowerSeats, "lower seats");
  const upperSeats =
    Array.isArray(bus.seatData?.seats) && bus.seatData.seats.length > 0
      ? bus.seatData.seats.filter((s) => s.z === 1)
      : generateMockSeatData(1);

  // Debug logging
  // console.log("Bus object:", bus);
  // console.log("Bus seatData:", bus.seatData?.seats);
  // console.log("Lower seats:", lowerSeats);
  // console.log("Upper seats:", upperSeats);

  const isSelected = (seat: SeatData) =>
    selectedSeats.some((sel) => sel.seat_id === seat.id);

  const handleSeatClick = (seat: SeatData) => {
    // console.log("Seat clicked:", seat);
    // console.log(selectedSeats, "already selected seats");
    if (!seat) return;
    if (seat.isOccupied) return;

    const already = selectedSeats.some((s) => s.seat_id === seat.id);
    if (already) {
      const next = selectedSeats.filter((s) => s.seat_id !== seat.id);
      onSeatSelect && onSeatSelect([...next]);
      return;
    }
    // console.log(selectedSeats, "selected seats data asdf");
    if (selectedSeats.length >= 6) {
      toast.error("you can only select 6 seats");
      return;
    }

    const mapped: Seat = {
      seat_id: seat.id,
      seat_number: seat.seatName,
      price: typeof seat.totalFare === "number" ? seat.totalFare : 0,
      type: undefined,
      fare_details: seat.fare || { "Base Fare": 0, GST: 0, Discount: 0 },
      is_reserved_female: !!seat.isReservedForFemales,
      is_reserved_male: !!seat.isReservedForMales,
      availability_status_code: seat.availabilityStatus || "A",
    };
    onSeatSelect && onSeatSelect([...selectedSeats, mapped]);
  };

  const renderDeck = (deck: Deck) => {
    const list = deck === 0 ? lowerSeats : upperSeats;
    const isSleeper = deck === 1; // upper deck sleepers in given data

    if (!list || list.length === 0) {
      return (
        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 relative">
          <div className="absolute top-2 right-3">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-qKHaKjHQpLOsaxyBRMWHv8cr1h3MIZ.png"
              alt="steering"
              className="w-5 h-5"
            />
          </div>
          <div className="text-center text-gray-500 py-8">
            No seats available
          </div>
        </div>
      );
    }

    // Group seats by row (x coordinate)
    const seatsByRow: { [key: number]: SeatData[] } = {};
    list.forEach((seat) => {
      if (!seatsByRow[seat.x]) {
        seatsByRow[seat.x] = [];
      }
      seatsByRow[seat.x].push(seat);
    });

    // Sort rows and seats within each row
    const sortedRows = Object.keys(seatsByRow)
      .map(Number)
      .sort((a, b) => a - b)
      .map((x) => seatsByRow[x].sort((a, b) => a.y - b.y));

    return (
      <div className="bg-gray-50 p-4 rounded-2xl flex flex-col  border border-gray-200 ">
        {
          <div className="flex justify-end top-2 right-1 pb-2">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-qKHaKjHQpLOsaxyBRMWHv8cr1h3MIZ.png"
              alt="steering"
              className="w-5 h-5"
            />
          </div>
        }
        <div className="flex flex-col">
          {deck === 0 ? (
            // Lower deck with extra leg room sections
            <>
              {/* First extra leg room space - spans both sides */}
              <div className="flex justify-center items-center relative border-t-2 border-b-2 border-dashed border-emerald-500 my-2">
                <div className="text-emerald-500 text-xs font-medium bg-white px-2 py-1 rounded">
                  Extra Leg Room Space
                </div>
              </div>

              <div className="flex gap-6 items-center justify-center">
                {/* Left side - L seats (sleeper berths) - single vertical column */}
                <div className="flex flex-col gap-4">
                  {/* L-seats (1L, 2L, 3L, 4L, 5L) - vertical column */}
                  {lowerSeats
                    .filter((seat) => seat.seatName.includes("L"))
                    .sort((a, b) => parseInt(a.seatName) - parseInt(b.seatName))
                    .map((seat) => {
                      const vis = seatVisualProps(bus, seat, isSelected(seat));
                      const variant =
                        seat.seatType.toLowerCase() === "sleeper"
                          ? "sleeper"
                          : "seater";
                      const size = 28;

                      return (
                        <div key={seat.id} className="flex justify-center mb-1">
                          <button
                            type="button"
                            onClick={() => handleSeatClick(seat)}
                            className="relative flex items-center justify-center focus:outline-none hover:scale-105 transition-transform"
                            aria-label={`Seat ${seat.seatName}`}
                          >
                            {/* <SeatIcon {...vis} size={size} variant={variant} /> */}
                            {variant === "sleeper" ? (
                              <SleeperIcon {...vis} size={14} />
                            ) : (
                              <Seater {...vis} size={size} />
                            )}
                            <div className="absolute text-[10px] font-bold text-gray-800 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
                              {seat.seatName}
                            </div>
                          </button>
                        </div>
                      );
                    })}
                </div>

                {/* Right side - Regular seater seats */}
                <div className="flex flex-col gap-2">
                  {/* Regular seater seats - grouped by rows (excluding last 3 seats) */}
                  {sortedRows.slice(0, -1).map((rowSeats, rowIndex) => {
                    // Filter out L-seats from each row
                    const seaterSeats = rowSeats.filter(
                      (seat) => !seat.seatName.includes("L")
                    );
                    if (seaterSeats.length === 0) return null;

                    return (
                      <div
                        key={rowIndex}
                        className="flex items-center justify-center gap-2 mb-1"
                      >
                        {seaterSeats.map((seat) => {
                          const vis = seatVisualProps(
                            bus,
                            seat,
                            isSelected(seat)
                          );
                          const variant =
                            seat.seatType === "sleeper" ? "sleeper" : "seater";
                          const size = 28;

                          return (
                            <button
                              key={seat.id}
                              type="button"
                              onClick={() => handleSeatClick(seat)}
                              className="relative flex items-center justify-center focus:outline-none hover:scale-105 transition-transform"
                              aria-label={`Seat ${seat.seatName}`}
                            >
                              {variant === "sleeper" ? (
                                <SleeperIcon {...vis} size={14} />
                              ) : (
                                <Seater {...vis} size={size} />
                              )}
                              <div className="absolute text-[10px] font-bold text-gray-800 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
                                {seat.seatName}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Second extra leg room space - spans both sides */}
              <div className="flex justify-center items-center relative border-t-2 border-b-2 border-dashed border-emerald-500 my-2">
                <div className="text-emerald-500 text-xs font-medium bg-white px-2 py-1 rounded">
                  Extra Leg Room Space
                </div>
              </div>

              {/* Last 3 seater seats (21, 22, 23) after extra leg room space */}
              <div className="flex gap-6">
                {/* Empty space on left to align with L-seats */}
                <div className="flex flex-col gap-2">
                  {/* Empty space to maintain alignment */}
                </div>

                {/* Right side - Last 3 seater seats */}
                <div className="flex flex-col gap-2">
                  {/* Last row with 3 seats (21, 22, 23) */}
                  {sortedRows.slice(-1).map((rowSeats, rowIndex) => {
                    // Filter out L-seats from each row
                    const seaterSeats = rowSeats.filter(
                      (seat) => !seat.seatName.includes("L")
                    );
                    if (seaterSeats.length === 0) return null;

                    return (
                      <div
                        key={rowIndex}
                        className="flex items-center justify-center gap-2 mb-1"
                      >
                        {seaterSeats.map((seat) => {
                          const vis = seatVisualProps(
                            bus,
                            seat,
                            isSelected(seat)
                          );
                          const variant =
                            seat.seatType === "sleeper" ? "sleeper" : "seater";
                          const size = 28;

                          return (
                            <button
                              key={seat.id}
                              type="button"
                              onClick={() => handleSeatClick(seat)}
                              className="relative flex items-center justify-center focus:outline-none hover:scale-105 transition-transform"
                              aria-label={`Seat ${seat.seatName}`}
                            >
                              {variant === "sleeper" ? (
                                <SleeperIcon {...vis} size={14} />
                              ) : (
                                <Seater {...vis} size={size} />
                              )}
                              <div className="absolute text-[10px] font-bold text-gray-800 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
                                {seat.seatName}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            // Upper deck (1+2 configuration) - aligned with lower deck
            <div className="flex gap-6">
              {/* Left side - single seat column (aligned with L-seats from lower deck) */}
              <div className="flex flex-col gap-2">
                {sortedRows.map((rowSeats) => {
                  const leftSeat = rowSeats.slice(0, 1)[0];
                  if (!leftSeat) return null;

                  const vis = seatVisualProps(
                    bus,
                    leftSeat,
                    isSelected(leftSeat)
                  );
                  const variant = isSleeper ? "sleeper" : "seater";
                  const size = 28;

                  return (
                    <div key={leftSeat.id} className="flex justify-center mb-1">
                      <button
                        type="button"
                        onClick={() => handleSeatClick(leftSeat)}
                        className="relative flex items-center justify-center focus:outline-none hover:scale-105 transition-transform"
                        aria-label={`Seat ${leftSeat.seatName}`}
                      >
                        {variant === "sleeper" ? (
                          <SleeperIcon {...vis} size={14} />
                        ) : (
                          <Seater {...vis} size={size} />
                        )}
                        <div className="absolute text-[10px] font-bold text-gray-800 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
                          {leftSeat.seatName}
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Right side - 2 seats per row (aligned with regular seater seats from lower deck) */}
              <div className="flex flex-col gap-2">
                {sortedRows.map((rowSeats, rowIndex) => {
                  const rightSeats = rowSeats.slice(1, 3);
                  if (rightSeats.length === 0) return null;

                  return (
                    <div
                      key={rowIndex}
                      className="flex items-center justify-center gap-2 mb-1"
                    >
                      {rightSeats.map((seat) => {
                        const vis = seatVisualProps(
                          bus,
                          seat,
                          isSelected(seat)
                        );
                        const variant = isSleeper ? "sleeper" : "seater";
                        const size = 28;

                        return (
                          <button
                            key={seat.id}
                            type="button"
                            onClick={() => handleSeatClick(seat)}
                            className="relative flex items-center justify-center focus:outline-none hover:scale-105 transition-transform"
                            aria-label={`Seat ${seat.seatName}`}
                          >
                            {variant === "sleeper" ? (
                              <SleeperIcon {...vis} size={14} />
                            ) : (
                              <Seater {...vis} size={size} />
                            )}
                            <div className="absolute text-[10px] font-bold text-gray-800 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
                              {seat.seatName}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-transparent transition-opacity duration-300 ease-in-out ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white rounded-xl shadow-2xl border-2 border-gray-200 backdrop-blur-sm max-h-[90vh] overflow-y-auto transition-all duration-300"
        style={{ width: "fit-content" }}
      >
        <div
          className={`transition-all duration-400 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
          }`}
        >
          <div className="flex gap-4 p-4">
            <div className="flex flex-col items-center gap-2">
              {/* <div className="text-sm font-semibold text-gray-600">Upper</div> */}
              {renderDeck(1)}
            </div>
            <div className="flex flex-col items-center gap-2">
              {/* <div className="text-sm font-semibold text-gray-600">Lower</div> */}
              {renderDeck(0)}
            </div>
          </div>

          {/* <div className="flex justify-center pb-3">
            <button
              onClick={onClose}
              className="text-gray-600 text-sm px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-50"
              type="button"
            >
              Close
            </button>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default HybridSeatLayout;
