import NotFound from "@/components/404";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Typography from "@/components/Typography";
import { Company, Listing, PropertyType, findListing, getMyCompany } from "@/util/api";
import { GetServerSideProps } from "next";
import { useTranslations } from "next-intl";
import Head from "next/head";
import React from "react";
import cookie from "cookie";
import PatchListingData from "@/components/listing/PatchListingData";

export const getServerSideProps: GetServerSideProps = async ({ locale, req, params }) => {
    const cookies = req.headers.cookie;
    let listing = null;
    if (typeof params?.prettyId === "string") {
        try {
            listing = (await findListing(params.prettyId)).data;
        } catch (e) {
            console.error(e);
        }
    }
    if (!cookies) {
        return {
            props: {
                messages: (await import(`../../../locales/${locale || "hr"}.json`)).default,
                company: null,
                listing: null,
            },
        };
    }

    const parsed = cookie.parse(cookies);
    const jwt = parsed[process.env.NEXT_PUBLIC_JWT_COOKIE_NAME || ""];

    let company: Company | null = null;
    try {
        const { data } = await getMyCompany(jwt);
        company = data;
    } catch (e) {
        console.error("Error when fetching company while creating apartment listing");
    }

    return {
        props: {
            messages: (await import(`../../../locales/${locale || "hr"}.json`)).default,
            company,
            listing,
        },
    };
};

interface ListingPageProps {
    company: Company | null;
    listing: Listing | null;
}
export default function EditListingPage({ listing, company }: ListingPageProps) {
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
            <main className="flex-1 container mx-auto">
                {listing ? (
                    <PatchListingData
                        listing={listing}
                        company={company}
                        type={PropertyType.apartment}
                    />
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
