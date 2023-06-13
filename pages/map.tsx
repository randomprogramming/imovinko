import Map from "@/components/Map";
import Navbar from "@/components/Navbar";
import { findListingsByBoundingBox } from "@/util/api";
import type { LngLatBounds } from "mapbox-gl";
import { NextPageContext } from "next";
import React from "react";

export async function getStaticProps(context: NextPageContext) {
    return {
        props: {
            messages: (await import(`../locales/${context.locale || "hr"}.json`)).default,
        },
    };
}

export default function MapScreen() {
    async function onMapBoundsChange(newBounds: LngLatBounds) {
        await findListingsByBoundingBox({
            nwlng: newBounds.getNorthWest().lng,
            nwlat: newBounds.getNorthWest().lat,
            selng: newBounds.getSouthEast().lng,
            selat: newBounds.getSouthEast().lat,
        });
    }

    return (
        <>
            <header className="z-30">
                <Navbar />
            </header>
            <main className="absolute w-screen h-screen flex">
                <Map className="flex-1" onBoundsChange={onMapBoundsChange} />
            </main>
        </>
    );
}
