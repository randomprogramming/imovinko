import Navbar from "@/components/Navbar";
import { NextPageContext } from "next";
import React from "react";

import dynamic from "next/dynamic";

const MortgageCalculator = dynamic(() => import("@/components/MortgageCalculator"), { ssr: false });

export async function getStaticProps(context: NextPageContext) {
    return {
        props: {
            messages: (await import(`../locales/${context.locale || "hr"}.json`)).default,
        },
    };
}

export default function CalculatorPage() {
    return (
        <div>
            <>
                <header>
                    <Navbar />
                </header>
                <main className="container mx-auto">
                    <div className="w-full flex items-center justify-center">
                        <MortgageCalculator />
                    </div>
                </main>
            </>
        </div>
    );
}
