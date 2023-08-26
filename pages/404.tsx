import NotFound from "@/components/404";
import Footer from "@/components/Footer";
import Main from "@/components/Main";
import Navbar from "@/components/Navbar";
import { NextPageContext } from "next";
import { useTranslations } from "next-intl";
import Head from "next/head";
import React from "react";

export async function getStaticProps(context: NextPageContext) {
    return {
        props: {
            messages: (await import(`../locales/${context.locale || "hr"}.json`)).default,
        },
    };
}

export default function Custom404() {
    const t = useTranslations("404");

    return (
        <>
            <Head>
                <title>Imovinko - Nepoznata stranica</title>
                <meta name="description" content="Imovinko - nepoznata stranica." />
                <meta
                    name="keywords"
                    content="oglasnik, nekretnina, kuća, stan, zemljište, kupovina, prodaja, najam"
                />
            </Head>
            <header className="container mx-auto ">
                <Navbar />
            </header>
            <Main container className="!flex-row">
                <NotFound className="mt-4">{t("message")}</NotFound>
            </Main>
            <Footer />
        </>
    );
}
