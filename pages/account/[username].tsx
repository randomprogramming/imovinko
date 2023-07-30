import Icon from "@/components/Icon";
import Navbar from "@/components/Navbar";
import Pagination from "@/components/Pagination";
import Typography from "@/components/Typography";
import { FullPublicAccount, ListingBasic, OfferingType, getAccountByUsername } from "@/util/api";
import { GetServerSideProps } from "next";
import { useTranslations } from "next-intl";
import React from "react";
import Image from "next/image";
import IconRow from "@/components/listing/IconRow";
import Link from "@/components/Link";
import { ParsedUrlQuery } from "querystring";
import { useRouter } from "next/router";
import ListingListItem from "@/components/listing/ListingListItem";

export const getServerSideProps: GetServerSideProps = async ({ params, query, locale }) => {
    let account: FullPublicAccount | null = null;
    if (typeof params?.username === "string") {
        let pageNum: number | undefined = undefined;
        try {
            if (typeof query.page === "string") {
                pageNum = parseInt(query.page);
            }
        } catch (e) {}
        const { data } = await getAccountByUsername(params.username, pageNum);
        account = data;
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
    query: ParsedUrlQuery;
}
export default function AccountByUsernamePage({ account, query }: AccountByUsernamePageProps) {
    const t = useTranslations("AccountByUsernamePage");

    const router = useRouter();

    async function handlePageChange(newPage: number) {
        if (account) {
            const oldParams = query ? { ...query } : {};
            await router.push(
                {
                    pathname: `/account/${account.username}`,
                    query: { ...oldParams, page: newPage },
                },
                undefined,
                {
                    // I'm not sure how to show a "loading" state when getServerSideProps runs, so just do this instead and manually reload the page
                    shallow: true,
                }
            );
            router.reload();
        }
    }

    return (
        <>
            <header>
                <Navbar />
            </header>
            <main className="container mx-auto mt-8">
                {account ? (
                    <div>
                        <div className="flex flex-col sm:flex-row w-full max-w-3xl mx-auto">
                            <div
                                className="bg-zinc-100 rounded-xl shadow"
                                style={{
                                    minWidth: "280px",
                                    maxWidth: "420px",
                                }}
                            >
                                <div className="border-b-2 border-b-zinc-300 px-8 py-6 flex flex-col items-center justify-center">
                                    {/* TODO: Use account image in the future */}
                                    <Icon name="account" height={64} width={64} />
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
                            <div className="sm:ml-4">
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
                            <Typography variant="h2">{t("account-listings")}</Typography>
                            <div className="mt-6 space-y-8">
                                {account.listings.data.map((l) => {
                                    return (
                                        <Link
                                            disableAnimatedHover
                                            className="flex"
                                            key={l.prettyId}
                                            to={`/listing/${l.prettyId}`}
                                        >
                                            <ListingListItem listing={l} />
                                        </Link>
                                    );
                                })}
                            </div>
                            <div className="flex items-center justify-center my-6">
                                {account.listings.totalPages > 1 && (
                                    <Pagination
                                        currentPage={account.listings.page}
                                        maxPage={account.listings.totalPages}
                                        onPageChange={handlePageChange}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    // TODO: Create a 404 page
                    <div>Username not found</div>
                )}
            </main>
        </>
    );
}
