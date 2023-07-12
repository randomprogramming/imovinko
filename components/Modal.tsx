import React, { useEffect } from "react";

interface ModalProps {
    show?: boolean | null;
    children?: React.ReactNode;
    onClose?(): void;
}

export default function Modal({ show, children, onClose }: ModalProps) {
    useEffect(() => {
        if (show) {
            // Disable scrolling when modal is shown
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
    }, [show]);

    return (
        <div
            className={`absolute top-0 bottom-0 left-0 right-0 z-50 ${
                show ? "visible" : "invisible"
            }`}
        >
            <div
                className={`${
                    show ? "bg-zinc-800" : "bg-transparent"
                } opacity-50 absolute top-0 left-0 bottom-0 right-0 transition-all duration-300 z-50`}
                onClick={onClose}
            />
            <div className="bg-zinc-100 z-50 absolute left-1 right-1 top-1 bottom-1 overflow-auto rounded-xl flex md:-left-10 md:right-10 md:top-10 md:bottom-10 lg:left-32 lg:right-32 lg:top-32 lg:bottom-32">
                {show && children}
            </div>
        </div>
    );
}
