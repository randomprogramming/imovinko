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
import { Marker } from "react-map-gl";

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

    function setOpenPropertyWithDelay(p: ListingOnMap) {
        if (openProperty) {
            setOpenProperty(null);
            setTimeout(() => {
                setOpenProperty(p);
            }, 200);
            return;
        }
        setOpenProperty(p);
    }

    function getPriceString(p: ListingOnMap) {
        if (p.offeringType === OfferingType.shortTermRent) {
            return ` ${t("per-night")}`;
        } else if (p.offeringType === OfferingType.longTermRent) {
            return ` ${t("per-month")}`;
        }
    }

    return (
        <>
            <header className="z-30">
                <Navbar />
            </header>
            <main className="absolute w-screen h-screen flex">
                <Map className="flex-1" onBoundsChange={onMapBoundsChange}>
                    <div
                        className={`absolute z-40 right-14 ${
                            openProperty
                                ? "top-24 visible flex flex-col"
                                : "top-full invisible hidden"
                        } transition-all duration-300 bottom-10 bg-zinc-100 w-0 hidden rounded-2xl shadow-xl md:flex md:w-1/3 lg:w-1/4 py-2 px-2`}
                    >
                        {openProperty && (
                            <div className="flex-1 flex flex-col">
                                <div className="relative">
                                    <div className="absolute top-1 left-1">
                                        <Button.Transparent
                                            className="group hover:bg-zinc-700"
                                            onClick={() => {
                                                // TODO: Implement
                                                console.log("Implement me");
                                            }}
                                        >
                                            <Icon
                                                name="heart"
                                                className="group-hover:stroke-white"
                                            />
                                        </Button.Transparent>
                                    </div>
                                    <img
                                        src={openProperty.apartment?.media.at(0)?.url}
                                        className="rounded-lg"
                                    />
                                    <div className="absolute top-1 right-1">
                                        <Button.Transparent
                                            className="group hover:bg-zinc-700"
                                            onClick={() => setOpenProperty(null)}
                                        >
                                            <Icon name="close" className="group-hover:fill-white" />
                                        </Button.Transparent>
                                    </div>
                                </div>
                                <div className="border-b-2 border-zinc-300 pb-2">
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
                                    <Typography>Description TODO: Implement me!!</Typography>
                                </div>
                                <div>
                                    <Link to={`/listing/${openProperty.id}`}>
                                        <Button.Primary label={"hello world"} />
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
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
                                    onClick={() => setOpenPropertyWithDelay(p)}
                                >
                                    {/* <Pin /> */}
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
                                        <div className="bg-white p-1 rounded-xl group-hover:px-2 group-hover:py-1.5 transition-all shadow-lg border border-zinc-300">
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
