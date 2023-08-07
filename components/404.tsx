import React from "react";
import Typography from "./Typography";

interface NotFoundProps {
    children?: React.ReactNode;
    className?: string;
}
export default function NotFound({ children, className }: NotFoundProps) {
    return (
        <div className={`w-full text-center ${className}`}>
            <Typography className="text-rose-800 text-[112px] md:text-[178px] leading-[120px]">
                4
                <Typography variant="span" className="text-zinc-900 stretch">
                    0
                </Typography>
                4
            </Typography>
            <div className="mt-8">{children}</div>
        </div>
    );
}
