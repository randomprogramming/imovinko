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
import { poppins } from "@/util/fonts";
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
            <header className="container mx-auto left-0 right-0 z-20">
                <Navbar />
            </header>
            <Main className="flex-1">
                <section className="max-w-5xl mx-auto w-full">
                    <div className="w-full">
                        <div className="flex flex-col-reverse md:flex-row container mx-auto">
                            <div className="md:translate-y-10 z-10 flex-1 flex flex-col bg-[#ececec] rounded-xl md:bg-transparent md:rounded-none pt-0">
                                <div className="flex flex-col h-full">
                                    <div className="relative group flex-1">
                                        <div className="group-hover:scale-105 transition-all hidden md:flex absolute -top-4 left-1/2 -translate-x-1/2 bg-[#ececec] px-4 py-1 rounded-lg z-30">
                                            <Typography
                                                className={`${poppins.className} text-2xl tracking-wide`}
                                                bold
                                            >
                                                imovinko
                                            </Typography>
                                        </div>
                                        <Link
                                            to="/listings"
                                            disableAnimatedHover
                                            className="group-hover:scale-105 transition-all bg-gradient-to-tr flex flex-col shadow-sm from-[#058E3F] to-[#004346] w-full sm:rounded-xl flex-1 relative lg:pt-16 md:pt-4 overflow-hidden"
                                        >
                                            <div className="relative overflow-hidden p-4 h-full flex flex-col">
                                                <Typography
                                                    variant="h1"
                                                    className="text-6xl text-zinc-50 max-w-lg"
                                                >
                                                    {t("header")}
                                                </Typography>
                                                <div className="flex-1" />
                                                <div className="mt-8 relative z-30">
                                                    <div className="flex flex-row items-center bg-[#ececec] border-zinc-400 border rounded-lg w-fit px-4 py-1">
                                                        <Icon
                                                            name="solo-arrow"
                                                            width={36}
                                                            height={36}
                                                        />
                                                        <Typography
                                                            bold
                                                            uppercase
                                                            className="tracking-wide"
                                                        >
                                                            {t("search")}
                                                        </Typography>
                                                    </div>
                                                </div>
                                                <div className="absolute -bottom-12 -right-12 xl:-bottom-6">
                                                    <img
                                                        src="/images/removal2.png"
                                                        className="relative h-44 sm:h-56 md:h-64 z-20"
                                                    />
                                                </div>
                                            </div>
                                        </Link>
                                    </div>

                                    <div className="flex flex-col sm:flex-row flex-1 mt-4">
                                        <Link
                                            to="/map"
                                            className="flex-1 flex overflow-hidden sm:rounded-xl relative group w-full h-full min-h-[160px]"
                                        >
                                            <div className="flex-1 flex absolute top-0 left-0 right-0 bottom-0 bg-[url('/images/map.jpg')] bg-cover blur-[3px] group-hover:blur-sm transition-all"></div>
                                            <div className="flex-1 relative z-20 flex items-center justify-center text-center">
                                                <Typography
                                                    className="text-3xl tracking-widest"
                                                    bold
                                                    uppercase
                                                >
                                                    {t("open-map")}
                                                </Typography>
                                            </div>
                                        </Link>

                                        {/* <div
                                            className="hidden w-full aspect-square"
                                            style={{
                                                maxWidth: "210px",
                                            }}
                                        >
                                            <Link
                                                disableAnimatedHover
                                                className="hover:scale-105 z-20 transition-all flex w-full h-full bg-gradient-to-tr from-[#c1c6ef] to-[#949deb] rounded-xl relative"
                                                to="/list"
                                            >
                                                <Typography
                                                    uppercase
                                                    bold
                                                    className="text-lg absolute top-0 left-1/2 -translate-x-1/2 w-full tracking-widest text-center"
                                                >
                                                    {t("submit")}
                                                </Typography>
                                                <Typography
                                                    bold
                                                    uppercase
                                                    className="text-lg absolute left-0 top-1/2 -translate-x-1/2 origin-top -rotate-90 tracking-widest text-center"
                                                >
                                                    {t("submit")}
                                                </Typography>
                                                <Typography
                                                    bold
                                                    uppercase
                                                    className="text-lg absolute right-0 top-1/2 origin-top translate-x-1/2 rotate-90 tracking-widest text-center"
                                                >
                                                    {t("submit")}
                                                </Typography>
                                                <Typography
                                                    bold
                                                    uppercase
                                                    className="text-lg absolute bottom-0 left-1/2 -translate-x-1/2 rotate-180  w-full tracking-widest text-center"
                                                >
                                                    {t("submit")}
                                                </Typography>
                                                <div className="flex items-center justify-center w-full h-full">
                                                    <Icon
                                                        name="solo-arrow"
                                                        width={120}
                                                        height={120}
                                                    />
                                                </div>
                                            </Link>
                                        </div> */}
                                    </div>
                                </div>
                            </div>
                            <div className="hidden md:flex w-30 md:flex-1 relative md:ml-4 min-h-[420px] md:min-h-[540px] xl:min-h-[650px]">
                                <div className="z-20 w-3/4 absolute -bottom-8 left-1/2  -translate-x-1/2 ">
                                    <div className="flex flex-row w-full justify-evenly mt-auto z-20 relative bg-[#ececec] py-2 rounded-lg">
                                        <div className="flex flex-col items-center justify-center">
                                            <Typography className="text-2xl" bold>
                                                {convert(counts.house)}
                                                <Typography
                                                    className="text-emerald-700"
                                                    variant="span"
                                                >
                                                    +
                                                </Typography>
                                            </Typography>
                                            <Typography>{t("houses")}</Typography>
                                        </div>
                                        <div className="flex flex-col items-center justify-center">
                                            <Typography className="text-2xl" bold>
                                                {convert(counts.apartment)}
                                                <Typography
                                                    className="text-emerald-700"
                                                    variant="span"
                                                >
                                                    +
                                                </Typography>
                                            </Typography>
                                            <Typography>{t("apartments")}</Typography>
                                        </div>
                                        <div className="flex flex-col items-center justify-center">
                                            <Typography className="text-2xl" bold>
                                                {convert(counts.land)}
                                                <Typography
                                                    className="text-emerald-700"
                                                    variant="span"
                                                >
                                                    +
                                                </Typography>
                                            </Typography>
                                            <Typography>{t("land")}</Typography>
                                        </div>
                                    </div>
                                </div>
                                <Image
                                    src={"/images/homepage-side-bg.jpg"}
                                    alt="house"
                                    fill
                                    className="rounded-xl"
                                    style={{
                                        objectFit: "cover",
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                <section className="flex md:hidden">
                    <div className="flex flex-row w-full justify-evenly mt-auto z-20 relative bg-[#ececec] py-2 rounded-lg">
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
                </section>

                <section className="container mx-auto mt-4 md:mt-20 max-w-5xl">
                    <div className="bg-zinc-900 text-zinc-50 flex flex-row h-56 rounded-lg relative">
                        <div className="w-full flex flex-col items-center justify-center">
                            <Typography variant="h2">{t("have-a-property")}</Typography>
                            <Typography variant="h2">{t("dont-wait")}</Typography>
                            <Link
                                disableAnimatedHover
                                to="/list"
                                className="mt-4 flex flex-row text-zinc-900 items-center bg-[#ececec] hover:scale-110 transition-all border-zinc-400 border rounded-lg w-fit px-4 py-1"
                            >
                                <Icon name="solo-arrow" width={36} height={36} />
                                <Typography bold uppercase className="tracking-wide">
                                    {t("submit")}
                                </Typography>
                            </Link>
                        </div>
                        <img
                            src="/images/removal.png"
                            className="absolute right-0 bottom-0 h-40 sm:h-52 md:h-64 lg:h-96 z-30 "
                        />
                    </div>
                </section>

                <section className="container mx-auto mt-8 max-w-5xl">
                    <div className="bg-zinc-900 bg-[url(/images/stars.jpg)] bg-cover rounded-xl w-full text-zinc-50 p-8">
                        <Typography variant="h1" className="text-5xl">
                            {t("our-offer")}
                        </Typography>
                        <div className="flex flex-col md:flex-row space-y-8 md:space-y-0 md:space-x-8 items-center md:items-stretch justify-center mt-4">
                            <div className="flex flex-col border-2 border-zinc-800 rounded-lg p-4 w-full max-w-[275px]">
                                <Typography variant="h2" className="flex-1">
                                    {t("sale")}
                                </Typography>
                                <Typography className="mt-6">{t("sale-description")}</Typography>
                                <Link
                                    to="/listings"
                                    disableAnimatedHover
                                    query={{
                                        offeringTypes: OfferingType.sale,
                                    }}
                                    className="mt-4 flex bg-indigo-700 hover:bg-indigo-800 transition-all items-center justify-center py-3 rounded-lg"
                                >
                                    <Typography bold uppercase>
                                        {t("buying")}
                                    </Typography>
                                </Link>
                            </div>
                            <div className="flex flex-col border-2 border-zinc-800 rounded-lg p-4 w-full max-w-[275px]">
                                <Typography variant="h2" className="flex-1">
                                    {t("long-term")}
                                    <br />
                                    {t("rent")}
                                </Typography>
                                <Typography className="mt-6">{t("long-description")}</Typography>
                                <Link
                                    to="/listings"
                                    disableAnimatedHover
                                    query={{
                                        offeringTypes: OfferingType.longTermRent,
                                    }}
                                    className="mt-4 flex bg-indigo-700 hover:bg-indigo-800 transition-all items-center justify-center py-3 rounded-lg"
                                >
                                    <Typography bold uppercase>
                                        {t("renting-long")}
                                    </Typography>
                                </Link>
                            </div>
                            <div className="flex flex-col border-2 border-zinc-800 rounded-lg p-4 w-full max-w-[275px]">
                                <Typography variant="h2" className="flex-1">
                                    {t("short-term")}
                                    <br />
                                    {t("rent")}
                                </Typography>
                                <Typography className="mt-6">{t("short-description")}</Typography>
                                <Link
                                    to="/listings"
                                    disableAnimatedHover
                                    query={{
                                        offeringTypes: OfferingType.shortTermRent,
                                    }}
                                    className="mt-4 flex bg-indigo-700 hover:bg-indigo-800 transition-all items-center justify-center py-3 rounded-lg"
                                >
                                    <Typography bold uppercase>
                                        {t("renting-short")}
                                    </Typography>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="container mx-auto mt-12">
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
