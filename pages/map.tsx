import Button from "@/components/Button";
import Icon from "@/components/Icon";
import Link from "@/components/Link";
import Map, { DEFAULT_ZOOM, MapStyle } from "@/components/Map";
import Navbar from "@/components/Navbar";
import Typography from "@/components/Typography";
import {
    FurnitureState,
    ListingBasic,
    OfferingType,
    PropertyType,
    findListingsByBoundingBox,
} from "@/util/api";
import { LngLatBounds } from "mapbox-gl";
import { GetServerSideProps } from "next";
import { useTranslations } from "next-intl";
import React, { useId, useState } from "react";
import { Marker, Popup } from "react-map-gl";
import { Carousel } from "react-responsive-carousel";
import Image from "next/image";
import { ParsedUrlQuery } from "querystring";
import { space_grotesk } from "@/util/fonts";
import Input from "@/components/Input";
import { DebounceInput } from "react-debounce-input";
import Head from "next/head";
import NoImage from "@/components/NoImage";
import SaveListingIcon from "@/components/SaveListingIcon";
import IconRow from "@/components/listing/IconRow";
import { useRouter } from "next/router";
import { formatPrice } from "@/util/listing";
import Select from "react-select";

export const getServerSideProps: GetServerSideProps = async ({ query, locale }) => {
    return {
        props: {
            messages: (await import(`../locales/${locale || "hr"}.json`)).default,
            query,
        },
    };
};

enum TriBoolean {
    unselected,
    yes,
    no,
}

interface MapScreenProps {
    query: ParsedUrlQuery;
}
export default function MapScreen({ query }: MapScreenProps) {
    const [queryCopy, setQueryCopy] = useState(query);
    const t = useTranslations("Map");

    const router = useRouter();

    const triBooleanDropdownValues = {
        unselected: { label: "-", value: TriBoolean.unselected },
        yes: { label: t("yes"), value: TriBoolean.yes },
        no: { label: t("no"), value: TriBoolean.no },
    };

    const [locationLat, setLocationLat] = useState(
        typeof queryCopy.lat === "string" ? parseFloat(queryCopy.lat) : null
    );
    const [locationLon, setLocationLon] = useState(
        typeof queryCopy.lon === "string" ? parseFloat(queryCopy.lon) : null
    );
    const [lightIcons, setLightIcons] = useState(false);
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
    const [pricePerSquareMeterFrom, setPricePerSquareMeterFrom] = useState<string | undefined>(
        isNaN(queryCopy?.pricePerSquareMeterFrom as any)
            ? undefined
            : Array.isArray(queryCopy?.pricePerSquareMeterFrom)
            ? undefined
            : queryCopy?.pricePerSquareMeterFrom
    );
    const [pricePerSquareMeterTo, setPricePerSquareMeterTo] = useState<string | undefined>(
        isNaN(queryCopy?.pricePerSquareMeterTo as any)
            ? undefined
            : Array.isArray(queryCopy?.pricePerSquareMeterTo)
            ? undefined
            : queryCopy?.pricePerSquareMeterTo
    );
    const [areaFrom, setareaFrom] = useState<string | undefined>(
        isNaN(queryCopy?.areaFrom as any)
            ? undefined
            : Array.isArray(queryCopy?.areaFrom)
            ? undefined
            : queryCopy?.areaFrom
    );

    const [areaTo, setareaTo] = useState<string | undefined>(
        isNaN(queryCopy?.areaTo as any)
            ? undefined
            : Array.isArray(queryCopy?.areaTo)
            ? undefined
            : queryCopy?.areaTo
    );

    const [bedroomCountFrom, setbedroomCountFrom] = useState<string | undefined>(
        isNaN(queryCopy?.bedroomCountFrom as any)
            ? undefined
            : Array.isArray(queryCopy?.bedroomCountFrom)
            ? undefined
            : queryCopy?.bedroomCountFrom
    );

    const [bedroomCountTo, setbedroomCountTo] = useState<string | undefined>(
        isNaN(queryCopy?.bedroomCountTo as any)
            ? undefined
            : Array.isArray(queryCopy?.bedroomCountTo)
            ? undefined
            : queryCopy?.bedroomCountTo
    );

    const [bathroomCountFrom, setbathroomCountFrom] = useState<string | undefined>(
        isNaN(queryCopy?.bathroomCountFrom as any)
            ? undefined
            : Array.isArray(queryCopy?.bathroomCountFrom)
            ? undefined
            : queryCopy?.bathroomCountFrom
    );

    const [bathroomCountTo, setbathroomCountTo] = useState<string | undefined>(
        isNaN(queryCopy?.bathroomCountTo as any)
            ? undefined
            : Array.isArray(queryCopy?.bathroomCountTo)
            ? undefined
            : queryCopy?.bathroomCountTo
    );

    const [parkingSpaceCountFrom, setparkingSpaceCountFrom] = useState<string | undefined>(
        isNaN(queryCopy?.parkingSpaceCountFrom as any)
            ? undefined
            : Array.isArray(queryCopy?.parkingSpaceCountFrom)
            ? undefined
            : queryCopy?.parkingSpaceCountFrom
    );

    const [parkingSpaceCountTo, setparkingSpaceCountTo] = useState<string | undefined>(
        isNaN(queryCopy?.parkingSpaceCountTo as any)
            ? undefined
            : Array.isArray(queryCopy?.parkingSpaceCountTo)
            ? undefined
            : queryCopy?.parkingSpaceCountTo
    );

    const [buildYearFrom, setbuildYearFrom] = useState<string | undefined>(
        isNaN(queryCopy?.buildYearFrom as any)
            ? undefined
            : Array.isArray(queryCopy?.buildYearFrom)
            ? undefined
            : queryCopy?.buildYearFrom
    );

    const [buildYearTo, setbuildYearTo] = useState<string | undefined>(
        isNaN(queryCopy?.buildYearTo as any)
            ? undefined
            : Array.isArray(queryCopy?.buildYearTo)
            ? undefined
            : queryCopy?.buildYearTo
    );

    const [renovationYearFrom, setrenovationYearFrom] = useState<string | undefined>(
        isNaN(queryCopy?.renovationYearFrom as any)
            ? undefined
            : Array.isArray(queryCopy?.renovationYearFrom)
            ? undefined
            : queryCopy?.renovationYearFrom
    );

    const [renovationYearTo, setrenovationYearTo] = useState<string | undefined>(
        isNaN(queryCopy?.renovationYearTo as any)
            ? undefined
            : Array.isArray(queryCopy?.renovationYearTo)
            ? undefined
            : queryCopy?.renovationYearTo
    );
    const [needsRenovationFilter, setNeedsRenovationFilter] = useState(
        queryCopy?.needsRenovation === "true"
            ? triBooleanDropdownValues.yes
            : queryCopy?.needsRenovation === "false"
            ? triBooleanDropdownValues.no
            : triBooleanDropdownValues.unselected
    );
    const [elevatorAccessFilter, setElevatorAccessFilter] = useState(
        queryCopy?.elevatorAccess === "true"
    );

    const [fullyFurnishedFilter, setFullyFurnishedFilter] = useState(
        !!queryCopy?.furnitureState?.includes(FurnitureState.furnished)
    );
    const [partiallyFurnishedFilter, setPartiallyFurnishedFilter] = useState(
        !!queryCopy?.furnitureState?.includes(FurnitureState.partiallyFurnished)
    );
    const [unfurnishedFilter, setUnfurnishedFilter] = useState(
        !!queryCopy?.furnitureState?.includes(FurnitureState.unfurnished)
    );

    const [mapBounds, setMapBounds] = useState<LngLatBounds>();
    const [isSearchInProgress, setIsSearchInProgress] = useState(false);
    const [mapZoom, setMapZoom] = useState(DEFAULT_ZOOM);

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

            if (
                pricePerSquareMeterFrom &&
                pricePerSquareMeterFrom.length > 0 &&
                !isNaN(pricePerSquareMeterFrom as any)
            ) {
                allParams.pricePerSquareMeterFrom = pricePerSquareMeterFrom;
            } else {
                delete allParams.pricePerSquareMeterFrom;
            }
            if (
                pricePerSquareMeterTo &&
                pricePerSquareMeterTo.length > 0 &&
                !isNaN(pricePerSquareMeterTo as any)
            ) {
                allParams.pricePerSquareMeterTo = pricePerSquareMeterTo;
            } else {
                delete allParams.pricePerSquareMeterTo;
            }

            if (areaFrom && areaFrom.length > 0 && !isNaN(areaFrom as any)) {
                allParams.areaFrom = areaFrom;
            } else {
                delete allParams.areaFrom;
            }

            if (areaTo && areaTo.length > 0 && !isNaN(areaTo as any)) {
                allParams.areaTo = areaTo;
            } else {
                delete allParams.areaTo;
            }

            if (
                bedroomCountFrom &&
                bedroomCountFrom.length > 0 &&
                !isNaN(bedroomCountFrom as any)
            ) {
                allParams.bedroomCountFrom = bedroomCountFrom;
            } else {
                delete allParams.bedroomCountFrom;
            }

            if (bedroomCountTo && bedroomCountTo.length > 0 && !isNaN(bedroomCountTo as any)) {
                allParams.bedroomCountTo = bedroomCountTo;
            } else {
                delete allParams.bedroomCountTo;
            }

            if (
                bathroomCountFrom &&
                bathroomCountFrom.length > 0 &&
                !isNaN(bathroomCountFrom as any)
            ) {
                allParams.bathroomCountFrom = bathroomCountFrom;
            } else {
                delete allParams.bathroomCountFrom;
            }

            if (bathroomCountTo && bathroomCountTo.length > 0 && !isNaN(bathroomCountTo as any)) {
                allParams.bathroomCountTo = bathroomCountTo;
            } else {
                delete allParams.bathroomCountTo;
            }

            if (
                parkingSpaceCountFrom &&
                parkingSpaceCountFrom.length > 0 &&
                !isNaN(parkingSpaceCountFrom as any)
            ) {
                allParams.parkingSpaceCountFrom = parkingSpaceCountFrom;
            } else {
                delete allParams.parkingSpaceCountFrom;
            }

            if (
                parkingSpaceCountTo &&
                parkingSpaceCountTo.length > 0 &&
                !isNaN(parkingSpaceCountTo as any)
            ) {
                allParams.parkingSpaceCountTo = parkingSpaceCountTo;
            } else {
                delete allParams.parkingSpaceCountTo;
            }

            if (buildYearFrom && buildYearFrom.length > 0 && !isNaN(buildYearFrom as any)) {
                allParams.buildYearFrom = buildYearFrom;
            } else {
                delete allParams.buildYearFrom;
            }

            if (buildYearTo && buildYearTo.length > 0 && !isNaN(buildYearTo as any)) {
                allParams.buildYearTo = buildYearTo;
            } else {
                delete allParams.buildYearTo;
            }

            if (
                renovationYearFrom &&
                renovationYearFrom.length > 0 &&
                !isNaN(renovationYearFrom as any)
            ) {
                allParams.renovationYearFrom = renovationYearFrom;
            } else {
                delete allParams.renovationYearFrom;
            }

            if (
                renovationYearTo &&
                renovationYearTo.length > 0 &&
                !isNaN(renovationYearTo as any)
            ) {
                allParams.renovationYearTo = renovationYearTo;
            } else {
                delete allParams.renovationYearTo;
            }

            if (needsRenovationFilter.value === TriBoolean.yes) {
                allParams.needsRenovation = "true";
            } else if (needsRenovationFilter.value === TriBoolean.no) {
                allParams.needsRenovation = "false";
            } else {
                delete allParams.needsRenovation;
            }

            const furnitureState = [];
            if (fullyFurnishedFilter) {
                furnitureState.push(FurnitureState.furnished);
            }
            if (partiallyFurnishedFilter) {
                furnitureState.push(FurnitureState.partiallyFurnished);
            }
            if (unfurnishedFilter) {
                furnitureState.push(FurnitureState.unfurnished);
            }
            if (furnitureState.length === 0) {
                delete allParams.furnitureState;
            }

            if (elevatorAccessFilter) {
                allParams.elevatorAccess = "true";
            } else {
                delete allParams.elevatorAccess;
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
            const { data } = await findListingsByBoundingBox({
                boundingBox: {
                    nwlng: mapBounds.getNorthWest().lng,
                    nwlat: mapBounds.getNorthWest().lat,
                    selng: mapBounds.getSouthEast().lng,
                    selat: mapBounds.getSouthEast().lat,
                },
                propertyType: propertyTypes,
                offeringType: offeringTypes,
                priceFrom,
                priceTo,
                pricePerSquareMeterFrom,
                pricePerSquareMeterTo,
                areaFrom,
                areaTo,
                bedroomCountFrom,
                bedroomCountTo,
                bathroomCountFrom,
                bathroomCountTo,
                parkingSpaceCountFrom,
                parkingSpaceCountTo,
                buildYearFrom,
                buildYearTo,
                renovationYearFrom,
                renovationYearTo,
                furnitureState: furnitureState.length > 0 ? furnitureState : undefined,
                elevatorAccess: elevatorAccessFilter ? true : undefined,
            });

            // Restart to first page when filter changes
            delete allParams.page;
            setQueryCopy({ ...allParams, propertyTypes, offeringTypes, furnitureState });

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

    function hasActiveFilter() {
        return !!(
            filterApartments ||
            filterHouses ||
            filterLand ||
            filterLongTermRent ||
            filterSale ||
            filterShortTermRent ||
            priceFrom ||
            priceTo ||
            pricePerSquareMeterFrom ||
            pricePerSquareMeterTo ||
            areaFrom ||
            areaTo ||
            bedroomCountFrom ||
            bedroomCountTo ||
            bathroomCountFrom ||
            bathroomCountTo ||
            parkingSpaceCountFrom ||
            parkingSpaceCountTo ||
            buildYearFrom ||
            buildYearTo ||
            renovationYearFrom ||
            renovationYearTo ||
            needsRenovationFilter.value === TriBoolean.yes ||
            needsRenovationFilter.value === TriBoolean.no ||
            fullyFurnishedFilter ||
            partiallyFurnishedFilter ||
            unfurnishedFilter ||
            elevatorAccessFilter
        );
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

    function onMapStyleChange(newStyle: string) {
        // Mapbox satellite images are quite dark, so you can't see the navbar icons...
        if (newStyle === MapStyle.satelliteMapStyle) {
            setLightIcons(true);
        } else {
            setLightIcons(false);
        }
    }

    function clearFilter() {
        setFilterApartments(false);
        setFilterHouses(false);
        setFilterLand(false);
        setFilterSale(false);
        setFilterShortTermRent(false);
        setFilterLongTermRent(false);
        setPriceFrom(undefined);
        setPriceTo(undefined);
        setPricePerSquareMeterFrom(undefined);
        setPricePerSquareMeterTo(undefined);
        setareaFrom(undefined);
        setareaTo(undefined);
        setbedroomCountFrom(undefined);
        setbedroomCountTo(undefined);
        setbathroomCountFrom(undefined);
        setbathroomCountTo(undefined);
        setparkingSpaceCountFrom(undefined);
        setparkingSpaceCountTo(undefined);
        setbuildYearFrom(undefined);
        setbuildYearTo(undefined);
        setrenovationYearFrom(undefined);
        setrenovationYearTo(undefined);
        setNeedsRenovationFilter(triBooleanDropdownValues.unselected);
        setFullyFurnishedFilter(false);
        setPartiallyFurnishedFilter(false);
        setUnfurnishedFilter(false);
        setElevatorAccessFilter(false);
    }

    React.useEffect(() => {
        // TODO: When a field changes while a search was in progress, the newly changed
        // field will not call this function again and won't be filtered. Figure out a way to fix that..
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
        pricePerSquareMeterFrom,
        pricePerSquareMeterTo,
        areaFrom,
        areaTo,
        bedroomCountFrom,
        bedroomCountTo,
        bathroomCountFrom,
        bathroomCountTo,
        parkingSpaceCountFrom,
        parkingSpaceCountTo,
        buildYearFrom,
        buildYearTo,
        renovationYearFrom,
        renovationYearTo,
        needsRenovationFilter,
        fullyFurnishedFilter,
        partiallyFurnishedFilter,
        unfurnishedFilter,
        elevatorAccessFilter,
    ]);

    React.useEffect(() => {
        try {
            const newLat =
                typeof router.query.lat === "string" ? parseFloat(router.query.lat) : null;
            const newLon =
                typeof router.query.lon === "string" ? parseFloat(router.query.lon) : null;

            if (newLat && newLon) {
                setLocationLat(newLat);
                setLocationLon(newLon);
                setMapZoom(14);
                setOpenProperty(null);
            }
        } catch (_e) {}
    }, [router.query]);

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
                <Navbar lighterSearchbar lightIcons={lightIcons} />
            </header>
            <main>
                <div className="fixed top-0 left-0 w-screen h-screen flex">
                    <Map
                        hideImageStyleButtons={!!openProperty}
                        onMapStyleChange={onMapStyleChange}
                        className="flex-1"
                        onBoundsChange={setMapBounds}
                        centerLat={locationLat || undefined}
                        centerLon={locationLon || undefined}
                        scrollZoom={true}
                        zoom={mapZoom}
                        navigationControlStyle={{
                            marginTop: "6rem",
                        }}
                    >
                        {openProperty && (
                            <Popup
                                closeButton={false}
                                style={{
                                    padding: 0,
                                    maxWidth: "90vw",
                                    width: "380px",
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
                                <div className="w-full relative border-b border-zinc-300">
                                    <div className="absolute top-2 left-2 z-50">
                                        <SaveListingIcon
                                            saved={openProperty.saved}
                                            className="bg-white !p-1.5"
                                            listingId={openProperty.id}
                                        />
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
                                            showStatus={true}
                                            showIndicators={false}
                                            swipeable={true}
                                            emulateTouch={true}
                                            className={`w-full ${space_grotesk.className}`}
                                            statusFormatter={(curr, total) => {
                                                return `${curr}/${total}`;
                                            }}
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
                                    <div className="mt-1 flex items-center justify-center !text-sm">
                                        {/* <div>
                                            <Typography variant="secondary" uppercase>
                                                {getPropertyLocationString(openProperty)}
                                            </Typography>
                                        </div> */}
                                        <IconRow
                                            listing={openProperty}
                                            containerClassName="!bg-transparent !shadow-none"
                                        />
                                    </div>
                                    <div
                                        style={{
                                            minHeight: "3.5em",
                                            height: "3.5em",
                                            maxHeight: "3.5em",
                                        }}
                                    >
                                        <Typography variant="h2" className="line-clamp-2 text-base">
                                            {openProperty.title}
                                        </Typography>
                                    </div>
                                    <Typography variant="h2" className="mt-2 text-right">
                                        {formatPrice(openProperty.price)}
                                    </Typography>
                                    <Typography className="text-sm font-normal text-right">
                                        {getPriceString(openProperty)}
                                    </Typography>
                                    <div className="mt-2">
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
                                                    {formatPrice(p.price)}
                                                </Typography>
                                            </div>
                                        </div>
                                    </Marker>
                                );
                            })}
                        </div>
                    </Map>
                </div>

                <div
                    className={`absolute bottom-8 md:bottom-14 xl:bottom-20 left-1/2 z-20 -translate-x-1/2 transition-all ${
                        openProperty && "scale-0"
                    }`}
                >
                    <Link
                        to="/listings"
                        query={queryCopy}
                        className="relative bg-zinc-900 rounded-xl shadow-2xl flex flex-row space-x-1 px-4 py-3 hover:px-6 hover:py-4 transition-all"
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
                    <div className="bg-zinc-100 w-full h-full flex flex-col overflow-y-auto">
                        <div className="flex flex-row justify-between items-center sticky top-0 px-4 py-2 border-b border-zinc-300 bg-zinc-100">
                            <Typography variant="h2">{t("filter")}</Typography>
                            <Button.Transparent
                                onClick={() => {
                                    setIsFilterOpen(false);
                                }}
                            >
                                <Icon name="close" />
                            </Button.Transparent>
                        </div>

                        <div className="px-4 pb-4">
                            <div className="w-full mt-6">
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

                            <div className="w-full mt-6">
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

                            <div className="mt-6">
                                <Typography bold>{t("price")}</Typography>
                                <div className="flex flex-row flex-wrap items-center">
                                    <div className="mt-2 border border-zinc-400 inline-flex flex-row px-2 py-1 rounded-md shadow-sm">
                                        <DebounceInput
                                            id="priceFrom"
                                            name="priceFrom"
                                            className={`bg-transparent outline-none border-none w-24 pr-1 ${space_grotesk.className}`}
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

                            <div className="mt-6">
                                <Typography bold>{t("price-per-meter-squared")}</Typography>
                                <div className="flex flex-row flex-wrap items-center">
                                    <div className="mt-2 border border-zinc-400 inline-flex flex-row px-2 py-1 rounded-md shadow-sm">
                                        <DebounceInput
                                            id="pricePerSquareMeterFrom"
                                            name="pricePerSquareMeterFrom"
                                            className={`bg-transparent outline-none border-none w-24 pr-1 ${space_grotesk.className}`}
                                            debounceTimeout={1000}
                                            onChange={(e) => {
                                                setPricePerSquareMeterFrom(e.target.value);
                                            }}
                                        />
                                        <label htmlFor="pricePerSquareMeterFrom">
                                            <Typography>€</Typography>
                                        </label>
                                    </div>
                                    <Typography className="mx-2 mt-2">{t("to")}</Typography>
                                    <div className="mt-2 border border-zinc-400 inline-flex flex-row px-2 py-1 rounded-md shadow-sm">
                                        <DebounceInput
                                            id="pricePerSquareMeterTo"
                                            name="pricePerSquareMeterTo"
                                            debounceTimeout={1000}
                                            className={`bg-transparent outline-none border-none w-24 pr-1 ${space_grotesk.className}`}
                                            onChange={(e) => {
                                                setPricePerSquareMeterTo(e.target.value);
                                            }}
                                        />
                                        <label htmlFor="pricePerSquareMeterTo">
                                            <Typography>€</Typography>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6">
                                <Typography bold>{t("area")}</Typography>
                                <div className="flex flex-row flex-wrap items-center">
                                    <div className="mt-2 border border-zinc-400 inline-flex flex-row px-2 py-1 rounded-md shadow-sm">
                                        <DebounceInput
                                            id="areaFrom"
                                            name="areaFrom"
                                            className={`bg-transparent outline-none border-none w-24 pr-1 ${space_grotesk.className}`}
                                            debounceTimeout={1000}
                                            onChange={(e) => {
                                                setareaFrom(e.target.value);
                                            }}
                                        />
                                        <label htmlFor="areaFrom">
                                            <Typography>m²</Typography>
                                        </label>
                                    </div>
                                    <Typography className="mx-2 mt-2">{t("to")}</Typography>
                                    <div className="mt-2 border border-zinc-400 inline-flex flex-row px-2 py-1 rounded-md shadow-sm">
                                        <DebounceInput
                                            id="areaTo"
                                            name="areaTo"
                                            debounceTimeout={1000}
                                            className={`bg-transparent outline-none border-none w-24 pr-1 ${space_grotesk.className}`}
                                            onChange={(e) => {
                                                setareaTo(e.target.value);
                                            }}
                                        />
                                        <label htmlFor="areaTo">
                                            <Typography>m²</Typography>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6">
                                <Typography bold>{t("bedroomCount")}</Typography>
                                <div className="flex flex-row flex-wrap items-center">
                                    <div className="mt-2 border border-zinc-400 inline-flex flex-row px-2 py-1 rounded-md shadow-sm">
                                        <DebounceInput
                                            id="bedroomCountFrom"
                                            name="bedroomCountFrom"
                                            className={`bg-transparent outline-none border-none w-24 pr-1 ${space_grotesk.className}`}
                                            debounceTimeout={1000}
                                            onChange={(e) => {
                                                setbedroomCountFrom(e.target.value);
                                            }}
                                        />
                                    </div>
                                    <Typography className="mx-2 mt-2">{t("to")}</Typography>
                                    <div className="mt-2 border border-zinc-400 inline-flex flex-row px-2 py-1 rounded-md shadow-sm">
                                        <DebounceInput
                                            id="bedroomCountTo"
                                            name="bedroomCountTo"
                                            debounceTimeout={1000}
                                            className={`bg-transparent outline-none border-none w-24 pr-1 ${space_grotesk.className}`}
                                            onChange={(e) => {
                                                setbedroomCountTo(e.target.value);
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6">
                                <Typography bold>{t("bathroomCount")}</Typography>
                                <div className="flex flex-row flex-wrap items-center">
                                    <div className="mt-2 border border-zinc-400 inline-flex flex-row px-2 py-1 rounded-md shadow-sm">
                                        <DebounceInput
                                            id="bathroomCountFrom"
                                            name="bathroomCountFrom"
                                            className={`bg-transparent outline-none border-none w-24 pr-1 ${space_grotesk.className}`}
                                            debounceTimeout={1000}
                                            onChange={(e) => {
                                                setbathroomCountFrom(e.target.value);
                                            }}
                                        />
                                    </div>
                                    <Typography className="mx-2 mt-2">{t("to")}</Typography>
                                    <div className="mt-2 border border-zinc-400 inline-flex flex-row px-2 py-1 rounded-md shadow-sm">
                                        <DebounceInput
                                            id="bathroomCountTo"
                                            name="bathroomCountTo"
                                            debounceTimeout={1000}
                                            className={`bg-transparent outline-none border-none w-24 pr-1 ${space_grotesk.className}`}
                                            onChange={(e) => {
                                                setbathroomCountTo(e.target.value);
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6">
                                <Typography bold>{t("parkingSpaceCount")}</Typography>
                                <div className="flex flex-row flex-wrap items-center">
                                    <div className="mt-2 border border-zinc-400 inline-flex flex-row px-2 py-1 rounded-md shadow-sm">
                                        <DebounceInput
                                            id="parkingSpaceCountFrom"
                                            name="parkingSpaceCountFrom"
                                            className={`bg-transparent outline-none border-none w-24 pr-1 ${space_grotesk.className}`}
                                            debounceTimeout={1000}
                                            onChange={(e) => {
                                                setparkingSpaceCountFrom(e.target.value);
                                            }}
                                        />
                                    </div>
                                    <Typography className="mx-2 mt-2">{t("to")}</Typography>
                                    <div className="mt-2 border border-zinc-400 inline-flex flex-row px-2 py-1 rounded-md shadow-sm">
                                        <DebounceInput
                                            id="parkingSpaceCountTo"
                                            name="parkingSpaceCountTo"
                                            debounceTimeout={1000}
                                            className={`bg-transparent outline-none border-none w-24 pr-1 ${space_grotesk.className}`}
                                            onChange={(e) => {
                                                setparkingSpaceCountTo(e.target.value);
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6">
                                <Typography bold>{t("buildYear")}</Typography>
                                <div className="flex flex-row flex-wrap items-center">
                                    <div className="mt-2 border border-zinc-400 inline-flex flex-row px-2 py-1 rounded-md shadow-sm">
                                        <DebounceInput
                                            id="buildYearFrom"
                                            name="buildYearFrom"
                                            className={`bg-transparent outline-none border-none w-24 pr-1 ${space_grotesk.className}`}
                                            debounceTimeout={1000}
                                            onChange={(e) => {
                                                setbuildYearFrom(e.target.value);
                                            }}
                                        />
                                    </div>
                                    <Typography className="mx-2 mt-2">{t("to")}</Typography>
                                    <div className="mt-2 border border-zinc-400 inline-flex flex-row px-2 py-1 rounded-md shadow-sm">
                                        <DebounceInput
                                            id="buildYearTo"
                                            name="buildYearTo"
                                            debounceTimeout={1000}
                                            className={`bg-transparent outline-none border-none w-24 pr-1 ${space_grotesk.className}`}
                                            onChange={(e) => {
                                                setbuildYearTo(e.target.value);
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6">
                                <Typography bold>{t("renovationYear")}</Typography>
                                <div className="flex flex-row flex-wrap items-center">
                                    <div className="mt-2 border border-zinc-400 inline-flex flex-row px-2 py-1 rounded-md shadow-sm">
                                        <DebounceInput
                                            id="renovationYearFrom"
                                            name="renovationYearFrom"
                                            className={`bg-transparent outline-none border-none w-24 pr-1 ${space_grotesk.className}`}
                                            debounceTimeout={1000}
                                            onChange={(e) => {
                                                setrenovationYearFrom(e.target.value);
                                            }}
                                        />
                                    </div>
                                    <Typography className="mx-2 mt-2">{t("to")}</Typography>
                                    <div className="mt-2 border border-zinc-400 inline-flex flex-row px-2 py-1 rounded-md shadow-sm">
                                        <DebounceInput
                                            id="renovationYearTo"
                                            name="renovationYearTo"
                                            debounceTimeout={1000}
                                            className={`bg-transparent outline-none border-none w-24 pr-1 ${space_grotesk.className}`}
                                            onChange={(e) => {
                                                setrenovationYearTo(e.target.value);
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6">
                                <Typography bold>{t("needs-renovation")}</Typography>
                                <Select
                                    instanceId={useId()}
                                    hideSelectedOptions={false}
                                    className={`outline-none border-none ${space_grotesk.className}`}
                                    options={Object.values(triBooleanDropdownValues)}
                                    onChange={(d) => {
                                        if (d) {
                                            setNeedsRenovationFilter(d);
                                        }
                                    }}
                                    value={needsRenovationFilter}
                                    components={{
                                        Option({ innerProps, children, isSelected }) {
                                            return (
                                                <div
                                                    {...innerProps}
                                                    className={`select-none p-1.5 flex flex-row items-center ${
                                                        isSelected
                                                            ? "bg-emerald-500"
                                                            : "hover:bg-zinc-200"
                                                    }`}
                                                >
                                                    <div className="ml-1">{children}</div>
                                                </div>
                                            );
                                        },
                                    }}
                                    classNames={{
                                        control() {
                                            return "!bg-transparent !border !border-zinc-400 !rounded-md !shadow";
                                        },
                                        multiValue() {
                                            return "!bg-zinc-300 !rounded !shadow-sm !text-sm";
                                        },
                                        menu() {
                                            return "!bg-white !shadow-sm !overflow-hidden !rounded-md !border !border-zinc-300 !z-30";
                                        },
                                        menuList() {
                                            return "!p-0";
                                        },
                                    }}
                                />
                            </div>

                            <div className="mt-6">
                                <Typography bold>{t("furniture-state")}</Typography>
                                <div className="w-full">
                                    <Input
                                        name={t("furnished")}
                                        type="checkbox"
                                        className="ml-2"
                                        checked={fullyFurnishedFilter}
                                        onCheckedChange={setFullyFurnishedFilter}
                                    />
                                    <Input
                                        name={t("partially-furnished")}
                                        type="checkbox"
                                        className="ml-2"
                                        checked={partiallyFurnishedFilter}
                                        onCheckedChange={setPartiallyFurnishedFilter}
                                    />
                                    <Input
                                        name={t("unfurnished")}
                                        type="checkbox"
                                        className="ml-2"
                                        checked={unfurnishedFilter}
                                        onCheckedChange={setUnfurnishedFilter}
                                    />
                                </div>
                            </div>

                            <div className="mt-6">
                                <Typography bold>{t("elevator-access")}</Typography>
                                <div className="w-full">
                                    <Input
                                        name={t("has-elevator-access")}
                                        type="checkbox"
                                        className="ml-2"
                                        checked={elevatorAccessFilter}
                                        onCheckedChange={setElevatorAccessFilter}
                                    />
                                </div>
                            </div>

                            <div className="mt-3 mb-6 flex items-center justify-center">
                                <Link
                                    onClick={() => {
                                        clearFilter();
                                    }}
                                    underlineClassName="!bg-zinc-500"
                                >
                                    <Typography variant="secondary" uppercase>
                                        {t("clear-filter")}
                                    </Typography>
                                </Link>
                            </div>

                            <div className="mt-6 md:hidden">
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
                        isSearchInProgress ? "top-20" : "top-0 -translate-y-full"
                    } left-1/2 -translate-x-1/2 z-50 transition-all`}
                >
                    <div
                        className={`bg-zinc-50 rounded-xl p-3 flex flex-row space-x-2 ${
                            isSearchInProgress ? "shadow" : "shadow-none"
                        }`}
                    >
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
                    {hasActiveFilter() && (
                        <div className="absolute top-0 right-0 bg-rose-600 rounded-full w-2.5 h-2.5 animate-pulse" />
                    )}
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
