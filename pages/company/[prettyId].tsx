import Icon from "@/components/Icon";
import Link from "@/components/Link";
import Navbar from "@/components/Navbar";
import Typography from "@/components/Typography";
import { CompanyWithListings, getCompanyByPrettyId } from "@/util/api";
import { GetServerSideProps } from "next";
import { useTranslations } from "next-intl";
import React from "react";
import Pagination from "@/components/Pagination";
import ListingListItem from "@/components/listing/ListingListItem";
import Footer from "@/components/Footer";
import Head from "next/head";
import NoData from "@/components/NoData";

export const getServerSideProps: GetServerSideProps = async ({ params, locale, query }) => {
    let company: CompanyWithListings | null = null;
    if (!params?.prettyId || Array.isArray(params.prettyId)) {
        return {
            props: {
                messages: (await import(`../../locales/${locale || "hr"}.json`)).default,
                company,
            },
        };
    }
    let page: number | null = null;
    try {
        if (typeof query.page === "string") {
            page = parseInt(query.page);
        }
    } catch (_e) {}

    try {
        company = (await getCompanyByPrettyId(params.prettyId, page || 1)).data;
    } catch (e) {
        console.error("Failed to fetch company");
    }

    return {
        props: {
            messages: (await import(`../../locales/${locale || "hr"}.json`)).default,
            company,
        },
    };
};

interface CompanyByPrettyIdPageProps {
    company: CompanyWithListings | null;
}
export default function CompanyByPrettyIdPage({ company }: CompanyByPrettyIdPageProps) {
    const t = useTranslations("CompanyByPrettyIdPage");

    function hideHttps(link: string) {
        if (link.startsWith("https://www.")) {
            return link.split("https://www.")[1];
        }
        if (link.startsWith("www.")) {
            return link.split("www.")[1];
        }
        return link;
    }

    return (
        <>
            <Head>
                <title>{company ? company.name : "Imovinko tvrtka"}</title>
                <meta
                    name="description"
                    content={`Imovinko - stranica tvrtke ili agencije ${company?.name}.`}
                />
                <meta
                    name="keywords"
                    content="oglasnik, nekretnina, kuća, stan, zemljište, kupovina, prodaja, najam, tvrtka, agencija"
                />
            </Head>
            <header>
                <Navbar />
            </header>
            <main className="container mx-auto mt-8 flex-1">
                {company ? (
                    <div>
                        <div className="flex flex-col sm:flex-row">
                            <div
                                className="bg-zinc-100 rounded-xl shadow"
                                style={{
                                    minWidth: "280px",
                                    maxWidth: "420px",
                                }}
                            >
                                <div className="border-b-2 border-b-zinc-300 px-8 py-6 flex flex-col items-center justify-center">
                                    <Icon name="account" height={64} width={64} />
                                    <Typography bold>
                                        {company.storeName || company.name}
                                    </Typography>
                                    {company.website && (
                                        <Link
                                            newTab
                                            to={company.website}
                                            className="text-blue-700 mt-1"
                                            underlineClassName="!bg-blue-700"
                                        >
                                            <Typography className="text-sm">
                                                {hideHttps(company.website)}
                                            </Typography>
                                        </Link>
                                    )}
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
                                                        {new Date(company.createdAt)
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
                                                        {company.listings.count}
                                                    </Typography>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="sm:ml-4 mt-4 sm:mt-0">
                                <Typography variant="h1">{company.name}</Typography>
                                <Typography>{company.description}</Typography>
                            </div>
                        </div>
                        {/* TODO: Info about company agents somewhere here */}
                        <div className="w-full mt-8 max-w-3xl mx-auto">
                            <Typography variant="h2">
                                {t("company-listings")} ({company.listings.count})
                            </Typography>
                            <div className="mt-6 space-y-8">
                                {company.listings.data.length === 0 && (
                                    <NoData title={t("no-data-message")} />
                                )}
                                {company.listings.data.map((l) => {
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
                                {company.listings.totalPages > 1 && (
                                    <Pagination
                                        currentPage={company.listings.page}
                                        maxPage={company.listings.totalPages}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    // TODO: Create a 404 page
                    <div>No company found</div>
                )}
            </main>
            <Footer />
        </>
    );
}
