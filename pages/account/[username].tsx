import Icon from "@/components/Icon";
import Navbar from "@/components/Navbar";
import Pagination from "@/components/Pagination";
import Typography from "@/components/Typography";
import { FullPublicAccount, getAccountByUsername } from "@/util/api";
import { GetServerSideProps } from "next";
import { useTranslations } from "next-intl";
import React from "react";
import Link from "@/components/Link";
import ListingListItem from "@/components/listing/ListingListItem";
import Footer from "@/components/Footer";
import Head from "next/head";
import NoData from "@/components/NoData";
import NotFound from "@/components/404";
import Image from "next/image";
import Main from "@/components/Main";
import cookie from "cookie";

export const getServerSideProps: GetServerSideProps = async ({ params, query, locale, req }) => {
    let account: FullPublicAccount | null = null;
    if (typeof params?.username === "string") {
        let pageNum: number | undefined = undefined;
        try {
            if (typeof query.page === "string") {
                pageNum = parseInt(query.page);
            }
            const cookies = req.headers.cookie;

            const parsed = cookie.parse(cookies || "");
            const jwt = parsed[process.env.NEXT_PUBLIC_JWT_COOKIE_NAME || ""];
            const { data } = await getAccountByUsername(params.username, pageNum, jwt);
            account = data;
        } catch (e) {
            console.error(e);
        }
    }

    return {
        props: {
            messages: (await import(`../../locales/${locale || "hr"}.json`)).default,
            account,
        },
    };
};

interface AccountByUsernamePageProps {
    account: FullPublicAccount | null;
}
export default function AccountByUsernamePage({ account }: AccountByUsernamePageProps) {
    const t = useTranslations("AccountByUsernamePage");

    return (
        <>
            <Head>
                <title>{account ? account.username : "Imovinko račun"}</title>
                <meta
                    name="description"
                    content={`Imovinko - stranica korisničkog računa ${account?.username}.`}
                />
                <meta
                    name="keywords"
                    content="oglasnik, nekretnina, kuća, stan, zemljište, kupovina, prodaja, najam, račun"
                />
            </Head>
            <header>
                <Navbar />
            </header>
            <Main container>
                {account ? (
                    <div>
                        <div className="flex flex-col-reverse sm:flex-row w-full max-w-3xl mx-auto">
                            <div
                                className="bg-zinc-100 sm:rounded-xl shadow sm:max-w-[420px]"
                                style={{
                                    minWidth: "280px",
                                }}
                            >
                                <div className="border-b-2 border-b-zinc-300 px-8 py-6 flex flex-col items-center justify-center">
                                    {account.avatarUrl ? (
                                        <div className="relative h-32 w-32 rounded-full overflow-hidden shadow">
                                            <Image
                                                src={account.avatarUrl}
                                                alt="account avatar"
                                                className="object-cover"
                                                fill
                                            />
                                        </div>
                                    ) : (
                                        <Icon name="account" height={64} width={64} />
                                    )}
                                    <Typography bold>
                                        {account.firstName}
                                        {account.firstName && " "}
                                        {account.lastName}
                                    </Typography>
                                    <Typography>{account.username}</Typography>
                                </div>
                                <div className="p-3">
                                    <table>
                                        <tbody>
                                            <tr>
                                                <td>
                                                    <Typography className="text-zinc-500" sm>
                                                        {t("joined")}:
                                                    </Typography>
                                                </td>
                                                <td className="pl-1">
                                                    <Typography bold className="text-sm" sm>
                                                        {new Date(account.createdAt)
                                                            .toLocaleDateString(undefined, {
                                                                day: "2-digit",
                                                                month: "2-digit",
                                                                year: "numeric",
                                                            })
                                                            .replaceAll("/", ".")}
                                                    </Typography>
                                                </td>
                                            </tr>

                                            <tr>
                                                <td>
                                                    <Typography className="text-zinc-500" sm>
                                                        {t("listings")}:
                                                    </Typography>
                                                </td>
                                                <td className="pl-1">
                                                    <Typography bold sm>
                                                        {account.listings.count}
                                                    </Typography>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="sm:ml-4 sm:mt-0">
                                <Typography variant="h1">{account.username}</Typography>
                                {account.company && (
                                    <Typography>
                                        {t("user-is-in-company")}{" "}
                                        <Link
                                            to={`/company/${account.company.prettyId}`}
                                            className="text-blue-600 font-bold"
                                            underlineClassName="!bg-blue-600"
                                        >
                                            <Typography variant="span">
                                                {account.company.name}
                                            </Typography>
                                        </Link>
                                    </Typography>
                                )}
                            </div>
                        </div>
                        <div className="w-full mt-8 max-w-3xl mx-auto">
                            <Typography variant="h2">
                                {t("account-listings")} ({account.listings.count})
                            </Typography>
                            <div className="mt-6 space-y-8">
                                {account.listings.data.length === 0 && (
                                    <div>
                                        <NoData title={t("no-data-message")} />
                                    </div>
                                )}
                                {account.listings.data.map((l) => {
                                    return <ListingListItem key={l.prettyId} listing={l} />;
                                })}
                            </div>
                            <div className="flex items-center justify-center my-6">
                                <Pagination
                                    currentPage={account.listings.page}
                                    maxPage={account.listings.totalPages}
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    <NotFound>
                        <Typography className="text-lg">{t("not-found")}</Typography>
                    </NotFound>
                )}
            </Main>
            <Footer />
        </>
    );
}
