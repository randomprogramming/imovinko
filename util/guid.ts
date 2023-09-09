function s4() {
    return Math.floor(Math.random() * 0xffff)
        .toString(16)
        .padStart(4, "0");
}

export default function guid() {
    return `local-${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
}
