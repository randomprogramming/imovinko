/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    i18n: {
        locales: ["hr", "en"],
        defaultLocale: "hr",
        localeDetection: false,
    },
    images: {
        domains: ["res.cloudinary.com"],
    },
};

module.exports = nextConfig;
