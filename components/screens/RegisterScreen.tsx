import { useTranslations } from "next-intl";
import React, { useState } from "react";
import Typography from "../Typography";
import Button from "../Button";
import Input from "../Input";
import { GOOGLE_REGISTER_URL, registerAccount } from "@/util/api";
import { useRouter } from "next/router";

export default function RegisterScreen() {
    const t = useTranslations("RegisterScreen");
    const router = useRouter();

    const [firstName, setFirstName] = useState<string | null>(null);
    const [lastName, setLastName] = useState<string | null>(null);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [isSendingRegisterReq, setIsSendingRegisterReq] = useState(false);

    // First name and last name are not required, so instead of sending an empty name, send null to the server
    function setFirstNameParsed(val: string) {
        if (val.length === 0) {
            setFirstName(null);
        } else {
            setFirstName(val);
        }
    }

    function setLastNameParsed(val: string) {
        if (val.length === 0) {
            setLastName(null);
        } else {
            setLastName(val);
        }
    }

    async function onRegister() {
        try {
            setIsSendingRegisterReq(true);
            const resp = await registerAccount({
                username,
                firstName,
                lastName,
                email,
                password,
                confirmPassword,
            });
            console.log(resp);
        } catch (e) {
            console.error(e);
        } finally {
            setIsSendingRegisterReq(false);
        }
    }

    return (
        <div className="flex-1 flex flex-row">
            <div className="flex-1 relative h-full rounded-xl overflow-hidden p-6">
                {/* TODO: REmove this and bgcolore from globals.css */}
                <div className="bgcolored w-full h-full" />
                {/* <Image
                    src="https://img.freepik.com/premium-vector/abstract-modern-background-geometric-shapes-modern-minimalist-art-print-wallpaper-templates_422344-2145.jpg?w=2000"
                    alt="abstrct"
                    fill
                /> */}
            </div>
            <div className="flex-1 flex flex-col justify-between items-center">
                <div className="px-10 py-6 w-full">
                    <Typography variant="h1">{t("sign-up")}</Typography>
                    <div className="mt-8">
                        <Button.Primary
                            icon="google"
                            label={t("sign-up-google")}
                            hollow
                            onClick={() => {
                                router.push(GOOGLE_REGISTER_URL);
                            }}
                        />
                    </div>

                    <div className="mt-10 flex flex-row">
                        <div className="flex-1">
                            <label htmlFor="firstName">
                                <Typography variant="secondary" uppercase>
                                    {t("first-name")}
                                </Typography>
                            </label>
                            <Input
                                name="firstName"
                                className="mt-1"
                                onChange={setFirstNameParsed}
                                placeholder={t("first-name-placeholder")}
                            />
                        </div>

                        {/* Spacer element */}
                        <div className="w-4" />

                        <div className="flex-1">
                            <label htmlFor="lastName">
                                <Typography variant="secondary" uppercase>
                                    {t("last-name")}
                                </Typography>
                            </label>
                            <Input
                                name="lastName"
                                className="mt-1"
                                onChange={setLastNameParsed}
                                placeholder={t("last-name-placeholder")}
                            />
                        </div>
                    </div>

                    <div className="mt-4">
                        <label htmlFor="username">
                            <Typography variant="secondary" uppercase>
                                {t("username")}
                            </Typography>
                        </label>
                        <Input
                            name="username"
                            className="mt-1"
                            onChange={setUsername}
                            placeholder="username300"
                        />
                    </div>

                    <div className="mt-4">
                        <label htmlFor="email">
                            <Typography variant="secondary" uppercase>
                                {t("email")}
                            </Typography>
                        </label>
                        <Input
                            name="email"
                            className="mt-1"
                            type="email"
                            onChange={setEmail}
                            placeholder="my.mail@gmail.com"
                        />
                    </div>

                    <div className="mt-4">
                        <label htmlFor="password">
                            <Typography variant="secondary" uppercase>
                                {t("password")}
                            </Typography>
                        </label>
                        <Input
                            name="password"
                            className="mt-1"
                            type="password"
                            onChange={setPassword}
                            placeholder={t("password")}
                        />
                    </div>

                    <div className="mt-4">
                        <label htmlFor="confirmPassword">
                            <Typography variant="secondary" uppercase>
                                {t("confirm-password")}
                            </Typography>
                        </label>
                        <Input
                            name="confirmPassword"
                            className="mt-1"
                            type="password"
                            onChange={setConfirmPassword}
                            placeholder={t("confirm-password")}
                        />
                    </div>

                    <div className="mt-6">
                        <Button.Primary
                            label={t("sign-up")}
                            onClick={onRegister}
                            loading={isSendingRegisterReq}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
