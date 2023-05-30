import React from "react";

interface IconProps {
    name: "search";
    height?: string | number;
    width?: string | number;
}

export default function Icon({ name, height, width }: IconProps) {
    switch (name) {
        case "search":
            return (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={width || "24"}
                    height={height || "24"}
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
    }
}
