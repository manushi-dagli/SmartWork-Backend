import { z } from "zod";

const EMAIL_MAX = 255;
const PHONE_COUNTRY_CODE_MAX = 3;
const PHONE_NUMBER_LEN = 10;
const PHONE_NUMBER_REGEX = /^\d{10}$/;

function emptyToNull(s: string | undefined | null): string | null {
  const t = typeof s === "string" ? s.trim() : "";
  return t === "" ? null : t;
}

/** Optional text: empty or undefined → null; no format/length check */
function optionalText() {
  return z.union([z.string(), z.undefined(), z.null()]).transform((v) => emptyToNull(v ?? undefined));
}

/** Optional email; empty or undefined → null; valid email, max 255 when present */
export function optionalEmailSchema() {
  return z
    .union([z.string(), z.undefined(), z.null()])
    .transform((v) => emptyToNull(v ?? undefined))
    .refine((v) => v === null || (v.length <= EMAIL_MAX && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)), {
      message: "Invalid email address",
    });
}

/** Optional country code: optional leading +, max 3 digits when present. Stored as digits only. */
export function optionalPhoneCountryCodeSchema() {
  return z
    .union([z.string(), z.undefined(), z.null()])
    .transform((v) => {
      const s = typeof v === "string" ? v.trim() : "";
      if (s === "") return null as string | null;
      const digits = s.replace(/^\++/, ""); // strip leading +
      return digits === "" ? null : digits;
    })
    .refine(
      (v) =>
        v === null ||
        (v.length >= 1 &&
          v.length <= PHONE_COUNTRY_CODE_MAX &&
          /^\d+$/.test(v)),
      {
        message: `Country code must be 1–${PHONE_COUNTRY_CODE_MAX} digits (optional + prefix)`,
      }
    );
}

/** Optional phone number: exactly 10 digits when present */
export function optionalPhoneNumberSchema() {
  return z
    .union([z.string(), z.undefined(), z.null()])
    .transform((v) => emptyToNull(v ?? undefined))
    .refine(
      (v) => v === null || (v.length === PHONE_NUMBER_LEN && PHONE_NUMBER_REGEX.test(v)),
      { message: `Phone number must be exactly ${PHONE_NUMBER_LEN} digits` }
    );
}

export const uuidSchema = z.string().uuid("Invalid ID format");

/** Create inquiry body — only email/phone validated; second contact phone optional */
export const createInquirySchema = z.object({
  assignmentTypeId: uuidSchema,
  contactName: optionalText().optional(),
  contactEmail: optionalEmailSchema().optional(),
  contactPhoneCountryCode: optionalPhoneCountryCodeSchema().optional(),
  contactPhoneNumber: optionalPhoneNumberSchema().optional(),
  contactPhone2CountryCode: optionalPhoneCountryCodeSchema().optional(),
  contactPhone2Number: optionalPhoneNumberSchema().optional(),
});

/** Update inquiry body (all optional) */
export const updateInquirySchema = z.object({
  assignmentTypeId: uuidSchema.optional(),
  contactName: optionalText().optional(),
  contactEmail: optionalEmailSchema().optional(),
  contactPhoneCountryCode: optionalPhoneCountryCodeSchema().optional(),
  contactPhoneNumber: optionalPhoneNumberSchema().optional(),
  contactPhone2CountryCode: optionalPhoneCountryCodeSchema().optional(),
  contactPhone2Number: optionalPhoneNumberSchema().optional(),
  assignmentTermsSnapshot: z.unknown().optional(),
  paymentTermsSnapshot: z.unknown().optional(),
  assignmentTermTemplateId: z.union([uuidSchema, z.null()]).optional(),
  paymentTermTemplateId: z.union([uuidSchema, z.null()]).optional(),
  emailedAt: z.union([z.coerce.date(), z.null()]).optional(),
  whatsappSentAt: z.union([z.coerce.date(), z.null()]).optional(),
});

/** Set inquiry documents body */
export const setInquiryDocumentsSchema = z.object({
  documentMasterIds: z.array(uuidSchema),
});

export type CreateInquiryValidated = z.infer<typeof createInquirySchema>;
export type UpdateInquiryValidated = z.infer<typeof updateInquirySchema>;
export type SetInquiryDocumentsValidated = z.infer<typeof setInquiryDocumentsSchema>;

// --- Client — only email/phone validated ---
export const createClientSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  middleName: z.union([z.string(), z.null()]).optional(),
  lastName: z.string().min(1, "Last name is required"),
  address: z.union([z.string(), z.null()]).optional(),
  phone1CountryCode: optionalPhoneCountryCodeSchema().optional(),
  phone1Number: optionalPhoneNumberSchema().optional(),
  phone2CountryCode: optionalPhoneCountryCodeSchema().optional(),
  phone2Number: optionalPhoneNumberSchema().optional(),
  email1: optionalEmailSchema().optional(),
  email2: optionalEmailSchema().optional(),
  pan: z.union([z.string(), z.null()]).optional(),
  gst: z.union([z.string(), z.null()]).optional(),
  bankDetails: z.unknown().optional(),
  dsc: z.union([z.string(), z.null()]).optional(),
  otp: z.union([z.string(), z.null()]).optional(),
  familyId: z.union([uuidSchema, z.null()]).optional(),
});

export const updateClientSchema = z.object({
  firstName: z.string().min(1).optional(),
  middleName: z.union([z.string(), z.null()]).optional(),
  lastName: z.string().min(1).optional(),
  address: z.union([z.string(), z.null()]).optional(),
  phone1CountryCode: optionalPhoneCountryCodeSchema().optional(),
  phone1Number: optionalPhoneNumberSchema().optional(),
  phone2CountryCode: optionalPhoneCountryCodeSchema().optional(),
  phone2Number: optionalPhoneNumberSchema().optional(),
  email1: optionalEmailSchema().optional(),
  email2: optionalEmailSchema().optional(),
  pan: z.union([z.string(), z.null()]).optional(),
  gst: z.union([z.string(), z.null()]).optional(),
  bankDetails: z.unknown().optional(),
  dsc: z.union([z.string(), z.null()]).optional(),
  otp: z.union([z.string(), z.null()]).optional(),
  familyId: z.union([uuidSchema, z.null()]).optional(),
});

// --- Firm — only email/phone validated ---
export const createFirmSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.union([z.string(), z.null()]).optional(),
  address: z.union([z.string(), z.null()]).optional(),
  phoneCountryCode: optionalPhoneCountryCodeSchema().optional(),
  phoneNumber: optionalPhoneNumberSchema().optional(),
  email: optionalEmailSchema().optional(),
  pan: z.union([z.string(), z.null()]).optional(),
  gst: z.union([z.string(), z.null()]).optional(),
  bankDetails: z.unknown().optional(),
  upiId: z.union([z.string(), z.null()]).optional(),
  qrCode: z.union([z.string(), z.null()]).optional(),
});

export const updateFirmSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.union([z.string(), z.null()]).optional(),
  address: z.union([z.string(), z.null()]).optional(),
  phoneCountryCode: optionalPhoneCountryCodeSchema().optional(),
  phoneNumber: optionalPhoneNumberSchema().optional(),
  email: optionalEmailSchema().optional(),
  pan: z.union([z.string(), z.null()]).optional(),
  gst: z.union([z.string(), z.null()]).optional(),
  bankDetails: z.unknown().optional(),
  upiId: z.union([z.string(), z.null()]).optional(),
  qrCode: z.union([z.string(), z.null()]).optional(),
});

// --- Employee (create/update) — only email/phone validated ---
export const createEmployeeSchema = z.object({
  username: z.union([z.string(), z.null()]).optional(),
  password: z.union([z.string(), z.null()]).optional(),
  firstName: z.string().min(1, "First name is required"),
  middleName: z.union([z.string(), z.null()]).optional(),
  lastName: z.string().min(1, "Last name is required"),
  address: z.union([z.string(), z.null()]).optional(),
  phoneCountryCode: optionalPhoneCountryCodeSchema().optional(),
  phoneNumber: optionalPhoneNumberSchema().optional(),
  email: optionalEmailSchema().optional(),
  ref: z.union([z.string(), z.null()]).optional(),
  bankDetails: z.unknown().optional(),
  pan: z.union([z.string(), z.null()]).optional(),
  aadhaarDetails: z.unknown().optional(),
  upiId: z.union([z.string(), z.null()]).optional(),
  qrCode: z.union([z.string(), z.null()]).optional(),
  joiningDate: z.union([z.string(), z.coerce.date(), z.null()]).optional(),
  leavingDate: z.union([z.string(), z.coerce.date(), z.null()]).optional(),
  roleId: z.union([uuidSchema, z.null()]).optional(),
  profilePicture: z.union([z.string(), z.null()]).optional(),
  isActive: z.boolean().optional(),
});

export const updateEmployeeSchema = z.object({
  username: z.union([z.string(), z.null()]).optional(),
  password: z.union([z.string(), z.null()]).optional(),
  firstName: z.string().min(1).optional(),
  middleName: z.union([z.string(), z.null()]).optional(),
  lastName: z.string().min(1).optional(),
  address: z.union([z.string(), z.null()]).optional(),
  phoneCountryCode: optionalPhoneCountryCodeSchema().optional(),
  phoneNumber: optionalPhoneNumberSchema().optional(),
  email: optionalEmailSchema().optional(),
  ref: z.union([z.string(), z.null()]).optional(),
  bankDetails: z.unknown().optional(),
  pan: z.union([z.string(), z.null()]).optional(),
  aadhaarDetails: z.unknown().optional(),
  upiId: z.union([z.string(), z.null()]).optional(),
  qrCode: z.union([z.string(), z.null()]).optional(),
  joiningDate: z.union([z.string(), z.coerce.date(), z.null()]).optional(),
  leavingDate: z.union([z.string(), z.coerce.date(), z.null()]).optional(),
  roleId: z.union([uuidSchema, z.null()]).optional(),
  profilePicture: z.union([z.string(), z.null()]).optional(),
  isActive: z.boolean().optional(),
});

// --- Profile (PATCH) — only email/phone validated ---
export const updateProfileSchema = z.object({
  username: z.union([z.string(), z.null()]).optional(),
  password: z.union([z.string(), z.null()]).optional(),
  firstName: z.string().optional(),
  middleName: z.union([z.string(), z.null()]).optional(),
  lastName: z.string().optional(),
  address: z.union([z.string(), z.null()]).optional(),
  phoneCountryCode: optionalPhoneCountryCodeSchema().optional(),
  phoneNumber: optionalPhoneNumberSchema().optional(),
  email: optionalEmailSchema().optional(),
  ref: z.union([z.string(), z.null()]).optional(),
  bankDetails: z.unknown().optional(),
  pan: z.union([z.string(), z.null()]).optional(),
  aadhaarDetails: z.unknown().optional(),
  upiId: z.union([z.string(), z.null()]).optional(),
  qrCode: z.union([z.string(), z.null()]).optional(),
  profilePicture: z.union([z.string(), z.null()]).optional(),
});

// --- Super admin create — only email validated ---
const requiredEmail = z.string().min(1, "Email is required").email("Invalid email address").max(EMAIL_MAX);
export const createSuperAdminSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: requiredEmail,
  password: z.string().min(1, "Password is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  middleName: z.union([z.string(), z.null()]).optional(),
});
