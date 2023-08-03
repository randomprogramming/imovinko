import Navbar from "@/components/Navbar";
import { NextPageContext } from "next";
import React from "react";

import dynamic from "next/dynamic";
import Typography from "@/components/Typography";
import { useTranslations } from "next-intl";
import Footer from "@/components/Footer";
import Head from "next/head";

const MortgageCalculator = dynamic(() => import("@/components/MortgageCalculator"), { ssr: false });

export async function getStaticProps(context: NextPageContext) {
    return {
        props: {
            messages: (await import(`../locales/${context.locale || "hr"}.json`)).default,
        },
    };
}

export default function CalculatorPage() {
    const t = useTranslations("CalculatorPage");

    return (
        <div className="flex flex-col flex-1">
            <Head>
                <title>Imovinko - Kalkulator kredita</title>
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
                <div className="w-full flex flex-col items-center justify-center mt-12 space-y-12 lg:space-y-20">
                    <div className="self-start">
                        <Typography variant="h1">{t("calculator")}</Typography>
                        <Typography className="lg:w-2/3">{t("calculator-description")}</Typography>
                    </div>
                    <MortgageCalculator />
                </div>
            </main>
            <Footer />
        </div>
    );
}
