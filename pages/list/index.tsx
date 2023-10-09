import Dialog from "@/components/Dialog";
import Icon, { IconName } from "@/components/Icon";
import Navbar from "@/components/Navbar";
import Typography from "@/components/Typography";
import useAuthentication from "@/hooks/useAuthentication";
import { GetServerSideProps } from "next";
import { useTranslations } from "next-intl";
import Head from "next/head";
import Link from "next/link";
import React from "react";
import CustomLink from "@/components/Link";
import Main from "@/components/Main";
import { Company, getMyCompany } from "@/util/api";
import cookie from "cookie";

export const getServerSideProps: GetServerSideProps = async ({ locale, req }) => {
    const cookies = req.headers.cookie;
    if (!cookies) {
        return {
            props: {
                messages: (await import(`../../locales/${locale || "hr"}.json`)).default,
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
            messages: (await import(`../../locales/${locale || "hr"}.json`)).default,
            company,
        },
    };
};

interface LinkButtonProps {
    href: string;
    title: string;
    icon: IconName;
    disabled?: boolean;
    fullWidth?: boolean;
    iconClassName?: string;
}
function LinkButton({ href, title, icon, disabled, fullWidth, iconClassName }: LinkButtonProps) {
    function Content() {
        return (
            <div
                className={`w-full ${
                    !fullWidth && "md:w-60"
                } bg-zinc-50 hover:bg-zinc-100 hover:shadow-sm transition-all rounded-md shadow px-2 py-8`}
            >
                <div className="flex justify-center items-center">
                    <Icon className={iconClassName} name={icon} height="50px" width="50px" />
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

export default function List({ company }: { company: Company | null }) {
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
            <Main container className="items-center">
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
                    {company && (
                        <div className="mt-4">
                            <LinkButton
                                fullWidth
                                href="/list/file"
                                title={t("file")}
                                icon="file-upload"
                                iconClassName="fill-blue-300"
                                disabled={!!(account && !account.username)}
                            />
                        </div>
                    )}
                </div>
            </Main>
        </>
    );
}
