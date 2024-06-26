import React from "react";
import { space_grotesk, work_sans } from "@/util/fonts";

interface TypographyProps {
    children?: React.ReactNode;
    variant?: "h1" | "h2" | "span" | "secondary";
    uppercase?: boolean;
    bold?: boolean;
    font?: "space_grotesk" | "work_sans";
    className?: string;
    sm?: boolean;
    style?: React.CSSProperties;
    code?: boolean;
}

export default function Typography({
    children,
    variant,
    uppercase,
    bold,
    font,
    className,
    sm,
    style,
    code,
}: TypographyProps) {
    let sharedClass = "";
    if (uppercase) {
        sharedClass += "uppercase ";
    }
    if (bold) {
        sharedClass += "font-bold ";
    }
    if (font === "work_sans") {
        sharedClass += work_sans.className + " ";
    } else {
        sharedClass += space_grotesk.className + " ";
    }
    if (sm) {
        sharedClass += "text-sm";
    }

    if (variant === "h1") {
        return <h1 className={`${sharedClass} text-4xl font-bold ${className}`}>{children}</h1>;
    }

    if (variant === "h2") {
        return <h2 className={`${sharedClass} text-2xl font-bold ${className}`}>{children}</h2>;
    }

    if (variant === "span") {
        return <span className={`${sharedClass} ${className}`}>{children}</span>;
    }

    if (code) {
        return (
            <code className={`${sharedClass} !font-mono bg-zinc-300 rounded px-1 inline`}>
                {children}
            </code>
        );
    }

    return (
        <p
            style={style}
            className={`${sharedClass} ${
                variant === "secondary" ? "text-xs tracking-widest text-zinc-600" : ""
            } ${className}`}
        >
            {children}
        </p>
    );
}
