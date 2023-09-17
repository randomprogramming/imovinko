import { ListingBasic } from "./api";

export function isSold(listing: ListingBasic) {
    return !!(listing.saleDate && listing.salePrice);
}
