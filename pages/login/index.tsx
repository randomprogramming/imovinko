import React, { useState } from "react";
import Image from "next/image";
import Typography from "@/components/Typography";
import { useTranslations } from "next-intl";
import { NextPageContext } from "next";
import Button from "@/components/Button";
import { useRouter } from "next/router";
import { GOOGLE_REGISTER_URL, login } from "@/util/api";
import Input from "@/components/Input";
import { setJWTCookie } from "@/util/cookie";
import Link from "@/components/Link";
import Icon from "@/components/Icon";
import Head from "next/head";
import Dialog from "@/components/Dialog";
import useFieldErrorCodes from "@/hooks/useFieldErrorCodes";

export async function getStaticProps(context: NextPageContext) {
    return {
        props: {
            messages: (await import(`../../locales/${context.locale || "hr"}.json`)).default,
        },
    };
}

export default function Login() {
    const t = useTranslations("Login");
    const router = useRouter();

    const [handle, setHandle] = useState("");
    const [password, setPassword] = useState("");
    const [isSendingLoginReq, setIsSendingLoginReq] = useState(false);

    const fieldErrorCodesParser = useFieldErrorCodes();

    const [userNotActivated, setUserNotActivated] = useState(false);

    async function onLogin() {
        try {
            await router.replace("/login", undefined, { shallow: true });
            setUserNotActivated(false);
            fieldErrorCodesParser.empty();
            setIsSendingLoginReq(true);
            const response = await login({ handle, password });
            setJWTCookie(response.data.accessToken);
            router.push("/");
        } catch (e: any) {
            if (e.response?.status === 400 && Array.isArray(e.response?.data)) {
                fieldErrorCodesParser.parseErrorCodes(e.response.data);
            } else if (typeof e.response?.data === "string") {
                if (e.response.data === "err::account::not_activated") {
                    setUserNotActivated(true);
                    return;
                }
                fieldErrorCodesParser.parseErrorMessage(e.response.data);
            } else {
                console.error(e);
            }
        } finally {
            setIsSendingLoginReq(false);
        }
    }

    function listenToEnter(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter" || e.keyCode === 13) {
            if (!isSendingLoginReq) {
                onLogin();
            }
        }
    }

    return (
        <div className="flex-1 flex flex-row">
            <Head>
                <title>Imovinko - Prijavi se</title>
                <meta name="description" content="Imovinko - prijavi se." />
                <meta
                    name="keywords"
                    content="oglasnik, nekretnina, kuća, stan, zemljište, kupovina, prodaja, najam, prijava, račun"
                />
            </Head>
            <div className="hidden lg:flex h-screen" style={{ flex: 3 }}>
                <div className="relative w-full flex-1 overflow-hidden">
                    <Link to="/" className="absolute z-30 top-10 left-12 p-1" disableAnimatedHover>
                        <Icon name="logo-text" height={48} className="fill-zinc-50" />
                    </Link>
                    <Image
                        src="/images/login-cover.jpeg"
                        alt="modern house exterior"
                        fill
                        style={{
                            objectFit: "cover",
                        }}
                    />
                </div>
            </div>
            <div
                className="bg-zinc-100 rounded-2xl lg:-ml-10 z-50 px-2 lg:px-0 lg:h-screen lg:overflow-y-auto"
                style={{ flex: 2 }}
            >
                <div className="lg:px-10 py-4">
                    <div className="flex lg:hidden items-center justify-center">
                        <Link to="/" className="p-1 mb-2" disableAnimatedHover>
                            <Icon name="logo-text" height={48} className="inline" />
                        </Link>
                    </div>
                    <Typography variant="h1">{t("welcome")}</Typography>
                    <div className="mt-8 flex flex-col items-center">
                        <Button.Primary
                            icon="google"
                            label={t("sign-in-google")}
                            hollow
                            onClick={() => {
                                router.push(GOOGLE_REGISTER_URL);
                            }}
                            className="!w-fit !px-4"
                        />
                    </div>
                    <div className="flex flex-row items-center my-8">
                        <div className="flex-1 ml-20 h-0.5 bg-zinc-600" />
                        <div className="px-6 select-none">
                            <Typography variant="secondary" uppercase>
                                {t("or")}
                            </Typography>
                        </div>
                        <div className="flex-1 mr-20 h-0.5 bg-zinc-600" />
                    </div>
                    {router.query.activated === "true" && (
                        <Dialog
                            type="success"
                            title={t("activated")}
                            message={t("activated-message")}
                        />
                    )}
                    {router.query.registrationSuccess === "true" && (
                        <Dialog
                            type="success"
                            title={t("registration-success-title")}
                            message={t("registration-success-message")}
                        />
                    )}
                    {userNotActivated && (
                        <Dialog
                            type="warning"
                            title={t("account-not-activated")}
                            message={t("account-not-activated-message")}
                        />
                    )}
                    <div className="mt-4">
                        <label htmlFor="handle">
                            <Typography variant="secondary" uppercase>
                                {t("username-or-email")}
                            </Typography>
                        </label>
                        <Input
                            name="handle"
                            onChange={setHandle}
                            placeholder="username300"
                            onKeyDown={listenToEnter}
                            hasError={fieldErrorCodesParser.has("handle")}
                            errorMsg={fieldErrorCodesParser.getTranslated("handle")}
                            value={handle}
                        />
                    </div>
                    <div className="mt-4">
                        <label htmlFor="password">
                            <Typography variant="secondary" uppercase>
                                {t("password")}
                            </Typography>
                        </label>
                        <Input
                            name="password"
                            onChange={setPassword}
                            placeholder={t("password")}
                            type="password"
                            onKeyDown={listenToEnter}
                            hasError={fieldErrorCodesParser.has("password")}
                            errorMsg={fieldErrorCodesParser.getTranslated("password")}
                            value={password}
                        />
                    </div>
                    <div className="mt-6">
                        <Button.Primary
                            label={t("sign-in")}
                            onClick={onLogin}
                            loading={isSendingLoginReq}
                        />
                    </div>
                    <div className="mt-6">
                        <Typography>
                            {t("no-account")}{" "}
                            <Link to="/register" className="font-bold">
                                {t("register-here")}
                            </Link>
                        </Typography>
                    </div>
                </div>
            </div>
        </div>
    );
}
