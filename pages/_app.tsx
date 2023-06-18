import "@/styles/globals.css";
import "mapbox-gl/dist/mapbox-gl.css";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import type { AppProps } from "next/app";
import { NextIntlProvider } from "next-intl";

export default function App({ Component, pageProps }: AppProps) {
    return (
        <NextIntlProvider messages={pageProps.messages}>
            <Component {...pageProps} />
        </NextIntlProvider>
    );
}
