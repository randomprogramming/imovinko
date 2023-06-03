import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// function parseJwt(token: string): Account | null {
//     if (typeof window === "undefined") return null;

//     const base64Url = token.split(".")[1];
//     const base64 = base64Url.replace("-", "+").replace("_", "/");
//     return JSON.parse(window.atob(base64));
// }

function getCookie(cookiename: string) {
    if (typeof document === "undefined") return;

    // Get name followed by anything except a semicolon
    var cookiestring = RegExp(cookiename + "=[^;]+").exec(document.cookie);
    // Return everything after the equal sign, or an empty string if the cookie name not found
    return decodeURIComponent(!!cookiestring ? cookiestring.toString().replace(/^[^=]+./, "") : "");
}
const jwt = getCookie(process.env.NEXT_PUBLIC_JWT_COOKIE_NAME || "");
const client = axios.create({
    baseURL,
    headers: {
        Authorization: `Bearer ${jwt}`,
    },
});

interface AccountRegistrationProps {
    username: string;
    firstName?: string | null;
    lastName?: string | null;
    email: string;
    password: string;
    confirmPassword: string;
}
export async function registerAccount(acc: AccountRegistrationProps) {
    return await client.post("/auth/register", acc);
}

interface Account {
    id: string;
    username: string | null;
    firstName: string | null;
    lastName: string | null;
    email: string;
}
export async function getMe(): Promise<Account> {
    return await client.get("/auth/me");
}

export const GOOGLE_REGISTER_URL = baseURL + "/auth/google";
