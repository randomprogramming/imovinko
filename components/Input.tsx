import { space_grotesk } from "@/util/fonts";
import React, { useState } from "react";
import Typography from "./Typography";
import CurrencyInput from "react-currency-input-field";
import PhoneInput from "react-phone-input-2";

interface CheckBoxInputProps {
    name?: string;
    checked?: boolean;
    onCheckedChange?(newVal: boolean): void;
    className?: string;
    disabled?: boolean;
}
function CheckBoxInput({
    name,
    checked,
    onCheckedChange,
    className,
    disabled,
}: CheckBoxInputProps) {
    const [isChecked, setIsChecked] = useState(!!checked);

    React.useEffect(() => {
        if (!disabled) {
            onCheckedChange && onCheckedChange(isChecked);
        }
    }, [isChecked]);

    React.useEffect(() => {
        setIsChecked(!!checked);
    }, [checked]);

    return (
        <div
            className={`${className} flex flex-row items-center hover:bg-zinc-300 w-fit px-2 py-1 rounded-md transition-all ${
                !disabled && "cursor-pointer"
            }`}
            onClick={() => {
                if (!disabled) {
                    setIsChecked(!isChecked);
                }
            }}
        >
            <div
                className={`w-4 h-4 rounded-sm transition-all border-zinc-400  border-2 ${
                    isChecked ? "bg-indigo-600" : "bg-transparent"
                } ${disabled && "bg-zinc-400"}`}
            />
            <label htmlFor={name} className={`${!disabled && "cursor-pointer"} ml-2`}>
                <Typography className="select-none">{name}</Typography>
            </label>
        </div>
    );
}

interface InputProps extends CheckBoxInputProps {
    className?: string;
    type?: React.HTMLInputTypeAttribute | "currency" | "phone-2";
    placeholder?: string;
    onChange?(newVal: string): void;
    value?: string | number | null;
    small?: boolean;
    hasError?: boolean;
    errorMsg?: string;
    hollow?: boolean;
    disabled?: boolean;
    onKeyDown?(e: React.KeyboardEvent<HTMLInputElement>): void;
    onKeyDownTextArea?(e: React.KeyboardEvent<HTMLTextAreaElement>): void;
    suffix?: string;
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
    suffix,
}: InputProps) {
    if (type === "checkbox") {
        return (
            <CheckBoxInput
                className={className}
                checked={checked}
                name={name}
                onCheckedChange={onCheckedChange}
                disabled={disabled}
            />
        );
    }

    if (type === "textarea") {
        return (
            <div className="relative">
                <textarea
                    id={name}
                    name={name}
                    value={value || undefined}
                    rows={4}
                    placeholder={placeholder}
                    onKeyDown={onKeyDownTextArea}
                    disabled={disabled}
                    onChange={(e) => {
                        if (onChange) {
                            onChange(e.currentTarget.value);
                        }
                    }}
                    className={`disabled:bg-zinc-300 ${space_grotesk.className} ${
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

    if (type === "currency") {
        return (
            <div className="relative">
                <CurrencyInput
                    decimalsLimit={2}
                    groupSeparator=" "
                    intlConfig={{
                        locale: "hr",
                        currency: "EUR",
                    }}
                    id={name}
                    disabled={disabled}
                    type={type}
                    name={name}
                    value={value || undefined}
                    placeholder={placeholder}
                    onKeyDown={onKeyDown}
                    onValueChange={(newval) => {
                        if (onChange) {
                            onChange(newval || "");
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

    if (type === "phone-2") {
        // TODO: Localize country names
        // Also this phoneinput library doesn't have a 'name' property...
        return (
            <div className="relative">
                <PhoneInput
                    containerClass={`${space_grotesk.className} ${
                        hasError ? "!border-rose-700" : "border-transparent"
                    } border-2 border-zinc-400 rounded-md `}
                    inputClass="!bg-transparent !border-none !text-base !h-auto !py-2"
                    buttonClass="!border-l-0 !border-t-0 !border-b-0 !border-2 !border-zinc-400 [&>*:first-child]:!px-2 [&>*:first-child]:!rounded-l-md !bg-zinc-100"
                    dropdownClass="!rounded-sm"
                    value={String(value)}
                    country="hr" // This is the default country
                    countryCodeEditable={false}
                    onChange={onChange}
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

    return (
        <div
            className={`relative ${small ? "rounded-sm" : "w-full rounded-md"} ${
                hollow ? "border-zinc-400 bg-transparent" : "bg-zinc-50"
            } shadow-sm z-[15] flex flex-row`}
        >
            <input
                id={name}
                disabled={disabled}
                type={type}
                name={name}
                value={value || ""}
                placeholder={placeholder}
                onKeyDown={onKeyDown}
                onChange={(e) => {
                    if (onChange) {
                        onChange(e.currentTarget.value);
                    }
                }}
                className={`flex-1 border-2 ${small ? "rounded-sm" : "rounded-md"} ${
                    hasError ? "!border-rose-700" : "border-transparent"
                } ${space_grotesk.className} ${
                    small ? "py-1 px-2" : "py-3 px-4"
                } disabled:bg-zinc-300 bg-transparent outline-none z-[15] ${
                    hollow ? "border-zinc-400 bg-transparent" : "bg-zinc-50"
                } ${className}`}
            />
            {suffix && (
                <label htmlFor={name} className="flex items-center justify-center px-4 select-none">
                    <Typography bold>{suffix}</Typography>
                </label>
            )}
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
