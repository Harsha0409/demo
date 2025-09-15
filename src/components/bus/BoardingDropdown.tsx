import React from "react";
import { convertToIST } from "../../utils/busUtils";

interface BoardingDropdownProps {
  label: string;
  options: any[];
  selected: string | null;
  onSelect: (value: string) => void;
  dropdownOpen: boolean;
  setDropdownOpen: (open: boolean) => void;
  theme: string;
  type: "boarding" | "dropping";
}

const BoardingDropdown: React.FC<BoardingDropdownProps> = ({
  label,
  options,
  selected,
  onSelect,
  dropdownOpen,
  setDropdownOpen,
  theme,
  type,
}) => {
  return (
    <div className={`w-1/2 ${type === "boarding" ? "pr-2" : "pl-2"} relative`}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className={`w-full flex items-center justify-between text-[10px] ${
          theme === "dark"
            ? "bg-gray-800 hover:bg-gray-700"
            : "bg-gray-50 hover:bg-gray-100"
        } p-1 rounded transition-colors`}
      >
        <span className="font-medium text-gray-700 dark:text-gray-300 flex-1 flex justify-between items-center">
          {selected ? (
            <>
              <span className="truncate">{selected}</span>
              <span className="text-[9px] text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
                {options.find((opt) => {
                  const name =
                    type === "boarding"
                      ? opt.boardingPoint.name
                      : opt.droppingPoint.name;
                  return name === selected;
                }) &&
                  convertToIST(
                    options.find((opt) => {
                      const name =
                        type === "boarding"
                          ? opt.boardingPoint.name
                          : opt.droppingPoint.name;
                      return name === selected;
                    })!.currentTime
                  ).time}
              </span>
            </>
          ) : (
            label
          )}
        </span>
        <span className="text-gray-500 dark:text-gray-400 ml-2">▼</span>
      </button>
      {dropdownOpen && (
        <div
          className={`absolute z-10 mt-0.5 space-y-1 border rounded-lg p-1 custom-scrollbar ${
            theme === "dark"
              ? "bg-gray-800 border-gray-700"
              : "bg-gray-50 border-gray-200"
          }`}
          style={{ maxHeight: "150px", overflowY: "auto", width: "100%" }}
        >
          {options.map((point: any) => {
            const name =
              type === "boarding"
                ? point.boardingPoint.name
                : point.droppingPoint.name;
            const landmark =
              type === "boarding"
                ? point.boardingPoint.landmark
                : point.droppingPoint.landmark;
            const { time } = convertToIST(point.currentTime);
            const isSelected = selected === name;

            return (
              <button
                key={
                  type === "boarding"
                    ? point.boarding_point_id
                    : point.dropping_point_id
                }
                className={`dropdown-item w-full p-1 text-left rounded gap-1 text-[10px] ${
                  isSelected
                    ? "bg-[var(--color-primary)] text-white"
                    : "hover:bg-[var(--color-secondary)] hover:text-white"
                }`}
                onClick={() => {
                  onSelect(name);
                  setDropdownOpen(false);
                }}
              >
                <p className="font-medium">{name}</p>
                <p className="text-[9px] text-gray-300">
                  {time} - {landmark}
                </p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BoardingDropdown;
