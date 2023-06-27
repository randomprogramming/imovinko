import Button from "@/components/Button";
import Icon from "@/components/Icon";
import Link from "@/components/Link";
import Map from "@/components/Map";
import Navbar from "@/components/Navbar";
import Typography from "@/components/Typography";
import { ListingOnMap, OfferingType, PropertyType, findListingsByBoundingBox } from "@/util/api";
import { LngLatBounds } from "mapbox-gl";
import { GetServerSideProps } from "next";
import { useTranslations } from "next-intl";
import React, { useState } from "react";
import { Marker, Popup } from "react-map-gl";
import { Carousel } from "react-responsive-carousel";
import Image from "next/image";
import Select, { components } from "react-select";
import { ParsedUrlQuery } from "querystring";

export const getServerSideProps: GetServerSideProps = async ({ locale, query }) => {
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
    const queryLat = typeof query.lat === "string" ? parseFloat(query.lat) : null;
    const queryLon = typeof query.lon === "string" ? parseFloat(query.lon) : null;
    const t = useTranslations("Map");

    const offeringTypeDropdownValues = [
        { value: OfferingType.sale, label: t("for-sale") },
        { value: OfferingType.longTermRent, label: t("long-term-rent") },
        { value: OfferingType.shortTermRent, label: t("short-term-rent") },
    ];
    const propertyValueDropdownValues = [
        { value: PropertyType.house, label: t("house") },
        { value: PropertyType.apartment, label: t("apartment") },
        { value: PropertyType.land, label: t("land") },
    ];

    const [properties, setProperties] = useState<ListingOnMap[]>([]);
    const [hoveredProperty, setHoveredProperty] = useState<null | string>(null);
    const [openProperty, setOpenProperty] = useState<ListingOnMap | null>(null);

    const [propertyTypeDropdownSelectedValues, setPropertyTypeDropdownSelectedValues] = useState(
        propertyValueDropdownValues
    );
    const [offeringTypeDropdownSelectedValues, setOfferingTypeDropdownSelectedValues] = useState(
        offeringTypeDropdownValues
    );
    const [mapBounds, setMapBounds] = useState<LngLatBounds>();
    const [isSearchInProgress, setIsSearchInProgress] = useState(false);

    async function searchProperties() {
        if (!mapBounds) {
            return;
        }
        setIsSearchInProgress(true);
        try {
            const { data } = await findListingsByBoundingBox(
                {
                    nwlng: mapBounds.getNorthWest().lng,
                    nwlat: mapBounds.getNorthWest().lat,
                    selng: mapBounds.getSouthEast().lng,
                    selat: mapBounds.getSouthEast().lat,
                },
                propertyTypeDropdownSelectedValues.map((p) => p.value),
                offeringTypeDropdownSelectedValues.map((p) => p.value)
            );

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

    function getPropertyLat(p: ListingOnMap) {
        if (p.apartment) {
            return p.apartment.latitude;
        } else if (p.house) {
            return p.house.latitude;
        } else {
            return p.land!.latitude;
        }
    }

    function getPropertyLng(p: ListingOnMap) {
        if (p.apartment) {
            return p.apartment.longitude;
        } else if (p.house) {
            return p.house.longitude;
        } else {
            return p.land!.longitude;
        }
    }

    function getPropertyMedia(p: ListingOnMap) {
        if (p.apartment) {
            return p.apartment.media;
        } else if (p.house) {
            return p.house.media;
        } else {
            return p.land!.media;
        }
    }

    function getPriceString(p: ListingOnMap) {
        if (p.offeringType === OfferingType.shortTermRent) {
            return ` ${t("per-night")}`;
        } else if (p.offeringType === OfferingType.longTermRent) {
            return ` ${t("per-month")}`;
        }
    }

    function onPropertyOpen(p: ListingOnMap) {
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

    function getPropertyLocationString(p: ListingOnMap) {
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
    }, [propertyTypeDropdownSelectedValues, offeringTypeDropdownSelectedValues, mapBounds]);

    return (
        <>
            <header className="z-30">
                <Navbar lighterSearchbar />
            </header>
            <main>
                <div className="relative z-30">
                    <div className="container mx-auto flex flex-row flex-wrap">
                        <div className="mx-4 mt-2">
                            <Select
                                onChange={(val) => {
                                    setPropertyTypeDropdownSelectedValues([...val]);
                                }}
                                isMulti
                                isSearchable={false}
                                closeMenuOnSelect={false}
                                components={{
                                    Placeholder: ({ children, ...props }) => {
                                        return (
                                            <components.Placeholder {...props}>
                                                <Typography>
                                                    {t("property") + ": " + t("select") + "..."}
                                                </Typography>
                                            </components.Placeholder>
                                        );
                                    },
                                    ValueContainer: ({ children, ...props }) => {
                                        return (
                                            <components.ValueContainer {...props}>
                                                {props.hasValue && (
                                                    <Typography className="mr-1">
                                                        {t("property") + ": "}
                                                    </Typography>
                                                )}
                                                {children}
                                            </components.ValueContainer>
                                        );
                                    },
                                    MultiValue: ({ children, ...props }) => {
                                        return (
                                            <components.MultiValue
                                                {...props}
                                                className="flex items-center justify-center"
                                            >
                                                <Typography>{children}</Typography>
                                            </components.MultiValue>
                                        );
                                    },
                                }}
                                noOptionsMessage={() => {
                                    return <Typography>{t("no-option")}</Typography>;
                                }}
                                classNames={{
                                    control() {
                                        return "!rounded-xl bg-zinc-50 p-2 shadow-md";
                                    },
                                    multiValueRemove() {
                                        return "!p-2";
                                    },
                                    multiValue() {
                                        return "!rounded-lg";
                                    },
                                }}
                                defaultValue={propertyTypeDropdownSelectedValues}
                                options={propertyValueDropdownValues}
                            />
                        </div>
                        <div className="mx-4 mt-2">
                            <Select
                                isMulti
                                isSearchable={false}
                                closeMenuOnSelect={false}
                                noOptionsMessage={() => {
                                    return <Typography>{t("no-option")}</Typography>;
                                }}
                                components={{
                                    Placeholder: ({ children, ...props }) => {
                                        return (
                                            <components.Placeholder {...props}>
                                                <Typography className="mr-1">
                                                    {t("type") + ": " + t("select") + "..."}
                                                </Typography>
                                            </components.Placeholder>
                                        );
                                    },
                                    ValueContainer: ({ children, ...props }) => {
                                        return (
                                            <components.ValueContainer {...props}>
                                                {props.hasValue && (
                                                    <Typography className="mr-1">
                                                        {t("type") + ": "}
                                                    </Typography>
                                                )}
                                                {children}
                                            </components.ValueContainer>
                                        );
                                    },
                                    MultiValue: ({ children, ...props }) => {
                                        return (
                                            <components.MultiValue
                                                {...props}
                                                className="flex items-center justify-center"
                                            >
                                                <Typography>{children}</Typography>
                                            </components.MultiValue>
                                        );
                                    },
                                }}
                                onChange={(newval) => {
                                    setOfferingTypeDropdownSelectedValues([...newval]);
                                }}
                                classNames={{
                                    control() {
                                        return "!rounded-xl bg-zinc-50 p-2 shadow-md";
                                    },
                                    multiValueRemove() {
                                        return "!p-2";
                                    },
                                    multiValue() {
                                        return "!rounded-lg";
                                    },
                                }}
                                defaultValue={offeringTypeDropdownSelectedValues}
                                options={offeringTypeDropdownValues}
                            />
                        </div>
                    </div>
                </div>
                <div className="fixed top-0 left-0 w-screen h-screen flex">
                    <Map
                        className="flex-1"
                        onBoundsChange={setMapBounds}
                        centerLat={queryLat || undefined}
                        centerLon={queryLon || undefined}
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
                                } transition-all duration-300`}
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
                                                        // Since this is just a thumbnail, we can lower the quality
                                                        quality={30}
                                                    />
                                                </div>
                                            );
                                        })}
                                    </Carousel>
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
            </main>
        </>
    );
}
