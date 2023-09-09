import React, { useState, useEffect } from "react";
import Footer from "@/components/Footer";
import Main from "@/components/Main";
import Navbar from "@/components/Navbar";
import Conversation from "@/components/conversations/Conversation";
import Conversations from "@/components/conversations/Conversations";
import { Conversation as IConversation, getConversations } from "@/util/api";
import { GetServerSideProps } from "next";
import Head from "next/head";
import cookie from "cookie";
import Typography from "@/components/Typography";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import Icon from "@/components/Icon";
import Button from "@/components/Button";

export const getServerSideProps: GetServerSideProps = async ({ req, locale }) => {
    const cookies = req.headers.cookie;

    const parsed = cookie.parse(cookies || "");
    const jwt = parsed[process.env.NEXT_PUBLIC_JWT_COOKIE_NAME || ""];

    let conversations;
    try {
        const conversationsResponse = await getConversations(jwt);
        conversations = conversationsResponse.data;
    } catch (e) {
        console.error(e);
    }

    return {
        props: {
            messages: (await import(`../locales/${locale || "hr"}.json`)).default,
            conversations: conversations || [],
        },
    };
};

interface ConversationsPageProps {
    conversations: IConversation[];
}
export default function ConversationsPage({ conversations }: ConversationsPageProps) {
    const t = useTranslations("Conversations");

    const router = useRouter();

    const [hasConversationSelected, setHasConversationSelected] = useState(false);

    useEffect(() => {
        if (typeof router.query.c === "string" && router.query.c.length > 0) {
            setHasConversationSelected(true);
        } else {
            setHasConversationSelected(false);
        }
    }, [router.query]);

    return (
        <>
            <Head>
                <title>Imovinko - Razgovori</title>
                <meta name="description" content="Imovinko - razgovori." />
                <meta
                    name="keywords"
                    content="oglasnik, nekretnina, kuća, stan, zemljište, kupovina, prodaja, najam"
                />
            </Head>
            <header className="container mx-auto">
                <Navbar />
            </header>
            <Main container className="!flex-row px-1 md:px-0">
                {/* On mobile, show only either the conversations list, or the open conversation */}
                <div
                    className={`${
                        hasConversationSelected ? "hidden md:block" : "block"
                    } w-full md:w-1/3`}
                >
                    <div className="h-full bg-white rounded-md shadow-sm">
                        <Typography variant="h1" className="px-2 py-1">
                            {t("conversations")}
                        </Typography>
                        <Conversations conversations={conversations} />
                    </div>
                </div>
                <div
                    className={`${
                        hasConversationSelected ? "flex flex-col" : "hidden"
                    } md:flex md:flex-1 md:ml-4`}
                >
                    <div className="flex flex-row items-center md:hidden my-2">
                        <Button.Transparent
                            className="!py-0.5 !pl-0 border-2 border-black"
                            onClick={() => {
                                router.replace({
                                    pathname: router.pathname,
                                    query: {},
                                });
                            }}
                        >
                            <Icon
                                name="down-chevron"
                                className="origin-center rotate-45"
                                width={48}
                                height={48}
                            />
                            <Typography variant="h2">{t("conversations")}</Typography>
                        </Button.Transparent>
                    </div>
                    <Conversation allConversations={conversations} />
                </div>
            </Main>
            <Footer />
        </>
    );
}
