import Button from "@/components/Button";
import Input from "@/components/Input";
import Map from "@/components/Map";
import Typography from "@/components/Typography";
import {
    BasicApartment,
    BasicHouse,
    BasicLand,
    Company,
    CreateListingData,
    EnergyClass,
    FurnitureState,
    OfferingType,
    PropertyType,
    createListing,
    patchPropertyMedia,
    uploadMedia,
} from "@/util/api";
import { useTranslations } from "next-intl";
import React, { useRef, useState, useId, useEffect } from "react";
import ImageUpload from "@/components/ImageUpload";
import Select from "react-select";
import Icon from "@/components/Icon";
import Link from "@/components/Link";
import { useRouter } from "next/router";
import { space_grotesk } from "@/util/fonts";
import Image from "next/image";
import useFieldErrorCodes from "@/hooks/useFieldErrorCodes";
import PropertyDropdown from "@/components/PropertyDropdown";
import { FlexRow, RowItem, TitleCol, energyLabels } from "./InputListingComponents";

interface CreateListingProps {
    company: Company | null;
    type: PropertyType;
}
export default function CreateListing({ company, type }: CreateListingProps) {
    const t = useTranslations("CreateListing");

    const router = useRouter();

    const imageUploadRef = useRef<HTMLInputElement>(null);
    const [isSubmittingAd, setIsSubmittingAd] = useState(false);
    const [isForSale, setIsForSale] = useState(type === PropertyType.land);
    const [saleListingTitle, setSaleListingTitle] = useState("");
    const [saleListingPrice, setSaleListingPrice] = useState<string>("");
    const [saleListingDescription, setSaleListingDescription] = useState<string>("");
    const [saleManualAccountContacts, setSaleManualAccountContacts] = useState<string[]>([]);
    const [saleContacts, setSaleContacts] = useState<string[]>([]);
    const [saleCommissionsPercent, setSaleCommissionsPercent] = useState<string | number>();
    const [isForShortTermRent, setIsForShortTermRent] = useState(false);
    const [shortTermListingTitle, setShortTermListingTitle] = useState("");
    const [shortTermListingPrice, setShortTermListingPrice] = useState<string>("");
    const [shortTermListingDescription, setShortTermListingDescription] = useState<string>("");
    const [shortTermContacts, setShortTermContacts] = useState<string[]>([]);
    const [shortTermManualAccountContacts, setShortTermManualAccountContacts] = useState<string[]>(
        []
    );
    const [isForLongTermRent, setIsForLongTermRent] = useState(false);
    const [longTermListingTitle, setLongTermListingTitle] = useState("");
    const [longTermListingPrice, setLongTermListingPrice] = useState<string>("");
    const [longTermListingDescription, setLongTermListingDescription] = useState<string>("");
    const [longTermContacts, setLongTermContacts] = useState<string[]>([]);
    const [longTermManualAccountContacts, setLongTermManualAccountContacts] = useState<string[]>(
        []
    );
    const [location, setLocation] = useState({
        lat: 0,
        lon: 0,
    });
    const [area, setArea] = useState<string>("");
    const [images, setImages] = useState<File[]>([]);
    const [bedroomCount, setBedroomCount] = useState<string | null>();
    const [bathroomCount, setBathroomCount] = useState<string | null>();
    const [parkingSpaceCount, setParkingSpaceCount] = useState<string | null>();

    const [floor, setFloor] = useState<string | null>();
    const [totalFloors, setTotalFloors] = useState<string | null>();
    const [buildingFloors, setBuildingFloors] = useState<string | null>();
    const [buildYear, setBuildYear] = useState<string | null>();
    const [renovationYear, setRenovationYear] = useState<string | null>();
    const [customId, setCustomId] = useState<string | null>();

    const fieldErrorCodesParser = useFieldErrorCodes();
    const [loadingBar, setLoadingBar] = useState<{
        percent: number;
        message: string;
        isError?: boolean;
    }>();
    const [energyLabel, setEnergyLabel] = useState<EnergyClass | null>(null);
    const [isForExistingProperty, setIsForExistingProperty] = useState(false);
    const [existingPropertySelected, setExistingPropertySelected] = useState<
        BasicApartment | BasicHouse | BasicLand
    >();
    const [furnitureState, setFurnitureState] = useState<FurnitureState | null>(null);
    const [needsRenovation, setNeedsRenovation] = useState(false);
    const [elevatorAccess, setElevatorAccess] = useState(false);

    const id1 = useId();
    const id2 = useId();
    const id3 = useId();
    const id4 = useId();
    const id5 = useId();

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
                          avatarUrl: ac.avatarUrl,
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
                          avatarUrl: mac.avatarUrl,
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
            setLoadingBar({
                message: t("creating-listing"),
                percent: 10,
            });
            fieldErrorCodesParser.empty();
            let listingData: CreateListingData = {};

            if (isForSale) {
                listingData = {
                    ...listingData,
                    sale: {
                        price: saleListingPrice,
                        title: saleListingTitle,
                        description: saleListingDescription,
                        contactIds: saleContacts,
                        manualAccountContactIds: saleManualAccountContacts,
                        saleCommissionPercent: saleCommissionsPercent,
                    },
                };
            }
            if (isForShortTermRent) {
                listingData = {
                    ...listingData,
                    shortTermRent: {
                        price: shortTermListingPrice,
                        title: shortTermListingTitle,
                        description: shortTermListingDescription,
                        contactIds: shortTermContacts,
                        manualAccountContactIds: shortTermManualAccountContacts,
                    },
                };
            }
            if (isForLongTermRent) {
                listingData = {
                    ...listingData,
                    longTermRent: {
                        price: longTermListingPrice,
                        title: longTermListingTitle,
                        description: longTermListingDescription,
                        contactIds: longTermContacts,
                        manualAccountContactIds: longTermManualAccountContacts,
                    },
                };
            }
            if (isForExistingProperty && existingPropertySelected) {
                listingData = {
                    ...listingData,
                    existingProperty: {
                        id: existingPropertySelected.id,
                        propertyType: type,
                    },
                };
            }
            if (type === PropertyType.apartment) {
                listingData = {
                    ...listingData,
                    apartment: {
                        surfaceArea: area,
                        latitude: location.lat,
                        longitude: location.lon,
                        bathroomCount,
                        bedroomCount,
                        parkingSpaceCount,
                        floor,
                        totalFloors,
                        buildingFloors,
                        buildYear,
                        renovationYear,
                        energyLabel,
                        customId,
                        furnitureState,
                        elevatorAccess,
                        needsRenovation,
                    },
                };
            } else if (type === PropertyType.house) {
                listingData = {
                    ...listingData,
                    house: {
                        surfaceArea: area,
                        latitude: location.lat,
                        longitude: location.lon,
                        bathroomCount,
                        bedroomCount,
                        parkingSpaceCount,
                        totalFloors,
                        buildYear,
                        renovationYear,
                        energyLabel,
                        customId,
                        furnitureState,
                        needsRenovation,
                    },
                };
            } else {
                listingData = {
                    ...listingData,
                    land: {
                        surfaceArea: area,
                        latitude: location.lat,
                        longitude: location.lon,
                        customId,
                    },
                };
            }
            console.log(listingData);

            const resp = await createListing(listingData);

            if (images.length > 0 && !isForExistingProperty) {
                setLoadingBar({
                    message: t("uploading-media"),
                    percent: 45,
                });

                const imageUrls = await uploadMedia(images);
                setLoadingBar({
                    message: t("updating-media"),
                    percent: 90,
                });
                await patchPropertyMedia({
                    ...resp.data,
                    media: imageUrls.map((url) => {
                        return { url };
                    }),
                });
            }
            setLoadingBar({
                message: t("listing-created"),
                percent: 100,
            });
            setTimeout(async () => {
                await router.push({
                    pathname: "/settings/listings",
                    query: {
                        listingCreated: true,
                    },
                });
            }, 250);
        } catch (e: any) {
            if (e.response?.status === 400 && Array.isArray(e.response?.data)) {
                fieldErrorCodesParser.parseErrorCodes(e.response.data);
            } else if (typeof e.response?.data === "string") {
                fieldErrorCodesParser.parseErrorMessage(e.response.data);
            } else {
                console.error(e);
            }
            setLoadingBar({
                message: t("error"),
                percent: 100,
                isError: true,
            });
            setIsSubmittingAd(false);
            const mainSection = document.querySelector("#main");
            if (mainSection) {
                mainSection.scrollIntoView({
                    behavior: "smooth",
                });
            }
        }
    }

    function getEnergyBg(e: EnergyClass) {
        switch (e) {
            case EnergyClass.Ap:
                return "bg-[#00a652] hover:opacity-90";
            case EnergyClass.A:
                return "bg-[#51b747] hover:opacity-90";
            case EnergyClass.B:
                return "bg-[#bdd62e] hover:opacity-90";
            case EnergyClass.C:
                return "bg-[#fef200] hover:opacity-90";
            case EnergyClass.D:
                return "bg-[#fdb814] hover:opacity-90";
            case EnergyClass.E:
                return "bg-[#f3701e] hover:opacity-90";
            case EnergyClass.F:
                return "bg-[#ed1b24] hover:opacity-90";
            case EnergyClass.G:
                return "bg-[#B91C1C] hover:opacity-90";
        }
    }

    useEffect(() => {
        if (!isForExistingProperty) {
            return;
        }
        if (isForSale && existingPropertySelected?.offeringTypes.includes(OfferingType.sale)) {
            setIsForSale(false);
        }
        if (
            isForShortTermRent &&
            existingPropertySelected?.offeringTypes.includes(OfferingType.shortTermRent)
        ) {
            setIsForShortTermRent(false);
        }
        if (
            isForLongTermRent &&
            existingPropertySelected?.offeringTypes.includes(OfferingType.longTermRent)
        ) {
            setIsForLongTermRent(false);
        }
    }, [existingPropertySelected, isForExistingProperty]);

    useEffect(() => {
        // Land may only be sold
        if (type === PropertyType.land && !isForSale) {
            setIsForSale(true);
        }
    }, [type, isForSale]);

    return (
        <div className="w-full" id="main">
            <Typography variant="h1">{t(`title-${type}`)}</Typography>
            <div className="flex-1 mt-8 flex justify-center">
                <div className="w-full md:max-w-4xl">
                    <FlexRow type={type} singleCol>
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
                                    for (let index = 0; index < e.target.files.length; index++) {
                                        newImages.push(e.target.files[index]);
                                    }
                                }

                                if (newImages.length) {
                                    setImages([...images, ...newImages]);
                                }
                            }}
                        />
                        <TitleCol title={t(`images-${type}`)}>{t("images-desc")}</TitleCol>
                        <ImageUpload
                            disabled={isForExistingProperty}
                            images={images}
                            inputRef={imageUploadRef}
                        />
                    </FlexRow>

                    <FlexRow type={type} blacklistTypes={[PropertyType.land]}>
                        <TitleCol
                            hasError={fieldErrorCodesParser.has("sale.shortTermRent.longTermRent")}
                            errorMsg={fieldErrorCodesParser.getTranslated(
                                "sale.shortTermRent.longTermRent"
                            )}
                            title={t("offering-type")}
                        >
                            {t("offering-type-desc")}
                        </TitleCol>
                        <RowItem>
                            <div className="space-y-2">
                                <Input
                                    name={t("for-sale")}
                                    type="checkbox"
                                    checked={isForSale}
                                    onCheckedChange={setIsForSale}
                                    disabled={
                                        isForExistingProperty &&
                                        existingPropertySelected?.offeringTypes.includes(
                                            OfferingType.sale
                                        )
                                    }
                                />
                                <Input
                                    name={t("short-term-rent")}
                                    type="checkbox"
                                    checked={isForShortTermRent}
                                    onCheckedChange={setIsForShortTermRent}
                                    disabled={
                                        isForExistingProperty &&
                                        existingPropertySelected?.offeringTypes.includes(
                                            OfferingType.shortTermRent
                                        )
                                    }
                                />
                                <Input
                                    name={t("long-term-rent")}
                                    type="checkbox"
                                    checked={isForLongTermRent}
                                    onCheckedChange={setIsForLongTermRent}
                                    disabled={
                                        isForExistingProperty &&
                                        existingPropertySelected?.offeringTypes.includes(
                                            OfferingType.longTermRent
                                        )
                                    }
                                />
                            </div>
                        </RowItem>
                    </FlexRow>

                    <FlexRow type={type} blacklistTypes={[PropertyType.land]}>
                        <TitleCol title={t("existing-title")}>{t("existing-description")}</TitleCol>
                        <RowItem>
                            <div className="space-y-2 min-h-[134px]">
                                <Input
                                    name={t("existing-title")}
                                    type="checkbox"
                                    checked={isForExistingProperty}
                                    onCheckedChange={setIsForExistingProperty}
                                />
                                <div
                                    className={`${
                                        !isForExistingProperty && "hidden"
                                    } transition-all`}
                                >
                                    <PropertyDropdown
                                        onPropertyChange={(newProperty) => {
                                            setExistingPropertySelected(newProperty);
                                        }}
                                        selectedProperty={existingPropertySelected}
                                        type={type}
                                    />
                                </div>
                            </div>
                        </RowItem>
                    </FlexRow>

                    {/* SALE SECTION START */}
                    <FlexRow
                        type={type}
                        singleCol
                        className={`${
                            isForSale ? "opacity-100" : "!mb-0 !p-0 h-0 opacity-0 invisible "
                        } transition-all`}
                    >
                        <Typography variant="h2">{t("sale-information")}</Typography>
                        <FlexRow type={type} hideBottomBorder>
                            <TitleCol title={t("ad-title")}>{t("ad-title-desc")}</TitleCol>
                            <RowItem>
                                <Input
                                    value={saleListingTitle}
                                    onChange={setSaleListingTitle}
                                    placeholder={t("ad-title-placeholder")}
                                    hasError={fieldErrorCodesParser.has("sale.title")}
                                    errorMsg={fieldErrorCodesParser.getTranslated("sale.title")}
                                />
                            </RowItem>
                        </FlexRow>
                        <FlexRow type={type} hideBottomBorder>
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
                                    hasError={fieldErrorCodesParser.has("sale.description")}
                                    errorMsg={fieldErrorCodesParser.getTranslated(
                                        "sale.description"
                                    )}
                                />
                            </RowItem>
                        </FlexRow>
                        <FlexRow type={type} hideBottomBorder>
                            <TitleCol title={t("sale-price")}>
                                {t("sale-price-description")}
                            </TitleCol>
                            <RowItem>
                                <Input
                                    type="currency"
                                    value={saleListingPrice}
                                    onChange={setSaleListingPrice}
                                    placeholder={"150000"}
                                    hasError={fieldErrorCodesParser.has("sale.price")}
                                    errorMsg={fieldErrorCodesParser.getTranslated("sale.price")}
                                />
                            </RowItem>
                        </FlexRow>
                        <FlexRow type={type} hideBottomBorder>
                            <TitleCol title={t("commissions")}>
                                {t("commissions-description")}
                            </TitleCol>
                            <RowItem>
                                <Input
                                    suffix="%"
                                    name="saleCommissionPercent"
                                    value={saleCommissionsPercent}
                                    onChange={setSaleCommissionsPercent}
                                    placeholder={"2.2"}
                                    hasError={fieldErrorCodesParser.has(
                                        "sale.saleCommissionPercent"
                                    )}
                                    errorMsg={fieldErrorCodesParser.getTranslated(
                                        "sale.saleCommissionPercent"
                                    )}
                                />
                            </RowItem>
                        </FlexRow>
                        {company && (
                            <FlexRow type={type} hideBottomBorder>
                                <TitleCol title={t("contact")}>{t("contact-description")}</TitleCol>

                                <RowItem>
                                    <Select
                                        instanceId={id1}
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
                                            MultiValue: ({ components, data, ...innerProps }) => {
                                                return (
                                                    <components.Label {...innerProps} data={data}>
                                                        <div className="flex flex-row items-center border border-zinc-300 rounded-md px-1 py-1 ml-1 my-0.5">
                                                            {/* @ts-ignore */}
                                                            {data.avatarUrl ? (
                                                                <div className="w-6 h-6 rounded-full overflow-hidden relative">
                                                                    <Image
                                                                        // @ts-ignore
                                                                        src={data.avatarUrl}
                                                                        alt="avatar"
                                                                        fill
                                                                        className="object-cover"
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <Icon name="account" />
                                                            )}
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
                                                            {/* @ts-ignore */}
                                                            {data.avatarUrl ? (
                                                                <div className="w-8 h-8 rounded-full overflow-hidden relative">
                                                                    <Image
                                                                        // @ts-ignore
                                                                        src={data.avatarUrl}
                                                                        alt="avatar"
                                                                        fill
                                                                        className="object-cover"
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <Icon
                                                                    name="account"
                                                                    height={32}
                                                                    width={32}
                                                                />
                                                            )}
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
                        type={type}
                        singleCol
                        className={`${
                            isForShortTermRent
                                ? "opacity-100"
                                : "!mb-0 !p-0 h-0 opacity-0 invisible"
                        } transition-all`}
                    >
                        <Typography variant="h2">{t("short-term-rent-information")}</Typography>
                        <FlexRow type={type} hideBottomBorder>
                            <TitleCol title={t("ad-title")}>{t("ad-title-desc")}</TitleCol>
                            <RowItem>
                                <Input
                                    value={shortTermListingTitle}
                                    onChange={setShortTermListingTitle}
                                    placeholder={t("ad-title-placeholder")}
                                    hasError={fieldErrorCodesParser.has("shortTermRent.title")}
                                    errorMsg={fieldErrorCodesParser.getTranslated(
                                        "shortTermRent.title"
                                    )}
                                />
                            </RowItem>
                        </FlexRow>
                        <FlexRow type={type} hideBottomBorder>
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
                                    hasError={fieldErrorCodesParser.has(
                                        "shortTermRent.description"
                                    )}
                                    errorMsg={fieldErrorCodesParser.getTranslated(
                                        "shortTermRent.description"
                                    )}
                                />
                            </RowItem>
                        </FlexRow>
                        <FlexRow type={type} hideBottomBorder>
                            <TitleCol title={t("sale-price")}>
                                {t("short-term-price-description")}
                            </TitleCol>
                            <RowItem>
                                <Input
                                    type="currency"
                                    value={shortTermListingPrice}
                                    onChange={setShortTermListingPrice}
                                    placeholder={"120"}
                                    hasError={fieldErrorCodesParser.has("shortTermRent.price")}
                                    errorMsg={fieldErrorCodesParser.getTranslated(
                                        "shortTermRent.price"
                                    )}
                                />
                            </RowItem>
                        </FlexRow>
                        {company && (
                            <FlexRow type={type} hideBottomBorder>
                                <TitleCol title={t("contact")}>{t("contact-description")}</TitleCol>

                                <RowItem>
                                    <Select
                                        instanceId={id2}
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
                                            MultiValue: ({ components, data, ...innerProps }) => {
                                                return (
                                                    <components.Label {...innerProps} data={data}>
                                                        <div className="flex flex-row items-center border border-zinc-300 rounded-md px-1 py-1 ml-1 my-0.5">
                                                            {/* @ts-ignore */}
                                                            {data.avatarUrl ? (
                                                                <div className="w-6 h-6 rounded-full overflow-hidden relative">
                                                                    <Image
                                                                        // @ts-ignore
                                                                        src={data.avatarUrl}
                                                                        alt="avatar"
                                                                        fill
                                                                        className="object-cover"
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <Icon name="account" />
                                                            )}
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
                                                            {/* @ts-ignore */}
                                                            {data.avatarUrl ? (
                                                                <div className="w-8 h-8 rounded-full overflow-hidden relative">
                                                                    <Image
                                                                        // @ts-ignore
                                                                        src={data.avatarUrl}
                                                                        alt="avatar"
                                                                        fill
                                                                        className="object-cover"
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <Icon
                                                                    name="account"
                                                                    height={32}
                                                                    width={32}
                                                                />
                                                            )}
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
                    {/* SHORT TERM RENT SECTION END */}

                    {/* LONG TERM RENT SECTION START */}
                    <FlexRow
                        type={type}
                        singleCol
                        className={`${
                            isForLongTermRent
                                ? "opacity-100 !mt-0"
                                : "!mb-0 !p-0 h-0 opacity-0 invisible"
                        } transition-all`}
                    >
                        <Typography variant="h2">{t("long-term-rent-information")}</Typography>
                        <FlexRow type={type} hideBottomBorder>
                            <TitleCol title={t("ad-title")}>{t("ad-title-desc")}</TitleCol>
                            <RowItem>
                                <Input
                                    value={longTermListingTitle}
                                    onChange={setLongTermListingTitle}
                                    placeholder={t("ad-title-placeholder")}
                                    hasError={fieldErrorCodesParser.has("longTermRent.title")}
                                    errorMsg={fieldErrorCodesParser.getTranslated(
                                        "longTermRent.title"
                                    )}
                                />
                            </RowItem>
                        </FlexRow>
                        <FlexRow type={type} hideBottomBorder>
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
                                    hasError={fieldErrorCodesParser.has("longTermRent.description")}
                                    errorMsg={fieldErrorCodesParser.getTranslated(
                                        "longTermRent.description"
                                    )}
                                />
                            </RowItem>
                        </FlexRow>
                        <FlexRow type={type} hideBottomBorder>
                            <TitleCol title={t("sale-price")}>
                                {t("long-term-price-description")}
                            </TitleCol>
                            <RowItem>
                                <Input
                                    type="currency"
                                    value={longTermListingPrice}
                                    onChange={setLongTermListingPrice}
                                    placeholder={"450"}
                                    hasError={fieldErrorCodesParser.has("longTermRent.price")}
                                    errorMsg={fieldErrorCodesParser.getTranslated(
                                        "longTermRent.price"
                                    )}
                                />
                            </RowItem>
                        </FlexRow>
                        {company && (
                            <FlexRow type={type} hideBottomBorder>
                                <TitleCol title={t("contact")}>{t("contact-description")}</TitleCol>

                                <RowItem>
                                    <Select
                                        instanceId={id3}
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
                                            MultiValue: ({ components, data, ...innerProps }) => {
                                                return (
                                                    <components.Label {...innerProps} data={data}>
                                                        <div className="flex flex-row items-center border border-zinc-300 rounded-md px-1 py-1 ml-1 my-0.5">
                                                            {/* @ts-ignore */}
                                                            {data.avatarUrl ? (
                                                                <div className="w-6 h-6 rounded-full overflow-hidden relative">
                                                                    <Image
                                                                        // @ts-ignore
                                                                        src={data.avatarUrl}
                                                                        alt="avatar"
                                                                        fill
                                                                        className="object-cover"
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <Icon name="account" />
                                                            )}
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
                                                            {/* @ts-ignore */}
                                                            {data.avatarUrl ? (
                                                                <div className="w-8 h-8 rounded-full overflow-hidden relative">
                                                                    <Image
                                                                        // @ts-ignore
                                                                        src={data.avatarUrl}
                                                                        alt="avatar"
                                                                        fill
                                                                        className="object-cover"
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <Icon
                                                                    name="account"
                                                                    height={32}
                                                                    width={32}
                                                                />
                                                            )}
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
                    {/* LONG TERM RENT SECTION END */}

                    {/* PROPERTY DATA SECTION START */}
                    <div
                        className={`flex flex-col w-full ${
                            !isForExistingProperty
                                ? "opacity-100 !mt-0"
                                : "!mb-0 !p-0 opacity-0 invisible hidden"
                        } transition-all`}
                    >
                        <FlexRow type={type} blacklistTypes={[PropertyType.land]}>
                            <TitleCol title={t("bedroom-count")}>
                                {t("bedroom-count-description")}
                            </TitleCol>
                            <RowItem>
                                <Input
                                    value={bedroomCount || ""}
                                    onChange={setBedroomCount}
                                    hasError={fieldErrorCodesParser.has(`${type}.bedroomCount`)}
                                    errorMsg={fieldErrorCodesParser.getTranslated(
                                        `${type}.bedroomCount`
                                    )}
                                />
                            </RowItem>
                        </FlexRow>

                        <FlexRow type={type} blacklistTypes={[PropertyType.land]}>
                            <TitleCol title={t("bathroom-count")}>
                                {t("bathroom-count-description")}
                            </TitleCol>
                            <RowItem>
                                <Input
                                    value={bathroomCount || ""}
                                    onChange={setBathroomCount}
                                    hasError={fieldErrorCodesParser.has(`${type}.bathroomCount`)}
                                    errorMsg={fieldErrorCodesParser.getTranslated(
                                        `${type}.bathroomCount`
                                    )}
                                />
                            </RowItem>
                        </FlexRow>

                        <FlexRow type={type} blacklistTypes={[PropertyType.land]}>
                            <TitleCol title={t("parking-count")}>
                                {t("parking-count-description")}
                            </TitleCol>
                            <RowItem>
                                <Input
                                    value={parkingSpaceCount || ""}
                                    onChange={setParkingSpaceCount}
                                    hasError={fieldErrorCodesParser.has(
                                        `${type}.parkingSpaceCount`
                                    )}
                                    errorMsg={fieldErrorCodesParser.getTranslated(
                                        `${type}.parkingSpaceCount`
                                    )}
                                />
                            </RowItem>
                        </FlexRow>

                        <FlexRow
                            type={type}
                            blacklistTypes={[PropertyType.land, PropertyType.house]}
                        >
                            <TitleCol title={t("floor")}>{t("floor-description")}</TitleCol>
                            <RowItem>
                                <Input
                                    value={floor}
                                    onChange={setFloor}
                                    hasError={fieldErrorCodesParser.has(`${type}.floor`)}
                                    errorMsg={fieldErrorCodesParser.getTranslated(`${type}.floor`)}
                                />
                            </RowItem>
                        </FlexRow>

                        <FlexRow type={type} blacklistTypes={[PropertyType.land]}>
                            <TitleCol title={t("total-floor")}>
                                {t("total-floor-description")}
                            </TitleCol>
                            <RowItem>
                                <Input
                                    value={totalFloors}
                                    onChange={setTotalFloors}
                                    hasError={fieldErrorCodesParser.has(`${type}.totalFloors`)}
                                    errorMsg={fieldErrorCodesParser.getTranslated(
                                        `${type}.totalFloors`
                                    )}
                                />
                            </RowItem>
                        </FlexRow>

                        <FlexRow
                            type={type}
                            blacklistTypes={[PropertyType.land, PropertyType.house]}
                        >
                            <TitleCol title={t("building-floor")}>
                                {t("building-floor-description")}
                            </TitleCol>
                            <RowItem>
                                <Input
                                    value={buildingFloors}
                                    onChange={setBuildingFloors}
                                    hasError={fieldErrorCodesParser.has(`${type}.buildingFloors`)}
                                    errorMsg={fieldErrorCodesParser.getTranslated(
                                        `${type}.buildingFloors`
                                    )}
                                />
                                <Input
                                    className="mt-2"
                                    type="checkbox"
                                    checked={elevatorAccess}
                                    onCheckedChange={setElevatorAccess}
                                    name={t("elevator-access")}
                                />
                            </RowItem>
                        </FlexRow>

                        <FlexRow type={type} blacklistTypes={[PropertyType.land]}>
                            <TitleCol title={t("build-year")}>
                                {t("build-year-description")}
                            </TitleCol>
                            <RowItem>
                                <Input
                                    value={buildYear}
                                    onChange={setBuildYear}
                                    hasError={fieldErrorCodesParser.has(`${type}.buildYear`)}
                                    errorMsg={fieldErrorCodesParser.getTranslated(
                                        `${type}.buildYear`
                                    )}
                                />
                            </RowItem>
                        </FlexRow>

                        <FlexRow type={type} blacklistTypes={[PropertyType.land]}>
                            <TitleCol title={t("renovation-year")}>
                                {t("renovation-year-description")}
                            </TitleCol>
                            <RowItem>
                                <Input
                                    value={renovationYear}
                                    onChange={setRenovationYear}
                                    hasError={fieldErrorCodesParser.has(`${type}.renovationYear`)}
                                    errorMsg={fieldErrorCodesParser.getTranslated(
                                        `${type}.renovationYear`
                                    )}
                                />
                                <Input
                                    className="mt-2"
                                    type="checkbox"
                                    checked={needsRenovation}
                                    onCheckedChange={setNeedsRenovation}
                                    name={t("needs-renovation")}
                                />
                            </RowItem>
                        </FlexRow>

                        <FlexRow type={type} blacklistTypes={[PropertyType.land]} className="z-50">
                            <TitleCol title={t("furniture-state")}>
                                {t("furniture-state-description")}
                            </TitleCol>
                            <RowItem>
                                <Select
                                    instanceId={id5}
                                    onChange={(newVal) => {
                                        setFurnitureState(newVal ? newVal.value : null);
                                    }}
                                    isSearchable={false}
                                    isClearable
                                    className={`${space_grotesk.className}`}
                                    classNames={{
                                        menuList() {
                                            return "z-50";
                                        },
                                        control() {
                                            return "!py-2 !px-2 !rounded-md !shadow-sm !border-none !bg-zinc-50";
                                        },
                                    }}
                                    placeholder={t("energy-placeholder")}
                                    components={{
                                        Option: ({ innerProps, data, isSelected }) => {
                                            return (
                                                <div
                                                    {...innerProps}
                                                    className={`select-none p-1.5 flex flex-row items-center ${
                                                        isSelected
                                                            ? "bg-emerald-500"
                                                            : "hover:bg-zinc-200"
                                                    }`}
                                                >
                                                    <Typography bold>{data.label}</Typography>
                                                </div>
                                            );
                                        },
                                    }}
                                    options={[
                                        { label: t("furnished"), value: FurnitureState.furnished },
                                        {
                                            label: t("partially-furnished"),
                                            value: FurnitureState.partiallyFurnished,
                                        },
                                        {
                                            label: t("unfurnished"),
                                            value: FurnitureState.unfurnished,
                                        },
                                    ]}
                                />
                            </RowItem>
                        </FlexRow>

                        <FlexRow type={type} blacklistTypes={[PropertyType.land]}>
                            <TitleCol title={t("energy-title")}>{t("energy-description")}</TitleCol>
                            <RowItem>
                                <Select
                                    instanceId={id4}
                                    onChange={(newVal) => {
                                        setEnergyLabel(newVal ? newVal.value : null);
                                    }}
                                    isSearchable={false}
                                    isClearable
                                    className={`z-30 ${space_grotesk.className}`}
                                    classNames={{
                                        control() {
                                            return "!py-2 !px-2 !rounded-md !shadow-sm !border-none !bg-zinc-50";
                                        },
                                    }}
                                    placeholder={t("energy-placeholder")}
                                    components={{
                                        Option: ({ innerProps, data }) => {
                                            return (
                                                <div
                                                    {...innerProps}
                                                    className={`${getEnergyBg(
                                                        data.value
                                                    )} select-none py-1 px-2`}
                                                >
                                                    <Typography bold>{data.label}</Typography>
                                                </div>
                                            );
                                        },
                                    }}
                                    options={energyLabels}
                                />
                            </RowItem>
                        </FlexRow>

                        <FlexRow type={type} singleCol noPadding>
                            <div className="px-2">
                                <TitleCol title={t(`location-${type}`)}>
                                    {t("location-desc")}
                                </TitleCol>
                            </div>
                            <Map
                                scrollZoom={true}
                                showSearchBox
                                showCenterMarker
                                className="w-full shadow-sm mt-2 sm:rounded-lg sm:shadow-md"
                                style={{
                                    height: "50vh",
                                }}
                                onCenterChange={setLocation}
                            />
                        </FlexRow>

                        <FlexRow type={type}>
                            <TitleCol title={t("area")}>{t("area-desc")}</TitleCol>
                            <RowItem>
                                <Input
                                    placeholder={"160"}
                                    value={area + ""}
                                    onChange={(val) => {
                                        setArea(val);
                                    }}
                                    hasError={fieldErrorCodesParser.has(`${type}.surfaceArea`)}
                                    errorMsg={fieldErrorCodesParser.getTranslated(
                                        `${type}.surfaceArea`
                                    )}
                                />
                            </RowItem>
                        </FlexRow>

                        <FlexRow type={type}>
                            <TitleCol title={t("custom-id")}>{t("custom-id-description")}</TitleCol>
                            <RowItem>
                                <Input
                                    placeholder="A1603"
                                    value={customId}
                                    onChange={setCustomId}
                                    hasError={fieldErrorCodesParser.has(`${type}.customId`)}
                                    errorMsg={fieldErrorCodesParser.getTranslated(
                                        `${type}.customId`
                                    )}
                                />
                            </RowItem>
                        </FlexRow>
                    </div>
                    {/*  PROPERTY DATA SECTION END */}

                    {loadingBar && (
                        <FlexRow singleCol hideBottomBorder className="!m-0 !py-0">
                            <Typography
                                className={`text-center ${
                                    loadingBar.isError ? "text-rose-700" : "text-blue-500"
                                }`}
                                bold
                            >
                                {loadingBar.message}
                            </Typography>
                            <div className="w-full h-1 bg-zinc-300 rounded-full overflow-hidden relative">
                                <div
                                    className={`h-full ${
                                        loadingBar.isError ? "bg-rose-700" : "bg-blue-500"
                                    }`}
                                    style={{
                                        width: loadingBar.percent + "%",
                                    }}
                                ></div>
                            </div>
                        </FlexRow>
                    )}

                    <FlexRow singleCol hideBottomBorder className="!mt-0">
                        <Button.Primary
                            label={t("submit")}
                            onClick={submitAd}
                            loading={isSubmittingAd}
                        />
                    </FlexRow>
                </div>
            </div>
        </div>
    );
}
