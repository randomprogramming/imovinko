import Navbar from "@/components/Navbar";
import { NextPageContext } from "next";
import Image from "next/image";

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
            <main className="container mx-auto">
                <div
                    className="relative w-full sm:rounded-3xl shadow-md overflow-hidden"
                    style={{ height: "30rem" }}
                >
                    <Image
                        src="/images/cover.jpeg"
                        alt="modern house"
                        fill
                        style={{
                            objectFit: "cover",
                            objectPosition: "75% 75%",
                        }}
                    />
                </div>
            </main>
        </>
    );
}
