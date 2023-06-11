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

    async function onLogin() {
        try {
            setIsSendingLoginReq(true);
            const response = await login({ handle, password });
            setJWTCookie(response.data.accessToken);
            router.push("/");
        } catch (e) {
        } finally {
            setIsSendingLoginReq(false);
        }
    }

    return (
        <div className="flex-1 flex flex-row">
            <div className="hidden lg:flex" style={{ flex: 3 }}>
                <div className="relative w-full flex-1 overflow-hidden">
                    <Link to="/" className="absolute z-30 top-10 left-12 p-1">
                        <Icon name="logo-text" height={48} />
                    </Link>
                    <Image
                        src="/images/login-cover.jpg"
                        alt="modern house exterior"
                        fill
                        style={{
                            objectFit: "cover",
                        }}
                    />
                </div>
            </div>
            <div className="bg-zinc-100 rounded-3xl -ml-10 z-50" style={{ flex: 2 }}>
                <div className="px-10 py-6">
                    <Typography variant="h1">{t("welcome")}</Typography>

                    <div className="mt-8">
                        <Button.Primary
                            icon="google"
                            label={t("sign-in-google")}
                            hollow
                            onClick={() => {
                                router.push(GOOGLE_REGISTER_URL);
                            }}
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

                    <div className="mt-4">
                        <label htmlFor="handle">
                            <Typography variant="secondary" uppercase>
                                {t("username-or-email")}
                            </Typography>
                        </label>
                        <Input
                            name="handle"
                            className="mt-1"
                            onChange={setHandle}
                            placeholder="username300"
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
                            className="mt-1"
                            onChange={setPassword}
                            placeholder={t("password")}
                            type="password"
                        />
                    </div>

                    <div className="mt-6">
                        <Button.Primary
                            label={t("sign-in")}
                            onClick={onLogin}
                            loading={isSendingLoginReq}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
