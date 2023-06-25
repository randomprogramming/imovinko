import React from "react";
import { useTranslations } from "next-intl";
import Icon from "./Icon";
import { space_grotesk } from "@/util/fonts";

interface SearchbarProps {
    className?: string;
}

export default function Searchbar({ className }: SearchbarProps) {
    const t = useTranslations("SearchBar");

    // const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    return (
        <div className={`${className} flex-1 relative flex`}>
            <div
                className={`flex-1 flex flex-row bg-zinc-300 rounded-lg h-12 shadow-sm relative z-30 items-center justify-center pl-2 space-x-2`}
            >
                <div>
                    <Icon name="search" />
                </div>
                <input
                    className={`flex-1 bg-zinc-300 outline-none h-full ${space_grotesk.className} z-40 rounded-lg`}
                    placeholder={t("placeholder")}
                    onFocus={() => {
                        // setIsDropdownOpen(true);
                    }}
                />
            </div>
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
