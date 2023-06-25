import Navbar from "@/components/Navbar";
import Typography from "@/components/Typography";
import { Account, Listing, Media, OfferingType, findListing } from "@/util/api";
import { GetServerSideProps } from "next";
import { useTranslations } from "next-intl";
import React, { useState } from "react";
import Image from "next/image";
import Icon from "@/components/Icon";
import Map from "@/components/Map";
import { Marker } from "react-map-gl";
import Carousel from "re-carousel";
import Button from "@/components/Button";

export const getServerSideProps: GetServerSideProps = async ({ params, locale }) => {
    let listing = null;
    if (typeof params?.prettyId === "string") {
        listing = (await findListing(params.prettyId)).data;
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
    const t = useTranslations("ListingPage");

    if (listing.apartment) {
        return (
            <div className="bg-zinc-200 w-fit px-2 py-1 rounded-lg shadow-sm my-4">
                <div className="flex flex-row space-x-3">
                    <div className="flex flex-row space-x-1 group hover:bg-zinc-300 px-1 py-0.5 select-none rounded-md relative items-center justify-center">
                        <Icon name="area" />
                        <Typography>{listing.apartment.surfaceArea} m²</Typography>
                        <div className="opacity-0 group-hover:opacity-100 absolute -bottom-3 -right-2 bg-zinc-100 transition-all px-1 rounded-sm w-max">
                            <Typography className="text-xs">{t("area")}</Typography>
                        </div>
                    </div>
                    {listing.apartment.bedroomCount && (
                        <div className="flex flex-row space-x-1 group hover:bg-zinc-300 px-1 py-0.5 select-none rounded-md relative items-center justify-center">
                            <Icon name="bed" />
                            <Typography>{listing.apartment.bedroomCount}</Typography>
                            <div className="opacity-0 group-hover:opacity-100 absolute -bottom-3 -right-2 bg-zinc-100 transition-all px-1 rounded-sm w-max">
                                <Typography className="text-xs">{t("bedrooms")}</Typography>
                            </div>
                        </div>
                    )}
                    {listing.apartment.bathroomCount && (
                        <div className="flex flex-row space-x-1 group hover:bg-zinc-300 px-1 py-0.5 select-none rounded-md relative items-center justify-center">
                            <Icon name="bath" height={20} width={20} />
                            <Typography>{listing.apartment.bathroomCount}</Typography>
                            <div className="opacity-0 group-hover:opacity-100 absolute -bottom-3 -right-2 bg-zinc-100 transition-all px-1 rounded-sm w-max">
                                <Typography className="text-xs">{t("bathrooms")}</Typography>
                            </div>
                        </div>
                    )}
                    {listing.apartment.parkingSpaceCount && (
                        <div className="flex flex-row space-x-1 group hover:bg-zinc-300 px-1 py-0.5 select-none rounded-md relative items-center justify-center">
                            <Icon name="car" />
                            <Typography>{listing.apartment.parkingSpaceCount}</Typography>
                            <div className="opacity-0 group-hover:opacity-100 absolute -bottom-3 -right-2 bg-zinc-100 transition-all px-1 rounded-sm w-max">
                                <Typography className="text-xs">{t("parking-spaces")}</Typography>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    } else if (listing.house) {
        return (
            <div className="bg-zinc-200 w-fit px-2 py-1 rounded-lg shadow-sm my-4">
                <div className="flex flex-row space-x-3">
                    <div className="flex flex-row space-x-1 group hover:bg-zinc-300 px-1 py-0.5 select-none rounded-md relative items-center justify-center">
                        <Icon name="area" />
                        <Typography>{listing.house.surfaceArea} m²</Typography>
                        <div className="opacity-0 group-hover:opacity-100 absolute -bottom-3 -right-2 bg-zinc-100 transition-all px-1 rounded-sm w-max">
                            <Typography className="text-xs">{t("area")}</Typography>
                        </div>
                    </div>
                    {listing.house.bedroomCount && (
                        <div className="flex flex-row space-x-1 group hover:bg-zinc-300 px-1 py-0.5 select-none rounded-md relative items-center justify-center">
                            <Icon name="bed" />
                            <Typography>{listing.house.bedroomCount}</Typography>
                            <div className="opacity-0 group-hover:opacity-100 absolute -bottom-3 -right-2 bg-zinc-100 transition-all px-1 rounded-sm w-max">
                                <Typography className="text-xs">{t("bedrooms")}</Typography>
                            </div>
                        </div>
                    )}
                    {listing.house.bathroomCount && (
                        <div className="flex flex-row space-x-1 group hover:bg-zinc-300 px-1 py-0.5 select-none rounded-md relative items-center justify-center">
                            <Icon name="bath" height={20} width={20} />
                            <Typography>{listing.house.bathroomCount}</Typography>
                            <div className="opacity-0 group-hover:opacity-100 absolute -bottom-3 -right-2 bg-zinc-100 transition-all px-1 rounded-sm w-max">
                                <Typography className="text-xs">{t("bathrooms")}</Typography>
                            </div>
                        </div>
                    )}
                    {listing.house.parkingSpaceCount && (
                        <div className="flex flex-row space-x-1 group hover:bg-zinc-300 px-1 py-0.5 select-none rounded-md relative items-center justify-center">
                            <Icon name="car" />
                            <Typography>{listing.house.parkingSpaceCount}</Typography>
                            <div className="opacity-0 group-hover:opacity-100 absolute -bottom-3 -right-2 bg-zinc-100 transition-all px-1 rounded-sm w-max">
                                <Typography className="text-xs">{t("parking-spaces")}</Typography>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    } else if (listing.land) {
        return (
            <div className="bg-zinc-200 w-fit px-2 py-1 rounded-lg shadow-sm my-4">
                <div className="flex flex-row space-x-3">
                    <div className="flex flex-row space-x-1 group hover:bg-zinc-300 px-1 py-0.5 select-none rounded-md relative items-center justify-center">
                        <Icon name="area" />
                        <Typography>{listing.land.surfaceArea} m²</Typography>
                        <div className="opacity-0 group-hover:opacity-100 absolute -bottom-3 -right-2 bg-zinc-100 transition-all px-1 rounded-sm w-max">
                            <Typography className="text-xs">{t("area")}</Typography>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    return null;
}

interface ClickableImageProps {
    url: string;
    onClick?(): void;
    showBanner?: boolean;
}
function ClickableImage({ url, onClick, showBanner }: ClickableImageProps) {
    const t = useTranslations("ListingPage");

    return (
        <div
            className="relative w-full rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-sm hover:opacity-90 transition-all"
            style={{
                height: "33vh",
                maxHeight: "550px",
            }}
            onClick={onClick}
        >
            <Image
                src={url}
                alt="property image"
                fill
                style={{
                    objectFit: "cover",
                }}
            />
            {showBanner && (
                <div className="absolute right-0 bottom-10 bg-zinc-50 px-2 py-1 rounded-tl-md rounded-bl-md flex flex-row items-center justify-center space-x-2 shadow-sm border border-zinc-300 border-r-0">
                    <Icon name="show-more" /> <Typography>{t("show-more-images")}</Typography>
                </div>
            )}
        </div>
    );
}

interface MediaComponentProps {
    media: Media[];
    onImageClick?(): void;
}
function MediaComponent({ media, onImageClick }: MediaComponentProps) {
    if (media.length <= 2) {
        return (
            <div className="flex flex-col w-full space-y-4">
                {media.map((m) => {
                    return <ClickableImage url={m.url} />;
                })}
            </div>
        );
    }
    return (
        <div className="flex flex-col w-full space-y-4">
            <ClickableImage url={media[0].url} onClick={onImageClick} />
            <div className="flex flex-row space-x-4">
                <ClickableImage url={media[1].url} onClick={onImageClick} />
                <ClickableImage url={media[2].url} onClick={onImageClick} />
            </div>
            {media.length > 4 && (
                <ClickableImage url={media[3].url} onClick={onImageClick} showBanner />
            )}
        </div>
    );
}

interface ListingPageProps {
    listing: Listing;
}
export default function ListingPage({ listing }: ListingPageProps) {
    const MARKER_SIZE = 48;
    const t = useTranslations("ListingPage");
    const [isMediaPopupOpen, setIsMediaPopupOpen] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    // remember where the user was when they open the media popup and scroll to that place when they close the popup
    const [scrollWhenOpeningImage, setScrollWhenOpeningImage] = useState(0);
    const totalSlides = getPropertyMedia(listing).length;

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

    function getPropertyLocationString(p: Listing) {
        let region: string | null = null;
        let city: string | null = null;
        let street: string | null = null;
        let address: string | null = null;

        if (p.apartment) {
            region = p.apartment.region;
            city = p.apartment.city;
            street = p.apartment.street;
            address = p.apartment.address;
        } else if (p.house) {
            region = p.house.region;
            city = p.house.city;
            street = p.house.street;
            address = p.house.address;
        } else {
            region = p.land!.region;
            city = p.land!.city;
            street = p.land!.street;
        }

        let locationStr = "";
        if (street) {
            locationStr += street;
            if (address) {
                locationStr += ` ${address}`;
            }
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

    React.useEffect(() => {
        if (isMediaPopupOpen) {
            setScrollWhenOpeningImage(document.documentElement.scrollTop);
            window.scroll(0, 0);
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
            window.scroll(0, scrollWhenOpeningImage);
        }
    }, [isMediaPopupOpen]);

    return (
        <>
            <header>
                <Navbar />
            </header>
            <main
                className={`flex-1 space-y-8 ${
                    isMediaPopupOpen ? "overflow-y-hidden" : "overflow-auto"
                }`}
            >
                {true && (
                    <div
                        className={`${
                            isMediaPopupOpen ? "opacity-100" : "opacity-0 invisible"
                        } absolute top-0 bottom-0 left-0 right-0 bg-zinc-900 z-40 flex flex-col`}
                    >
                        <div className="flex flex-col h-full w-full">
                            <div className="h-[10%] flex flex-row">
                                <div
                                    style={{
                                        minWidth: "25%",
                                        width: "25%",
                                        maxWidth: "25%",
                                    }}
                                />
                                <div className="flex-1 flex items-center justify-center">
                                    <Typography className="text-zinc-50">
                                        {currentSlide + 1} / {totalSlides}
                                    </Typography>
                                </div>
                                <div
                                    className="flex items-center justify-center"
                                    style={{
                                        minWidth: "25%",
                                        width: "25%",
                                        maxWidth: "25%",
                                    }}
                                >
                                    <Button.Transparent
                                        className="border-zinc-50 border-2 px-4 hover:bg-zinc-700"
                                        onClick={() => {
                                            setIsMediaPopupOpen(false);
                                        }}
                                    >
                                        <div className="flex flex-row items-center justify-center space-x-2">
                                            <Icon
                                                name="close"
                                                className="fill-zinc-50"
                                                height={20}
                                                width={20}
                                            />
                                            <Typography className="text-zinc-50">
                                                {t("close")}
                                            </Typography>
                                        </div>
                                    </Button.Transparent>
                                </div>
                            </div>
                            <div className="flex-1 h-[80%] flex flex-row">
                                <Carousel
                                    loop
                                    widgets={[
                                        (props) => {
                                            if (props.index !== currentSlide) {
                                                setCurrentSlide(props.index);
                                            }

                                            return null;
                                        },
                                        (props) => {
                                            return (
                                                <div className="text-white absolute w-full bottom-0 top-0 z-[100]">
                                                    <div className="absolute left-6 top-1/2">
                                                        <button
                                                            onClick={props.prevHandler}
                                                            className="rounded-full p-1.5 group"
                                                        >
                                                            <div className="rounded-full bg-white p-1 w-full group-hover:bg-zinc-200 transition-all">
                                                                <Icon
                                                                    name="left"
                                                                    height={32}
                                                                    width={32}
                                                                />
                                                            </div>
                                                        </button>
                                                    </div>
                                                    <div className="absolute right-6 top-1/2">
                                                        <button
                                                            onClick={props.nextHandler}
                                                            className="rounded-full p-1.5 group"
                                                        >
                                                            <div className="rounded-full bg-white p-1 w-full group-hover:bg-zinc-200 transition-all">
                                                                <Icon
                                                                    name="right"
                                                                    height={32}
                                                                    width={32}
                                                                />
                                                            </div>
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        },
                                    ]}
                                    frames={getPropertyMedia(listing).map((m) => {
                                        return (
                                            <div className="flex items-center justify-center w-full h-full">
                                                {/* NextJS's images are literal hell to work with */}
                                                <img
                                                    className="select-none max-h-full w-auto"
                                                    src={m.url}
                                                    alt="property image"
                                                />
                                            </div>
                                        );
                                    })}
                                />
                            </div>
                            <div className="text-white h-[10%]">
                                {/* TODO: Put thumbnails here */}
                            </div>
                        </div>
                    </div>
                )}
                <section className="flex flex-col lg:flex-row container mx-auto mt-8">
                    <div className="flex-1 flex flex-col w-1/2 pr-6">
                        <div>
                            <Typography variant="h1">{listing.title}</Typography>
                            <Typography variant="secondary" uppercase>
                                {getPropertyLocationString(listing)}
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
                        <IconRow listing={listing} />
                        <div className="mt-4">
                            <Typography>{listing.description}</Typography>
                        </div>
                    </div>
                    <div className="flex-1 flex flex-col w-1/2">
                        <MediaComponent
                            media={getPropertyMedia(listing)}
                            onImageClick={() => {
                                setIsMediaPopupOpen(true);
                            }}
                        />
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
