import Navbar from "@/components/Navbar";
import { NextPageContext } from "next";
import React from "react";

import dynamic from "next/dynamic";
import Typography from "@/components/Typography";
import { useTranslations } from "next-intl";

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
        <div>
            <>
                <header>
                    <Navbar />
                </header>
                <main className="container mx-auto">
                    <div className="w-full flex flex-col items-center justify-center mt-12 space-y-12 lg:space-y-20">
                        <div className="self-start">
                            <Typography variant="h1">{t("calculator")}</Typography>
                            <Typography className="lg:w-2/3">
                                {t("calculator-description")}
                            </Typography>
                        </div>
                        <MortgageCalculator />
                    </div>
                </main>
            </>
        </div>
    );
}
