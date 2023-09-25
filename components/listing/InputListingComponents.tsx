import { EnergyClass, PropertyType } from "@/util/api";
import Typography from "../Typography";

interface FlexRowProps {
    children?: React.ReactNode;
    singleCol?: boolean;
    hideBottomBorder?: boolean;
    noPadding?: boolean;
    className?: string;
    type?: PropertyType;
    blacklistTypes?: PropertyType[];
}
export function FlexRow({
    children,
    singleCol,
    hideBottomBorder,
    noPadding,
    className,
    type,
    blacklistTypes,
}: FlexRowProps) {
    if (type && blacklistTypes?.includes(type)) {
        return <div />;
    }

    return (
        <div
            className={`flex flex-col ${singleCol ? "flex-col" : "md:flex-row"} w-full ${
                !hideBottomBorder && "border-b-zinc-200 border-b-2"
            } mb-8 py-6 ${!noPadding && "px-2"} ${className}`}
        >
            {children}
        </div>
    );
}
export function RowItem({ children }: FlexRowProps) {
    return <div className="w-full md:w-1/2 flex flex-col mt-3 md:mt-0">{children}</div>;
}

interface TitleColProps {
    title: string;
    children?: React.ReactNode;
    hasError?: boolean;
    errorMsg?: string;
    warningText?: string;
}
export function TitleCol({ title, children, errorMsg, hasError, warningText }: TitleColProps) {
    return (
        <div className="w-full flex flex-col md:w-1/2">
            <Typography bold className={`${hasError && "text-rose-700"}`}>
                {title}
            </Typography>
            <Typography className="text-zinc-500">{children}</Typography>
            {warningText && (
                <Typography className="text-zinc-500" bold>
                    {warningText}
                </Typography>
            )}
            {hasError && errorMsg && (
                <Typography className="text-rose-700 mt-auto">{errorMsg}</Typography>
            )}
        </div>
    );
}

export const energyLabels = [
    {
        label: "A+",
        value: EnergyClass.Ap,
    },
    {
        label: "A",
        value: EnergyClass.A,
    },
    {
        label: "B",
        value: EnergyClass.B,
    },
    {
        label: "C",
        value: EnergyClass.C,
    },
    {
        label: "D",
        value: EnergyClass.D,
    },
    {
        label: "E",
        value: EnergyClass.E,
    },
    {
        label: "F",
        value: EnergyClass.F,
    },
    {
        label: "G",
        value: EnergyClass.G,
    },
];
