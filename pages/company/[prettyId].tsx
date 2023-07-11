import Icon from "@/components/Icon";
import Link from "@/components/Link";
import Navbar from "@/components/Navbar";
import Typography from "@/components/Typography";
import IconRow from "@/components/listing/IconRow";
import { CompanyWithListings, ListingBasic, OfferingType, getCompanyByPrettyId } from "@/util/api";
import { GetServerSideProps } from "next";
import { useTranslations } from "next-intl";
import React from "react";
import Image from "next/image";
import Pagination from "@/components/Pagination";

export const getServerSideProps: GetServerSideProps = async ({ params, locale }) => {
    let company: CompanyWithListings | null = null;
    if (!params?.prettyId || Array.isArray(params.prettyId)) {
        return {
            props: {
                messages: (await import(`../../locales/${locale || "hr"}.json`)).default,
                company,
            },
        };
    }
    try {
        company = (await getCompanyByPrettyId(params.prettyId)).data;
    } catch (e) {
        console.error("Failed to fetch company");
    }

    return {
        props: {
            messages: (await import(`../../locales/${locale || "hr"}.json`)).default,
            company,
        },
    };
};

function ListingListItem({ listing }: { listing: ListingBasic }) {
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

interface CompanyByPrettyIdPageProps {
    company: CompanyWithListings;
}
export default function CompanyByPrettyIdPage({ company }: CompanyByPrettyIdPageProps) {
    const t = useTranslations("CompanyByPrettyIdPage");

    function hideHttps(link: string) {
        if (link.startsWith("https://www.")) {
            return link.split("https://www.")[1];
        }
        return link;
    }

    return (
        <>
            <header>
                <Navbar />
            </header>
            <main className="container mx-auto max-w-3xl mt-8">
                {company ? (
                    <div>
                        <div className="flex flex-col sm:flex-row">
                            <div
                                className="bg-zinc-100 rounded-xl shadow"
                                style={{
                                    minWidth: "280px",
                                    maxWidth: "420px",
                                }}
                            >
                                <div className="border-b-2 border-b-zinc-300 px-8 py-6 flex flex-col items-center justify-center">
                                    <Icon name="account" height={64} width={64} />
                                    <Typography bold>
                                        {company.storeName || company.name}
                                    </Typography>
                                    {company.website && (
                                        <Link
                                            newTab
                                            to={company.website}
                                            className="text-blue-700 mt-1"
                                            underlineClassName="!bg-blue-700"
                                        >
                                            <Typography className="text-sm">
                                                {hideHttps(company.website)}
                                            </Typography>
                                        </Link>
                                    )}
                                </div>
                                <div className="p-3">
                                    <table>
                                        <tbody>
                                            <tr>
                                                <td>
                                                    <Typography className="text-zinc-500" sm>
                                                        {t("joined")}:
                                                    </Typography>
                                                </td>
                                                <td className="pl-1">
                                                    <Typography bold className="text-sm" sm>
                                                        {new Date(company.createdAt)
                                                            .toLocaleDateString(undefined, {
                                                                day: "2-digit",
                                                                month: "2-digit",
                                                                year: "numeric",
                                                            })
                                                            .replaceAll("/", ".")}
                                                    </Typography>
                                                </td>
                                            </tr>

                                            <tr>
                                                <td>
                                                    <Typography className="text-zinc-500" sm>
                                                        {t("listings")}:
                                                    </Typography>
                                                </td>
                                                <td className="pl-1">
                                                    <Typography bold sm>
                                                        {company.listings.count}
                                                    </Typography>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="sm:ml-4">
                                <Typography variant="h1">{company.name}</Typography>
                                <Typography>{company.description}</Typography>
                            </div>
                        </div>
                        {/* TODO: Info about company agents somewhere here */}
                        <div className="w-full mt-8">
                            <Typography variant="h2">Oglasi Tvrdke</Typography>
                            <div className="mt-6 space-y-8">
                                {company.listings.data.map((l) => {
                                    return (
                                        <Link
                                            disableAnimatedHover
                                            className="flex"
                                            key={l.prettyId}
                                            to={`/listing/${l.prettyId}`}
                                        >
                                            <ListingListItem listing={l} />
                                        </Link>
                                    );
                                })}
                            </div>
                            <div className="flex items-center justify-center my-6">
                                {company.listings.totalPages > 1 && (
                                    <Pagination
                                        currentPage={company.listings.page}
                                        maxPage={company.listings.totalPages}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    // TODO: Create a 404 page
                    <div>No company found</div>
                )}
            </main>
        </>
    );
}
