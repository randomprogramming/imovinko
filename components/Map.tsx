import React, { useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import Icon from "./Icon";
import Input from "./Input";
import Typography from "./Typography";
import { useTranslations } from "next-intl";
import { Coordinates, geocode } from "@/util/api";
import MapComponent, { MapRef } from "react-map-gl";

const MARKER_SIZE = 64;

interface MapProps {
    showSearchBox?: boolean;
    showCenterMarker?: boolean;
    className?: string;
    style?: React.CSSProperties;
    onCenterChange?(coords: Coordinates): void;
    onBoundsChange?(bounds: mapboxgl.LngLatBounds): void;
}
export default function Map({
    className,
    showCenterMarker,
    style,
    onCenterChange,
    showSearchBox,
    onBoundsChange,
}: MapProps) {
    const t = useTranslations("Map");

    const map = useRef<MapRef>(null);

    const [query, setQuery] = useState("");
    const [isMapLoaded, setIsMapLoaded] = useState(false);

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
        } catch (e) {
            console.error(e);
        }
    }

    function onMoveEnd() {
        if (onCenterChange) {
            const center = map.current?.getCenter();
            if (center?.lat && center?.lng) {
                onCenterChange({
                    lat: center.lat,
                    lon: center.lng,
                });
            }
        }
        if (onBoundsChange) {
            const bounds = map.current?.getBounds();
            if (bounds) {
                onBoundsChange(bounds);
            }
        }
    }

    return (
        <div className={`${className} overflow-hidden`} style={style}>
            <MapComponent
                onLoad={() => setIsMapLoaded(true)}
                ref={map}
                mapLib={mapboxgl}
                initialViewState={{
                    longitude: 15.9819,
                    latitude: 45.815,
                    zoom: 10,
                }}
                style={{
                    height: "100%",
                    width: "100%",
                }}
                mapboxAccessToken={process.env["NEXT_PUBLIC_MAPBOX_API_KEY"]}
                mapStyle="mapbox://styles/randomprogramming/climaebcr00ky01pg146a2z67"
                onMoveEnd={onMoveEnd}
            >
                {showCenterMarker && isMapLoaded && (
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
                )}
                {showSearchBox && isMapLoaded && (
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
            </MapComponent>
        </div>
    );
}
