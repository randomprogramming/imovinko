import { NextPageContext } from "next";
import React from "react";

export async function getStaticProps(context: NextPageContext) {
    return {
        props: {
            messages: (await import(`../../../locales/${context.locale || "hr"}.json`)).default,
        },
    };
}

export default function ListHouse() {
    return <div>ListHouse</div>;
}
