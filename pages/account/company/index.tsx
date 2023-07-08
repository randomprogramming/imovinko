import Navbar from "@/components/Navbar";
import Navigation from "@/components/account/Navigation";
import { GetServerSideProps } from "next";
import React from "react";
import cookie from "cookie";
import { useTranslations } from "next-intl";

export const getServerSideProps: GetServerSideProps = async ({ locale, req }) => {
    const cookies = req.headers.cookie;
    if (!cookies) {
        return {
            props: { messages: (await import(`../../../locales/${locale || "hr"}.json`)).default },
        };
    }

    const parsed = cookie.parse(cookies);
    const jwt = parsed[process.env.NEXT_PUBLIC_JWT_COOKIE_NAME || ""];

    return {
        props: {
            messages: (await import(`../../../locales/${locale || "hr"}.json`)).default,
        },
    };
};

interface CompanyPageProps {}
export default function CompanyPage({}: CompanyPageProps) {
    const t = useTranslations();

    return (
        <>
            <header>
                <Navbar />
            </header>
            <main className="container mx-auto flex-1">
                <div className="flex flex-col lg:flex-row mt-12">
                    <Navigation />
                    <div className="px-4 flex flex-col flex-1 max-w-2xl mx-auto">
                        HEllo company site
                    </div>
                </div>
            </main>
        </>
    );
}
