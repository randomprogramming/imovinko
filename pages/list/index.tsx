import Dialog from "@/components/Dialog";
import Icon, { IconName } from "@/components/Icon";
import Navbar from "@/components/Navbar";
import Typography from "@/components/Typography";
import useAuthentication from "@/hooks/useAuthentication";
import { NextPageContext } from "next";
import { useTranslations } from "next-intl";
import Head from "next/head";
import Link from "next/link";
import React from "react";
import CustomLink from "@/components/Link";

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
    disabled?: boolean;
}
function LinkButton({ href, title, icon, disabled }: LinkButtonProps) {
    function Content() {
        return (
            <div className="w-full md:w-60 bg-zinc-50 hover:bg-zinc-100 hover:shadow-sm transition-all rounded-md shadow-md px-2 py-8">
                <div className="flex justify-center items-center">
                    <Icon name={icon} height="50px" width="50px" />
                </div>
                <Typography variant="h1" className="text-center mt-4 select-none">
                    {title}
                </Typography>
            </div>
        );
    }

    if (disabled) {
        return <Content />;
    } else {
        return (
            <Link href={href}>
                <Content />
            </Link>
        );
    }
}

export default function List() {
    const t = useTranslations("List");

    const { account } = useAuthentication();

    return (
        <>
            <Head>
                <title>Imovinko - Predaj oglas</title>
            </Head>
            <header>
                <Navbar hideSearchBar />
            </header>
            <main className="container mx-auto flex-1 flex flex-col items-center">
                <div className="mt-24">
                    {account && !account.username && (
                        <Dialog type="warning" title={t("missing-username")} className="mb-4">
                            <Typography>
                                {t("missing-username-message")}{" "}
                                <CustomLink to="/settings">
                                    <Typography variant="span" bold>
                                        {t("missing-username-here")}
                                    </Typography>
                                </CustomLink>{" "}
                                {t("missing-username-rest")}
                            </Typography>
                        </Dialog>
                    )}
                    <Typography variant="h1">{t("title")}</Typography>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-center md:space-x-4 mt-4 space-y-6 md:space-y-0">
                        <LinkButton
                            href="/list/house"
                            title={t("house")}
                            icon="house-colorful"
                            disabled={!!(account && !account.username)}
                        />

                        <LinkButton
                            href="/list/apartment"
                            title={t("apartment")}
                            icon="apartment-colorful"
                            disabled={!!(account && !account.username)}
                        />

                        <LinkButton
                            href="/list/land"
                            title={t("land")}
                            icon="land-colorful"
                            disabled={!!(account && !account.username)}
                        />
                    </div>
                </div>
            </main>
        </>
    );
}
