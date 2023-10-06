import { z } from "zod";

// TODO: Hopefully one day the frontend and the backend can share the same validator package so that we don't have to copy paste the code
enum EnergyClass {
    Ap = "Ap",
    A = "A",
    B = "B",
    C = "C",
    D = "D",
    E = "E",
    F = "F",
    G = "G",
}

enum FurnitureState {
    furnished = "furnished",
    partiallyFurnished = "partiallyFurnished",
    unfurnished = "unfurnished",
}

enum PropertyType {
    apartment = "apartment",
    house = "house",
    land = "land",
}

const nullableString = (max?: number) =>
    z
        .string()
        .max(max || 128)
        .nullish()
        .transform((x) => (x && x.length > 0 ? x : null));

const nullableBool = () =>
    z
        .boolean()
        .nullish()
        .transform((x) => (typeof x === "boolean" ? x : null));

function preprocessArr(val: any) {
    if (!val) {
        return;
    }
    if (typeof val === "string") {
        return val.split(",");
    }
    return val;
}
const stringArr = (max: number) => z.preprocess(preprocessArr, z.array(z.string()).max(max));

const latitude = () => z.number().min(-90).max(90);
const longitude = () => z.number().min(-180).max(180);

const nullablePositiveInt = (max: number) =>
    z
        .optional(z.coerce.number().int().positive().max(max))
        .nullish()
        .transform((val) => (val ? val : null));
const nullablePositiveFloat = (max: number) =>
    z.optional(z.coerce.number().positive().max(max)).transform((val) => (val ? val : null));

const surfaceArea = () => z.coerce.number().min(1).max(999_999);
const price = () =>
    z.preprocess((val) => {
        if (typeof val === "string") {
            return val.replace(",", "."); // Frontend might send a float with ',' instead of '.' depending on the locale
        }
        return val;
    }, z.coerce.number().min(1).max(999_999_999_999));

const patchableApartment = () =>
    z.object({
        surfaceArea: surfaceArea(),
        bedroomCount: nullablePositiveInt(99),
        bathroomCount: nullablePositiveInt(99),
        parkingSpaceCount: nullablePositiveInt(99),
        floor: nullablePositiveInt(999),
        totalFloors: nullablePositiveInt(999),
        buildingFloors: nullablePositiveInt(999),
        buildYear: nullablePositiveInt(9999),
        renovationYear: nullablePositiveInt(9999),
        energyLabel: z
            .nativeEnum(EnergyClass)
            .optional()
            .nullish()
            .transform((val) => (val ? val : null)),
        customId: nullableString(),

        furnitureState: z
            .nativeEnum(FurnitureState)
            .optional()
            .nullish()
            .transform((val) => (val ? val : null)),
        needsRenovation: nullableBool().transform((val) => !!val),
        elevatorAccess: nullableBool(),
    });
const patchableHouse = () =>
    z.object({
        surfaceArea: surfaceArea(),
        bedroomCount: nullablePositiveInt(99),
        bathroomCount: nullablePositiveInt(99),
        parkingSpaceCount: nullablePositiveInt(99),
        totalFloors: nullablePositiveInt(999),
        buildYear: nullablePositiveInt(9999),
        renovationYear: nullablePositiveInt(9999),
        energyLabel: z
            .nativeEnum(EnergyClass)
            .optional()
            .nullish()
            .transform((val) => (val ? val : null)),
        customId: nullableString(),

        furnitureState: z
            .nativeEnum(FurnitureState)
            .optional()
            .nullish()
            .transform((val) => (val ? val : null)),
        needsRenovation: nullableBool().transform((val) => !!val),
    });
const patchableLand = () =>
    z.object({
        surfaceArea: surfaceArea(),
        customId: nullableString(),
    });
const patchableListingData = () =>
    z.object({
        price: price(),
        description: z.string().max(3440),
        // These may be either IDs or usernames or emails
        contacts: stringArr(99).optional(),
        manualAccountContacts: stringArr(99).optional(),
    });

const ListingData = z.intersection(
    patchableListingData(),
    z.object({
        title: z.string().min(1).max(144),
    })
);
const CreateListingData = z
    .object({
        apartment: z.optional(
            z.intersection(
                patchableApartment(),
                z.object({
                    latitude: latitude(),
                    longitude: longitude(),
                    media: stringArr(99).optional(),
                })
            )
        ),
        house: z.optional(
            z.intersection(
                patchableHouse(),
                z.object({
                    latitude: latitude(),
                    longitude: longitude(),
                    media: stringArr(99).optional(),
                })
            )
        ),
        land: z.optional(
            z.intersection(
                patchableLand(),
                z.object({
                    latitude: latitude(),
                    longitude: longitude(),
                    media: stringArr(99).optional(),
                })
            )
        ),
        existingProperty: z.optional(
            z.object({
                id: z.string(),
                propertyType: z.nativeEnum(PropertyType),
            })
        ),
        sale: z.optional(
            z.intersection(
                ListingData,
                z.object({
                    saleCommissionPercent: nullablePositiveFloat(100),
                })
            )
        ),
        shortTermRent: z.optional(ListingData),
        longTermRent: z.optional(ListingData),
    })
    .superRefine(({ sale, shortTermRent, longTermRent }, ctx) => {
        if (!sale && !shortTermRent && !longTermRent) {
            ctx.addIssue({
                code: "custom",
                message: "missing_offering_type",
                path: ["sale", "shortTermRent", "longTermRent"],
            });
        }
    })
    .superRefine(({ apartment, house, land }, ctx) => {
        let definedPropertiesCount = 0;
        if (apartment) {
            definedPropertiesCount++;
        }
        if (house) {
            definedPropertiesCount++;
        }
        if (land) {
            definedPropertiesCount++;
        }
        if (definedPropertiesCount !== 1) {
            // Only 1 property may ever be defined when creating a listing
            ctx.addIssue({
                code: "custom",
                message: "invalid_property_definition",
                path: ["apartment", "house", "land"],
            });
        }
    });

export default function (obj: any) {
    return CreateListingData.parse(obj);
}

export type CreateListingValidatedData = z.infer<typeof CreateListingData>;
