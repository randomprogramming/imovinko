import { Html, Head, Main, NextScript } from "next/document";

interface DocumentProps {
    locale: string | undefined;
}

export default function Document({ locale }: DocumentProps) {
    return (
        <Html lang={locale || "hr"}>
            <Head />
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
