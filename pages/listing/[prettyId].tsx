import Navbar from "@/components/Navbar";
import Typography from "@/components/Typography";
import {
    Account,
    EnergyClassColors,
    FullAccountSingleCompany,
    Listing,
    ListingBasic,
    Media,
    OfferingType,
    PaginatedListingBasic,
    PropertyType,
    TravelingMethods,
    findListing,
    findListingsByBoundingBox,
    sendMessage,
    suggestLocations,
} from "@/util/api";
import { GetServerSideProps } from "next";
import { useTranslations } from "next-intl";
import React, { useRef, useState } from "react";
import Icon from "@/components/Icon";
import Map from "@/components/Map";
import { Marker } from "react-map-gl";
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
import Main from "@/components/Main";
import { Carousel as RCarousel } from "react-responsive-carousel";
import styles from "./styles.module.css";
import { isValidPhoneNumber, formatPhoneNumber } from "react-phone-number-input";
import ListingCardItem from "@/components/listing/ListingCardItem";
import ListingListItem from "@/components/listing/ListingListItem";
import Modal from "@/components/Modal";
import Input from "@/components/Input";
import useAuthentication from "@/hooks/useAuthentication";
import cookie from "cookie";
import SaveListingIcon from "@/components/SaveListingIcon";
import Dialog from "@/components/Dialog";
import { formatPrice, isSold } from "@/util/listing";
import { formatDMYDate, formatHHMMTime } from "@/util/date";
import CImage from "@/components/CImage";

const PriceChangeChart = dynamic(() => import("@/components/PriceChangeChart"), { ssr: false });
const MortgageCalculator = dynamic(() => import("@/components/MortgageCalculator"), { ssr: false });

export const getServerSideProps: GetServerSideProps = async ({ params, locale, req }) => {
    let listing = null;
    let similarListings = null;
    if (typeof params?.prettyId === "string") {
        try {
            const cookies = req.headers.cookie;

            const parsed = cookie.parse(cookies || "");
            const jwt = parsed[process.env.NEXT_PUBLIC_JWT_COOKIE_NAME || ""];

            listing = (await findListing(params.prettyId, jwt)).data;
            const listingProperty = listing.apartment || listing.house || listing.land;
            if (!listingProperty) {
                throw new Error("Listing has no property");
            }
            let propertyType: PropertyType;
            if (listing.apartment) {
                propertyType = PropertyType.apartment;
            } else if (listing.house) {
                propertyType = PropertyType.house;
            } else {
                propertyType = PropertyType.land;
            }
            const nwlat = listingProperty.latitude + 0.02;
            const nwlng = listingProperty.longitude - 0.02;
            const selat = listingProperty.latitude - 0.02;
            const selng = listingProperty.longitude + 0.02;

            // This finds some listings which are similar to the currently opened listing(similar location, similar price, etc.)
            const similarListingsResp = await findListingsByBoundingBox({
                boundingBox: {
                    nwlat,
                    nwlng,
                    selat,
                    selng,
                },
                propertyType: [propertyType],
                offeringType: [listing.offeringType],
                priceFrom: listing.price * 0.8,
                priceTo: listing.price * 1.2,
                pageSize: 4,
                exclude: [listing.prettyId],
                jwt,
            });
            similarListings = similarListingsResp;
        } catch (e) {
            console.error(e);
        }
    }

    return {
        props: {
            messages: (await import(`../../locales/${locale || "hr"}.json`)).default,
            listing,
            similarListings,
        },
    };
};

interface ContactCardProps {
    firstName?: string | null;
    lastName?: string | null;
    username?: string | null;
    avatarUrl?: string | null;
    contacts: {
        type: "email" | "phone" | "message";
        contact?: string | null | undefined;
        onClick?(): void;
    }[];
}
function ContactCard({ firstName, lastName, username, avatarUrl, contacts }: ContactCardProps) {
    const t = useTranslations("ListingPage");

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
                                <CImage
                                    src={avatarUrl}
                                    alt="avatar"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        ) : (
                            <Icon name="account" height={64} width={64} />
                        )}
                    </Link>
                ) : (
                    <div>
                        {avatarUrl ? (
                            <div className="relative w-16 h-16 rounded-full overflow-hidden">
                                <CImage
                                    src={avatarUrl}
                                    alt="avatar"
                                    fill
                                    className="object-cover"
                                />
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
                    .filter((c) => !!c.contact || c.type === "message")
                    .map((c, i) => {
                        return (
                            <div
                                key={JSON.stringify(contacts) + "-" + i}
                                className="flex-flex-row mt-2 w-full"
                            >
                                {c.type === "email" && (
                                    <a
                                        href={`mailto:${c.contact}`}
                                        className="border-2 border-zinc-700 hover:bg-zinc-100 rounded-lg hover:rounded-xl  hover:shadow  transition-all w-full flex items-center justify-center py-2 px-12"
                                    >
                                        <Typography>{c.contact}</Typography>
                                    </a>
                                )}
                                {c.type === "phone" && (
                                    <a
                                        className="border-2 border-zinc-700 hover:bg-zinc-100 rounded-lg hover:rounded-xl  hover:shadow  transition-all w-full flex items-center justify-center py-2 px-12"
                                        href={`tel:${c.contact}`}
                                    >
                                        <Typography>{c.contact}</Typography>
                                    </a>
                                )}
                                {c.type === "message" && (
                                    <button
                                        className="border-2 border-emerald-800 bg-emerald-700 text-white hover:bg-emerald-600 rounded-lg hover:rounded-xl  hover:shadow  transition-all w-full flex items-center justify-center py-2 px-12"
                                        onClick={() => {
                                            if (c.onClick) {
                                                c.onClick();
                                            }
                                        }}
                                    >
                                        <Typography uppercase bold>
                                            {t("send-message")}
                                        </Typography>
                                    </button>
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
    small?: boolean;
}
function ClickableImage({ url, onClick, showBanner, small }: ClickableImageProps) {
    const t = useTranslations("ListingPage");

    return (
        <div
            className="relative w-full rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-sm hover:opacity-90 transition-all"
            style={{
                height: small ? "200px" : "400px",
            }}
            onClick={onClick}
        >
            <CImage
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
    onImageClick?(imageIndex: number): void;
}
function MediaComponent({ media, onImageClick }: MediaComponentProps) {
    if (media.length === 0) {
        return (
            <div className="h-64 w-full shadow-sm overflow-hidden rounded-lg">
                <NoImage />
            </div>
        );
    }
    if (media.length <= 2) {
        return (
            <div className="flex flex-col w-full space-y-4">
                {media.map((m, i) => {
                    return (
                        <ClickableImage
                            url={m.url}
                            key={m.url}
                            onClick={() => {
                                if (onImageClick) {
                                    onImageClick(i);
                                }
                            }}
                        />
                    );
                })}
            </div>
        );
    }
    return (
        <div className="flex flex-col w-full space-y-4 px-1 lg:px-0">
            <ClickableImage
                url={media[0].url}
                onClick={() => {
                    if (onImageClick) {
                        onImageClick(0);
                    }
                }}
            />
            <div className="flex flex-col lg:flex-row lg:space-x-4 space-y-4 lg:space-y-0">
                <ClickableImage
                    small
                    url={media[1].url}
                    onClick={() => {
                        if (onImageClick) {
                            onImageClick(1);
                        }
                    }}
                />
                <ClickableImage
                    small
                    url={media[2].url}
                    onClick={() => {
                        if (onImageClick) {
                            onImageClick(2);
                        }
                    }}
                />
            </div>
            {media.length >= 4 && (
                <ClickableImage
                    url={media[3].url}
                    onClick={() => {
                        if (onImageClick) {
                            onImageClick(3);
                        }
                    }}
                    showBanner={media.length > 4}
                />
            )}
        </div>
    );
}

interface ListingPageProps {
    listing: Listing | null;
    similarListings: PaginatedListingBasic | null;
}
export default function ListingPage({ listing, similarListings }: ListingPageProps) {
    const MARKER_SIZE = 48;
    const t = useTranslations("ListingPage");

    const router = useRouter();

    const { account } = useAuthentication();

    const shareLinkInputRef = useRef<HTMLInputElement>(null);

    const [isMediaPopupOpen, setIsMediaPopupOpen] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    // remember where the user was when they open the media popup and scroll to that place when they close the popup
    const [scrollWhenOpeningImage, setScrollWhenOpeningImage] = useState<number>();

    const [travelingMethod, setTravelingMethod] = useState<TravelingMethods>();
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [directions, setDirections] = useState<{
        placeMapboxId: string;
        placeName: string;
    } | null>(null);
    const [directionsData, setDirectionsData] = useState<{
        durationSeconds?: string | number | null;
        distanceMeters?: string | number | null;
    }>({});
    const [suggestionDropdownShouldBeOpen, setSuggestionDropdownShouldBeOpen] = useState(false);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const [messageModalAccountId, setMessageModalAccountId] = useState<string | null>(null);
    const [isSendingMessage, setIsSendingMessage] = useState(false);
    const [message, setMessage] = useState("");
    const [showShareModal, setShowShareModal] = useState(false);
    const [shareLink, setShareLink] = useState("");

    const totalSlides = getPropertyMedia(listing).length;

    function getPriceString(p: Listing) {
        if (p.offeringType === OfferingType.shortTermRent) {
            return ` ${t("per-night")}`;
        } else if (p.offeringType === OfferingType.longTermRent) {
            return ` ${t("per-month")}, ${
                p.priceIncludesUtilities ? t("price-with-utilities") : t("price-without-utilities")
            }`;
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

    function getPropertyOtherListings(p: Listing) {
        let otherListings: ListingBasic[] = [];
        // Get propertys other listings. If the property is listed for sale and long term rent at the same time for instance.
        if (p.apartment) {
            otherListings = p.apartment.listings;
        } else if (p.house) {
            otherListings = p.house.listings;
        } else {
            otherListings = p.land!.listings;
        }
        // Don't return the currently open listing
        return otherListings.filter((ol) => ol.offeringType !== p.offeringType);
    }

    function getAccountNoCompanyHandle(account?: Account) {
        if (!account) {
            return "";
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

        if (account.username) {
            return account.username;
        }

        return account.email;
    }

    function accountHasCompany(account?: FullAccountSingleCompany | null) {
        return !!account?.company;
    }

    function getAccountHandleAcc(account?: FullAccountSingleCompany | null) {
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

        return account.email;
    }

    function getAccountHandle(p: Listing) {
        const account = getListingAccount(p);

        return getAccountHandleAcc(account);
    }

    function getListingAccount(p: Listing) {
        let account: FullAccountSingleCompany | null = null;
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
        const account = getListingAccount(p);
        if (account?.company) {
            return account.company.avatarUrl;
        }

        if (!account) {
            return null;
        }

        return account.avatarUrl;
    }

    function getListingCompanyWebsite(p: Listing) {
        const account = getListingAccount(p);
        return account?.company?.website;
    }

    function getAccountJoinDate(p: Listing) {
        let account = getListingAccount(p);

        if (!account) {
            return "";
        }

        if (account.company) {
            return formatDMYDate(account.company.createdAt);
        }

        return formatDMYDate(account.createdAt);
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

    function meterToKM(meters: number | string) {
        if (typeof meters === "string") {
            meters = parseFloat(meters);
        }
        const km = meters / 1000;
        return km.toFixed(1);
    }

    function secondsToHours(seconds: number | string) {
        if (typeof seconds === "string") {
            seconds = parseFloat(seconds);
        }
        const totalMinutes = Math.floor(seconds / 60);

        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        return { h: hours, m: minutes };
    }

    function getLengthStr(lengthSeconds: number | string) {
        const dur = secondsToHours(lengthSeconds);

        let str = "";
        if (dur.h > 0) {
            str += dur.h + " hr";
        }
        if (str.length > 0) {
            str += " ";
        }
        str += dur.m + " min";
        return str;
    }

    async function handleSuggestionInputChange(newVal: string) {
        if (!listing) {
            return;
        }

        try {
            setIsLoadingSuggestions(true);
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
        } finally {
            setIsLoadingSuggestions(false);
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

    function getPropertyCustomId(l: Listing) {
        return l.apartment?.customId || l.house?.customId || l.land?.customId;
    }

    function formatPhone(phone: string | undefined | null) {
        if (!phone) {
            return undefined;
        }
        if (isValidPhoneNumber(phone)) {
            return formatPhoneNumber(phone);
        }
        return undefined;
    }

    interface AdditionalInfo {
        name: string;
        val: string | number;
        textColor?: string;
        className?: string;
    }

    function getAdditionalInfo(listing: Listing) {
        const obj: AdditionalInfo[] = [];

        if (listing.apartment) {
            const locationString = getPropertyLocationString(listing);
            if (locationString.length > 0) {
                obj.push({
                    name: t("location"),
                    val: locationString,
                });
            }
            obj.push({
                name: t("area"),
                val: listing.apartment.surfaceArea.toFixed(2) + " m²",
            });
            if (listing.apartment.bedroomCount) {
                obj.push({
                    name: t("bedrooms"),
                    val: listing.apartment.bedroomCount,
                });
            }
            if (listing.apartment.bathroomCount) {
                obj.push({
                    name: t("bathrooms"),
                    val: listing.apartment.bathroomCount,
                });
            }
            if (listing.apartment.parkingSpaceCount) {
                obj.push({
                    name: t("parking-spaces"),
                    val: listing.apartment.parkingSpaceCount,
                });
            }
            if (listing.apartment.floor) {
                obj.push({
                    name: t("floor"),
                    val: listing.apartment.floor + ".",
                });
            }
            if (listing.apartment.totalFloors) {
                obj.push({
                    name: t("totalFloors"),
                    val: listing.apartment.totalFloors,
                });
            }
            if (listing.apartment.buildingFloors) {
                obj.push({
                    name: t("buildingFloors"),
                    val: listing.apartment.buildingFloors,
                });
            }
            obj.push({
                name: t("elevator-access"),
                val: listing.apartment.elevatorAccess ? t("yes") : t("no"),
            });
            if (listing.apartment.buildYear) {
                obj.push({
                    name: t("buildYear"),
                    val: listing.apartment.buildYear + ".",
                });
            }
            if (listing.apartment.renovationYear) {
                obj.push({
                    name: t("renovationYear"),
                    val: listing.apartment.renovationYear + ".",
                });
            }
            obj.push({
                name: t("needs-renovation"),
                val: listing.apartment.needsRenovation ? t("yes") : t("no"),
            });
            if (listing.apartment.furnitureState) {
                obj.push({
                    name: t("furniture-state"),
                    val: t(listing.apartment.furnitureState),
                });
            }
            if (listing.apartment.energyLabel) {
                obj.push({
                    name: t("energy"),
                    val: listing.apartment.energyLabel.replaceAll("p", "+"),
                    textColor: EnergyClassColors[listing.apartment.energyLabel],
                    className: "shadowed-text",
                });
            }
            if (listing.apartment.customId) {
                obj.push({
                    name: t("custom-id"),
                    val: listing.apartment.customId,
                });
            }
        }
        if (listing.house) {
            const locationString = getPropertyLocationString(listing);
            if (locationString.length > 0) {
                obj.push({
                    name: t("location"),
                    val: locationString,
                });
            }
            obj.push({
                name: t("area"),
                val: listing.house.surfaceArea.toFixed(2) + " m²",
            });
            if (listing.house.bedroomCount) {
                obj.push({
                    name: t("bedrooms"),
                    val: listing.house.bedroomCount,
                });
            }
            if (listing.house.bathroomCount) {
                obj.push({
                    name: t("bathrooms"),
                    val: listing.house.bathroomCount,
                });
            }
            if (listing.house.parkingSpaceCount) {
                obj.push({
                    name: t("parking-spaces"),
                    val: listing.house.parkingSpaceCount,
                });
            }
            if (listing.house.totalFloors) {
                obj.push({
                    name: t("totalFloors"),
                    val: listing.house.totalFloors,
                });
            }
            if (listing.house.buildYear) {
                obj.push({
                    name: t("buildYear"),
                    val: listing.house.buildYear + ".",
                });
            }
            if (listing.house.renovationYear) {
                obj.push({
                    name: t("renovationYear"),
                    val: listing.house.renovationYear + ".",
                });
            }
            obj.push({
                name: t("needs-renovation"),
                val: listing.house.needsRenovation ? t("yes") : t("no"),
            });
            if (listing.house.furnitureState) {
                obj.push({
                    name: t("furniture-state"),
                    val: t(listing.house.furnitureState),
                });
            }
            if (listing.house.energyLabel) {
                obj.push({
                    name: t("energy"),
                    val: listing.house.energyLabel.replaceAll("p", "+"),
                    textColor: EnergyClassColors[listing.house.energyLabel],
                });
            }
            if (listing.house.customId) {
                obj.push({
                    name: t("custom-id"),
                    val: listing.house.customId,
                });
            }
        }
        if (listing.land) {
            const locationString = getPropertyLocationString(listing);
            if (locationString.length > 0) {
                obj.push({
                    name: t("location"),
                    val: locationString,
                });
            }
            obj.push({
                name: t("area"),
                val: listing.land.surfaceArea.toFixed(2) + " m²",
            });
            if (listing.land.customId) {
                obj.push({
                    name: t("custom-id"),
                    val: listing.land.customId,
                });
            }
        }
        if (listing.offeringType === OfferingType.sale) {
            if (listing.saleCommissionPercent) {
                obj.push({
                    name: t("commission"),
                    val: `${listing.saleCommissionPercent.toFixed(2)}% [${formatPrice(
                        listing.price * (listing.saleCommissionPercent / 100)
                    )}]`,
                });
            } else {
                obj.push({
                    name: t("commission"),
                    val: t("none"),
                });
            }
        }
        return obj;
    }

    function upHandler(event: KeyboardEvent) {
        const { key } = event;

        if (key === "ArrowLeft") {
            let newSlide = currentSlide - 1;
            if (newSlide < 0) {
                newSlide = getPropertyMedia(listing).length - 1;
            }
            setCurrentSlide(newSlide);
        }

        if (key === "ArrowRight") {
            let newSlide = currentSlide + 1;
            if (newSlide >= getPropertyMedia(listing).length) {
                newSlide = 0;
            }
            setCurrentSlide(newSlide);
        }
    }

    function downHandler(event: KeyboardEvent) {
        const { key } = event;

        if (key === "Escape") {
            if (isMediaPopupOpen) {
                event.preventDefault();
                setIsMediaPopupOpen(false);
            }
        }
    }

    function getShareLink() {
        // Remove URL queries
        return window.location.href.split("?")[0];
    }

    function onShareLinkCopy() {
        selectShareLinkText();
        navigator.clipboard.writeText(getShareLink());
    }

    function selectShareLinkText() {
        shareLinkInputRef.current?.select();
    }

    async function handleMessageSend() {
        setIsSendingMessage(true);
        try {
            const sendMessageResp = await sendMessage({
                content: message,
                listingId: listing?.id,
                otherParticipantId: messageModalAccountId,
            });

            await router.push({
                pathname: "/conversations",
                query: {
                    c: sendMessageResp.data.conversationId,
                },
            });
        } catch (err) {
            setIsSendingMessage(false);
            console.error(err);
        }
    }

    React.useEffect(() => {
        // getShareLink needs access to the JS window object, which is no available on server side
        setShareLink(getShareLink());
    }, []);

    React.useEffect(() => {
        if (isMediaPopupOpen) {
            setScrollWhenOpeningImage(document.documentElement.scrollTop);
            window.scroll(0, 0);
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
            if (scrollWhenOpeningImage) {
                window.scroll(0, scrollWhenOpeningImage);
            }
        }
    }, [isMediaPopupOpen]);

    React.useEffect(() => {
        if (isMediaPopupOpen) {
            // Very important to use keydown to listen for the Escape key:
            // Macos will exit your Full-screen app if you press the Escape key, so we need to prevent the default action
            // And close the media popup.
            // If you use keyup, it won't work, as the call order is like this-> keydown event->exit fullscreen->keyup event
            window.addEventListener("keydown", downHandler);
            window.addEventListener("keyup", upHandler);
            // Remove event listeners on cleanup
            return () => {
                window.addEventListener("keydown", downHandler);
                window.removeEventListener("keyup", upHandler);
            };
        }
    }, [isMediaPopupOpen, currentSlide]);

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
            <Main className={`${isMediaPopupOpen ? "overflow-y-hidden touch-none" : "pb-12"}`}>
                {listing ? (
                    <div>
                        <Modal
                            small
                            show={showShareModal}
                            onClose={() => {
                                setShowShareModal(false);
                            }}
                        >
                            <div className="flex flex-col">
                                <div className="flex flex-row py-2">
                                    <Typography variant="h2" className="pl-2">
                                        {t("share-listing")}
                                    </Typography>
                                    <div className="flex-1" />
                                    <div className="pr-2">
                                        <Button.Transparent
                                            className="!p-1.5"
                                            onClick={() => {
                                                setShowShareModal(false);
                                            }}
                                        >
                                            <Icon name="close" />
                                        </Button.Transparent>
                                    </div>
                                </div>

                                <ListingListItem
                                    className="rounded-none border-y border-zinc-400"
                                    listing={listing}
                                    hideIconRow
                                />

                                <div className="mx-4 my-4">
                                    <Typography>{t("link")}:</Typography>
                                    <div className="flex flex-row">
                                        <input
                                            readOnly
                                            onClick={selectShareLinkText}
                                            ref={shareLinkInputRef}
                                            value={shareLink}
                                            className={`${space_grotesk.className} outline-none flex-1 rounded-l !rounded-r-none border border-emerald-700 px-1`}
                                        />
                                        <button
                                            onClick={onShareLinkCopy}
                                            className="bg-emerald-700 hover:bg-emerald-600 text-white py-1 px-2 rounded-r border border-emerald-700 outline-none uppercase"
                                        >
                                            {t("copy")}
                                        </button>
                                    </div>
                                </div>

                                <div className="mx-4 mb-4 flex flex-row flex-wrap gap-4">
                                    <Link
                                        newTab
                                        to="https://www.facebook.com/sharer.php"
                                        query={{
                                            u: shareLink,
                                        }}
                                        disableAnimatedHover
                                        className="cursor-pointer flex flex-row space-x-2 bg-zinc-200 hover:bg-zinc-300 transition-all shadow rounded py-2 px-4 items-center"
                                    >
                                        <Icon name="facebook" />
                                        <Typography
                                            uppercase
                                            sm
                                            bold
                                            className="tracking-wide select-none"
                                        >
                                            Facebook
                                        </Typography>
                                    </Link>

                                    <Link
                                        newTab
                                        to="https://twitter.com/intent/tweet"
                                        query={{
                                            url: shareLink,
                                        }}
                                        disableAnimatedHover
                                        className="cursor-pointer flex flex-row space-x-2 bg-zinc-200 hover:bg-zinc-300 transition-all shadow rounded py-2 px-4 items-center"
                                    >
                                        <Icon name="twitter" />
                                        <Typography
                                            uppercase
                                            sm
                                            bold
                                            className="tracking-wide select-none"
                                        >
                                            Twitter
                                        </Typography>
                                    </Link>
                                </div>
                            </div>
                        </Modal>
                        <Modal
                            small
                            show={!!messageModalAccountId}
                            onClose={() => {
                                setMessageModalAccountId(null);
                            }}
                        >
                            <div className="flex flex-col relative">
                                <ListingListItem
                                    hideIconRow
                                    listing={listing}
                                    className="border-t border-b border-zinc-300 rounded-none shadow-none"
                                />

                                <Typography sm className="!italic text-zinc-500 px-2">
                                    {t("listing-will-be-sent")}
                                </Typography>

                                <Typography variant="h2" className="mt-4 px-2">
                                    {t("message-for")}
                                    {": "}
                                    {getAccountNoCompanyHandle(
                                        listing.contacts.find((c) => c.id === messageModalAccountId)
                                    )}
                                </Typography>
                                <div className="p-2">
                                    <Input
                                        type="textarea"
                                        className="border border-zinc-300"
                                        placeholder={t("message-placeholder")}
                                        value={message}
                                        onChange={setMessage}
                                    />
                                </div>
                                <div className="px-2 mb-2">
                                    <Button.Primary
                                        onClick={handleMessageSend}
                                        label={t("send")}
                                        loading={isSendingMessage}
                                        className="bg-emerald-800 hover:bg-emerald-700"
                                    />
                                </div>
                            </div>
                        </Modal>
                        <div
                            className={`${
                                isMediaPopupOpen ? "opacity-100" : "opacity-0 invisible"
                            } fixed top-0 bottom-0 left-0 right-0 bg-zinc-900 z-40 flex flex-col`}
                        >
                            <div className="h-full w-full">
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
                                                <Typography className="text-zinc-50 hidden md:flex">
                                                    {t("close")}
                                                </Typography>
                                            </div>
                                        </Button.Transparent>
                                    </div>
                                </div>
                                <RCarousel
                                    className={`h-[85%] z-30 ${styles["carousel-root"]}`}
                                    showThumbs={false}
                                    selectedItem={currentSlide}
                                    onChange={(newSlide) => {
                                        setCurrentSlide(newSlide);
                                    }}
                                    infiniteLoop
                                    swipeable
                                    emulateTouch
                                    preventMovementUntilSwipeScrollTolerance
                                    showStatus={false}
                                    showIndicators={false}
                                    renderArrowPrev={(handler) => {
                                        if (getPropertyMedia(listing).length <= 1) {
                                            return null;
                                        }
                                        return (
                                            <div className="absolute left-6 top-1/2 z-30">
                                                <button
                                                    onClick={handler}
                                                    className="rounded-full p-1.5 group"
                                                >
                                                    <div className="rounded-full bg-white p-1 w-full group-hover:bg-zinc-200 transition-all">
                                                        <Icon name="left" height={32} width={32} />
                                                    </div>
                                                </button>
                                            </div>
                                        );
                                    }}
                                    renderArrowNext={(handler) => {
                                        if (getPropertyMedia(listing).length <= 1) {
                                            return null;
                                        }
                                        return (
                                            <div className="absolute right-6 top-1/2 z-30">
                                                <button
                                                    onClick={handler}
                                                    className="rounded-full p-1.5 group"
                                                >
                                                    <div className="rounded-full bg-white p-1 w-full group-hover:bg-zinc-200 transition-all">
                                                        <Icon name="right" height={32} width={32} />
                                                    </div>
                                                </button>
                                            </div>
                                        );
                                    }}
                                >
                                    {getPropertyMedia(listing).map((m) => {
                                        return (
                                            <div
                                                key={m.url}
                                                className="h-full max-h-full flex items-center justify-center flex-1 relative"
                                            >
                                                <CImage
                                                    width={0}
                                                    height={0}
                                                    sizes="100vw"
                                                    className="select-none !max-h-full !w-auto object-contain"
                                                    style={{
                                                        maxWidth: "100%",
                                                    }}
                                                    src={m.url}
                                                    alt="property image"
                                                    unoptimized
                                                />
                                            </div>
                                        );
                                    })}
                                </RCarousel>
                                <div className="h-[5%]">{/* TODO: Render thumbnails here */}</div>
                            </div>
                        </div>

                        <section className="flex flex-col-reverse lg:flex-row container mx-auto">
                            <div className="flex-1 flex flex-col lg:w-1/2 lg:pr-6">
                                <div className="hidden lg:block">
                                    {isSold(listing) && (
                                        <Dialog
                                            className="mb-2"
                                            type="information"
                                            title={t("listing-sold")}
                                            message={t("listing-sold-message")}
                                        />
                                    )}
                                    {!!listing.deactivated && (
                                        <Dialog
                                            className="mb-2"
                                            type="warning"
                                            title={t("listing-deactivated")}
                                            message={t("listing-deactivated-message")}
                                        />
                                    )}
                                    <Typography variant="h1">{listing.title}</Typography>
                                    <Typography variant="secondary" uppercase>
                                        {getPropertyLocationString(listing)}
                                    </Typography>
                                    <Typography variant="h2" className="mt-2 text-right">
                                        {formatPrice(listing.price)}
                                    </Typography>
                                    <Typography className="text-right">
                                        {getPriceString(listing)}
                                    </Typography>
                                </div>
                                <div className="my-4 hidden lg:block">
                                    <IconRow containerClassName="px-2" listing={listing} />
                                </div>

                                <div className="mt-4 whitespace-pre-line px-1 md:px-0">
                                    <Typography>{listing.description}</Typography>
                                </div>

                                <div className="w-fit mt-12 bg-zinc-50 rounded shadow-sm">
                                    <div className="-translate-y-1/2 pl-10 w-fit">
                                        <Link
                                            disableAnimatedHover
                                            to={getAccountHref(listing)}
                                            className="w-fit"
                                        >
                                            {getListingAvatarUrl(listing) ? (
                                                <div className="relative w-16 h-16 rounded-full overflow-hidden">
                                                    <CImage
                                                        src={getListingAvatarUrl(listing)!}
                                                        alt="avatar"
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <Icon name="account" height={64} width={64} />
                                            )}
                                        </Link>
                                    </div>
                                    <div className="-mt-6 px-12">
                                        <Link
                                            to={getAccountHref(listing)}
                                            className="text-blue-700"
                                            underlineClassName="!bg-blue-700"
                                        >
                                            <Typography className="text-lg" variant="span" bold>
                                                {getAccountHandle(listing)}
                                            </Typography>
                                        </Link>
                                        {getListingCompanyWebsite(listing) && (
                                            <Link
                                                newTab
                                                to={getListingCompanyWebsite(listing)!}
                                                className="text-blue-700 flex w-fit"
                                                underlineClassName="!bg-blue-700"
                                            >
                                                <Typography variant="span">
                                                    {getListingCompanyWebsite(listing)!
                                                        .replace("https://", "")
                                                        .replace("www.", "")}
                                                </Typography>
                                            </Link>
                                        )}
                                        {!accountHasCompany(getListingAccount(listing)) && (
                                            <Typography>
                                                {t("lister-joined")}:{" "}
                                                <Typography variant="span" bold>
                                                    {getAccountJoinDate(listing)}
                                                </Typography>
                                            </Typography>
                                        )}
                                    </div>
                                    <div className="w-full my-4 px-6">
                                        <div className="bg-zinc-300 h-0.5 rounded-full" />
                                    </div>
                                    <div className="mb-6 px-12">
                                        <Typography>
                                            {t("listing-posted")}:{" "}
                                            <Typography variant="span" bold>
                                                {formatDMYDate(listing.createdAt) +
                                                    " " +
                                                    formatHHMMTime(listing.createdAt)}
                                            </Typography>
                                        </Typography>
                                        <Typography>
                                            {t("last-update")}:{" "}
                                            <Typography variant="span" bold>
                                                {formatDMYDate(listing.updatedAt) +
                                                    " " +
                                                    formatHHMMTime(listing.updatedAt)}
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

                                <div className="flex flex-row flex-wrap gap-1">
                                    <SaveListingIcon
                                        listingId={listing.id}
                                        saved={listing.saved}
                                        text={t("save-listing")}
                                        className="mt-4"
                                    />
                                    <Button.Transparent
                                        className="mt-4"
                                        onClick={() => {
                                            setShowShareModal(true);
                                        }}
                                    >
                                        <Icon name="share" />
                                        <Typography className="ml-1" bold>
                                            {t("share")}
                                        </Typography>
                                    </Button.Transparent>
                                </div>
                            </div>
                            <div className="flex-1 flex flex-col lg:w-1/2">
                                <div className="lg:hidden block px-1">
                                    <Typography variant="h1">{listing.title}</Typography>
                                    <Typography variant="secondary" uppercase className="my-1">
                                        {getPropertyLocationString(listing)}
                                    </Typography>
                                    <Typography variant="h2" className="mt-2 text-right">
                                        {formatPrice(listing.price)}
                                    </Typography>
                                    <Typography className="text-right">
                                        {getPriceString(listing)}
                                    </Typography>
                                    <div className="my-2 px-2 flex items-center justify-center">
                                        <IconRow containerClassName="px-2" listing={listing} />
                                    </div>
                                </div>

                                <MediaComponent
                                    media={getPropertyMedia(listing)}
                                    onImageClick={(imageIndex) => {
                                        setIsMediaPopupOpen(true);
                                        setCurrentSlide(imageIndex);
                                    }}
                                />
                                {(listing.contacts.length > 0 ||
                                    listing.manualAccountContacts.length > 0) && (
                                    <div className="mt-8 bg-zinc-50 rounded shadow-sm p-3 space-y-3 max-w-md ml-auto">
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
                                                    key={ac.id}
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
                                                            contact: formatPhone(ac.phone),
                                                        },
                                                        {
                                                            type: "message",
                                                            async onClick() {
                                                                if (!account) {
                                                                    await router.push("/login");
                                                                }
                                                                setMessageModalAccountId(ac.id);
                                                            },
                                                        },
                                                    ]}
                                                />
                                            );
                                        })}
                                        {listing.manualAccountContacts.map((mac) => {
                                            return (
                                                <ContactCard
                                                    key={mac.id}
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
                                                            contact: formatPhone(mac.phone),
                                                        },
                                                    ]}
                                                />
                                            );
                                        })}
                                        {getPropertyCustomId(listing) && (
                                            <Typography variant="secondary" uppercase>
                                                {t("custom-id")}:{" "}
                                                <Typography variant="span" bold>
                                                    {getPropertyCustomId(listing)}
                                                </Typography>
                                            </Typography>
                                        )}
                                    </div>
                                )}
                            </div>
                        </section>

                        <section className="container mx-auto mt-8">
                            <Typography variant="h2" className="px-1 md:px-0">
                                {t("information")}
                            </Typography>
                            <div className="w-full md:w-fit grid grid-cols-2 rounded overflow-hidden shadow-sm mt-2 max-w-4xl">
                                {getAdditionalInfo(listing).map((i, index) => {
                                    return (
                                        <React.Fragment key={i.name}>
                                            <div
                                                className={`py-2 px-2 ${
                                                    index % 2 === 0 ? "bg-zinc-50" : "bg-zinc-200"
                                                }`}
                                            >
                                                <Typography>{i.name}</Typography>
                                            </div>
                                            <div
                                                className={`py-2 pl-8 pr-4 ${
                                                    index % 2 === 0 ? "bg-zinc-50" : "bg-zinc-200"
                                                }`}
                                            >
                                                <Typography
                                                    bold
                                                    className={i.className}
                                                    style={{
                                                        color: i.textColor,
                                                    }}
                                                >
                                                    {i.val}
                                                </Typography>
                                            </div>
                                        </React.Fragment>
                                    );
                                })}
                            </div>
                        </section>

                        <section id="location" className="w-full mt-8">
                            <div className="container mx-auto px-1 md:px-0">
                                <Typography variant="h2" className="mb-4">
                                    {t("location")}
                                </Typography>
                            </div>
                            <Map
                                className="w-full shadow-sm mt-2"
                                style={{
                                    height: "50vh",
                                }}
                                centerLat={getPropertyLat(listing)}
                                centerLon={getPropertyLng(listing)}
                                zoom={16}
                                directionsPlaceMapboxId={directions?.placeMapboxId}
                                directionsPlaceName={directions?.placeName}
                                travelingMethod={travelingMethod}
                                onDirectionsLoad={(distance, duration) => {
                                    setDirectionsData({
                                        distanceMeters: distance,
                                        durationSeconds: duration,
                                    });
                                }}
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

                            <div className="container mx-auto mt-2 px-1 md:px-0">
                                <Typography bold>{t("travel-time")}</Typography>
                                <Typography>{t("travel-time-description")}</Typography>
                                <div className="relative inline-flex flex-row bg-zinc-50 items-center p-1 !pr-0 rounded shadow w-full max-w-sm mt-2">
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
                                    <div
                                        className={`pl-2 flex items-center justify-center absolute right-0 top-0 bottom-0 transition-all ${
                                            isLoadingSuggestions
                                                ? "translate-x-full visible"
                                                : "invisible"
                                        }`}
                                    >
                                        <Icon name="loading" />
                                    </div>
                                </div>
                                <div>
                                    {directions?.placeName && (
                                        <Typography>
                                            {t("your-destination")}: {directions?.placeName}
                                            {directionsData.distanceMeters && (
                                                <Typography variant="span" bold>
                                                    {" "}
                                                    ({meterToKM(directionsData.distanceMeters)} km)
                                                </Typography>
                                            )}
                                        </Typography>
                                    )}{" "}
                                    {directionsData.durationSeconds && (
                                        <Typography>
                                            {t("trip-length")}:{" "}
                                            <Typography
                                                variant="span"
                                                bold
                                                className="text-blue-500"
                                            >
                                                {getLengthStr(directionsData.durationSeconds)}
                                            </Typography>
                                        </Typography>
                                    )}
                                </div>
                            </div>
                        </section>

                        {listing.offeringType === OfferingType.sale && (
                            <section className="container mx-auto mt-8 px-1 md:px-0">
                                <Typography variant="h2" className="mb-4">
                                    {t("calculator")}
                                </Typography>
                                <Typography>{t("calculator-description")}</Typography>
                                <div className="w-full mt-8">
                                    <MortgageCalculator initialLoanValue={listing.price} />
                                </div>
                            </section>
                        )}

                        {listing.priceChanges.length > 1 && (
                            <section className="container mx-auto mt-8">
                                <Typography variant="h2" className="mb-2 px-1 md:px-0">
                                    {t("price-history")}
                                </Typography>
                                <PriceChangeChart
                                    currentPrice={listing.price}
                                    data={listing.priceChanges}
                                    locale={router.locale}
                                />
                            </section>
                        )}

                        {getPropertyOtherListings(listing).length > 0 && (
                            <section className="container mx-auto mt-8 px-1 md:px-0">
                                <Typography variant="h2" className="mb-2">
                                    {t("other-listings")}
                                </Typography>

                                <div className="space-y-6">
                                    {getPropertyOtherListings(listing).map((l) => {
                                        return <ListingListItem listing={l} key={l.prettyId} />;
                                    })}
                                </div>
                            </section>
                        )}

                        {similarListings?.data && similarListings.data.length > 0 && (
                            <section className="container mx-auto mt-8 px-1 md:px-0">
                                <Typography variant="h2" className="mb-2">
                                    {t("similar")}
                                </Typography>

                                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-x-3 gap-y-3">
                                    {similarListings.data.map((l) => {
                                        return <ListingCardItem listing={l} key={l.prettyId} />;
                                    })}
                                </div>
                            </section>
                        )}
                    </div>
                ) : (
                    <NotFound>
                        <Typography>{t("not-found")}</Typography>
                    </NotFound>
                )}
            </Main>
            <Footer />
        </>
    );
}
