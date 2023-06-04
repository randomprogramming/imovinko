import { Account, logoutRequest } from "@/util/api";
import { deleteJWTCookie, getJWTCookie } from "@/util/cookie";
import { decodeJwt } from "@/util/jwt";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function () {
    const [account, setAccount] = useState<null | Account>(null);
    const [jwt, setJwt] = useState(getJWTCookie());

    const router = useRouter();

    function logout() {
        deleteJWTCookie();

        if (router.pathname === "/") {
            router.reload();
        } else {
            router.push("/");
        }
    }

    useEffect(() => {
        if (jwt) {
            setAccount(decodeJwt(jwt));
        }
    }, [jwt]);

    if (!jwt || !jwt.length) {
        return {
            account: null,
            logout,
        };
    }

    return {
        account,
        logout,
    };
}
