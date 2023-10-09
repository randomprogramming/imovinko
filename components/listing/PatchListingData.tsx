import Button from "@/components/Button";
import Input from "@/components/Input";
import Map from "@/components/Map";
import Typography from "@/components/Typography";
import {
    Company,
    EnergyClass,
    FurnitureState,
    Listing,
    ListingFor,
    PatchListingData,
    PropertyType,
    deleteMedia,
    patchListing,
    patchPropertyMedia,
    uploadMedia,
} from "@/util/api";
import { useTranslations } from "next-intl";
import React, { useRef, useState, useId } from "react";
import ImageUpload from "@/components/ImageUpload";
import Select from "react-select";
import Icon from "@/components/Icon";
import Link from "@/components/Link";
import { useRouter } from "next/router";
import { space_grotesk } from "@/util/fonts";
import useFieldErrorCodes from "@/hooks/useFieldErrorCodes";
import { OfferingType } from "@/util/api";
import Modal from "../Modal";
import { FlexRow, RowItem, TitleCol, energyLabels } from "./InputListingComponents";
import Main from "../Main";
import { Marker } from "react-map-gl";
import CImage from "../CImage";

export function intersection(a?: string[], b?: string[]): string[] {
    if (!a || !b || a.length === 0 || b.length === 0) {
        return [];
    }
    const setA = new Set(a);
    return b.filter((value) => setA.has(value));
}

interface ListApartmentProps {
    company: Company | null;
    listing: Listing | null;
    type: PropertyType;
}

function getListingProperty(listing: Listing | null, type: PropertyType, key: string) {
    if (!listing) {
        return undefined;
    }
    const property = listing[type];
    if (!property) {
        return undefined;
    }
    if (Object.keys(property).includes(key)) {
        return property[key as keyof typeof property];
    }
    return undefined;
}

export default function InputListingData({ company, listing, type }: ListApartmentProps) {
    const t = useTranslations("InputListingData");

    const router = useRouter();

    const furnitureStateOptions = [
        { label: t("furnished"), value: FurnitureState.furnished },
        {
            label: t("partially-furnished"),
            value: FurnitureState.partiallyFurnished,
        },
        {
            label: t("unfurnished"),
            value: FurnitureState.unfurnished,
        },
    ];

    const imageUploadRef = useRef<HTMLInputElement>(null);

    const [isSubmittingAd, setIsSubmittingAd] = useState(false);

    const [saleListingTitle, setSaleListingTitle] = useState(listing?.title);
    const [saleListingPrice, setSaleListingPrice] = useState<string>(String(listing?.price));
    const [saleCommissionsPercent, setSaleCommissionsPercent] = useState<undefined | string>(
        typeof listing?.saleCommissionPercent === "number"
            ? String(listing.saleCommissionPercent)
            : ""
    );
    const [saleListingDescription, setSaleListingDescription] = useState<string | undefined | null>(
        listing?.description
    );
    const [saleManualAccountContacts, setSaleManualAccountContacts] = useState<string[]>([]);
    const [saleContacts, setSaleContacts] = useState<string[]>([]);
    const [shortTermListingTitle, setShortTermListingTitle] = useState(listing?.title);
    const [shortTermListingPrice, setShortTermListingPrice] = useState<string>(
        String(listing?.price)
    );
    const [shortTermListingDescription, setShortTermListingDescription] = useState<
        string | undefined | null
    >(listing?.description);
    const [shortTermContacts, setShortTermContacts] = useState<string[]>([]);
    const [shortTermManualAccountContacts, setShortTermManualAccountContacts] = useState<string[]>(
        []
    );
    const [longTermListingTitle, setLongTermListingTitle] = useState(listing?.title);
    const [longTermListingPrice, setLongTermListingPrice] = useState<string>(
        String(listing?.price)
    );
    const [priceIncludesUtilities, setPriceIncludesUtilities] = useState(
        !!listing?.priceIncludesUtilities
    );
    const [longTermListingDescription, setLongTermListingDescription] = useState<
        string | undefined | null
    >(listing?.description);
    const [longTermContacts, setLongTermContacts] = useState<string[]>([]);
    const [longTermManualAccountContacts, setLongTermManualAccountContacts] = useState<string[]>(
        []
    );
    const [location, setLocation] = useState({
        lat: getListingProperty(listing, type, "latitude") as number,
        lon: getListingProperty(listing, type, "longitude") as number,
    });
    const [area, setArea] = useState(getListingProperty(listing, type, "surfaceArea") as number);
    const [images, setImages] = useState<File[]>([]);
    const [bedroomCount, setBedroomCount] = useState<string | null | undefined>(
        getListingProperty(listing, type, "bedroomCount") as string
    );
    const [bathroomCount, setBathroomCount] = useState<string | null>(
        getListingProperty(listing, type, "bathroomCount") as string
    );
    const [parkingSpaceCount, setParkingSpaceCount] = useState<string | null>(
        getListingProperty(listing, type, "parkingSpaceCount") as string
    );
    const [floor, setFloor] = useState<string | null>(
        getListingProperty(listing, type, "floor") as string
    );
    const [totalFloors, setTotalFloors] = useState<string | null>(
        getListingProperty(listing, type, "totalFloors") as string
    );
    const [buildingFloors, setBuildingFloors] = useState<string | null>(
        getListingProperty(listing, type, "buildingFloors") as string
    );
    const [buildYear, setBuildYear] = useState<string | null>(
        getListingProperty(listing, type, "buildYear") as string
    );
    const [renovationYear, setRenovationYear] = useState<string | null>(
        getListingProperty(listing, type, "renovationYear") as string
    );
    const [customId, setCustomId] = useState<string | null>(
        getListingProperty(listing, type, "customId") as string
    );

    const fieldErrorCodesParser = useFieldErrorCodes();
    const [loadingBar, setLoadingBar] = useState<{
        percent: number;
        message: string;
        isError?: boolean;
    }>();
    const [energyLabel, setEnergyLabel] = useState<EnergyClass | null>(
        getListingProperty(listing, type, "energyLabel") as EnergyClass
    );
    const [needsRenovation, setNeedsRenovation] = useState<boolean>(
        !!getListingProperty(listing, type, "needsRenovation")
    );
    const [elevatorAccess, setElevatorAccess] = useState<boolean>(
        !!getListingProperty(listing, type, "elevatorAccess")
    );
    const [furnitureState, setFurnitureState] = useState(getPropertyFurnishedState(listing, type));

    const [mediaToDelete, setMediaToDelete] = useState<string | null>(null);

    const id1 = useId();
    const id2 = useId();
    const id3 = useId();
    const id4 = useId();

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
                          label: `${ac.firstName ? ac.firstName : ""}${ac.firstName && " "}${
                              ac.lastName ? ac.lastName : ""
                          }`,
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
                          label: `${mac.firstName ? mac.firstName : ""}${mac.firstName && " "}${
                              mac.lastName ? mac.lastName : ""
                          }`,
                      };
                  }),
              },
          ]
        : [];
    const listingContactsIds = listing ? listing.contacts.map((ca) => ca.id) : [];
    const listingManualContactsIds = listing
        ? listing.manualAccountContacts.map((ca) => ca.id)
        : [];
    const defaultContacts = company
        ? [
              ...company.accounts
                  .filter((ac) => listingContactsIds.includes(ac.id))
                  .map((ac) => {
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
              ...company.manualAccounts
                  .filter((ac) => listingManualContactsIds.includes(ac.id))
                  .map((mac) => {
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
          ]
        : [];

    function getPropertyFurnishedState(l: Listing | null, t: PropertyType) {
        if (!l) return null;

        if (t === PropertyType.apartment || t === PropertyType.house) {
            if (l[t]?.furnitureState) {
                const currState = furnitureStateOptions.find(
                    (o) => o.value === l[t]?.furnitureState
                );
                if (currState) return currState;
            }
        }
        return null;
    }

    async function handleMediaDelete(id: string) {
        try {
            await deleteMedia(id);
            if (listing) {
                const property = listing[type];
                if (!property) {
                    throw new Error("property not found");
                }
                router.reload();
            }
        } catch (e) {
            console.error(e);
        }
    }

    async function submitAd() {
        if (!listing) {
            return;
        }
        setIsSubmittingAd(true);
        fieldErrorCodesParser.empty();
        setLoadingBar({
            message: t("creating-listing"),
            percent: 10,
        });
        try {
            let listingData: PatchListingData = {};
            if (listing?.offeringType === OfferingType.sale) {
                listingData = {
                    sale: {
                        title: saleListingTitle,
                        price: saleListingPrice,
                        contacts: saleContacts,
                        manualAccountContacts: saleManualAccountContacts,
                        description: saleListingDescription,
                        saleCommissionPercent: saleCommissionsPercent,
                    },
                };
            } else if (listing?.offeringType === OfferingType.shortTermRent) {
                listingData = {
                    shortTermRent: {
                        title: shortTermListingTitle,
                        price: shortTermListingPrice,
                        contacts: shortTermContacts,
                        manualAccountContacts: shortTermManualAccountContacts,
                        description: shortTermListingDescription,
                    },
                };
            } else {
                listingData = {
                    longTermRent: {
                        title: longTermListingTitle,
                        price: longTermListingPrice,
                        contacts: longTermContacts,
                        manualAccountContacts: longTermManualAccountContacts,
                        description: longTermListingDescription,
                        priceIncludesUtilities,
                    },
                };
            }
            if (type === PropertyType.apartment) {
                await patchListing(listing?.prettyId, {
                    ...listingData,
                    apartment: {
                        surfaceArea: area,
                        bathroomCount,
                        bedroomCount,
                        buildingFloors,
                        buildYear,
                        customId,
                        energyLabel,
                        floor,
                        parkingSpaceCount,
                        renovationYear,
                        totalFloors,
                        needsRenovation,
                        elevatorAccess,
                        furnitureState: furnitureState ? furnitureState.value : null,
                    },
                });
            } else if (type === PropertyType.house) {
                await patchListing(listing?.prettyId, {
                    ...listingData,
                    house: {
                        surfaceArea: area,
                        bathroomCount,
                        bedroomCount,
                        buildYear,
                        customId,
                        energyLabel,
                        parkingSpaceCount,
                        renovationYear,
                        totalFloors,
                        needsRenovation,
                        furnitureState: furnitureState ? furnitureState.value : null,
                    },
                });
            } else if (type === PropertyType.land) {
                await patchListing(listing?.prettyId, {
                    ...listingData,
                    land: {
                        surfaceArea: area,
                        customId,
                    },
                });
            }

            setLoadingBar({
                message: t("uploading-media"),
                percent: 45,
            });
            if (images.length > 0) {
                const imageUrls = await uploadMedia(images);
                setLoadingBar({
                    message: t("updating-media"),
                    percent: 90,
                });

                await patchPropertyMedia({
                    id: listing[type]?.id!,
                    listingFor: ListingFor[type],
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
                        listingUpdated: true,
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
            const mainSection = document.querySelector("#main");
            if (mainSection) {
                mainSection.scrollIntoView({
                    behavior: "smooth",
                });
            }
        } finally {
            setIsSubmittingAd(false);
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

    return (
        <>
            <Modal
                small
                show={typeof mediaToDelete === "string"}
                onClose={() => {
                    setMediaToDelete(null);
                }}
            >
                <div className="flex flex-col">
                    <div className="self-center my-2">
                        {listing &&
                            listing[type]?.media.find((media) => {
                                return media.id === mediaToDelete;
                            }) && (
                                <img
                                    src={
                                        listing[type]?.media.find((media) => {
                                            return media.id === mediaToDelete;
                                        })?.url
                                    }
                                    className="w-32 h-24 object-cover rounded"
                                />
                            )}
                    </div>
                    <div className="px-2">
                        <Typography>{t("confirm")}</Typography>
                    </div>
                    <div className="grid grid-cols-2 border-t border-zinc-300 ">
                        <div
                            className="px-2 py-1 text-center hover:bg-zinc-200 transition-all cursor-pointer"
                            onClick={() => {
                                setMediaToDelete(null);
                            }}
                        >
                            <Typography className="text-blue-500 select-none" bold>
                                {t("cancel")}
                            </Typography>
                        </div>
                        <div
                            className="px-2 py-1 border-l border-zinc-300 text-center hover:bg-zinc-200 transition-all cursor-pointer"
                            onClick={() => {
                                handleMediaDelete(mediaToDelete!);
                            }}
                        >
                            <Typography className="text-red-500 select-none" bold>
                                {t("delete")}
                            </Typography>
                        </div>
                    </div>
                </div>
            </Modal>
            <Main container id="main">
                <Typography variant="h1">{t(`title-${type}`)}</Typography>
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
                            <TitleCol title={t("new-images")}>{t("new-images-desc")}</TitleCol>

                            <ImageUpload
                                images={images}
                                inputRef={imageUploadRef}
                                removeImage={(i) => {
                                    const copy = [...images];
                                    copy.splice(i, 1);
                                    setImages(copy);
                                }}
                            />
                        </FlexRow>
                        {listing && listing[type]?.media && listing[type]?.media.length! > 0 && (
                            <FlexRow singleCol>
                                <TitleCol title={t("edit-images")}>
                                    {t("edit-images-desc")}
                                </TitleCol>
                                <div className="w-full overflow-x-auto flex flex-row space-x-2 pb-2 mt-1">
                                    {listing &&
                                        listing[type]?.media.map((media) => {
                                            return (
                                                <div
                                                    key={media.id}
                                                    className="flex flex-col h-40 w-40 overflow-hidden rounded shadow-sm border border-zinc-300"
                                                    style={{
                                                        flex: "0 0 auto",
                                                    }}
                                                >
                                                    <div className="h-3/4">
                                                        <img
                                                            src={media.url}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <div className="flex flex-row h-1/4 bg-zinc-50 items-center justify-center border-t border-zinc-300">
                                                        <Button.Transparent
                                                            className="!p-1"
                                                            onClick={() => {
                                                                setMediaToDelete(media.id);
                                                            }}
                                                        >
                                                            <Icon
                                                                name="trash"
                                                                className="stroke-red-600"
                                                            />
                                                        </Button.Transparent>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                            </FlexRow>
                        )}

                        {/* SALE SECTION START */}
                        <FlexRow
                            singleCol
                            className={`${
                                listing?.offeringType === OfferingType.sale
                                    ? "opacity-100"
                                    : "!mb-0 !p-0 h-0 opacity-0 invisible "
                            } transition-all`}
                        >
                            <Typography variant="h2">{t("sale-information")}</Typography>
                            <FlexRow hideBottomBorder>
                                <TitleCol title={t("ad-title")}>{t("ad-title-desc")}</TitleCol>
                                <RowItem>
                                    <Input
                                        disabled
                                        value={saleListingTitle}
                                        onChange={setSaleListingTitle}
                                        placeholder={t("ad-title-placeholder")}
                                        hasError={fieldErrorCodesParser.has("sale.title")}
                                        errorMsg={fieldErrorCodesParser.getTranslated("sale.title")}
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
                                        hasError={fieldErrorCodesParser.has("sale.description")}
                                        errorMsg={fieldErrorCodesParser.getTranslated(
                                            "sale.description"
                                        )}
                                    />
                                </RowItem>
                            </FlexRow>
                            <FlexRow hideBottomBorder>
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
                                <FlexRow hideBottomBorder>
                                    <TitleCol title={t("contact")}>
                                        {t("contact-description")}
                                    </TitleCol>

                                    <RowItem>
                                        <Select
                                            instanceId={id1}
                                            isMulti
                                            className={`z-30 ${space_grotesk.className}`}
                                            isSearchable
                                            defaultValue={defaultContacts}
                                            closeMenuOnSelect={false}
                                            blurInputOnSelect={false}
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

                                                setSaleContacts(contacts.map((c) => c.id));
                                                setSaleManualAccountContacts(
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
                                                            <div className="flex flex-row items-center border border-zinc-300 rounded-md px-1 py-1 ml-1 my-0.5">
                                                                {data.avatarUrl ? (
                                                                    <div className="w-6 h-6 rounded-full overflow-hidden relative">
                                                                        <CImage
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
                                                                    {data.label}
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
                                                                {data.avatarUrl ? (
                                                                    <div className="w-8 h-8 rounded-full overflow-hidden relative">
                                                                        <CImage
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
                                                                    {children}
                                                                    {data.email &&
                                                                        `(${data.email})`}
                                                                </Typography>
                                                                <div
                                                                    className={`ml-1 w-4 h-4 rounded-sm border border-zinc-400 ${
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
                                listing?.offeringType === OfferingType.shortTermRent
                                    ? "opacity-100"
                                    : "!mb-0 !p-0 h-0 opacity-0 invisible"
                            } transition-all`}
                        >
                            <Typography variant="h2">{t("short-term-rent-information")}</Typography>
                            <FlexRow hideBottomBorder>
                                <TitleCol title={t("ad-title")}>{t("ad-title-desc")}</TitleCol>
                                <RowItem>
                                    <Input
                                        disabled
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
                                        hasError={fieldErrorCodesParser.has(
                                            "shortTermRent.description"
                                        )}
                                        errorMsg={fieldErrorCodesParser.getTranslated(
                                            "shortTermRent.description"
                                        )}
                                    />
                                </RowItem>
                            </FlexRow>
                            <FlexRow hideBottomBorder>
                                <TitleCol title={t("sale-price")}>
                                    {t("short-term-price-description")}
                                </TitleCol>
                                <RowItem>
                                    <Input
                                        value={shortTermListingPrice}
                                        onChange={setShortTermListingPrice}
                                        placeholder={"120"}
                                        type="currency"
                                        hasError={fieldErrorCodesParser.has("shortTermRent.price")}
                                        errorMsg={fieldErrorCodesParser.getTranslated(
                                            "shortTermRent.price"
                                        )}
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
                                            instanceId={id2}
                                            className={`z-30 ${space_grotesk.className}`}
                                            isMulti
                                            isSearchable
                                            closeMenuOnSelect={false}
                                            blurInputOnSelect={false}
                                            defaultValue={defaultContacts}
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

                                                setShortTermContacts(contacts.map((c) => c.id));
                                                setShortTermManualAccountContacts(
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
                                                            <div className="flex flex-row items-center border border-zinc-300 rounded-md px-1 py-1 ml-1 my-0.5">
                                                                {data.avatarUrl ? (
                                                                    <div className="w-6 h-6 rounded-full overflow-hidden relative">
                                                                        <CImage
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
                                                                    {data.label}
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
                                                                {data.avatarUrl ? (
                                                                    <div className="w-8 h-8 rounded-full overflow-hidden relative">
                                                                        <CImage
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
                                                                    {children}
                                                                    {data.email &&
                                                                        `(${data.email})`}
                                                                </Typography>
                                                                <div
                                                                    className={`ml-1 w-4 h-4 rounded-sm border border-zinc-400 ${
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
                            singleCol
                            className={`${
                                listing?.offeringType === OfferingType.longTermRent
                                    ? "opacity-100 !mt-0"
                                    : "!mb-0 !p-0 h-0 opacity-0 invisible"
                            } transition-all`}
                        >
                            <Typography variant="h2">{t("long-term-rent-information")}</Typography>
                            <FlexRow hideBottomBorder>
                                <TitleCol title={t("ad-title")}>{t("ad-title-desc")}</TitleCol>
                                <RowItem>
                                    <Input
                                        disabled
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
                                        hasError={fieldErrorCodesParser.has(
                                            "longTermRent.description"
                                        )}
                                        errorMsg={fieldErrorCodesParser.getTranslated(
                                            "longTermRent.description"
                                        )}
                                    />
                                </RowItem>
                            </FlexRow>
                            <FlexRow hideBottomBorder>
                                <TitleCol title={t("sale-price")}>
                                    {t("long-term-price-description")}
                                </TitleCol>
                                <RowItem>
                                    <Input
                                        value={longTermListingPrice}
                                        onChange={setLongTermListingPrice}
                                        placeholder={"450"}
                                        type="currency"
                                        hasError={fieldErrorCodesParser.has("longTermRent.price")}
                                        errorMsg={fieldErrorCodesParser.getTranslated(
                                            "longTermRent.price"
                                        )}
                                    />
                                    <Input
                                        className="mt-2"
                                        type="checkbox"
                                        checked={priceIncludesUtilities}
                                        onCheckedChange={setPriceIncludesUtilities}
                                        name={t("includes-utilities")}
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
                                            instanceId={id3}
                                            className={`z-30 ${space_grotesk.className}`}
                                            isMulti
                                            isSearchable
                                            closeMenuOnSelect={false}
                                            blurInputOnSelect={false}
                                            defaultValue={defaultContacts}
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

                                                setLongTermContacts(contacts.map((c) => c.id));
                                                setLongTermManualAccountContacts(
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
                                                            <div className="flex flex-row items-center border border-zinc-300 rounded-md px-1 py-1 ml-1 my-0.5">
                                                                {data.avatarUrl ? (
                                                                    <div className="w-6 h-6 rounded-full overflow-hidden relative">
                                                                        <CImage
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
                                                                    {data.label}
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
                                                                {data.avatarUrl ? (
                                                                    <div className="w-8 h-8 rounded-full overflow-hidden relative">
                                                                        <CImage
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
                                                                    {children}
                                                                    {data.email &&
                                                                        `(${data.email})`}
                                                                </Typography>
                                                                <div
                                                                    className={`ml-1 w-4 h-4 rounded-sm border border-zinc-400 ${
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
                        <FlexRow type={type} blacklistTypes={[PropertyType.land]}>
                            <TitleCol title={t("bedroom-count")}>
                                {t("bedroom-count-description")}
                            </TitleCol>
                            <RowItem>
                                <Input
                                    value={bedroomCount || ""}
                                    onChange={setBedroomCount}
                                    hasError={fieldErrorCodesParser.has("apartment.bedroomCount")}
                                    errorMsg={fieldErrorCodesParser.getTranslated(
                                        "apartment.bedroomCount"
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
                                    hasError={fieldErrorCodesParser.has("apartment.bathroomCount")}
                                    errorMsg={fieldErrorCodesParser.getTranslated(
                                        "apartment.bathroomCount"
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
                                        "apartment.parkingSpaceCount"
                                    )}
                                    errorMsg={fieldErrorCodesParser.getTranslated(
                                        "apartment.parkingSpaceCount"
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
                                    hasError={fieldErrorCodesParser.has("apartment.floor")}
                                    errorMsg={fieldErrorCodesParser.getTranslated(
                                        "apartment.floor"
                                    )}
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
                                    hasError={fieldErrorCodesParser.has("apartment.totalFloors")}
                                    errorMsg={fieldErrorCodesParser.getTranslated(
                                        "apartment.totalFloors"
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
                                    hasError={fieldErrorCodesParser.has("apartment.buildingFloors")}
                                    errorMsg={fieldErrorCodesParser.getTranslated(
                                        "apartment.buildingFloors"
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
                                    hasError={fieldErrorCodesParser.has("apartment.buildYear")}
                                    errorMsg={fieldErrorCodesParser.getTranslated(
                                        "apartment.buildYear"
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
                                    hasError={fieldErrorCodesParser.has("apartment.renovationYear")}
                                    errorMsg={fieldErrorCodesParser.getTranslated(
                                        "apartment.renovationYear"
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
                                    instanceId={useId()}
                                    onChange={(newVal) => {
                                        setFurnitureState(newVal ? newVal : null);
                                    }}
                                    isSearchable={false}
                                    isClearable
                                    className={`${space_grotesk.className}`}
                                    classNames={{
                                        menu() {
                                            return "!z-50";
                                        },
                                        menuList() {
                                            return "z-50";
                                        },
                                        control() {
                                            return "!py-2 !px-2 !rounded-md !shadow-sm !border-none !bg-zinc-50";
                                        },
                                    }}
                                    value={furnitureState}
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
                                    options={furnitureStateOptions}
                                />
                            </RowItem>
                        </FlexRow>

                        <FlexRow type={type} blacklistTypes={[PropertyType.land]}>
                            <TitleCol title={t("energy-title")}>{t("energy-description")}</TitleCol>
                            <RowItem>
                                <Select
                                    instanceId={id4}
                                    defaultValue={energyLabels.find(
                                        (lb) => lb.value === energyLabel
                                    )}
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
                        <FlexRow singleCol noPadding>
                            <div className="px-2">
                                <TitleCol title={t(`location-${type}`)}>{""}</TitleCol>
                            </div>
                            <Map
                                centerLat={location.lat}
                                centerLon={location.lon}
                                scrollZoom={false}
                                className="w-full shadow-sm mt-2 sm:rounded-lg sm:shadow-md"
                                style={{
                                    height: "50vh",
                                }}
                                zoom={16}
                            >
                                <Marker longitude={location.lon} latitude={location.lat}>
                                    <Icon name="marker" height={48} width={48} />
                                </Marker>
                            </Map>
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
                                    hasError={fieldErrorCodesParser.has("apartment.surfaceArea")}
                                    errorMsg={fieldErrorCodesParser.getTranslated(
                                        "apartment.surfaceArea"
                                    )}
                                />
                            </RowItem>
                        </FlexRow>
                        <FlexRow>
                            <TitleCol title={t("custom-id")}>{t("custom-id-description")}</TitleCol>
                            <RowItem>
                                <Input
                                    placeholder="A1603"
                                    value={customId}
                                    onChange={setCustomId}
                                    hasError={fieldErrorCodesParser.has("apartment.customId")}
                                    errorMsg={fieldErrorCodesParser.getTranslated(
                                        "apartment.customId"
                                    )}
                                />
                            </RowItem>
                        </FlexRow>
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
            </Main>
        </>
    );
}
