import { ListingBasic, OfferingType } from "@/util/api";
import { useTranslations } from "next-intl";
import React from "react";
import Image from "next/image";
import Typography from "../Typography";
import IconRow from "./IconRow";

interface Props {
    listing: ListingBasic;
}
export default function ListingListItem({ listing }: Props) {
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
        <div className="flex flex-row bg-zinc-50 rounded-md shadow hover:shadow-sm transition-all w-full overflow-hidden">
            <div className="w-96 h-full">
                {firstImage ? (
                    <div className="select-none relative w-full h-full">
                        <Image
                            src={firstImage?.url}
                            alt="media image"
                            fill
                            style={{
                                objectFit: "cover",
                                height: "100%",
                                width: "100%",
                            }}
                            // Since this is just a thumbnail, we can lower the quality
                            quality={50}
                        />
                    </div>
                ) : (
                    // TODO: Find something better than this
                    <div>No image</div>
                )}
            </div>
            <div className="p-4 flex flex-col w-full h-full">
                <div
                    style={{
                        fontSize: "11px",
                    }}
                >
                    <Typography className="tracking-widest text-zinc-500" uppercase>
                        {getPropertyTypeAndOfferingTypeString(listing)}
                    </Typography>
                </div>
                <div
                    style={{
                        minHeight: "4em",
                        height: "4em",
                        maxHeight: "4em",
                    }}
                >
                    <Typography variant="h2" className="line-clamp-2">
                        {listing.title}
                    </Typography>
                </div>
                <div>
                    <Typography variant="secondary" uppercase>
                        {getPropertyLocationString(listing)}
                    </Typography>
                </div>
                <div className="mt-2">
                    <IconRow listing={listing} />
                </div>
                {/* Push the price element to the end */}
                <div className="flex-1" />
                <div className="flex flex-row w-full items-center">
                    <div>
                        <Typography className="text-sm">
                            {t("posted")}:{" "}
                            <Typography variant="span" className="text-sm font-normal">
                                {new Date(listing.createdAt)
                                    .toLocaleDateString(undefined, {
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric",
                                    })
                                    .replaceAll("/", ".")}
                            </Typography>
                        </Typography>
                    </div>
                    <div className="flex-1" />
                    <div>
                        <Typography bold className="text-xl">
                            {listing.price.toLocaleString()} €{" "}
                            <Typography variant="span" className="text-sm font-normal">
                                {getPriceString(listing)}
                            </Typography>
                        </Typography>
                    </div>
                </div>
            </div>
        </div>
    );
}
