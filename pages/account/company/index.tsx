import Navbar from "@/components/Navbar";
import Navigation from "@/components/account/Navigation";
import { GetServerSideProps } from "next";
import React, { useState } from "react";
import cookie from "cookie";
import { useTranslations } from "next-intl";
import { Company, getMyCompany, patchCompany } from "@/util/api";
import Link from "@/components/Link";
import Typography from "@/components/Typography";
import Icon from "@/components/Icon";
import Input from "@/components/Input";
import Button from "@/components/Button";

export const getServerSideProps: GetServerSideProps = async ({ locale, req }) => {
    const cookies = req.headers.cookie;
    if (!cookies) {
        return {
            props: { messages: (await import(`../../../locales/${locale || "hr"}.json`)).default },
        };
    }

    const parsed = cookie.parse(cookies);
    const jwt = parsed[process.env.NEXT_PUBLIC_JWT_COOKIE_NAME || ""];

    let company: Company | null = null;
    try {
        const { data } = await getMyCompany(jwt);
        company = data;
    } catch (e) {
        console.error("Error when fetching company");
    }

    return {
        props: {
            messages: (await import(`../../../locales/${locale || "hr"}.json`)).default,
            company,
        },
    };
};

interface CompanyPageProps {
    company: Company | null;
}
export default function CompanyPage({ company }: CompanyPageProps) {
    const t = useTranslations("CompanyPage");

    const [website, setWebsite] = useState(company?.website || "");
    const [storeName, setStoreName] = useState(company?.storeName || "");
    const [isLoading, setIsLoading] = useState(false);

    async function handleCompanyPatch() {
        setIsLoading(true);
        try {
            await patchCompany({
                website,
                storeName,
            });
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <>
            <header>
                <Navbar />
            </header>
            <main className="container mx-auto flex-1">
                <div className="flex flex-col lg:flex-row mt-12">
                    <Navigation />
                    <div className="px-4 flex flex-col flex-1 max-w-2xl mx-auto">
                        {company ? (
                            <div>
                                <div className="flex flex-row items-center space-x-2">
                                    <Icon name="account" height={64} width={64} />

                                    <div>
                                        <Typography variant="h2" className="text-2xl">
                                            {company.name}
                                        </Typography>
                                        <Typography className="text-zinc-600 text-sm">
                                            {t("created")}:{" "}
                                            {new Date(company.createdAt)
                                                .toLocaleDateString(undefined, {
                                                    day: "2-digit",
                                                    month: "2-digit",
                                                    year: "numeric",
                                                })
                                                .replaceAll("/", ".")}
                                        </Typography>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                                    <div>
                                        <label htmlFor="name">
                                            <Typography>{t("name")}</Typography>
                                        </label>
                                        <Input
                                            name="name"
                                            hollow
                                            className="!p-2"
                                            value={company.name}
                                            disabled
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="pin">
                                            <Typography>{t("pin")}</Typography>
                                        </label>
                                        <Input
                                            name="pin"
                                            hollow
                                            className="!p-2"
                                            value={company.PIN}
                                            disabled
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="website">
                                            <Typography>{t("web-page")}</Typography>
                                        </label>
                                        <Input
                                            name="website"
                                            hollow
                                            className="!p-2"
                                            value={website}
                                            onChange={setWebsite}
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="storeName">
                                            <Typography>{t("store-name")}</Typography>
                                        </label>
                                        <Input
                                            name="storeName"
                                            hollow
                                            className="!p-2"
                                            value={storeName}
                                            onChange={setStoreName}
                                        />
                                    </div>
                                </div>

                                <div className="mt-8">
                                    <Button.Primary
                                        label={t("save")}
                                        loading={isLoading}
                                        onClick={handleCompanyPatch}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center">
                                <div>
                                    <Typography>{t("not-found")}</Typography>
                                </div>
                                <Link to="/account/company/create" className="font-semibold">
                                    <Typography>{t("click-here")}</Typography>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </>
    );
}
