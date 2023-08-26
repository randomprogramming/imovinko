import React, { useState } from "react";
import { useTranslations } from "next-intl";
import Icon from "./Icon";
import { space_grotesk } from "@/util/fonts";
import { geocode } from "@/util/api";
import { useRouter } from "next/router";

interface SearchbarProps {
    className?: string;
    light?: boolean;
}
export default function Searchbar({ className, light }: SearchbarProps) {
    const t = useTranslations("SearchBar");

    const router = useRouter();

    const [searchVal, setSearchVal] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    async function onSearch() {
        setIsLoading(true);
        try {
            const { data } = await geocode(searchVal);

            if (data) {
                return router.push({
                    pathname: "/map",
                    query: {
                        ...data,
                    },
                });
            }
        } catch (err) {
            console.error(err);
            setIsLoading(false);
        }
    }

    return (
        <div className={`${className} flex-1 relative flex`}>
            <div
                className={`flex-1 flex flex-row ${
                    light ? "bg-zinc-100" : "bg-zinc-300"
                } rounded-lg h-12 shadow-sm relative z-30 items-center justify-center pr-0.5`}
            >
                <div onClick={onSearch} className="cursor-pointer p-2">
                    <Icon name="search" />
                </div>
                <input
                    className={`flex-1 ${
                        light ? "bg-zinc-100" : "bg-zinc-300"
                    } outline-none h-full ${space_grotesk.className} z-40 rounded-lg`}
                    placeholder={t("placeholder")}
                    size={1}
                    value={searchVal}
                    onKeyDown={(e) => {
                        if (e.key.toLowerCase() === "enter") {
                            onSearch();
                        }
                    }}
                    onChange={(e) => {
                        setSearchVal(e.target.value);
                    }}
                    onFocus={() => {
                        // setIsDropdownOpen(true);
                    }}
                />
                {isLoading && (
                    <div onClick={onSearch}>
                        <Icon name="loading" className="!text-zinc-900 !fill-zinc-100" />
                    </div>
                )}
            </div>
            {/* TODO: The plan was to add this dropdown which would appear when tou start
            searching, and it would allow you to basically filter out properties. Dribbble has soemthing like this on their site*/}
            {/* <div
                className={`${
                    isDropdownOpen ? "opacity-100 p-6" : "opacity-0 invisible p-0"
                } absolute transition-all bg-zinc-800 left-0 right-0 bottom-3 z-10 translate-y-full rounded-lg shadow-md`}
            >
                <div className="flex flex-row">
                    <div className="flex-1" />
                    <Button.Transparent
                        className="border-zinc-50 border-2 px-4 hover:bg-zinc-700"
                        onClick={() => {
                            setIsDropdownOpen(false);
                        }}
                    >
                        <div className="flex flex-row items-center justify-center space-x-2">
                            <Icon name="close" className="fill-zinc-50" height={20} width={20} />
                            <Typography className="text-zinc-50">{t("Close")}</Typography>
                        </div>
                    </Button.Transparent>
                </div>
                <div className="flex flex-row">
                    <div>
                        <Typography className="text-white">Zanima me</Typography>
                        <div className="flex flex-col space-y-2 pl-2">
                            <Input
                                name={"Kupovina"}
                                type="checkbox"
                                className="text-zinc-50"
                                // checked={isForSale}
                                // onCheckedChange={setIsForSale}
                            />
                            <Input
                                name={"Dugorocno iznajmljivanje"}
                                type="checkbox"
                                className="text-zinc-50"

                                // checked={isForSale}
                                // onCheckedChange={setIsForSale}
                            />
                            <Input
                                name={"Kratkorocno iznajmljivanje"}
                                type="checkbox"
                                className="text-zinc-50"

                                // checked={isForSale}
                                // onCheckedChange={setIsForSale}
                            />
                        </div>
                    </div>
                    <div className="ml-8">
                        <Typography className="text-white">Tip nekretnine</Typography>
                        <div className="flex flex-col space-y-2 pl-2">
                            <Input
                                name={"Kuca"}
                                type="checkbox"
                                className="text-zinc-50"
                                // checked={isForSale}
                                // onCheckedChange={setIsForSale}
                            />
                            <Input
                                name={"Stan"}
                                type="checkbox"
                                className="text-zinc-50"

                                // checked={isForSale}
                                // onCheckedChange={setIsForSale}
                            />
                            <Input
                                name={"Zemljiste"}
                                type="checkbox"
                                className="text-zinc-50"

                                // checked={isForSale}
                                // onCheckedChange={setIsForSale}
                            />
                        </div>
                    </div>
                </div>
            </div> */}
        </div>
    );
}
