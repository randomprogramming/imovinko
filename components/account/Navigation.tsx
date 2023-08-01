import React from "react";
import Typography from "../Typography";
import Link from "../Link";
import { useRouter } from "next/router";
import { useTranslations } from "next-intl";
import Icon, { IconName } from "../Icon";

interface NavigationLinkProps {
    title: string;
    to: string;
    active?: boolean;
    iconName?: IconName;
}
function NavigationLink({ title, active, to, iconName }: NavigationLinkProps) {
    return (
        <Link
            disableAnimatedHover
            to={to}
            className={`${
                active ? "bg-indigo-400 bg-opacity-40" : "hover:bg-zinc-300"
            } py-2 px-4 rounded-md flex flex-row transition-all space-x-2 text-zinc-700`}
        >
            {iconName && (
                <Icon
                    name={iconName}
                    className={`${iconName === "property" ? "stroke-zinc-700" : "fill-zinc-700"}`}
                />
            )}
            <Typography bold>{title}</Typography>
        </Link>
    );
}

export default function Navigation() {
    const t = useTranslations("Navigation");

    const router = useRouter();

    return (
        <>
            <div
                className="hidden md:flex p-2 border-2 border-zinc-300 rounded-xl flex-col space-y-1 !h-fit"
                style={{
                    minWidth: "260px",
                    minHeight: "420px",
                }}
            >
                <Typography variant="h2" className="mb-2 text-center">
                    {t("navigation")}
                </Typography>
                <NavigationLink
                    title={t("my-account")}
                    to="/settings"
                    active={"/settings" === router.pathname}
                    iconName="account-settings"
                />
                <NavigationLink
                    title={t("my-company")}
                    to="/settings/company"
                    active={"/settings/company" === router.pathname}
                    iconName="office"
                />
                <NavigationLink
                    title={t("my-properties")}
                    to="/settings/properties"
                    active={"/settings/properties" === router.pathname}
                    iconName="property"
                />
            </div>
            <div
                className="md:hidden flex p-2 border-2 border-zinc-300 rounded-xl flex-col space-y-1 !h-fit mb-4"
                style={{
                    minWidth: "260px",
                }}
            >
                <Typography variant="h2" className="mb-2 text-center">
                    {t("navigation")}
                </Typography>
                <NavigationLink
                    title={t("my-account")}
                    to="/settings"
                    active={"/settings" === router.pathname}
                    iconName="account-settings"
                />
                <NavigationLink
                    title={t("my-company")}
                    to="/settings/company"
                    active={"/settings/company" === router.pathname}
                    iconName="office"
                />
                <NavigationLink
                    title={t("my-properties")}
                    to="/settings/properties"
                    active={"/settings/properties" === router.pathname}
                    iconName="property"
                />
            </div>
        </>
    );
}
