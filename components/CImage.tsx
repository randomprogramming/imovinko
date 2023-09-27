import React from "react";
import { CldImage, CldImageProps } from "next-cloudinary";

// Cloudinary Image as we're currently using cloudinary
export default function CImage(props: CldImageProps) {
    return <CldImage {...props} />;
}
