import React, { useRef, useState, useEffect } from "react";
import mapboxgl, { GeoJSONSource } from "mapbox-gl";
import Icon from "./Icon";
import Input from "./Input";
import Typography from "./Typography";
import { useTranslations } from "next-intl";
import {
    Coordinates,
    TravelingMethods,
    geocode,
    getDirectionsForCoordinates,
    retrieveSuggestedFeature,
} from "@/util/api";
import MapComponent, { MapRef, Marker, NavigationControl } from "react-map-gl";

const MARKER_SIZE = 64;
const STARTING_LON = 15.9819;
const STARTING_LAT = 45.815;
const STARTING_ZOOM = 10;

interface MapProps {
    showSearchBox?: boolean;
    showCenterMarker?: boolean;
    className?: string;
    style?: React.CSSProperties;
    onCenterChange?(coords: Coordinates): void;
    onBoundsChange?(bounds: mapboxgl.LngLatBounds): void;
    children?: React.ReactNode;
    centerLat?: number;
    centerLon?: number;
    zoom?: number;
    onLoad?(): void;
    directionsPlaceMapboxId?: string; // mapbox_id of the place to which the map should show directions
    directionsPlaceName?: string;
    travelingMethod?: TravelingMethods;
    scrollZoom?: boolean;
    navigationControlStyle?: React.CSSProperties;
    onDirectionsLoad?(
        distanceMeters: number | string | null,
        lengthSeconds: number | string | null
    ): void;
}
export default function Map({
    className,
    showCenterMarker,
    style,
    onCenterChange,
    showSearchBox,
    onBoundsChange,
    children,
    centerLat,
    centerLon,
    zoom,
    onLoad,
    directionsPlaceMapboxId,
    directionsPlaceName,
    travelingMethod,
    navigationControlStyle,
    onDirectionsLoad,
    scrollZoom = false,
}: MapProps) {
    const t = useTranslations("Map");

    const map = useRef<MapRef>(null);

    const [query, setQuery] = useState("");
    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const [isLoadingDirections, setIsLoadingDirections] = useState(false);
    const [directions, setDirections] = useState<{
        placeId?: string;
        placeName?: string;
        lon?: number;
        lat?: number;
        totalDurationSeconds?: number;
        durationMinutes?: number;
        durationHours?: number;
        distanceMeters?: number;
    }>({
        placeId: directionsPlaceMapboxId,
        placeName: directionsPlaceName,
    });

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

    function meterToKM(meters: number) {
        const km = meters / 1000;
        return km.toFixed(1);
    }

    function secondsToHours(seconds: number) {
        const totalMinutes = Math.floor(seconds / 60);

        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        return { h: hours, m: minutes };
    }

    function renderIconForTravelingMethod(method?: TravelingMethods) {
        switch (method) {
            case TravelingMethods.walking:
                return <Icon name="walking" />;
            case TravelingMethods.cycling:
                return <Icon name="cycling" />;
            case TravelingMethods.traffic:
                return <Icon name="traffic" />;
            default:
                return <Icon name="car" />;
        }
    }

    function drawDirections(directions: any, start: Coordinates, end: Coordinates) {
        if (!map) {
            console.error("Map ref not defined");
            return;
        }

        const mapboxMap = map.current?.getMap();
        if (!mapboxMap) {
            console.error("Can't get mapbox map...");
            return;
        }
        const data = directions.routes[0];
        const route = data.geometry.coordinates;
        const routeDuration = data.duration;
        const routeDistance = data.distance;

        const durations = secondsToHours(routeDuration);
        setDirections({
            ...directions,
            lat: end.lat,
            lon: end.lon,
            totalDurationSeconds: routeDuration,
            durationMinutes: durations.m,
            durationHours: durations.h,
            distanceMeters: routeDistance,
        });
        const existingRoute = mapboxMap.getSource("route") as GeoJSONSource | null;
        if (existingRoute) {
            existingRoute.setData({
                type: "Feature",
                properties: {},
                geometry: {
                    type: "LineString",
                    coordinates: route,
                },
            });
        } else {
            mapboxMap.addLayer({
                id: "route",
                type: "line",
                source: {
                    type: "geojson",
                    data: {
                        type: "Feature",
                        properties: {},
                        geometry: {
                            type: "LineString",
                            coordinates: route,
                        },
                    },
                },
                layout: {
                    "line-join": "round",
                    "line-cap": "round",
                },
                paint: {
                    "line-color": "#3b82f6",
                    "line-width": 6,
                    "line-opacity": 1,
                },
            });
        }
        mapboxMap.fitBounds(
            [
                [start.lon, start.lat],
                [end.lon, end.lat],
            ],
            { padding: 80, duration: 1500 }
        );
    }

    async function loadDirections() {
        if (!directionsPlaceMapboxId) {
            return;
        }
        try {
            setIsLoadingDirections(true);
            const resp = await retrieveSuggestedFeature(directionsPlaceMapboxId);
            if (Array.isArray(resp.data.features) && resp.data.features.length > 0) {
                const feature = resp.data.features[0];
                if (feature.geometry && feature.geometry.coordinates) {
                    if (centerLon && centerLat) {
                        const start = {
                            lon: centerLon,
                            lat: centerLat,
                        };
                        const end = {
                            lon: feature.geometry.coordinates[0],
                            lat: feature.geometry.coordinates[1],
                        };
                        const directionsResp = await getDirectionsForCoordinates(
                            start,
                            end,
                            travelingMethod || TravelingMethods.driving
                        );
                        drawDirections(directionsResp.data, start, end);
                        if (onDirectionsLoad) {
                            const data = directionsResp.data.routes[0];
                            const routeDuration = data.duration;
                            const routeDistance = data.distance;
                            onDirectionsLoad(routeDistance, routeDuration);
                        }
                    }
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoadingDirections(false);
        }
    }

    useEffect(() => {
        loadDirections();
    }, [directionsPlaceMapboxId, travelingMethod]);

    return (
        <div className={`${className} overflow-hidden`} style={style}>
            <MapComponent
                onLoad={() => {
                    setIsMapLoaded(true);
                    onLoad && onLoad();
                    // This triggers the "onmoveend" callback when the map first renders
                    map.current?.flyTo({
                        center: [centerLon || STARTING_LON, centerLat || STARTING_LAT],
                        zoom: zoom || STARTING_ZOOM,
                        duration: 0,
                    });
                }}
                ref={map}
                mapLib={mapboxgl}
                initialViewState={{
                    longitude: centerLon || STARTING_LON,
                    latitude: centerLat || STARTING_LAT,
                    zoom: zoom || STARTING_ZOOM,
                }}
                style={{
                    height: "100%",
                    width: "100%",
                }}
                mapboxAccessToken={process.env["NEXT_PUBLIC_MAPBOX_API_KEY"]}
                mapStyle="mapbox://styles/randomprogramming/climaebcr00ky01pg146a2z67"
                onMoveEnd={onMoveEnd}
                scrollZoom={scrollZoom}
            >
                <NavigationControl style={navigationControlStyle} />
                {directionsPlaceMapboxId && (
                    <div
                        className="absolute top-2 left-2 bg-zinc-50 rounded shadow p-2 text-base"
                        style={{
                            maxWidth: "230px",
                        }}
                    >
                        {isLoadingDirections ? (
                            <div className="flex flex-row">
                                <Icon name="loading" />
                                <Typography className="ml-2">{t("loading-directions")}</Typography>
                            </div>
                        ) : (
                            <div>
                                <div>
                                    <div className="flex flex-row">
                                        <Icon name="location" />
                                        <Typography bold className="ml-2">
                                            {t("destination")}:
                                        </Typography>
                                    </div>
                                    <Typography>
                                        {directionsPlaceName + " "}
                                        {typeof directions.distanceMeters === "number" && (
                                            <Typography variant="span" bold>
                                                ({meterToKM(directions.distanceMeters)} km)
                                            </Typography>
                                        )}
                                    </Typography>
                                    <div className="flex flex-row items-center space-x-2">
                                        {renderIconForTravelingMethod(travelingMethod)}{" "}
                                        <Typography className="text-blue-500">
                                            {typeof directions.durationHours === "number" &&
                                                directions.durationHours > 0 && (
                                                    <Typography variant="span" bold>
                                                        {directions.durationHours} hr{" "}
                                                    </Typography>
                                                )}
                                            {typeof directions.durationMinutes === "number" &&
                                                directions.durationMinutes > 0 && (
                                                    <Typography variant="span" bold>
                                                        {directions.durationMinutes} min{" "}
                                                    </Typography>
                                                )}
                                        </Typography>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
                {directions.lat && directions.lon && (
                    <Marker latitude={directions.lat} longitude={directions.lon}>
                        <div className="w-4 h-4 bg-zinc-50 rounded-full flex items-center justify-center relative shadow">
                            <div className="w-2.5 h-2.5 bg-zinc-900 rounded-full"></div>
                        </div>
                    </Marker>
                )}
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
                {children}
            </MapComponent>
        </div>
    );
}
