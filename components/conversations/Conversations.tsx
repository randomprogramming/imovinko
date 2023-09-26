import React from "react";
import { Account, Conversation } from "@/util/api";
import Typography from "../Typography";
import Link from "../Link";
import Icon from "../Icon";
import useAuthentication from "@/hooks/useAuthentication";
import { useTranslations } from "next-intl";
import Image from "next/image";

interface ConversationProps {
    conversations: Conversation[];
}
export default function Conversations({ conversations }: ConversationProps) {
    const t = useTranslations("Conversations");

    const { account } = useAuthentication();

    function getMessagePrefix(messageSender?: Account) {
        if (account?.id === messageSender?.id) {
            return `${t("you")}: `;
        }
    }

    return (
        <div className="w-full h-full">
            {conversations.length === 0 && (
                <Typography className="text-center my-2" bold>
                    {t("no-conversations")}
                </Typography>
            )}
            {conversations.map((c) => {
                const otherP = c.participants.filter((p) => p.id !== account?.id);
                const firstOtherP = otherP.length > 0 ? otherP.at(0) : null;

                return (
                    <Link
                        key={c.id}
                        to="/conversations"
                        query={{
                            c: c.id,
                        }}
                        className="flex flex-row hover:bg-zinc-200 px-4 py-1"
                        disableAnimatedHover
                    >
                        <div>
                            {firstOtherP && firstOtherP.avatarUrl ? (
                                <div className="w-12 h-12 rounded-full shadow-sm relative overflow-hidden">
                                    <Image
                                        alt="avatar"
                                        src={firstOtherP.avatarUrl}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            ) : (
                                <Icon name="account" height={48} width={48} />
                            )}
                        </div>
                        <div className="flex flex-col ml-1">
                            <Typography className="line-clamp-1" bold>
                                {c.title}
                            </Typography>
                            <Typography
                                bold={c.hasUnread}
                                className="line-clamp-1 text-zinc-500"
                                sm
                            >
                                {getMessagePrefix(c.lastMessage?.sender)}
                                {c.lastMessage?.content}
                            </Typography>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}
