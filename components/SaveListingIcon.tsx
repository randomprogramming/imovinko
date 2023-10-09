import React, { useState } from "react";
import Icon from "./Icon";
import Button from "./Button";
import { removeSavedListing, saveListing } from "@/util/api";
import { AxiosError } from "axios";
import Typography from "./Typography";
import useAuthentication from "@/hooks/useAuthentication";
import { useRouter } from "next/router";

interface SaveListingIconProps {
    listingId: string;
    saved?: boolean | null;
    className?: string;
    text?: string;
    iconSize?: string | number;
}
export default function SaveListingIcon({
    saved,
    listingId,
    className,
    text,
    iconSize,
}: SaveListingIconProps) {
    const [isSaved, setIsSaved] = useState<boolean>(!!saved);
    const [isFetching, setIsFetching] = useState(false);

    const { account } = useAuthentication();
    const router = useRouter();

    async function onSaveButtonClick(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        // This button will probably be absolutely positioned on top of a Link element, so stop the default
        e.stopPropagation();
        e.preventDefault();

        if (isFetching) {
            return;
        }
        if (!account) {
            await router.push("/login");
        }
        setIsFetching(true);
        try {
            if (isSaved) {
                await removeSavedListing(listingId);
                setIsSaved(false);
            } else {
                await saveListing(listingId);
                setIsSaved(true);
            }
        } catch (e) {
            console.error(e);
            if (e instanceof AxiosError && e.response?.data === "err::listing_already_saved") {
                setIsSaved(true);
            }
        } finally {
            setIsFetching(false);
        }
    }

    function getIconFill() {
        if (isFetching) {
            return "fill-zinc-400";
        } else if (isSaved) {
            return "fill-amber-300";
        } else {
            return "fill-none";
        }
    }

    return (
        <Button.Transparent onClick={onSaveButtonClick} className={`backdrop-blur-sm ${className}`}>
            <Icon
                width={iconSize}
                height={iconSize}
                name="star"
                className={`${getIconFill()} transition-all`}
            />
            {text && (
                <Typography className="ml-1" bold>
                    {text}
                </Typography>
            )}
        </Button.Transparent>
    );
}
