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
    experimental: {
        scrollRestoration: true,
    },
    // TODO: Remove this and fix eslint errors...
    eslint: {
        ignoreDuringBuilds: true,
    },
};

module.exports = nextConfig;
