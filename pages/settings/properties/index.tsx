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

export const getServerSideProps: GetServerSideProps = async ({ locale, req, query }) => {
    const cookies = req.headers.cookie;
    if (!cookies) {
        return {
            props: {
                messages: (await import(`../../../locales/${locale || "hr"}.json`)).default,
                query,
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
            query,
        },
    };
};

interface MyPropertiesPageProps {
    listings: PaginatedListingBasic;
}
export default function MyProperties({ listings }: MyPropertiesPageProps) {
    return (
        <>
            <header>
                <Navbar />
            </header>

            <main className="container mx-auto flex-1">
                <div className="flex flex-col lg:flex-row mt-8">
                    <Navigation />
                    <div className="px-4 flex flex-col flex-1 max-w-2xl mx-auto">
                        <Typography variant="h2">Moje listinge</Typography>
                        <div className="mt-6 space-y-8">
                            {listings.data.map((l) => {
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
                            {listings.totalPages > 1 && (
                                <Pagination
                                    currentPage={listings.page}
                                    maxPage={listings.totalPages}
                                    // onPageChange={handlePageChange}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
