import jwt_decode from "jwt-decode";
import { Account } from "./api";

export function decodeJwt(jwt: string) {
    return jwt_decode<Account>(jwt);
}
