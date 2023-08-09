import "@/styles/globals.css";
import "mapbox-gl/dist/mapbox-gl.css";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import type { AppProps } from "next/app";
import { NextIntlProvider } from "next-intl";
import "moment/locale/hr";
import NextNProgress from "nextjs-progressbar";

export default function App({ Component, pageProps }: AppProps) {
    return (
        <NextIntlProvider messages={pageProps.messages}>
            <NextNProgress color="#3B82F6" height={4} options={{ showSpinner: false }} />
            <Component {...pageProps} />
        </NextIntlProvider>
    );
}
