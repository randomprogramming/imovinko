import { useState } from "react";
import { useTranslations } from "next-intl";

export interface FieldErrors {
    code: string;
    path: string[];
    message: string;
    validation?: string;
}
export type ParsedFieldErrors = Map<string, string[]>;

export default function () {
    const t = useTranslations("ErrorCodes");

    const [fieldErrors, setFieldErrors] = useState<ParsedFieldErrors | null>(null);

    function parseErrorCodes(errors: FieldErrors[]) {
        const errorCodes = new Map<string, string[]>();

        for (const e of errors) {
            if (e.code === "custom") {
                e.code = e.message; // Storing the error code in the message field if it's a custom error
            }
            if (e.code === "invalid_string" && e.validation === "email") {
                e.code = "invalid_email";
            }
            for (const path of e.path) {
                if (errorCodes.has(path)) {
                    errorCodes.set(path, [...errorCodes.get(path)!, e.code]);
                } else {
                    errorCodes.set(path, [e.code]);
                }
            }
        }
        setFieldErrors(errorCodes);
    }

    function parseErrorMessage(message: string) {
        // message should be in format err::field_name::message
        const msgSplit = message.split("::");
        if (msgSplit.length !== 3) {
            return;
        }
        const [_err, fieldName, errorMessage] = msgSplit;

        const errorCodes = new Map<string, string[]>();
        if (errorCodes.has(fieldName)) {
            errorCodes.set(fieldName, [...errorCodes.get(fieldName)!, errorMessage]);
        } else {
            errorCodes.set(fieldName, [errorMessage]);
        }

        setFieldErrors(errorCodes);
    }

    function translateCode(code: string) {
        if (code === "too_small") {
            return t("too_small");
        }
        if (code === "too_big") {
            return t("too-big");
        }
        if (code === "not_matching") {
            return t("not_matching");
        }
        if (code === "invalid_email") {
            return t("invalid_email");
        }
        if (code === "exists") {
            return t("exists");
        }
        if (code === "account_not_found") {
            return t("account_not_found");
        }

        return undefined;
    }

    function has(path: string) {
        return !!fieldErrors?.has(path);
    }

    function empty() {
        setFieldErrors(null);
    }

    function get(path: string) {
        if (has(path)) {
            return fieldErrors?.get(path)?.at(0);
        }
        return undefined;
    }

    function getTranslated(path: string) {
        const code = get(path);
        if (code) {
            return translateCode(code);
        }
        return undefined;
    }

    return {
        parseErrorCodes,
        translateCode,
        has,
        empty,
        get,
        getTranslated,
        parseErrorMessage,
    };
}
