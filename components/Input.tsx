import { space_grotesk } from "@/util/fonts";
import React, { useState } from "react";
import Typography from "./Typography";

interface CheckBoxInputProps {
    name?: string;
    checked?: boolean;
    onCheckedChange?(newVal: boolean): void;
}
function CheckBoxInput({ name, checked, onCheckedChange }: CheckBoxInputProps) {
    const [isChecked, setIsChecked] = useState(!!checked);

    React.useEffect(() => {
        onCheckedChange && onCheckedChange(isChecked);
    }, [isChecked]);

    return (
        <div
            className="flex flex-row items-center hover:bg-zinc-300 w-fit px-2 py-1 rounded-md transition-all cursor-pointer"
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
    value?: string;
    small?: boolean;
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
}: InputProps) {
    if (type === "checkbox") {
        return <CheckBoxInput checked={checked} name={name} onCheckedChange={onCheckedChange} />;
    }

    return (
        <input
            id={name}
            type={type}
            name={name}
            value={value}
            placeholder={placeholder}
            onChange={(e) => {
                if (onChange) {
                    onChange(e.currentTarget.value);
                }
            }}
            className={`${space_grotesk.className} ${
                small ? "rounded-sm py-1 px-2" : "py-3 px-4 w-full rounded-md"
            } bg-white border-none outline-none shadow-sm ${className}`}
        />
    );
}
