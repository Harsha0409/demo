// import { Colors } from "@/constants/colorConstants";

export type TSeatIconProps = {
  bgColor?: string;
  strokeColor?: string;
  size?: number;
  classname?: string;
  opacity?: number;
  length?: number;
};

export default function SleeperIcon({
  bgColor = "white",
  strokeColor = "#5A94F5",
  classname,
  opacity = 1,
}: //   length = 1,
TSeatIconProps) {
  return (
    <svg
      width="24"
      height="52"
      viewBox="0 0 34 74"
      opacity={opacity}
      className={classname}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        fill={bgColor}
        stroke={strokeColor}
        x="0.4"
        y="0.4"
        width="33.2"
        height="73.2"
        rx="3.6"
        strokeWidth="0.5"
      />
      <rect
        fill={bgColor}
        stroke={strokeColor}
        x="8.4"
        y="60.4"
        width="17.2"
        height="7.2"
        rx="1.6"
        strokeWidth="0.5"
      />
    </svg>
  );
}
