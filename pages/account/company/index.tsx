import Navbar from "@/components/Navbar";
import Navigation from "@/components/account/Navigation";
import { GetServerSideProps } from "next";
import React, { useState } from "react";
import cookie from "cookie";
import { useTranslations } from "next-intl";
import { Company, createManualAccount, getMyCompany, inviteMember, patchCompany } from "@/util/api";
import Link from "@/components/Link";
import Typography from "@/components/Typography";
import Icon from "@/components/Icon";
import Input from "@/components/Input";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import { useRouter } from "next/router";
import { ParsedUrlQuery } from "querystring";
import Dialog from "@/components/Dialog";

export const getServerSideProps: GetServerSideProps = async ({ locale, req, query }) => {
    const cookies = req.headers.cookie;
    if (!cookies) {
        return {
            props: {
                messages: (await import(`../../../locales/${locale || "hr"}.json`)).default,
                query,
            },
        };
    }

    const parsed = cookie.parse(cookies);
    const jwt = parsed[process.env.NEXT_PUBLIC_JWT_COOKIE_NAME || ""];

    let company: Company | null = null;
    try {
        const { data } = await getMyCompany(jwt);
        company = data;
    } catch (e) {
        console.error("Error when fetching company");
    }

    return {
        props: {
            messages: (await import(`../../../locales/${locale || "hr"}.json`)).default,
            company,
            query,
        },
    };
};

interface CompanyPageProps {
    company: Company | null;
    query: ParsedUrlQuery;
}
export default function CompanyPage({ company, query }: CompanyPageProps) {
    const successfullyInvited = !!query.invited;
    const manualSuccessfullyCreate = !!query.manualEntry;

    const t = useTranslations("CompanyPage");

    const router = useRouter();

    const [website, setWebsite] = useState(company?.website || "");
    const [storeName, setStoreName] = useState(company?.storeName || "");
    const [description, setDescription] = useState(company?.description || "");
    const [isLoading, setIsLoading] = useState(false);
    const [showAddAccountModal, setShowAddAccountModal] = useState(false);

    const [manualEntryFirstName, setManualEntryFirstName] = useState("");
    const [manualEntryLastName, setManualEntryLastName] = useState("");
    const [manualEntryPhoneNumber, setManualEntryPhoneNumber] = useState("");
    const [manualEntryEmail, setManualEntryEmail] = useState("");
    const [isCreatingManualAccount, setIsCreatingManualAccount] = useState(false);

    const [handle, setHandle] = useState("");
    const [isInvitingMember, setIsInvitingMember] = useState(false);

    async function handleCompanyPatch() {
        setIsLoading(true);
        try {
            await patchCompany({
                website,
                storeName,
                description,
            });
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }

    function renderUsernameTitle() {
        const username = t("username");

        const splitU = username.split(" ");
        if (splitU.length === 1) {
            return (
                <Typography className="text-zinc-600 !font-semibold break-keep min-w-fit">
                    {t("username")}
                </Typography>
            );
        } else if (splitU.length === 2) {
            return (
                <>
                    <Typography className="text-zinc-600 !font-semibold break-keep min-w-fit">
                        {splitU[0]}
                    </Typography>
                    <Typography>&nbsp;</Typography>
                    <Typography className="text-zinc-600 !font-semibold break-keep min-w-fit">
                        {splitU[1]}
                    </Typography>
                </>
            );
        }
        return <div />;
    }

    async function postManualAccount() {
        setIsCreatingManualAccount(true);
        try {
            await createManualAccount({
                firstName: manualEntryFirstName,
                lastName: manualEntryLastName,
                phone: manualEntryPhoneNumber,
                email: manualEntryEmail,
            });
            await router.push(
                {
                    pathname: "/account/company",
                    query: {
                        manualEntry: true,
                    },
                },
                undefined,
                {
                    shallow: true,
                    scroll: true,
                }
            );
            router.reload();
        } catch (e) {
            console.error(e);
        } finally {
            setIsCreatingManualAccount(false);
        }
    }

    async function handleInviteMember() {
        setIsInvitingMember(true);
        try {
            await inviteMember(handle);
            await router.push(
                {
                    pathname: "/account/company",
                    query: {
                        invited: true,
                    },
                },
                undefined,
                {
                    shallow: true,
                    scroll: true,
                }
            );
            router.reload();
        } catch (e) {
            console.error(e);
        } finally {
            setIsInvitingMember(false);
        }
    }

    return (
        <>
            <header>
                <Navbar />
            </header>
            <Modal
                show={showAddAccountModal}
                onClose={() => {
                    setShowAddAccountModal(false);
                }}
            >
                <div className="w-full h-full p-2 flex flex-col relative">
                    <Button.Transparent
                        className="absolute right-4 top-3"
                        onClick={() => {
                            setShowAddAccountModal(false);
                        }}
                    >
                        <Icon name="close" />
                    </Button.Transparent>
                    <div className="flex-1 flex flex-col lg:flex-row justify-evenly">
                        <div className="flex-1 flex flex-col pr-2 max-w-3xl">
                            <Typography className="mt-8 lg:mt-32" variant="h2">
                                {t("invite-member")}
                            </Typography>
                            <Typography>{t("invite-member-description")}</Typography>
                            <div>
                                <div className="mt-4">
                                    <label htmlFor="name">
                                        <Typography>TODO: FINISH ME</Typography>
                                    </label>
                                    <Input
                                        name="name"
                                        hollow
                                        className="!p-2 max-w-sm"
                                        value={handle}
                                        onChange={setHandle}
                                    />
                                </div>

                                <div className="mt-8">
                                    <Button.Primary
                                        label={t("invite")}
                                        loading={isInvitingMember}
                                        onClick={handleInviteMember}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="px-8 py-6 lg:py-20 lg:px-0">
                            <div className="h-0.5 lg:w-0.5 w-full lg:h-full bg-zinc-300 rounded-full shadow-sm" />
                        </div>
                        <div className="flex-1 flex flex-col pl-2 max-w-3xl">
                            <Typography className="mt-8 lg:mt-32" variant="h2">
                                {t("manual-member")}
                            </Typography>
                            <Typography>{t("manual-member-description")}</Typography>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                                {/* TODO: Add ability to add picture */}
                                <div>
                                    <label htmlFor="manualFirstName">
                                        <Typography>{t("first-name")}</Typography>
                                    </label>
                                    <Input
                                        name="manualFirstName"
                                        hollow
                                        className="!p-2"
                                        value={manualEntryFirstName}
                                        onChange={setManualEntryFirstName}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="manualLastName">
                                        <Typography>{t("last-name")}</Typography>
                                    </label>
                                    <Input
                                        name="manualLastName"
                                        hollow
                                        className="!p-2"
                                        value={manualEntryLastName}
                                        onChange={setManualEntryLastName}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="manualNumber">
                                        <Typography>{t("phone")}</Typography>
                                    </label>
                                    <Input
                                        name="manualNumber"
                                        hollow
                                        className="!p-2"
                                        value={manualEntryPhoneNumber}
                                        onChange={setManualEntryPhoneNumber}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="manualEmail">
                                        <Typography>{t("email")}</Typography>
                                    </label>
                                    <Input
                                        name="manualEmail"
                                        hollow
                                        className="!p-2"
                                        value={manualEntryEmail}
                                        onChange={setManualEntryEmail}
                                    />
                                </div>
                            </div>

                            <div className="mt-8 mb-8">
                                <Button.Primary
                                    label={t("create-manual")}
                                    loading={isCreatingManualAccount}
                                    onClick={postManualAccount}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
            <main className="container mx-auto flex-1">
                {successfullyInvited && (
                    <Dialog
                        className="mt-4"
                        type="success"
                        title={t("success")}
                        message={t("success-message")}
                    />
                )}
                {manualSuccessfullyCreate && (
                    <Dialog
                        className="mt-4"
                        type="success"
                        title={t("manual-succes")}
                        message={t("manual-message")}
                    />
                )}
                <div className="flex flex-col lg:flex-row mt-8">
                    <Navigation />
                    <div className="px-4 flex flex-col flex-1 max-w-2xl mx-auto">
                        {company ? (
                            <div>
                                <div className="flex flex-row items-center space-x-2">
                                    <Icon name="account" height={64} width={64} />

                                    <div>
                                        <Typography variant="h2" className="text-2xl">
                                            {company.name}
                                        </Typography>
                                        <Typography className="text-zinc-600 text-sm">
                                            {t("created")}:{" "}
                                            {new Date(company.createdAt)
                                                .toLocaleDateString(undefined, {
                                                    day: "2-digit",
                                                    month: "2-digit",
                                                    year: "numeric",
                                                })
                                                .replaceAll("/", ".")}
                                        </Typography>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                                    <div>
                                        <label htmlFor="name">
                                            <Typography>{t("name")}</Typography>
                                        </label>
                                        <Input
                                            name="name"
                                            hollow
                                            className="!p-2"
                                            value={company.name}
                                            disabled
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="pin">
                                            <Typography>{t("pin")}</Typography>
                                        </label>
                                        <Input
                                            name="pin"
                                            hollow
                                            className="!p-2"
                                            value={company.PIN}
                                            disabled
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="website">
                                            <Typography>{t("web-page")}</Typography>
                                        </label>
                                        <Input
                                            name="website"
                                            hollow
                                            className="!p-2"
                                            value={website}
                                            onChange={setWebsite}
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="storeName">
                                            <Typography>{t("store-name")}</Typography>
                                        </label>
                                        <Input
                                            name="storeName"
                                            hollow
                                            className="!p-2"
                                            value={storeName}
                                            onChange={setStoreName}
                                        />
                                    </div>

                                    <div className="col-span-1 md:col-span-2">
                                        <label htmlFor="description">
                                            <Typography>{t("description")}</Typography>
                                        </label>
                                        <Input
                                            type="textarea"
                                            name="description"
                                            value={description}
                                            onChange={setDescription}
                                        />
                                    </div>
                                </div>

                                <div className="mt-8">
                                    <Button.Primary
                                        label={t("save")}
                                        loading={isLoading}
                                        onClick={handleCompanyPatch}
                                    />
                                </div>

                                {/* Divider */}
                                <div
                                    className="col-span-1 md:col-span-2 bg-zinc-300 rounded-full my-12 shadow-sm"
                                    style={{
                                        height: "3px",
                                    }}
                                ></div>

                                <div className="col-span-1 md:col-span-2">
                                    <Typography variant="h2">{t("members")}</Typography>
                                    <Typography>{t("members-description")}</Typography>
                                    <Typography className="mt-2">
                                        {t("registered-users-1")}{" "}
                                        <Typography variant="span">
                                            <Icon
                                                className="inline"
                                                name="checkmark"
                                                height={15}
                                                width={15}
                                            />
                                        </Typography>{" "}
                                        {t("registered-users-2")}
                                    </Typography>
                                    <div className="max-w-full overflow-x-auto mt-4">
                                        <table className="border-separate border-spacing-0 ">
                                            <thead>
                                                <tr className="border-2 rounded-lg border-zinc-300">
                                                    <th className="border-t-2 border-b-2 border-l-2 border-zinc-300 rounded-tl-md">
                                                        {/* Image */}
                                                    </th>
                                                    <th className="border-t-2 border-b-2 border-zinc-300">
                                                        <div className="text-left py-2">
                                                            <Typography className="text-zinc-600 !font-semibold">
                                                                {t("member")}
                                                            </Typography>
                                                        </div>
                                                    </th>
                                                    <th className="border-t-2 border-b-2 border-zinc-300 border-r-2 rounded-tr-md pr-4 text-left">
                                                        <div className="flex flex-row break-keep min-w-fit">
                                                            {renderUsernameTitle()}
                                                        </div>
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="last:border-l-2 last:border-zinc-300">
                                                <tr>
                                                    <td
                                                        colSpan={100}
                                                        className="border-l-2 border-b-2 border-zinc-300 border-r-2 p-1"
                                                    >
                                                        <div
                                                            className="flex items-center justify-center w-full hover:bg-zinc-300 cursor-pointer py-2 rounded-lg transition-all"
                                                            onClick={() => {
                                                                setShowAddAccountModal(true);
                                                            }}
                                                        >
                                                            <Icon
                                                                name="account-plus"
                                                                height={48}
                                                                width={48}
                                                            />
                                                        </div>
                                                    </td>
                                                </tr>
                                                {company.manualAccounts.map((ma) => {
                                                    return (
                                                        <tr key={ma.email}>
                                                            <td
                                                                className={`border-l-2 border-zinc-300 border-b-2 `}
                                                            >
                                                                <div className="px-2 py-4">
                                                                    <Icon
                                                                        name="account"
                                                                        height={32}
                                                                        width={32}
                                                                    />
                                                                </div>
                                                            </td>
                                                            <td
                                                                className={`border-zinc-300 border-b-2 w-full`}
                                                            >
                                                                <div className="flex flex-row items-center">
                                                                    <Typography>
                                                                        {ma.firstName} {ma.lastName}
                                                                    </Typography>
                                                                </div>
                                                                <Typography
                                                                    sm
                                                                    className="text-zinc-500"
                                                                >
                                                                    {ma.email}
                                                                </Typography>
                                                            </td>

                                                            <td
                                                                className={`border-zinc-300 border-b-2 border-r-2 `}
                                                            >
                                                                <div className="px-2 py-1">
                                                                    <Typography>{"-"}</Typography>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                                {company.accounts.map((ca, i) => {
                                                    return (
                                                        <tr key={ca.email}>
                                                            <td
                                                                className={`border-l-2 border-zinc-300 border-b-2 ${
                                                                    i ===
                                                                        company.accounts.length -
                                                                            1 && "rounded-bl-md"
                                                                }`}
                                                            >
                                                                <div className="px-2 py-4">
                                                                    <Icon
                                                                        name="account"
                                                                        height={32}
                                                                        width={32}
                                                                    />
                                                                </div>
                                                            </td>
                                                            <td
                                                                className={`border-zinc-300 border-b-2 w-full`}
                                                            >
                                                                <div className="flex flex-row items-center">
                                                                    <Typography>
                                                                        {ca.firstName}
                                                                    </Typography>
                                                                    {ca.lastName && (
                                                                        <Typography>
                                                                            &nbsp;
                                                                        </Typography>
                                                                    )}
                                                                    <Typography>
                                                                        {ca.lastName}
                                                                    </Typography>
                                                                    <div className="ml-1">
                                                                        <Icon
                                                                            name="checkmark"
                                                                            height={15}
                                                                            width={15}
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <Typography
                                                                    sm
                                                                    className="text-zinc-500"
                                                                >
                                                                    {ca.email}
                                                                </Typography>
                                                            </td>
                                                            {/* <td
                                                                className={`border-zinc-300 border-b-2`}
                                                            ></td> */}
                                                            <td
                                                                className={`border-zinc-300 border-b-2 border-r-2 ${
                                                                    i ===
                                                                        company.accounts.length -
                                                                            1 && "rounded-br-md"
                                                                }`}
                                                            >
                                                                <div className="px-2 py-1">
                                                                    <Typography>
                                                                        {ca.username || "-"}
                                                                    </Typography>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center">
                                <div>
                                    <Typography>{t("not-found")}</Typography>
                                </div>
                                <Link to="/account/company/create" className="font-semibold">
                                    <Typography>{t("click-here")}</Typography>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </>
    );
}
