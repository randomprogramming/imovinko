import { useTranslations } from "next-intl";
import Icon from "../Icon";
import Typography from "../Typography";

interface IconRowProps {
    listing: {
        apartment: {
            surfaceArea: number | null;
            bedroomCount?: string | number | null;
            bathroomCount?: string | number | null;
            parkingSpaceCount?: string | number | null;
        } | null;
        house: {
            surfaceArea: number | null;
            bedroomCount?: string | number | null;
            bathroomCount?: string | number | null;
            parkingSpaceCount?: string | number | null;
        } | null;
        land: {
            surfaceArea: number | null;
        } | null;
    };
    containerClassName?: string;
}
export default function IconRow({ listing, containerClassName }: IconRowProps) {
    const t = useTranslations("ListingPage");

    if (listing.apartment) {
        return (
            <div
                className={`bg-zinc-200 w-fit px-2 py-1 rounded-lg shadow-sm ${containerClassName}`}
            >
                <div className="flex flex-row space-x-3">
                    <div className="flex flex-row space-x-1 group/IconRow hover:bg-zinc-300 px-1 py-0.5 select-none rounded-md relative items-center justify-center">
                        <Icon name="area" />
                        <Typography>
                            {typeof listing.apartment.surfaceArea === "number" &&
                                Math.round(listing.apartment.surfaceArea)}{" "}
                            m²
                        </Typography>
                        <div className="opacity-0 group-hover/IconRow:opacity-100 absolute -bottom-3 -right-2 bg-zinc-100 transition-all px-1 rounded-sm w-max">
                            <Typography className="text-xs">{t("area")}</Typography>
                        </div>
                    </div>
                    {listing.apartment.bedroomCount && (
                        <div className="flex flex-row space-x-1 group/IconRow hover:bg-zinc-300 px-1 py-0.5 select-none rounded-md relative items-center justify-center">
                            <Icon name="bed" />
                            <Typography>{listing.apartment.bedroomCount}</Typography>
                            <div className="opacity-0 group-hover/IconRow:opacity-100 absolute -bottom-3 -right-2 bg-zinc-100 transition-all px-1 rounded-sm w-max">
                                <Typography className="text-xs">{t("bedrooms")}</Typography>
                            </div>
                        </div>
                    )}
                    {listing.apartment.bathroomCount && (
                        <div className="flex flex-row space-x-1 group/IconRow hover:bg-zinc-300 px-1 py-0.5 select-none rounded-md relative items-center justify-center">
                            <Icon name="bath" height={20} width={20} />
                            <Typography>{listing.apartment.bathroomCount}</Typography>
                            <div className="opacity-0 group-hover/IconRow:opacity-100 absolute -bottom-3 -right-2 bg-zinc-100 transition-all px-1 rounded-sm w-max">
                                <Typography className="text-xs">{t("bathrooms")}</Typography>
                            </div>
                        </div>
                    )}
                    {listing.apartment.parkingSpaceCount && (
                        <div className="flex flex-row space-x-1 group/IconRow hover:bg-zinc-300 px-1 py-0.5 select-none rounded-md relative items-center justify-center">
                            <Icon name="car" />
                            <Typography>{listing.apartment.parkingSpaceCount}</Typography>
                            <div className="opacity-0 group-hover/IconRow:opacity-100 absolute -bottom-3 -right-2 bg-zinc-100 transition-all px-1 rounded-sm w-max">
                                <Typography className="text-xs">{t("parking-spaces")}</Typography>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    } else if (listing.house) {
        return (
            <div
                className={`bg-zinc-200 w-fit px-2 py-1 rounded-lg shadow-sm ${containerClassName}`}
            >
                <div className="flex flex-row space-x-4">
                    <div className="flex flex-row space-x-1 group/IconRow hover:bg-zinc-300 px-1 py-0.5 select-none rounded-md relative items-center justify-center">
                        <Icon name="area" />
                        <Typography>
                            {typeof listing.house.surfaceArea === "number" &&
                                Math.round(listing.house.surfaceArea)}{" "}
                            m²
                        </Typography>
                        <div className="opacity-0 group-hover/IconRow:opacity-100 absolute -bottom-3 -right-2 bg-zinc-100 transition-all px-1 rounded-sm w-max">
                            <Typography className="text-xs">{t("area")}</Typography>
                        </div>
                    </div>
                    {listing.house.bedroomCount && (
                        <div className="flex flex-row space-x-1 group/IconRow hover:bg-zinc-300 px-1 py-0.5 select-none rounded-md relative items-center justify-center">
                            <Icon name="bed" />
                            <Typography>{listing.house.bedroomCount}</Typography>
                            <div className="opacity-0 group-hover/IconRow:opacity-100 absolute -bottom-3 -right-2 bg-zinc-100 transition-all px-1 rounded-sm w-max">
                                <Typography className="text-xs">{t("bedrooms")}</Typography>
                            </div>
                        </div>
                    )}
                    {listing.house.bathroomCount && (
                        <div className="flex flex-row space-x-1 group/IconRow hover:bg-zinc-300 px-1 py-0.5 select-none rounded-md relative items-center justify-center">
                            <Icon name="bath" height={20} width={20} />
                            <Typography>{listing.house.bathroomCount}</Typography>
                            <div className="opacity-0 group-hover/IconRow:opacity-100 absolute -bottom-3 -right-2 bg-zinc-100 transition-all px-1 rounded-sm w-max">
                                <Typography className="text-xs">{t("bathrooms")}</Typography>
                            </div>
                        </div>
                    )}
                    {listing.house.parkingSpaceCount && (
                        <div className="flex flex-row space-x-1 group/IconRow hover:bg-zinc-300 px-1 py-0.5 select-none rounded-md relative items-center justify-center">
                            <Icon name="car" />
                            <Typography>{listing.house.parkingSpaceCount}</Typography>
                            <div className="opacity-0 group-hover/IconRow:opacity-100 absolute -bottom-3 -right-2 bg-zinc-100 transition-all px-1 rounded-sm w-max">
                                <Typography className="text-xs">{t("parking-spaces")}</Typography>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    } else if (listing.land) {
        return (
            <div
                className={`bg-zinc-200 w-fit px-2 py-1 rounded-lg shadow-sm ${containerClassName}`}
            >
                <div className="flex flex-row space-x-4">
                    <div className="flex flex-row space-x-1 group/IconRow hover:bg-zinc-300 px-1 py-0.5 select-none rounded-md relative items-center justify-center">
                        <Icon name="area" />
                        <Typography>
                            {typeof listing.land.surfaceArea === "number" &&
                                Math.round(listing.land.surfaceArea)}{" "}
                            m²
                        </Typography>
                        <div className="opacity-0 group-hover/IconRow/IconRow:opacity-100 absolute -bottom-3 -right-2 bg-zinc-100 transition-all px-1 rounded-sm w-max">
                            <Typography className="text-xs">{t("area")}</Typography>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    return null;
}
