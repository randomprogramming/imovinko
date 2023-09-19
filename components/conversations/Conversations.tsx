import React from "react";
import { Account, Conversation } from "@/util/api";
import Typography from "../Typography";
import Link from "../Link";
import Icon from "../Icon";
import useAuthentication from "@/hooks/useAuthentication";
import { useTranslations } from "next-intl";

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
                            {/* TODO: Add image here: */}
                            <Icon name="account" height={48} width={48} />
                        </div>
                        <div className="flex flex-col">
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
