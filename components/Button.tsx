import React from "react";
import Typography from "./Typography";
import Icon, { IconName } from "./Icon";

interface IButtonProps {
    onClick?(e: React.MouseEvent<HTMLButtonElement>): void;
    children?: React.ReactNode;
    label?: string;
    className?: string;
    disabled?: boolean;
}

function Transparent({ onClick, children, className }: IButtonProps) {
    return (
        <button
            className={`outline-none p-2 hover:bg-zinc-300 transition-all flex items-center justify-center rounded-lg ${className}`}
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

function Primary({
    onClick,
    children,
    label,
    hollow,
    icon,
    loading,
    className,
    disabled,
}: PrimaryButtonProps) {
    return (
        <button
            className={`outline-none p-2 hover:bg-zinc-800 disabled:bg-zinc-600 ${
                hollow
                    ? "text-zinc-900 hover:text-white bg-transparent border-2 border-zinc-900"
                    : "text-white bg-zinc-900 shadow-md"
            } w-full transition-all flex items-center justify-center rounded-md hover:rounded-lg disabled:rounded-md h-14 ${className}`}
            onClick={onClick}
            disabled={loading || disabled}
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

function Accept({ className, onClick, disabled, loading }: IButtonProps & { loading?: boolean }) {
    return (
        <Primary
            className={`!bg-emerald-400 hover:!bg-emerald-300 disabled:!bg-zinc-500 ${className}`}
            onClick={onClick}
            disabled={disabled}
            loading={loading}
        >
            {loading ? <Icon name="loading" /> : <Icon name="checkmark" />}
        </Primary>
    );
}

function Decline({ className, onClick, disabled, loading }: IButtonProps & { loading?: boolean }) {
    return (
        <Primary
            className={`!bg-rose-500 hover:!bg-rose-400 disabled:!bg-zinc-500 ${className}`}
            onClick={onClick}
            disabled={disabled}
            loading={loading}
        >
            {loading ? <Icon name="loading" /> : <Icon name="close" />}
        </Primary>
    );
}

export default { Transparent, Primary, Accept, Decline };
