import Navbar from "@/components/Navbar";
import Typography from "@/components/Typography";
import {
    FullAccountSingleCompany,
    Listing,
    Media,
    OfferingType,
    TravelingMethods,
    findListing,
    suggestLocations,
} from "@/util/api";
import { GetServerSideProps } from "next";
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Icon from "@/components/Icon";
import Map from "@/components/Map";
import { Marker } from "react-map-gl";
import Carousel from "re-carousel";
import Button from "@/components/Button";
import IconRow from "@/components/listing/IconRow";
import Link from "@/components/Link";
import dynamic from "next/dynamic";
import NoImage from "@/components/NoImage";
import { DebounceInput } from "react-debounce-input";
import Dropdown from "@/components/Dropdown";
import { space_grotesk } from "@/util/fonts";
import { useRouter } from "next/router";
import Footer from "@/components/Footer";
import Head from "next/head";
import NotFound from "@/components/404";

const MortgageCalculator = dynamic(() => import("@/components/MortgageCalculator"), { ssr: false });

export const getServerSideProps: GetServerSideProps = async ({ params, locale }) => {
    let listing = null;
    if (typeof params?.prettyId === "string") {
        try {
            listing = (await findListing(params.prettyId)).data;
        } catch (e) {
            console.error(e);
        }
    }

    return {
        props: {
            messages: (await import(`../../locales/${locale || "hr"}.json`)).default,
            listing,
        },
    };
};

interface ContactCardProps {
    firstName?: string | null;
    lastName?: string | null;
    username?: string | null;
    avatarUrl?: string | null;
    contacts: {
        type: "email" | "phone";
        contact: string | null;
    }[];
}
function ContactCard({ firstName, lastName, username, avatarUrl, contacts }: ContactCardProps) {
    function NameDiv() {
        return (
            <Typography bold variant="span">{`${firstName ? firstName : ""}${firstName ? " " : ""}${
                lastName ? lastName : ""
            }`}</Typography>
        );
    }
    return (
        <div className="flex flex-row">
            <div>
                {username ? (
                    <Link to={`/account/${username}`} disableAnimatedHover>
                        {avatarUrl ? (
                            <div className="relative w-16 h-16 rounded-full overflow-hidden">
                                <Image src={avatarUrl} alt="avatar" fill className="object-cover" />
                            </div>
                        ) : (
                            <Icon name="account" height={64} width={64} />
                        )}
                    </Link>
                ) : (
                    <div>
                        {avatarUrl ? (
                            <div className="relative w-16 h-16 rounded-full overflow-hidden">
                                <Image src={avatarUrl} alt="avatar" fill className="object-cover" />
                            </div>
                        ) : (
                            <Icon name="account" height={64} width={64} />
                        )}
                    </div>
                )}
            </div>
            <div className="flex-1 w-full ml-3">
                <div className="w-full">
                    {username ? (
                        <div>
                            <Link
                                className="text-blue-700"
                                underlineClassName="!bg-blue-700"
                                to={`/account/${username}`}
                            >
                                <NameDiv />
                            </Link>
                        </div>
                    ) : (
                        <NameDiv />
                    )}
                </div>

                {contacts
                    .filter((c) => !!c.contact)
                    .map((c, i) => {
                        return (
                            <div
                                key={JSON.stringify(contacts) + "-" + i}
                                className="flex-flex-row mt-2 w-full"
                            >
                                {c.type === "email" && (
                                    <a
                                        href={`mailto:${c.contact}`}
                                        className="border-2 border-zinc-700 hover:bg-zinc-100 rounded-lg hover:rounded-xl  hover:shadow  transition-all w-full flex items-center justify-center py-2"
                                    >
                                        <Typography>{c.contact}</Typography>
                                    </a>
                                )}
                                {/* TODO: Maybe format phone number so that all phone numbers show on the site are of the same format? */}
                                {c.type === "phone" && (
                                    <a
                                        className="border-2 border-zinc-700 hover:bg-zinc-100 rounded-lg hover:rounded-xl  hover:shadow  transition-all w-full flex items-center justify-center py-2"
                                        href={`tel:${c.contact}`}
                                    >
                                        <Typography>{c.contact}</Typography>
                                    </a>
                                )}
                            </div>
                        );
                    })}
            </div>
        </div>
    );
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
    if (media.length === 0) {
        return (
            <div className="h-64 w-full shadow overflow-hidden rounded-lg">
                <NoImage />
            </div>
        );
    }
    if (media.length <= 2) {
        return (
            <div className="flex flex-col w-full space-y-4">
                {media.map((m) => {
                    return <ClickableImage url={m.url} key={m.url} onClick={onImageClick} />;
                })}
            </div>
        );
    }
    return (
        <div className="flex flex-col w-full space-y-4 px-1 lg:px-0">
            <ClickableImage url={media[0].url} onClick={onImageClick} />
            <div className="flex flex-col lg:flex-row lg:space-x-4 space-y-4 lg:space-y-0">
                <ClickableImage url={media[1].url} onClick={onImageClick} />
                <ClickableImage url={media[2].url} onClick={onImageClick} />
            </div>
            {media.length >= 4 && (
                <ClickableImage
                    url={media[3].url}
                    onClick={onImageClick}
                    showBanner={media.length > 4}
                />
            )}
        </div>
    );
}

interface ListingPageProps {
    listing: Listing | null;
}
export default function ListingPage({ listing }: ListingPageProps) {
    const MARKER_SIZE = 48;
    const t = useTranslations("ListingPage");

    const router = useRouter();

    const [isMediaPopupOpen, setIsMediaPopupOpen] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    // remember where the user was when they open the media popup and scroll to that place when they close the popup
    const [scrollWhenOpeningImage, setScrollWhenOpeningImage] = useState(0);

    const [travelingMethod, setTravelingMethod] = useState<TravelingMethods>();
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [directions, setDirections] = useState<{
        placeMapboxId: string;
        placeName: string;
    } | null>(null);
    const [suggestionDropdownShouldBeOpen, setSuggestionDropdownShouldBeOpen] = useState(false);

    const totalSlides = getPropertyMedia(listing).length;

    function getPriceString(p: Listing) {
        if (p.offeringType === OfferingType.shortTermRent) {
            return ` ${t("per-night")}`;
        } else if (p.offeringType === OfferingType.longTermRent) {
            return ` ${t("per-month")}`;
        }
    }

    function getPropertyMedia(p: Listing | null) {
        if (!p) {
            return [];
        }
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

    function getAccountHref(p: Listing) {
        const account = getListingAccount(p);

        if (!account) {
            return "";
        }

        if (account.company) {
            return `/company/${account.company.prettyId}`;
        }

        if (account.username) {
            return `/account/${account.username}`;
        }
    }

    function getAccountHandle(p: Listing) {
        const account = getListingAccount(p);

        if (!account) {
            return "";
        }

        if (account.company) {
            if (account.company.storeName) {
                return account.company.storeName;
            }
            return account.company.name;
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

    function getListingAccount(p: Listing) {
        let account: Omit<FullAccountSingleCompany, "email"> | null = null;
        if (p.apartment) {
            account = p.apartment.owner;
        }
        if (p.house) {
            account = p.house.owner;
        }
        if (p.land) {
            account = p.land.owner;
        }
        return account;
    }

    function getListingAvatarUrl(p: Listing) {
        let account = getListingAccount(p);

        if (!account) {
            return null;
        }

        return account.avatarUrl;
    }

    function getAccountJoinDate(p: Listing) {
        let account = getListingAccount(p);

        if (!account) {
            return "";
        }

        if (account.company) {
            return new Date(account.company.createdAt)
                .toLocaleDateString(undefined, {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                })
                .replaceAll("/", ".");
        }

        return new Date(account.createdAt)
            .toLocaleDateString(undefined, {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            })
            .replaceAll("/", ".");
    }

    function getSuggestionFullLocation(suggestion: any) {
        const context = suggestion.context;
        const full_address = suggestion.full_address;
        const place = context.place?.name;
        const street = context.street?.name;
        const country = context.country?.name;

        if (typeof full_address === "string" && full_address.length > 0) {
            return full_address;
        }

        if (!place && !street && !country) {
            return "";
        }
        let fullLocation = "";
        if (place) {
            fullLocation += place;
        }
        if (street) {
            if (fullLocation.length > 0) {
                fullLocation += `, ${street}`;
            } else {
                fullLocation += street;
            }
        }
        if (country) {
            if (fullLocation.length > 0) {
                fullLocation += `, ${country}`;
            } else {
                fullLocation += country;
            }
        }
        return fullLocation;
    }

    function handleSuggestionClick(suggestion: any) {
        const id = suggestion.mapbox_id;
        const name = suggestion.name;

        if (typeof id !== "string" || typeof name !== "string") {
            return;
        }
        setSuggestionDropdownShouldBeOpen(false);
        setDirections({
            placeMapboxId: id,
            placeName: name,
        });
        const locationSection = document.querySelector("#location");
        if (locationSection) {
            locationSection.scrollIntoView({
                behavior: "smooth",
            });
        }
    }

    async function handleSuggestionInputChange(newVal: string) {
        if (!listing) {
            return;
        }
        try {
            const resp = await suggestLocations(newVal, router.locale, {
                lat: getPropertyLat(listing),
                lon: getPropertyLng(listing),
            });
            const suggestions = resp.data.suggestions;
            const hrSuggestions = suggestions.filter((s: any) => {
                if (s.context && s.context.country && s.context.country.country_code) {
                    return s.context.country.country_code.toLowerCase() === "hr";
                }
                return false;
            });
            setSuggestions(hrSuggestions);
        } catch (e) {
            console.error(e);
        }
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
            <Head>
                <title>{listing ? listing.title : t("not-found")}</title>
                <meta
                    name="description"
                    content="Imovinko - oglasnik za nekretnine. Pronađite svoj dom."
                />
                <meta
                    name="keywords"
                    content="oglasnik, nekretnina, kuća, stan, zemljište, kupovina, prodaja, najam"
                />
            </Head>
            <header>
                <Navbar />
            </header>
            <main className={`flex-1 ${isMediaPopupOpen ? "overflow-y-hidden" : "pb-12"}`}>
                {listing ? (
                    <div>
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
                                                useEffect(() => {
                                                    let shouldHandleKeyDown = true;
                                                    function keydownHandler(e: KeyboardEvent) {
                                                        if (!shouldHandleKeyDown) return;
                                                        shouldHandleKeyDown = false;
                                                        // HANDLE KEY DOWN HERE
                                                        console.log(e);
                                                        if (
                                                            e.key === "ArrowRight" ||
                                                            e.keyCode === 39
                                                        ) {
                                                            props.nextHandler();
                                                        } else if (
                                                            e.key === "ArrowLeft" ||
                                                            e.keyCode === 37
                                                        ) {
                                                            props.prevHandler();
                                                        }
                                                    }
                                                    function keyupHandler() {
                                                        shouldHandleKeyDown = true;
                                                    }
                                                    if (isMediaPopupOpen) {
                                                        document.removeEventListener(
                                                            "keydown",
                                                            keydownHandler
                                                        );
                                                        document.removeEventListener(
                                                            "keyup",
                                                            keyupHandler
                                                        );
                                                        document.addEventListener(
                                                            "keydown",
                                                            keydownHandler
                                                        );
                                                        document.addEventListener(
                                                            "keyup",
                                                            keyupHandler
                                                        );
                                                    }

                                                    return () => {
                                                        document.removeEventListener(
                                                            "keydown",
                                                            keydownHandler
                                                        );
                                                        document.removeEventListener(
                                                            "keyup",
                                                            keyupHandler
                                                        );
                                                    };
                                                }, []);

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
                                                <div
                                                    key={m.url}
                                                    className="flex items-center justify-center w-full h-full"
                                                >
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

                        <section className="flex flex-col-reverse lg:flex-row container mx-auto lg:mt-8">
                            <div className="flex-1 flex flex-col lg:w-1/2 lg:pr-6">
                                <div className="hidden lg:block">
                                    <Typography variant="h1">{listing.title}</Typography>
                                    <Typography variant="secondary" uppercase>
                                        {getPropertyLocationString(listing)}
                                    </Typography>
                                    <Typography variant="h2" className="mt-2 text-right">
                                        {listing.price.toLocaleString()} €{" "}
                                        <span className="text-sm font-normal">
                                            {getPriceString(listing)}
                                        </span>
                                    </Typography>
                                </div>
                                <div className="my-4 text-center">
                                    <IconRow listing={listing} />
                                </div>

                                <div className="mt-4 whitespace-pre-line break-all">
                                    <Typography>{listing.description}</Typography>
                                </div>

                                <div className="w-fit mt-10 bg-zinc-50 rounded shadow-sm">
                                    <div>
                                        <div className="-translate-y-1/2 pl-10">
                                            {getListingAvatarUrl(listing) ? (
                                                <div className="relative w-16 h-16 rounded-full overflow-hidden">
                                                    <Image
                                                        src={getListingAvatarUrl(listing)!}
                                                        alt="avatar"
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <Icon name="account" height={64} width={64} />
                                            )}
                                        </div>
                                    </div>
                                    <div className="-mt-6 px-12">
                                        <Typography className="text-lg">
                                            {t("listing-by")}:{" "}
                                            <Link
                                                to={getAccountHref(listing)}
                                                className="text-blue-700"
                                                underlineClassName="!bg-blue-700"
                                            >
                                                <Typography variant="span" bold>
                                                    {getAccountHandle(listing)}
                                                </Typography>
                                            </Link>
                                        </Typography>
                                        <Typography>
                                            {t("lister-joined")}:{" "}
                                            <Typography variant="span" bold>
                                                {getAccountJoinDate(listing)}
                                            </Typography>
                                        </Typography>
                                    </div>
                                    <div className="w-full my-4 px-6">
                                        <div className="bg-zinc-300 h-0.5 rounded-full" />
                                    </div>
                                    <div className="mb-6 px-12">
                                        <Typography>
                                            {t("listing-posted")}:{" "}
                                            <Typography variant="span" bold>
                                                {new Date(listing.createdAt)
                                                    .toLocaleDateString(undefined, {
                                                        day: "2-digit",
                                                        month: "2-digit",
                                                        year: "numeric",
                                                    })
                                                    .replaceAll("/", ".") +
                                                    " " +
                                                    new Date(listing.createdAt).toLocaleTimeString(
                                                        undefined,
                                                        {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        }
                                                    )}
                                            </Typography>
                                        </Typography>
                                        <Typography>
                                            {t("view-count")}:{" "}
                                            <Typography variant="span" bold>
                                                {listing.viewCount}
                                            </Typography>
                                        </Typography>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 flex flex-col lg:w-1/2">
                                <div className="lg:hidden block">
                                    <Typography variant="h1">{listing.title}</Typography>
                                    <Typography variant="secondary" uppercase className="my-1">
                                        {getPropertyLocationString(listing)}
                                    </Typography>
                                    <Typography variant="h2" className="mt-2 text-right">
                                        {listing.price.toLocaleString()} €{" "}
                                        <span className="text-sm font-normal">
                                            {getPriceString(listing)}
                                        </span>
                                    </Typography>
                                </div>

                                <MediaComponent
                                    media={getPropertyMedia(listing)}
                                    onImageClick={() => {
                                        setIsMediaPopupOpen(true);
                                    }}
                                />
                                {(listing.contacts.length > 0 ||
                                    listing.manualAccountContacts.length > 0) && (
                                    <div className="mt-12 bg-zinc-50 rounded shadow-sm p-3 space-y-3">
                                        <Typography
                                            sm
                                            uppercase
                                            className="text-zinc-600 tracking-wider pl-2"
                                        >
                                            {t("your-contact")}
                                        </Typography>
                                        {listing.contacts.map((ac) => {
                                            return (
                                                <ContactCard
                                                    key={JSON.stringify(ac)}
                                                    firstName={ac.firstName}
                                                    lastName={ac.lastName}
                                                    username={ac.username}
                                                    avatarUrl={ac.avatarUrl}
                                                    contacts={[
                                                        {
                                                            type: "email",
                                                            contact: ac.email,
                                                        },
                                                        {
                                                            type: "phone",
                                                            contact: ac.phone,
                                                        },
                                                    ]}
                                                />
                                            );
                                        })}
                                        {listing.manualAccountContacts.map((mac) => {
                                            return (
                                                <ContactCard
                                                    key={JSON.stringify(mac)}
                                                    firstName={mac.firstName}
                                                    lastName={mac.lastName}
                                                    username={mac.username}
                                                    avatarUrl={mac.avatarUrl}
                                                    contacts={[
                                                        {
                                                            type: "email",
                                                            contact: mac.email,
                                                        },
                                                        {
                                                            type: "phone",
                                                            contact: mac.phone,
                                                        },
                                                    ]}
                                                />
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </section>

                        <section id="location" className="container mx-auto mt-8">
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
                                directionsPlaceMapboxId={directions?.placeMapboxId}
                                directionsPlaceName={directions?.placeName}
                                travelingMethod={travelingMethod}
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

                            <div className="mt-2">
                                <Typography bold>{t("travel-time")}</Typography>
                                <Typography>{t("travel-time-description")}</Typography>
                                <div className="inline-flex flex-row bg-zinc-50 items-center p-1 !pr-0 rounded shadow w-full max-w-sm mt-2">
                                    <Dropdown
                                        className="border-r-2 border-zinc-200"
                                        options={[
                                            {
                                                value: TravelingMethods.driving,
                                                iconName: "car",
                                            },
                                            {
                                                value: TravelingMethods.traffic,
                                                iconName: "traffic",
                                            },
                                            {
                                                value: TravelingMethods.walking,
                                                iconName: "walking",
                                            },
                                            {
                                                value: TravelingMethods.cycling,
                                                iconName: "cycling",
                                            },
                                        ]}
                                        onOptionChange={(opt) => {
                                            setTravelingMethod(opt.value as TravelingMethods);
                                        }}
                                    />
                                    <div className="relative flex-1">
                                        <DebounceInput
                                            onFocus={() => {
                                                setSuggestionDropdownShouldBeOpen(true);
                                            }}
                                            debounceTimeout={1000}
                                            placeholder={t("enter-address")}
                                            onChange={(e) => {
                                                const newVal = e.target.value;
                                                if (newVal.length <= 2) {
                                                    return;
                                                }
                                                handleSuggestionInputChange(newVal);
                                            }}
                                            className={`w-full px-2 outline-none border-none h-full bg-transparent ${space_grotesk.className}`}
                                        />
                                        {suggestionDropdownShouldBeOpen &&
                                            suggestions.length > 0 && (
                                                <div className="mt-2 absolute left-0 w-full -bottom-4 translate-y-full bg-zinc-50 rounded-md shadow-md flex flex-col max-w-sm z-30">
                                                    {suggestions.map((s, i) => {
                                                        return (
                                                            <div
                                                                className="hover:bg-zinc-200 cursor-pointer flex flex-row items-center p-2"
                                                                key={s.name + "-" + i}
                                                                onClick={() => {
                                                                    handleSuggestionClick(s);
                                                                }}
                                                            >
                                                                <div>
                                                                    <Icon name="location" />
                                                                </div>
                                                                <div className="ml-2">
                                                                    <Typography bold>
                                                                        {s.name}
                                                                    </Typography>
                                                                    <Typography sm>
                                                                        {getSuggestionFullLocation(
                                                                            s
                                                                        )}
                                                                    </Typography>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {listing.offeringType === OfferingType.sale && (
                            <section className="container mx-auto mt-8">
                                <Typography variant="h2" className="mb-4">
                                    {t("calculator")}
                                </Typography>
                                <Typography>{t("calculator-description")}</Typography>
                                <div className="w-full mt-10">
                                    <MortgageCalculator initialLoanValue={listing.price} />
                                </div>
                            </section>
                        )}
                    </div>
                ) : (
                    <NotFound>
                        <Typography>{t("not-found")}</Typography>
                    </NotFound>
                )}
            </main>
            <Footer />
        </>
    );
}
