import moment from "moment";

export function formatDMYDate(date?: string | Date | null | number) {
    if (date) {
        return moment(date).format("L").replaceAll("/", ".");
    }
    return "";
}
