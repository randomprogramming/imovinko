import React, { memo } from "react";
import Icon from "./Icon";
import Image from "next/image";

interface ImageUploadProps {
    inputRef: React.RefObject<HTMLInputElement>;
    images: File[];
    disabled?: boolean;
}
function ImageUpload({ inputRef, images, disabled }: ImageUploadProps) {
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
            {/* TODO: add ability to remove image when clicking on it */}
            {!disabled &&
                images.map((i) => {
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
