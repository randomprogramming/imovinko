import { GetServerSideProps } from "next";
import React from "react";

export const getServerSideProps: GetServerSideProps = async ({ params, locale }) => {
    console.log(params?.prettyId);

    return {
        props: {
            messages: (await import(`../../locales/${locale || "hr"}.json`)).default,
        },
    };
};

export default function CompanyByPrettyIdPage() {
    return <div>CompanyByPrettyIdPage</div>;
}
