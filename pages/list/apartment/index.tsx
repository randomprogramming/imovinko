import Button from "@/components/Button";
import Input from "@/components/Input";
import Map from "@/components/Map";
import Navbar from "@/components/Navbar";
import Typography from "@/components/Typography";
import { ListingFor, createListing, patchPropertyMedia, uploadMedia } from "@/util/api";
import { NextPageContext } from "next";
import { useTranslations } from "next-intl";
import React, { useRef, useState } from "react";
import ImageUpload from "@/components/ImageUpload";

export async function getStaticProps(context: NextPageContext) {
    return {
        props: {
            messages: (await import(`../../../locales/${context.locale || "hr"}.json`)).default,
        },
    };
}

interface FlexRowProps {
    children?: React.ReactNode;
    singleCol?: boolean;
    hideBottomBorder?: boolean;
    noPadding?: boolean;
}
function FlexRow({ children, singleCol, hideBottomBorder, noPadding }: FlexRowProps) {
    return (
        <div
            className={`flex flex-col ${singleCol ? "flex-col" : "md:flex-row"} w-full ${
                !hideBottomBorder && "border-b-zinc-200 border-b-2"
            } mb-8 py-6 ${!noPadding && "px-2"}`}
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

export default function ListApartment() {
    const t = useTranslations("ListApartment");

    const imageUploadRef = useRef<HTMLInputElement>(null);
    const [isSubmittingAd, setIsSubmittingAd] = useState(false);
    const [title, setTitle] = useState("");
    const [isForSale, setIsForSale] = useState(false);
    const [isForShortTermRent, setIsForShortTermRent] = useState(false);
    const [isForLongTermRent, setIsForLongTermRent] = useState(false);
    const [location, setLocation] = useState({
        lat: 0,
        lon: 0,
    });
    const [area, setArea] = useState(0);
    const [images, setImages] = useState<File[]>([]);

    async function submitAd() {
        try {
            // First create the apartment, then PATCH or PUT the images,
            // othwerise we might be uploading images for nothing when user enters some invalid apartment info
            setIsSubmittingAd(true);
            const resp = await createListing({
                title,
                area,
                lat: location.lat,
                lon: location.lon,
                listingFor: ListingFor.apartment,
                isForLongTermRent,
                isForShortTermRent,
                isForSale,
            });

            const imageUrls = await uploadMedia(images);
            await patchPropertyMedia({
                ...resp.data,
                media: imageUrls,
            });
            // TODO: Route to the page where all user listings are once that page exists
        } catch (e) {
        } finally {
            setIsSubmittingAd(false);
        }
    }

    return (
        <>
            <header>
                <Navbar hideSearchBar />
            </header>
            <main className="container mx-auto flex-1 flex flex-col">
                <Typography variant="h1">{t("title")}</Typography>
                <div className="flex-1 mt-8 flex justify-center">
                    <div className="w-full md:max-w-4xl">
                        <FlexRow>
                            <TitleCol title={t("ad-title")}>{t("ad-title-desc")}</TitleCol>
                            <RowItem>
                                <Input
                                    value={title}
                                    onChange={setTitle}
                                    placeholder={t("ad-title-placeholder")}
                                />
                            </RowItem>
                        </FlexRow>

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
