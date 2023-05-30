import { useTranslations } from "next-intl";
import Icon from "./Icon";
import { space_grotesk } from "@/util/fonts";

interface SearchbarProps {
    type: "location";
    className?: string;
}

export default function Searchbar({ type, className }: SearchbarProps) {
    const t = useTranslations("SearchBar");

    switch (type) {
        case "location":
            return (
                <div
                    className={`${className} flex flex-row items-center bg-zinc-300 rounded-lg px-3 h-12 shadow-sm`}
                >
                    <Icon name="search" />
                    <input
                        className={`flex-1 bg-zinc-300 outline-none ml-3 h-full ${space_grotesk.className}`}
                        placeholder={t("placeholder")}
                    />
                </div>
            );
    }
}
