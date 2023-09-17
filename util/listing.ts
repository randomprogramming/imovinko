import { ListingBasic } from "./api";

export function isSold(listing: ListingBasic) {
    return !!(listing.saleDate && listing.salePrice);
}

export function formatPrice(p: number) {
    return (
        p.toLocaleString(undefined, {
            maximumFractionDigits: 2,
            useGrouping: true,
            // style: "currency",
            // currency: "EUR",
        }) + " €"
    );
}
