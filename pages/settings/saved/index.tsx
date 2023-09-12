import Navbar from "@/components/Navbar";
import Navigation from "@/components/account/Navigation";
import { GetServerSideProps } from "next";
import React from "react";
import cookie from "cookie";
import { PaginatedListingBasic, getSavedListings } from "@/util/api";
import Typography from "@/components/Typography";
import ListingListItem from "@/components/listing/ListingListItem";
import Pagination from "@/components/Pagination";
import { useTranslations } from "next-intl";
import Footer from "@/components/Footer";
import Head from "next/head";
import NoData from "@/components/NoData";
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

    let savedListings: PaginatedListingBasic | null = null;
    try {
        let page: number | undefined = undefined;
        if (typeof query.page === "string") {
            page = parseInt(query.page);
        }
        savedListings = (await getSavedListings(page, jwt)).data;
    } catch (e) {
        console.error(e);
    }

    return {
        props: {
            messages: (await import(`../../../locales/${locale || "hr"}.json`)).default,
            listings: savedListings,
        },
    };
};

interface SavedPropertiesPageProps {
    listings: PaginatedListingBasic;
}
export default function SavedProperties({ listings }: SavedPropertiesPageProps) {
    const t = useTranslations("SavedPropertiesPage");

    return (
        <>
            <Head>
                <title>Imovinko - Spremljeni oglasi</title>
            </Head>
            <header>
                <Navbar />
            </header>

            <Main container>
                <div className="flex flex-col lg:flex-row mt-8">
                    <Navigation />
                    <div className="px-4 flex flex-col flex-1 max-w-2xl mx-auto">
                        <Typography variant="h2">
                            {t("saved-listings")}
                            {` (${listings.count})`}
                        </Typography>
                        <div className="mt-6 space-y-4 w-full">
                            {listings.data.length === 0 && (
                                <NoData>
                                    <Typography>{t("no-data-message")}</Typography>
                                </NoData>
                            )}
                            {listings.data.map((l) => {
                                return (
                                    <ListingListItem key={l.prettyId} showCustomId listing={l} />
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
            </Main>
            <Footer />
        </>
    );
}
