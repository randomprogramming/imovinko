import React from "react";
import Typography from "../Typography";
import Link from "../Link";
import { useRouter } from "next/router";
import { useTranslations } from "next-intl";
import Icon, { IconName } from "../Icon";
import useAuthentication from "@/hooks/useAuthentication";
import Dialog from "../Dialog";

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
                    className={`${
                        iconName === "property" || iconName === "star"
                            ? "stroke-zinc-700"
                            : "fill-zinc-700"
                    }`}
                />
            )}
            <Typography bold>{title}</Typography>
        </Link>
    );
}

export default function Navigation() {
    const t = useTranslations("Navigation");

    const router = useRouter();

    const { account } = useAuthentication();

    return (
        <div
            className="lg:min-h-[420px] lg:max-w-xs flex p-2 border-2 border-zinc-300 rounded-xl flex-col space-y-1 !h-fit mb-4"
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
                to="/settings/listings"
                active={"/settings/listings" === router.pathname}
                iconName="property"
            />
            <NavigationLink
                title={t("saved")}
                to="/settings/saved"
                active={"/settings/saved" === router.pathname}
                iconName="star"
            />
            <div className="flex-1" />
            {account && !account.username && (
                <div className="mt-4">
                    <Dialog type="warning" title={t("add-username")}>
                        <Typography className="leading-5">
                            {t("add-username-message-click")}{" "}
                            <Link to="/settings">
                                <Typography variant="span" bold>
                                    {t("add-username-message-here")}
                                </Typography>
                            </Link>{" "}
                            {t("add-username-message-rest")}
                        </Typography>
                    </Dialog>
                </div>
            )}
        </div>
    );
}
