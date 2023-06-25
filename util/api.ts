import axios from "axios";
import { getJWTCookie } from "./cookie";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
export const GOOGLE_REGISTER_URL = baseURL + "/auth/google";

// We can't use this in axios.create because it sometimes doesn't register the cookie changes after login, so you get 401 responses until you refresh the page
function getAuthHeaders() {
    return {
        Authorization: `Bearer ${getJWTCookie()}`,
    };
}

const client = axios.create({
    baseURL,
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
    return await client({
        method: "POST",
        data: acc,
        url: "/auth/register",
    });
}

export enum OfferingType {
    shortTermRent = "shortTermRent",
    longTermRent = "longTermRent",
    sale = "sale",
}

export enum PropertyType {
    apartment = "apartment",
    house = "house",
    land = "land",
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
export async function getMe() {
    return await client<Account>({
        url: "/auth/me",
        headers: {
            ...getAuthHeaders(),
        },
    });
}

export interface Coordinates {
    lat: number;
    lon: number;
}
export async function geocode(query: string) {
    return await client.get<Coordinates | null>("/geocode/", { params: { query } });
}

export enum ListingFor {
    apartment = "apartment",
    house = "house",
    land = "land",
}

interface CreateListingData {
    listingFor: ListingFor;

    isForSale?: boolean;
    saleListingTitle?: string;
    saleListingPrice?: number;
    saleListingDescription?: string;

    isForShortTermRent?: boolean;
    shortTermListingTitle?: string;
    shortTermListingPrice?: number;
    shortTermListingDescription?: string;

    isForLongTermRent?: boolean;
    longTermListingTitle?: string;
    longTermListingPrice?: number;
    longTermListingDescription?: string;

    lat: number;
    lon: number;
    area: number;

    bedroomCount?: number | null;
    bathroomCount?: number | null;
    parkingSpaceCount?: number | null;
}
interface CreateListingResponse {
    id: string;
    listingFor: ListingFor;
}
export async function createListing(data: CreateListingData) {
    return await client<CreateListingResponse>({
        url: "/listing/submit",
        method: "POST",
        data,
        headers: {
            ...getAuthHeaders(),
        },
    });
}

interface CloudinaryAuthData {
    signature: string;
    timestamp: number;
    cloudname: string;
    api_key: string;
}
export async function getCloudinaryAuth() {
    return await client<CloudinaryAuthData>({
        url: "/auth/cloudinary",
        method: "GET",
        headers: {
            ...getAuthHeaders(),
        },
    });
}

// Uploads the images to cloudinary and returns the url for each of them
export async function uploadMedia(images: File[]): Promise<string[]> {
    const imageUrls: string[] = [];
    if (images.length > 0) {
        const aut = await getCloudinaryAuth();
        const url = "https://api.cloudinary.com/v1_1/" + aut.data.cloudname + "/auto/upload";
        for (const img of images) {
            const formData = new FormData();
            formData.append("file", img);
            formData.append("api_key", aut.data.api_key);
            formData.append("timestamp", aut.data.timestamp + "");
            formData.append("signature", aut.data.signature);
            formData.append("format", "jpg");
            try {
                const resp = await axios.post(url, formData);
                if (resp.data.url?.length) {
                    imageUrls.push(resp.data.url);
                }
            } catch (e) {
                console.log("Error while uploading image:");
                console.error(e);
            }
        }
    }
    return imageUrls;
}

interface PatchPropertyMediaData {
    id: string;
    listingFor: ListingFor;
    media: string[];
}
export async function patchPropertyMedia(data: PatchPropertyMediaData) {
    return client({
        method: "PATCH",
        url: "/listing/property-media",
        data,
        headers: {
            ...getAuthHeaders(),
        },
    });
}

interface BoundingBox {
    nwlng: number;
    nwlat: number;
    selng: number;
    selat: number;
}
interface BasicProperty extends PropertyLocation {
    latitude: number;
    longitude: number;
    media: {
        url: string;
    }[];
}
export interface ListingOnMap {
    prettyId: string;
    title: string;
    price: number;
    description: string;
    apartment: BasicProperty | null;
    house: BasicProperty | null;
    land: BasicProperty | null;
    offeringType: OfferingType;
}
export async function findListingsByBoundingBox(
    boundingBox: BoundingBox,
    propertyType: PropertyType[],
    offeringType: OfferingType[]
) {
    return await client<ListingOnMap[]>({
        url: "/listing/",
        method: "GET",
        params: {
            ...boundingBox,
            propertyType: propertyType.join(","),
            offeringType: offeringType.join(","),
        },
    });
}
export interface PropertyLocation {
    country: string | null;
    region: string | null; // županija
    city: string | null;
    postcode: string | null;
    street: string | null;
    address: string | null;
}
export interface Media {
    url: string;
}
export interface Apartment extends PropertyLocation {
    id: string;
    latitude: number;
    longitude: number;
    surfaceArea: number;
    ownerId: string;
    createdAt: string | Date;
    updatedAt: string | Date;
    owner: Omit<Account, "email">;
    media: {
        url: string;
    }[];
    bedroomCount: number | null;
    bathroomCount: number | null;
    parkingSpaceCount: number | null;
}
export interface House extends PropertyLocation {
    id: string;
    latitude: number;
    longitude: number;
    surfaceArea: number;
    ownerId: string;
    createdAt: string | Date;
    updatedAt: string | Date;
    owner: Omit<Account, "email">;
    media: {
        url: string;
    }[];
    bedroomCount: number | null;
    bathroomCount: number | null;
    parkingSpaceCount: number | null;
}
interface Land extends PropertyLocation {
    id: string;
    latitude: number;
    longitude: number;
    surfaceArea: number;
    ownerId: string;
    createdAt: string | Date;
    updatedAt: string | Date;
    owner: Omit<Account, "email">;
    media: Media[];
}
export interface Listing {
    id: string;
    title: string;
    description: string;
    offeringType: OfferingType;
    price: number;
    houseId: string | null;
    apartmentId: string | null;
    landId: string | null;
    createdAt: string | Date;
    updatedAt: string | Date;
    apartment: Apartment | null;
    house: House | null;
    land: Land | null;
}
export async function findListing(id: string) {
    return await client<Listing>({
        url: `/listing/${id}`,
        method: "GET",
    });
}
