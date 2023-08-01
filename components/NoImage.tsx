import React from "react";
import Icon from "./Icon";

interface NoImageProps {
    className?: string;
}
export default function NoImage({ className }: NoImageProps) {
    return (
        <div
            className={`flex-1 w-full h-full p-2 flex items-center justify-center bg-zinc-200 ${className}`}
        >
            <Icon name="missing-image" height={48} width={48} />
        </div>
    );
}
