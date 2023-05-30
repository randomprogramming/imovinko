import React from "react";

interface IconProps {
    name: "search" | "account";
    height?: string | number;
    width?: string | number;
}

const DEFAULT_W = "24";
const DEFAULT_H = "24";
// TODO: Add a default color for these
export default function Icon({ name, height, width }: IconProps) {
    switch (name) {
        case "search":
            return (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={width || DEFAULT_W}
                    height={height || DEFAULT_H}
                    viewBox="0 0 24 24"
                >
                    <g
                        fill="none"
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                    >
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21l-4.35-4.35" />
                    </g>
                </svg>
            );
        case "account":
            return (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={width || DEFAULT_W}
                    height={height || DEFAULT_H}
                    viewBox="0 0 24 24"
                >
                    <path
                        fill="currentColor"
                        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm0 4c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm0 14c-2.03 0-4.43-.82-6.14-2.88a9.947 9.947 0 0 1 12.28 0C16.43 19.18 14.03 20 12 20z"
                    />
                </svg>
            );
    }
}
