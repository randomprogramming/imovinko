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
    let date = new Date();
    date.setTime(date.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
    const expires = "; expires=" + date.toUTCString();
    document.cookie =
        (process.env.NEXT_PUBLIC_JWT_COOKIE_NAME || "") +
        "=" +
        (value || "") +
        expires +
        "; path=/";
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
