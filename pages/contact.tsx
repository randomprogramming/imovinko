import Button from "@/components/Button";
import Dialog from "@/components/Dialog";
import Footer from "@/components/Footer";
import Icon from "@/components/Icon";
import Input from "@/components/Input";
import Link from "@/components/Link";
import Main from "@/components/Main";
import Navbar from "@/components/Navbar";
import Typography from "@/components/Typography";
import useFieldErrorCodes from "@/hooks/useFieldErrorCodes";
import { createContactMessage } from "@/util/api";
import { NextPageContext } from "next";
import { useTranslations } from "next-intl";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useState } from "react";

export async function getStaticProps(context: NextPageContext) {
    return {
        props: {
            messages: (await import(`../locales/${context.locale || "hr"}.json`)).default,
        },
    };
}

export default function Contact() {
    const t = useTranslations("Contact");

    const router = useRouter();

    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [isSending, setIsSending] = useState(false);

    const fieldErrorCodesParser = useFieldErrorCodes();

    async function onSubmit() {
        fieldErrorCodesParser.empty();
        setIsSending(true);
        try {
            await createContactMessage({
                email,
                message,
            });
            await router.push({
                pathname: router.pathname,
                query: {
                    sent: true,
                },
            });
            router.reload();
        } catch (e: any) {
            console.error(e);
            if (e?.response?.status === 400 && e?.response?.data) {
                fieldErrorCodesParser.parseErrorCodes(e.response.data);
            }
        } finally {
            setIsSending(false);
        }
    }

    return (
        <>
            <Head>
                <title>Imovinko - Kontakt</title>
                <meta name="description" content="Imovinko - kontakt." />
                <meta
                    name="keywords"
                    content="oglasnik, nekretnina, kuća, stan, zemljište, kupovina, prodaja, najam, kontakt"
                />
            </Head>
            <header className="container mx-auto ">
                <Navbar />
            </header>
            <Main className="!flex-row" container mobilePadding>
                <div className="px-1 md:max-w-lg w-full flex-1 mb-4">
                    {router.query.sent === "true" && (
                        <Dialog type="success" title={t("sent")} message={t("sent-description")} />
                    )}
                    <Typography variant="h1" className="mt-2 md:mt-6">
                        {t("contact-us")}
                    </Typography>
                    <Typography className="text-zinc-500">{t("contact-us-description")}</Typography>
                    <div className="space-y-6 mt-6">
                        <div>
                            <label htmlFor="email" className="select-none">
                                <Typography variant="secondary" uppercase>
                                    {t("your-email")}
                                </Typography>
                            </label>
                            <Input
                                name="email"
                                value={email}
                                onChange={setEmail}
                                hasError={fieldErrorCodesParser.has("email")}
                                errorMsg={fieldErrorCodesParser.getTranslated("email")}
                            />
                        </div>
                        <div>
                            <label htmlFor="message" className="select-none">
                                <Typography variant="secondary" uppercase>
                                    {t("your-message")}
                                </Typography>
                            </label>
                            <Input
                                name="message"
                                value={message}
                                onChange={setMessage}
                                type="textarea"
                                hasError={fieldErrorCodesParser.has("message")}
                                errorMsg={fieldErrorCodesParser.getTranslated("message")}
                            />
                        </div>
                        <Button.Primary onClick={onSubmit} label={t("send")} loading={isSending} />
                    </div>
                </div>
                <div className="hidden md:block relative ml-4 mb-4 rounded-xl overflow-hidden shadow max-w-7xl flex-1">
                    <div className="absolute right-10 bottom-10 z-20">
                        <Link to="/">
                            <Icon name="logo-text" className="fill-zinc-50" />
                        </Link>
                    </div>
                    <Image src={"/images/lights.jpg"} alt="lights" fill className="object-cover" />
                </div>
            </Main>
            <Footer className="!m-0" />
        </>
    );
}
