import { CompanyInvitation, answerInvitation, getNotifications } from "@/util/api";
import React, { useState, useEffect } from "react";
import Button from "./Button";
import Icon from "./Icon";
import Typography from "./Typography";
import moment from "moment";
import { useRouter } from "next/router";
import { useTranslations } from "next-intl";
import Link from "./Link";

interface NotificationsProps {
    notifications: CompanyInvitation[];
    lightIcon?: boolean;
}
export default function Notifications({ notifications, lightIcon }: NotificationsProps) {
    const [companyInvitations, setCompanyInvitations] =
        useState<CompanyInvitation[]>(notifications);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [answeringInviteId, setAnsweringInviteId] = useState<{
        id: string;
        accepted: boolean;
    } | null>(null);
    const [declinedInvitations, setDeclinedInvitations] = useState<string[]>([]);
    const router = useRouter();
    const t = useTranslations("Notifications");

    function getDayAndTime(date: Date | string) {
        if (router.locale) {
            moment.locale(router.locale);
        }
        return moment(date).format("dddd hh:mma");
    }

    function getDate(date: Date | string) {
        if (router.locale) {
            console.log(router.locale);

            moment.locale(router.locale);
        }
        return moment(date).format("ll");
    }

    async function postForInvitationAnswer(id: string, accepted: boolean) {
        setAnsweringInviteId({
            id,
            accepted,
        });
        try {
            await answerInvitation(id, accepted);
            if (accepted) {
                await router.push({
                    pathname: "/settings/company",
                });
            } else {
                setDeclinedInvitations([...declinedInvitations, id]);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setAnsweringInviteId(null);
        }
    }

    useEffect(() => {
        setTimeout(() => {
            if (!isMenuOpen && declinedInvitations.length > 0) {
                setCompanyInvitations(
                    companyInvitations.filter((i) => {
                        return !declinedInvitations.includes(i.id);
                    })
                );
                setDeclinedInvitations([]);
            }
        }, 125); // Wait for the animation to finish before removing stuff from the data
    }, [isMenuOpen]);

    return (
        <div className="md:relative">
            <Button.Transparent
                className={`!p-1 mr-1 relative ${lightIcon && "hover:bg-zinc-700"}`}
                onClick={() => {
                    setIsMenuOpen(!isMenuOpen);
                }}
            >
                {companyInvitations.length > 0 && (
                    <div className="animate-pulse absolute top-1 right-1 w-2 h-2 bg-rose-600 rounded-full"></div>
                )}
                <Icon
                    name="notification"
                    className={`${lightIcon && "fill-zinc-50"}`}
                    width={30}
                    height={30}
                />
            </Button.Transparent>
            <div
                className={`absolute bg-zinc-50 right-0 max-w-sm shadow-md z-20 rounded-xl overflow-y-auto transition-all ${
                    isMenuOpen ? "mt-4" : "invisible opacity-0"
                }`}
                style={{
                    width: "90vw",
                    maxHeight: "500px",
                }}
            >
                <div className="p-4">
                    <div className="flex flex-row items-center">
                        <Typography variant="h2">
                            {companyInvitations.length - declinedInvitations.length}{" "}
                            {companyInvitations.length - declinedInvitations.length === 1
                                ? t("notification")
                                : t("notifications")}
                        </Typography>
                        <div className="flex-1" />
                        <Button.Transparent
                            className="!p-1"
                            onClick={() => {
                                setIsMenuOpen(false);
                            }}
                        >
                            <Icon name="close" />
                        </Button.Transparent>
                    </div>
                    {companyInvitations.length > 0 ? (
                        <div className="space-y-4 mt-4">
                            {companyInvitations.map((i) => {
                                return (
                                    <div
                                        key={i.id}
                                        className={`flex flex-row transition-all max-h-64 ${
                                            declinedInvitations.includes(i.id) &&
                                            "scale-y-0 origin-top"
                                        }`}
                                    >
                                        <div>
                                            {/* TODO: Add company image */}
                                            <Icon name="account" height={32} width={32} />
                                        </div>
                                        <div className="flex flex-col px-2">
                                            <div>
                                                <Typography className="leading-5">
                                                    {/* TODO: Make this a link which leads to the company page
                                                    And then maybe make it so that the user may accept the invitation 
                                                    from the company page itself, without opening their notifications */}
                                                    <Link to={`/company/${i.company.prettyId}`}>
                                                        <Typography variant="span" bold>
                                                            {i.company.name}
                                                        </Typography>{" "}
                                                    </Link>
                                                    {t("invited-you")}
                                                </Typography>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 my-2">
                                                <Button.Decline
                                                    className="!h-10"
                                                    onClick={() => {
                                                        postForInvitationAnswer(i.id, false);
                                                    }}
                                                    loading={
                                                        answeringInviteId?.id === i.id &&
                                                        !answeringInviteId.accepted
                                                    }
                                                    disabled={
                                                        answeringInviteId?.id === i.id &&
                                                        answeringInviteId.accepted
                                                    }
                                                />
                                                <Button.Accept
                                                    className="!h-10"
                                                    onClick={() => {
                                                        postForInvitationAnswer(i.id, true);
                                                    }}
                                                    disabled={
                                                        answeringInviteId?.id === i.id &&
                                                        !answeringInviteId.accepted
                                                    }
                                                    loading={
                                                        answeringInviteId?.id === i.id &&
                                                        answeringInviteId.accepted
                                                    }
                                                />
                                            </div>
                                            <div className="flex flex-row ">
                                                <Typography
                                                    className="!tracking-normal capitalize"
                                                    variant="secondary"
                                                    font="work_sans"
                                                >
                                                    {getDayAndTime(i.createdAt)}
                                                </Typography>
                                                <div className="flex-1" />
                                                <Typography
                                                    className="!tracking-normal"
                                                    variant="secondary"
                                                    font="work_sans"
                                                >
                                                    {getDate(i.createdAt)}
                                                </Typography>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center">
                            <div className="p-4 py-8">
                                <Typography variant="secondary" uppercase>
                                    {t("none")}
                                </Typography>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
