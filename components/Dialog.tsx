import React from "react";
import Icon from "./Icon";
import Typography from "./Typography";

interface DialogProps {
    title?: string;
    message?: string;
    type: "success" | "warning" | "error" | "information";
    className?: string;
    children?: React.ReactNode;
}
export default function Dialog({ title, message, type, className, children }: DialogProps) {
    function getBgColor() {
        if (type === "success") {
            return "bg-emerald-200 border-green-600";
        } else if (type === "warning") {
            return "bg-yellow-100 border-yellow-500";
        } else if (type === "error") {
            return "bg-red-200 border-red-600";
        } else if (type === "information") {
            return "bg-blue-200 border-blue-400";
        }
    }
    return (
        <div
            className={`w-full ${getBgColor()} border-2 rounded-xl p-2 lg:p-3 xl:p-4 shadow ${className}`}
        >
            <div className="flex flex-row items-center">
                <div>
                    <Icon name={type} height={32} width={32} />
                </div>
                <div className="ml-2">
                    {title && <Typography bold>{title}</Typography>}
                    {message && <Typography>{message}</Typography>}
                    {children}
                </div>
            </div>
        </div>
    );
}
