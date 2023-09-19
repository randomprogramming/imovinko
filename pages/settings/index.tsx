import Navbar from "@/components/Navbar";
import Typography from "@/components/Typography";
import Navigation from "@/components/account/Navigation";
import {
    MyAccount,
    getMyAccount,
    patchAccountAvatarUrl,
    patchMyAccount,
    uploadAvatar,
} from "@/util/api";
import { GetServerSideProps } from "next";
import React, { useRef, useState } from "react";
import cookie from "cookie";
import Icon from "@/components/Icon";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { useTranslations } from "next-intl";
import Footer from "@/components/Footer";
import Head from "next/head";
import Dialog from "@/components/Dialog";
import { setJWTCookie } from "@/util/cookie";
import { useRouter } from "next/router";
import useFieldErrorCodes from "@/hooks/useFieldErrorCodes";
import Image from "next/image";
import Main from "@/components/Main";
import { formatDMYDate } from "@/util/date";

export const getServerSideProps: GetServerSideProps = async ({ locale, req }) => {
    const cookies = req.headers.cookie;
    if (!cookies) {
        return {
            props: { messages: (await import(`../../locales/${locale || "hr"}.json`)).default },
        };
    }

    const parsed = cookie.parse(cookies);
    const jwt = parsed[process.env.NEXT_PUBLIC_JWT_COOKIE_NAME || ""];

    const account = await getMyAccount(jwt);

    return {
        props: {
            messages: (await import(`../../locales/${locale || "hr"}.json`)).default,
            account: account.data,
        },
    };
};

interface AccountPageProps {
    account: MyAccount;
}
export default function AccountPage({ account }: AccountPageProps) {
    const t = useTranslations("AccountPage");

    const avatarUploadRef = useRef<HTMLInputElement>(null);

    const [firstName, setFirstName] = useState(account.firstName || "");
    const [lastName, setLastName] = useState(account.lastName || "");
    const [username, setUsername] = useState(account.username || "");
    const [phone, setPhone] = useState<string | undefined>(account.phone || "");
    const [isLoading, setIsLoading] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);

    const fieldErrorCodesParser = useFieldErrorCodes();

    const router = useRouter();

    function getAccountHandle() {
        if (account.username) {
            return account.username;
        }

        if (account.firstName && account.lastName) {
            return `${account.firstName} ${account.lastName}`;
        }

        if (account.firstName) {
            return account.firstName;
        }

        if (account.lastName) {
            return account.lastName;
        }

        return account.email;
    }

    async function handleAccountPatch() {
        setIsLoading(true);
        await router.push({
            pathname: router.pathname,
            query: {},
        });
        try {
            const { data } = await patchMyAccount({
                username,
                firstName,
                lastName,
                phone: phone && phone.length > 5 ? "+" + phone : null,
            });
            if (typeof data.accessToken === "string" && data.accessToken.length > 0) {
                setJWTCookie(data.accessToken);
                setIsRedirecting(true);
                await router.push({
                    pathname: router.pathname,
                    query: {
                        updated: true,
                    },
                });
                router.reload();
            }
        } catch (e: any) {
            setIsRedirecting(false);
            if (e.response?.status === 400 && Array.isArray(e.response?.data)) {
                fieldErrorCodesParser.parseErrorCodes(e.response.data);
            } else if (typeof e.response?.data === "string") {
                fieldErrorCodesParser.parseErrorMessage(e.response.data);
            } else {
                console.error(e);
            }
        } finally {
            setIsLoading(false);
        }
    }

    async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
        setIsUploadingImage(true);
        try {
            const files = e.target.files;
            if (files?.length && files.length > 0) {
                const response = await uploadAvatar(files[0]);
                await patchAccountAvatarUrl(response);
                router.reload();
            }
        } catch (e) {
            console.error(e);
            setIsUploadingImage(false);
        }
    }

    return (
        <>
            <Head>
                <title>Imovinko - Moj Račun</title>
            </Head>
            <header>
                <Navbar />
            </header>
            <Main container mobilePadding>
                <div className="flex flex-col lg:flex-row mt-8">
                    <Navigation />
                    <div className="px-4 flex flex-col flex-1 max-w-2xl mx-auto">
                        {router.query.updated === "true" && !isRedirecting && (
                            <Dialog
                                type="success"
                                title={t("updated-title")}
                                message={t("updated-message")}
                                className="mb-3"
                            />
                        )}
                        {!account.username && (
                            <Dialog
                                type="warning"
                                title={t("enter-username")}
                                message={t("enter-username-message")}
                                className="mb-3"
                            />
                        )}
                        <input
                            ref={avatarUploadRef}
                            type="file"
                            className="hidden"
                            onChange={handleImageUpload}
                        />
                        <div className="flex flex-row items-center space-x-2">
                            <div
                                className="rounded-full cursor-pointer relative group h-16 w-16 overflow-hidden"
                                onClick={() => {
                                    if (isUploadingImage) {
                                        return;
                                    }
                                    if (avatarUploadRef) {
                                        avatarUploadRef.current?.click();
                                    }
                                }}
                            >
                                <div className="flex z-30 items-center justify-center transition-all group-hover:bg-opacity-60 absolute top-0 left-0 right-0 bottom-0 rounded-full bg-zinc-200 bg-opacity-0">
                                    <div className="group-hover:block hidden">
                                        <Icon name="image-edit" />
                                    </div>
                                </div>

                                {account.avatarUrl ? (
                                    <Image
                                        src={account.avatarUrl}
                                        alt="account avatar"
                                        className="object-cover"
                                        fill
                                    />
                                ) : (
                                    <Icon name="account" height={64} width={64} />
                                )}
                            </div>

                            <div>
                                <Typography variant="h2" className="text-2xl">
                                    {getAccountHandle()}
                                </Typography>
                                <Typography className="text-zinc-600 text-sm">
                                    {t("joined")}: {formatDMYDate(account.createdAt)}
                                </Typography>
                            </div>
                        </div>
                        {isUploadingImage && (
                            <div className="flex flex-row ml-3">
                                <div>
                                    <Icon name="loading" />
                                </div>
                                <Typography className="ml-2">{t("uploading-image")}</Typography>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                            <div>
                                <label htmlFor="firstName">
                                    <Typography>{t("first-name")}</Typography>
                                </label>
                                <Input
                                    name="firstName"
                                    hollow
                                    className="!p-2"
                                    value={firstName}
                                    onChange={setFirstName}
                                    hasError={fieldErrorCodesParser.has("firstName")}
                                    errorMsg={fieldErrorCodesParser.getTranslated("firstName")}
                                />
                            </div>

                            <div>
                                <label htmlFor="lastName">
                                    <Typography>{t("last-name")}</Typography>
                                </label>
                                <Input
                                    name="lastName"
                                    hollow
                                    className="!p-2"
                                    value={lastName}
                                    onChange={setLastName}
                                    hasError={fieldErrorCodesParser.has("lastName")}
                                    errorMsg={fieldErrorCodesParser.getTranslated("lastName")}
                                />
                            </div>

                            <div>
                                <label htmlFor="username">
                                    <Typography>{t("username")}</Typography>
                                </label>
                                <Input
                                    name="username"
                                    hollow
                                    className="!p-2"
                                    value={username}
                                    onChange={setUsername}
                                    disabled={!!(account.username && account.username.length > 0)}
                                    hasError={fieldErrorCodesParser.has("username")}
                                    errorMsg={fieldErrorCodesParser.getTranslated("username")}
                                />
                            </div>

                            <div>
                                <label htmlFor="email">
                                    <Typography>{t("email")}</Typography>
                                </label>
                                <Input
                                    name="email"
                                    hollow
                                    className="!p-2"
                                    value={account.email}
                                    disabled
                                />
                            </div>

                            <div>
                                <label htmlFor="phone">
                                    <Typography>{t("phone")}</Typography>
                                </label>
                                <Input
                                    name="phone"
                                    type="phone-2"
                                    value={phone}
                                    onChange={setPhone}
                                    hasError={fieldErrorCodesParser.has("phone")}
                                    errorMsg={fieldErrorCodesParser.getTranslated("phone")}
                                />
                            </div>
                        </div>

                        <div className="mt-8">
                            <Button.Primary
                                label={t("save")}
                                loading={isLoading || isRedirecting}
                                onClick={handleAccountPatch}
                            />
                        </div>
                    </div>
                </div>
            </Main>
            <Footer />
        </>
    );
}
