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

            <main className="container mx-auto flex-1">
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
                        <Typography variant="h2">
                            {t("my-listings")}
                            {` (${listings.count})`}
                        </Typography>
                        <div className="mt-6 space-y-8 w-full">
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
                                    <div key={l.prettyId} className="relative">
                                        <Link
                                            disableAnimatedHover
                                            className="flex flex-1"
                                            to={`/listing/${l.prettyId}`}
                                        >
                                            <ListingListItem listing={l} />
                                        </Link>
                                        <div className="absolute shadow-sm hover:shadow right-0 bottom-0 translate-y-[70%]">
                                            <div className="bg-zinc-50 rounded-b flex flex-row">
                                                <Link
                                                    disableAnimatedHover
                                                    to={`/listing/edit/${l.prettyId}`}
                                                    className="p-2 flex items-center justify-center"
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
                            {listings.totalPages > 1 && (
                                <Pagination
                                    currentPage={listings.page}
                                    maxPage={listings.totalPages}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
