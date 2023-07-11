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
    surfaceArea: number;
    bedroomCount: number | null;
    bathroomCount: number | null;
    parkingSpaceCount: number | null;
}
export interface ListingBasic {
    prettyId: string;
    title: string;
    price: number;
    description: string;
    apartment: BasicProperty | null;
    house: BasicProperty | null;
    land: BasicProperty | null;
    offeringType: OfferingType;
    createdAt: string | Date;
}
export interface PaginatedListingBasic {
    data: ListingBasic[];
    page: number;
    totalPages: number;
    pageSize: number;
    count: number;
}
export async function findListingsByBoundingBox(
    boundingBox: BoundingBox,
    propertyType: PropertyType[],
    offeringType: OfferingType[]
) {
    return (
        await client<PaginatedListingBasic>({
            url: "/listing/",
            method: "GET",
            params: {
                ...boundingBox,
                propertyType: propertyType.join(","),
                offeringType: offeringType.join(","),
                pageSize: 100, // Since no pagination is neccessary here, just request the maximum number of listings
            },
        })
    ).data;
}
export async function findListingsByQuery(
    propertyType: PropertyType[],
    offeringType: OfferingType[],
    page?: number | string,
    priceFrom?: number | string,
    priceTo?: number | string,
    sortBy?: string,
    sortDirection?: "asc" | "desc"
) {
    return await client<PaginatedListingBasic>({
        url: "/listing/",
        method: "GET",
        params: {
            propertyType: propertyType.join(","),
            offeringType: offeringType.join(","),
            page,
            priceFrom,
            priceTo,
            sortBy,
            sortDirection,
        },
    });
}
export interface BasicCompany {
    prettyId: string;
    name: string;
    storeName?: string | null;
}
export interface PropertyLocation {
    country: string | null;
    region: string | null; // županija
    city: string | null;
    postcode: string | null;
    street: string | null;
    address: string | null;
}
export interface FullAccount extends Account {
    createdAt: string | Date;
    companies: {
        company: BasicCompany;
    }[];
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
    owner: Omit<FullAccount, "email">;
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
    owner: Omit<FullAccount, "email">;
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
    owner: Omit<FullAccount, "email">;
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
    viewCount: number;
}
export async function findListing(id: string) {
    return await client<Listing>({
        url: `/listing/${id}`,
        method: "GET",
    });
}

export interface MyAccount {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    username: string | null;
    createdAt: Date | string;
}
export async function getMyAccount(jwt?: string) {
    const headers = getAuthHeaders();
    if (jwt) {
        headers.Authorization = `Bearer ${jwt}`;
    }
    return await client<MyAccount>({
        url: "/account/",
        method: "GET",
        headers: {
            ...headers,
        },
    });
}

export interface PatchMyAccountBody {
    username?: string;
    password?: string;
    confirmPassword?: string;
    firstName?: string;
    lastName?: string;
}
export async function patchMyAccount(data: PatchMyAccountBody) {
    return client({
        method: "PATCH",
        url: "/account/",
        data: {
            ...data,
            username: data.username && data.username.length > 0 ? data.username : undefined,
        },
        headers: {
            ...getAuthHeaders(),
        },
    });
}

export enum CompanyRole {
    admin = "admin",
}
export interface Company {
    role: CompanyRole | null;
    id: string;
    name: string;
    PIN: string;
    website?: string | null;
    storeName?: string | null;
    description?: string | null;
    createdAt: Date | string;
    updatedAt: Date | string;
}
export async function getMyCompany(jwt?: string) {
    const headers = getAuthHeaders();
    if (jwt) {
        headers.Authorization = `Bearer ${jwt}`;
    }
    return await client<Company>({
        url: "/account/company",
        method: "GET",
        headers: {
            ...headers,
        },
    });
}

export async function createCompany(
    data: Omit<Company, "role" | "id" | "createdAt" | "updatedAt">
) {
    return await client({
        method: "POST",
        url: "/account/company",
        data,
        headers: {
            ...getAuthHeaders(),
        },
    });
}

export async function patchCompany(data: {
    website?: string | null;
    storeName?: string | null;
    description?: string | null;
}) {
    return await client({
        method: "PATCH",
        url: "/account/company",
        data,
        headers: {
            ...getAuthHeaders(),
        },
    });
}

export interface CompanyWithListings {
    prettyId: string;
    name: string;
    website: string | null;
    storeName: string | null;
    description: string | null;
    createdAt: string | Date;
    listings: PaginatedListingBasic;
}
export async function getCompanyByPrettyId(prettyId: string) {
    return await client<CompanyWithListings>({
        method: "GET",
        url: `/account/company/${prettyId}`,
    });
}
