import "@/styles/globals.css";
import "mapbox-gl/dist/mapbox-gl.css";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import "react-phone-input-2/lib/style.css";
import "moment/locale/hr";
import type { AppProps } from "next/app";
import { NextIntlProvider } from "next-intl";
import NextNProgress from "nextjs-progressbar";
import React, { useEffect } from "react";
import { useRouter } from "next/router";

export default function App({ Component, pageProps }: AppProps) {
    const router = useRouter();

    useEffect(() => {
        // The "Modal" component disables overflow on the body when it is mounted, but if you
        // click on a link inside a Modal, it sometimes gets stuck on overflow hidden..
        document.body.style.overflow = "unset";
    }, [router.asPath]);

    return (
        <NextIntlProvider messages={pageProps.messages}>
            <NextNProgress color="#3B82F6" height={4} options={{ showSpinner: false }} />
            <Component {...pageProps} />
        </NextIntlProvider>
    );
}
