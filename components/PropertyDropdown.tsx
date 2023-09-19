import { BasicApartment, BasicHouse, BasicLand, PropertyType, getMyProperties } from "@/util/api";
import React, { useEffect, useState, useRef } from "react";
import Icon from "./Icon";
import Select from "react-select";
import NoImage from "./NoImage";
import Typography from "./Typography";
import { useTranslations } from "next-intl";
import { formatDMYDate } from "@/util/date";

interface BasicPropertyCardProps {
    data: BasicApartment | BasicHouse | BasicLand;
    hideBottomBorder?: boolean;
}
function BasicPropertyCard({ data, hideBottomBorder }: BasicPropertyCardProps) {
    const t = useTranslations("PropertyDropdown");

    const thumbnail = data.media.at(0);

    function getPropertyLocationString(property: BasicApartment | BasicHouse | BasicLand) {
        const region: string | null = property.region;
        const city: string | null = property.city;
        const street: string | null = property.street;
        const address: string | null = property.address;

        let locationStr = "";
        if (street) {
            locationStr += street;
            if (address) {
                locationStr += ` ${address}`;
            }
        }
        if (city) {
            if (locationStr.length > 0) {
                locationStr += `, ${city}`;
            } else {
                locationStr += city;
            }
        }
        if (region) {
            if (locationStr.length > 0) {
                locationStr += `, ${region}`;
            } else {
                locationStr += region;
            }
        }

        return locationStr;
    }

    return (
        <div className={`flex flex-row ${!hideBottomBorder && "border-b"} border-zinc-300`}>
            <div className="w-[15%]">
                {thumbnail ? (
                    <img className="w-full h-full object-cover" src={thumbnail.url} />
                ) : (
                    <NoImage />
                )}
            </div>
            <div className="flex-1 p-1 select-none">
                <Typography sm>
                    {t("code")}:{" "}
                    <Typography variant="span" sm bold>
                        {data.customId || "-"}
                    </Typography>
                </Typography>
                <Typography sm className="text-zinc-500">
                    {getPropertyLocationString(data)}
                </Typography>
                <Typography sm>
                    {t("created")}:{" "}
                    <Typography sm variant="span" bold>
                        {formatDMYDate(data.createdAt) +
                            " " +
                            new Date(data.createdAt).toLocaleTimeString(undefined, {
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                    </Typography>
                </Typography>
            </div>
        </div>
    );
}

interface PropertyDropdownProps {
    type: PropertyType;
    onPropertyChange?(id: BasicApartment | BasicHouse | BasicLand): void;
    selectedProperty?: BasicApartment | BasicHouse | BasicLand | undefined;
}
export default function PropertyDropdown({
    type,
    onPropertyChange,
    selectedProperty,
}: PropertyDropdownProps) {
    const wasCalled = useRef(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const t = useTranslations("PropertyDropdown");

    const [isLoadingProperties, setIsLoadingProperties] = useState(false);
    const [allProperties, setAllProperties] = useState<{
        [PropertyType.apartment]?: BasicApartment[];
        [PropertyType.house]?: BasicHouse[];
        [PropertyType.land]?: BasicLand[];
    }>({});

    async function getProperties() {
        setIsLoadingProperties(true);
        try {
            if (type === PropertyType.apartment) {
                const apartments = await getMyProperties(PropertyType.apartment);
                setAllProperties({ apartment: apartments });
            } else if (type === PropertyType.house) {
                const houses = await getMyProperties(PropertyType.house);
                setAllProperties({ house: houses });
            } else {
                const land = await getMyProperties(PropertyType.land);
                setAllProperties({ land });
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoadingProperties(false);
        }
    }

    useEffect(() => {
        // For some reason this component sometimes renders twice and therefore call the API twice..
        // Solution from: https://stackoverflow.com/questions/53120972/how-to-call-loading-function-with-react-useeffect-only-once
        if (wasCalled.current) return;
        wasCalled.current = true;

        if (!isLoadingProperties) {
            getProperties();
        }
    }, []);

    return isLoadingProperties || !allProperties[type] ? (
        <Icon name="loading" />
    ) : (
        <Select
            value={selectedProperty}
            menuIsOpen={isDropdownOpen}
            onMenuOpen={() => {
                setIsDropdownOpen(true);
            }}
            onMenuClose={() => {
                setIsDropdownOpen(false);
            }}
            onChange={(newVal) => {
                if (newVal && onPropertyChange) {
                    onPropertyChange(newVal);
                }
            }}
            className="z-20 shadow-sm"
            options={allProperties[type]}
            isSearchable={false}
            noOptionsMessage={() => {
                return <Typography>{t("no-options")}</Typography>;
            }}
            components={{
                Placeholder: () => {
                    return (
                        <Typography className="select-none text-zinc-400 pl-2">
                            {t("choose")}
                        </Typography>
                    );
                },
                SingleValue: ({ data, innerProps }) => {
                    return (
                        <div {...innerProps} className="w-full h-full">
                            <BasicPropertyCard hideBottomBorder data={data} />
                        </div>
                    );
                },
                ValueContainer: ({ children }) => {
                    return <div className="flex flex-row flex-1 items-center">{children}</div>;
                },
                Control: ({ children }) => {
                    return (
                        <div
                            onClick={() => {
                                setIsDropdownOpen(!isDropdownOpen);
                            }}
                            className="flex flex-row bg-zinc-50 rounded overflow-hidden border-2 border-zinc-200 hover:border-blue-500"
                        >
                            {children}
                        </div>
                    );
                },
                Option: ({ data, selectOption }) => {
                    return (
                        <div
                            onClick={() => {
                                selectOption(data);
                            }}
                            className="bg-zinc-50 hover:bg-zinc-200 first:border-t"
                        >
                            <BasicPropertyCard data={data} />
                        </div>
                    );
                },
            }}
        />
    );
}
