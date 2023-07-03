import Navbar from "@/components/Navbar";
import Typography from "@/components/Typography";
import {
    ListingBasic,
    OfferingType,
    PaginatedListingBasic,
    PropertyType,
    findListingsByQuery,
} from "@/util/api";
import { GetServerSideProps } from "next";
import React, { useState } from "react";
import Image from "next/image";
import IconRow from "@/components/listing/IconRow";
import Link from "@/components/Link";
import { useTranslations } from "next-intl";
import Input from "@/components/Input";
import Button from "@/components/Button";
import Pagination from "@/components/Pagination";
import { useRouter } from "next/router";
import { ParsedUrlQuery } from "querystring";
import { space_grotesk } from "@/util/fonts";
import Icon from "@/components/Icon";

export const getServerSideProps: GetServerSideProps = async ({ query, locale }) => {
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

    const { data } = await findListingsByQuery(
        propertyTypes,
        offeringTypes,
        page,
        priceFrom,
        priceTo,
        sortBy,
        sortDirectionTyped
    );

    return {
        props: {
            messages: (await import(`../../locales/${locale || "hr"}.json`)).default,
            listings: data,
            params: query || {},
        },
    };
};

interface UIBlockProps {
    listing: ListingBasic;
}
function ListingCard({ listing }: UIBlockProps) {
    const t = useTranslations("ListingsPage");

    function getPropertyMedia(p: ListingBasic) {
        if (p.apartment) {
            return p.apartment.media;
        } else if (p.house) {
            return p.house.media;
        } else {
            return p.land!.media;
        }
    }

    function getPropertyLocationString(p: ListingBasic) {
        let region: string | null = null;
        let city: string | null = null;
        let street: string | null = null;

        if (p.apartment) {
            region = p.apartment.region;
            city = p.apartment.city;
            street = p.apartment.street;
        } else if (p.house) {
            region = p.house.region;
            city = p.house.city;
            street = p.house.street;
        } else {
            region = p.land!.region;
            city = p.land!.city;
            street = p.land!.street;
        }

        let locationStr = "";
        if (street) {
            locationStr += street;
        }
        if (city) {
            if (locationStr.length > 0) {
                locationStr += `, ${city}`;
            } else {
                locationStr += city;
            }
        }
        if (region) {
            if (locationStr.length > 0) {
                locationStr += `, ${region}`;
            } else {
                locationStr += region;
            }
        }

        return locationStr;
    }

    function getPriceString(p: ListingBasic) {
        if (p.offeringType === OfferingType.shortTermRent) {
            return ` ${t("per-night")}`;
        } else if (p.offeringType === OfferingType.longTermRent) {
            return ` ${t("per-month")}`;
        }
    }

    function getPropertyTypeAndOfferingTypeString(p: ListingBasic) {
        let s: string = "";

        if (p.apartment) {
            s += t("apartment");
        } else if (p.house) {
            s += t("house");
        } else {
            s += t("land");
        }

        s += " • ";

        if (
            p.offeringType === OfferingType.shortTermRent ||
            p.offeringType === OfferingType.longTermRent
        ) {
            s += t("rent");
        } else {
            s += t("sale");
        }
        return s;
    }

    const firstImage = getPropertyMedia(listing).at(0);

    return (
        <div className="bg-zinc-50 border border-zinc-300 w-full rounded-lg shadow-sm hover:shadow transition-all overflow-hidden">
            <div
                className="w-full relative"
                style={{
                    minHeight: "200px",
                }}
            >
                {firstImage ? (
                    <Image
                        src={firstImage?.url}
                        alt="media image"
                        fill
                        style={{
                            objectFit: "cover",
                            height: "100%",
                            width: "100%",
                        }}
                        // Since this is just a thumbnail, we can lower the quality
                        quality={50}
                    />
                ) : (
                    <div>
                        {/* TODO: Find something better than this */}
                        No Image
                    </div>
                )}
            </div>
            <div className="flex flex-col w-full h-full">
                <div className="p-2">
                    <div
                        style={{
                            fontSize: "11px",
                        }}
                    >
                        <Typography className="tracking-widest text-zinc-500" uppercase>
                            {getPropertyTypeAndOfferingTypeString(listing)}
                        </Typography>
                    </div>
                    <div
                        style={{
                            minHeight: "3.5em",
                            height: "3.5em",
                            maxHeight: "3.5em",
                        }}
                    >
                        <Typography variant="h2" className="line-clamp-2 text-base">
                            {listing.title}
                        </Typography>
                    </div>
                    <div>
                        <Typography variant="secondary" uppercase>
                            {getPropertyLocationString(listing)}
                        </Typography>
                    </div>
                    <div className="mt-2 w-full flex items-center justify-center">
                        <IconRow
                            listing={listing}
                            containerClassName="!bg-transparent !shadow-none"
                        />
                    </div>
                </div>
                <div className="bg-zinc-300 h-px w-full mt-2" />
                <div className="flex flex-row items-center p-2">
                    <div>
                        <Typography className="text-sm">
                            {t("posted")}:{" "}
                            <Typography variant="span" className="text-sm font-normal">
                                {new Date(listing.createdAt)
                                    .toLocaleDateString(undefined, {
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric",
                                    })
                                    .replaceAll("/", ".")}
                            </Typography>
                        </Typography>
                    </div>
                    <div className="flex-1" />
                    <div>
                        <Typography bold className="text-xl">
                            {listing.price.toLocaleString()} €{" "}
                            <Typography variant="span" className="text-sm font-normal">
                                {getPriceString(listing)}
                            </Typography>
                        </Typography>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ListingListItem({ listing }: UIBlockProps) {
    const t = useTranslations("ListingsPage");

    function getPropertyMedia(p: ListingBasic) {
        if (p.apartment) {
            return p.apartment.media;
        } else if (p.house) {
            return p.house.media;
        } else {
            return p.land!.media;
        }
    }

    function getPropertyLocationString(p: ListingBasic) {
        let region: string | null = null;
        let city: string | null = null;
        let street: string | null = null;

        if (p.apartment) {
            region = p.apartment.region;
            city = p.apartment.city;
            street = p.apartment.street;
        } else if (p.house) {
            region = p.house.region;
            city = p.house.city;
            street = p.house.street;
        } else {
            region = p.land!.region;
            city = p.land!.city;
            street = p.land!.street;
        }

        let locationStr = "";
        if (street) {
            locationStr += street;
        }
        if (city) {
            if (locationStr.length > 0) {
                locationStr += `, ${city}`;
            } else {
                locationStr += city;
            }
        }
        if (region) {
            if (locationStr.length > 0) {
                locationStr += `, ${region}`;
            } else {
                locationStr += region;
            }
        }

        return locationStr;
    }

    function getPriceString(p: ListingBasic) {
        if (p.offeringType === OfferingType.shortTermRent) {
            return ` ${t("per-night")}`;
        } else if (p.offeringType === OfferingType.longTermRent) {
            return ` ${t("per-month")}`;
        }
    }

    function getPropertyTypeAndOfferingTypeString(p: ListingBasic) {
        let s: string = "";

        if (p.apartment) {
            s += t("apartment");
        } else if (p.house) {
            s += t("house");
        } else {
            s += t("land");
        }

        s += " • ";

        if (
            p.offeringType === OfferingType.shortTermRent ||
            p.offeringType === OfferingType.longTermRent
        ) {
            s += t("rent");
        } else {
            s += t("sale");
        }
        return s;
    }

    const firstImage = getPropertyMedia(listing).at(0);

    return (
        <div className="flex flex-row bg-zinc-50 rounded-md shadow hover:shadow-sm transition-all w-full overflow-hidden">
            <div className="w-96 h-52">
                {firstImage ? (
                    <div className="select-none relative w-full h-full">
                        <Image
                            src={firstImage?.url}
                            alt="media image"
                            fill
                            style={{
                                objectFit: "cover",
                                height: "100%",
                                width: "100%",
                            }}
                            // Since this is just a thumbnail, we can lower the quality
                            quality={50}
                        />
                    </div>
                ) : (
                    // TODO: Find something better than this
                    <div>No image</div>
                )}
            </div>
            <div className="p-4 flex flex-col w-full h-full">
                <div
                    style={{
                        fontSize: "11px",
                    }}
                >
                    <Typography className="tracking-widest text-zinc-500" uppercase>
                        {getPropertyTypeAndOfferingTypeString(listing)}
                    </Typography>
                </div>
                <div
                    style={{
                        minHeight: "4em",
                        height: "4em",
                        maxHeight: "4em",
                    }}
                >
                    <Typography variant="h2" className="line-clamp-2">
                        {listing.title}
                    </Typography>
                </div>
                <div>
                    <Typography variant="secondary" uppercase>
                        {getPropertyLocationString(listing)}
                    </Typography>
                </div>
                <div className="mt-2">
                    <IconRow listing={listing} />
                </div>
                {/* Push the price element to the end */}
                <div className="flex-1" />
                <div className="flex flex-row w-full items-center">
                    <div>
                        <Typography className="text-sm">
                            {t("posted")}:{" "}
                            <Typography variant="span" className="text-sm font-normal">
                                {new Date(listing.createdAt)
                                    .toLocaleDateString(undefined, {
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric",
                                    })
                                    .replaceAll("/", ".")}
                            </Typography>
                        </Typography>
                    </div>
                    <div className="flex-1" />
                    <div>
                        <Typography bold className="text-xl">
                            {listing.price.toLocaleString()} €{" "}
                            <Typography variant="span" className="text-sm font-normal">
                                {getPriceString(listing)}
                            </Typography>
                        </Typography>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface ListingsPageProps {
    listings: PaginatedListingBasic;
    params: ParsedUrlQuery | undefined;
}
export default function ListingsPage({ listings, params }: ListingsPageProps) {
    const t = useTranslations("ListingsPage");

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

    const router = useRouter();

    async function handlePageChange(newPage: number) {
        const oldParams = params ? { ...params } : {};
        await router.push(
            {
                pathname: "/listings",
                query: { ...oldParams, page: newPage },
            },
            undefined,
            {
                // I'm not sure how to show a "loading" state when getServerSideProps runs, so just do this instead and manually reload the page
                shallow: true,
            }
        );
        router.reload();
    }

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

        // Restart to first page when filter changes
        delete allParams.page;
        await router.push(
            {
                pathname: "/listings",
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
            pathname: "/listings",
            query: { ...allParams },
        });
        setUseCards(useCards);
    }

    async function handleSortChange(newSort: string) {
        let allParams = params ? { ...params } : {};
        const [sortField, sortDirection] = newSort.split("-");

        allParams.sortBy = sortField;
        allParams.sortDirection = sortDirection;

        await router.push(
            {
                pathname: "/listings",
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
            <header className="z-30">
                <Navbar />
            </header>
            <main className="flex-1 flex flex-col md:flex-row border-t border-zinc-300">
                <div
                    className="md:w-1/4 min-h-full border-r border-zinc-300 px-2 pt-4 flex flex-col"
                    style={{
                        maxWidth: "420px",
                    }}
                >
                    <Typography variant="h2">{t("filter")}</Typography>

                    <div className="w-full mt-8">
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

                    <div className="mt-8">
                        <Typography bold>{t("price")}</Typography>
                        <div className="flex flex-row flex-wrap items-center ml-2">
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
                        <Button.Primary label={t("search")} onClick={handleFilterChange} />
                    </div>
                </div>
                <div className="flex-1 container mx-auto px-2 pb-8">
                    <div className="flex flex-row justify-between items-center mt-4">
                        <Typography>
                            {listings.count} {listings.count === 1 ? t("listing") : t("listings")}
                        </Typography>

                        <div className="flex flex-row justify-center items-center">
                            <div className="flex flex-row bg-zinc-50 mr-2 rounded-md relative shadow-sm">
                                <div
                                    className={`absolute h-full w-1/2 p-1 transition-all ${
                                        useCards ? "" : "translate-x-full"
                                    }`}
                                >
                                    <div className="h-full w-full bg-zinc-300 rounded-md"></div>
                                </div>
                                <Button.Transparent
                                    className="z-30 hover:bg-transparent"
                                    onClick={() => {
                                        handleUseCardsChange(true);
                                    }}
                                >
                                    <Icon name="cards" />
                                </Button.Transparent>
                                <Button.Transparent
                                    className="ml-1 z-30 hover:bg-transparent"
                                    onClick={() => {
                                        handleUseCardsChange(false);
                                    }}
                                >
                                    <Icon name="list" />
                                </Button.Transparent>
                            </div>
                            <div className="flex flex-row items-center ml-4">
                                <label htmlFor="sort">
                                    <Typography>{t("sort")}:</Typography>
                                </label>
                                <select
                                    onChange={(e) => {
                                        handleSortChange(e.target.value);
                                    }}
                                    id="sort"
                                    className={`ml-1 bg-white p-1.5 !pr-1 rounded-sm shadow-sm ${space_grotesk.className}`}
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
                                ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-x-4 gap-y-6"
                                : "space-y-6 max-w-3xl 2xl:max-w-5xl mx-auto"
                        } mt-2`}
                    >
                        {listings.data.map((listing) => {
                            if (useCards) {
                                return (
                                    <Link
                                        key={listing.prettyId}
                                        to={`/listing/${listing.prettyId}`}
                                        className="flex"
                                        disableAnimatedHover
                                    >
                                        <ListingCard listing={listing} />
                                    </Link>
                                );
                            } else {
                                return (
                                    <Link
                                        key={listing.prettyId}
                                        to={`/listing/${listing.prettyId}`}
                                        className="flex"
                                        disableAnimatedHover
                                    >
                                        <ListingListItem listing={listing} />
                                    </Link>
                                );
                            }
                        })}
                    </div>
                    {listings.totalPages > 1 && (
                        <div className="mb-4 flex justify-center items-center">
                            <Pagination
                                currentPage={listings.page}
                                maxPage={listings.totalPages}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}
