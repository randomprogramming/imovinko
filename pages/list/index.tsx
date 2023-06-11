import Icon, { IconName } from "@/components/Icon";
import Navbar from "@/components/Navbar";
import Typography from "@/components/Typography";
import { NextPageContext } from "next";
import { useTranslations } from "next-intl";
import Link from "next/link";
import React from "react";

export async function getStaticProps(context: NextPageContext) {
    return {
        props: {
            messages: (await import(`../../locales/${context.locale || "hr"}.json`)).default,
        },
    };
}

interface LinkButtonProps {
    href: string;
    title: string;
    icon: IconName;
}
function LinkButton({ href, title, icon }: LinkButtonProps) {
    return (
        <Link
            href={href}
            className="w-full md:w-60 bg-zinc-50 hover:bg-zinc-100 hover:shadow-sm transition-all rounded-md shadow-md px-2 py-8"
        >
            <div className="flex justify-center items-center">
                <Icon name={icon} height="50px" width="50px" />
            </div>
            <Typography variant="h1" className="text-center mt-4">
                {title}
            </Typography>
        </Link>
    );
}

export default function List() {
    const t = useTranslations("List");

    return (
        <>
            <header>
                <Navbar hideSearchBar />
            </header>
            <main className="container mx-auto flex-1 flex flex-col items-center">
                <div className="mt-24">
                    <Typography variant="h1">{t("title")}</Typography>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-center md:space-x-4 mt-4 space-y-6 md:space-y-0">
                        <LinkButton href="/list/house" title={t("house")} icon="house-colorful" />

                        <LinkButton
                            href="/list/apartment"
                            title={t("apartment")}
                            icon="apartment-colorful"
                        />

                        <LinkButton href="/list/land" title={t("land")} icon="land-colorful" />
                    </div>
                </div>
            </main>
        </>
    );
}
