import Navbar from "@/components/Navbar";
import { Company, PropertyType, getMyCompany } from "@/util/api";
import { GetServerSideProps } from "next";
import React from "react";
import cookie from "cookie";
import Head from "next/head";
import CreateListing from "@/components/listing/CreateListing";

export const getServerSideProps: GetServerSideProps = async ({ locale, req }) => {
    const cookies = req.headers.cookie;
    if (!cookies) {
        return {
            props: {
                messages: (await import(`../../../locales/${locale || "hr"}.json`)).default,
                company: null,
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
        console.error(e);
    }

    return {
        props: {
            messages: (await import(`../../../locales/${locale || "hr"}.json`)).default,
            company,
        },
    };
};

interface ListApartmentProps {
    company: Company | null;
}
export default function ListApartment({ company }: ListApartmentProps) {
    return (
        <>
            <Head>
                <title>Imovinko - Predaj oglas</title>
            </Head>
            <header>
                <Navbar hideSearchBar />
            </header>
            <main className="container mx-auto flex-1 flex flex-col" id="main">
                <CreateListing type={PropertyType.apartment} company={company} />
            </main>
        </>
    );
}
