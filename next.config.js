/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    i18n: {
        locales: ["hr", "en"],
        defaultLocale: "hr",
        localeDetection: false,
    },
};

module.exports = nextConfig;
