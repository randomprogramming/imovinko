import Navbar from "@/components/Navbar";
import Typography from "@/components/Typography";
import { ListingBasic, OfferingType, PropertyType, findListingsByQuery } from "@/util/api";
import { GetServerSideProps } from "next";
import React, { useState } from "react";
import Image from "next/image";
import IconRow from "@/components/listing/IconRow";
import Link from "@/components/Link";
import { useTranslations } from "next-intl";

export const getServerSideProps: GetServerSideProps = async ({ params, locale }) => {
    const { data } = await findListingsByQuery(
        [PropertyType.apartment, PropertyType.house, PropertyType.land],
        [OfferingType.longTermRent, OfferingType.sale, OfferingType.shortTermRent]
    );
    console.log("listings");
    console.log(data);

    return {
        props: {
            messages: (await import(`../../locales/${locale || "hr"}.json`)).default,
            listings: data,
        },
    };
};

interface UIBlockProps {
    listing: ListingBasic;
}
function ListingCard({ listing }: UIBlockProps) {
    const t = useTranslations("ListingsPage");

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

    const firstImage = getPropertyMedia(listing).at(0);

    return (
        <div className="bg-zinc-50 border border-zinc-300 w-full rounded-lg shadow-sm overflow-hidden">
            <div
                className="w-full relative"
                style={{
                    minHeight: "200px",
                }}
            >
                {firstImage ? (
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
                ) : (
                    <div>
                        {/* TODO: Find something better than this */}
                        No Image
                    </div>
                )}
            </div>
            <div className="flex flex-col w-full h-full">
                <div className="p-2">
                    <div
                        style={{
                            minHeight: "3.5em",
                            height: "3.5em",
                            maxHeight: "3.5em",
                        }}
                    >
                        <Typography variant="h2" className="line-clamp-2 text-base">
                            {listing.title}
                        </Typography>
                    </div>
                    <div>
                        <Typography variant="secondary" uppercase>
                            {getPropertyLocationString(listing)}
                        </Typography>
                    </div>
                    <div className="mt-2 w-full flex items-center justify-center">
                        <IconRow
                            listing={listing}
                            containerClassName="!bg-transparent !shadow-none"
                        />
                    </div>
                </div>
                <div className="bg-zinc-300 h-px w-full mt-2" />
                <div className="text-right p-2">
                    <Typography bold className="text-xl">
                        {listing.price.toLocaleString()} €{" "}
                        <span className="text-sm font-normal">{getPriceString(listing)}</span>
                    </Typography>
                </div>
            </div>
        </div>
    );
}

function ListingListItem({ listing }: UIBlockProps) {
    const t = useTranslations("ListingsPage");

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

    const firstImage = getPropertyMedia(listing).at(0);

    return (
        <div className="flex flex-row bg-zinc-50 rounded-md shadow hover:shadow-sm transition-all w-full overflow-hidden">
            <div className="w-96 h-52">
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
                <div className="self-end">
                    <Typography bold className="text-xl">
                        {listing.price.toLocaleString()} €{" "}
                        <span className="text-sm font-normal">{getPriceString(listing)}</span>
                    </Typography>
                </div>
            </div>
        </div>
    );
}

interface ListingsPageProps {
    listings: ListingBasic[];
}
export default function ListingsPage({ listings }: ListingsPageProps) {
    const [useCards, setUseCards] = useState(true); // Use Cards or List UI for showing listings

    return (
        <>
            <header className="z-30">
                <Navbar />
            </header>
            <main className="flex-1 flex flex-col md:flex-row">
                <div className="md:w-1/4">Filter</div>
                <div className="flex-1 container mx-auto max-w-4xl">
                    <div className="flex flex-row justify-between items-center mt-4">
                        <Typography>492 oglasa</Typography>

                        <div className="flex flex-row">
                            <div>Prikaz KArtica/Prikaz Liste</div>
                            <div className="bg-white p-2 rounded-md shadow-sm">
                                Sortiraj: Najniza cijena
                            </div>
                        </div>
                    </div>
                    <div
                        className={`${
                            useCards
                                ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-x-4 gap-y-6"
                                : "space-y-6 mt-2"
                        }`}
                    >
                        {listings.map((listing) => {
                            if (useCards) {
                                return (
                                    <Link
                                        key={listing.prettyId}
                                        to={`/listing/${listing.prettyId}`}
                                        className="flex"
                                        disableAnimatedHover
                                    >
                                        <ListingCard listing={listing} />
                                    </Link>
                                );
                            } else {
                                return (
                                    <Link
                                        key={listing.prettyId}
                                        to={`/listing/${listing.prettyId}`}
                                        className="flex"
                                        disableAnimatedHover
                                    >
                                        <ListingListItem listing={listing} />
                                    </Link>
                                );
                            }
                        })}
                    </div>
                </div>
            </main>
        </>
    );
}
