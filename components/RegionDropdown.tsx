import { space_grotesk } from "@/util/fonts";
import { useTranslations } from "next-intl";
import React, { useId } from "react";
import ReactSelect, { MultiValue } from "react-select";
import Icon from "./Icon";

export enum HRRegionShortCode {
    HR01 = "HR01", // Zagrebačka županija | 	Zagreb County | 	county
    HR02 = "HR02", // Krapinsko-zagorska županija | 	Krapina-Zagorje | 	county
    HR03 = "HR03", // Sisačko-moslavačka županija | 	Sisak-Moslavina | 	county
    HR04 = "HR04", // Karlovačka županija | 	Karlovac | 	county
    HR05 = "HR05", // Varaždinska županija  |	Varaždin | 	county
    HR06 = "HR06", // Koprivničko-križevačka županija | 	Koprivnica-Križevci | 	county
    HR07 = "HR07", // Bjelovarsko-bilogorska županija | Bjelovar-Bilogora | county
    HR08 = "HR08", // Primorsko-goranska županija | 	Primorje-Gorski Kotar | 	county
    HR09 = "HR09", // Ličko-senjska županija  |	Lika-Senj | 	county
    HR10 = "HR10", // Virovitičko-podravska županija | 	Virovitica-Podravina | 	county
    HR11 = "HR11", // Požeško-slavonska županija | 	Požega-Slavonia | 	county
    HR12 = "HR12", // Brodsko-posavska županija | 	Brod-Posavina | 	county
    HR13 = "HR13", // Zadarska županija | 	Zadar | 	county
    HR14 = "HR14", // Osječko-baranjska županija | 	Osijek-Baranja | 	county
    HR15 = "HR15", // Šibensko-kninska županija  |	Šibenik-Knin | 	county
    HR16 = "HR16", // Vukovarsko-srijemska županija | 	Vukovar-Srijem | 	county
    HR17 = "HR17", // Splitsko-dalmatinska županija | 	Split-Dalmatia | 	county
    HR18 = "HR18", // Istarska županija | 	Istria | 	county
    HR19 = "HR19", // Dubrovačko-neretvanska županija | 	Dubrovnik-Neretva | 	county
    HR20 = "HR20", // Međimurska županija | 	Međimurje | 	county
    HR21 = "HR21", // Grad Zagreb | Zagreb City | city
}

interface RegionDropdownProps {
    onChange(newVal: MultiValue<{ label: string; value: HRRegionShortCode }>): void;
    selected: any;
}

export function parseInitialRegionParams(parseInitialParams?: string | string[]) {
    const t = useTranslations("RegionDropdown");

    const selectValues = Object.values(HRRegionShortCode)
        .map((code) => {
            return {
                label: t(code),
                value: code,
            };
        })
        .sort((a, b) => {
            return a.label.localeCompare(b.label);
        });

    if (parseInitialParams) {
        let params = parseInitialParams;
        if (typeof parseInitialParams === "string") {
            params = [parseInitialParams];
        }

        const selectedInitialValues = selectValues.filter((sv) => params.includes(sv.value));
        return selectedInitialValues;
    }
    return [];
}

export default function RegionDropdown({ onChange, selected }: RegionDropdownProps) {
    const t = useTranslations("RegionDropdown");

    const selectValues = Object.values(HRRegionShortCode)
        .map((code) => {
            return {
                label: t(code),
                value: code,
            };
        })
        .sort((a, b) => {
            return a.label.localeCompare(b.label);
        });

    return (
        <ReactSelect
            instanceId={useId()}
            isMulti
            hideSelectedOptions={false}
            closeMenuOnSelect={false}
            className={`outline-none border-none ${space_grotesk.className}`}
            options={selectValues}
            placeholder={t("select")}
            onChange={onChange}
            value={selected}
            components={{
                Option({ innerProps, children, isSelected }) {
                    return (
                        <div
                            {...innerProps}
                            className={`select-none p-1.5 flex flex-row items-center ${
                                isSelected ? "bg-emerald-500" : "hover:bg-zinc-200"
                            }`}
                        >
                            <Icon
                                name="marker"
                                height={20}
                                width={20}
                                className="fill-transparent"
                            />
                            <div className="ml-1">{children}</div>
                        </div>
                    );
                },
            }}
            classNames={{
                control() {
                    return "!bg-transparent !border !border-zinc-400 !rounded-md !shadow";
                },
                multiValue() {
                    return "!bg-zinc-300 !rounded !shadow-sm !text-sm";
                },
                menu() {
                    return "!bg-white !shadow-sm !overflow-hidden !rounded-md !border !border-zinc-300 !z-30";
                },
                menuList() {
                    return "!p-0";
                },
            }}
        />
    );
}
