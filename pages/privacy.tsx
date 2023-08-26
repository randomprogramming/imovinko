import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Typography from "@/components/Typography";
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

export default function PrivacyPolicyPage() {
    const t = useTranslations("Privacy");

    return (
        <div className="flex flex-col flex-1">
            <Head>
                <title>Imovinko - Pravila o zaštiti privatnosti </title>
                <meta name="description" content="Imovinko - kalkulator stambenog kredita." />
                <meta
                    name="keywords"
                    content="oglasnik, nekretnina, kuća, stan, zemljište, kupovina, prodaja, najam, kalkulator, kredit, stambeni kredit"
                />
            </Head>
            <header>
                <Navbar />
            </header>
            <main className="container mx-auto flex-1">
                <div>
                    <Typography variant="h1">{t("header")}</Typography>

                    <Typography>{t("1")}</Typography>

                    <Typography>{t("2")}</Typography>

                    <Typography>{t("3")}</Typography>

                    <Typography variant="h2" className="mt-4">
                        {t("information-collection")}
                    </Typography>

                    <Typography>{t("4")}</Typography>

                    <Typography variant="h2" className="mt-4">
                        {t("log-data")}
                    </Typography>

                    <Typography>{t("5")}</Typography>

                    <Typography variant="h2" className="mt-4">
                        {t("cookies")}
                    </Typography>

                    <Typography>{t("6")}</Typography>

                    <Typography>{t("7")}</Typography>

                    <Typography variant="h2" className="mt-4">
                        {t("service-providers")}
                    </Typography>

                    <Typography>{t("8")}</Typography>

                    <Typography variant="h2" className="mt-4">
                        {t("security")}
                    </Typography>

                    <Typography>{t("9")}</Typography>

                    <Typography variant="h2" className="mt-4">
                        {t("links")}
                    </Typography>

                    <Typography>{t("10")}</Typography>

                    <Typography>{t("children")}</Typography>

                    <Typography>{t("11")}</Typography>

                    <Typography variant="h2" className="mt-4">
                        {t("changes")}
                    </Typography>

                    <Typography>{t("12")}</Typography>

                    <Typography variant="h2" className="mt-4">
                        {t("contact")}
                    </Typography>

                    <Typography>{t("13")}</Typography>
                </div>
            </main>
            <Footer />
        </div>
    );
}
