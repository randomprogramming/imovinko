import React, { useEffect } from "react";

interface ModalProps {
    show?: boolean | null;
    children?: React.ReactNode;
    onClose?(): void;
    small?: boolean;
}

export default function Modal({ show, children, onClose, small }: ModalProps) {
    function preventDefault(e: Event) {
        e.preventDefault();
    }

    useEffect(() => {
        if (show) {
            // Disable scrolling when modal is shown
            document.body.style.overflow = "hidden";
            document.body.addEventListener("touchmove", preventDefault, { passive: false });
        }

        return () => {
            document.body.style.overflow = "unset";
            document.body.removeEventListener("touchmove", preventDefault);
        };
    }, [show]);

    return (
        <div
            className={`fixed top-0 bottom-0 left-0 right-0 z-50 ${
                show ? "visible" : "invisible"
            } flex items-center justify-center`}
        >
            <div
                className={`${
                    show ? "bg-zinc-800" : "bg-transparent"
                } opacity-50 fixed top-0 left-0 bottom-0 right-0 transition-all duration-300 z-50`}
                onClick={onClose}
            />
            <div
                className={`bg-zinc-100 z-50 fixed overflow-y-scroll flex ${
                    small
                        ? "rounded w-fit h-fit max-h-[80vh]"
                        : "rounded-xl left-2 right-2 top-2 bottom-2 md:left-10 md:right-10 md:top-10 md:bottom-10 lg:left-32 lg:right-32 lg:top-32 lg:bottom-32"
                } `}
            >
                {show && <div className="h-full w-full max-h-full flex flex-col">{children}</div>}
            </div>
        </div>
    );
}
