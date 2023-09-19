import React from "react";

interface Props {
    children?: React.ReactNode;
    className?: string;
    id?: string;
    container?: boolean;
    mobilePadding?: boolean;
}
export default function Main({ children, className, id, container, mobilePadding }: Props) {
    return (
        <main
            className={`flex-1 flex flex-col ${container && "container mx-auto"} ${
                mobilePadding && "px-2 md:px-0"
            } ${className}`}
            id={id}
        >
            {children}
        </main>
    );
}
