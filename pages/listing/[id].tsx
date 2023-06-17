import Navbar from "@/components/Navbar";
import { Listing, findListing } from "@/util/api";
import { GetServerSideProps } from "next";
import React from "react";

export const getServerSideProps: GetServerSideProps = async ({ params, locale }) => {
    let listing = null;
    if (typeof params?.id === "string") {
        listing = (await findListing(params.id)).data;
    }
    return {
        props: {
            messages: (await import(`../../locales/${locale || "hr"}.json`)).default,
            listing,
        },
    };
};

interface ListingPageProps {
    listing: Listing;
}
export default function ListingPage({ listing }: ListingPageProps) {
    return (
        <>
            <header>
                <Navbar />
            </header>
            <main>{JSON.stringify(listing)}</main>
        </>
    );
}
