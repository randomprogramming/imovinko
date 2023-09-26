import React, { useState } from "react";
import Icon, { IconName } from "./Icon";

interface Option {
    value: string;
    iconName?: IconName;
}

interface DropdownProps {
    options: Option[];
    className?: string;
    onOptionChange?(opt: Option): void;
}
export default function Dropdown({ options, className, onOptionChange }: DropdownProps) {
    const [selectedVal, setSelectedVal] = useState<Option>(options[0]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    function onNewOpt(newOpt: Option) {
        setSelectedVal(newOpt);
        setIsDropdownOpen(false);
        if (onOptionChange) {
            onOptionChange(newOpt);
        }
    }

    React.useEffect(() => {
        if (onOptionChange) {
            onOptionChange(selectedVal);
        }
    }, [selectedVal]);

    if (options.length === 0) {
        return <div className="h-full w-4 bg-zinc-50"></div>;
    }

    return (
        <div className="relative inline-flex">
            <div
                className={`h-full bg-zinc-50 flex flex-row items-center justify-center cursor-pointer select-none ${className}`}
                onClick={() => {
                    setIsDropdownOpen(!isDropdownOpen);
                }}
            >
                <div className="py-1">
                    {selectedVal.iconName && (
                        <div className="px-1">
                            <Icon width={28} height={28} name={selectedVal.iconName} />
                        </div>
                    )}
                </div>
                <div className="mx-1">
                    <Icon
                        name="down-chevron"
                        height={28}
                        width={28}
                        className={`${
                            isDropdownOpen ? "rotate-90" : "rotate-0"
                        } transition-all origin-center`}
                    />
                </div>
            </div>
            <div
                className={`absolute left-0 z-50 -bottom-2 translate-y-full shadow-md rounded-md bg-zinc-50 transition-all ${
                    isDropdownOpen ? "h-fit overflow-y-auto" : "h-0 invisible hidden top-0"
                }`}
            >
                {options.map((o) => {
                    return (
                        <div
                            key={o.value}
                            className="cursor-pointer select-none hover:bg-zinc-200 flex flex-row items-center justify-center py-2"
                            onClick={() => {
                                onNewOpt(o);
                            }}
                        >
                            {o.iconName && (
                                <div className="px-4">
                                    <Icon width={32} height={32} name={o.iconName} />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
