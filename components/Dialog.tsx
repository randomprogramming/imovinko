import React from "react";
import Icon from "./Icon";
import Typography from "./Typography";

interface DialogProps {
    title?: string;
    message?: string;
    type: "success" | "warning" | "error";
    className?: string;
}
export default function Dialog({ title, message, type, className }: DialogProps) {
    return (
        <div
            className={`w-full bg-emerald-200 border-green-600 border-2 rounded-xl p-4 shadow ${className}`}
        >
            <div className="flex flex-row items-center">
                <Icon name="success" height={"40"} width={"40"} />
                <div className="ml-2">
                    {title && <Typography bold>{title}</Typography>}
                    {message && <Typography>{message}</Typography>}
                </div>
            </div>
        </div>
    );
}
