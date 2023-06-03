import { space_grotesk } from "@/util/fonts";
import React from "react";

interface InputProps {
    name?: string;
    className?: string;
    type?: React.HTMLInputTypeAttribute;
    onChange?(newVal: string): void;
    placeholder?: string;
}

export default function Input({ name, className, type, onChange, placeholder }: InputProps) {
    return (
        <input
            id={name}
            type={type}
            name={name}
            placeholder={placeholder}
            onChange={(e) => {
                if (onChange) {
                    onChange(e.currentTarget.value);
                }
            }}
            className={`${space_grotesk.className} w-full bg-white border-none outline-none py-3 px-4 shadow-sm rounded-md ${className}`}
        />
    );
}
