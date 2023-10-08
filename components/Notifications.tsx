import { CompanyInvitation, Conversation, answerInvitation } from "@/util/api";
import React, { useState, useEffect } from "react";
import Button from "./Button";
import Icon from "./Icon";
import Typography from "./Typography";
import moment from "moment";
import { useRouter } from "next/router";
import { useTranslations } from "next-intl";
import Link from "./Link";
import Conversations from "./conversations/Conversations";
import CImage from "./CImage";

interface ConversationsScreenProps {
    conversations: Conversation[];
}
function ConversationsScreen({ conversations }: ConversationsScreenProps) {
    const t = useTranslations("Notifications");

    return (
        <div>
            {conversations.length > 0 ? (
                <div className="mt-2">
                    <Conversations conversations={conversations} />
                </div>
            ) : (
                <div className="flex items-center justify-center">
                    <div className="p-4 py-8">
                        <Typography variant="secondary" uppercase>
                            {t("none-unread")}
                        </Typography>
                    </div>
                </div>
            )}
            <div className="pt-1 pb-2 flex items-center justify-center">
                <Link className="inline-flex" underlineClassName="!bg-blue-500" to="/conversations">
                    <Typography uppercase variant="secondary" className="!text-blue-500">
                        {t("open-all-conversations")}
                    </Typography>
                </Link>
            </div>
        </div>
    );
}

interface InvitationsScreenProps {
    invitations: CompanyInvitation[];
}
function InvitationsScreen({ invitations }: InvitationsScreenProps) {
    const t = useTranslations("Notifications");

    const [answeringInviteId, setAnsweringInviteId] = useState<{
        id: string;
        accepted: boolean;
    } | null>(null);
    const [declinedInvitations, setDeclinedInvitations] = useState<string[]>([]);
    const router = useRouter();

    function getDayAndTime(date: Date | string) {
        if (router.locale) {
            moment.locale(router.locale);
        }
        return moment(date).format("dddd hh:mma");
    }

    function getDate(date: Date | string) {
        if (router.locale) {
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

    return invitations.length > 0 ? (
        <div className="space-y-4 mt-4 px-2">
            {invitations.map((i) => {
                return (
                    <div
                        key={i.id}
                        className={`flex flex-row transition-all max-h-64 ${
                            declinedInvitations.includes(i.id) && "scale-y-0 origin-top"
                        }`}
                    >
                        <div>
                            {i.company.avatarUrl ? (
                                <div className="w-12 h-12 rounded-full overflow-hidden relative">
                                    <CImage
                                        src={i.company.avatarUrl}
                                        alt="logo"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            ) : (
                                <Icon name="account" height={48} width={48} />
                            )}
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
                                        answeringInviteId?.id === i.id && answeringInviteId.accepted
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
                                        answeringInviteId?.id === i.id && answeringInviteId.accepted
                                    }
                                />
                            </div>
                            <div className="flex flex-row">
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
    );
}

interface NotificationNavigationButtonProps {
    openScreen: NotificationScreen;
    onScreenChange(newScreen: NotificationScreen): void;
    navigationFor: NotificationScreen;
    title: string;
    hasNotification: boolean;
}
function NotificationNavigationButton({
    openScreen,
    onScreenChange,
    navigationFor,
    title,
    hasNotification,
}: NotificationNavigationButtonProps) {
    return (
        <button
            disabled={openScreen === navigationFor}
            className={`relative border-b-2 transition-all px-1.5 py-0.5 outline-none text-sm ${
                openScreen === navigationFor
                    ? "!border-zinc-900"
                    : "hover:bg-zinc-300 text-zinc-500 border-none rounded-sm"
            }`}
            onClick={() => {
                if (openScreen === navigationFor) {
                    return;
                }
                onScreenChange(navigationFor);
            }}
        >
            {hasNotification && (
                <div className="animate-pulse absolute top-0 -translate-y-1/2 -right-1 w-2 h-2 bg-rose-600 rounded-full"></div>
            )}
            <Typography>{title}</Typography>
        </button>
    );
}

enum NotificationScreen {
    conversations = "conversations",
    invitations = "invitations",
}

interface NotificationsProps {
    invitations: CompanyInvitation[] | null;
    lightIcons?: boolean;
    conversations?: Conversation[] | null;
}
export default function Notifications({
    invitations,
    lightIcons,
    conversations,
}: NotificationsProps) {
    const t = useTranslations("Notifications");

    const [companyInvitations, setCompanyInvitations] = useState<CompanyInvitation[]>(
        invitations || []
    );
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const [declinedInvitations, setDeclinedInvitations] = useState<string[]>([]);
    const [openScreen, setOpenScreen] = useState(NotificationScreen.conversations);

    const Screens = {
        [NotificationScreen.invitations]: <InvitationsScreen invitations={companyInvitations} />,
        [NotificationScreen.conversations]: (
            <ConversationsScreen conversations={conversations || []} />
        ),
    };

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
                className={`!p-[3px] md:!p-1 mr-0 ml-1 md:mr-1 relative ${
                    lightIcons && "hover:!bg-zinc-900 hover:!bg-opacity-75"
                }`}
                onClick={() => {
                    setIsMenuOpen(!isMenuOpen);
                }}
            >
                {(companyInvitations.length > 0 || (conversations && conversations.length > 0)) && (
                    <div className="animate-pulse absolute top-1 right-1 w-2 h-2 bg-rose-600 rounded-full"></div>
                )}
                <Icon
                    name="notification"
                    width={30}
                    height={30}
                    className={`${lightIcons && "fill-zinc-50"}`}
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
                <div className="pl-4 pr-4 pt-4">
                    <div className="flex flex-row items-center">
                        <Typography variant="h2">{t("notifications")}</Typography>
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
                    <div className="flex flex-row space-x-2">
                        <NotificationNavigationButton
                            navigationFor={NotificationScreen.conversations}
                            onScreenChange={setOpenScreen}
                            openScreen={openScreen}
                            title={t(NotificationScreen.conversations)}
                            hasNotification={!!conversations && conversations.length > 0}
                        />
                        <NotificationNavigationButton
                            navigationFor={NotificationScreen.invitations}
                            onScreenChange={setOpenScreen}
                            openScreen={openScreen}
                            title={t(NotificationScreen.invitations)}
                            hasNotification={companyInvitations.length > 0}
                        />
                    </div>
                </div>

                {Screens[openScreen]}
            </div>
        </div>
    );
}
