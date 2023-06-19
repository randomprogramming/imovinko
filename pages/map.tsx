import Button from "@/components/Button";
import Icon from "@/components/Icon";
import Link from "@/components/Link";
import Map from "@/components/Map";
import Navbar from "@/components/Navbar";
import Typography from "@/components/Typography";
import { ListingOnMap, OfferingType, findListingsByBoundingBox } from "@/util/api";
import type { LngLatBounds } from "mapbox-gl";
import { NextPageContext } from "next";
import { useTranslations } from "next-intl";
import React, { useState } from "react";
import { Marker, Popup } from "react-map-gl";
import { Carousel } from "react-responsive-carousel";
import Image from "next/image";

export async function getStaticProps(context: NextPageContext) {
    return {
        props: {
            messages: (await import(`../locales/${context.locale || "hr"}.json`)).default,
        },
    };
}

export default function MapScreen() {
    const t = useTranslations("Map");

    const [properties, setProperties] = useState<ListingOnMap[]>([]);
    const [hoveredProperty, setHoveredProperty] = useState<null | string>(null);
    const [openProperty, setOpenProperty] = useState<ListingOnMap | null>(null);

    async function onMapBoundsChange(newBounds: LngLatBounds) {
        try {
            const { data } = await findListingsByBoundingBox({
                nwlng: newBounds.getNorthWest().lng,
                nwlat: newBounds.getNorthWest().lat,
                selng: newBounds.getSouthEast().lng,
                selat: newBounds.getSouthEast().lat,
            });

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

    return (
        <>
            <header className="z-30">
                <Navbar />
            </header>
            <main className="absolute w-screen h-screen flex">
                <Map className="flex-1" onBoundsChange={onMapBoundsChange}>
                    {openProperty && (
                        <Popup
                            closeButton={false}
                            style={{
                                padding: 0,
                                width: "40vw",
                                maxWidth: "540px",
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
                                                        <Icon name="left" height={20} width={20} />
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
                                                        <Icon name="right" height={20} width={20} />
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
                                                    height: "30vh",
                                                    maxHeight: "512px",
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
                                    <div>Address</div>
                                </div>
                                <div className="flex-1">
                                    <Typography variant="h2" className="my-2">
                                        {openProperty.title}
                                    </Typography>
                                </div>
                                <div>
                                    <Link to={`/listing/${openProperty.id}`}>
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
                                    key={p.id}
                                    longitude={getPropertyLng(p)}
                                    latitude={getPropertyLat(p)}
                                    anchor="bottom"
                                    style={{
                                        zIndex: hoveredProperty === p.id ? "30" : "10",
                                        cursor: "pointer",
                                    }}
                                    onClick={() => onPropertyOpen(p)}
                                >
                                    <div
                                        className="p-1 group"
                                        onMouseEnter={() => {
                                            setHoveredProperty(p.id);
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
            </main>
        </>
    );
}
