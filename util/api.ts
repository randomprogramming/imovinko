import axios from "axios";
import { getJWTCookie } from "./cookie";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const client = axios.create({
    baseURL,
    headers: {
        Authorization: `Bearer ${getJWTCookie()}`,
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

interface LoginProps {
    handle: string;
    password: string;
}
interface LoginResponse {
    accessToken: string;
}
export async function login(data: LoginProps) {
    return await client.post<LoginResponse>("/auth/login", data);
}

export interface Account {
    id: string;
    username: string | null;
    firstName: string | null;
    lastName: string | null;
    email: string;
}
export async function getMe(): Promise<Account> {
    return await client.get("/auth/me");
}

export async function logoutRequest() {
    return await client.post("/auth/logout");
}

export const GOOGLE_REGISTER_URL = baseURL + "/auth/google";
