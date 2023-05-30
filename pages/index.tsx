import Navbar from "@/components/Navbar";
import { NextPageContext } from "next";

export async function getStaticProps(context: NextPageContext) {
    return {
        props: {
            messages: (await import(`../locales/${context.locale || "hr"}.json`)).default,
        },
    };
}

export default function Home() {
    return (
        <>
            <header>
                <Navbar />
            </header>
            <main>Hello world</main>
        </>
    );
}
