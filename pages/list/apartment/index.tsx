import Button from "@/components/Button";
import Input from "@/components/Input";
import Map from "@/components/Map";
import Navbar from "@/components/Navbar";
import Typography from "@/components/Typography";
import { NextPageContext } from "next";
import { useTranslations } from "next-intl";
import React, { useState } from "react";

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

    async function submitAd() {
        try {
            setIsSubmittingAd(true);
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
                                onChange={setLocation}
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
