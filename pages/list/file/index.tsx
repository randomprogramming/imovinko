import Navbar from "@/components/Navbar";
import { GetServerSideProps } from "next";
import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Main from "@/components/Main";
import { useTranslations } from "next-intl";
import Typography from "@/components/Typography";
import Button from "@/components/Button";
import { OfferingType, uploadListingsFile } from "@/util/api";
import { JsonView, allExpanded, defaultStyles } from "react-json-view-lite";
import "react-json-view-lite/dist/index.css";
import XMLViewer from "react-xml-viewer";
import listingValidator, { CreateListingValidatedData } from "@/util/listingValidator";
import { ZodError } from "zod";
import { formatPrice } from "@/util/listing";
import Icon from "@/components/Icon";
import { useRouter } from "next/router";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
    return {
        props: {
            messages: (await import(`../../../locales/${locale || "hr"}.json`)).default,
        },
    };
};

interface MinifiedListing {
    number: number;
    title?: string | null;
    price?: number | null;
    offeringType?: OfferingType | null;
    customId?: string | null;
    error?: string | null;
    firstImage?: string | null;
    // Don't forget to update colSpan= for error field when adding new fields here
}

function Code(props: { children: React.ReactNode }) {
    return <code className="text-sm bg-zinc-300 font-mono px-1 rounded">{props.children}</code>;
}

interface ListingError {
    message: string;
}
export default function CreateListingFromFilePage() {
    const t = useTranslations("CreateListingFromFilePage");

    const fileRef = useRef<HTMLInputElement>(null);

    const router = useRouter();

    const [isUploadingFile, setIsUploadingFile] = useState(false);
    const [file, setFile] = useState<File>();
    const [dragActive, setDragActive] = useState(false);

    const [parsedListings, setParsedListings] = useState<CreateListingValidatedData[]>();

    const [minifiedListings, setMinifiedListings] = useState<MinifiedListing[]>();

    const [fileErrorMessage, setFileErrorMessage] = useState<string>();

    const [listingErrors, setlistingErrors] = useState<ListingError[]>();

    function openFilePicker() {
        fileRef?.current?.click();
    }

    async function uploadFile() {
        if (!file) {
            return;
        }
        setIsUploadingFile(true);
        try {
            await uploadListingsFile(file);
            await router.push({
                pathname: "/settings/listings",
                query: {
                    fileUploaded: true,
                },
            });
        } catch (e) {
            console.error(e);
        } finally {
            setIsUploadingFile(false);
        }
    }

    function parseListings(listings: any[]) {
        const parsed: CreateListingValidatedData[] = [];
        const errors: ListingError[] = [];

        for (const p of listings) {
            try {
                parsed.push(listingValidator(p));
            } catch (e) {
                if (e instanceof ZodError) {
                    if (e.issues.length > 0) {
                        const customId =
                            p?.apartment?.customId || p?.house?.customId || p?.land?.customId;
                        errors.push({
                            message: `Error: [${customId || "-"}] [${e.issues[0].path.join(
                                ","
                            )}]: ${e.issues[0].message}`,
                        });
                    }
                }
            }
        }

        setlistingErrors(errors);
        setParsedListings(parsed);
    }

    function parseJSONString(str: string) {
        const parsedJson = JSON.parse(str);

        if (!parsedJson.listing) {
            setFileErrorMessage(t("file-no-listing-object"));
            return;
        }

        const parsedArr = Array.isArray(parsedJson.listing)
            ? parsedJson.listing
            : [parsedJson?.listing];

        parseListings(parsedArr);
    }

    function resetFileUpload(resetFile?: boolean) {
        setFileErrorMessage(undefined);
        setParsedListings(undefined);
        setMinifiedListings(undefined);
        if (resetFile) {
            setFile(undefined);
        }
        setlistingErrors(undefined);
    }

    const handleDrop = function (e: React.DragEvent<HTMLButtonElement>) {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const f = e.dataTransfer.files[0];
            if (f.name.endsWith(".xml") || f.name.endsWith(".json")) {
                setFile(f);
            }
        }
    };

    const handleDrag = function (e: React.DragEvent<HTMLButtonElement>) {
        e.preventDefault();
        e.stopPropagation();
        if ((e.type === "dragenter" || e.type === "dragover") && !dragActive) {
            setDragActive(true);
        } else if (e.type === "dragleave" && dragActive) {
            setDragActive(false);
        }
    };

    useEffect(() => {
        if (parsedListings) {
            const minified: MinifiedListing[] = [];

            let i = 0;
            for (const pl of parsedListings) {
                if (!pl.apartment && !pl.house && !pl.land) {
                    minified.push({
                        number: i++,
                        error: t("missing-property"),
                    });
                }

                const media = pl.apartment?.media || pl.house?.media || pl.land?.media;
                const customId = pl.apartment?.customId || pl.house?.customId || pl.land?.customId;
                const firstImage = media && media.length > 0 ? media[0] : undefined;

                if (pl.sale) {
                    minified.push({
                        number: i++,
                        customId,
                        price: pl.sale.price,
                        title: pl.sale.title,
                        offeringType: OfferingType.sale,
                        firstImage,
                    });
                }
                if (pl.shortTermRent) {
                    minified.push({
                        number: i++,
                        customId,
                        price: pl.shortTermRent.price,
                        title: pl.shortTermRent.title,
                        offeringType: OfferingType.shortTermRent,
                        firstImage,
                    });
                }
                if (pl.longTermRent) {
                    minified.push({
                        number: i++,
                        customId,
                        price: pl.longTermRent.price,
                        title: pl.longTermRent.title,
                        offeringType: OfferingType.longTermRent,
                        firstImage,
                    });
                }
                if (!pl.sale && !pl.shortTermRent && !pl.longTermRent) {
                    minified.push({
                        number: i++,
                        error: t("missing-offering-type"),
                    });
                }
            }
            setMinifiedListings(minified);
        }
    }, [parsedListings]);

    useEffect(() => {
        resetFileUpload(false);
        if (file) {
            const fileReader = new FileReader();
            fileReader.readAsText(file);
            fileReader.onload = () => {
                if (!fileReader.result) {
                    return;
                }
                if (file.name.endsWith(".xml")) {
                    console.log("not implemented");
                } else if (file.name.endsWith(".json")) {
                    if (typeof fileReader.result === "string") {
                        parseJSONString(fileReader.result);
                    }
                }
            };
            fileReader.onerror = () => {
                console.error("Error while reading file");
            };
        }
    }, [file]);

    return (
        <>
            <Head>
                <title>Imovinko - Predaj oglas iz datoteke</title>
            </Head>
            <header>
                <Navbar hideSearchBar />
            </header>
            <Main container mobilePadding className="max-w-3xl">
                {minifiedListings ? (
                    <div>
                        <button
                            className="flex flex-row items-center my-2 border-2 border-transparent hover:border-zinc-900 transition-all pr-2 py-1 rounded"
                            onClick={() => {
                                resetFileUpload(true);
                            }}
                        >
                            <Icon
                                name="down-chevron"
                                className="rotate-45 origin-center stroke-2"
                            />
                            <Typography bold>{t("back")}</Typography>
                        </button>
                        <Typography variant="h2">
                            {t("read-from-file")} ({minifiedListings.length})
                        </Typography>

                        <div className="mt-6 max-h-[50vh] bg-zinc-200 border rounded-md border-zinc-300 overflow-auto max-w-full">
                            <table className="w-full">
                                <thead>
                                    <tr>
                                        <th>
                                            <Typography>{t("sequence-number")}</Typography>
                                        </th>
                                        <th className="border-l border-zinc-300">
                                            <Typography>{t("media")}</Typography>
                                        </th>
                                        <th className="border-l border-zinc-300">
                                            <Typography>{t("custom-id")}</Typography>
                                        </th>
                                        <th className="border-l border-zinc-300">
                                            <Typography>{t("title")}</Typography>
                                        </th>
                                        <th className="border-l border-zinc-300">
                                            <Typography>{t("offering-type")}</Typography>
                                        </th>
                                        <th className="border-l border-zinc-300">
                                            <Typography>{t("price")}</Typography>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {minifiedListings?.map((m) => (
                                        <tr key={m.number} className="border-t border-zinc-300">
                                            <td className="text-center">
                                                <Typography bold>{m.number + 1}</Typography>
                                            </td>
                                            {m.error ? (
                                                <td colSpan={5}>
                                                    <Typography className="text-red-400" bold>
                                                        {m.error}
                                                    </Typography>
                                                </td>
                                            ) : (
                                                <React.Fragment>
                                                    <td
                                                        className="p-1 border-l border-zinc-300 flex items-center justify-center"
                                                        style={{ maxWidth: "260px" }}
                                                    >
                                                        {m.firstImage && (
                                                            <img
                                                                src={m.firstImage}
                                                                className="w-16 h-16 object-cover rounded-sm"
                                                            />
                                                        )}
                                                    </td>
                                                    <td
                                                        className="p-1 border-l border-zinc-300"
                                                        style={{
                                                            minWidth: "120px",
                                                            maxWidth: "260px",
                                                        }}
                                                    >
                                                        <Typography>{m.customId}</Typography>
                                                    </td>
                                                    <td
                                                        className="p-1 border-l border-zinc-300"
                                                        style={{
                                                            minWidth: "120px",
                                                            maxWidth: "260px",
                                                        }}
                                                    >
                                                        <Typography>{m.title}</Typography>
                                                    </td>
                                                    <td
                                                        className="p-1 border-l border-zinc-300 text-center"
                                                        style={{ maxWidth: "260px" }}
                                                    >
                                                        <Typography>
                                                            {m.offeringType
                                                                ? t(m.offeringType)
                                                                : ""}
                                                        </Typography>
                                                    </td>
                                                    <td
                                                        className="p-1 border-l border-zinc-300 text-center"
                                                        style={{ maxWidth: "260px" }}
                                                    >
                                                        <Typography>
                                                            {m.price ? formatPrice(m.price) : "-"}
                                                        </Typography>
                                                    </td>
                                                </React.Fragment>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {listingErrors && listingErrors.length > 0 && (
                            <div className="mt-8">
                                {listingErrors.map((e) => (
                                    <Typography className="text-red-500" bold>
                                        {e.message}
                                    </Typography>
                                ))}
                            </div>
                        )}

                        <div className="mt-8">
                            <Button.Primary
                                disabled={!file || (listingErrors && listingErrors.length > 0)}
                                loading={isUploadingFile}
                                label={t("send-file")}
                                onClick={uploadFile}
                            />
                        </div>
                    </div>
                ) : (
                    <div>
                        <Typography variant="h1">{t("listings-from-file")}</Typography>
                        <input
                            ref={fileRef}
                            className="hidden"
                            type="file"
                            accept=".json,.xml"
                            onChange={(e) => {
                                if (e.target.files && e.target.files.length > 0) {
                                    setFile(e.target.files[0]);
                                }
                            }}
                        />
                        <button
                            className={`${
                                dragActive ? "bg-zinc-300" : "bg-zinc-200 hover:bg-zinc-300"
                            } mt-4 w-full h-32 flex items-center justify-center border-zinc-900 border-dashed border-4 rounded-lg transition-all `}
                            onClick={openFilePicker}
                            onDrop={handleDrop}
                            onDragEnter={handleDrag}
                        >
                            <div className="flex flex-row items-center">
                                <Icon
                                    name="file-upload"
                                    height={32}
                                    width={32}
                                    className="animate-bounce"
                                />
                                <Typography bold uppercase className="ml-1 tracking-wider">
                                    {t("select-file")}
                                </Typography>
                            </div>
                        </button>

                        {fileErrorMessage && (
                            <Typography bold className="mt-2 text-red-500">
                                {fileErrorMessage}
                            </Typography>
                        )}

                        <section className="mt-8">
                            <Typography variant="h2">{t("how-to")}</Typography>
                            <Typography>{t("only-allow-xml-json")}</Typography>
                            <Typography className="mt-4">
                                {t.rich("general-1", {
                                    b: (chunks) => <b>{chunks}</b>,
                                    code: (chunks) => <Code>{chunks}</Code>,
                                })}
                            </Typography>
                            <Typography className="mt-8">{t("json-example")}</Typography>
                            <JsonView
                                shouldExpandNode={allExpanded}
                                style={{
                                    ...defaultStyles,
                                    container:
                                        "font-mono bg-zinc-200 shadow-sm rounded overflow-x-auto w-full max-w-full",
                                    expandIcon: "hidden",
                                    collapseIcon: "hidden",
                                    basicChildStyle: "ml-4",
                                    stringValue: "text-green-700",
                                }}
                                data={{
                                    listing: [
                                        {
                                            apartment: {
                                                surfaceArea: 160,
                                                longitude: 15.966568,
                                                latitude: 45.815399,
                                                customId: "APT-ZG-820",
                                            },
                                            sale: {
                                                title: "Apartment for sale title!",
                                                price: 290000,
                                                description: "Apartment sale listing description",
                                                saleCommissionPercent: 2.2,
                                            },
                                            longTermRent: {
                                                title: "Apartment for rent title!",
                                                price: 799.99,
                                                description: "Apartment rent listing description",
                                            },
                                        },
                                        {
                                            house: {
                                                surfaceArea: 260,
                                                longitude: 15.966568,
                                                latitude: 45.815399,
                                                customId: "ID-123",
                                            },
                                            sale: {
                                                title: "Apartment for sale title!",
                                                price: 520000.99,
                                                description: "House for sale description",
                                            },
                                        },
                                    ],
                                }}
                            />

                            <Typography className="mt-8">
                                {t("xml-example") + " " + t("xml-1")}
                            </Typography>
                            <div className="bg-zinc-200 shadow-sm rounded overflow-x-auto font-mono pl-2">
                                <XMLViewer
                                    theme={{
                                        fontFamily: "monospace",
                                    }}
                                    xml="<root>
                                    <listing>
                                        <apartment>
                                        <surfaceArea>160</surfaceArea>
                                        <longitude>15.966568</longitude>
                                        <latitude>45.815399</latitude>
                                        <customId>APT-ZG-820</customId>
                                        </apartment>
                                        <sale>
                                        <title>Apartment for sale title!</title>
                                        <price>290000</price>
                                        <description>Apartment sale listing description</description>
                                        <saleCommissionPercent>2.2</saleCommissionPercent>
                                        </sale>
                                        <longTermRent>
                                        <title>Apartment for rent title!</title>
                                        <price>799.99</price>
                                        <description>Apartment rent listing description</description>
                                        </longTermRent>
                                    </listing>
                                    <listing>
                                        <house>
                                        <surfaceArea>260</surfaceArea>
                                        <longitude>15.966568</longitude>
                                        <latitude>45.815399</latitude>
                                        <customId>ID-123</customId>
                                        </house>
                                        <sale>
                                        <title>Apartment for sale title!</title>
                                        <price>520000.99</price>
                                        <description>House for sale description</description>
                                        </sale>
                                    </listing>
                                </root>"
                                />
                            </div>
                        </section>
                    </div>
                )}
            </Main>
        </>
    );
}
