import Navbar from "@/components/Navbar";
import Navigation from "@/components/account/Navigation";
import { GetServerSideProps } from "next";
import React from "react";
import cookie from "cookie";
import { PaginatedListingBasic, getMyListings } from "@/util/api";
import Typography from "@/components/Typography";
import Link from "@/components/Link";
import ListingListItem from "@/components/listing/ListingListItem";
import Pagination from "@/components/Pagination";
import { useTranslations } from "next-intl";
import Footer from "@/components/Footer";
import Head from "next/head";
import NoData from "@/components/NoData";
import Dialog from "@/components/Dialog";
import { useRouter } from "next/router";
import Icon from "@/components/Icon";
import Main from "@/components/Main";

export const getServerSideProps: GetServerSideProps = async ({ locale, req, query }) => {
    const cookies = req.headers.cookie;
    if (!cookies) {
        return {
            props: {
                messages: (await import(`../../../locales/${locale || "hr"}.json`)).default,
            },
        };
    }

    const parsed = cookie.parse(cookies);
    const jwt = parsed[process.env.NEXT_PUBLIC_JWT_COOKIE_NAME || ""];

    let myListings: PaginatedListingBasic | null = null;
    try {
        let page: number | undefined = undefined;
        if (typeof query.page === "string") {
            page = parseInt(query.page);
        }
        myListings = (await getMyListings(jwt, page)).data;
    } catch (e) {
        console.error(e);
    }

    return {
        props: {
            messages: (await import(`../../../locales/${locale || "hr"}.json`)).default,
            listings: myListings,
        },
    };
};

interface MyPropertiesPageProps {
    listings: PaginatedListingBasic;
}
export default function MyProperties({ listings }: MyPropertiesPageProps) {
    const t = useTranslations("MyPropertiesPage");

    const router = useRouter();

    return (
        <>
            <Head>
                <title>Imovinko - Moji oglasi</title>
            </Head>
            <header>
                <Navbar />
            </header>

            <Main container>
                <div className="flex flex-col lg:flex-row mt-8">
                    <Navigation />
                    <div className="px-4 flex flex-col flex-1 max-w-2xl mx-auto">
                        {router.query.listingCreated === "true" && (
                            <Dialog
                                className="mb-2"
                                type="success"
                                title={t("listing-added")}
                                message={t("listing-added-messages")}
                            />
                        )}
                        {router.query.listingUpdated === "true" && (
                            <Dialog
                                className="mb-2"
                                type="success"
                                title={t("listing-updated")}
                                message={t("listing-updated-messages")}
                            />
                        )}
                        <Typography variant="h2">
                            {t("my-listings")}
                            {` (${listings.count})`}
                        </Typography>
                        <div className="mt-6 space-y-4 w-full">
                            {listings.data.length === 0 && (
                                <NoData>
                                    <Typography>
                                        {t("no-data-message")}{" "}
                                        <Link to="/list">
                                            <Typography bold variant="span">
                                                {t("add-new")}
                                            </Typography>
                                        </Link>
                                    </Typography>
                                </NoData>
                            )}
                            {listings.data.map((l) => {
                                return (
                                    <div key={l.prettyId} className="relative flex flex-col w-full">
                                        <div className="flex-1 relative max-w-full">
                                            <ListingListItem showCustomId listing={l} />
                                        </div>
                                        <div className="flex flex-row">
                                            <div className="flex-1"></div>
                                            <div className="flex flex-row items-center bg-zinc-50 rounded shadow-sm mt-1 border border-zinc-300">
                                                {/* TODO: Finish these buttons */}
                                                <button
                                                    disabled
                                                    className="outline-none hover:bg-zinc-200 transition-all p-2 flex items-center justify-center border-r border-zinc-300"
                                                >
                                                    <Icon name="close" className="fill-red-600" />
                                                </button>
                                                <button
                                                    disabled
                                                    className="outline-none  hover:bg-zinc-200 transition-all p-2 flex items-center justify-center border-r border-zinc-300"
                                                >
                                                    <Icon
                                                        className="fill-none stroke-2 !stroke-emerald-600"
                                                        name="sold"
                                                    />
                                                </button>
                                                <Link
                                                    disableAnimatedHover
                                                    to={`/listing/edit/${l.prettyId}`}
                                                    className="hover:bg-zinc-200 transition-all p-2 flex items-center justify-center"
                                                >
                                                    <Icon name="edit" />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex items-center justify-center my-6">
                            <Pagination currentPage={listings.page} maxPage={listings.totalPages} />
                        </div>
                    </div>
                </div>
            </Main>
            <Footer />
        </>
    );
}
