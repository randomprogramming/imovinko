import Navbar from "@/components/Navbar";
import Typography from "@/components/Typography";
import { OfferingType, PaginatedListingBasic, PropertyType, findListingsByQuery } from "@/util/api";
import { GetServerSideProps } from "next";
import React, { useState } from "react";
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
    });

    return {
        props: {
            messages: (await import(`../../locales/${locale || "hr"}.json`)).default,
            listings: data,
            params: query || {},
        },
    };
};

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

    const [useCards, setUseCards] = useState(params?.useList !== "true"); // Use Cards or List UI for showing listings

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

    const router = useRouter();

    async function handleFilterChange() {
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

        // Restart to first page when filter changes
        delete allParams.page;
        await router.push(
            {
                pathname: router.pathname,
                query: { ...allParams, propertyTypes, offeringTypes },
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
                    className="md:sw-1/4 min-h-full md:border-r border-zinc-300 px-2 pt-2 flex flex-col md:max-w-sm"
                    style={{
                        minWidth: "210px",
                    }}
                >
                    <div className={`flex items-center justify-center w-full`}>
                        <Link
                            to="/map"
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

                    <div className="w-full mt-4">
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

                    <div className="w-full mt-8">
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

                    <div className="w-full mt-8">
                        <Typography bold>{t("regions")}</Typography>
                        <div className="w-full mt-2">
                            <RegionDropdown
                                selected={filterRegionShortCodes}
                                onChange={(newVal) => {
                                    setFilterRegionShortCodes(
                                        newVal.map((v) => {
                                            return {
                                                label: v.label,
                                                value: v.value,
                                            };
                                        })
                                    );
                                }}
                            />
                        </div>
                    </div>

                    <div className="mt-8">
                        <Typography bold>{t("price")}</Typography>
                        <div className="flex flex-row flex-wrap items-center">
                            <div className="mt-2 border border-zinc-400 inline-flex flex-row px-2 py-1 rounded-md shadow-sm">
                                <input
                                    id="priceFrom"
                                    name="priceFrom"
                                    className={`bg-transparent outline-none border-none w-24 pr-1 ${space_grotesk.className}`}
                                    value={priceFrom}
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
                                <input
                                    id="priceTo"
                                    name="priceTo"
                                    className={`bg-transparent outline-none border-none w-24 pr-1 ${space_grotesk.className}`}
                                    value={priceTo}
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

                    <div className="mt-8">
                        <Typography bold>{t("price-per-meter-squared")}</Typography>
                        <div className="flex flex-row flex-wrap items-center">
                            <div className="mt-2 border border-zinc-400 inline-flex flex-row px-2 py-1 rounded-md shadow-sm">
                                <input
                                    id="pricePerSquareMeterFrom"
                                    name="pricePerSquareMeterFrom"
                                    className={`bg-transparent outline-none border-none w-24 pr-1 ${space_grotesk.className}`}
                                    value={pricePerSquareMeterFrom}
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
                                    value={pricePerSquareMeterTo}
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

                    <div className="my-8">
                        <Button.Primary label={t("search")} onClick={handleFilterChange} />
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
                                    <option value="createdAt-asc">{t("newest-first")}</option>
                                    <option value="createdAt-desc">{t("oldest-first")}</option>
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
                    {listings.totalPages > 1 && (
                        <div className="mb-4 mt-8 flex justify-center items-center">
                            <Pagination currentPage={listings.page} maxPage={listings.totalPages} />
                        </div>
                    )}
                </div>
            </Main>
            <Footer className="!mt-0" />
        </>
    );
}
