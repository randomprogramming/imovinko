import Navbar from "@/components/Navbar";
import Navigation from "@/components/account/Navigation";
import { GetServerSideProps } from "next";
import React, { useState } from "react";
import cookie from "cookie";
import {
    ListingBasic,
    PaginatedListingBasic,
    getMyListings,
    patchListingActivated,
    patchListingSaleData,
} from "@/util/api";
import Typography from "@/components/Typography";
import Link from "@/components/Link";
import ListingListItem from "@/components/listing/ListingListItem";
import Pagination from "@/components/Pagination";
import { useTranslations } from "next-intl";
import Footer from "@/components/Footer";
import Head from "next/head";
import NoData from "@/components/NoData";
import Dialog from "@/components/Dialog";
import { useRouter } from "next/router";
import Icon from "@/components/Icon";
import Main from "@/components/Main";
import Modal from "@/components/Modal";
import ListingCardItem from "@/components/listing/ListingCardItem";
import Input from "@/components/Input";
import useFieldErrorCodes from "@/hooks/useFieldErrorCodes";
import { isSold } from "@/util/listing";

export const getServerSideProps: GetServerSideProps = async ({ locale, req, query }) => {
    const cookies = req.headers.cookie;
    if (!cookies) {
        return {
            props: {
                messages: (await import(`../../../locales/${locale || "hr"}.json`)).default,
            },
        };
    }

    const parsed = cookie.parse(cookies);
    const jwt = parsed[process.env.NEXT_PUBLIC_JWT_COOKIE_NAME || ""];

    let myListings: PaginatedListingBasic | null = null;
    try {
        let page: number | undefined = undefined;
        if (typeof query.page === "string") {
            page = parseInt(query.page);
        }
        myListings = (await getMyListings(jwt, page)).data;
    } catch (e) {
        console.error(e);
    }

    return {
        props: {
            messages: (await import(`../../../locales/${locale || "hr"}.json`)).default,
            listings: myListings,
        },
    };
};

interface MyPropertiesPageProps {
    listings: PaginatedListingBasic;
}
export default function MyProperties({ listings }: MyPropertiesPageProps) {
    const t = useTranslations("MyPropertiesPage");

    const router = useRouter();

    const fieldErrorCodesParser = useFieldErrorCodes();

    const [removeListingModal, setRemoveListingModal] = useState<ListingBasic>();
    const [activateListingModal, setActivateListingModal] = useState<ListingBasic>();
    const [soldListingModal, setSoldListingModal] = useState<ListingBasic>();
    const [isDeactivatingListing, setIsDeactivatingListing] = useState(false);
    const [isActivatingListing, setIsActivatingListing] = useState(false);
    const [isSellingListing, setIsSellingListing] = useState(false);
    const [salePrice, setSalePrice] = useState<number | string>();

    async function handleListingDeactivate(prettyId: string) {
        if (isDeactivatingListing) {
            return;
        }
        setIsDeactivatingListing(true);
        try {
            await patchListingActivated(prettyId, false);
            await router.push(
                {
                    pathname: router.pathname,
                    query: {
                        deactivated: true,
                    },
                },
                undefined,
                { shallow: true }
            );
            router.reload();
        } catch (e) {
            setIsDeactivatingListing(false);
            console.error(e);
        }
    }

    async function handleListingActivate(prettyId: string) {
        if (isActivatingListing) {
            return;
        }
        setIsActivatingListing(true);
        try {
            await patchListingActivated(prettyId, true);
            await router.push(
                {
                    pathname: router.pathname,
                    query: {
                        activated: true,
                    },
                },
                undefined,
                { shallow: true }
            );
            router.reload();
        } catch (e) {
            setIsActivatingListing(false);
            console.error(e);
        }
    }

    async function handleListingSale(prettyId: string, salePrice: undefined | number | string) {
        if (isSellingListing) {
            return;
        }
        setIsSellingListing(true);
        fieldErrorCodesParser.empty();
        try {
            await patchListingSaleData(prettyId, salePrice);
            await router.push(
                {
                    pathname: router.pathname,
                    query: {
                        sold: true,
                    },
                },
                undefined,
                { shallow: true }
            );
            router.reload();
        } catch (e: any) {
            setIsSellingListing(false);
            if (e.response?.status === 400 && Array.isArray(e.response?.data)) {
                fieldErrorCodesParser.parseErrorCodes(e.response.data);
            } else if (typeof e.response?.data === "string") {
                fieldErrorCodesParser.parseErrorMessage(e.response.data);
            } else {
                console.error(e);
            }
        }
    }

    React.useEffect(() => {
        fieldErrorCodesParser.empty();
        if (!soldListingModal) {
            setSalePrice(undefined);
        } else {
            setSalePrice(soldListingModal.price);
        }
    }, [soldListingModal]);

    return (
        <>
            <Head>
                <title>Imovinko - Moji oglasi</title>
            </Head>
            <header>
                <Navbar />
            </header>

            <Main container mobilePadding>
                <Modal
                    small
                    show={!!soldListingModal}
                    onClose={() => {
                        setSoldListingModal(undefined);
                    }}
                >
                    <div className="flex flex-col min-w-[320px]">
                        <ListingCardItem
                            listing={soldListingModal!}
                            hideIconRow
                            className="!shadow-none !rounded-none"
                        />
                        <div className="px-2 mt-6 mb-4">
                            <Typography bold>{t("enter-sale-price")}:</Typography>
                            <Input
                                className="border border-zinc-300"
                                type="currency"
                                value={salePrice}
                                onChange={setSalePrice}
                                name="salePrice"
                                hasError={fieldErrorCodesParser.has("salePrice")}
                                errorMsg={fieldErrorCodesParser.getTranslated("salePrice")}
                            />
                        </div>
                        <div className="grid grid-cols-2 border-t border-zinc-300 ">
                            <div
                                className="px-2 py-1 text-center hover:bg-zinc-200 transition-all cursor-pointer"
                                onClick={() => {
                                    setSoldListingModal(undefined);
                                }}
                            >
                                <Typography className="select-none" bold>
                                    {t("cancel")}
                                </Typography>
                            </div>
                            <div
                                className="px-2 py-1 border-l border-zinc-300 text-center hover:bg-zinc-200 transition-all cursor-pointer flex flex-row justify-center"
                                onClick={() => {
                                    handleListingSale(soldListingModal!.prettyId, salePrice);
                                }}
                            >
                                {isSellingListing && (
                                    <Icon width={20} height={20} name="loading" className="mr-2" />
                                )}
                                <Typography className="text-green-700 select-none" bold>
                                    {t("sold")}
                                </Typography>
                            </div>
                        </div>
                    </div>
                </Modal>
                <Modal
                    small
                    show={!!removeListingModal}
                    onClose={() => {
                        setRemoveListingModal(undefined);
                    }}
                >
                    <div className="flex flex-col">
                        <ListingCardItem
                            listing={removeListingModal!}
                            hideIconRow
                            className="!shadow-none !rounded-none"
                        />
                        <Typography className="text-center mt-6 mb-2 px-4" bold>
                            {t("deactivate-listing")}
                        </Typography>
                        <div className="grid grid-cols-2 border-t border-zinc-300 ">
                            <div
                                className="px-2 py-1 text-center hover:bg-zinc-200 transition-all cursor-pointer"
                                onClick={() => {
                                    setRemoveListingModal(undefined);
                                }}
                            >
                                <Typography className="text-blue-500 select-none" bold>
                                    {t("no")}
                                </Typography>
                            </div>
                            <div
                                className="px-2 py-1 border-l border-zinc-300 text-center hover:bg-zinc-200 transition-all cursor-pointer flex flex-row justify-center"
                                onClick={() => {
                                    handleListingDeactivate(removeListingModal!.prettyId);
                                }}
                            >
                                {isDeactivatingListing && (
                                    <Icon width={20} height={20} name="loading" className="mr-2" />
                                )}
                                <Typography className="text-red-500 select-none" bold>
                                    {t("deactivate")}
                                </Typography>
                            </div>
                        </div>
                    </div>
                </Modal>

                <Modal
                    small
                    show={!!activateListingModal}
                    onClose={() => {
                        setActivateListingModal(undefined);
                    }}
                >
                    <div className="flex flex-col min-w-[320px]">
                        <ListingCardItem
                            listing={activateListingModal!}
                            hideIconRow
                            className="!shadow-none !rounded-none"
                        />
                        <Typography className="text-center mt-6 mb-2 px-4" bold>
                            {t("activate-listing")}
                        </Typography>
                        <div className="grid grid-cols-2 border-t border-zinc-300 ">
                            <div
                                className="px-2 py-1 text-center hover:bg-zinc-200 transition-all cursor-pointer"
                                onClick={() => {
                                    setActivateListingModal(undefined);
                                }}
                            >
                                <Typography className="select-none" bold>
                                    {t("no")}
                                </Typography>
                            </div>
                            <div
                                className="px-2 py-1 border-l border-zinc-300 text-center hover:bg-zinc-200 transition-all cursor-pointer flex flex-row justify-center"
                                onClick={() => {
                                    handleListingActivate(activateListingModal!.prettyId);
                                }}
                            >
                                {isActivatingListing && (
                                    <Icon width={20} height={20} name="loading" className="mr-2" />
                                )}
                                <Typography className="text-emerald-500 select-none" bold>
                                    {t("activate")}
                                </Typography>
                            </div>
                        </div>
                    </div>
                </Modal>

                <div className="flex flex-col lg:flex-row mt-8">
                    <Navigation />
                    <div className="px-4 flex flex-col flex-1 max-w-2xl mx-auto">
                        {router.query.listingCreated === "true" && (
                            <Dialog
                                className="mb-4"
                                type="success"
                                title={t("listing-added")}
                                message={t("listing-added-messages")}
                            />
                        )}
                        {router.query.listingUpdated === "true" && (
                            <Dialog
                                className="mb-4"
                                type="success"
                                title={t("listing-updated")}
                                message={t("listing-updated-messages")}
                            />
                        )}
                        {router.query.activated === "true" && !isActivatingListing && (
                            <Dialog
                                className="mb-4"
                                type="success"
                                title={t("listing-was-activated")}
                                message={t("listing-was-activated-message")}
                            />
                        )}
                        {router.query.deactivated === "true" && !isDeactivatingListing && (
                            <Dialog
                                className="mb-4"
                                type="warning"
                                title={t("listing-was-deactivated")}
                                message={t("listing-was-deactivated-message")}
                            />
                        )}
                        {router.query.sold === "true" && !isSellingListing && (
                            <Dialog
                                className="mb-4"
                                type="success"
                                title={t("listing-sold")}
                                message={t("listing-sold-message")}
                            />
                        )}
                        <Typography variant="h2">
                            {t("my-listings")}
                            {` (${listings.count})`}
                        </Typography>
                        <div className="mt-4 space-y-4 w-full">
                            {listings.data.length === 0 && (
                                <NoData>
                                    <Typography>
                                        {t("no-data-message")}{" "}
                                        <Link to="/list">
                                            <Typography bold variant="span">
                                                {t("add-new")}
                                            </Typography>
                                        </Link>
                                    </Typography>
                                </NoData>
                            )}
                            {listings.data.map((l) => {
                                return (
                                    <div key={l.prettyId} className="relative flex flex-col w-full">
                                        <div className="flex-1 relative max-w-full">
                                            <ListingListItem
                                                showCustomId
                                                listing={l}
                                                className={
                                                    !!l.deactivated ? "border-2 border-red-700" : ""
                                                }
                                            />
                                        </div>
                                        {/* When a listing is sold, it may not be edited anymore */}
                                        {!isSold(l) && (
                                            <div className="flex flex-row">
                                                <div className="flex-1"></div>
                                                <div className="flex flex-row items-center bg-zinc-50 rounded shadow-sm mt-1 border border-zinc-300">
                                                    <button
                                                        onClick={() => {
                                                            l.deactivated
                                                                ? setActivateListingModal(l)
                                                                : setRemoveListingModal(l);
                                                        }}
                                                        className="outline-none hover:bg-zinc-200 transition-all p-2 flex items-center justify-center border-r border-zinc-300"
                                                    >
                                                        {l.deactivated ? (
                                                            <Icon
                                                                name="checkmark"
                                                                className="fill-emerald-600"
                                                            />
                                                        ) : (
                                                            <Icon
                                                                name="close"
                                                                className="fill-red-600"
                                                            />
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSoldListingModal(l);
                                                        }}
                                                        className="outline-none  hover:bg-zinc-200 transition-all p-2 flex items-center justify-center border-r border-zinc-300"
                                                    >
                                                        <Icon
                                                            className="fill-none stroke-2 !stroke-emerald-700"
                                                            name="sold"
                                                        />
                                                    </button>
                                                    <Link
                                                        disableAnimatedHover
                                                        to={`/listing/edit/${l.prettyId}`}
                                                        className="hover:bg-zinc-200 transition-all p-2 flex items-center justify-center"
                                                    >
                                                        <Icon name="edit" />
                                                    </Link>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex items-center justify-center my-6">
                            <Pagination currentPage={listings.page} maxPage={listings.totalPages} />
                        </div>
                    </div>
                </div>
            </Main>
            <Footer />
        </>
    );
}
