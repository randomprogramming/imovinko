import React from "react";
import Typography from "./Typography";
import Icon, { IconName } from "./Icon";

interface IButtonProps {
    onClick?(e: React.MouseEvent<HTMLButtonElement>): void;
    children?: React.ReactNode;
    label?: string;
}

function Transparent({ onClick, children }: IButtonProps) {
    return (
        <button
            className="p-2 hover:bg-zinc-300 transition-all flex items-center justify-center rounded-lg"
            onClick={onClick}
        >
            {children}
        </button>
    );
}

interface PrimaryButtonProps extends IButtonProps {
    hollow?: boolean;
    icon?: IconName;
    loading?: boolean;
}

function Primary({ onClick, children, label, hollow, icon, loading }: PrimaryButtonProps) {
    return (
        <button
            className={`p-2 hover:bg-zinc-800 disabled:bg-zinc-600 ${
                hollow
                    ? "text-zinc-900 hover:text-white bg-transparent border-2 border-zinc-900"
                    : "text-white bg-zinc-900 shadow-md"
            } w-full transition-all flex items-center justify-center rounded-md hover:rounded-lg disabled:rounded-md h-14`}
            onClick={onClick}
            disabled={loading}
        >
            {label ? (
                <div className="flex flex-row items-center justify-center space-x-2">
                    {loading && <Icon height="24" width="24" name="loading" />}
                    {icon && <Icon height="24" width="24" name={icon} />}
                    <Typography uppercase bold>
                        {label}
                    </Typography>
                </div>
            ) : (
                children
            )}
        </button>
    );
}

export default { Transparent, Primary };
