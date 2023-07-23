import React from "react";
import Navbar from "@/components/Navbar";
import Typography from "@/components/Typography";
import { GetServerSideProps } from "next";
import Image from "next/image";
import Link from "@/components/Link";
import {
    ListingBasic,
    OfferingType,
    PropertyCount,
    PropertyType,
    findListingsByQuery,
    getPropertyCount,
} from "@/util/api";
import { useTranslations } from "next-intl";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
    const newest = await findListingsByQuery(
        [PropertyType.apartment, PropertyType.apartment, PropertyType.land],
        [OfferingType.longTermRent, OfferingType.sale, OfferingType.shortTermRent],
        1,
        undefined,
        undefined,
        "createdAt",
        "desc",
        4
    );
    const counts = await getPropertyCount();

    return {
        props: {
            messages: (await import(`../locales/${locale || "hr"}.json`)).default,
            newestListings: newest.data.data,
            counts: counts.data,
        },
    };
};

interface HomeProps {
    newestListings: ListingBasic[];
    counts: PropertyCount;
}
export default function Home({ newestListings, counts }: HomeProps) {
    const t = useTranslations("Home");

    function convert(value: number) {
        var length = (Math.abs(value) + "").length,
            index = Math.ceil((length - 3) / 3),
            suffix = ["k", "m", "b", "t"];

        if (length < 4) return value;

        return (value / Math.pow(1000, index)).toFixed(1).replace(/\.0$/, "") + suffix[index - 1];
    }

    function getPriceString(p: ListingBasic) {
        if (p.offeringType === OfferingType.shortTermRent) {
            return ` ${t("per-night")}`;
        } else if (p.offeringType === OfferingType.longTermRent) {
            return ` ${t("per-month")}`;
        }
    }

    function getOfferingTypeString(l: OfferingType) {
        if (l === OfferingType.longTermRent) {
            return t("long-term-rent");
        } else if (l === OfferingType.shortTermRent) {
            return t("short-term-rent");
        } else {
            return t("for-sale");
        }
    }

    return (
        <>
            <header className="absolute top-0 container mx-auto left-0 right-0 z-20">
                <Navbar />
            </header>
            <main>
                <section className="container mx-auto">
                    <div className="w-full">
                        <div className="flex flex-row">
                            <div className="flex-1 flex flex-col items-center justify-center pt-24">
                                <Typography variant="h1" className="text-7xl text-center max-w-lg">
                                    {t("header")}
                                </Typography>

                                <div className="mt-6 text-zinc-50 flex flex-row justify-evenly rounded-md shadow overflow-hidden text-lg">
                                    <Link
                                        to="/listings"
                                        query={{
                                            offeringTypes: OfferingType.sale,
                                        }}
                                        className="flex items-center justify-center py-2 px-4 bg-emerald-700 hover:bg-emerald-800 transition-all"
                                    >
                                        <Typography bold>{t("buying")}</Typography>
                                    </Link>
                                    <Link
                                        to="/listings"
                                        query={{
                                            offeringTypes: OfferingType.longTermRent,
                                        }}
                                        className="flex items-center justify-center py-2 px-4 bg-emerald-700 hover:bg-emerald-800 transition-all border-l-2 border-[#ececec]"
                                    >
                                        <Typography bold>{t("renting-long")}</Typography>
                                    </Link>
                                    <Link
                                        to="/listings"
                                        query={{
                                            offeringTypes: OfferingType.shortTermRent,
                                        }}
                                        className="flex items-center justify-center py-2 px-4 bg-emerald-700 hover:bg-emerald-800 transition-all border-l-2 border-[#ececec]"
                                    >
                                        <Typography bold>{t("renting-short")}</Typography>
                                    </Link>
                                </div>
                                <Typography className="mt-4 text-lg">
                                    {t("have-a-property-to")}{" "}
                                    <Link to="/list" underlineClassName="!bg-emerald-700">
                                        <Typography
                                            className="text-emerald-700"
                                            variant="span"
                                            bold
                                        >
                                            {t("list")}
                                        </Typography>
                                    </Link>
                                </Typography>
                                <div className="flex flex-row w-full justify-evenly mt-auto">
                                    <div className="flex flex-col items-center justify-center">
                                        <Typography className="text-2xl" bold>
                                            {convert(counts.apartment)}
                                            <Typography className="text-emerald-700" variant="span">
                                                +
                                            </Typography>
                                        </Typography>
                                        <Typography>{t("apartments")}</Typography>
                                    </div>
                                    <div className="h-full w-0.5 bg-zinc-300 rounded-full shadow-sm"></div>
                                    <div className="flex flex-col items-center justify-center">
                                        <Typography className="text-2xl" bold>
                                            {convert(counts.house)}
                                            <Typography className="text-emerald-700" variant="span">
                                                +
                                            </Typography>
                                        </Typography>
                                        <Typography>{t("houses")}</Typography>
                                    </div>
                                    <div className="h-full w-0.5 bg-zinc-300 rounded-full shadow-sm"></div>
                                    <div className="flex flex-col items-center justify-center">
                                        <Typography className="text-2xl" bold>
                                            {convert(counts.land)}
                                            <Typography className="text-emerald-700" variant="span">
                                                +
                                            </Typography>
                                        </Typography>
                                        <Typography>{t("land")}</Typography>
                                    </div>
                                </div>
                            </div>
                            <div
                                className="flex-1 relative rounded-b-3xl overflow-hidden shadow-2xl md:ml-4"
                                style={{
                                    height: "650px",
                                }}
                            >
                                <Image
                                    src={"/images/homepage-side-bg.jpg"}
                                    alt="house"
                                    fill
                                    style={{
                                        objectFit: "cover",
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                <section className="container mx-auto mt-12">
                    <Typography variant="h1">{t("newest-ads")}</Typography>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 w-full gap-4">
                        {newestListings.map((l) => {
                            const apartmentMedia = l.apartment?.media;
                            const houseMedia = l.house?.media;
                            const landMedia = l.land?.media;

                            const media = apartmentMedia || houseMedia || landMedia;

                            return (
                                <Link
                                    key={l.prettyId}
                                    to={`/listing/${l.prettyId}`}
                                    className="bg-zinc-200 shadow-sm hover:shadow-md rounded-lg hover:rounded-xl transition-all overflow-hidden"
                                >
                                    {media && (
                                        <img
                                            className="h-64 w-full object-cover rounded-b-lg"
                                            src={`${media[0].url}`}
                                        />
                                    )}
                                    <div className="relative">
                                        <div className="absolute bg-emerald-700 text-zinc-50 left-4 -translate-y-1/2 px-2 py-0.5 rounded">
                                            <Typography>
                                                {getOfferingTypeString(l.offeringType)}
                                            </Typography>
                                        </div>
                                    </div>
                                    <div
                                        className="px-2 mt-3"
                                        style={{
                                            minHeight: "3.5em",
                                            height: "3.5em",
                                            maxHeight: "3.5em",
                                        }}
                                    >
                                        <Typography variant="h2" className="line-clamp-2">
                                            {l.title}
                                        </Typography>
                                    </div>
                                    <div className="flex flex-row px-2 pb-1">
                                        <div className="flex-1" />
                                        <Typography bold className="text-xl">
                                            {l.price.toLocaleString()} €{" "}
                                            <Typography
                                                variant="span"
                                                className="text-sm font-normal"
                                            >
                                                {getPriceString(l)}
                                            </Typography>
                                        </Typography>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </section>
            </main>
        </>
    );
}
