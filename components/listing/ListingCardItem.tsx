import { ListingBasic, OfferingType } from "@/util/api";
import { useTranslations } from "next-intl";
import Link from "../Link";
import Image from "next/image";
import NoImage from "../NoImage";
import Typography from "../Typography";
import IconRow from "./IconRow";
import SaveListingIcon from "../SaveListingIcon";
import { isSold } from "@/util/listing";

interface Props {
    listing: ListingBasic;
    hideIconRow?: boolean;
    className?: string;
}
export default function ListingCardItem({ listing, hideIconRow, className }: Props) {
    const t = useTranslations("ListingListItem");

    function getPropertyMedia(p: ListingBasic) {
        if (p.apartment) {
            return p.apartment.media;
        } else if (p.house) {
            return p.house.media;
        } else {
            return p.land!.media;
        }
    }

    function getPropertyLocationString(p: ListingBasic) {
        let region: string | null = null;
        let city: string | null = null;
        let street: string | null = null;

        if (p.apartment) {
            region = p.apartment.region;
            city = p.apartment.city;
            street = p.apartment.street;
        } else if (p.house) {
            region = p.house.region;
            city = p.house.city;
            street = p.house.street;
        } else {
            region = p.land!.region;
            city = p.land!.city;
            street = p.land!.street;
        }

        let locationStr = "";
        if (street) {
            locationStr += street;
        }
        if (city) {
            if (locationStr.length > 0) {
                locationStr += `, ${city}`;
            } else {
                locationStr += city;
            }
        }
        if (region) {
            if (locationStr.length > 0) {
                locationStr += `, ${region}`;
            } else {
                locationStr += region;
            }
        }

        return locationStr;
    }

    function getPriceString(p: ListingBasic) {
        if (p.offeringType === OfferingType.shortTermRent) {
            return ` ${t("per-night")}`;
        } else if (p.offeringType === OfferingType.longTermRent) {
            return ` ${t("per-month")}`;
        } else {
            let pricePerMeterSquared = p.pricePerMeterSquared;
            if (!pricePerMeterSquared) {
                const property = p.apartment || p.house || p.land;
                if (!property) return "";
                pricePerMeterSquared = p.price / property.surfaceArea;
            }

            pricePerMeterSquared = Math.round(pricePerMeterSquared * 100) / 100;
            const localeString = pricePerMeterSquared.toLocaleString();
            const localeStringSplit = localeString.split(".");
            if (localeStringSplit.length > 1) {
                localeStringSplit[1] = localeStringSplit[1].padEnd(2, "0");
            }
            return `${localeStringSplit.join(".")} €/m²`;
        }
    }

    function getPropertyTypeAndOfferingTypeString(p: ListingBasic) {
        let s: string = "";

        if (p.apartment) {
            s += t("apartment");
        } else if (p.house) {
            s += t("house");
        } else {
            s += t("land");
        }

        s += " • ";

        if (
            p.offeringType === OfferingType.shortTermRent ||
            p.offeringType === OfferingType.longTermRent
        ) {
            s += t("rent");
        } else {
            s += t("sale");
        }
        return s;
    }

    const firstImage = getPropertyMedia(listing).at(0);

    return (
        <Link
            key={listing.prettyId}
            to={`/listing/${listing.prettyId}`}
            className={`group relative flex bg-white visited:bg-[#fafafa] border border-zinc-300 w-full rounded-lg shadow-sm hover:shadow transition-all overflow-hidden ${className}`}
            disableAnimatedHover
        >
            <div className="absolute top-1 left-1 z-30">
                <SaveListingIcon listingId={listing.id} saved={listing.saved} className="!p-1.5" />
            </div>
            <div className="w-full">
                <div
                    className="w-full relative flex flex-col"
                    style={{
                        minHeight: "230px",
                    }}
                >
                    {firstImage ? (
                        <>
                            <Image
                                src={firstImage?.url}
                                alt="media image"
                                fill
                                style={{
                                    objectFit: "cover",
                                    height: "100%",
                                    width: "100%",
                                }}
                                quality={50}
                            />
                        </>
                    ) : (
                        <div className="absolute left-0 right-0 top-0 bottom-0">
                            <NoImage />
                        </div>
                    )}
                    <div
                        style={{ fontSize: "11px" }}
                        className="absolute bg-emerald-700 text-zinc-50 left-2 bottom-0 translate-y-1/2 px-2 py-0.5 rounded-sm shadow-sm"
                    >
                        <Typography uppercase className="tracking-wider">
                            {getPropertyTypeAndOfferingTypeString(listing)}
                        </Typography>
                    </div>
                </div>
                <div className="flex flex-col w-full h-full">
                    <div className="p-2">
                        {/* <div
                            style={{
                                fontSize: "11px",
                            }}
                        >
                            <Typography className="tracking-widest text-zinc-500" uppercase>
                                {getPropertyTypeAndOfferingTypeString(listing)}
                            </Typography>
                        </div> */}
                        <div
                            style={{
                                minHeight: "3.5em",
                                height: "3.5em",
                                maxHeight: "3.5em",
                            }}
                        >
                            <Typography
                                variant="h2"
                                className="line-clamp-2 text-base text-blue-700 group-visited:text-indigo-900"
                            >
                                {listing.title}
                            </Typography>
                        </div>
                        <div
                            style={{
                                minHeight: "2em",
                                height: "2em",
                                maxHeight: "2em",
                            }}
                        >
                            <Typography variant="secondary" uppercase className="line-clamp-2">
                                {getPropertyLocationString(listing)}
                            </Typography>
                        </div>
                        {!hideIconRow && (
                            <div className="mt-2 w-full flex items-center justify-center">
                                <IconRow
                                    listing={listing}
                                    containerClassName="!bg-transparent !shadow-none"
                                />
                            </div>
                        )}
                    </div>
                    <div className="bg-zinc-300 h-px w-full mt-2" />
                    <div className="flex flex-row items-center p-2">
                        <div>
                            <Typography className="text-sm">{t("posted")}: </Typography>
                            <Typography className="text-sm font-normal">
                                {new Date(listing.createdAt)
                                    .toLocaleDateString(undefined, {
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric",
                                    })
                                    .replaceAll("/", ".")}
                            </Typography>
                        </div>
                        <div className="flex-1" />
                        <div className="flex flex-col items-end">
                            <Typography bold className="text-xl">
                                {listing.price.toLocaleString()} €{" "}
                            </Typography>
                            <Typography variant="span" className="text-sm font-normal">
                                {getPriceString(listing)}
                            </Typography>
                        </div>
                    </div>
                </div>
            </div>
            {isSold(listing) && (
                <div className="absolute bottom-5 right-0 -rotate-[40deg] w-40 text-center text-white translate-x-10 bg-rose-600">
                    <Typography uppercase bold className="tracking-wider">
                        {t("sold")}
                    </Typography>
                </div>
            )}
        </Link>
    );
}
