import React from "react";
import Icon from "./Icon";
import Typography from "./Typography";
import Link from "./Link";
import useAuthentication from "@/hooks/useAuthentication";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

interface FooterLinkProps {
    to: string;
    title: string;
}
function FooterLink({ to, title }: FooterLinkProps) {
    return (
        <Link to={to} className="text-left w-fit" underlineClassName="!bg-zinc-50">
            <Typography variant="span" uppercase font="work_sans">
                {title}
            </Typography>
        </Link>
    );
}

interface FooterProps {
    className?: string;
}
export default function Footer({ className }: FooterProps) {
    const { account } = useAuthentication();

    const t = useTranslations("Footer");

    const router = useRouter();

    return (
        <footer className={`bg-zinc-900 text-zinc-50 mt-12 ${className}`}>
            <div className="container mx-auto py-16">
                <div className="flex flex-col space-y-6 md:space-y-0 px-16 md:px-0 md:flex-row w-full justify-between">
                    <div className="flex flex-col">
                        <Link to="/" disableAnimatedHover>
                            <Icon className="fill-zinc-50" name="logo-text" height={40} />
                        </Link>
                    </div>
                    {!account && (
                        <div className="flex flex-col !text-left space-y-1">
                            <FooterLink to="/register" title={t("sign-up")} />
                            <FooterLink to="/login" title={t("sign-in")} />
                        </div>
                    )}
                    <div className="flex flex-col space-y-1">
                        <FooterLink to="/listings" title={t("browse")} />
                        <FooterLink to="/map" title={t("open-map")} />
                        <FooterLink to="/calculator" title={t("mortgage-calculator")} />
                        <FooterLink to="/contact" title={t("contact")} />
                        <FooterLink to="/privacy" title={t("privacy")} />
                    </div>
                    <div className="flex flex-col space-y-1">
                        <Typography variant="span" uppercase font="work_sans">
                            Jezik/Language
                        </Typography>
                        <Link
                            to={router.asPath}
                            locale="hr"
                            className="text-left w-fit"
                            underlineClassName="!bg-zinc-50"
                        >
                            <Typography variant="span" font="work_sans">
                                🇭🇷 Hrvatski
                            </Typography>
                        </Link>
                        <Link
                            to={router.asPath}
                            locale="en"
                            className="text-left w-fit"
                            underlineClassName="!bg-zinc-50"
                        >
                            <Typography variant="span" font="work_sans">
                                🇬🇧 English
                            </Typography>
                        </Link>
                    </div>
                </div>
                <div className="px-8 my-8">
                    <div className="bg-zinc-300 h-0.5 rounded-full"></div>
                </div>
                <div>
                    <Typography className="text-center">
                        Copyright © {new Date().getFullYear()} Imovinko.
                    </Typography>
                </div>
            </div>
        </footer>
    );
}
