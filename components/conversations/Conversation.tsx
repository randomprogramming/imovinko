import { Account, Conversation, getConversationMessages, Message, sendMessage } from "@/util/api";
import { space_grotesk } from "@/util/fonts";
import { useRouter } from "next/router";
import React, { useEffect, useState, useRef } from "react";
import Icon from "../Icon";
import guid from "@/util/guid";
import useAuthentication from "@/hooks/useAuthentication";
import Typography from "../Typography";
import { useTranslations } from "next-intl";
import ListingListItem from "../listing/ListingListItem";
import Button from "../Button";
import Modal from "../Modal";
import Link from "../Link";
import CImage from "../CImage";

interface MessageStateComponentProps {
    state?: MessageState | null;
}
function MessageStateComponent({ state }: MessageStateComponentProps) {
    if (state === MessageState.loading) {
        return <Icon height={16} width={16} name="loading" />;
    } else if (state === MessageState.sent) {
        return <Icon height={16} width={16} name="checkmark" className="stroke-emerald-200" />;
    } else if (state === MessageState.error) {
        return <Icon height={16} width={16} name="error" className="fill-red-400" />;
    } else {
        return <div />;
    }
}

enum MessageState {
    loading = "l",
    sent = "s",
    error = "e",
}

interface ConversationProps {
    allConversations: Conversation[];
}
export default function Conversation({ allConversations }: ConversationProps) {
    const t = useTranslations("Conversations");

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const router = useRouter();

    const [openConversation, setOpenConversation] = useState<Conversation>();
    const [conversationPage, setConversationPage] = useState(1);
    const [maxPage, setMaxPage] = useState<number>();
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [activeConversationId, setActiveConversationId] = useState<string>();
    const [conversationMessages, setConversationMessages] = useState<Message[]>([]);
    const [messageContent, setMessageContent] = useState("");
    // Keep track of the state of local messages (sending, sent, error[not sent])
    // TODO: Use reducer or something else since this easily breaks when sending multiple messages
    const [localMessagesState, setLocalMessagesState] = useState<{
        [id: string]: MessageState;
    }>({});
    const [showConversationInfoModal, setshowConversationInfoModal] = useState(false);

    const { account } = useAuthentication();

    function resetState() {
        setConversationPage(1);
        setMaxPage(undefined);
        setConversationMessages([]);
        setMessageContent("");
        setLocalMessagesState({});
        setActiveConversationId(undefined);
    }

    function getAccountHandle(account: Account) {
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

    async function postMessage() {
        if (!messageContent || messageContent.length <= 0) {
            return;
        }
        const generatedId = guid();
        if (activeConversationId && account) {
            const content = messageContent;
            setMessageContent("");

            try {
                setLocalMessagesState({
                    ...localMessagesState,
                    [generatedId]: MessageState.loading,
                });
                setConversationMessages([
                    { content, id: generatedId, senderId: account.id },
                    ...conversationMessages,
                ]);
                await sendMessage({
                    conversationId: activeConversationId,
                    content,
                });
            } catch (err) {
                console.error(err);
                setLocalMessagesState({ ...localMessagesState, [generatedId]: MessageState.error });
            } finally {
                // There should only be one message with the "sent" status
                // Filter out all other messages that are "sent"
                const newState = Object.keys(localMessagesState)
                    .filter((key) => localMessagesState[key] !== MessageState.sent)
                    .reduce((cur, key) => {
                        return Object.assign(cur, { [key]: localMessagesState[key] });
                    }, {});
                setLocalMessagesState({ ...newState, [generatedId]: MessageState.sent });
            }
        }
    }

    async function fetchConversationMessages(page?: number) {
        if (activeConversationId) {
            setIsLoadingMessages(true);
            try {
                const { data } = await getConversationMessages(activeConversationId, page);

                setConversationMessages([...conversationMessages, ...data.data]);
                setConversationPage(data.page);
                setMaxPage(data.totalPages);
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoadingMessages(false);
            }
        }
    }

    function onChatContainerScroll(e: React.UIEvent<HTMLDivElement, UIEvent>) {
        // Dont fetch more messages if we're at the last page
        if (maxPage && conversationPage >= maxPage) {
            return;
        }
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

        const scrollTopAbs = Math.abs(scrollTop);

        const isNearBottom = scrollTopAbs + clientHeight >= scrollHeight * 0.9;

        if (isNearBottom && !isLoadingMessages) {
            fetchConversationMessages(conversationPage + 1);
        }
    }

    useEffect(() => {
        fetchConversationMessages();
    }, [activeConversationId]);

    useEffect(() => {
        if (router.query.c === activeConversationId) {
            return;
        }
        resetState();
        if (typeof router.query.c === "string") {
            setActiveConversationId(router.query.c);
            setOpenConversation(allConversations.find((c) => c.id === router.query.c));
        }
    }, [router.query]);

    useEffect(() => {
        if (textareaRef && textareaRef.current) {
            textareaRef.current.style.height = "0px";
            const scrollHeight = Math.min(textareaRef.current.scrollHeight, 112);

            textareaRef.current.style.height = scrollHeight + "px";
        }
    }, [messageContent, textareaRef]);

    if (!account) {
        return (
            <div className="w-full flex flex-col items-center justify-center bg-white rounded-md shadow-sm h-[55vh]">
                <Icon name="loading" />
            </div>
        );
    }

    const otherP = openConversation?.participants.filter((p) => p.id !== account?.id);
    const firstOtherP = otherP && otherP.length > 0 ? otherP.at(0) : null;

    return (
        <div className="w-full flex flex-col bg-white rounded-md shadow-sm h-[65vh]">
            <Modal
                small
                show={showConversationInfoModal}
                onClose={() => {
                    setshowConversationInfoModal(false);
                }}
            >
                <div className="flex flex-col p-4 relative">
                    <div className="absolute top-4 right-4">
                        <Button.Transparent
                            onClick={() => {
                                setshowConversationInfoModal(false);
                            }}
                        >
                            <Icon name="close" />
                        </Button.Transparent>
                    </div>
                    <Typography variant="h2">{t("conversation-members")}</Typography>
                    <div className="space-y-2">
                        {openConversation?.participants.map((p) => {
                            return (
                                <div key={p.id} className="flex flex-row items-center">
                                    <div className="relative w-10 h-10 flex items-center justify-center rounded-full overflow-hidden shadow-sm">
                                        {p.avatarUrl ? (
                                            <CImage
                                                src={p.avatarUrl}
                                                alt="account image"
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <Icon
                                                name="account"
                                                height={40}
                                                width={40}
                                                className="scale-105"
                                            />
                                        )}
                                    </div>
                                    <div className="ml-1">
                                        {p.username ? (
                                            <Link className="flex" to={`/account/${p.username}`}>
                                                <Typography>{getAccountHandle(p)}</Typography>
                                            </Link>
                                        ) : (
                                            <Typography>{getAccountHandle(p)}</Typography>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {openConversation?.listing && (
                        <div className="mt-6">
                            <Typography variant="h2">{t("listing")}</Typography>
                            <ListingListItem
                                hideIconRow
                                className="!shadow-none border border-zinc-300"
                                listing={openConversation.listing}
                            />
                        </div>
                    )}
                </div>
            </Modal>
            <div className="border-b border-zinc-200 flex flex-row">
                {openConversation && (
                    <div className="py-2 ml-2">
                        {firstOtherP && firstOtherP.avatarUrl ? (
                            <div className="w-12 h-12 rounded-full shadow-sm relative overflow-hidden">
                                <CImage
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
                )}
                {openConversation && (
                    <div className="ml-2 self-center">
                        <Typography variant="h2">{openConversation.title}</Typography>
                        {openConversation.participants.length > 2 && (
                            <Typography variant="secondary" uppercase>
                                {openConversation.participants.length} {t("participants")}
                            </Typography>
                        )}
                    </div>
                )}
                {activeConversationId && (
                    <div className="self-center ml-auto mr-4">
                        <Button.Transparent
                            className="!p-1"
                            onClick={() => {
                                setshowConversationInfoModal(true);
                            }}
                        >
                            <Icon name="help" height={32} width={32} />
                        </Button.Transparent>
                    </div>
                )}
            </div>
            <div
                className="flex-1 overflow-y-auto flex flex-col-reverse"
                onScroll={onChatContainerScroll}
            >
                {/* Messages are ordered from newest to oldest when returned */}
                {activeConversationId ? (
                    conversationMessages.map((m) => {
                        return (
                            <div key={m.id} className="first:mb-2 flex flex-row mt-1">
                                <div className="w-10"></div>
                                <div className="flex-1">
                                    <div
                                        className={`w-fit px-2 py-1 rounded shadow-sm ${
                                            m.senderId === account.id
                                                ? "bg-indigo-700 text-white ml-auto"
                                                : "bg-[#ececec] mr-auto"
                                        }`}
                                    >
                                        <Typography>{m.content}</Typography>
                                    </div>
                                </div>
                                <div className="w-8 flex flex-col">
                                    <div className="mt-auto ml-0.5">
                                        <MessageStateComponent state={localMessagesState[m.id]} />
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="self-center mb-auto mt-10">
                        <Typography bold>{t("choose-conversation")}</Typography>
                    </div>
                )}
                {!isLoadingMessages &&
                    openConversation?.listing &&
                    conversationPage === maxPage && (
                        <div className="h-auto md:h-64 mb-auto">
                            <ListingListItem
                                showCustomId
                                className="!rounded-none !bg-transparent !shadow-none border-b border-zinc-200 mb-12"
                                hideIconRow
                                listing={openConversation.listing}
                            />
                        </div>
                    )}
                {isLoadingMessages && (
                    <div className="w-full flex items-center justify-center my-1">
                        <Icon name="loading" className="stroke-zinc-900" />
                    </div>
                )}
            </div>
            <div className="flex flex-row p-3 border-t border-zinc-200">
                <textarea
                    placeholder={t("enter-message")}
                    style={{
                        height: "40px",
                    }}
                    ref={textareaRef}
                    onKeyDown={(e) => {
                        if (e.code === "Enter") {
                            if (!e.shiftKey && !e.ctrlKey && !e.altKey && !e.shiftKey) {
                                postMessage();
                                e.preventDefault();
                            }
                        }
                    }}
                    value={messageContent}
                    onChange={(e) => {
                        setMessageContent(e.target.value);
                    }}
                    disabled={!activeConversationId}
                    className={`${space_grotesk.className} resize-none outline-none border-none shadow-sm bg-[#ececec] flex-1 px-4 py-2 rounded`}
                ></textarea>
                <button
                    disabled={!messageContent || messageContent.length <= 0}
                    onClick={postMessage}
                    className="self-end ml-2 rounded shadow-sm bg-indigo-700 hover:bg-indigo-600 disabled:bg-zinc-500 transition-all aspect-square max-h-[40px] flex items-center justify-center p-2"
                >
                    <Icon name="send" className="stroke-white" />
                </button>
            </div>
        </div>
    );
}
