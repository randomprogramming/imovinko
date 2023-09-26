import Navbar from "@/components/Navbar";
import Typography from "@/components/Typography";
import {
    FurnitureState,
    OfferingType,
    PaginatedListingBasic,
    PropertyType,
    findListingsByQuery,
} from "@/util/api";
import { GetServerSideProps } from "next";
import React, { useId, useState } from "react";
import Link from "@/components/Link";
import { useTranslations } from "next-intl";
import Input from "@/components/Input";
import Button from "@/components/Button";
import Pagination from "@/components/Pagination";
import { useRouter } from "next/router";
import { ParsedUrlQuery } from "querystring";
import { space_grotesk } from "@/util/fonts";
import Icon from "@/components/Icon";
import ListingListItem from "@/components/listing/ListingListItem";
import Footer from "@/components/Footer";
import Head from "next/head";
import RegionDropdown, {
    HRRegionShortCode,
    parseInitialRegionParams,
} from "@/components/RegionDropdown";
import NoData from "@/components/NoData";
import ListingCardItem from "@/components/listing/ListingCardItem";
import Main from "@/components/Main";
import cookie from "cookie";
import Select from "react-select";

export const getServerSideProps: GetServerSideProps = async ({ query, locale, req }) => {
    let page = query.page;
    if (Array.isArray(page)) {
        page = page.at(0);
    }
    let priceFrom = query.priceFrom;
    if (Array.isArray(priceFrom)) {
        priceFrom = priceFrom.at(0);
    }
    if (isNaN(priceFrom as any)) {
        priceFrom = undefined;
        delete query.priceFrom;
    }

    let priceTo = query.priceTo;
    if (Array.isArray(priceTo)) {
        priceTo = priceTo.at(0);
    }
    if (isNaN(priceTo as any)) {
        priceTo = undefined;
        delete query.priceTo;
    }

    let areaFrom = query.areaFrom;
    if (Array.isArray(areaFrom)) {
        areaFrom = areaFrom.at(0);
    }
    if (isNaN(areaFrom as any)) {
        areaFrom = undefined;
        delete query.areaFrom;
    }

    let areaTo = query.areaTo;
    if (Array.isArray(areaTo)) {
        areaTo = areaTo.at(0);
    }
    if (isNaN(areaTo as any)) {
        areaTo = undefined;
        delete query.areaTo;
    }
    let bedroomCountFrom = query.bedroomCountFrom;
    if (Array.isArray(bedroomCountFrom)) {
        bedroomCountFrom = bedroomCountFrom.at(0);
    }
    if (isNaN(bedroomCountFrom as any)) {
        bedroomCountFrom = undefined;
        delete query.bedroomCountFrom;
    }

    let bedroomCountTo = query.bedroomCountTo;
    if (Array.isArray(bedroomCountTo)) {
        bedroomCountTo = bedroomCountTo.at(0);
    }
    if (isNaN(bedroomCountTo as any)) {
        bedroomCountTo = undefined;
        delete query.bedroomCountTo;
    }

    let bathroomCountFrom = query.bathroomCountFrom;
    if (Array.isArray(bathroomCountFrom)) {
        bathroomCountFrom = bathroomCountFrom.at(0);
    }
    if (isNaN(bathroomCountFrom as any)) {
        bathroomCountFrom = undefined;
        delete query.bathroomCountFrom;
    }

    let bathroomCountTo = query.bathroomCountTo;
    if (Array.isArray(bathroomCountTo)) {
        bathroomCountTo = bathroomCountTo.at(0);
    }
    if (isNaN(bathroomCountTo as any)) {
        bathroomCountTo = undefined;
        delete query.bathroomCountTo;
    }

    let parkingSpaceCountFrom = query.parkingSpaceCountFrom;
    if (Array.isArray(parkingSpaceCountFrom)) {
        parkingSpaceCountFrom = parkingSpaceCountFrom.at(0);
    }
    if (isNaN(parkingSpaceCountFrom as any)) {
        parkingSpaceCountFrom = undefined;
        delete query.parkingSpaceCountFrom;
    }

    let parkingSpaceCountTo = query.parkingSpaceCountTo;
    if (Array.isArray(parkingSpaceCountTo)) {
        parkingSpaceCountTo = parkingSpaceCountTo.at(0);
    }
    if (isNaN(parkingSpaceCountTo as any)) {
        parkingSpaceCountTo = undefined;
        delete query.parkingSpaceCountTo;
    }

    let buildYearFrom = query.buildYearFrom;
    if (Array.isArray(buildYearFrom)) {
        buildYearFrom = buildYearFrom.at(0);
    }
    if (isNaN(buildYearFrom as any)) {
        buildYearFrom = undefined;
        delete query.buildYearFrom;
    }

    let buildYearTo = query.buildYearTo;
    if (Array.isArray(buildYearTo)) {
        buildYearTo = buildYearTo.at(0);
    }
    if (isNaN(buildYearTo as any)) {
        buildYearTo = undefined;
        delete query.buildYearTo;
    }

    let renovationYearFrom = query.renovationYearFrom;
    if (Array.isArray(renovationYearFrom)) {
        renovationYearFrom = renovationYearFrom.at(0);
    }
    if (isNaN(renovationYearFrom as any)) {
        renovationYearFrom = undefined;
        delete query.renovationYearFrom;
    }

    let renovationYearTo = query.renovationYearTo;
    if (Array.isArray(renovationYearTo)) {
        renovationYearTo = renovationYearTo.at(0);
    }
    if (isNaN(renovationYearTo as any)) {
        renovationYearTo = undefined;
        delete query.renovationYearTo;
    }

    let pricePerSquareMeterFrom = query.pricePerSquareMeterFrom;
    if (Array.isArray(pricePerSquareMeterFrom)) {
        pricePerSquareMeterFrom = pricePerSquareMeterFrom.at(0);
    }
    if (isNaN(pricePerSquareMeterFrom as any)) {
        pricePerSquareMeterFrom = undefined;
        delete query.pricePerSquareMeterFrom;
    }
    let pricePerSquareMeterTo = query.pricePerSquareMeterTo;
    if (Array.isArray(pricePerSquareMeterTo)) {
        pricePerSquareMeterTo = pricePerSquareMeterTo.at(0);
    }
    if (isNaN(pricePerSquareMeterTo as any)) {
        pricePerSquareMeterTo = undefined;
        delete query.pricePerSquareMeterTo;
    }

    let sortBy = query.sortBy;
    if (Array.isArray(sortBy)) {
        sortBy = sortBy.at(0);
    }
    if (sortBy !== "createdAt" && sortBy !== "price") {
        sortBy = "createdAt";
    }

    let sortDirectionTyped: "asc" | "desc" | undefined = undefined;
    let sortDirection = query.sortDirection;
    if (sortDirection !== "asc" && sortDirection !== "desc") {
        sortDirectionTyped = "desc";
    } else {
        sortDirectionTyped = sortDirection;
    }

    let propertyTypes: PropertyType[] = [];
    if (Array.isArray(query.propertyTypes)) {
        query.propertyTypes.forEach((pt) => {
            if (
                pt === PropertyType.apartment ||
                pt === PropertyType.house ||
                PropertyType.land == pt
            ) {
                propertyTypes.push(pt as PropertyType);
            }
        });
    } else if (typeof query.propertyTypes === "string") {
        const pt = query.propertyTypes;
        if (pt === PropertyType.apartment) {
            propertyTypes = [PropertyType.apartment];
        }
        if (pt === PropertyType.house) {
            propertyTypes = [PropertyType.house];
        }
        if (pt === PropertyType.land) {
            propertyTypes = [PropertyType.land];
        }
    }
    if (propertyTypes.length === 0) {
        propertyTypes = [PropertyType.apartment, PropertyType.house, PropertyType.land];
    }

    const furnitureState: FurnitureState[] = [];
    if (Array.isArray(query.furnitureState)) {
        query.furnitureState.forEach((f) => {
            if (
                f === FurnitureState.furnished ||
                f === FurnitureState.partiallyFurnished ||
                f === FurnitureState.unfurnished
            ) {
                furnitureState.push(f as FurnitureState);
            }
        });
    } else if (typeof query.furnitureState === "string") {
        const f = query.furnitureState;
        if (f === FurnitureState.furnished) {
            furnitureState.push(FurnitureState.furnished);
        } else if (f === FurnitureState.partiallyFurnished) {
            furnitureState.push(FurnitureState.partiallyFurnished);
        } else if (f === FurnitureState.unfurnished) {
            furnitureState.push(FurnitureState.unfurnished);
        }
    }

    let offeringTypes: OfferingType[] = [];
    if (Array.isArray(query.offeringTypes)) {
        query.offeringTypes.forEach((ot) => {
            if (
                ot === OfferingType.sale ||
                ot === OfferingType.shortTermRent ||
                ot === OfferingType.longTermRent
            ) {
                offeringTypes.push(ot as OfferingType);
            }
        });
    } else if (typeof query.offeringTypes === "string") {
        const ot = query.offeringTypes;
        if (ot === OfferingType.sale) {
            offeringTypes.push(ot as OfferingType);
        }
        if (ot === OfferingType.shortTermRent) {
            offeringTypes.push(ot as OfferingType);
        }
        if (ot === OfferingType.longTermRent) {
            offeringTypes.push(ot as OfferingType);
        }
    }
    if (offeringTypes.length === 0) {
        offeringTypes = [OfferingType.sale, OfferingType.longTermRent, OfferingType.shortTermRent];
    }

    let regions: HRRegionShortCode[] | undefined = undefined;
    if (typeof query.region === "string") {
        query.region = [query.region];
    }
    if (Array.isArray(query.region)) {
        const allShortCodes = Object.values<string>(HRRegionShortCode);
        regions = query.region.filter((r) => {
            return allShortCodes.includes(r);
        }) as HRRegionShortCode[];
    }

    let needsRenovation: undefined | boolean;
    if (query.needsRenovation === "true") {
        needsRenovation = true;
    } else if (query.needsRenovation === "false") {
        needsRenovation = false;
    }

    const cookies = req.headers.cookie;

    const parsed = cookie.parse(cookies || "");
    const jwt = parsed[process.env.NEXT_PUBLIC_JWT_COOKIE_NAME || ""];

    const { data } = await findListingsByQuery({
        propertyType: propertyTypes,
        offeringType: offeringTypes,
        page,
        priceFrom,
        pricePerSquareMeterFrom,
        pricePerSquareMeterTo,
        priceTo,
        sortBy,
        sortDirection: sortDirectionTyped,
        region: regions,
        jwt,
        areaFrom,
        areaTo,
        bathroomCountFrom,
        bathroomCountTo,
        bedroomCountFrom,
        bedroomCountTo,
        buildYearFrom,
        buildYearTo,
        parkingSpaceCountFrom,
        parkingSpaceCountTo,
        renovationYearFrom,
        renovationYearTo,
        needsRenovation,
        // Query by this field only if user selected at least one of the values
        furnitureState: furnitureState.length > 0 ? furnitureState : undefined,
        elevatorAccess: query.elevatorAccess === "true" ? true : undefined,
    });

    return {
        props: {
            messages: (await import(`../../locales/${locale || "hr"}.json`)).default,
            listings: data,
            params: query || {},
        },
    };
};

enum TriBoolean {
    unselected,
    yes,
    no,
}

interface ListingsPageProps {
    listings: PaginatedListingBasic;
    params: ParsedUrlQuery | undefined;
}
export default function ListingsPage({ listings, params }: ListingsPageProps) {
    const t = useTranslations("ListingsPage");
    const tRegionDropdown = useTranslations("RegionDropdown");

    let selectedSort = "";
    if (params?.sortBy && (params.sortBy === "createdAt" || params.sortBy === "price")) {
        selectedSort += params.sortBy;
    } else {
        selectedSort += "createdAt";
    }
    selectedSort += "-";
    if (
        params?.sortDirection &&
        (params.sortDirection === "asc" || params.sortDirection === "desc")
    ) {
        selectedSort += params.sortDirection;
    } else {
        selectedSort += "desc";
    }

    const triBooleanDropdownValues = {
        unselected: { label: "-", value: TriBoolean.unselected },
        yes: { label: t("yes"), value: TriBoolean.yes },
        no: { label: t("no"), value: TriBoolean.no },
    };

    const [useCards, setUseCards] = useState(params?.useList !== "true"); // Use Cards or List UI for showing listings

    const [isHandlingFilterChange, setIsHandlingFilterChange] = useState(false);

    const [filterApartments, setFilterApartments] = useState(
        !!params?.propertyTypes?.includes(PropertyType.apartment)
    );
    const [filterHouses, setFilterHouses] = useState(
        !!params?.propertyTypes?.includes(PropertyType.house)
    );
    const [filterLand, setFilterLand] = useState(
        !!params?.propertyTypes?.includes(PropertyType.land)
    );
    const [filterSale, setFilterSale] = useState(
        !!params?.offeringTypes?.includes(OfferingType.sale)
    );
    const [filterLongTermRent, setFilterLongTermRent] = useState(
        !!params?.offeringTypes?.includes(OfferingType.longTermRent)
    );
    const [filterShortTermRent, setFilterShortTermRent] = useState(
        !!params?.offeringTypes?.includes(OfferingType.shortTermRent)
    );
    const [priceFrom, setPriceFrom] = useState<string | undefined>(
        isNaN(params?.priceFrom as any)
            ? undefined
            : Array.isArray(params?.priceFrom)
            ? undefined
            : params?.priceFrom
    );
    const [priceTo, setPriceTo] = useState<string | undefined>(
        isNaN(params?.priceTo as any)
            ? undefined
            : Array.isArray(params?.priceTo)
            ? undefined
            : params?.priceTo
    );
    const [pricePerSquareMeterFrom, setPricePerSquareMeterFrom] = useState(
        isNaN(params?.pricePerSquareMeterFrom as any)
            ? undefined
            : Array.isArray(params?.pricePerSquareMeterFrom)
            ? undefined
            : params?.pricePerSquareMeterFrom
    );
    const [pricePerSquareMeterTo, setPricePerSquareMeterTo] = useState(
        isNaN(params?.pricePerSquareMeterTo as any)
            ? undefined
            : Array.isArray(params?.pricePerSquareMeterTo)
            ? undefined
            : params?.pricePerSquareMeterTo
    );
    const [filterRegionShortCodes, setFilterRegionShortCodes] = useState<
        {
            label: string;
            value: HRRegionShortCode;
        }[]
    >(
        parseInitialRegionParams(params?.region)
            .map((rp) => {
                return {
                    label: tRegionDropdown(rp.value),
                    value: rp.value,
                };
            })
            .sort((a, b) => {
                return a.label.localeCompare(b.label);
            })
    );
    // If the region dropdown re-renders it does some weird stuff so we have to make sure it doesn't re render
    const initialFilterRegionShortCodes = React.useMemo(() => [...filterRegionShortCodes], []);
    const [areaFrom, setareaFrom] = useState<string | undefined>(
        isNaN(params?.areaFrom as any)
            ? undefined
            : Array.isArray(params?.areaFrom)
            ? undefined
            : params?.areaFrom
    );

    const [areaTo, setareaTo] = useState<string | undefined>(
        isNaN(params?.areaTo as any)
            ? undefined
            : Array.isArray(params?.areaTo)
            ? undefined
            : params?.areaTo
    );

    const [bedroomCountFrom, setbedroomCountFrom] = useState<string | undefined>(
        isNaN(params?.bedroomCountFrom as any)
            ? undefined
            : Array.isArray(params?.bedroomCountFrom)
            ? undefined
            : params?.bedroomCountFrom
    );

    const [bedroomCountTo, setbedroomCountTo] = useState<string | undefined>(
        isNaN(params?.bedroomCountTo as any)
            ? undefined
            : Array.isArray(params?.bedroomCountTo)
            ? undefined
            : params?.bedroomCountTo
    );

    const [bathroomCountFrom, setbathroomCountFrom] = useState<string | undefined>(
        isNaN(params?.bathroomCountFrom as any)
            ? undefined
            : Array.isArray(params?.bathroomCountFrom)
            ? undefined
            : params?.bathroomCountFrom
    );

    const [bathroomCountTo, setbathroomCountTo] = useState<string | undefined>(
        isNaN(params?.bathroomCountTo as any)
            ? undefined
            : Array.isArray(params?.bathroomCountTo)
            ? undefined
            : params?.bathroomCountTo
    );

    const [parkingSpaceCountFrom, setparkingSpaceCountFrom] = useState<string | undefined>(
        isNaN(params?.parkingSpaceCountFrom as any)
            ? undefined
            : Array.isArray(params?.parkingSpaceCountFrom)
            ? undefined
            : params?.parkingSpaceCountFrom
    );

    const [parkingSpaceCountTo, setparkingSpaceCountTo] = useState<string | undefined>(
        isNaN(params?.parkingSpaceCountTo as any)
            ? undefined
            : Array.isArray(params?.parkingSpaceCountTo)
            ? undefined
            : params?.parkingSpaceCountTo
    );

    const [buildYearFrom, setbuildYearFrom] = useState<string | undefined>(
        isNaN(params?.buildYearFrom as any)
            ? undefined
            : Array.isArray(params?.buildYearFrom)
            ? undefined
            : params?.buildYearFrom
    );

    const [buildYearTo, setbuildYearTo] = useState<string | undefined>(
        isNaN(params?.buildYearTo as any)
            ? undefined
            : Array.isArray(params?.buildYearTo)
            ? undefined
            : params?.buildYearTo
    );

    const [renovationYearFrom, setrenovationYearFrom] = useState<string | undefined>(
        isNaN(params?.renovationYearFrom as any)
            ? undefined
            : Array.isArray(params?.renovationYearFrom)
            ? undefined
            : params?.renovationYearFrom
    );

    const [renovationYearTo, setrenovationYearTo] = useState<string | undefined>(
        isNaN(params?.renovationYearTo as any)
            ? undefined
            : Array.isArray(params?.renovationYearTo)
            ? undefined
            : params?.renovationYearTo
    );

    const [needsRenovationFilter, setNeedsRenovationFilter] = useState(
        params?.needsRenovation === "true"
            ? triBooleanDropdownValues.yes
            : params?.needsRenovation === "false"
            ? triBooleanDropdownValues.no
            : triBooleanDropdownValues.unselected
    );
    const [elevatorAccessFilter, setElevatorAccessFilter] = useState(
        params?.elevatorAccess === "true"
    );

    const [fullyFurnishedFilter, setFullyFurnishedFilter] = useState(
        !!params?.furnitureState?.includes(FurnitureState.furnished)
    );
    const [partiallyFurnishedFilter, setPartiallyFurnishedFilter] = useState(
        !!params?.furnitureState?.includes(FurnitureState.partiallyFurnished)
    );
    const [unfurnishedFilter, setUnfurnishedFilter] = useState(
        !!params?.furnitureState?.includes(FurnitureState.unfurnished)
    );

    const [showMoreFilter, setShowMoreFilter] = useState(
        !!(
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
        )
    );
    const router = useRouter();

    async function handleFilterChange() {
        setIsHandlingFilterChange(true);
        let allParams = params ? { ...params } : {};

        const propertyTypes = [];
        if (filterApartments) {
            propertyTypes.push(PropertyType.apartment);
        }
        if (filterHouses) {
            propertyTypes.push(PropertyType.house);
        }
        if (filterLand) {
            propertyTypes.push(PropertyType.land);
        }
        const offeringTypes: OfferingType[] = [];
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
        if (filterRegionShortCodes.length > 0) {
            allParams.region = filterRegionShortCodes.map((c) => c.value);
        } else {
            delete allParams.region;
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

        if (bedroomCountFrom && bedroomCountFrom.length > 0 && !isNaN(bedroomCountFrom as any)) {
            allParams.bedroomCountFrom = bedroomCountFrom;
        } else {
            delete allParams.bedroomCountFrom;
        }

        if (bedroomCountTo && bedroomCountTo.length > 0 && !isNaN(bedroomCountTo as any)) {
            allParams.bedroomCountTo = bedroomCountTo;
        } else {
            delete allParams.bedroomCountTo;
        }

        if (bathroomCountFrom && bathroomCountFrom.length > 0 && !isNaN(bathroomCountFrom as any)) {
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

        if (renovationYearTo && renovationYearTo.length > 0 && !isNaN(renovationYearTo as any)) {
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

        // Restart to first page when filter changes
        delete allParams.page;
        await router.push(
            {
                pathname: router.pathname,
                query: {
                    ...allParams,
                    propertyTypes,
                    offeringTypes,
                    furnitureState,
                },
            },
            undefined,
            {
                // I'm not sure how to show a "loading" state when getServerSideProps runs, so just do this instead and manually reload the page
                shallow: true,
            }
        );
        router.reload();
    }

    async function handleUseCardsChange(useCards: boolean) {
        let allParams = params ? { ...params } : {};
        if (useCards) {
            delete allParams.useList;
        } else {
            allParams.useList = "true";
        }
        await router.replace({
            pathname: router.pathname,
            query: { ...allParams },
        });
        setUseCards(useCards);
    }

    async function handleSortChange(newSort: string) {
        let allParams = params ? { ...params } : {};
        const [sortField, sortDirection] = newSort.split("-");

        allParams.sortBy = sortField;
        allParams.sortDirection = sortDirection;
        allParams.page = "1";

        await router.push(
            {
                pathname: router.pathname,
                query: { ...allParams },
            },
            undefined,
            {
                // I'm not sure how to show a "loading" state when getServerSideProps runs, so just do this instead and manually reload the page
                shallow: true,
            }
        );
        router.reload();
    }

    function checkForInputEnterPress(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter" && !isHandlingFilterChange) {
            handleFilterChange();
        }
    }

    function clearFilter() {
        setFilterApartments(false);
        setFilterHouses(false);
        setFilterLand(false);
        setFilterSale(false);
        setFilterShortTermRent(false);
        setFilterLongTermRent(false);
        setFilterRegionShortCodes([]);
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

    // We have to use callback here or else it does some weird stuff after selected(rerendering)
    const onRegionChange = React.useCallback((newVal: any) => {
        setFilterRegionShortCodes(
            newVal.map((v: any) => {
                return {
                    label: v.label,
                    value: v.value,
                };
            })
        );
    }, []);

    return (
        <>
            <Head>
                <title>Imovinko - Oglasi</title>
                <meta name="description" content="Imovinko - prolistaj oglase za nekretnine." />
                <meta
                    name="keywords"
                    content="oglasnik, nekretnina, kuća, stan, zemljište, kupovina, prodaja, najam, oglasi, lista"
                />
            </Head>
            <header className="z-30">
                <Navbar />
            </header>
            <Main className="md:flex-row border-t border-zinc-300">
                <div
                    className="min-h-full md:border-r border-zinc-300 px-2 pt-2 flex flex-col md:max-w-xs xl: max-w-md"
                    style={{
                        minWidth: "210px",
                    }}
                >
                    <div className={`flex items-center justify-center w-full`}>
                        <Link
                            to="/map"
                            query={{ ...params }}
                            disableAnimatedHover
                            className="border-2 border-transparent hover:border-zinc-900 transition-all rounded-md px-2 py-1"
                        >
                            <div className="flex flex-row space-x-1 items-center">
                                <Icon name="location" height={20} width={20} />
                                <Typography variant="span">{t("show-map")}</Typography>
                            </div>
                        </Link>
                    </div>
                    <Typography variant="h2">{t("filter")}</Typography>

                    <div className="mt-4">
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

                    <div className="mt-6">
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

                    <div className="w-full mt-6">
                        <Typography bold>{t("regions")}</Typography>
                        <div className="w-full mt-2">
                            <RegionDropdown
                                onChange={onRegionChange}
                                initial={initialFilterRegionShortCodes}
                            />
                        </div>
                    </div>

                    <div className="mt-6">
                        <Typography bold>{t("price")}</Typography>
                        <div className="flex flex-row flex-wrap items-center">
                            <div className="mt-2 border border-zinc-400 inline-flex flex-row px-2 py-1 rounded-md shadow-sm">
                                <input
                                    id="priceFrom"
                                    name="priceFrom"
                                    className={`bg-transparent outline-none border-none w-24 pr-1 ${space_grotesk.className}`}
                                    value={priceFrom || ""}
                                    onChange={(e) => {
                                        setPriceFrom(e.target.value);
                                    }}
                                    onKeyDown={checkForInputEnterPress}
                                />
                                <label htmlFor="priceFrom">
                                    <Typography>€</Typography>
                                </label>
                            </div>
                            <Typography className="mx-2 mt-2">{t("to")}</Typography>
                            <div className="mt-2 border border-zinc-400 inline-flex flex-row px-2 py-1 rounded-md shadow-sm">
                                <input
                                    id="priceTo"
                                    name="priceTo"
                                    className={`bg-transparent outline-none border-none w-24 pr-1 ${space_grotesk.className}`}
                                    value={priceTo || ""}
                                    onChange={(e) => {
                                        setPriceTo(e.target.value);
                                    }}
                                    onKeyDown={checkForInputEnterPress}
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
                                <input
                                    id="pricePerSquareMeterFrom"
                                    name="pricePerSquareMeterFrom"
                                    className={`bg-transparent outline-none border-none w-24 pr-1 ${space_grotesk.className}`}
                                    value={pricePerSquareMeterFrom || ""}
                                    onKeyDown={checkForInputEnterPress}
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
                                <input
                                    id="pricePerSquareMeterTo"
                                    name="pricePerSquareMeterTo"
                                    className={`bg-transparent outline-none border-none w-24 pr-1 ${space_grotesk.className}`}
                                    value={pricePerSquareMeterTo || ""}
                                    onKeyDown={checkForInputEnterPress}
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

                    {/* SHOW MORE FILTERS SECTION START */}
                    <div id="more-filter" className="pt-6 text-center">
                        <Link
                            onClick={() => {
                                if (!showMoreFilter) {
                                    const showMoreFilterStart =
                                        document.querySelector("#more-filter");
                                    if (showMoreFilterStart) {
                                        showMoreFilterStart.scrollIntoView({
                                            behavior: "smooth",
                                        });
                                    }
                                }
                                setShowMoreFilter(!showMoreFilter);
                            }}
                        >
                            <div className="flex flex-row -ml-1.5">
                                <Icon
                                    name="down-chevron"
                                    className={`${
                                        showMoreFilter && "rotate-90"
                                    } origin-center transition-all`}
                                />

                                <Typography variant="span">
                                    {showMoreFilter
                                        ? t("show-less-filters")
                                        : t("show-more-filters")}
                                </Typography>
                            </div>
                        </Link>
                    </div>

                    <div className={`${showMoreFilter ? "flex" : "hidden"} flex-col`}>
                        <div className="mt-6">
                            <Typography bold>{t("area")}</Typography>
                            <div className="flex flex-row flex-wrap items-center">
                                <div className="mt-2 border border-zinc-400 inline-flex flex-row px-2 py-1 rounded-md shadow-sm">
                                    <input
                                        id="areaFrom"
                                        name="areaFrom"
                                        className={`bg-transparent outline-none border-none w-[92px] pr-1 ${space_grotesk.className}`}
                                        value={areaFrom || ""}
                                        onKeyDown={checkForInputEnterPress}
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
                                    <input
                                        id="areaTo"
                                        name="areaTo"
                                        className={`bg-transparent outline-none border-none w-[92px] pr-1 ${space_grotesk.className}`}
                                        value={areaTo || ""}
                                        onKeyDown={checkForInputEnterPress}
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
                                    <input
                                        id="bedroomCountFrom"
                                        name="bedroomCountFrom"
                                        className={`bg-transparent outline-none border-none w-28 pr-1 ${space_grotesk.className}`}
                                        value={bedroomCountFrom || ""}
                                        onKeyDown={checkForInputEnterPress}
                                        onChange={(e) => {
                                            setbedroomCountFrom(e.target.value);
                                        }}
                                    />
                                </div>
                                <Typography className="mx-2 mt-2">{t("to")}</Typography>
                                <div className="mt-2 border border-zinc-400 inline-flex flex-row px-2 py-1 rounded-md shadow-sm">
                                    <input
                                        id="bedroomCountTo"
                                        name="bedroomCountTo"
                                        className={`bg-transparent outline-none border-none w-28 pr-1 ${space_grotesk.className}`}
                                        value={bedroomCountTo || ""}
                                        onKeyDown={checkForInputEnterPress}
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
                                    <input
                                        id="bathroomCountFrom"
                                        name="bathroomCountFrom"
                                        className={`bg-transparent outline-none border-none w-28 pr-1 ${space_grotesk.className}`}
                                        value={bathroomCountFrom || ""}
                                        onKeyDown={checkForInputEnterPress}
                                        onChange={(e) => {
                                            setbathroomCountFrom(e.target.value);
                                        }}
                                    />
                                </div>
                                <Typography className="mx-2 mt-2">{t("to")}</Typography>
                                <div className="mt-2 border border-zinc-400 inline-flex flex-row px-2 py-1 rounded-md shadow-sm">
                                    <input
                                        id="bathroomCountTo"
                                        name="bathroomCountTo"
                                        className={`bg-transparent outline-none border-none w-28 pr-1 ${space_grotesk.className}`}
                                        value={bathroomCountTo || ""}
                                        onKeyDown={checkForInputEnterPress}
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
                                    <input
                                        id="parkingSpaceCountFrom"
                                        name="parkingSpaceCountFrom"
                                        className={`bg-transparent outline-none border-none w-28 pr-1 ${space_grotesk.className}`}
                                        value={parkingSpaceCountFrom || ""}
                                        onKeyDown={checkForInputEnterPress}
                                        onChange={(e) => {
                                            setparkingSpaceCountFrom(e.target.value);
                                        }}
                                    />
                                </div>
                                <Typography className="mx-2 mt-2">{t("to")}</Typography>
                                <div className="mt-2 border border-zinc-400 inline-flex flex-row px-2 py-1 rounded-md shadow-sm">
                                    <input
                                        id="parkingSpaceCountTo"
                                        name="parkingSpaceCountTo"
                                        className={`bg-transparent outline-none border-none w-28 pr-1 ${space_grotesk.className}`}
                                        value={parkingSpaceCountTo || ""}
                                        onKeyDown={checkForInputEnterPress}
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
                                    <input
                                        id="buildYearFrom"
                                        name="buildYearFrom"
                                        className={`bg-transparent outline-none border-none w-28 pr-1 ${space_grotesk.className}`}
                                        value={buildYearFrom || ""}
                                        onKeyDown={checkForInputEnterPress}
                                        onChange={(e) => {
                                            setbuildYearFrom(e.target.value);
                                        }}
                                    />
                                </div>
                                <Typography className="mx-2 mt-2">{t("to")}</Typography>
                                <div className="mt-2 border border-zinc-400 inline-flex flex-row px-2 py-1 rounded-md shadow-sm">
                                    <input
                                        id="buildYearTo"
                                        name="buildYearTo"
                                        className={`bg-transparent outline-none border-none w-28 pr-1 ${space_grotesk.className}`}
                                        value={buildYearTo || ""}
                                        onKeyDown={checkForInputEnterPress}
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
                                    <input
                                        id="renovationYearFrom"
                                        name="renovationYearFrom"
                                        className={`bg-transparent outline-none border-none w-28 pr-1 ${space_grotesk.className}`}
                                        value={renovationYearFrom || ""}
                                        onKeyDown={checkForInputEnterPress}
                                        onChange={(e) => {
                                            setrenovationYearFrom(e.target.value);
                                        }}
                                    />
                                </div>
                                <Typography className="mx-2 mt-2">{t("to")}</Typography>
                                <div className="mt-2 border border-zinc-400 inline-flex flex-row px-2 py-1 rounded-md shadow-sm">
                                    <input
                                        id="renovationYearTo"
                                        name="renovationYearTo"
                                        className={`bg-transparent outline-none border-none w-28 pr-1 ${space_grotesk.className}`}
                                        value={renovationYearTo || ""}
                                        onKeyDown={checkForInputEnterPress}
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
                                className={`mt-2 outline-none border-none ${space_grotesk.className}`}
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
                    </div>
                    {/* SHOW MORE FILTERS SECTION END */}

                    <div className="mt-6">
                        <Button.Primary label={t("search")} onClick={handleFilterChange} />
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
                </div>
                <div className="flex-1 container mx-auto px-2 pb-8">
                    <div className="flex md:flex-row flex-col-reverse justify-between items-center mt-4">
                        <Typography className="whitespace-nowrap mr-auto mt-1 md:mt-0" bold>
                            {listings.count} {listings.count === 1 ? t("listing") : t("listings")}
                        </Typography>

                        <div className="flex flex-row justify-end items-center w-full">
                            <div className="flex flex-row bg-zinc-50 mr-2 rounded-md relative shadow-sm">
                                <div
                                    className={`absolute h-full w-1/2 p-1 transition-all ${
                                        useCards ? "" : "translate-x-full"
                                    }`}
                                >
                                    <div className="h-full w-full bg-zinc-300 rounded-md"></div>
                                </div>
                                <Button.Transparent
                                    className="z-20 hover:bg-transparent"
                                    onClick={() => {
                                        handleUseCardsChange(true);
                                    }}
                                >
                                    <Icon name="cards" />
                                </Button.Transparent>
                                <Button.Transparent
                                    className="ml-1 z-20 hover:bg-transparent"
                                    onClick={() => {
                                        handleUseCardsChange(false);
                                    }}
                                >
                                    <Icon name="list" />
                                </Button.Transparent>
                            </div>
                            <div className="flex-1 md:flex-none" />
                            <div className="flex flex-row items-center ml-4">
                                <label htmlFor="sort">
                                    <Typography>{t("sort")}:</Typography>
                                </label>
                                <select
                                    onChange={(e) => {
                                        handleSortChange(e.target.value);
                                    }}
                                    id="sort"
                                    className={`ml-1 bg-white p-2 !pr-1 rounded shadow-sm ${space_grotesk.className}`}
                                    defaultValue={selectedSort}
                                >
                                    <option value="createdAt-desc">{t("newest-first")}</option>
                                    <option value="createdAt-asc">{t("oldest-first")}</option>
                                    <option value="price-asc">{t("cheapest-first")}</option>
                                    <option value="price-desc">{t("expensive-first")}</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div
                        className={`${
                            useCards
                                ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-x-3 gap-y-3"
                                : "space-y-6 max-w-3xl 2xl:max-w-5xl mx-auto"
                        } mt-2`}
                    >
                        {listings.data.length === 0 && (
                            <div className="col-span-4 py-8">
                                <NoData title={t("none-found")} />
                            </div>
                        )}
                        {listings.data.map((listing) => {
                            if (useCards) {
                                return <ListingCardItem key={listing.prettyId} listing={listing} />;
                            } else {
                                return <ListingListItem key={listing.prettyId} listing={listing} />;
                            }
                        })}
                    </div>
                    <div className="mb-4 mt-8 flex justify-center items-center">
                        <Pagination currentPage={listings.page} maxPage={listings.totalPages} />
                    </div>
                </div>
            </Main>
            <Footer className="!mt-0" />
        </>
    );
}
