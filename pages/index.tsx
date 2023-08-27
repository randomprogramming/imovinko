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
import Footer from "@/components/Footer";
import Head from "next/head";
import Icon from "@/components/Icon";
import ListingCardItem from "@/components/listing/ListingCardItem";
import Main from "@/components/Main";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
    const newest = await findListingsByQuery({
        propertyType: [PropertyType.apartment, PropertyType.apartment, PropertyType.land],
        offeringType: [OfferingType.longTermRent, OfferingType.sale, OfferingType.shortTermRent],
        page: 1,
        sortBy: "createdAt",
        sortDirection: "desc",
        pageSize: 4,
    });
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

    return (
        <>
            <Head>
                <title>Imovinko</title>
                <meta
                    name="description"
                    content="Imovinko - oglasnik za nekretnine. Pronađite svoj dom."
                />
                <meta
                    name="keywords"
                    content="oglasnik, nekretnina, kuća, stan, zemljište, kupovina, prodaja, najam"
                />
            </Head>
            <header className="container mx-auto absolute left-0 right-0  px-1 lg:px-2 xl:px-4 z-30">
                <Navbar lightIcons />
            </header>
            <Main className="flex-1">
                <section className="container mx-auto p-1">
                    <div className="relative h-[660px] md:h-[720px] w-full rounded-lg md:rounded-2xl xl:rounded-3xl overflow-hidden">
                        <div className="absolute left-0 right-0 top-0 bottom-0 z-20">
                            <div className="flex flex-col h-full items-center justify-center max-w-[90%] md:max-w-[75%] mx-auto">
                                <div className="backdrop-blur-2xl flex flex-col items-center space-y-6 rounded-3xl p-6">
                                    <Typography
                                        font="work_sans"
                                        className="text-4xl md:text-5xl lg:text-6xl text-center text-black"
                                        bold
                                        uppercase
                                    >
                                        {t("header")}
                                    </Typography>
                                    <div>
                                        <Link
                                            to="/listings"
                                            disableAnimatedHover
                                            className="self-end flex flex-row items-center bg-[#ececec] border-zinc-400 border rounded-xl w-fit pl-4 pr-6 py-3 -translate-y-2"
                                        >
                                            <Icon
                                                name="solo-arrow"
                                                width={28}
                                                height={28}
                                                className="animate-bounce-light stroke-2"
                                            />
                                            <Typography
                                                bold
                                                uppercase
                                                className="tracking-wide text-lg"
                                            >
                                                {t("search")}
                                            </Typography>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0">
                            <div className="flex items-center justify-center">
                                <div className="translate-y-2 w-full max-w-[90%] md:max-w-[75%] flex flex-row justify-evenly mt-auto z-20 relative bg-[#ececec] py-2 rounded-t-2xl">
                                    <div className="flex flex-col items-center justify-center">
                                        <Typography className="text-2xl" bold>
                                            {convert(counts.house)}
                                            <Typography className="text-emerald-700" variant="span">
                                                +
                                            </Typography>
                                        </Typography>
                                        <Typography>{t("houses")}</Typography>
                                    </div>
                                    <div className="flex flex-col items-center justify-center">
                                        <Typography className="text-2xl" bold>
                                            {convert(counts.apartment)}
                                            <Typography className="text-emerald-700" variant="span">
                                                +
                                            </Typography>
                                        </Typography>
                                        <Typography>{t("apartments")}</Typography>
                                    </div>
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
                        </div>
                        <Image
                            src="/images/homepage-new.jpg"
                            alt="architecture"
                            fill
                            className="object-cover w-full h-full z-10"
                        />
                    </div>
                </section>

                <section className="container mx-auto mt-4">
                    <Link
                        disableAnimatedHover
                        to="/map"
                        className="flex overflow-hidden sm:rounded-xl relative group w-full h-64 hover:shadow-sm transition-all"
                    >
                        <div className="flex-1 flex absolute top-0 left-0 right-0 bottom-0 bg-[url('/images/map.jpg')] bg-cover blur-[3px] group-hover:blur-sm transition-all"></div>
                        <div className="flex-1 relative z-20 flex items-center justify-center text-center">
                            <Typography className="text-4xl tracking-widest" bold uppercase>
                                {t("open-map")}
                            </Typography>
                        </div>
                    </Link>
                </section>

                <section className="container mx-auto mt-8">
                    <Typography variant="h1">{t("newest-ads")}</Typography>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 w-full gap-4">
                        {newestListings.map((l) => {
                            return <ListingCardItem key={l.prettyId} listing={l} />;
                        })}
                    </div>
                </section>
            </Main>
            <Footer />
        </>
    );
}
