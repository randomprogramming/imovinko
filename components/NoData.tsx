import React from "react";
import Icon from "./Icon";
import Typography from "./Typography";

interface NoDataProps {
    title?: string;
    children?: React.ReactNode;
}
export default function NoData({ title, children }: NoDataProps) {
    return (
        <div className="flex flex-col w-full items-center">
            <div>
                <Icon name="file-missing" height={48} width={48} />
            </div>
            <div className="mt-2">{title ? <Typography>{title}</Typography> : children}</div>
        </div>
    );
}
