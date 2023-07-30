import Button from "@/components/Button";
import Input from "@/components/Input";
import Navbar from "@/components/Navbar";
import Typography from "@/components/Typography";
import { createCompany } from "@/util/api";
import { NextPageContext } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
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

export default function CreateCompanyPage() {
    const t = useTranslations("CreateCompanyPage");

    const router = useRouter();

    const [name, setName] = useState("");
    const [PIN, setPIN] = useState("");
    const [website, setWebsite] = useState("");
    const [storeName, setStoreName] = useState("");
    const [description, setDescription] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    async function handleCreateCompany() {
        setIsLoading(true);
        try {
            await createCompany({
                name,
                PIN,
                website,
                storeName,
                description,
            });
            await router.push("/account/company");
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <>
            <header>
                <Navbar hideSearchBar />
            </header>
            <main className="container mx-auto flex-1 flex flex-col">
                <Typography variant="h1">{t("title")}</Typography>

                <div className="flex justify-center mt-8">
                    <div className="w-full md:max-w-4xl">
                        <FlexRow>
                            <TitleCol title={t("name-title")}>{t("name-description")}</TitleCol>
                            <RowItem>
                                <Input
                                    placeholder={"Company d.o.o"}
                                    value={name}
                                    onChange={setName}
                                />
                            </RowItem>
                        </FlexRow>

                        <FlexRow>
                            <TitleCol title={t("pin-title")}>{t("pin-description")}</TitleCol>
                            <RowItem>
                                <Input placeholder={"10405347883"} value={PIN} onChange={setPIN} />
                            </RowItem>
                        </FlexRow>

                        <FlexRow>
                            <TitleCol title={t("web-page-title")}>
                                {t("web-page-description")}
                            </TitleCol>
                            <RowItem>
                                <Input
                                    placeholder={"https://company.com"}
                                    value={website}
                                    onChange={setWebsite}
                                />
                            </RowItem>
                        </FlexRow>

                        <FlexRow>
                            <TitleCol title={t("store-name-title")}>
                                {t("store-name-description")}
                            </TitleCol>
                            <RowItem>
                                <Input
                                    placeholder={"Company Store"}
                                    value={storeName}
                                    onChange={setStoreName}
                                />
                            </RowItem>
                        </FlexRow>

                        <FlexRow>
                            <TitleCol title={t("description-title")}>
                                {t("description-description")}
                            </TitleCol>
                            <RowItem>
                                <Input
                                    type="textarea"
                                    value={description}
                                    onChange={setDescription}
                                />
                            </RowItem>
                        </FlexRow>

                        <FlexRow singleCol hideBottomBorder>
                            <Button.Primary
                                label={t("create")}
                                onClick={handleCreateCompany}
                                loading={isLoading}
                            />
                        </FlexRow>
                    </div>
                </div>
            </main>
        </>
    );
}
