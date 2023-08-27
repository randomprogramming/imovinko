import Icon from "./Icon";
import Searchbar from "./Searchbar";
import Button from "./Button";
import Link from "./Link";
import useAuthentication from "@/hooks/useAuthentication";
import React, { useState, useEffect } from "react";
import Typography from "./Typography";
import { useTranslations } from "next-intl";
import Notifications from "./Notifications";
import { CompanyInvitation, getNotifications } from "@/util/api";

interface AuthDropdownProps {
    lightIcons?: boolean;
}
function AuthDropdown({ lightIcons }: AuthDropdownProps) {
    const t = useTranslations("Navbar");

    const { account, logout } = useAuthentication();

    const [dropdown, setDropdown] = useState(false);

    function getAccountHandle() {
        if (!account) {
            return "";
        }

        if (account.username) {
            return account.username;
        }

        if (account.firstName && account.lastName) {
            return `${account.firstName} ${account.lastName}`;
        }

        if (account.firstName) {
            return account.firstName;
        }

        if (account.lastName) {
            return account.lastName;
        }

        return account.email;
    }

    return (
        <div className="relative">
            <Button.Transparent
                onClick={() => {
                    setDropdown(!dropdown);
                }}
                className={`${lightIcons && "hover:!bg-zinc-900 hover:!bg-opacity-75"}`}
            >
                <div className="flex flex-row space-x-2">
                    <Typography className={`${lightIcons && "text-zinc-50"}`}>
                        {getAccountHandle()}
                    </Typography>
                    <Icon name="account" className={`${lightIcons && "fill-zinc-50"}`} />
                </div>
            </Button.Transparent>
            <div
                className={`absolute right-0 w-full z-30 mt-3 transition-all duration-100 rounded-lg shadow-lg ${
                    dropdown ? "visible bg-zinc-800 top-8" : "invisible bg-transparent top-4"
                }`}
                style={{
                    minWidth: "175px",
                }}
            >
                <div className="p-2">
                    {dropdown && (
                        <div className="space-y-2">
                            <Link
                                to="/list"
                                className="w-full flex flex-row items-center justify-end space-x-2 group hover:bg-zinc-200 transition-all duration-100 p-2 rounded-lg cursor-pointer"
                            >
                                <Typography className="text-zinc-200 group-hover:text-zinc-800 transition-all select-none">
                                    {t("submit-ad")}
                                </Typography>
                                <Icon
                                    name="house-plus"
                                    className="stroke-zinc-200 group-hover:stroke-zinc-800 transition-all"
                                />
                            </Link>

                            <Link
                                to="/settings"
                                className="w-full flex flex-row items-center justify-end space-x-2 group hover:bg-zinc-200 transition-all duration-100 p-2 rounded-lg cursor-pointer"
                            >
                                <Typography className="text-zinc-200 group-hover:text-zinc-800 transition-all select-none">
                                    {t("my-account")}
                                </Typography>
                                <Icon
                                    name="account-settings"
                                    className="fill-zinc-200 group-hover:fill-zinc-800 transition-all"
                                />
                            </Link>

                            <button
                                onClick={logout}
                                className="w-full flex flex-row items-center justify-end space-x-2 group hover:bg-zinc-200 transition-all duration-100 p-2 rounded-lg cursor-pointer"
                            >
                                <Typography className="text-zinc-200 group-hover:text-zinc-800 transition-all select-none">
                                    {t("logout")}
                                </Typography>
                                <Icon
                                    name="logout"
                                    className="stroke-zinc-200 group-hover:stroke-zinc-800 transition-all"
                                />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function MobileAuthDropdown({ lightIcons }: AuthDropdownProps) {
    const { account, logout } = useAuthentication();

    const [dropdown, setDropdown] = useState(false);

    function AuthedContent() {
        const t = useTranslations("Navbar");

        return (
            <div className="space-y-2">
                <Link
                    to="/list"
                    className="w-full flex flex-row items-center justify-end space-x-2 group hover:bg-zinc-200 transition-all duration-100 p-2 rounded-lg cursor-pointer"
                >
                    <Typography className="text-zinc-200 group-hover:text-zinc-800 transition-all select-none">
                        {t("submit-ad")}
                    </Typography>
                    <Icon
                        name="house-plus"
                        className="stroke-zinc-200 group-hover:stroke-zinc-800 transition-all"
                    />
                </Link>

                <Link
                    to="/settings"
                    className="w-full flex flex-row items-center justify-end space-x-2 group hover:bg-zinc-200 transition-all duration-100 p-2 rounded-lg cursor-pointer"
                >
                    <Typography className="text-zinc-200 group-hover:text-zinc-800 transition-all select-none">
                        {t("my-account")}
                    </Typography>
                    <Icon
                        name="account-settings"
                        className="fill-zinc-200 group-hover:fill-zinc-800 transition-all"
                    />
                </Link>

                <button
                    onClick={logout}
                    className="w-full flex flex-row items-center justify-end space-x-2 group hover:bg-zinc-200 transition-all duration-100 p-2 rounded-lg cursor-pointer"
                >
                    <Typography className="text-zinc-200 group-hover:text-zinc-800 transition-all select-none">
                        {t("logout")}
                    </Typography>
                    <Icon
                        name="logout"
                        className="stroke-zinc-200 group-hover:stroke-zinc-800 transition-all"
                    />
                </button>
            </div>
        );
    }

    function UnauthedContent() {
        const t = useTranslations("Navbar");

        return (
            <div className="">
                <Link
                    to="/login"
                    className="w-full flex group hover:bg-zinc-200 transition-all duration-100 p-2 rounded-lg cursor-pointer"
                >
                    <Typography className="text-zinc-200 group-hover:text-zinc-800 transition-all select-none">
                        {t("sign-in")}
                    </Typography>
                </Link>

                <Link
                    to="/register"
                    className="w-full flex group hover:bg-zinc-200 transition-all duration-100 p-2 rounded-lg cursor-pointer"
                >
                    <Typography className="text-zinc-200 group-hover:text-zinc-800 transition-all select-none">
                        {t("sign-up")}
                    </Typography>
                </Link>
            </div>
        );
    }

    return (
        <div className="relative pl-1">
            <Button.Transparent
                className={`!p-1 !rounded-md relative ${
                    lightIcons && "hover:!bg-zinc-900 hover:!bg-opacity-75"
                }`}
                onClick={() => {
                    setDropdown(!dropdown);
                }}
            >
                <Icon
                    name="account"
                    height="30"
                    width="30"
                    className={`scale-95 origin-center ${lightIcons && "fill-zinc-50"}`}
                />
            </Button.Transparent>
            <div
                className={`absolute right-0 w-full z-30 mt-3 transition-all duration-75 rounded-lg shadow-lg ${
                    dropdown ? "visible bg-zinc-800 top-8" : "invisible bg-transparent top-4"
                }`}
                style={{
                    minWidth: "175px",
                }}
            >
                <div className="p-2">
                    {dropdown && (account ? <AuthedContent /> : <UnauthedContent />)}
                </div>
            </div>
        </div>
    );
}

interface NavbarProps {
    hideSearchBar?: boolean;
    lighterSearchbar?: boolean;
    lightIcons?: boolean;
}
export default function Navbar({ hideSearchBar, lighterSearchbar, lightIcons }: NavbarProps) {
    const t = useTranslations("Navbar");

    const auth = useAuthentication();

    const [companyInvitations, setCompanyInvitations] = useState<CompanyInvitation[] | null>(null);

    useEffect(() => {
        (async function () {
            if (companyInvitations || !auth.account) {
                return;
            }

            try {
                const notifications = await getNotifications();
                setCompanyInvitations(notifications.data);
            } catch (err) {
                console.error(err);
            }
        })();
    }, [auth.account]);

    return (
        <div className="container mx-auto flex flex-row items-center my-2 md:my-4 px-1">
            <Link to="/" className="px-1 pt-1 hidden md:block relative" disableAnimatedHover>
                <Icon name="logo-text" height="36" className={`${lightIcons && "fill-zinc-50"}`} />
                {process.env.NEXT_PUBLIC_BETA && (
                    <div className="absolute -bottom-1 right-0 rounded  bg-rose-500 translate-y-1/2 px-0.5">
                        <Typography
                            uppercase
                            bold
                            style={{
                                fontSize: "12px",
                            }}
                        >
                            Beta
                        </Typography>
                    </div>
                )}
            </Link>
            <Link to="/" className="pl-1 pr-2 md:hidden relative" disableAnimatedHover>
                <Icon name="logo" height="32" className={`${lightIcons && "fill-zinc-50"}`} />
                {process.env.NEXT_PUBLIC_BETA && (
                    <div className="absolute -bottom-1 right-0 rounded  bg-rose-500 translate-y-1/2 px-0.5">
                        <Typography
                            uppercase
                            bold
                            style={{
                                fontSize: "12px",
                            }}
                        >
                            Beta
                        </Typography>
                    </div>
                )}
            </Link>
            {hideSearchBar ? (
                // h-12 is the same height as the searchbar
                <div className="flex-1 h-12" />
            ) : (
                <Searchbar className="flex-1 ml-0.5 md:ml-2 md:mr-2" light={lighterSearchbar} />
            )}

            {/* Profile section */}
            {/* Mobile View */}
            <div className="lg:hidden flex flex-row items-center">
                {auth.account && companyInvitations && (
                    <Notifications lightIcons={lightIcons} notifications={companyInvitations} />
                )}

                <MobileAuthDropdown lightIcons={lightIcons} />
            </div>
            {/* Desktop View */}
            <div className="hidden lg:flex flex-row items-center">
                {auth.account ? (
                    <>
                        {companyInvitations && (
                            <Notifications
                                lightIcons={lightIcons}
                                notifications={companyInvitations}
                            />
                        )}
                        <AuthDropdown lightIcons={lightIcons} />
                    </>
                ) : (
                    <div className={`flex flex-row space-x-4 ${lightIcons && "text-zinc-50"}`}>
                        <Link underlineClassName={`${lightIcons && "!bg-zinc-50"}`} to="/register">
                            {t("sign-up")}
                        </Link>
                        <Link underlineClassName={`${lightIcons && "!bg-zinc-50"}`} to="/login">
                            {t("sign-in")}
                        </Link>
                    </div>
                )}
            </div>
            {/* Profile section end */}
        </div>
    );
}
