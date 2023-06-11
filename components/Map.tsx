import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import Icon from "./Icon";
import Input from "./Input";
import Typography from "./Typography";
import { useTranslations } from "next-intl";
import { Coordinates, geocode } from "@/util/api";

const MARKER_SIZE = 64;

interface MapProps {
    showSearchBox?: boolean;
    showCenterMarker?: boolean;
    className?: string;
    style?: React.CSSProperties;
    onChange?(coords: Coordinates): void;
}
export default function Map({
    className,
    showCenterMarker,
    style,
    onChange,
    showSearchBox,
}: MapProps) {
    const t = useTranslations("Map");

    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<null | mapboxgl.Map>(null);

    const [query, setQuery] = useState("");

    async function searchLocation() {
        try {
            const response = await geocode(query);

            if (response.data) {
                map.current?.flyTo({
                    center: [response.data.lon, response.data.lat],
                    zoom: 18,
                    duration: 2000,
                });
            }
        } catch (e) {}
    }

    useEffect(() => {
        // initialize map only once
        if (map.current || !mapContainer.current) return;

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: "mapbox://styles/randomprogramming/climaebcr00ky01pg146a2z67",
            center: [15.9819, 45.815], // Zagreb
            zoom: 10,
            accessToken: process.env["NEXT_PUBLIC_MAPBOX_API_KEY"] || "",
        });

        map.current.on("moveend", () => {
            if (onChange) {
                const center = map.current?.getCenter();
                if (center?.lat && center.lng) {
                    onChange({
                        lat: center.lat,
                        lon: center.lng,
                    });
                }
            }
        });
    }, []);

    return (
        <div ref={mapContainer} className={`${className}`} style={style}>
            {/* TODO: Before loading the map, hide the marker, otherwise it flashes in the middle of the screen for a second */}
            {showCenterMarker && (
                <div
                    className="absolute top-1/2 left-1/2 z-30 select-none pointer-events-none"
                    style={{
                        marginTop: `-${MARKER_SIZE}px`, // The center of the map is actually at the bottom of the pointer
                        marginLeft: `-${MARKER_SIZE / 2}px`,
                    }}
                >
                    <Icon name="marker" width={`${MARKER_SIZE}px`} height={`${MARKER_SIZE}px`} />
                </div>
            )}
            {showSearchBox && (
                <div className="absolute top-4 left-4 z-30 flex flex-row">
                    <Input
                        small
                        className="!rounded-tr-none !rounded-br-none"
                        placeholder="Vukovarska ul. 34"
                        value={query}
                        onChange={setQuery}
                    />
                    <button
                        onClick={searchLocation}
                        className="bg-zinc-900 text-white rounded-tr-sm rounded-br-sm px-2"
                    >
                        <Typography>{t("search")}</Typography>
                    </button>
                </div>
            )}
        </div>
    );
}
