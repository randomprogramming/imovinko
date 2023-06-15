import Map from "@/components/Map";
import Navbar from "@/components/Navbar";
import Typography from "@/components/Typography";
import { findListingsByBoundingBox } from "@/util/api";
import type { LngLatBounds } from "mapbox-gl";
import { NextPageContext } from "next";
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
    const [properties, setProperties] = useState<any[]>([]);
    const [hoveredProperty, setHoveredProperty] = useState<null | string>(null);

    async function onMapBoundsChange(newBounds: LngLatBounds) {
        const { data } = await findListingsByBoundingBox({
            nwlng: newBounds.getNorthWest().lng,
            nwlat: newBounds.getNorthWest().lat,
            selng: newBounds.getSouthEast().lng,
            selat: newBounds.getSouthEast().lat,
        });

        if (Array.isArray(data)) {
            // VERY IMPORTANT!!!
            // This forces the properties with smaller price tags to be rendered in front of the properties with larger tags
            // Otherwise the larger tags would hide the smaller tags and cheaper properties would never be seen
            setProperties(
                data.sort((p1, p2) => {
                    return p2.price - p1.price;
                })
            );
        }
    }

    return (
        <>
            <header className="z-30">
                <Navbar />
            </header>
            <main className="absolute w-screen h-screen flex">
                <Map className="flex-1" onBoundsChange={onMapBoundsChange}>
                    <div className="relative">
                        {properties.map((p) => {
                            return (
                                <Marker
                                    key={p.id}
                                    longitude={p.apartment.longitude}
                                    latitude={p.apartment.latitude}
                                    anchor="bottom"
                                    style={{
                                        zIndex: hoveredProperty === p.id ? "30" : "10",
                                    }}
                                    // style={{
                                    //     zIndex: p.price > 200 ? "20" : "10",
                                    // }}
                                    // onClick={(e) => {
                                    //     // If we let the click event propagates to the map, it will immediately close the popup
                                    //     // with `closeOnClick: true`
                                    //     e.originalEvent.stopPropagation();
                                    //     setPopupInfo(city);
                                    // }}
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
                                                {(p.price as number).toLocaleString()} €
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
