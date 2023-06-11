import React, { memo } from "react";
import Icon from "./Icon";
import Image from "next/image";

interface ImageUploadProps {
    inputRef: React.RefObject<HTMLInputElement>;
    images: File[];
}
function ImageUpload({ inputRef, images }: ImageUploadProps) {
    return (
        <div className="flex flex-row space-x-6 w-full relative overflow-x-auto py-2">
            <button
                className="p-12 border-zinc-900 border-dashed border-4 rounded-lg hover:bg-zinc-300 transition-all"
                onClick={() => {
                    inputRef.current?.click();
                }}
            >
                <Icon height={48} width={48} name="image-plus" />
            </button>
            {images.map((i) => {
                const url = URL.createObjectURL(i);

                return (
                    <div
                        key={url}
                        className="min-h-full relative rounded-md overflow-hidden shadow-md"
                        style={{
                            minWidth: "152px",
                            maxWidth: "152px",
                        }}
                    >
                        <Image
                            src={url}
                            fill
                            alt="uploaded image"
                            style={{
                                objectFit: "cover",
                            }}
                        />
                    </div>
                );
            })}
        </div>
    );
}

// without the memo function, this component has massive performance issues
export default memo(ImageUpload);
