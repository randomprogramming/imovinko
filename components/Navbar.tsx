import Icon from "./Icon";
import Searchbar from "./Searchbar";
import Button from "./Button";
import Link from "./Link";
import useAuthentication from "@/hooks/useAuthentication";
import React, { useState } from "react";
import Typography from "./Typography";
import { useTranslations } from "next-intl";

function AuthDropdown() {
    const t = useTranslations("AuthDropdown");

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
            >
                <div className="flex flex-row space-x-2">
                    <Typography>{getAccountHandle()}</Typography>
                    <Icon name="account" />
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

interface NavbarProps {
    hideSearchBar?: boolean;
}
export default function Navbar({ hideSearchBar }: NavbarProps) {
    const auth = useAuthentication();

    return (
        <div className="container mx-auto flex flex-row items-center my-4">
            <Link to="/" className="px-1 pt-1 hidden md:block">
                <Icon name="logo-text" height="36" />
            </Link>
            <Link to="/" className="md:hidden">
                <Icon name="logo" height="36" />
            </Link>
            {hideSearchBar ? (
                // h-12 is the same height as the searchbar
                <div className="flex-1 h-12" />
            ) : (
                <Searchbar className="flex-1 mx-4" />
            )}

            {/* Profile section */}
            {/* Mobile View */}
            <div className="lg:hidden">
                <Button.Transparent
                    onClick={() => {
                        console.log("clickyy");
                    }}
                >
                    <Icon name="account" height="26" width="26" />
                </Button.Transparent>
            </div>
            {/* Desktop View */}
            <div className="hidden lg:flex flex-row">
                {auth.account ? (
                    <AuthDropdown />
                ) : (
                    <div className="flex flex-row">
                        <Link to="/register">Sign Up</Link>
                        <Link to="/login">Log In</Link>
                    </div>
                )}
            </div>
            {/* Profile section end */}
        </div>
    );
}
