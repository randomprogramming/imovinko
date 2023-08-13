import Button from "@/components/Button";
import Icon from "@/components/Icon";
import Link from "@/components/Link";
import Map from "@/components/Map";
import Navbar from "@/components/Navbar";
import Typography from "@/components/Typography";
import { ListingBasic, OfferingType, PropertyType, findListingsByBoundingBox } from "@/util/api";
import { LngLatBounds } from "mapbox-gl";
import { GetServerSideProps } from "next";
import { useTranslations } from "next-intl";
import React, { useState } from "react";
import { Marker, Popup } from "react-map-gl";
import { Carousel } from "react-responsive-carousel";
import Image from "next/image";
import { ParsedUrlQuery } from "querystring";
import { space_grotesk } from "@/util/fonts";
import Input from "@/components/Input";
import { DebounceInput } from "react-debounce-input";
import Head from "next/head";
import NoImage from "@/components/NoImage";

export const getServerSideProps: GetServerSideProps = async ({ query, locale }) => {
    return {
        props: {
            messages: (await import(`../locales/${locale || "hr"}.json`)).default,
            query,
        },
    };
};

interface MapScreenProps {
    query: ParsedUrlQuery;
}
export default function MapScreen({ query }: MapScreenProps) {
    const [queryCopy, setQueryCopy] = useState(query);
    const queryCopyLat = typeof queryCopy.lat === "string" ? parseFloat(queryCopy.lat) : null;
    const queryCopyLon = typeof queryCopy.lon === "string" ? parseFloat(queryCopy.lon) : null;
    const t = useTranslations("Map");

    const [properties, setProperties] = useState<ListingBasic[]>([]);
    const [hoveredProperty, setHoveredProperty] = useState<null | string>(null);
    const [openProperty, setOpenProperty] = useState<ListingBasic | null>(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const [filterApartments, setFilterApartments] = useState(
        !!queryCopy?.propertyTypes?.includes(PropertyType.apartment)
    );
    const [filterHouses, setFilterHouses] = useState(
        !!queryCopy?.propertyTypes?.includes(PropertyType.house)
    );
    const [filterLand, setFilterLand] = useState(
        !!queryCopy?.propertyTypes?.includes(PropertyType.land)
    );
    const [filterSale, setFilterSale] = useState(
        !!queryCopy?.offeringTypes?.includes(OfferingType.sale)
    );
    const [filterLongTermRent, setFilterLongTermRent] = useState(
        !!queryCopy?.offeringTypes?.includes(OfferingType.longTermRent)
    );
    const [filterShortTermRent, setFilterShortTermRent] = useState(
        !!queryCopy?.offeringTypes?.includes(OfferingType.shortTermRent)
    );

    const [priceFrom, setPriceFrom] = useState<string | undefined>(
        isNaN(queryCopy?.priceFrom as any)
            ? undefined
            : Array.isArray(queryCopy?.priceFrom)
            ? undefined
            : queryCopy?.priceFrom
    );
    const [priceTo, setPriceTo] = useState<string | undefined>(
        isNaN(queryCopy?.priceTo as any)
            ? undefined
            : Array.isArray(queryCopy?.priceTo)
            ? undefined
            : queryCopy?.priceTo
    );

    const [mapBounds, setMapBounds] = useState<LngLatBounds>();
    const [isSearchInProgress, setIsSearchInProgress] = useState(false);

    async function searchProperties() {
        if (!mapBounds) {
            return;
        }
        setIsSearchInProgress(true);
        try {
            let allParams = queryCopy ? { ...queryCopy } : {};

            let propertyTypes = [];
            if (filterApartments) {
                propertyTypes.push(PropertyType.apartment);
            }
            if (filterHouses) {
                propertyTypes.push(PropertyType.house);
            }
            if (filterLand) {
                propertyTypes.push(PropertyType.land);
            }
            let offeringTypes: OfferingType[] = [];
            if (filterSale) {
                offeringTypes.push(OfferingType.sale);
            }
            if (filterLongTermRent) {
                offeringTypes.push(OfferingType.longTermRent);
            }
            if (filterShortTermRent) {
                offeringTypes.push(OfferingType.shortTermRent);
            }

            if (priceFrom && priceFrom.length > 0 && !isNaN(priceFrom as any)) {
                allParams.priceFrom = priceFrom;
            } else {
                delete allParams.priceFrom;
            }
            if (priceTo && priceTo.length > 0 && !isNaN(priceTo as any)) {
                allParams.priceTo = priceTo;
            } else {
                delete allParams.priceTo;
            }

            if (propertyTypes.length === 0) {
                propertyTypes = [PropertyType.apartment, PropertyType.house, PropertyType.land];
            }
            if (offeringTypes.length === 0) {
                offeringTypes = [
                    OfferingType.sale,
                    OfferingType.longTermRent,
                    OfferingType.shortTermRent,
                ];
            }
            const { data } = await findListingsByBoundingBox(
                {
                    nwlng: mapBounds.getNorthWest().lng,
                    nwlat: mapBounds.getNorthWest().lat,
                    selng: mapBounds.getSouthEast().lng,
                    selat: mapBounds.getSouthEast().lat,
                },
                propertyTypes,
                offeringTypes,
                priceFrom,
                priceTo
            );

            // Restart to first page when filter changes
            delete allParams.page;
            setQueryCopy({ ...allParams, propertyTypes, offeringTypes });

            // VERY IMPORTANT!!!
            // This forces the properties with smaller price tags to be rendered in front of the properties with larger tags
            // Otherwise the larger tags would hide the smaller tags and cheaper properties would never be seen
            setProperties(
                data.sort((p1, p2) => {
                    return p2.price - p1.price;
                })
            );
        } catch (err) {
            console.error(err);
        } finally {
            setIsSearchInProgress(false);
        }
    }

    function getPropertyLat(p: ListingBasic) {
        if (p.apartment) {
            return p.apartment.latitude;
        } else if (p.house) {
            return p.house.latitude;
        } else {
            return p.land!.latitude;
        }
    }

    function getPropertyLng(p: ListingBasic) {
        if (p.apartment) {
            return p.apartment.longitude;
        } else if (p.house) {
            return p.house.longitude;
        } else {
            return p.land!.longitude;
        }
    }

    function getPropertyMedia(p: ListingBasic) {
        if (p.apartment) {
            return p.apartment.media;
        } else if (p.house) {
            return p.house.media;
        } else {
            return p.land!.media;
        }
    }

    function getPriceString(p: ListingBasic) {
        if (p.offeringType === OfferingType.shortTermRent) {
            return ` ${t("per-night")}`;
        } else if (p.offeringType === OfferingType.longTermRent) {
            return ` ${t("per-month")}`;
        }
    }

    function onPropertyOpen(p: ListingBasic) {
        if (openProperty) {
            setOpenProperty(null);
            setTimeout(() => {
                setOpenProperty(p);
            }, 200);
        } else {
            setOpenProperty(p);
        }
    }

    function onPropertyClose() {
        setOpenProperty(null);
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

    React.useEffect(() => {
        if (!isSearchInProgress) {
            searchProperties();
        }
    }, [
        filterApartments,
        filterHouses,
        filterLand,
        filterSale,
        filterLongTermRent,
        filterShortTermRent,
        mapBounds,
        priceFrom,
        priceTo,
    ]);

    return (
        <>
            <Head>
                <title>Imovinko - Karta</title>
                <meta name="description" content="Imovinko - oglasi na karti." />
                <meta
                    name="keywords"
                    content="oglasnik, nekretnina, kuća, stan, zemljište, kupovina, prodaja, najam, karta"
                />
            </Head>
            <header className="z-30">
                <Navbar lighterSearchbar />
            </header>
            <main>
                <div className="fixed top-0 left-0 w-screen h-screen flex">
                    <Map
                        className="flex-1"
                        onBoundsChange={setMapBounds}
                        centerLat={queryCopyLat || undefined}
                        centerLon={queryCopyLon || undefined}
                        scrollZoom={true}
                        navigationControlStyle={{
                            marginTop: "6rem",
                        }}
                    >
                        {openProperty && (
                            <Popup
                                closeButton={false}
                                style={{
                                    padding: 0,
                                    width: "35vw",
                                    maxWidth: "420px",
                                }}
                                anchor="top"
                                latitude={getPropertyLat(openProperty)}
                                longitude={getPropertyLng(openProperty)}
                                onClose={() => setOpenProperty(null)}
                                closeOnClick={false}
                                className={`${
                                    openProperty ? "opacity-100" : "opacity-0"
                                } transition-all duration-300 z-30`}
                            >
                                <div className="w-full relative">
                                    <div className="absolute top-2 left-2 z-50">
                                        <Button.Transparent
                                            className="group bg-white hover:bg-zinc-200 !p-1.5"
                                            onClick={() => {
                                                // TODO: Implement
                                                console.log("Implement me");
                                            }}
                                        >
                                            <Icon name="heart" height={20} width={20} />
                                        </Button.Transparent>
                                    </div>
                                    <div className="absolute top-2 right-2 z-50">
                                        <Button.Transparent
                                            className="group bg-white hover:bg-zinc-200 !p-1.5"
                                            onClick={() => onPropertyClose()}
                                        >
                                            <Icon name="close" height={20} width={20} />
                                        </Button.Transparent>
                                    </div>
                                    {getPropertyMedia(openProperty).length === 0 ? (
                                        <div
                                            className="select-none relative min-w-full flex items-center justify-center bg-zinc-200"
                                            style={{
                                                height: "28vh",
                                                maxHeight: "300px",
                                            }}
                                        >
                                            <NoImage />
                                        </div>
                                    ) : (
                                        <Carousel
                                            autoPlay={false}
                                            infiniteLoop={true}
                                            showThumbs={false}
                                            showStatus={false}
                                            swipeable={true}
                                            emulateTouch={true}
                                            className="w-full"
                                            renderArrowPrev={(onClickHandler) => {
                                                return (
                                                    <div className="absolute top-0 bottom-0 left-0 w-12 flex items-center justify-center z-30">
                                                        <button
                                                            onClick={onClickHandler}
                                                            className="rounded-full p-1.5 group"
                                                        >
                                                            <div className="rounded-full bg-white p-1 w-full group-hover:bg-zinc-200 transition-all">
                                                                <Icon
                                                                    name="left"
                                                                    height={20}
                                                                    width={20}
                                                                />
                                                            </div>
                                                        </button>
                                                    </div>
                                                );
                                            }}
                                            renderArrowNext={(onClickHandler) => {
                                                return (
                                                    <div className="absolute top-0 bottom-0 right-0 w-12 flex items-center justify-center z-30">
                                                        <button
                                                            onClick={onClickHandler}
                                                            className="rounded-full p-1.5 group"
                                                        >
                                                            <div className="rounded-full bg-white p-1 w-full group-hover:bg-zinc-200 transition-all">
                                                                <Icon
                                                                    name="right"
                                                                    height={20}
                                                                    width={20}
                                                                />
                                                            </div>
                                                        </button>
                                                    </div>
                                                );
                                            }}
                                        >
                                            {getPropertyMedia(openProperty).map((m) => {
                                                return (
                                                    <div
                                                        key={m.url}
                                                        className="select-none relative min-w-full"
                                                        style={{
                                                            height: "28vh",
                                                            maxHeight: "300px",
                                                        }}
                                                    >
                                                        <Image
                                                            src={m.url}
                                                            alt="media image"
                                                            fill
                                                            style={{
                                                                objectFit: "cover",
                                                            }}
                                                            quality={30}
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </Carousel>
                                    )}
                                </div>

                                <div className="pb-4 px-4">
                                    <div className="pb-1">
                                        <Typography variant="h1" className="mt-2">
                                            {openProperty.price.toLocaleString()} €{" "}
                                            <span className="text-sm font-normal">
                                                {getPriceString(openProperty)}
                                            </span>
                                        </Typography>
                                        <div>
                                            <Typography variant="secondary" uppercase>
                                                {getPropertyLocationString(openProperty)}
                                            </Typography>
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <Typography variant="h2" className="my-2">
                                            {openProperty.title}
                                        </Typography>
                                    </div>
                                    <div>
                                        <Link to={`/listing/${openProperty.prettyId}`}>
                                            <Button.Primary label={t("more-details")} />
                                        </Link>
                                    </div>
                                </div>
                            </Popup>
                        )}

                        <div className="relative">
                            {properties.map((p) => {
                                return (
                                    <Marker
                                        key={p.prettyId}
                                        longitude={getPropertyLng(p)}
                                        latitude={getPropertyLat(p)}
                                        anchor="bottom"
                                        style={{
                                            zIndex: hoveredProperty === p.prettyId ? "30" : "10",
                                            cursor: "pointer",
                                        }}
                                        onClick={() => onPropertyOpen(p)}
                                    >
                                        <div
                                            className="p-1 group"
                                            onMouseEnter={() => {
                                                setHoveredProperty(p.prettyId);
                                            }}
                                            onMouseLeave={() => {
                                                if (hoveredProperty) {
                                                    setHoveredProperty(null);
                                                }
                                            }}
                                        >
                                            <div className="bg-white p-1 rounded-xl group-hover:px-2 group-hover:py-1.5 transition-all shadow-sm border border-zinc-300">
                                                <Typography className="text-sm">
                                                    {p.price.toLocaleString()} €
                                                </Typography>
                                            </div>
                                        </div>
                                    </Marker>
                                );
                            })}
                        </div>
                    </Map>
                </div>

                <div className="absolute bottom-20 left-1/2 z-40 -translate-x-1/2">
                    <Link
                        to="/listings"
                        query={queryCopy}
                        className="relative bg-zinc-900 rounded-xl shadow-2xl flex flex-row space-x-1 px-5 py-3 hover:px-6 hover:py-4 transition-all"
                        disableAnimatedHover
                    >
                        <Icon name="list" className="stroke-zinc-50" />
                        <Typography className="text-zinc-50">{t("show-list")}</Typography>
                    </Link>
                </div>

                <div
                    className={`absolute top-32 bottom-0 md:bottom-32 left-0 transition-all rounded-t-xl md:rounded-b-xl overflow-hidden shadow-lg z-50 ${
                        isFilterOpen
                            ? "left-0 md:left-20 right-0 md:right-auto"
                            : "opacity-0 invisible top-64 md:top-32 right-0 md:right-auto"
                    }`}
                >
                    <div className="bg-zinc-100 w-full h-full flex flex-col px-2 overflow-y-auto">
                        <div className="px-4 py-4">
                            <div className="flex flex-row justify-between items-center">
                                <Typography variant="h2">{t("filter")}</Typography>
                                <Button.Transparent
                                    onClick={() => {
                                        setIsFilterOpen(false);
                                    }}
                                >
                                    <Icon name="close" />
                                </Button.Transparent>
                            </div>

                            <div className="w-full mt-8">
                                <Typography bold>{t("property-type")}</Typography>
                                <div className="w-full">
                                    <Input
                                        name={t("apartment")}
                                        type="checkbox"
                                        className="ml-2"
                                        checked={filterApartments}
                                        onCheckedChange={setFilterApartments}
                                    />
                                    <Input
                                        name={t("house")}
                                        type="checkbox"
                                        className="ml-2"
                                        checked={filterHouses}
                                        onCheckedChange={setFilterHouses}
                                    />
                                    <Input
                                        name={t("land")}
                                        type="checkbox"
                                        className="ml-2"
                                        checked={filterLand}
                                        onCheckedChange={setFilterLand}
                                    />
                                </div>
                            </div>

                            <div className="w-full mt-8">
                                <Typography bold>{t("offering-type")}</Typography>
                                <div className="w-full">
                                    <Input
                                        name={t("sale")}
                                        type="checkbox"
                                        className="ml-2"
                                        checked={filterSale}
                                        onCheckedChange={setFilterSale}
                                    />
                                    <Input
                                        name={t("long-term-rent")}
                                        type="checkbox"
                                        className="ml-2"
                                        checked={filterLongTermRent}
                                        onCheckedChange={setFilterLongTermRent}
                                    />
                                    <Input
                                        name={t("short-term-rent")}
                                        type="checkbox"
                                        className="ml-2"
                                        checked={filterShortTermRent}
                                        onCheckedChange={setFilterShortTermRent}
                                    />
                                </div>
                            </div>

                            <div className="mt-8">
                                <Typography bold>{t("price")}</Typography>
                                <div className="flex flex-row flex-wrap items-center ml-2">
                                    <div className="mt-2 border border-zinc-400 inline-flex flex-row px-2 py-1 rounded-md shadow-sm">
                                        <DebounceInput
                                            id="priceFrom"
                                            name="priceFrom"
                                            className={`bg-transparent outline-none border-none w-24 pr-1 ${space_grotesk.className}`}
                                            // value={priceFrom}
                                            debounceTimeout={1000}
                                            onChange={(e) => {
                                                setPriceFrom(e.target.value);
                                            }}
                                        />
                                        <label htmlFor="priceFrom">
                                            <Typography>€</Typography>
                                        </label>
                                    </div>
                                    <Typography className="mx-2 mt-2">{t("to")}</Typography>
                                    <div className="mt-2 border border-zinc-400 inline-flex flex-row px-2 py-1 rounded-md shadow-sm">
                                        <DebounceInput
                                            id="priceTo"
                                            name="priceTo"
                                            debounceTimeout={1000}
                                            className={`bg-transparent outline-none border-none w-24 pr-1 ${space_grotesk.className}`}
                                            // value={priceTo}
                                            onChange={(e) => {
                                                setPriceTo(e.target.value);
                                            }}
                                        />
                                        <label htmlFor="priceTo">
                                            <Typography>€</Typography>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 md:hidden">
                                <Button.Primary
                                    label={t("search")}
                                    onClick={() => {
                                        setIsFilterOpen(false);
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    className={`absolute ${
                        isSearchInProgress ? " top-20" : "top-0 -translate-y-full"
                    } left-1/2 translate-x-1/2 z-50 transition-all`}
                >
                    <div className="bg-zinc-50 rounded-2xl shadow-md p-3 flex flex-row space-x-2">
                        {/* <div
                            className="bg-zinc-900 p-1.5 w-2 h-2 shadow rounded-full animate-bounce blue-circle"
                            style={{
                                animationDelay: "0.1s",
                            }}
                        ></div>
                        <div
                            className="bg-zinc-900 p-1.5 w-2 h-2 shadow rounded-full animate-bounce green-circle"
                            style={{
                                animationDelay: "0.3s",
                            }}
                        ></div>
                        <div
                            className="bg-zinc-900 p-1.5 w-2 h-2 shadow rounded-full animate-bounce red-circle"
                            style={{
                                animationDelay: "0.5s",
                            }}
                        ></div> */}
                        <Icon name="loading" height={32} width={32} />
                    </div>
                </div>

                <div
                    className={`absolute top-32 left-0 z-50 transition-all ${
                        isFilterOpen && "opacity-0 invisible"
                    }`}
                >
                    <button
                        onClick={() => {
                            setIsFilterOpen(!isFilterOpen);
                        }}
                        className={`bg-zinc-900 transition-all rounded-r-xl shadow-2xl flex flex-row space-x-1 px-5 py-3 hover:px-6 hover:py-4`}
                    >
                        <Icon name="filter" className="fill-zinc-50" />
                        <Typography className="text-zinc-50 hidden md:block">
                            {t("show-filter")}
                        </Typography>
                    </button>
                </div>
            </main>
        </>
    );
}
