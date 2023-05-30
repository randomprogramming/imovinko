import React from "react";

interface IButtonProps {
    onClick?(e: React.MouseEvent<HTMLButtonElement>): void;
    children?: React.ReactNode;
}

function Transparent({ onClick, children }: IButtonProps) {
    return (
        <button
            className="p-2 hover:bg-zinc-400 transition-all flex items-center justify-center rounded-lg"
            onClick={onClick}
        >
            {children}
        </button>
    );
}

export default { Transparent };
