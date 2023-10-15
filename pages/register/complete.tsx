import Icon from "@/components/Icon";
import Navbar from "@/components/Navbar";
import { activateAccount } from "@/util/api";
import { GetServerSideProps } from "next";
import { useTranslations } from "next-intl";
import React, { useState, useEffect } from "react";
import Footer from "@/components/Footer";
import Head from "next/head";
import Main from "@/components/Main";
import { useRouter } from "next/router";
import Typography from "@/components/Typography";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
    return {
        props: {
            messages: (await import(`../../locales/${locale || "hr"}.json`)).default,
        },
    };
};

export default function CompleteRegistrationPage() {
    const t = useTranslations("CompleteRegistrationPage");

    const router = useRouter();

    const [isActivating, setIsActivating] = useState(true);

    async function tryActivateAccount() {
        if (!router.query.activationToken || typeof router.query.activationToken !== "string") {
            setIsActivating(false);
            return;
        }

        try {
            await activateAccount(router.query.activationToken);
            await router.push({
                pathname: "/login",
                query: {
                    activated: true,
                },
            });
        } catch (e) {
            console.error(e);
            setIsActivating(false);
        }
    }

    useEffect(() => {
        tryActivateAccount();
    }, []);

    return (
        <>
            <Head>
                <title>Aktivacija računa</title>
                <meta name="description" content="Imovinko - aktivacija korisničkog računa" />
                <meta
                    name="keywords"
                    content="oglasnik, nekretnina, kuća, stan, zemljište, kupovina, prodaja, najam, račun"
                />
            </Head>
            <header>
                <Navbar />
            </header>
            <Main container mobilePadding className="!max-w-md">
                {isActivating ? (
                    <div className="flex-1 text-center w-full flex items-center justify-center">
                        <Icon name="loading" />
                    </div>
                ) : (
                    <div className="flex-1 text-center w-full flex items-center justify-center">
                        <Typography className="text-red-500">{t("error")}</Typography>
                    </div>
                )}
            </Main>
            <Footer />
        </>
    );
}
