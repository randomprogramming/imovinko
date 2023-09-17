import axios from "axios";
import { deleteJWTCookie, getJWTCookie, getMapboxSessionCookie } from "./cookie";
import { HRRegionShortCode } from "@/components/RegionDropdown";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
export const GOOGLE_REGISTER_URL = baseURL + "/auth/google";

export enum TravelingMethods {
    traffic = "mapbox/driving-traffic",
    driving = "mapbox/driving",
    walking = "mapbox/walking",
    cycling = "mapbox/cycling",
}

export enum EnergyClass {
    Ap = "Ap",
    A = "A",
    B = "B",
    C = "C",
    D = "D",
    E = "E",
    F = "F",
    G = "G",
}

export const EnergyClassColors = {
    [EnergyClass.Ap]: "#00a652",
    [EnergyClass.A]: "#51b747",
    [EnergyClass.B]: "#bdd62e",
    [EnergyClass.C]: "#fef200",
    [EnergyClass.D]: "#fdb814",
    [EnergyClass.E]: "#f3701e",
    [EnergyClass.F]: "#ed1b24",
    [EnergyClass.G]: "#B91C1C",
};

// We can't use this in axios.create because it sometimes doesn't register the cookie changes after login, so you get 401 responses until you refresh the page
function getAuthHeaders() {
    return {
        Authorization: `Bearer ${getJWTCookie()}`,
    };
}

const client = axios.create({
    baseURL,
});

client.interceptors.response.use(
    function (response) {
        return response;
    },
    function (error) {
        if (error.response.status === 401) {
            deleteJWTCookie();
        }
        return Promise.reject(error);
    }
);

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

export interface ListingData {
    price?: number | string;
    description?: string | null;
    contactIds?: string[];
    manualAccountContactIds?: string[];
    title?: string;
}
export interface CreateListingData {
    sale?: ListingData;
    shortTermRent?: ListingData;
    longTermRent?: ListingData;

    apartment?: {
        latitude: number;
        longitude: number;
        surfaceArea: number | string;

        bedroomCount?: string | number | null;
        bathroomCount?: string | number | null;
        parkingSpaceCount?: string | number | null;
        floor?: string | number | null;
        totalFloors?: string | number | null;
        buildingFloors?: string | number | null;
        buildYear?: string | number | null;
        renovationYear?: string | number | null;
        energyLabel?: EnergyClass | null;
        customId?: string | null;
    };

    house?: {
        latitude: number;
        longitude: number;
        surfaceArea: number | string;

        bedroomCount?: string | number | null;
        bathroomCount?: string | number | null;
        parkingSpaceCount?: string | number | null;
        totalFloors?: string | number | null;
        buildYear?: string | number | null;
        renovationYear?: string | number | null;
        energyLabel?: EnergyClass | null;
        customId?: string | null;
    };

    land?: {
        latitude: number;
        longitude: number;
        surfaceArea: number | string;
        customId?: string | null;
    };
    existingProperty?: {
        id: string;
        propertyType: PropertyType;
    };
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
    media: Omit<Media, "id">[];
}
export async function patchPropertyMedia(data: PatchPropertyMediaData) {
    return client({
        method: "PATCH",
        url: "/listing/media/",
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
    media: Media[];
    surfaceArea: number;
    bedroomCount?: number | null | undefined;
    bathroomCount?: number | null | undefined;
    parkingSpaceCount?: number | null | undefined;
    customId?: string | null;
}
export interface ListingBasic {
    id: string;
    prettyId: string;
    title: string;
    price: number;
    pricePerMeterSquared: number | null;
    description: string;
    apartment: BasicProperty | null;
    house: BasicProperty | null;
    land: BasicProperty | null;
    offeringType: OfferingType;
    createdAt: string | Date;
    saved: boolean;
    deactivated: Date | string | null;
    saleDate: Date | string | null;
    salePrice: number | null;
}
type PaginatedData<T> = {
    data: T[];
    page: number;
    totalPages: number;
    pageSize: number;
    count: number;
};

export type PaginatedListingBasic = PaginatedData<ListingBasic>;

export async function findListingsByBoundingBox(data: {
    boundingBox?: BoundingBox;
    propertyType?: PropertyType[];
    offeringType?: OfferingType[];
    priceFrom?: number | string;
    priceTo?: number | string;
    pricePerSquareMeterFrom?: number | string;
    pricePerSquareMeterTo?: number | string;
    pageSize?: number;
    exclude?: string[];
    jwt?: string;
}) {
    const { ...bounding } = data.boundingBox;
    const jwtC = data.jwt;
    delete data.boundingBox;
    delete data.jwt;

    const headers = getAuthHeaders();
    if (jwtC) {
        headers.Authorization = `Bearer ${jwtC}`;
    }

    return (
        await client<PaginatedListingBasic>({
            url: "/listing/",
            method: "GET",
            params: {
                ...data,
                ...bounding,
                propertyType: data.propertyType ? data.propertyType.join(",") : undefined,
                offeringType: data.offeringType ? data.offeringType.join(",") : undefined,
                exclude: data.exclude ? data.exclude.join(",") : undefined,
                pageSize: data.pageSize || 20,
            },
            headers,
        })
    ).data;
}
export async function findListingsByQuery(data: {
    propertyType: PropertyType[];
    offeringType: OfferingType[];
    page?: number | string;
    priceFrom?: number | string;
    priceTo?: number | string;
    pricePerSquareMeterFrom?: number | string;
    pricePerSquareMeterTo?: number | string;
    sortBy?: string;
    sortDirection?: "asc" | "desc";
    pageSize?: number;
    region?: HRRegionShortCode[];
    jwt?: string;
}) {
    if (data.region && data.region.length === 0) {
        data.region = undefined;
    }
    const jwtC = data.jwt;
    delete data.jwt;
    const headers = getAuthHeaders();
    if (jwtC) {
        headers.Authorization = `Bearer ${jwtC}`;
    }
    return await client<PaginatedListingBasic>({
        url: "/listing/",
        method: "GET",
        params: {
            ...data,
            propertyType: data.propertyType.join(","),
            offeringType: data.offeringType.join(","),
            region: data.region?.join(","),
        },
        headers,
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
    id: string;
    url: string;
    order?: string;
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
    media: Media[];
    bedroomCount?: number | null | undefined;
    bathroomCount?: number | null | undefined;
    parkingSpaceCount?: number | null | undefined;
    floor?: number | null;
    totalFloors?: number | null;
    buildingFloors?: number | null;
    buildYear?: number | null;
    renovationYear?: number | null;
    energyLabel?: EnergyClass | null;
    customId?: string | null;
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
    media: Media[];
    bedroomCount?: number | null | undefined;
    bathroomCount?: number | null | undefined;
    parkingSpaceCount?: number | null | undefined;
    totalFloors?: number | null;
    buildYear?: number | null;
    renovationYear?: number | null;
    energyLabel?: EnergyClass | null;
    customId?: string | null;
}
export interface Land extends PropertyLocation {
    id: string;
    latitude: number;
    longitude: number;
    surfaceArea: number;
    ownerId: string;
    createdAt: string | Date;
    updatedAt: string | Date;
    owner: Omit<FullAccount, "email">;
    media: Media[];
    customId?: string | null;
}
export interface PriceChange {
    oldPrice: number;
    createdAt: string | Date;
}
export interface Listing {
    id: string;
    title: string;
    description: string;
    deactivated: string | Date | null;
    offeringType: OfferingType;
    price: number;
    pricePerMeterSquared: number | null;
    houseId: string | null;
    apartmentId: string | null;
    landId: string | null;
    createdAt: string | Date;
    updatedAt: string | Date;
    prettyId: string;
    apartment:
        | (Apartment & {
              owner: FullAccountSingleCompany;
              listings: ListingBasic[];
          })
        | null;
    house:
        | (House & {
              owner: FullAccountSingleCompany;
              listings: ListingBasic[];
          })
        | null;
    land:
        | (Land & {
              owner: FullAccountSingleCompany;
              listings: ListingBasic[];
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
        id: string;
    }[];
    manualAccountContacts: {
        username: null;
        email: string | null;
        firstName: string | null;
        lastName: string | null;
        phone: string | null;
        avatarUrl: string | null;
        id: string;
    }[];
    priceChanges: PriceChange[];
    saved: boolean;
    saleDate: Date | string | null;
    salePrice: number | null;
}
export async function findListing(id: string, jwt?: string) {
    const headers = getAuthHeaders();
    if (jwt) {
        headers.Authorization = `Bearer ${jwt}`;
    }

    return await client<Listing>({
        url: `/listing/pretty-id/${id}`,
        method: "GET",
        headers,
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
    phone?: string | null;
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
export async function getCompanyByPrettyId(prettyId: string, page: number, jwt?: string) {
    const headers = getAuthHeaders();
    if (jwt) {
        headers.Authorization = `Bearer ${jwt}`;
    }
    return await client<CompanyWithListings>({
        method: "GET",
        url: `/company/${prettyId}`,
        params: {
            page,
        },
        headers,
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

export interface Conversation {
    id: string;
    hasUnread: boolean;
    title: string;
    createdAt: Date | string;
    updatedAt: Date | string;
    lastMessage: {
        createdAt: Date | string;
        content: string;
        sender: Account;
    } | null;
    participants: (Account & { avatarUrl: string | null })[];
    listing: ListingBasic | null;
}

export interface Notifications {
    invitations: CompanyInvitation[];
    conversations: Conversation[];
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
    return await client<Notifications>({
        method: "GET",
        url: "/account/notifications/",
        headers: {
            ...getAuthHeaders(),
        },
    });
}

export async function getConversations(jwt?: string) {
    const headers = getAuthHeaders();
    if (jwt) {
        headers.Authorization = `Bearer ${jwt}`;
    }

    return await client<Conversation[]>({
        method: "GET",
        url: "/conversation/",
        headers,
    });
}

export interface Message {
    id: string;
    content: string;
    senderId: string;
}
export async function getConversationMessages(id: string, page?: number) {
    return await client<PaginatedData<Message>>({
        method: "GET",
        url: "/conversation/messages/",
        headers: {
            ...getAuthHeaders(),
        },
        params: {
            id,
            page,
            pageSize: 24,
        },
    });
}

interface SendMessageResponse {
    conversationId: string;
}
export async function sendMessage(data: {
    conversationId?: string;
    content: string;
    listingId?: string | null;
    otherParticipantId?: string | null;
}) {
    return await client<SendMessageResponse>({
        method: "POST",
        url: "/conversation/message/",
        headers: {
            ...getAuthHeaders(),
        },
        data,
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
export async function getAccountByUsername(username: string, listingsPage?: number, jwt?: string) {
    const headers = getAuthHeaders();
    if (jwt) {
        headers.Authorization = `Bearer ${jwt}`;
    }
    return await client<FullPublicAccount>({
        method: "GET",
        url: `/account/username/${username}`,
        params: {
            page: listingsPage,
        },
        headers,
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

interface PatchListingData {
    sale?: {
        title?: string;
        price?: number | string;
        description?: string;
        contactIds: string[];
        manualAccountContactIds: string[];
    };
    shortTermRent?: {
        title?: string;
        price?: number | string;
        description?: string;
        contactIds: string[];
        manualAccountContactIds: string[];
    };
    longTermRent?: {
        title?: string;
        price?: number | string;
        description?: string;
        contactIds: string[];
        manualAccountContactIds: string[];
    };
    apartment?: {
        surfaceArea: number;
        bedroomCount?: string | number | null;
        bathroomCount?: string | number | null;
        parkingSpaceCount?: string | number | null;
        floor?: string | number | null;
        totalFloors?: string | number | null;
        buildingFloors?: string | number | null;
        buildYear?: string | number | null;
        renovationYear?: string | number | null;
        energyLabel?: EnergyClass | null;
        customId?: string | null;
    };
    house?: {
        surfaceArea: number;
        bedroomCount?: string | number | null;
        bathroomCount?: string | number | null;
        parkingSpaceCount?: string | number | null;
        totalFloors?: string | number | null;
        buildYear?: string | number | null;
        renovationYear?: string | number | null;
        energyLabel?: EnergyClass | null;
        customId?: string | null;
    };
    land?: {
        surfaceArea: number;
        customId?: string | null;
    };
}
export async function patchListing(prettyId: string, data: PatchListingData) {
    return await client({
        url: "/listing/pretty-id/" + prettyId,
        method: "PATCH",
        data,
        headers: {
            ...getAuthHeaders(),
        },
    });
}

export async function patchListingActivated(prettyId: string, activated: boolean) {
    return await client({
        url: "/listing/activated/pretty-id/" + prettyId,
        method: "PATCH",
        data: {
            activated,
        },
        headers: {
            ...getAuthHeaders(),
        },
    });
}

export async function patchListingSaleData(
    prettyId: string,
    salePrice: undefined | number | string
) {
    return await client({
        url: "/listing/sold/pretty-id/" + prettyId,
        method: "PATCH",
        data: {
            salePrice,
        },
        headers: {
            ...getAuthHeaders(),
        },
    });
}

export async function deleteMedia(id: string) {
    return await client({
        url: "/listing/media/id/" + id,
        method: "DELETE",
        headers: {
            ...getAuthHeaders(),
        },
    });
}

export interface BasicApartment {
    id: string;
    customId: string | null;
    country: string | null;
    region: string | null;
    city: string | null;
    postcode: string | null;
    street: string | null;
    address: string | null;
    media: Media[];
    createdAt: string | Date;
    offeringTypes: OfferingType[];
}
export interface BasicHouse {
    id: string;
    customId: string | null;
    country: string | null;
    region: string | null;
    city: string | null;
    postcode: string | null;
    street: string | null;
    address: string | null;
    media: Media[];
    createdAt: string | Date;
    offeringTypes: OfferingType[];
}
export interface BasicLand {
    id: string;
    customId: string | null;
    country: string | null;
    region: string | null;
    city: string | null;
    postcode: string | null;
    street: string | null;
    address: string | null;
    media: Media[];
    createdAt: string | Date;
    offeringTypes: OfferingType[];
}
export async function getMyProperties(type: PropertyType.apartment): Promise<BasicApartment[]>;
export async function getMyProperties(type: PropertyType.house): Promise<BasicHouse[]>;
export async function getMyProperties(type: PropertyType.land): Promise<BasicLand[]>;
export async function getMyProperties(
    type: PropertyType
): Promise<BasicApartment[] | BasicHouse[] | BasicLand[]> {
    const resp = await client({
        method: "GET",
        url: "/property/mine/" + type,
        headers: {
            ...getAuthHeaders(),
        },
    });
    return resp.data;
}

export async function getSavedListings(page?: number, jwt?: string) {
    const headers = getAuthHeaders();
    if (jwt) {
        headers.Authorization = `Bearer ${jwt}`;
    }
    return await client({
        method: "GET",
        url: "/listing/saved",
        headers,
        params: {
            page,
        },
    });
}
export async function saveListing(listingId: string) {
    return await client({
        method: "POST",
        url: "/listing/save",
        headers: {
            ...getAuthHeaders(),
        },
        data: {
            id: listingId,
        },
    });
}
export async function removeSavedListing(listingId: string) {
    return await client({
        method: "POST",
        url: "/listing/save/remove",
        headers: {
            ...getAuthHeaders(),
        },
        data: {
            id: listingId,
        },
    });
}
