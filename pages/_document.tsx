import { Html, Head, Main, NextScript } from "next/document";

interface DocumentProps {
    locale: string | undefined;
}

export default function Document({ locale }: DocumentProps) {
    return (
        <Html lang={locale || "hr"}>
            <Head>
                <title>Imovinko</title>
                <meta name="description" content="Kupuj i prodaj nekretnine" />
                <meta property="og:title" content="Imovinko" />
                <meta property="og:description" content="Kupuj i prodaj nekretnine" />
                <meta property="og:url" content="https://www.imovinko.com" />
                <meta property="og:image" content="https://www.imovinko.com/images/logo.png" />
                <meta property="og:site_name" content="Imovinko" />
                <meta name="twitter:card" content="summary_large_image" />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
