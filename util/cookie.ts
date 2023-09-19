import { v4 } from "uuid";

export const MAPBOX_SESSION_COOKIE_NAME = "mapbox-imovinko-session";

function getCookie(cookiename: string) {
    if (typeof document === "undefined") return;

    // Get name followed by anything except a semicolon
    var cookiestring = RegExp(cookiename + "=[^;]+").exec(document.cookie);
    // Return everything after the equal sign, or an empty string if the cookie name not found
    return decodeURIComponent(!!cookiestring ? cookiestring.toString().replace(/^[^=]+./, "") : "");
}

function getDomain() {
    if (typeof window === "undefined") return "";
    return "." + window.location.hostname.replaceAll("www.", "");
}

function delete_cookie(cookiename: string) {
    if (typeof document === "undefined") return;
    document.cookie =
        cookiename +
        `=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax; Domain=${getDomain()}`;
}

export function getJWTCookie() {
    return getCookie(process.env.NEXT_PUBLIC_JWT_COOKIE_NAME || "");
}

export function deleteJWTCookie() {
    delete_cookie(process.env.NEXT_PUBLIC_JWT_COOKIE_NAME || "");
}

export function setJWTCookie(value: string) {
    document.cookie = serializeCookie(process.env.NEXT_PUBLIC_JWT_COOKIE_NAME || "", value, {
        sameSite: "Lax",
        path: "/",
        secure: true,
        maxAge: 60 * 60 * 24 * 30,
        domain: getDomain(),
    });
}

export function setMapboxCookie(value: string) {
    let date = new Date();
    date.setTime(date.getTime() + 31 * 24 * 60 * 60 * 1000);
    const expires = "; expires=" + date.toUTCString();
    document.cookie = MAPBOX_SESSION_COOKIE_NAME + "=" + (value || "") + expires + "; path=/";
}

export function getMapboxSessionCookie() {
    let mapboxSession = getCookie(MAPBOX_SESSION_COOKIE_NAME);
    if (!mapboxSession) {
        mapboxSession = v4();
        setMapboxCookie(mapboxSession);
    }
    return mapboxSession;
}

interface CookieOptions {
    sameSite?: "Strict" | "Lax" | "None";
    httpOnly?: boolean;
    path?: string;
    secure?: boolean;
    maxAge?: number;
    domain?: string;
}
export function serializeCookie(name: string, value: string, options?: CookieOptions) {
    let cookieVal = name + "=" + value;

    if (options?.maxAge) {
        cookieVal += "; Max-Age=" + Math.floor(options.maxAge);
    }

    if (options?.domain) {
        cookieVal += "; Domain=" + options.domain;
    }

    if (options?.path) {
        cookieVal += "; Path=" + options.path;
    }

    // if (opt.expires) {
    //     var expires = opt.expires;

    //     if (!isDate(expires) || isNaN(expires.valueOf())) {
    //         throw new TypeError("option expires is invalid");
    //     }

    //     str += "; Expires=" + expires.toUTCString();
    // }

    if (options?.httpOnly) {
        cookieVal += "; HttpOnly";
    }

    if (options?.secure) {
        cookieVal += "; Secure";
    }

    if (options?.sameSite) {
        cookieVal += `; SameSite=${options.sameSite}`;
    }

    return cookieVal;
}
