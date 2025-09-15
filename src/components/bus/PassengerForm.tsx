import React, { useEffect } from "react";
import { getSeatBackgroundColor } from "../../utils/busUtils";

interface PassengerFormProps {
  currentPassenger: any;
  setCurrentPassenger: (p: any) => void;
  editingIndex: number | null;
  onAddOrUpdatePassenger: () => void;
  theme: string;
  seatNumber?: string;
  seatType?: string;
  bus?: any;
  selectedSeat?: any;
}

const PassengerForm: React.FC<PassengerFormProps> = ({
  currentPassenger,
  setCurrentPassenger,
  editingIndex,
  onAddOrUpdatePassenger,
  theme,
  seatNumber,
  seatType,
  bus,
  selectedSeat,
}) => {
  const isFemaleSeat = selectedSeat?.is_reserved_female;
  const isMaleSeat = selectedSeat?.is_reserved_male;

  useEffect(() => {
    if (isFemaleSeat && currentPassenger.gender !== "Female") {
      setCurrentPassenger({ ...currentPassenger, gender: "Female" });
    } else if (isMaleSeat && currentPassenger.gender !== "Male") {
      setCurrentPassenger({ ...currentPassenger, gender: "Male" });
    }
  }, [isFemaleSeat, isMaleSeat, setCurrentPassenger, currentPassenger]);

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-1 sm:space-x-2">
        {/* Seat display with proper styling based on gender */}
        <div
          className={`text-black text-[10px] font-medium px-1 py-1 rounded flex items-center flex-shrink-0 ${
            selectedSeat && bus
              ? getSeatBackgroundColor(bus, selectedSeat)
              : "bg-green-500"
          }`}
        >
          <span>{seatNumber}</span>
          <span className="ml-1 hidden sm:inline">({seatType})</span>
        </div>
        <input
          type="text"
          value={currentPassenger.name || ""}
          onChange={(e) => {
            const value = e.target.value.replace(/[^a-zA-Z\s]/g, "");
            setCurrentPassenger({ ...currentPassenger, name: value });
          }}
          placeholder="Name"
          className={`flex-1 min-w-0 p-1 border rounded text-[10px] sm:text-xs ${
            theme === "dark"
              ? "bg-gray-600 text-gray-300"
              : "bg-gray-200 text-gray-700"
          }`}
        />
        <input
          type="number"
          value={currentPassenger.age ?? ""}
          onChange={(e) => {
            const value = e.target.value;
            const numValue = parseInt(value);
            if (value === "" || (numValue >= 1 && numValue <= 120)) {
              setCurrentPassenger({
                ...currentPassenger,
                age: value === "" ? undefined : numValue,
              });
            }
          }}
          placeholder="Age"
          min="1"
          max="120"
          className={`w-10 sm:w-12 p-1 border rounded text-[10px] sm:text-xs appearance-none ${
            theme === "dark"
              ? "bg-gray-600 text-gray-300"
              : "bg-gray-200 text-gray-700"
          }`}
          style={{ MozAppearance: "textfield" }}
          onWheel={(e) => (e.target as HTMLInputElement).blur()}
        />
        <select
          value={currentPassenger.gender || ""}
          onChange={(e) =>
            setCurrentPassenger({ ...currentPassenger, gender: e.target.value })
          }
          disabled={isFemaleSeat || isMaleSeat}
          className={`w-12 sm:w-16 p-1 border rounded text-[10px] sm:text-xs ${
            theme === "dark"
              ? "bg-gray-600 text-gray-300"
              : "bg-gray-200 text-gray-700"
          } ${isFemaleSeat || isMaleSeat ? "cursor-not-allowed" : ""}`}
        >
          <option value="Male" disabled={isFemaleSeat}>
            M
          </option>
          <option value="Female" disabled={isMaleSeat}>
            F
          </option>
        </select>
        <button
          onClick={onAddOrUpdatePassenger}
          className="w-5 h-5 sm:w-6 sm:h-6 bg-[#fbe822] hover:bg-[#f2d800] text-gray-900 font-bold rounded-full text-xs sm:text-sm flex items-center justify-center shadow-sm transition-colors flex-shrink-0"
          title={editingIndex !== null ? "Update Passenger" : "Add Passenger"}
          style={{ lineHeight: "1" }}
        >
          +
        </button>
      </div>
    </div>
  );
};

export default PassengerForm;
