export function formatMoney(value) {
    return `¥${Number(value ?? 0).toFixed(2)}`;
}
export function formatDateTime(value) {
    if (!value) {
        return "-";
    }
    return new Intl.DateTimeFormat("zh-CN", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
    }).format(new Date(value));
}
export function formatDate(value) {
    if (!value) {
        return "-";
    }
    return new Intl.DateTimeFormat("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).format(new Date(value));
}
export function fallback(value) {
    return value === undefined || value === null || value === "" ? "-" : String(value);
}
