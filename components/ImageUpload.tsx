import React, { memo } from "react";
import Icon from "./Icon";
import Image from "next/image";

interface ImageUploadProps {
    inputRef: React.RefObject<HTMLInputElement>;
    images: File[];
    disabled?: boolean;
    removeImage(index: number): void;
}
function ImageUpload({ inputRef, images, disabled, removeImage }: ImageUploadProps) {
    return (
        <div className="flex flex-row space-x-6 w-full relative overflow-x-auto py-2">
            <button
                disabled={disabled}
                //         // TODO: Handle file drag and drop
                //         onDrop={(e) => {
                //             console.log("on drop");

                //             console.log(e);
                //             //prevent the browser from opening the image
                //             e.preventDefault();
                //             e.stopPropagation(); //let's grab the image file
                //             let imageFile = e.dataTransfer.files[0];
                //         }}
                //         onDragOverCapture={(e) => {
                //             console.log("on onDragOverCapture");
                //             // console.log(e);
                //         }}
                //         onDropCapture={(e) => {
                //             console.log("on onDropCapture");
                //             // console.log(e);
                //         }}
                //         onPointerDownCapture={(e) => {
                //             console.log("on onPointerDownCapture");
                //             console.log(e);
                //         }}
                //         onDragOver={(e) => {
                //             e.preventDefault();
                //             console.log(e.dataTransfer);
                //         }}
                className={`p-12 border-zinc-900 border-dashed border-4 rounded-lg transition-all ${
                    disabled ? "bg-zinc-200" : "hover:bg-zinc-300"
                }`}
                onClick={() => {
                    if (!disabled) {
                        inputRef.current?.click();
                    }
                }}
            >
                <Icon height={48} width={48} name="image-plus" />
            </button>
            {!disabled &&
                images.map((i, index) => {
                    const url = URL.createObjectURL(i);

                    return (
                        <div
                            onClick={() => {
                                removeImage(index);
                            }}
                            key={url}
                            className="cursor-pointer group min-h-full relative rounded-md overflow-hidden shadow-md"
                            style={{
                                minWidth: "152px",
                                maxWidth: "152px",
                            }}
                        >
                            <div className="z-50 absolute top-0 left-0 right-0 bottom-0 bg-zinc-400 bg-opacity-0 group-hover:bg-opacity-75">
                                <div className="group-hover:flex hidden items-center justify-center w-full h-full">
                                    <Icon
                                        name="trash"
                                        height={48}
                                        width={48}
                                        className="stroke-rose-500"
                                    />
                                </div>
                            </div>
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
