import { space_grotesk } from "@/util/fonts";
import React, { useState } from "react";
import Typography from "./Typography";

interface CheckBoxInputProps {
    name?: string;
    checked?: boolean;
    onCheckedChange?(newVal: boolean): void;
    className?: string;
}
function CheckBoxInput({ name, checked, onCheckedChange, className }: CheckBoxInputProps) {
    const [isChecked, setIsChecked] = useState(!!checked);

    React.useEffect(() => {
        onCheckedChange && onCheckedChange(isChecked);
    }, [isChecked]);

    return (
        <div
            className={`${className} flex flex-row items-center hover:bg-zinc-300 w-fit px-2 py-1 rounded-md transition-all cursor-pointer`}
            onClick={() => {
                setIsChecked(!isChecked);
            }}
        >
            <div
                className={`w-4 h-4 rounded-sm transition-all border-zinc-400  border-2 ${
                    isChecked ? "bg-indigo-600" : "bg-transparent"
                }`}
            />
            <label htmlFor={name} className="cursor-pointer ml-2">
                <Typography className="select-none">{name}</Typography>
            </label>
        </div>
    );
}

interface InputProps extends CheckBoxInputProps {
    className?: string;
    type?: React.HTMLInputTypeAttribute;
    placeholder?: string;
    onChange?(newVal: string): void;
    value?: string | number;
    small?: boolean;
    hasError?: boolean;
    errorMsg?: string;
    hollow?: boolean;
    disabled?: boolean;
    onKeyDown?(e: React.KeyboardEvent<HTMLInputElement>): void;
    onKeyDownTextArea?(e: React.KeyboardEvent<HTMLTextAreaElement>): void;
}
export default function Input({
    name,
    className,
    type,
    onChange,
    placeholder,
    checked,
    onCheckedChange,
    value,
    small,
    hasError,
    errorMsg,
    hollow,
    disabled,
    onKeyDown,
    onKeyDownTextArea,
}: InputProps) {
    if (type === "checkbox") {
        return (
            <CheckBoxInput
                className={className}
                checked={checked}
                name={name}
                onCheckedChange={onCheckedChange}
            />
        );
    }

    if (type === "textarea") {
        return (
            <div className="relative">
                <textarea
                    id={name}
                    name={name}
                    value={value}
                    rows={4}
                    placeholder={placeholder}
                    onKeyDown={onKeyDownTextArea}
                    onChange={(e) => {
                        if (onChange) {
                            onChange(e.currentTarget.value);
                        }
                    }}
                    className={`${space_grotesk.className} ${
                        small ? "rounded-sm py-1 px-2" : "py-3 px-4 w-full rounded-md"
                    } bg-zinc-50 border-2 ${
                        hasError ? "border-rose-700" : "border-transparent"
                    } outline-none shadow-sm relative z-[15] ${className}`}
                ></textarea>
                {hasError && errorMsg && (
                    <div className="z-10 bg-rose-700 text-white absolute -bottom-5 left-0 px-2 pt-2 rounded-b-md shadow-sm">
                        <Typography className="text-sm">{errorMsg}</Typography>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="relative">
            <input
                id={name}
                disabled={disabled}
                type={type}
                name={name}
                value={value}
                placeholder={placeholder}
                onKeyDown={onKeyDown}
                onChange={(e) => {
                    if (onChange) {
                        onChange(e.currentTarget.value);
                    }
                }}
                className={`${space_grotesk.className} ${
                    small ? "rounded-sm py-1 px-2" : "py-3 px-4 w-full rounded-md"
                } ${hollow ? "border-zinc-400 bg-transparent" : "bg-zinc-50"} border-2  ${
                    hasError ? "!border-rose-700" : "border-transparent"
                } outline-none shadow-sm relative z-[15] disabled:bg-zinc-300 ${className}`}
            />
            {hasError &&
                errorMsg &&
                (hollow ? (
                    <div className="z-10 bg-rose-700 text-white absolute -bottom-[2px] translate-y-full left-0 px-2 py-1 rounded-md shadow-sm">
                        <Typography className="text-sm">{errorMsg}</Typography>
                    </div>
                ) : (
                    <div className="z-10 bg-rose-700 text-white absolute -bottom-5 left-0 px-2 pt-2 rounded-b-md shadow-sm">
                        <Typography className="text-sm">{errorMsg}</Typography>
                    </div>
                ))}
        </div>
    );
}
