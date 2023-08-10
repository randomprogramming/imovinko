import NotFound from "@/components/404";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Typography from "@/components/Typography";
import { Listing, findListing } from "@/util/api";
import { GetServerSideProps } from "next";
import { useTranslations } from "next-intl";
import Head from "next/head";
import React from "react";

export const getServerSideProps: GetServerSideProps = async ({ params, locale }) => {
    let listing = null;
    if (typeof params?.prettyId === "string") {
        try {
            listing = (await findListing(params.prettyId)).data;
        } catch (e) {
            console.error(e);
        }
    }

    return {
        props: {
            messages: (await import(`../../../locales/${locale || "hr"}.json`)).default,
            listing,
        },
    };
};

interface ListingPageProps {
    listing: Listing | null;
}
export default function EditListingPage({ listing }: ListingPageProps) {
    const t = useTranslations("EditListingPage");

    return (
        <>
            <Head>
                <title>{listing ? t("edit") + listing.title : t("not-found")}</title>
                <meta
                    name="description"
                    content="Imovinko - oglasnik za nekretnine. Pronađite svoj dom."
                />
                <meta
                    name="keywords"
                    content="oglasnik, nekretnina, kuća, stan, zemljište, kupovina, prodaja, najam"
                />
            </Head>
            <header>
                <Navbar />
            </header>
            <main className="flex-1">
                {listing ? (
                    <div>Listing found!</div>
                ) : (
                    <NotFound>
                        <Typography>{t("not-found")}</Typography>
                    </NotFound>
                )}
            </main>
            <Footer />
        </>
    );
}
