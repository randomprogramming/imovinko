import Navbar from "@/components/Navbar";
import Typography from "@/components/Typography";
import { Account, Listing, Media, OfferingType, findListing } from "@/util/api";
import { GetServerSideProps } from "next";
import { useTranslations } from "next-intl";
import React from "react";
import Image from "next/image";
import Icon from "@/components/Icon";
import Map from "@/components/Map";
import { Marker } from "react-map-gl";

export const getServerSideProps: GetServerSideProps = async ({ params, locale }) => {
    let listing = null;
    if (typeof params?.id === "string") {
        listing = (await findListing(params.id)).data;
    }
    return {
        props: {
            messages: (await import(`../../locales/${locale || "hr"}.json`)).default,
            listing,
        },
    };
};

interface IconRowProps {
    listing: Listing;
}
function IconRow({ listing }: IconRowProps) {
    if (listing.apartment) {
        return (
            <div className="flex flex-row">
                <div className="flex flex-row">
                    <Icon name="area" />
                    <Typography>{listing.apartment.surfaceArea} m²</Typography>
                </div>
            </div>
        );
    } else if (listing.house) {
        return (
            <div className="flex flex-row">
                <div className="flex flex-row">
                    <Icon name="area" />
                    <Typography>{listing.house.surfaceArea} m²</Typography>
                </div>
            </div>
        );
    } else if (listing.land) {
        return (
            <div className="flex flex-row">
                <div className="flex flex-row">
                    <Icon name="area" />
                    <Typography>{listing.land.surfaceArea} m²</Typography>
                </div>
            </div>
        );
    }
    return null;
}

interface MediaComponentProps {
    media: Media[];
}
function MediaComponent({ media }: MediaComponentProps) {
    if (media.length <= 2) {
        return (
            <div className="flex flex-col w-full">
                {media.map((m) => {
                    return (
                        <div
                            className="relative w-full rounded-lg shadow-md overflow-hidden"
                            style={{
                                height: "40vh",
                                maxHeight: "750px",
                            }}
                        >
                            <Image
                                src={m.url}
                                alt="property image"
                                fill
                                style={{
                                    objectFit: "cover",
                                }}
                            />
                        </div>
                    );
                })}
            </div>
        );
    }
    if (media.length === 3) {
        return (
            <div className="flex flex-col w-full space-y-4">
                <div
                    className="relative w-full rounded-lg shadow-md overflow-hidden"
                    style={{
                        height: "40vh",
                        maxHeight: "750px",
                    }}
                >
                    <Image
                        src={media[0].url}
                        alt="property image"
                        fill
                        style={{
                            objectFit: "cover",
                        }}
                    />
                </div>
                <div className="flex flex-row w-full space-x-4">
                    <div
                        className="relative w-full rounded-md shadow-md overflow-hidden"
                        style={{
                            height: "40vh",
                            maxHeight: "750px",
                        }}
                    >
                        <Image
                            src={media[1].url}
                            alt="property image"
                            fill
                            style={{
                                objectFit: "cover",
                            }}
                        />
                    </div>
                    <div
                        className="relative w-full rounded-md shadow-md overflow-hidden"
                        style={{
                            height: "40vh",
                            maxHeight: "750px",
                        }}
                    >
                        <Image
                            src={media[2].url}
                            alt="property image"
                            fill
                            style={{
                                objectFit: "cover",
                            }}
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full space-y-4">
            <div
                className="relative w-full rounded-lg shadow-md overflow-hidden"
                style={{
                    height: "40vh",
                    maxHeight: "750px",
                }}
            >
                <Image
                    src={media[0].url}
                    alt="property image"
                    fill
                    style={{
                        objectFit: "cover",
                    }}
                />
            </div>
            <div className="flex flex-row w-full space-x-4">
                <div
                    className="relative w-full rounded-md shadow-md overflow-hidden"
                    style={{
                        height: "40vh",
                        maxHeight: "750px",
                    }}
                >
                    <Image
                        src={media[1].url}
                        alt="property image"
                        fill
                        style={{
                            objectFit: "cover",
                        }}
                    />
                </div>
                <div
                    className="relative w-full rounded-md shadow-md overflow-hidden"
                    style={{
                        height: "40vh",
                        maxHeight: "750px",
                    }}
                >
                    <Image
                        src={media[2].url}
                        alt="property image"
                        fill
                        style={{
                            objectFit: "cover",
                        }}
                    />
                </div>
            </div>
            <div
                className="relative w-full rounded-lg shadow-md overflow-hidden"
                style={{
                    height: "40vh",
                    maxHeight: "750px",
                }}
            >
                <Image
                    src={media[3].url}
                    alt="property image"
                    fill
                    style={{
                        objectFit: "cover",
                    }}
                />
            </div>
        </div>
    );
}

interface ListingPageProps {
    listing: Listing;
}
export default function ListingPage({ listing }: ListingPageProps) {
    const MARKER_SIZE = 48;
    const t = useTranslations("ListingPage");

    function getPriceString(p: Listing) {
        if (p.offeringType === OfferingType.shortTermRent) {
            return ` ${t("per-night")}`;
        } else if (p.offeringType === OfferingType.longTermRent) {
            return ` ${t("per-month")}`;
        }
    }

    function getPropertyMedia(p: Listing) {
        if (p.apartment) {
            return p.apartment.media;
        } else if (p.house) {
            return p.house.media;
        } else {
            return p.land!.media;
        }
    }

    function getPropertyLat(p: Listing) {
        if (p.apartment) {
            return p.apartment.latitude;
        } else if (p.house) {
            return p.house.latitude;
        } else {
            return p.land!.latitude;
        }
    }

    function getPropertyLng(p: Listing) {
        if (p.apartment) {
            return p.apartment.longitude;
        } else if (p.house) {
            return p.house.longitude;
        } else {
            return p.land!.longitude;
        }
    }

    function getAccountHandle(p: Listing) {
        let account: Omit<Account, "email"> | null = null;
        if (p.apartment) {
            account = p.apartment.owner;
        }
        if (p.house) {
            account = p.house.owner;
        }
        if (p.land) {
            account = p.land.owner;
        }

        if (!account) {
            return "";
        }

        if (account.username) {
            return account.username;
        }

        if (account.firstName && account.lastName) {
            return `${account.firstName} ${account.lastName}`;
        }

        if (account.firstName) {
            return account.firstName;
        }

        if (account.lastName) {
            return account.lastName;
        }

        return "";
    }

    return (
        <>
            <header>
                <Navbar />
            </header>
            <main className="flex-1 space-y-8">
                <section className="flex flex-col lg:flex-row container mx-auto mt-8">
                    <div className="flex-1 flex flex-col w-1/2">
                        <div>
                            <Typography variant="h1">{listing.title}</Typography>
                            <Typography variant="secondary" uppercase>
                                Zagreb, Grad Zagreb
                            </Typography>
                        </div>
                        <div className="mt-1">
                            <Typography variant="h2" className="mt-2">
                                {listing.price.toLocaleString()} €{" "}
                                <span className="text-sm font-normal">
                                    {getPriceString(listing)}
                                </span>
                            </Typography>
                        </div>
                        <div className="bg-zinc-200 w-fit px-4 py-2 rounded-lg shadow-sm my-4">
                            <IconRow listing={listing} />
                        </div>
                        <div className="mt-4">
                            <Typography>Description goes here</Typography>
                        </div>
                    </div>
                    <div className="flex-1 flex flex-col w-1/2">
                        <MediaComponent media={getPropertyMedia(listing)} />
                    </div>
                </section>
                <section className="container mx-auto">
                    <Typography variant="h2" className="mb-4">
                        {t("listing-by")}
                    </Typography>
                    <div className="flex justify-center items-center">
                        <div className="flex flex-col items-center">
                            {/* TODO: Show users avatar here */}
                            {/* TODO: Add link to users other listings here */}
                            {/* TODO: Add users contact info here */}
                            <div>
                                <Icon name="account" height={64} width={64} />
                            </div>
                            <Typography className="text-lg">{getAccountHandle(listing)}</Typography>
                        </div>
                    </div>
                </section>
                <section className="container mx-auto">
                    <Typography variant="h2" className="mb-4">
                        {t("location")}
                    </Typography>
                    <Map
                        className="w-full shadow-sm mt-2 sm:rounded-lg sm:shadow-md"
                        style={{
                            height: "50vh",
                        }}
                        centerLat={getPropertyLat(listing)}
                        centerLon={getPropertyLng(listing)}
                        zoom={16}
                    >
                        <Marker
                            latitude={getPropertyLat(listing)}
                            longitude={getPropertyLng(listing)}
                        >
                            <div
                                className="absolute top-1/2 left-1/2 z-30 select-none pointer-events-none"
                                style={{
                                    marginTop: `-${MARKER_SIZE}px`, // The center of the map is actually at the bottom of the pointer
                                    marginLeft: `-${MARKER_SIZE / 2}px`,
                                }}
                            >
                                <Icon
                                    name="marker"
                                    width={`${MARKER_SIZE}px`}
                                    height={`${MARKER_SIZE}px`}
                                />
                            </div>
                        </Marker>
                    </Map>
                </section>
            </main>
        </>
    );
}
