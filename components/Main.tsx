import React from "react";

interface Props {
    children?: React.ReactNode;
    className?: string;
    id?: string;
    container?: boolean;
}
export default function Main({ children, className, id, container }: Props) {
    return (
        <main
            className={`flex-1 flex flex-col ${container && "container mx-auto"} ${className}`}
            id={id}
        >
            {children}
        </main>
    );
}
