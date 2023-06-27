import React from "react";
import NextLink from "next/link";
import Typography from "./Typography";

interface LinkProps {
    onClick?(): void;
    to?: string;
    children: React.ReactNode;
    className?: string;
    disableAnimatedHover?: boolean;
}

export default function Link({
    to,
    onClick,
    children,
    className,
    disableAnimatedHover,
}: LinkProps) {
    if (to) {
        return (
            <NextLink href={to} className={`${className} group relative`}>
                {children}
                {!disableAnimatedHover && (
                    <span className="absolute w-0 group-hover:w-full transition-all duration-200 h-0.5 bg-zinc-800 -bottom-0.5 left-0" />
                )}
            </NextLink>
        );
    }

    return (
        <button
            onClick={onClick}
            className={`outline-none border-none bg-transparent p-1 group ${className}`}
        >
            <Typography>{children}</Typography>
            {/* Underline effect */}
            <span className="block max-w-0 group-hover:max-w-full transition-all duration-200 h-0.5 bg-zinc-800" />
        </button>
    );
}
