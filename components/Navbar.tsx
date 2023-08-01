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
    useLighterColorsOnSmallDevice?: boolean;
}
function AuthDropdown({ useLighterColorsOnSmallDevice }: AuthDropdownProps) {
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
                className={useLighterColorsOnSmallDevice ? "hover:bg-zinc-700" : ""}
            >
                <div className="flex flex-row space-x-2">
                    <Typography className={`${useLighterColorsOnSmallDevice && "text-zinc-50"}`}>
                        {getAccountHandle()}
                    </Typography>
                    <Icon
                        className={`${useLighterColorsOnSmallDevice && "fill-zinc-50"}`}
                        name="account"
                    />
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

function MobileAuthDropdown({ useLighterColorsOnSmallDevice }: AuthDropdownProps) {
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
        <div className="relative">
            <Button.Transparent
                className="hover:!bg-zinc-800 !px-1 md:!p-1"
                onClick={() => {
                    setDropdown(!dropdown);
                }}
            >
                <Icon
                    name="account"
                    className={`${useLighterColorsOnSmallDevice && "fill-zinc-50"}`}
                    height="26"
                    width="26"
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
    useLighterColorsOnSmallDevice?: boolean;
}
export default function Navbar({
    hideSearchBar,
    lighterSearchbar,
    useLighterColorsOnSmallDevice,
}: NavbarProps) {
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
        <div className="container mx-auto flex flex-row items-center my-4 px-1">
            <Link to="/" className="px-1 pt-1 hidden md:block" disableAnimatedHover>
                <Icon name="logo-text" height="36" />
            </Link>
            <Link to="/" className="md:hidden" disableAnimatedHover>
                <Icon
                    name="logo"
                    className={`${useLighterColorsOnSmallDevice && "fill-zinc-50"}`}
                    height="32"
                />
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
                    <Notifications
                        lightIcon={useLighterColorsOnSmallDevice}
                        notifications={companyInvitations}
                    />
                )}

                <MobileAuthDropdown useLighterColorsOnSmallDevice={useLighterColorsOnSmallDevice} />
            </div>
            {/* Desktop View */}
            <div className="hidden lg:flex flex-row items-center">
                {auth.account ? (
                    <>
                        {companyInvitations && (
                            <Notifications
                                lightIcon={useLighterColorsOnSmallDevice}
                                notifications={companyInvitations}
                            />
                        )}
                        <AuthDropdown
                            useLighterColorsOnSmallDevice={useLighterColorsOnSmallDevice}
                        />
                    </>
                ) : (
                    <div
                        className={`flex flex-row space-x-4 ${
                            useLighterColorsOnSmallDevice && "text-zinc-50"
                        }`}
                    >
                        <Link
                            underlineClassName={`${useLighterColorsOnSmallDevice && "!bg-zinc-50"}`}
                            to="/register"
                        >
                            {t("sign-up")}
                        </Link>
                        <Link
                            underlineClassName={`${useLighterColorsOnSmallDevice && "!bg-zinc-50"}`}
                            to="/login"
                        >
                            {t("sign-in")}
                        </Link>
                    </div>
                )}
            </div>
            {/* Profile section end */}
        </div>
    );
}
