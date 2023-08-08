import axios from "axios";
import { getJWTCookie, getMapboxSessionCookie } from "./cookie";
import { HRRegionShortCode } from "@/components/RegionDropdown";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
export const GOOGLE_REGISTER_URL = baseURL + "/auth/google";

export enum TravelingMethods {
    traffic = "mapbox/driving-traffic",
    driving = "mapbox/driving",
    walking = "mapbox/walking",
    cycling = "mapbox/cycling",
}

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
    saleContacts?: string[];
    saleManualAccountContacts?: string[];

    isForShortTermRent?: boolean;
    shortTermListingTitle?: string;
    shortTermListingPrice?: number;
    shortTermListingDescription?: string;
    shortTermContacts?: string[];
    shortTermManualAccountContacts?: string[];

    isForLongTermRent?: boolean;
    longTermListingTitle?: string;
    longTermListingPrice?: number;
    longTermListingDescription?: string;
    longTermContacts?: string[];
    longTermManualAccountContacts?: string[];

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
    const createListingData: any = {};
    if (data.isForSale) {
        createListingData.sale = {
            title: data.saleListingTitle,
            price: data.saleListingPrice,
            description: data.saleListingDescription,
            contactIds: data.saleContacts,
            manualAccountContactIds: data.saleManualAccountContacts,
        };
    }
    if (data.isForShortTermRent) {
        createListingData.shortTermRent = {
            title: data.shortTermListingTitle,
            price: data.shortTermListingPrice,
            description: data.shortTermListingDescription,
            contactIds: data.shortTermContacts,
            manualAccountContactIds: data.shortTermManualAccountContacts,
        };
    }
    if (data.isForLongTermRent) {
        createListingData.longTermRent = {
            title: data.longTermListingTitle,
            price: data.longTermListingPrice,
            description: data.longTermListingDescription,
            contactIds: data.longTermContacts,
            manualAccountContactIds: data.longTermManualAccountContacts,
        };
    }
    if (data.listingFor === ListingFor.apartment) {
        createListingData.apartment = {
            latitude: data.lat,
            longitude: data.lon,
            surfaceArea: data.area,
            bedroomCount: data.bedroomCount,
            bathroomCount: data.bathroomCount,
            parkingSpaceCount: data.parkingSpaceCount,
        };
    }

    return await client<CreateListingResponse>({
        url: "/listing/submit",
        method: "POST",
        data: {
            ...createListingData,
        },
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
export async function getCloudinaryAuth(isAvatar?: boolean) {
    return await client<CloudinaryAuthData>({
        url: "/auth/cloudinary",
        method: "POST",
        data: {
            uploadType: isAvatar ? "avatar" : "",
        },
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
            formData.append("format", "webp");
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

export async function uploadAvatar(image: File): Promise<string | null> {
    let imageUrl: string | null = null;
    const aut = await getCloudinaryAuth(true);

    const url = "https://api.cloudinary.com/v1_1/" + aut.data.cloudname + "/auto/upload";
    const formData = new FormData();
    formData.append("file", image);
    formData.append("api_key", aut.data.api_key);
    formData.append("timestamp", aut.data.timestamp + "");
    formData.append("signature", aut.data.signature);
    formData.append("folder", "avatar");
    formData.append("format", "webp");
    formData.append("eager", "w_500,h_500,c_fit");
    const resp = await axios.post(url, formData);
    if (Array.isArray(resp.data?.eager) && resp.data.eager.length > 0) {
        const eager = resp.data.eager[0];
        if (typeof eager.url === "string" && eager.url.length > 0) {
            imageUrl = eager.url;
        }
    }

    return imageUrl;
}

export async function patchAccountAvatarUrl(avatarUrl?: string | null) {
    return client({
        method: "PATCH",
        url: "/account/media",
        data: {
            avatarUrl,
        },
        headers: {
            ...getAuthHeaders(),
        },
    });
}

export async function patchCompanyAvatarUrl(avatarUrl?: string | null) {
    return client({
        method: "PATCH",
        url: "/company/media",
        data: {
            avatarUrl,
        },
        headers: {
            ...getAuthHeaders(),
        },
    });
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
    offeringType: OfferingType[],
    priceFrom?: number | string,
    priceTo?: number | string
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
                priceFrom: priceFrom || undefined,
                priceTo: priceTo || undefined,
            },
        })
    ).data;
}
export async function findListingsByQuery(data: {
    propertyType: PropertyType[];
    offeringType: OfferingType[];
    page?: number | string;
    priceFrom?: number | string;
    priceTo?: number | string;
    sortBy?: string;
    sortDirection?: "asc" | "desc";
    pageSize?: number;
    region?: HRRegionShortCode[];
}) {
    if (data.region && data.region.length === 0) {
        data.region = undefined;
    }
    return await client<PaginatedListingBasic>({
        url: "/listing/",
        method: "GET",
        params: {
            propertyType: data.propertyType.join(","),
            offeringType: data.offeringType.join(","),
            page: data.page,
            priceFrom: data.priceFrom,
            priceTo: data.priceTo,
            sortBy: data.sortBy,
            sortDirection: data.sortDirection,
            pageSize: data.pageSize,
            region: data.region?.join(","),
        },
    });
}
export interface BasicCompany {
    prettyId: string;
    name: string;
    storeName?: string | null;
    avatarUrl?: string | null;
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
    avatarUrl: string | null;
    role: string | null;
    companies: {
        company: BasicCompany;
    }[];
}
export interface FullAccountSingleCompany extends Account {
    createdAt: string | Date;
    avatarUrl: string | null;
    company: BasicCompany & {
        createdAt: Date | string;
    };
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
    apartment:
        | (Apartment & {
              owner: FullAccountSingleCompany;
          })
        | null;
    house:
        | (House & {
              owner: FullAccountSingleCompany;
          })
        | null;
    land:
        | (Land & {
              owner: FullAccountSingleCompany;
          })
        | null;
    viewCount: number;
    contacts: {
        username: string | null;
        email: string;
        firstName: string | null;
        lastName: string | null;
        phone: string | null;
        avatarUrl: string | null;
    }[];
    manualAccountContacts: {
        username: null;
        email: string | null;
        firstName: string | null;
        lastName: string | null;
        phone: string | null;
        avatarUrl: string | null;
    }[];
}
export async function findListing(id: string) {
    return await client<Listing>({
        url: `/listing/pretty-id/${id}`,
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
    phone: string | null;
    avatarUrl: string | null;
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
    phone?: string;
}
interface PatchMyAccountResponse {
    accessToken?: string;
}
export async function patchMyAccount(data: PatchMyAccountBody) {
    return client<PatchMyAccountResponse>({
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
    avatarUrl: string | null;
    accounts: FullAccount[];
    manualAccounts: ManualAccount[];
}
export async function getMyCompany(jwt?: string) {
    const headers = getAuthHeaders();
    if (jwt) {
        headers.Authorization = `Bearer ${jwt}`;
    }
    return await client<Company>({
        url: "/company",
        method: "GET",
        headers: {
            ...headers,
        },
    });
}

export async function createCompany(
    data: Omit<
        Company,
        "avatarUrl" | "role" | "id" | "createdAt" | "updatedAt" | "accounts" | "manualAccounts"
    >
) {
    return await client({
        method: "POST",
        url: "/company",
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
        url: "/company",
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
    avatarUrl: string | null;
    listings: PaginatedListingBasic;
}
export async function getCompanyByPrettyId(prettyId: string, page: number) {
    return await client<CompanyWithListings>({
        method: "GET",
        url: `/company/${prettyId}`,
        params: {
            page,
        },
    });
}

export interface ManulAccountEntryData {
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    email: string | null;
}
export interface ManualAccount extends ManulAccountEntryData {
    id: string;
    avatarUrl: string | null;
}
export async function createManualAccount(data: ManulAccountEntryData) {
    return await client({
        method: "POST",
        url: "/company/account/manual",
        data,
        headers: {
            ...getAuthHeaders(),
        },
    });
}

export interface CompanyInvitation {
    id: string;
    company: {
        name: string;
        prettyId: string;
    };
    createdAt: string | Date;
}
export async function getNotifications() {
    return await client<CompanyInvitation[]>({
        method: "GET",
        url: "/account/notifications/",
        headers: {
            ...getAuthHeaders(),
        },
    });
}

export async function inviteMember(handle: string) {
    return await client({
        method: "POST",
        url: "/company/account/invite",
        data: {
            handle,
        },
        headers: {
            ...getAuthHeaders(),
        },
    });
}

export async function answerInvitation(id: string, accepted: boolean) {
    return await client({
        method: "POST",
        url: "/company/account/invite/answer",
        data: {
            id,
            accepted,
        },
        headers: {
            ...getAuthHeaders(),
        },
    });
}

export interface PropertyCount {
    apartment: number;
    house: number;
    land: number;
}
export async function getPropertyCount() {
    return await client<PropertyCount>({
        method: "GET",
        url: "/stats/property-count",
    });
}

export interface FullPublicAccount {
    username: string | null;
    firstName: string | null;
    lastName: string | null;
    company: BasicCompany | null;
    listings: PaginatedListingBasic;
    createdAt: string | Date;
    avatarUrl: string | null;
}
export async function getAccountByUsername(username: string, listingsPage?: number) {
    return await client<FullPublicAccount>({
        method: "GET",
        url: `/account/username/${username}`,
        params: {
            page: listingsPage,
        },
    });
}

export async function getMyListings(jwt?: string, page?: number) {
    const headers = getAuthHeaders();
    if (jwt) {
        headers.Authorization = `Bearer ${jwt}`;
    }

    return await client<PaginatedListingBasic>({
        url: "/listing/mine/",
        method: "GET",
        params: {
            page,
        },
        headers,
    });
}

export async function suggestLocations(q: string, language?: string, proximity?: Coordinates) {
    return await client({
        method: "GET",
        url: `https://api.mapbox.com/search/searchbox/v1/suggest`,
        params: {
            q,
            access_token: process.env["NEXT_PUBLIC_MAPBOX_API_KEY"],
            session_token: getMapboxSessionCookie(),
            country: "HR",
            limit: 4,
            proximity: `${proximity?.lon},${proximity?.lat}`,
            origin: `${proximity?.lon},${proximity?.lat}`,
            language,
        },
    });
}

export async function retrieveSuggestedFeature(id: string) {
    return await client({
        method: "GET",
        url: `https://api.mapbox.com/search/searchbox/v1/retrieve/${id}`,
        params: {
            access_token: process.env["NEXT_PUBLIC_MAPBOX_API_KEY"],
            session_token: getMapboxSessionCookie(),
        },
    });
}

export async function getDirectionsForCoordinates(
    c1: Coordinates,
    c2: Coordinates,
    method: TravelingMethods
) {
    return await axios({
        method: "GET",
        url: `https://api.mapbox.com/directions/v5/${method}/${c1.lon},${c1.lat};${c2.lon},${c2.lat}`,
        params: {
            access_token: process.env["NEXT_PUBLIC_MAPBOX_API_KEY"],
            geometries: "geojson",
            overview: "full",
        },
    });
}

interface ContactMessageData {
    email: string;
    message: string;
}
export async function createContactMessage(data: ContactMessageData) {
    return await client({
        url: "/contact/",
        method: "POST",
        data,
    });
}
