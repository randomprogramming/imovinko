import Button from "@/components/Button";
import Input from "@/components/Input";
import Typography from "@/components/Typography";
import { GOOGLE_REGISTER_URL, registerAccount } from "@/util/api";
import { NextPageContext } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import React, { useState } from "react";
import Image from "next/image";
import useFieldErrorCodes from "@/hooks/useFieldErrorCodes";
import Link from "@/components/Link";
import Icon from "@/components/Icon";
import Head from "next/head";

export async function getStaticProps(context: NextPageContext) {
    return {
        props: {
            messages: (await import(`../../locales/${context.locale || "hr"}.json`)).default,
        },
    };
}

export default function Register() {
    const t = useTranslations("Register");
    const router = useRouter();

    const fieldErrorCodesParser = useFieldErrorCodes();

    const [firstName, setFirstName] = useState<string | null>(null);
    const [lastName, setLastName] = useState<string | null>(null);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [isSendingRegisterReq, setIsSendingRegisterReq] = useState(false);

    // First name and last name are not required, so instead of sending an empty name, send null to the server
    function setFirstNameParsed(val: string) {
        if (val.length === 0) {
            setFirstName(null);
        } else {
            setFirstName(val);
        }
    }

    function setLastNameParsed(val: string) {
        if (val.length === 0) {
            setLastName(null);
        } else {
            setLastName(val);
        }
    }

    function listenToEnter(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter" || e.keyCode === 13) {
            if (!isSendingRegisterReq) {
                onRegister();
            }
        }
    }

    async function onRegister() {
        try {
            fieldErrorCodesParser.empty();
            setIsSendingRegisterReq(true);
            await registerAccount({
                username,
                firstName,
                lastName,
                email,
                password,
                confirmPassword,
                locale: router.locale,
            });
            await router.push({
                pathname: "/login",
                query: {
                    registrationSuccess: true,
                },
            });
        } catch (e: any) {
            if (e.response?.status === 400 && Array.isArray(e.response?.data)) {
                fieldErrorCodesParser.parseErrorCodes(e.response.data);
            } else if (typeof e.response?.data === "string") {
                fieldErrorCodesParser.parseErrorMessage(e.response.data);
            } else {
                console.error(e);
            }
        } finally {
            setIsSendingRegisterReq(false);
        }
    }

    return (
        <div className="flex-1 flex flex-row">
            <Head>
                <title>Imovinko - Registriraj se</title>
                <meta name="description" content="Imovinko - napravite svoj korisnički račun." />
                <meta
                    name="keywords"
                    content="oglasnik, nekretnina, kuća, stan, zemljište, kupovina, prodaja, najam, račun, registracija"
                />
            </Head>
            <div className="flex-1 hidden lg:flex">
                <div className="h-screen relative w-full flex-1 rounded-tr-3xl rounded-br-3xl overflow-hidden shadow-lg">
                    <Link to="/" className="absolute z-30 top-10 left-12 p-1" disableAnimatedHover>
                        <Icon name="logo-text" height={48} />
                    </Link>
                    <Image
                        src="/images/register-cover-new.jpeg"
                        alt="modern house exterior"
                        fill
                        style={{
                            objectFit: "cover",
                        }}
                    />
                </div>
            </div>
            <div className="flex-1 flex flex-col justify-between items-center lg:h-screen lg:overflow-y-auto">
                <div className="px-2 md:px-10 py-4 w-full">
                    <div className="flex lg:hidden items-center justify-center">
                        <Link to="/" className="p-1 mb-2" disableAnimatedHover>
                            <Icon name="logo-text" height={48} className="inline" />
                        </Link>
                    </div>
                    <Typography variant="h1">{t("sign-up")}</Typography>
                    <div className="mt-8 flex flex-col items-center">
                        <Button.Primary
                            icon="google"
                            label={t("sign-up-google")}
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

                    <div className="flex flex-row gap-4 flex-wrap">
                        <div className="flex-1">
                            <label htmlFor="firstName">
                                <Typography variant="secondary" uppercase>
                                    {t("first-name")}
                                </Typography>
                            </label>
                            <Input
                                name="firstName"
                                onChange={setFirstNameParsed}
                                placeholder={t("first-name-placeholder")}
                                hasError={fieldErrorCodesParser.has("firstName")}
                                errorMsg={fieldErrorCodesParser.getTranslated("firstName")}
                                onKeyDown={listenToEnter}
                                value={firstName}
                            />
                        </div>

                        <div className="flex-1">
                            <label htmlFor="lastName">
                                <Typography variant="secondary" uppercase>
                                    {t("last-name")}
                                </Typography>
                            </label>
                            <Input
                                name="lastName"
                                onChange={setLastNameParsed}
                                placeholder={t("last-name-placeholder")}
                                hasError={fieldErrorCodesParser.has("lastName")}
                                errorMsg={fieldErrorCodesParser.getTranslated("lastName")}
                                onKeyDown={listenToEnter}
                                value={lastName}
                            />
                        </div>
                    </div>

                    <div className="mt-4">
                        <label htmlFor="username">
                            <Typography variant="secondary" uppercase>
                                {t("username")}
                            </Typography>
                        </label>

                        <Input
                            name="username"
                            hasError={fieldErrorCodesParser.has("username")}
                            errorMsg={fieldErrorCodesParser.getTranslated("username")}
                            onChange={setUsername}
                            placeholder="username300"
                            onKeyDown={listenToEnter}
                            value={username}
                        />
                    </div>

                    <div className="mt-4">
                        <label htmlFor="email">
                            <Typography variant="secondary" uppercase>
                                {t("email")}
                            </Typography>
                        </label>
                        <Input
                            name="email"
                            type="email"
                            onChange={setEmail}
                            placeholder="my.mail@gmail.com"
                            hasError={fieldErrorCodesParser.has("email")}
                            errorMsg={fieldErrorCodesParser.getTranslated("email")}
                            onKeyDown={listenToEnter}
                            value={email}
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
                            type="password"
                            onChange={setPassword}
                            placeholder={t("password")}
                            hasError={fieldErrorCodesParser.has("password")}
                            errorMsg={fieldErrorCodesParser.getTranslated("password")}
                            onKeyDown={listenToEnter}
                            value={password}
                        />
                    </div>

                    <div className="mt-4">
                        <label htmlFor="confirmPassword">
                            <Typography variant="secondary" uppercase>
                                {t("confirm-password")}
                            </Typography>
                        </label>
                        <Input
                            name="confirmPassword"
                            type="password"
                            onChange={setConfirmPassword}
                            placeholder={t("confirm-password")}
                            hasError={fieldErrorCodesParser.has("confirmPassword")}
                            errorMsg={fieldErrorCodesParser.getTranslated("confirmPassword")}
                            onKeyDown={listenToEnter}
                            value={confirmPassword}
                        />
                    </div>

                    <div className="mt-6">
                        <Button.Primary
                            label={t("sign-up")}
                            onClick={onRegister}
                            loading={isSendingRegisterReq}
                        />
                    </div>

                    <div className="mt-6">
                        <Typography>
                            {t("already-registered")}{" "}
                            <Link to="/login" className="font-bold">
                                {t("log-in-here")}
                            </Link>
                        </Typography>
                    </div>
                </div>
            </div>
        </div>
    );
}
