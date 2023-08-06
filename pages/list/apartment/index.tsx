import Button from "@/components/Button";
import Input from "@/components/Input";
import Map from "@/components/Map";
import Navbar from "@/components/Navbar";
import Typography from "@/components/Typography";
import {
    Company,
    ListingFor,
    createListing,
    getMyCompany,
    patchPropertyMedia,
    uploadMedia,
} from "@/util/api";
import { GetServerSideProps } from "next";
import { useTranslations } from "next-intl";
import React, { useRef, useState } from "react";
import ImageUpload from "@/components/ImageUpload";
import Select from "react-select";
import cookie from "cookie";
import Icon from "@/components/Icon";
import Link from "@/components/Link";
import { useRouter } from "next/router";
import Head from "next/head";
import { space_grotesk } from "@/util/fonts";

export const getServerSideProps: GetServerSideProps = async ({ locale, req }) => {
    const cookies = req.headers.cookie;
    if (!cookies) {
        return {
            props: {
                messages: (await import(`../../../locales/${locale || "hr"}.json`)).default,
                company: null,
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
        console.error("Error when fetching company while creating apartment listing");
    }

    return {
        props: {
            messages: (await import(`../../../locales/${locale || "hr"}.json`)).default,
            company,
        },
    };
};

interface FlexRowProps {
    children?: React.ReactNode;
    singleCol?: boolean;
    hideBottomBorder?: boolean;
    noPadding?: boolean;
    className?: string;
}
function FlexRow({ children, singleCol, hideBottomBorder, noPadding, className }: FlexRowProps) {
    return (
        <div
            className={`flex flex-col ${singleCol ? "flex-col" : "md:flex-row"} w-full ${
                !hideBottomBorder && "border-b-zinc-200 border-b-2"
            } mb-8 py-6 ${!noPadding && "px-2"} ${className}`}
        >
            {children}
        </div>
    );
}
function RowItem({ children }: FlexRowProps) {
    return <div className="w-full md:w-1/2 flex flex-col mt-3 md:mt-0">{children}</div>;
}

interface TitleColProps {
    title: string;
    children?: React.ReactNode;
}
function TitleCol({ title, children }: TitleColProps) {
    return (
        <div className="w-full md:w-1/2">
            <Typography bold>{title}</Typography>
            <Typography className="text-zinc-500">{children}</Typography>
        </div>
    );
}

interface ListApartmentProps {
    company: Company | null;
}
export default function ListApartment({ company }: ListApartmentProps) {
    const t = useTranslations("ListApartment");

    const router = useRouter();

    const imageUploadRef = useRef<HTMLInputElement>(null);
    const [isSubmittingAd, setIsSubmittingAd] = useState(false);
    const [isForSale, setIsForSale] = useState(false);
    const [saleListingTitle, setSaleListingTitle] = useState("");
    const [saleListingPrice, setSaleListingPrice] = useState<number>();
    const [saleListingDescription, setSaleListingDescription] = useState<string>("");
    const [saleManualAccountContacts, setSaleManualAccountContacts] = useState<string[]>([]);
    const [saleContacts, setSaleContacts] = useState<string[]>([]);
    const [isForShortTermRent, setIsForShortTermRent] = useState(false);
    const [shortTermListingTitle, setShortTermListingTitle] = useState("");
    const [shortTermListingPrice, setShortTermListingPrice] = useState<number>();
    const [shortTermListingDescription, setShortTermListingDescription] = useState<string>("");
    const [shortTermContacts, setShortTermContacts] = useState<string[]>([]);
    const [shortTermManualAccountContacts, setShortTermManualAccountContacts] = useState<string[]>(
        []
    );
    const [isForLongTermRent, setIsForLongTermRent] = useState(false);
    const [longTermListingTitle, setLongTermListingTitle] = useState("");
    const [longTermListingPrice, setLongTermListingPrice] = useState<number>();
    const [longTermListingDescription, setLongTermListingDescription] = useState<string>("");
    const [longTermContacts, setLongTermContacts] = useState<string[]>([]);
    const [longTermManualAccountContacts, setLongTermManualAccountContacts] = useState<string[]>(
        []
    );
    const [location, setLocation] = useState({
        lat: 0,
        lon: 0,
    });
    const [area, setArea] = useState(0);
    const [images, setImages] = useState<File[]>([]);
    const [bedroomCount, setBedroomCount] = useState<number | null>();
    const [bathroomCount, setBathroomCount] = useState<number | null>();
    const [parkingSpaceCount, setParkingSpaceCount] = useState<number | null>();

    const allCompanyAccounts = company
        ? [
              {
                  label: t("company-account"),
                  manual: false,
                  options: company.accounts.map((ac) => {
                      return {
                          id: ac.id,
                          email: ac.email,
                          firstName: ac.firstName,
                          lastName: ac.lastName,
                          username: ac.username,
                          manual: false,
                          value: ac.id,
                          label: `${ac.firstName}${ac.firstName && " "}${ac.lastName}`,
                      };
                  }),
              },
              {
                  label: t("manual-account"),
                  manual: true,
                  options: company.manualAccounts.map((mac) => {
                      return {
                          id: mac.id,
                          email: mac.email,
                          firstName: mac.firstName,
                          lastName: mac.lastName,
                          username: null,
                          manual: true,
                          value: mac.id,
                          label: `${mac.firstName}${mac.firstName && " "}${mac.lastName}`,
                      };
                  }),
              },
          ]
        : [];

    async function submitAd() {
        try {
            // First create the apartment, then PATCH or PUT the images,
            // othwerise we might be uploading images for nothing when user enters some invalid apartment info
            setIsSubmittingAd(true);
            let listingData = {};

            if (isForSale) {
                listingData = {
                    ...listingData,
                    saleListingPrice,
                    saleListingTitle,
                    saleListingDescription,
                    saleContacts,
                    saleManualAccountContacts,
                };
            }
            if (isForShortTermRent) {
                listingData = {
                    ...listingData,
                    shortTermListingPrice,
                    shortTermListingTitle,
                    shortTermListingDescription,
                    shortTermContacts,
                    shortTermManualAccountContacts,
                };
            }
            if (isForLongTermRent) {
                listingData = {
                    ...listingData,
                    longTermListingPrice,
                    longTermListingTitle,
                    longTermListingDescription,
                    longTermContacts,
                    longTermManualAccountContacts,
                };
            }
            const resp = await createListing({
                area,
                lat: location.lat,
                lon: location.lon,
                listingFor: ListingFor.apartment,
                isForLongTermRent,
                isForShortTermRent,
                isForSale,
                bathroomCount,
                bedroomCount,
                parkingSpaceCount,
                ...listingData,
            });

            if (images.length > 0) {
                const imageUrls = await uploadMedia(images);
                await patchPropertyMedia({
                    ...resp.data,
                    media: imageUrls,
                });
            }
            await router.push({
                pathname: "/settings/properties",
                query: {
                    listingCreated: true,
                },
            });
        } catch (e) {
        } finally {
            setIsSubmittingAd(false);
        }
    }

    return (
        <>
            <Head>
                <title>Imovinko - Stan</title>
            </Head>
            <header>
                <Navbar hideSearchBar />
            </header>
            <main className="container mx-auto flex-1 flex flex-col">
                <Typography variant="h1">{t("title")}</Typography>
                <div className="flex-1 mt-8 flex justify-center">
                    <div className="w-full md:max-w-4xl">
                        <FlexRow singleCol>
                            <input
                                ref={imageUploadRef}
                                type="file"
                                name="images"
                                id="images"
                                multiple
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    let newImages: File[] = [];
                                    if (e.target.files) {
                                        for (
                                            let index = 0;
                                            index < e.target.files.length;
                                            index++
                                        ) {
                                            newImages.push(e.target.files[index]);
                                        }
                                    }

                                    if (newImages.length) {
                                        setImages([...images, ...newImages]);
                                    }
                                }}
                            />
                            <TitleCol title={t("images")}>{t("images-desc")}</TitleCol>
                            <ImageUpload images={images} inputRef={imageUploadRef} />
                        </FlexRow>

                        <FlexRow>
                            <TitleCol title={t("offering-type")}>
                                {t("offering-type-desc")}
                            </TitleCol>
                            <RowItem>
                                <div className="space-y-2">
                                    <Input
                                        name={t("for-sale")}
                                        type="checkbox"
                                        checked={isForSale}
                                        onCheckedChange={setIsForSale}
                                    />
                                    <Input
                                        name={t("short-term-rent")}
                                        type="checkbox"
                                        checked={isForShortTermRent}
                                        onCheckedChange={setIsForShortTermRent}
                                    />
                                    <Input
                                        name={t("long-term-rent")}
                                        type="checkbox"
                                        checked={isForLongTermRent}
                                        onCheckedChange={setIsForLongTermRent}
                                    />
                                </div>
                            </RowItem>
                        </FlexRow>

                        {/* SALE SECTION START */}
                        <FlexRow
                            singleCol
                            className={`${
                                isForSale ? "opacity-100" : "!mb-0 !p-0 h-0 opacity-0 invisible"
                            } transition-all`}
                        >
                            <Typography variant="h2">{t("sale-information")}</Typography>
                            <FlexRow hideBottomBorder>
                                <TitleCol title={t("ad-title")}>{t("ad-title-desc")}</TitleCol>
                                <RowItem>
                                    <Input
                                        value={saleListingTitle}
                                        onChange={setSaleListingTitle}
                                        placeholder={t("ad-title-placeholder")}
                                    />
                                </RowItem>
                            </FlexRow>
                            <FlexRow hideBottomBorder>
                                <TitleCol title={t("description")}>
                                    {t("sale-description-description")}
                                </TitleCol>
                                <RowItem>
                                    <Input
                                        value={saleListingDescription}
                                        onChange={(val) => {
                                            setSaleListingDescription(val);
                                        }}
                                        type="textarea"
                                    />
                                </RowItem>
                            </FlexRow>
                            <FlexRow hideBottomBorder>
                                <TitleCol title={t("sale-price")}>
                                    {t("sale-price-description")}
                                </TitleCol>
                                <RowItem>
                                    <Input
                                        value={saleListingPrice + ""}
                                        onChange={(val) => {
                                            setSaleListingPrice(parseFloat(val));
                                        }}
                                        type="number"
                                        placeholder={"150000"}
                                    />
                                </RowItem>
                            </FlexRow>
                            {company && (
                                <FlexRow hideBottomBorder>
                                    <TitleCol title={t("contact")}>
                                        {t("contact-description")}
                                    </TitleCol>

                                    <RowItem>
                                        <Select
                                            isMulti
                                            className={`z-30 ${space_grotesk.className}`}
                                            isSearchable
                                            closeMenuOnSelect={false}
                                            noOptionsMessage={() => {
                                                return (
                                                    <div className="w-full flex items-center justify-center">
                                                        <div className="flex flex-row py-2">
                                                            <Typography className="text-zinc-400">
                                                                {t("no-options")}
                                                            </Typography>
                                                            <Typography>&nbsp;</Typography>
                                                            <Typography className="text-zinc-400">
                                                                <Link
                                                                    to="/settings/company"
                                                                    underlineClassName="bg-zinc-400"
                                                                >
                                                                    {t("add-new-here")}
                                                                </Link>
                                                            </Typography>
                                                        </div>
                                                    </div>
                                                );
                                            }}
                                            options={allCompanyAccounts}
                                            hideSelectedOptions={false}
                                            onChange={(val) => {
                                                const contacts = val.filter((c) => !c.manual);
                                                const manualContacts = val.filter((c) => c.manual);

                                                // @ts-ignore - something is messed up with the types here
                                                setSaleContacts(contacts.map((c) => c.id));
                                                setSaleManualAccountContacts(
                                                    // @ts-ignore
                                                    manualContacts.map((c) => c.id)
                                                );
                                            }}
                                            classNames={{
                                                menu() {
                                                    return "!rounded-lg !bg-zinc-50";
                                                },
                                                control() {
                                                    return "!rounded-lg !bg-zinc-50 !py-2 !px-1 !border-none !shadow-sm";
                                                },
                                            }}
                                            placeholder={
                                                <Typography className="text-zinc-400 !font-normal">
                                                    {t("choose-contact")}
                                                </Typography>
                                            }
                                            components={{
                                                MultiValue: ({
                                                    components,
                                                    data,
                                                    ...innerProps
                                                }) => {
                                                    return (
                                                        <components.Label
                                                            {...innerProps}
                                                            data={data}
                                                        >
                                                            <div className="flex flex-row border border-zinc-300 rounded-md px-1 py-1 ml-1 my-0.5">
                                                                <Icon name="account" />
                                                                <Typography className="ml-1">
                                                                    {/* @ts-ignore */}
                                                                    {`${data.firstName}${
                                                                        // @ts-ignore
                                                                        data.firstName && " "
                                                                        // @ts-ignore
                                                                    }${data.lastName}`}
                                                                </Typography>
                                                            </div>
                                                        </components.Label>
                                                    );
                                                },
                                                Option: ({
                                                    innerProps,
                                                    isDisabled,
                                                    children,
                                                    data,
                                                    isSelected,
                                                }) => {
                                                    return !isDisabled ? (
                                                        <div {...innerProps}>
                                                            <div className="flex flex-row items-center pl-2 pr-2 py-2 hover:bg-zinc-300 cursor-pointer">
                                                                <Icon
                                                                    name="account"
                                                                    height={32}
                                                                    width={32}
                                                                />
                                                                <Typography className="ml-2 flex-1">
                                                                    {children} {/* @ts-ignore */}
                                                                    {data.email &&
                                                                        // @ts-ignore
                                                                        `(${data.email})`}
                                                                </Typography>
                                                                <div
                                                                    className={`w-4 h-4 rounded-sm border border-zinc-400 ${
                                                                        isSelected
                                                                            ? "bg-indigo-600"
                                                                            : "bg-transparent"
                                                                    } transition-all`}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    ) : null;
                                                },
                                            }}
                                        />
                                    </RowItem>
                                </FlexRow>
                            )}
                        </FlexRow>

                        {/* SALE SECTION END */}

                        {/* SHORT TERM RENT SECTION START */}
                        <FlexRow
                            singleCol
                            className={`${
                                isForShortTermRent
                                    ? "opacity-100"
                                    : "!mb-0 !p-0 h-0 opacity-0 invisible"
                            } transition-all`}
                        >
                            <Typography variant="h2">{t("short-term-rent-information")}</Typography>
                            <FlexRow hideBottomBorder>
                                <TitleCol title={t("ad-title")}>{t("ad-title-desc")}</TitleCol>
                                <RowItem>
                                    <Input
                                        value={shortTermListingTitle}
                                        onChange={setShortTermListingTitle}
                                        placeholder={t("ad-title-placeholder")}
                                    />
                                </RowItem>
                            </FlexRow>
                            <FlexRow hideBottomBorder>
                                <TitleCol title={t("description")}>
                                    {t("short-term-rent-description")}
                                </TitleCol>
                                <RowItem>
                                    <Input
                                        value={shortTermListingDescription}
                                        onChange={(val) => {
                                            setShortTermListingDescription(val);
                                        }}
                                        type="textarea"
                                    />
                                </RowItem>
                            </FlexRow>
                            <FlexRow hideBottomBorder>
                                <TitleCol title={t("sale-price")}>
                                    {t("short-term-price-description")}
                                </TitleCol>
                                <RowItem>
                                    <Input
                                        value={shortTermListingPrice + ""}
                                        onChange={(val) => {
                                            setShortTermListingPrice(parseFloat(val));
                                        }}
                                        placeholder={"120"}
                                        type="number"
                                    />
                                </RowItem>
                            </FlexRow>
                            {company && (
                                <FlexRow hideBottomBorder>
                                    <TitleCol title={t("contact")}>
                                        {t("contact-description")}
                                    </TitleCol>

                                    <RowItem>
                                        <Select
                                            className={`z-30 ${space_grotesk.className}`}
                                            isMulti
                                            isSearchable
                                            closeMenuOnSelect={false}
                                            noOptionsMessage={() => {
                                                return (
                                                    <div className="w-full flex items-center justify-center">
                                                        <div className="flex flex-row py-2">
                                                            <Typography className="text-zinc-400">
                                                                {t("no-options")}
                                                            </Typography>
                                                            <Typography>&nbsp;</Typography>
                                                            <Typography className="text-zinc-400">
                                                                <Link
                                                                    to="/settings/company"
                                                                    underlineClassName="bg-zinc-400"
                                                                >
                                                                    {t("add-new-here")}
                                                                </Link>
                                                            </Typography>
                                                        </div>
                                                    </div>
                                                );
                                            }}
                                            options={allCompanyAccounts}
                                            hideSelectedOptions={false}
                                            onChange={(val) => {
                                                const contacts = val.filter((c) => !c.manual);
                                                const manualContacts = val.filter((c) => c.manual);

                                                // @ts-ignore
                                                setShortTermContacts(contacts.map((c) => c.id));
                                                setShortTermManualAccountContacts(
                                                    // @ts-ignore
                                                    manualContacts.map((c) => c.id)
                                                );
                                            }}
                                            classNames={{
                                                menu() {
                                                    return "!rounded-lg !bg-zinc-50";
                                                },
                                                control() {
                                                    return "!rounded-lg !bg-zinc-50 !py-2 !px-1 !border-none !shadow-sm";
                                                },
                                            }}
                                            placeholder={
                                                <Typography className="text-zinc-400 !font-normal">
                                                    {t("choose-contact")}
                                                </Typography>
                                            }
                                            components={{
                                                MultiValue: ({
                                                    components,
                                                    data,
                                                    ...innerProps
                                                }) => {
                                                    return (
                                                        <components.Label
                                                            {...innerProps}
                                                            data={data}
                                                        >
                                                            <div className="flex flex-row border border-zinc-300 rounded-md px-1 py-1 ml-1 my-0.5">
                                                                <Icon name="account" />
                                                                <Typography className="ml-1">
                                                                    {/* @ts-ignore */}
                                                                    {`${data.firstName}${
                                                                        // @ts-ignore
                                                                        data.firstName && " "
                                                                        // @ts-ignore
                                                                    }${data.lastName}`}
                                                                </Typography>
                                                            </div>
                                                        </components.Label>
                                                    );
                                                },
                                                Option: ({
                                                    innerProps,
                                                    isDisabled,
                                                    children,
                                                    data,
                                                    isSelected,
                                                }) => {
                                                    return !isDisabled ? (
                                                        <div {...innerProps}>
                                                            <div className="flex flex-row items-center pl-2 pr-2 py-2 hover:bg-zinc-300 transition-all cursor-pointer">
                                                                <Icon
                                                                    name="account"
                                                                    height={32}
                                                                    width={32}
                                                                />
                                                                <Typography className="ml-2 flex-1">
                                                                    {children} {/* @ts-ignore */}
                                                                    {data.email &&
                                                                        // @ts-ignore
                                                                        `(${data.email})`}
                                                                </Typography>
                                                                <div
                                                                    className={`w-4 h-4 rounded-sm border border-zinc-400 ${
                                                                        isSelected &&
                                                                        "bg-indigo-600"
                                                                    } transition-all`}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    ) : null;
                                                },
                                            }}
                                        />
                                    </RowItem>
                                </FlexRow>
                            )}
                        </FlexRow>
                        {/* SHORT TERM RENT SECTION END */}

                        {/* LONG TERM RENT SECTION START */}
                        <FlexRow
                            singleCol
                            className={`${
                                isForLongTermRent
                                    ? "opacity-100 !mt-0"
                                    : "!mb-0 !p-0 h-0 opacity-0 invisible"
                            } transition-all`}
                        >
                            <Typography variant="h2">{t("long-term-rent-information")}</Typography>
                            <FlexRow hideBottomBorder>
                                <TitleCol title={t("ad-title")}>{t("ad-title-desc")}</TitleCol>
                                <RowItem>
                                    <Input
                                        value={longTermListingTitle}
                                        onChange={setLongTermListingTitle}
                                        placeholder={t("ad-title-placeholder")}
                                    />
                                </RowItem>
                            </FlexRow>
                            <FlexRow hideBottomBorder>
                                <TitleCol title={t("description")}>
                                    {t("long-term-rent-description")}
                                </TitleCol>
                                <RowItem>
                                    <Input
                                        value={longTermListingDescription}
                                        onChange={(val) => {
                                            setLongTermListingDescription(val);
                                        }}
                                        type="textarea"
                                    />
                                </RowItem>
                            </FlexRow>
                            <FlexRow hideBottomBorder>
                                <TitleCol title={t("sale-price")}>
                                    {t("long-term-price-description")}
                                </TitleCol>
                                <RowItem>
                                    <Input
                                        value={longTermListingPrice + ""}
                                        onChange={(val) => {
                                            setLongTermListingPrice(parseFloat(val));
                                        }}
                                        placeholder={"450"}
                                        type="number"
                                    />
                                </RowItem>
                            </FlexRow>
                            {company && (
                                <FlexRow hideBottomBorder>
                                    <TitleCol title={t("contact")}>
                                        {t("contact-description")}
                                    </TitleCol>

                                    <RowItem>
                                        <Select
                                            className={`z-30 ${space_grotesk.className}`}
                                            isMulti
                                            isSearchable
                                            closeMenuOnSelect={false}
                                            noOptionsMessage={() => {
                                                return (
                                                    <div className="w-full flex items-center justify-center">
                                                        <div className="flex flex-row py-2">
                                                            <Typography className="text-zinc-400">
                                                                {t("no-options")}
                                                            </Typography>
                                                            <Typography>&nbsp;</Typography>
                                                            <Typography className="text-zinc-400">
                                                                <Link
                                                                    to="/settings/company"
                                                                    underlineClassName="bg-zinc-400"
                                                                >
                                                                    {t("add-new-here")}
                                                                </Link>
                                                            </Typography>
                                                        </div>
                                                    </div>
                                                );
                                            }}
                                            options={allCompanyAccounts}
                                            hideSelectedOptions={false}
                                            onChange={(val) => {
                                                const contacts = val.filter((c) => !c.manual);
                                                const manualContacts = val.filter((c) => c.manual);

                                                // @ts-ignore
                                                setLongTermContacts(contacts.map((c) => c.id));
                                                setLongTermManualAccountContacts(
                                                    // @ts-ignore
                                                    manualContacts.map((c) => c.id)
                                                );
                                            }}
                                            classNames={{
                                                menu() {
                                                    return "!rounded-lg !bg-zinc-50";
                                                },
                                                control() {
                                                    return "!rounded-lg !bg-zinc-50 !py-2 !px-1 !border-none !shadow-sm";
                                                },
                                            }}
                                            placeholder={
                                                <Typography className="text-zinc-400 !font-normal">
                                                    {t("choose-contact")}
                                                </Typography>
                                            }
                                            components={{
                                                MultiValue: ({
                                                    components,
                                                    data,
                                                    ...innerProps
                                                }) => {
                                                    return (
                                                        <components.Label
                                                            {...innerProps}
                                                            data={data}
                                                        >
                                                            <div className="flex flex-row border border-zinc-300 rounded-md px-1 py-1 ml-1 my-0.5">
                                                                <Icon name="account" />
                                                                <Typography className="ml-1">
                                                                    {/* @ts-ignore */}
                                                                    {`${data.firstName}${
                                                                        // @ts-ignore
                                                                        data.firstName && " "
                                                                        // @ts-ignore
                                                                    }${data.lastName}`}
                                                                </Typography>
                                                            </div>
                                                        </components.Label>
                                                    );
                                                },
                                                Option: ({
                                                    innerProps,
                                                    isDisabled,
                                                    children,
                                                    data,
                                                    isSelected,
                                                }) => {
                                                    return !isDisabled ? (
                                                        <div {...innerProps}>
                                                            <div className="flex flex-row items-center pl-2 pr-2 py-2 hover:bg-zinc-300 transition-all cursor-pointer">
                                                                <Icon
                                                                    name="account"
                                                                    height={32}
                                                                    width={32}
                                                                />
                                                                <Typography className="ml-2 flex-1">
                                                                    {children} {/* @ts-ignore */}
                                                                    {data.email &&
                                                                        // @ts-ignore
                                                                        `(${data.email})`}
                                                                </Typography>
                                                                <div
                                                                    className={`w-4 h-4 rounded-sm border border-zinc-400 ${
                                                                        isSelected &&
                                                                        "bg-indigo-600"
                                                                    } transition-all`}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    ) : null;
                                                },
                                            }}
                                        />
                                    </RowItem>
                                </FlexRow>
                            )}
                        </FlexRow>
                        {/* LONG TERM RENT SECTION END */}

                        <FlexRow>
                            <TitleCol title={t("bedroom-count")}>
                                {t("bedroom-count-description")}
                            </TitleCol>
                            <RowItem>
                                <Input
                                    value={bedroomCount || ""}
                                    onChange={(val) => {
                                        setBedroomCount(parseInt(val));
                                    }}
                                    type="number"
                                />
                            </RowItem>
                        </FlexRow>

                        <FlexRow>
                            <TitleCol title={t("bathroom-count")}>
                                {t("bathroom-count-description")}
                            </TitleCol>
                            <RowItem>
                                <Input
                                    value={bathroomCount || ""}
                                    onChange={(val) => {
                                        setBathroomCount(parseInt(val));
                                    }}
                                    type="number"
                                />
                            </RowItem>
                        </FlexRow>

                        <FlexRow>
                            <TitleCol title={t("parking-count")}>
                                {t("parking-count-description")}
                            </TitleCol>
                            <RowItem>
                                <Input
                                    value={parkingSpaceCount || ""}
                                    onChange={(val) => {
                                        setParkingSpaceCount(parseInt(val));
                                    }}
                                    type="number"
                                />
                            </RowItem>
                        </FlexRow>

                        <FlexRow singleCol noPadding>
                            <div className="px-2">
                                <TitleCol title={t("location")}>{t("location-desc")}</TitleCol>
                            </div>
                            <Map
                                showSearchBox
                                showCenterMarker
                                className="w-full shadow-sm mt-2 sm:rounded-lg sm:shadow-md"
                                style={{
                                    height: "50vh",
                                }}
                                onCenterChange={setLocation}
                            />
                        </FlexRow>

                        <FlexRow>
                            <TitleCol title={t("area")}>{t("area-desc")}</TitleCol>
                            <RowItem>
                                <Input
                                    type="number"
                                    placeholder={"160"}
                                    value={area + ""}
                                    onChange={(val) => {
                                        setArea(parseInt(val));
                                    }}
                                />
                            </RowItem>
                        </FlexRow>

                        <FlexRow singleCol hideBottomBorder>
                            <Button.Primary
                                label={t("submit")}
                                onClick={submitAd}
                                loading={isSubmittingAd}
                            />
                        </FlexRow>
                    </div>
                </div>
            </main>
        </>
    );
}
