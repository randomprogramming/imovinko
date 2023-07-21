import MortgageCalculator from "@/components/MortgageCalculator";
import Navbar from "@/components/Navbar";
import { NextPageContext } from "next";
import React from "react";

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
                    <MortgageCalculator />
                </main>
            </>
        </div>
    );
}
